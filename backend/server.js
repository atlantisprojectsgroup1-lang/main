import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { COMPANY, PROJECTS, FAQS, BLOG, UPDATES, TESTIMONIALS, TEAM, SETTINGS, EXTRA_SPECS } from "./seed_data.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.set("trust proxy", true);
const api = express.Router();

const client = new MongoClient(process.env.MONGO_URL || process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
let db;
let dbDown = false;

// In-memory fallback so the public site keeps working if the DB is unreachable (e.g. Atlas network rules on Vercel).
const MEM = {
  projects: PROJECTS.map((p) => ({ ...p })),
  company: { ...COMPANY },
  settings: { ...SETTINGS },
  faqs: FAQS.map((f) => ({ ...f })),
  blog: [...BLOG.map((b) => ({ ...b })), ...UPDATES.map((u) => ({ ...u }))],
  testimonials: TESTIMONIALS.map((t) => ({ ...t })),
  team: TEAM.map((t) => ({ ...t })),
};

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = "HS256";
const LEAD_STAGES = ["NEW", "CONTACTED", "SITE_VISIT_SCHEDULED", "SITE_VISIT_DONE", "NEGOTIATION", "BOOKED", "LOST"];

const EMERGENT_LLM_KEY = process.env.EMERGENT_LLM_KEY || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const LLM_API_KEY = OPENAI_API_KEY || EMERGENT_LLM_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || (OPENAI_API_KEY ? undefined : "https://integrations.emergentagent.com/llm");
const LLM_MODEL = process.env.LLM_MODEL || "gpt-5.4";

let _llmClient = null;
async function getLlmClient() {
  if (!_llmClient) {
    const { default: OpenAI } = await import("openai");
    _llmClient = new OpenAI({ apiKey: LLM_API_KEY, ...(LLM_BASE_URL ? { baseURL: LLM_BASE_URL } : {}) });
  }
  return _llmClient;
}

const nowIso = () => new Date().toISOString();
const newId = () => crypto.randomUUID();
const hashPassword = (pw) => bcrypt.hashSync(pw, 10);
const verifyPassword = (plain, hashed) => {
  try { return bcrypt.compareSync(plain, hashed); } catch { return false; }
};
const slugify = (s) => (s || "project").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const stripId = (doc) => { if (doc) delete doc._id; return doc; };

const _rateBuckets = new Map();
function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const hits = (_rateBuckets.get(key) || []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) return true;
  hits.push(now);
  _rateBuckets.set(key, hits);
  return false;
}

// ---------------- CORS ----------------

const configuredOrigins = (process.env.CORS_ORIGINS || "").split(",").map((o) => o.trim()).filter((o) => o && o !== "*");
const ALLOWED_ORIGINS = configuredOrigins.length ? configuredOrigins : [
  process.env.FRONTEND_URL,
  "https://atlantisprojectsgroup.com",
  "https://www.atlantisprojectsgroup.com",
  process.env.REACT_APP_BACKEND_URL,
  "http://localhost:3000",
].filter(Boolean);

app.use((req, res, next) => {
  const origin = req.headers.origin || "";
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", req.headers["access-control-request-headers"] || "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: "25mb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (process.env.VERCEL) res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  next();
});

// ---------------- Auth ----------------

const createAccessToken = (user) =>
  jwt.sign({ sub: user.id, email: user.email, role: user.role, type: "access" }, JWT_SECRET, { algorithm: JWT_ALGORITHM, expiresIn: "24h" });

async function requireAuth(req, res, next) {
  if (dbDown) return res.status(503).json({ detail: "Service starting, retry shortly." });
  let token = req.cookies?.access_token;
  if (!token) {
    const auth = req.headers.authorization || "";
    if (auth.startsWith("Bearer ")) token = auth.slice(7);
  }
  if (!token) return res.status(401).json({ detail: "Not authenticated" });
  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
  } catch (e) {
    return res.status(401).json({ detail: e.name === "TokenExpiredError" ? "Token expired" : "Invalid token" });
  }
  const user = await db.collection("users").findOne({ id: payload.sub }, { projection: { _id: 0, password_hash: 0 } });
  if (!user) return res.status(401).json({ detail: "User not found" });
  req.user = user;
  next();
}

api.post("/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const identifier = `${req.ip}:${email}`;
  const attempt = await db.collection("login_attempts").findOne({ identifier });
  if (attempt && (attempt.count || 0) >= 5) {
    const lockedSince = new Date(attempt.updated_at);
    if (Date.now() - lockedSince.getTime() < 15 * 60 * 1000) {
      return res.status(429).json({ detail: "Too many failed attempts. Try again in 15 minutes." });
    }
    await db.collection("login_attempts").deleteOne({ identifier });
  }
  const user = await db.collection("users").findOne({ email });
  if (!user || !verifyPassword(String(req.body.password || ""), user.password_hash)) {
    await db.collection("login_attempts").updateOne(
      { identifier },
      { $inc: { count: 1 }, $set: { updated_at: nowIso() } },
      { upsert: true }
    );
    return res.status(401).json({ detail: "Invalid email or password" });
  }
  await db.collection("login_attempts").deleteOne({ identifier });
  const token = createAccessToken(user);
  res.cookie("access_token", token, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 86400000, path: "/" });
  res.json({ id: user.id, email: user.email, name: user.name || "", role: user.role, token });
});

api.post("/auth/logout", (req, res) => {
  res.clearCookie("access_token", { path: "/" });
  res.json({ ok: true });
});

api.get("/auth/me", requireAuth, (req, res) => res.json(req.user));

// ---------------- Public: Company / Projects / Content ----------------

api.get("/", (req, res) => res.json({ message: "ATLANTIS Platform API" }));

api.get("/company", async (req, res) => {
  if (dbDown) return res.json(MEM.company);
  const company = await db.collection("company").findOne({ id: "company" }, { projection: { _id: 0 } });
  res.json(company || {});
});

api.get("/projects", async (req, res) => {
  const { status, category, city, ptype, featured } = req.query;
  if (dbDown) {
    let list = MEM.projects;
    if (status) list = list.filter((p) => p.status === String(status).toUpperCase());
    if (category) list = list.filter((p) => p.category === String(category).toUpperCase());
    if (city) list = list.filter((p) => (p.city || "").toLowerCase() === String(city).toLowerCase());
    if (ptype) list = list.filter((p) => (p.project_type || []).some((t) => String(t).toLowerCase() === String(ptype).toLowerCase()));
    if (featured !== undefined) list = list.filter((p) => p.featured === (featured === "true"));
    return res.json(list);
  }
  const q = {};
  if (status) q.status = String(status).toUpperCase();
  if (category) q.category = String(category).toUpperCase();
  if (city) q.city = { $regex: `^${escapeRegex(city)}$`, $options: "i" };
  if (ptype) q.project_type = { $regex: `^${escapeRegex(ptype)}$`, $options: "i" };
  if (featured !== undefined) q.featured = featured === "true";
  const projects = await db.collection("projects").find(q, { projection: { _id: 0 } }).sort({ sort_order: 1 }).limit(200).toArray();
  res.json(projects);
});

api.get("/projects/meta/filters", async (req, res) => {
  if (dbDown) {
    const cities = [...new Set(MEM.projects.map((p) => p.city).filter(Boolean))].sort();
    const types = [...new Set(MEM.projects.flatMap((p) => p.project_type || []))].sort();
    return res.json({ cities, types });
  }
  const cities = await db.collection("projects").distinct("city");
  const types = await db.collection("projects").distinct("project_type");
  res.json({ cities: cities.filter(Boolean).sort(), types: types.filter(Boolean).sort() });
});

api.get("/projects/:slug", async (req, res) => {
  if (dbDown) {
    const project = MEM.projects.find((p) => p.slug === req.params.slug);
    if (!project) return res.status(404).json({ detail: "Project not found" });
    const faqs = MEM.faqs.filter((f) => !f.project_id || f.project_id === project.id);
    const similar = MEM.projects.filter((p) => p.id !== project.id && (p.city === project.city || p.category === project.category)).slice(0, 3);
    return res.json({ ...project, faqs, similar_projects: similar });
  }
  const project = await db.collection("projects").findOne({ slug: req.params.slug }, { projection: { _id: 0 } });
  if (!project) return res.status(404).json({ detail: "Project not found" });
  const faqs = await db.collection("faqs").find({ $or: [{ project_id: null }, { project_id: project.id }] }, { projection: { _id: 0 } }).sort({ sort_order: 1 }).limit(50).toArray();
  const similar = await db.collection("projects").find(
    { id: { $ne: project.id }, $or: [{ city: project.city }, { category: project.category }] },
    { projection: { _id: 0 } }
  ).limit(3).toArray();
  res.json({ ...project, faqs, similar_projects: similar });
});

api.get("/stats", async (req, res) => {
  if (dbDown) return res.json({ ...MEM.company.stats, total_projects: MEM.projects.length });
  const company = await db.collection("company").findOne({ id: "company" }, { projection: { _id: 0 } });
  const stats = { ...((company || {}).stats || {}) };
  stats.total_projects = await db.collection("projects").countDocuments({});
  res.json(stats);
});

api.get("/testimonials", async (req, res) => {
  if (dbDown) return res.json(MEM.testimonials);
  res.json(await db.collection("testimonials").find({}, { projection: { _id: 0 } }).limit(50).toArray());
});

api.get("/faqs", async (req, res) => {
  if (dbDown) return res.json(MEM.faqs);
  res.json(await db.collection("faqs").find({}, { projection: { _id: 0 } }).sort({ sort_order: 1 }).limit(100).toArray());
});

api.get("/blog", async (req, res) => {
  if (dbDown) return res.json([...MEM.blog].sort((a, b) => String(b.published_at || "").localeCompare(String(a.published_at || ""))));
  res.json(await db.collection("blog").find({}, { projection: { _id: 0 } }).sort({ published_at: -1 }).limit(100).toArray());
});

api.get("/blog/:slug", async (req, res) => {
  if (dbDown) {
    const post = MEM.blog.find((b) => b.slug === req.params.slug);
    return post ? res.json(post) : res.status(404).json({ detail: "Post not found" });
  }
  const post = await db.collection("blog").findOne({ slug: req.params.slug }, { projection: { _id: 0 } });
  if (!post) return res.status(404).json({ detail: "Post not found" });
  res.json(post);
});

api.get("/settings/public", async (req, res) => {
  if (dbDown) {
    const s = MEM.settings;
    return res.json({
      whatsapp_number: s.whatsapp_number || "",
      whatsapp_default_message: s.whatsapp_default_message || "",
      meta_pixel_id: s.meta_pixel_id || "",
      ga4_id: s.ga4_id || "",
      gtm_id: s.gtm_id || "",
    });
  }
  const s = (await db.collection("settings").findOne({ id: "global" }, { projection: { _id: 0 } })) || {};
  res.json({
    whatsapp_number: s.whatsapp_number || "",
    whatsapp_default_message: s.whatsapp_default_message || "",
    meta_pixel_id: s.meta_pixel_id || "",
    ga4_id: s.ga4_id || "",
    gtm_id: s.gtm_id || "",
  });
});

api.get("/team", async (req, res) => {
  if (dbDown) return res.json(MEM.team);
  res.json(await db.collection("team").find({}, { projection: { _id: 0 } }).sort({ sort_order: 1, name: 1 }).limit(200).toArray());
});

// ---------------- Leads (public capture) ----------------

async function aiScoreLead(lead) {
  if (!LLM_API_KEY) return { score: "WARM", score_reason: "AI scoring unavailable — defaulting to Warm." };
  try {
    const prompt = `Name: ${lead.name}\nPhone: ${lead.phone}\nEmail: ${lead.email}\nProject interest: ${lead.project_name}\nBudget: ${lead.budget}\nConfig interest: ${lead.config_interest}\nMessage: ${lead.message}\nSource: ${lead.source}`;
    const client = await getLlmClient();
    const resp = await client.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: "You are a real-estate lead qualification engine for ATLANTIS, a luxury developer in Chandigarh Tricity (ticket sizes ₹1.4 Cr+). Classify the lead HOT, WARM or COLD and give a one-line reason. Reply strictly as JSON: {\"score\": \"HOT|WARM|COLD\", \"reason\": \"...\"}" },
        { role: "user", content: prompt },
      ],
    });
    const text = resp.choices?.[0]?.message?.content || "";
    const m = text.match(/\{.*\}/s);
    const data = m ? JSON.parse(m[0]) : {};
    let score = String(data.score || "WARM").toUpperCase();
    if (!["HOT", "WARM", "COLD"].includes(score)) score = "WARM";
    return { score, score_reason: data.reason || "" };
  } catch (e) {
    console.warn("AI lead scoring failed:", e.message);
    return { score: "WARM", score_reason: "AI scoring unavailable — defaulting to Warm." };
  }
}

api.post("/leads", async (req, res) => {
  if (rateLimited(`leads:${req.ip}`, 5, 60000)) {
    return res.status(429).json({ detail: "Too many enquiries — please wait a minute or call +91 9041795879." });
  }
  const { name = "", phone = "", email = "", project_id = "", project_name = "", message = "", source = "website", budget = "", config_interest = "", utm = null } = req.body || {};
  if (!String(name).trim() || !/^[+]?[\d\s\-()]{8,15}$/.test(String(phone).trim())) {
    return res.status(422).json({ detail: "Please provide a valid name and phone number." });
  }
  if (dbDown) {
    return res.status(503).json({ detail: "Our enquiry desk is momentarily offline — please call +91 9041795879 or WhatsApp us directly." });
  }
  if (String(message).length > 2000 || String(name).length > 120) {
    return res.status(422).json({ detail: "Input too long." });
  }
  const lead = {
    name, phone, email, project_id, project_name, message, source, budget, config_interest, utm,
    id: newId(), status: "NEW", owner: "", notes: [], lost_reason: "",
    ip: req.ip || "", created_at: nowIso(), updated_at: nowIso(), consent: true,
    score: "WARM", score_reason: "AI scoring in progress…",
  };
  await db.collection("leads").insertOne({ ...lead });
  (async () => {
    try {
      const scoring = await aiScoreLead(lead);
      await db.collection("leads").updateOne({ id: lead.id }, { $set: scoring });
    } catch (e) { console.warn("bg scoring failed:", e.message); }
  })();
  res.json({ ok: true, id: lead.id, message: "Thank you. Our relationship team will reach out within 24 hours." });
});

// ---------------- AI Chatbot (public, SSE streaming) ----------------

async function buildChatContext() {
  const company = dbDown ? MEM.company : ((await db.collection("company").findOne({ id: "company" }, { projection: { _id: 0 } })) || {});
  const projects = dbDown ? MEM.projects : await db.collection("projects").find({}, { projection: { _id: 0 } }).sort({ sort_order: 1 }).limit(50).toArray();
  const faqs = dbDown ? MEM.faqs : await db.collection("faqs").find({}, { projection: { _id: 0 } }).limit(50).toArray();
  const lines = [
    `COMPANY: ${company.brand_name} — ${company.tagline}. ${company.about_long || ""}`,
    `Offices: ${JSON.stringify(company.offices || [])}`,
    `Phones: ${JSON.stringify(company.phones || {})}`,
    "\nPROJECTS:",
  ];
  for (const p of projects) {
    const configs = (p.configs || []).map((c) => `${c.config} (${c.price_label}, ${c.availability})`).join(", ");
    lines.push(`- ${p.name} | ${p.status} | ${p.category} | ${p.locality}, ${p.city} | Price: ${p.price_label} | Possession: ${p.possession} | RERA: ${p.rera_number || "pending"} | Configs: ${configs || "TBA"} | ${(p.description || "").slice(0, 300)}`);
  }
  lines.push("\nFAQS:");
  for (const f of faqs) lines.push(`Q: ${f.question} A: ${f.answer}`);
  return lines.join("\n");
}

api.post("/chat", async (req, res) => {
  if (rateLimited(`chat:${req.ip}`, 10, 60000)) {
    return res.status(429).json({ detail: "Too many messages — please slow down or call +91 9041795879." });
  }
  if (!LLM_API_KEY) return res.status(503).json({ detail: "AI concierge is not configured." });
  if (String(req.body.message || "").length > 2000) {
    return res.status(422).json({ detail: "Message too long (max 2000 characters)." });
  }
  const sessionId = String(req.body.session_id || "").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 64) || newId();
  let history = [];
  if (!dbDown) {
    await db.collection("chat_messages").insertOne({ id: newId(), session_id: sessionId, role: "user", content: req.body.message, created_at: nowIso() });
    history = await db.collection("chat_messages").find({ session_id: sessionId }, { projection: { _id: 0 } }).sort({ created_at: 1 }).limit(30).toArray();
  }
  const context = await buildChatContext();
  const historyText = history.slice(-12).map((m) => `${m.role.toUpperCase()}: ${m.content}`).join("\n");

  const systemMessage =
    "You are the ATLANTIS AI Luxury Concierge for a premium real estate developer in Chandigarh Tricity. " +
    "Answer questions about projects, pricing, availability, possession, location and amenities ONLY from the " +
    "context below. If a fact is not in the context, say the team will confirm and invite the visitor to share " +
    "their name and phone number, or call +91 9041795879. Be warm, concise, premium in tone. Never invent " +
    "prices, RERA numbers or dates. When a visitor shows buying intent, politely ask for their name and phone " +
    "number so the relationship team can reach out.\n\nCONTEXT:\n" + context +
    "\n\nRECENT CONVERSATION:\n" + historyText;

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "X-Accel-Buffering": "no",
    Connection: "keep-alive",
  });
  const full = [];
  try {
    const openai = await getLlmClient();
    const stream = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: "system", content: systemMessage }, { role: "user", content: req.body.message }],
      stream: true,
    });
    for await (const chunk of stream) {
      const token = chunk.choices?.[0]?.delta?.content;
      if (token) {
        full.push(token);
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    }
  } catch (e) {
    console.warn("chat stream error:", e.message);
    res.write(`data: ${JSON.stringify({ token: "I apologise — I am momentarily unavailable. Please call +91 9041795879 or leave your number and we will call you back." })}\n\n`);
  }
  if (!dbDown) {
    await db.collection("chat_messages").insertOne({ id: newId(), session_id: sessionId, role: "assistant", content: full.join(""), created_at: nowIso() });
  }
  res.write("data: [DONE]\n\n");
  res.end();
});

// ---------------- SEO: sitemap ----------------

api.get("/sitemap.xml", async (req, res) => {
  const base = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
  const projects = dbDown ? MEM.projects.map((p) => ({ slug: p.slug })) : await db.collection("projects").find({}, { projection: { _id: 0, slug: 1 } }).limit(200).toArray();
  const posts = dbDown ? MEM.blog.map((b) => ({ slug: b.slug })) : await db.collection("blog").find({}, { projection: { _id: 0, slug: 1 } }).limit(200).toArray();
  const urls = ["", "/projects", "/portfolio", "/about", "/blog", "/contact",
    ...projects.map((p) => `/projects/${p.slug}`), ...posts.map((b) => `/blog/${b.slug}`)];
  const xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'];
  for (const u of urls) xml.push(`<url><loc>${base}${u}</loc><changefreq>weekly</changefreq></url>`);
  xml.push("</urlset>");
  res.type("application/xml").send(xml.join("\n"));
});

// ---------------- Admin ----------------

api.get("/admin/dashboard", requireAuth, async (req, res) => {
  const totalLeads = await db.collection("leads").countDocuments({});
  const byStatus = {};
  for (const s of LEAD_STAGES) byStatus[s] = await db.collection("leads").countDocuments({ status: s });
  const byScore = {};
  for (const s of ["HOT", "WARM", "COLD"]) byScore[s] = await db.collection("leads").countDocuments({ score: s });
  const bySource = {};
  for await (const row of db.collection("leads").aggregate([{ $group: { _id: "$source", count: { $sum: 1 } } }])) {
    bySource[row._id || "website"] = row.count;
  }
  const recent = await db.collection("leads").find({}, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(8).toArray();
  res.json({
    total_leads: totalLeads, by_status: byStatus, by_score: byScore, by_source: bySource, recent_leads: recent,
    total_projects: await db.collection("projects").countDocuments({}),
    ongoing: await db.collection("projects").countDocuments({ status: "ONGOING" }),
    upcoming: await db.collection("projects").countDocuments({ status: "UPCOMING" }),
    delivered: await db.collection("projects").countDocuments({ status: "DELIVERED" }),
  });
});

api.get("/admin/projects", requireAuth, async (req, res) => {
  res.json(await db.collection("projects").find({}, { projection: { _id: 0 } }).sort({ sort_order: 1 }).limit(200).toArray());
});

api.post("/admin/projects", requireAuth, async (req, res) => {
  const project = { ...req.body };
  project.id = project.id || newId();
  if (!project.slug) project.slug = slugify(project.name);
  project.updated_at = nowIso();
  await db.collection("projects").insertOne(project);
  res.json(stripId(project));
});

api.put("/admin/projects/:pid", requireAuth, async (req, res) => {
  const project = { ...req.body };
  delete project._id;
  project.id = req.params.pid;
  project.updated_at = nowIso();
  await db.collection("projects").updateOne({ id: req.params.pid }, { $set: project }, { upsert: true });
  res.json(project);
});

api.delete("/admin/projects/:pid", requireAuth, async (req, res) => {
  await db.collection("projects").deleteOne({ id: req.params.pid });
  res.json({ ok: true });
});

api.get("/admin/leads", requireAuth, async (req, res) => {
  const q = req.query.status ? { status: String(req.query.status) } : {};
  res.json(await db.collection("leads").find(q, { projection: { _id: 0 } }).sort({ created_at: -1 }).limit(500).toArray());
});

api.put("/admin/leads/:leadId", requireAuth, async (req, res) => {
  const lead = await db.collection("leads").findOne({ id: req.params.leadId });
  if (!lead) return res.status(404).json({ detail: "Lead not found" });
  const { status, owner, lost_reason, note } = req.body || {};
  const updates = { updated_at: nowIso() };
  if (status) {
    if (!LEAD_STAGES.includes(status)) return res.status(422).json({ detail: "Invalid stage" });
    updates.status = status;
  }
  if (owner !== undefined) updates.owner = owner;
  if (lost_reason !== undefined) updates.lost_reason = lost_reason;
  if (note) {
    await db.collection("leads").updateOne({ id: req.params.leadId }, { $push: { notes: { text: note, by: req.user.email, at: nowIso() } } });
  }
  await db.collection("leads").updateOne({ id: req.params.leadId }, { $set: updates });
  res.json(await db.collection("leads").findOne({ id: req.params.leadId }, { projection: { _id: 0 } }));
});

api.delete("/admin/leads/:leadId", requireAuth, async (req, res) => {
  await db.collection("leads").deleteOne({ id: req.params.leadId });
  res.json({ ok: true });
});

api.post("/admin/leads/:leadId/rescore", requireAuth, async (req, res) => {
  const lead = await db.collection("leads").findOne({ id: req.params.leadId }, { projection: { _id: 0 } });
  if (!lead) return res.status(404).json({ detail: "Lead not found" });
  const scoring = await aiScoreLead(lead);
  await db.collection("leads").updateOne({ id: req.params.leadId }, { $set: scoring });
  res.json({ ...lead, ...scoring });
});

api.get("/admin/settings", requireAuth, async (req, res) => {
  res.json((await db.collection("settings").findOne({ id: "global" }, { projection: { _id: 0 } })) || {});
});

api.put("/admin/settings", requireAuth, async (req, res) => {
  const settings = { ...req.body };
  delete settings._id;
  settings.id = "global";
  await db.collection("settings").updateOne({ id: "global" }, { $set: settings }, { upsert: true });
  res.json(settings);
});

api.get("/admin/company", requireAuth, async (req, res) => {
  res.json((await db.collection("company").findOne({ id: "company" }, { projection: { _id: 0 } })) || {});
});

api.put("/admin/company", requireAuth, async (req, res) => {
  const company = { ...req.body };
  delete company._id;
  company.id = "company";
  await db.collection("company").updateOne({ id: "company" }, { $set: company }, { upsert: true });
  res.json(company);
});

api.post("/admin/upload", requireAuth, async (req, res) => {
  const m = String(req.body.data_url || "").match(/^data:(image\/(?:png|jpeg|jpg|webp)|application\/pdf);base64,(.+)$/s);
  if (!m) return res.status(422).json({ detail: "Only PNG/JPEG/WebP images or PDF files are accepted." });
  const raw = Buffer.from(m[2], "base64");
  if (raw.length > 15 * 1024 * 1024) return res.status(413).json({ detail: "File exceeds the 15 MB limit." });
  const ext = { "image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp", "application/pdf": "pdf" }[m[1]];
  const name = `${newId()}.${ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), raw);
  res.json({ url: `/api/uploads/${name}` });
});

api.post("/admin/testimonials", requireAuth, async (req, res) => {
  const t = { ...req.body };
  t.id = t.id || newId();
  await db.collection("testimonials").insertOne({ ...t });
  res.json(stripId(t));
});

api.delete("/admin/testimonials/:tid", requireAuth, async (req, res) => {
  await db.collection("testimonials").deleteOne({ id: req.params.tid });
  res.json({ ok: true });
});

api.post("/admin/faqs", requireAuth, async (req, res) => {
  const f = { ...req.body };
  f.id = f.id || newId();
  await db.collection("faqs").insertOne({ ...f });
  res.json(stripId(f));
});

api.delete("/admin/faqs/:fid", requireAuth, async (req, res) => {
  await db.collection("faqs").deleteOne({ id: req.params.fid });
  res.json({ ok: true });
});

api.post("/admin/blog", requireAuth, async (req, res) => {
  const post = { ...req.body };
  post.id = post.id || newId();
  if (!post.slug) post.slug = slugify(post.title || "post");
  await db.collection("blog").updateOne({ id: post.id }, { $set: post }, { upsert: true });
  res.json(stripId(post));
});

api.delete("/admin/blog/:bid", requireAuth, async (req, res) => {
  await db.collection("blog").deleteOne({ id: req.params.bid });
  res.json({ ok: true });
});

api.post("/admin/team", requireAuth, async (req, res) => {
  const member = { ...req.body };
  member.id = member.id || newId();
  delete member._id;
  await db.collection("team").insertOne({ ...member });
  res.json(stripId(member));
});

api.put("/admin/team/:tid", requireAuth, async (req, res) => {
  const member = { ...req.body };
  delete member._id;
  member.id = req.params.tid;
  await db.collection("team").updateOne({ id: req.params.tid }, { $set: member }, { upsert: true });
  res.json(member);
});

api.delete("/admin/team/:tid", requireAuth, async (req, res) => {
  await db.collection("team").deleteOne({ id: req.params.tid });
  res.json({ ok: true });
});

// ---------------- Admin: AI Content Studio ----------------

const AI_PROMPTS = {
  description: "Write a premium, editorial 3-paragraph project description for this luxury real estate project. No invented facts beyond what is given; mark unknowns as [TBC]. Project context:\n",
  seo: "Generate SEO for this real estate project as strict JSON {\"title\": \"<=60 chars\", \"description\": \"<=160 chars\", \"keywords\": \"comma separated\"}. Project context:\n",
  alt: "Write one concise, descriptive image alt text (<=120 chars) for this real estate image context:\n",
  whatsapp: "Write a short, warm WhatsApp follow-up message template for a sales agent to send to a lead interested in this project. Use {{name}} and {{project}} placeholders. Context:\n",
  blog: "Write a 500-word premium real-estate blog post draft based on this brief. Mark any unverifiable facts as [TBC]. Brief:\n",
};

api.post("/admin/ai/generate", requireAuth, async (req, res) => {
  if (!LLM_API_KEY) return res.status(503).json({ detail: "AI is not configured." });
  const { kind, context } = req.body || {};
  if (!AI_PROMPTS[kind]) return res.status(422).json({ detail: "Unknown generation kind" });
  try {
    const openai = await getLlmClient();
    const resp = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [
        { role: "system", content: "You are the ATLANTIS AI Content Studio — a luxury real estate copywriter for the Chandigarh Tricity market. Be precise, editorial, never invent facts." },
        { role: "user", content: AI_PROMPTS[kind] + context },
      ],
    });
    res.json({ kind, output: resp.choices?.[0]?.message?.content || "" });
  } catch (e) {
    console.warn("AI generate failed:", e.message);
    res.status(502).json({ detail: "AI generation failed. Please retry." });
  }
});

api.use((req, res) => res.status(404).json({ detail: "Not Found" }));

app.use("/api/uploads", express.static(UPLOAD_DIR));
app.use("/api", api);

app.use((err, req, res, next) => {
  console.error("unhandled:", err.message);
  const status = err.status || 500;
  res.status(status).json({ detail: status === 500 ? "Internal Server Error" : err.message });
});

// ---------------- Startup ----------------

async function start() {
  await client.connect();
  db = client.db(process.env.DB_NAME);

  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("login_attempts").createIndex({ identifier: 1 });
  await db.collection("projects").createIndex({ slug: 1 }, { unique: true });
  await db.collection("leads").createIndex({ status: 1 });
  await db.collection("chat_messages").createIndex({ session_id: 1 });

  const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "";
  if (adminEmail && adminPassword) {
    const existing = await db.collection("users").findOne({ email: adminEmail });
    if (!existing) {
      await db.collection("users").insertOne({
        id: newId(), email: adminEmail, password_hash: hashPassword(adminPassword),
        name: "ATLANTIS Admin", role: "super_admin", created_at: nowIso(),
      });
      console.log(`Seeded admin user ${adminEmail}`);
    } else if (!verifyPassword(adminPassword, existing.password_hash)) {
      await db.collection("users").updateOne({ email: adminEmail }, { $set: { password_hash: hashPassword(adminPassword) } });
      console.log("Admin password updated from env");
    }
  }

  if ((await db.collection("projects").countDocuments({})) === 0) {
    await db.collection("projects").insertMany(PROJECTS.map((p) => ({ ...p })));
    console.log(`Seeded ${PROJECTS.length} projects from ATLANTIS domains`);
  }
  if ((await db.collection("company").countDocuments({ id: "company" })) === 0) {
    await db.collection("company").insertOne({ ...COMPANY });
  }
  if ((await db.collection("settings").countDocuments({ id: "global" })) === 0) {
    await db.collection("settings").insertOne({ ...SETTINGS });
  }
  if ((await db.collection("faqs").countDocuments({})) === 0) {
    await db.collection("faqs").insertMany(FAQS.map((f) => ({ ...f })));
  }
  if ((await db.collection("blog").countDocuments({})) === 0) {
    await db.collection("blog").insertMany([
      ...BLOG.map((b) => ({ ...b, kind: b.kind || "blog" })),
      ...UPDATES.map((u) => ({ ...u })),
    ]);
  }
  if ((await db.collection("testimonials").countDocuments({})) === 0 && TESTIMONIALS.length) {
    await db.collection("testimonials").insertMany(TESTIMONIALS.map((t) => ({ ...t })));
  }
  if ((await db.collection("team").countDocuments({})) === 0) {
    await db.collection("team").insertMany(TEAM.map((t) => ({ ...t })));
    console.log(`Seeded ${TEAM.length} team members`);
  }

  // Enrichment: SEO specifications + brochure download for every project
  for (const [pid, specs] of Object.entries(EXTRA_SPECS)) {
    await db.collection("projects").updateOne(
      { id: pid, $or: [{ specifications: { $exists: false } }, { specifications: { $size: 0 } }] },
      { $set: { specifications: specs } }
    );
  }
  for await (const p of db.collection("projects").find({}, { projection: { id: 1, documents: 1 } })) {
    if (!p.documents?.length && fs.existsSync(path.join(UPLOAD_DIR, `brochure-${p.id}.pdf`))) {
      await db.collection("projects").updateOne(
        { id: p.id },
        { $set: { documents: [{ name: "E-Brochure", url: `/api/uploads/brochure-${p.id}.pdf`, category: "BROCHURE" }] } }
      );
    }
  }
  console.log("ATLANTIS Node backend ready");
}

const ready = start().catch((e) => {
  dbDown = true;
  console.error("DB unavailable — public site serving seed fallback:", e.message);
});

// Ensure DB is connected before any request (serverless-safe)
app.use(async (req, res, next) => {
  try { await ready; next(); } catch (e) { res.status(503).json({ detail: "Service starting, retry shortly." }); }
});

export default app;

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 8001;
  ready.then(() => {
    app.listen(PORT, "0.0.0.0", () => console.log(`ATLANTIS Node backend listening on ${PORT}`));
  });
}
