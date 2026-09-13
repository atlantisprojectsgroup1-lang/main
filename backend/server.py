from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import re
import uuid
import json
import logging
from datetime import datetime, timezone, timedelta

import bcrypt
import jwt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends, Query
from fastapi.responses import StreamingResponse, PlainTextResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import Optional, List

from seed_data import COMPANY, PROJECTS, FAQS, BLOG, TESTIMONIALS, SETTINGS, TEAM, UPDATES, EXTRA_SPECS

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI(title="ATLANTIS Platform API")
api = APIRouter(prefix="/api")

JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY", "")
OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
LLM_API_KEY = OPENAI_API_KEY or EMERGENT_LLM_KEY
LLM_BASE_URL = os.environ.get("LLM_BASE_URL") or (None if OPENAI_API_KEY else "https://integrations.emergentagent.com/llm")
LLM_MODEL = os.environ.get("LLM_MODEL", "gpt-5.4")

_llm_client = None


def get_llm_client():
    global _llm_client
    if _llm_client is None:
        from openai import AsyncOpenAI
        kwargs = {"api_key": LLM_API_KEY}
        if LLM_BASE_URL:
            kwargs["base_url"] = LLM_BASE_URL
        _llm_client = AsyncOpenAI(**kwargs)
    return _llm_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

LEAD_STAGES = ["NEW", "CONTACTED", "SITE_VISIT_SCHEDULED", "SITE_VISIT_DONE", "NEGOTIATION", "BOOKED", "LOST"]


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def new_id():
    return str(uuid.uuid4())


# ---------------- Auth ----------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, role: str) -> str:
    payload = {"sub": user_id, "email": email, "role": role, "type": "access",
               "exp": datetime.now(timezone.utc) + timedelta(hours=24)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


class LoginIn(BaseModel):
    email: str
    password: str


@api.post("/auth/login")
async def login(body: LoginIn, request: Request, response: Response):
    email = body.email.strip().lower()
    identifier = f"{request.client.host}:{email}"
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    if attempt and attempt.get("count", 0) >= 5:
        locked_since = datetime.fromisoformat(attempt["updated_at"])
        if datetime.now(timezone.utc) - locked_since < timedelta(minutes=15):
            raise HTTPException(status_code=429, detail="Too many failed attempts. Try again in 15 minutes.")
        await db.login_attempts.delete_one({"identifier": identifier})
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        await db.login_attempts.update_one(
            {"identifier": identifier},
            {"$inc": {"count": 1}, "$set": {"updated_at": now_iso()}},
            upsert=True,
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    await db.login_attempts.delete_one({"identifier": identifier})
    token = create_access_token(user["id"], user["email"], user["role"])
    response.set_cookie(key="access_token", value=token, httponly=True, secure=True,
                        samesite="none", max_age=86400, path="/")
    return {"id": user["id"], "email": user["email"], "name": user.get("name", ""), "role": user["role"], "token": token}


@api.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ---------------- Public: Company / Projects / Content ----------------

@api.get("/")
async def root():
    return {"message": "ATLANTIS Platform API"}


@api.get("/company")
async def get_company():
    company = await db.company.find_one({"id": "company"}, {"_id": 0})
    return company or {}


@api.get("/projects")
async def list_projects(
    status: Optional[str] = None, category: Optional[str] = None, city: Optional[str] = None,
    ptype: Optional[str] = None, featured: Optional[bool] = None,
):
    q = {}
    if status:
        q["status"] = status.upper()
    if category:
        q["category"] = category.upper()
    if city:
        q["city"] = {"$regex": f"^{re.escape(city)}$", "$options": "i"}
    if ptype:
        q["project_type"] = {"$regex": f"^{re.escape(ptype)}$", "$options": "i"}
    if featured is not None:
        q["featured"] = featured
    projects = await db.projects.find(q, {"_id": 0}).sort("sort_order", 1).to_list(200)
    return projects


@api.get("/projects/meta/filters")
async def project_filters():
    cities = await db.projects.distinct("city")
    types = await db.projects.distinct("project_type")
    return {"cities": sorted([c for c in cities if c]), "types": sorted([t for t in types if t])}


@api.get("/projects/{slug}")
async def get_project(slug: str):
    project = await db.projects.find_one({"slug": slug}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    faqs = await db.faqs.find({"$or": [{"project_id": None}, {"project_id": project["id"]}]}, {"_id": 0}).sort("sort_order", 1).to_list(50)
    similar = await db.projects.find(
        {"id": {"$ne": project["id"]}, "$or": [{"city": project["city"]}, {"category": project["category"]}]},
        {"_id": 0}).limit(3).to_list(3)
    return {**project, "faqs": faqs, "similar_projects": similar}


@api.get("/stats")
async def public_stats():
    company = await db.company.find_one({"id": "company"}, {"_id": 0})
    stats = (company or {}).get("stats", {})
    stats["total_projects"] = await db.projects.count_documents({})
    return stats


@api.get("/testimonials")
async def list_testimonials():
    return await db.testimonials.find({}, {"_id": 0}).to_list(50)


@api.get("/faqs")
async def list_faqs():
    return await db.faqs.find({}, {"_id": 0}).sort("sort_order", 1).to_list(100)


@api.get("/blog")
async def list_blog():
    return await db.blog.find({}, {"_id": 0}).sort("published_at", -1).to_list(100)


@api.get("/blog/{slug}")
async def get_blog_post(slug: str):
    post = await db.blog.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@api.get("/settings/public")
async def public_settings():
    s = await db.settings.find_one({"id": "global"}, {"_id": 0}) or {}
    return {
        "whatsapp_number": s.get("whatsapp_number", ""),
        "whatsapp_default_message": s.get("whatsapp_default_message", ""),
        "meta_pixel_id": s.get("meta_pixel_id", ""),
        "ga4_id": s.get("ga4_id", ""),
        "gtm_id": s.get("gtm_id", ""),
    }


# ---------------- Leads (public capture) ----------------

class LeadIn(BaseModel):
    name: str
    phone: str
    email: Optional[str] = ""
    project_id: Optional[str] = ""
    project_name: Optional[str] = ""
    message: Optional[str] = ""
    source: Optional[str] = "website"
    budget: Optional[str] = ""
    config_interest: Optional[str] = ""
    utm: Optional[dict] = None


async def ai_score_lead(lead: dict) -> dict:
    if not LLM_API_KEY:
        return {"score": "WARM", "score_reason": "AI scoring unavailable — defaulting to Warm."}
    try:
        prompt = (f"Name: {lead.get('name')}\nPhone: {lead.get('phone')}\nEmail: {lead.get('email')}\n"
                  f"Project interest: {lead.get('project_name')}\nBudget: {lead.get('budget')}\n"
                  f"Config interest: {lead.get('config_interest')}\nMessage: {lead.get('message')}\nSource: {lead.get('source')}")
        resp = await get_llm_client().chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": (
                    "You are a real-estate lead qualification engine for ATLANTIS, a luxury developer in "
                    "Chandigarh Tricity (ticket sizes ₹1.4 Cr+). Classify the lead HOT, WARM or COLD and give a "
                    "one-line reason. Reply strictly as JSON: {\"score\": \"HOT|WARM|COLD\", \"reason\": \"...\"}")},
                {"role": "user", "content": prompt},
            ],
        )
        text = resp.choices[0].message.content or ""
        m = re.search(r"\{.*\}", text, re.S)
        data = json.loads(m.group(0)) if m else {}
        score = str(data.get("score", "WARM")).upper()
        if score not in ("HOT", "WARM", "COLD"):
            score = "WARM"
        return {"score": score, "score_reason": data.get("reason", "")}
    except Exception as e:
        logger.warning(f"AI lead scoring failed: {e}")
        return {"score": "WARM", "score_reason": "AI scoring unavailable — defaulting to Warm."}


@api.post("/leads")
async def create_lead(body: LeadIn, request: Request):
    if not body.name.strip() or not re.match(r"^[+]?[\d\s\-()]{8,15}$", body.phone.strip()):
        raise HTTPException(status_code=422, detail="Please provide a valid name and phone number.")
    lead = body.model_dump()
    lead.update({
        "id": new_id(), "status": "NEW", "owner": "", "notes": [], "lost_reason": "",
        "ip": request.client.host if request.client else "",
        "created_at": now_iso(), "updated_at": now_iso(),
        "consent": True,
    })
    lead.update({"score": "WARM", "score_reason": "AI scoring in progress…"})
    await db.leads.insert_one(lead)
    lead.pop("_id", None)

    async def _score_later(lead_id, snapshot):
        scoring = await ai_score_lead(snapshot)
        await db.leads.update_one({"id": lead_id}, {"$set": scoring})

    import asyncio
    asyncio.create_task(_score_later(lead["id"], lead))
    return {"ok": True, "id": lead["id"], "message": "Thank you. Our relationship team will reach out within 24 hours."}


# ---------------- AI Chatbot (public, SSE streaming) ----------------

class ChatIn(BaseModel):
    session_id: str
    message: str


async def build_chat_context() -> str:
    company = await db.company.find_one({"id": "company"}, {"_id": 0}) or {}
    projects = await db.projects.find({}, {"_id": 0}).sort("sort_order", 1).to_list(50)
    faqs = await db.faqs.find({}, {"_id": 0}).to_list(50)
    lines = [f"COMPANY: {company.get('brand_name')} — {company.get('tagline')}. {company.get('about_long', '')}",
             f"Offices: {json.dumps(company.get('offices', []))}", f"Phones: {json.dumps(company.get('phones', {}))}",
             "\nPROJECTS:"]
    for p in projects:
        configs = ", ".join(f"{c.get('config')} ({c.get('price_label')}, {c.get('availability')})" for c in p.get("configs", []))
        lines.append(
            f"- {p['name']} | {p.get('status')} | {p.get('category')} | {p.get('locality')}, {p.get('city')} | "
            f"Price: {p.get('price_label')} | Possession: {p.get('possession')} | RERA: {p.get('rera_number') or 'pending'} | "
            f"Configs: {configs or 'TBA'} | {p.get('description', '')[:300]}"
        )
    lines.append("\nFAQS:")
    for f in faqs:
        lines.append(f"Q: {f['question']} A: {f['answer']}")
    return "\n".join(lines)


@api.post("/chat")
async def ai_chat(body: ChatIn):
    if not LLM_API_KEY:
        raise HTTPException(status_code=503, detail="AI concierge is not configured.")
    session_id = re.sub(r"[^a-zA-Z0-9\-]", "", body.session_id)[:64] or new_id()
    await db.chat_messages.insert_one({"id": new_id(), "session_id": session_id, "role": "user",
                                       "content": body.message, "created_at": now_iso()})
    history = await db.chat_messages.find({"session_id": session_id}, {"_id": 0}).sort("created_at", 1).to_list(30)
    context = await build_chat_context()
    history_text = "\n".join(f"{m['role'].upper()}: {m['content']}" for m in history[-12:])

    system_message = (
        "You are the ATLANTIS AI Luxury Concierge for a premium real estate developer in Chandigarh Tricity. "
        "Answer questions about projects, pricing, availability, possession, location and amenities ONLY from the "
        "context below. If a fact is not in the context, say the team will confirm and invite the visitor to share "
        "their name and phone number, or call +91 9041795879. Be warm, concise, premium in tone. Never invent "
        "prices, RERA numbers or dates. When a visitor shows buying intent, politely ask for their name and phone "
        "number so the relationship team can reach out.\n\nCONTEXT:\n" + context +
        "\n\nRECENT CONVERSATION:\n" + history_text
    )

    async def event_gen():
        full = []
        try:
            stream = await get_llm_client().chat.completions.create(
                model=LLM_MODEL,
                messages=[{"role": "system", "content": system_message},
                          {"role": "user", "content": body.message}],
                stream=True,
            )
            async for chunk in stream:
                if chunk.choices and chunk.choices[0].delta.content:
                    token = chunk.choices[0].delta.content
                    full.append(token)
                    yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            logger.warning(f"chat stream error: {e}")
            yield f"data: {json.dumps({'token': 'I apologise — I am momentarily unavailable. Please call +91 9041795879 or leave your number and we will call you back.'})}\n\n"
        await db.chat_messages.insert_one({"id": new_id(), "session_id": session_id, "role": "assistant",
                                           "content": "".join(full), "created_at": now_iso()})
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_gen(), media_type="text/event-stream",
                             headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


# ---------------- SEO: sitemap ----------------

@api.get("/sitemap.xml")
async def sitemap(request: Request):
    base = os.environ.get("FRONTEND_URL", str(request.base_url).rstrip("/"))
    projects = await db.projects.find({}, {"_id": 0, "slug": 1}).to_list(200)
    posts = await db.blog.find({}, {"_id": 0, "slug": 1}).to_list(200)
    urls = ["", "/projects", "/portfolio", "/about", "/blog", "/contact"]
    urls += [f"/projects/{p['slug']}" for p in projects]
    urls += [f"/blog/{b['slug']}" for b in posts]
    xml = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for u in urls:
        xml.append(f"<url><loc>{base}{u}</loc><changefreq>weekly</changefreq></url>")
    xml.append("</urlset>")
    return PlainTextResponse("\n".join(xml), media_type="application/xml")


# ---------------- Admin ----------------

@api.get("/admin/dashboard")
async def admin_dashboard(user=Depends(get_current_user)):
    total_leads = await db.leads.count_documents({})
    by_status = {s: await db.leads.count_documents({"status": s}) for s in LEAD_STAGES}
    by_score = {s: await db.leads.count_documents({"score": s}) for s in ["HOT", "WARM", "COLD"]}
    by_source = {}
    async for row in db.leads.aggregate([{"$group": {"_id": "$source", "count": {"$sum": 1}}}]):
        by_source[row["_id"] or "website"] = row["count"]
    recent = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).limit(8).to_list(8)
    return {
        "total_leads": total_leads, "by_status": by_status, "by_score": by_score, "by_source": by_source,
        "recent_leads": recent,
        "total_projects": await db.projects.count_documents({}),
        "ongoing": await db.projects.count_documents({"status": "ONGOING"}),
        "upcoming": await db.projects.count_documents({"status": "UPCOMING"}),
        "delivered": await db.projects.count_documents({"status": "DELIVERED"}),
    }


@api.get("/admin/projects")
async def admin_list_projects(user=Depends(get_current_user)):
    return await db.projects.find({}, {"_id": 0}).sort("sort_order", 1).to_list(200)


@api.post("/admin/projects")
async def admin_create_project(project: dict, user=Depends(get_current_user)):
    project["id"] = project.get("id") or new_id()
    if not project.get("slug"):
        project["slug"] = re.sub(r"[^a-z0-9]+", "-", project.get("name", "project").lower()).strip("-")
    project["updated_at"] = now_iso()
    await db.projects.insert_one(project)
    project.pop("_id", None)
    return project


@api.put("/admin/projects/{pid}")
async def admin_update_project(pid: str, project: dict, user=Depends(get_current_user)):
    project.pop("_id", None)
    project["id"] = pid
    project["updated_at"] = now_iso()
    await db.projects.update_one({"id": pid}, {"$set": project}, upsert=True)
    return project


@api.delete("/admin/projects/{pid}")
async def admin_delete_project(pid: str, user=Depends(get_current_user)):
    await db.projects.delete_one({"id": pid})
    return {"ok": True}


@api.get("/admin/leads")
async def admin_list_leads(status: Optional[str] = None, user=Depends(get_current_user)):
    q = {"status": status} if status else {}
    return await db.leads.find(q, {"_id": 0}).sort("created_at", -1).to_list(500)


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    owner: Optional[str] = None
    lost_reason: Optional[str] = None
    note: Optional[str] = None


@api.put("/admin/leads/{lead_id}")
async def admin_update_lead(lead_id: str, body: LeadUpdate, user=Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    updates = {"updated_at": now_iso()}
    if body.status:
        if body.status not in LEAD_STAGES:
            raise HTTPException(status_code=422, detail="Invalid stage")
        updates["status"] = body.status
    if body.owner is not None:
        updates["owner"] = body.owner
    if body.lost_reason is not None:
        updates["lost_reason"] = body.lost_reason
    if body.note:
        await db.leads.update_one({"id": lead_id}, {"$push": {"notes": {"text": body.note, "by": user["email"], "at": now_iso()}}})
    await db.leads.update_one({"id": lead_id}, {"$set": updates})
    return await db.leads.find_one({"id": lead_id}, {"_id": 0})


@api.delete("/admin/leads/{lead_id}")
async def admin_delete_lead(lead_id: str, user=Depends(get_current_user)):
    await db.leads.delete_one({"id": lead_id})
    return {"ok": True}


@api.post("/admin/leads/{lead_id}/rescore")
async def admin_rescore_lead(lead_id: str, user=Depends(get_current_user)):
    lead = await db.leads.find_one({"id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    scoring = await ai_score_lead(lead)
    await db.leads.update_one({"id": lead_id}, {"$set": scoring})
    return {**lead, **scoring}


@api.get("/admin/settings")
async def admin_get_settings(user=Depends(get_current_user)):
    return await db.settings.find_one({"id": "global"}, {"_id": 0}) or {}


@api.put("/admin/settings")
async def admin_put_settings(settings: dict, user=Depends(get_current_user)):
    settings.pop("_id", None)
    settings["id"] = "global"
    await db.settings.update_one({"id": "global"}, {"$set": settings}, upsert=True)
    return settings


@api.get("/admin/company")
async def admin_get_company(user=Depends(get_current_user)):
    return await db.company.find_one({"id": "company"}, {"_id": 0}) or {}


class UploadIn(BaseModel):
    data_url: str


@api.post("/admin/upload")
async def admin_upload(body: UploadIn, user=Depends(get_current_user)):
    import base64
    m = re.match(r"^data:(image/(?:png|jpeg|jpg|webp)|application/pdf);base64,(.+)$", body.data_url or "", re.S)
    if not m:
        raise HTTPException(status_code=422, detail="Only PNG/JPEG/WebP images or PDF files are accepted.")
    raw = base64.b64decode(m.group(2))
    if len(raw) > 15 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File exceeds the 15 MB limit.")
    mime = m.group(1)
    ext = {"image/png": "png", "image/jpeg": "jpg", "image/jpg": "jpg", "image/webp": "webp", "application/pdf": "pdf"}[mime]
    name = f"{new_id()}.{ext}"
    (ROOT_DIR / "uploads" / name).write_bytes(raw)
    return {"url": f"/api/uploads/{name}"}

@api.put("/admin/company")
async def admin_put_company(company: dict, user=Depends(get_current_user)):
    company.pop("_id", None)
    company["id"] = "company"
    await db.company.update_one({"id": "company"}, {"$set": company}, upsert=True)
    return company


@api.post("/admin/testimonials")
async def admin_add_testimonial(t: dict, user=Depends(get_current_user)):
    t["id"] = t.get("id") or new_id()
    await db.testimonials.insert_one(t)
    t.pop("_id", None)
    return t


@api.delete("/admin/testimonials/{tid}")
async def admin_del_testimonial(tid: str, user=Depends(get_current_user)):
    await db.testimonials.delete_one({"id": tid})
    return {"ok": True}


@api.post("/admin/faqs")
async def admin_add_faq(f: dict, user=Depends(get_current_user)):
    f["id"] = f.get("id") or new_id()
    await db.faqs.insert_one(f)
    f.pop("_id", None)
    return f


@api.delete("/admin/faqs/{fid}")
async def admin_del_faq(fid: str, user=Depends(get_current_user)):
    await db.faqs.delete_one({"id": fid})
    return {"ok": True}


@api.post("/admin/blog")
async def admin_upsert_blog(post: dict, user=Depends(get_current_user)):
    post["id"] = post.get("id") or new_id()
    if not post.get("slug"):
        post["slug"] = re.sub(r"[^a-z0-9]+", "-", post.get("title", "post").lower()).strip("-")
    await db.blog.update_one({"id": post["id"]}, {"$set": post}, upsert=True)
    post.pop("_id", None)
    return post


@api.delete("/admin/blog/{bid}")
async def admin_del_blog(bid: str, user=Depends(get_current_user)):
    await db.blog.delete_one({"id": bid})
    return {"ok": True}


# ---------------- Team ----------------

@api.get("/team")
async def list_team():
    return await db.team.find({}, {"_id": 0}).sort([("sort_order", 1), ("name", 1)]).to_list(200)


@api.post("/admin/team")
async def admin_add_team_member(member: dict, user=Depends(get_current_user)):
    member["id"] = member.get("id") or new_id()
    member.pop("_id", None)
    await db.team.insert_one(member)
    member.pop("_id", None)
    return member


@api.put("/admin/team/{tid}")
async def admin_update_team_member(tid: str, member: dict, user=Depends(get_current_user)):
    member.pop("_id", None)
    member["id"] = tid
    await db.team.update_one({"id": tid}, {"$set": member}, upsert=True)
    return member


@api.delete("/admin/team/{tid}")
async def admin_del_team_member(tid: str, user=Depends(get_current_user)):
    await db.team.delete_one({"id": tid})
    return {"ok": True}


# ---------------- Admin: AI Content Studio ----------------

class AiGenIn(BaseModel):
    kind: str  # description | seo | alt | whatsapp | blog
    context: str


@api.post("/admin/ai/generate")
async def admin_ai_generate(body: AiGenIn, user=Depends(get_current_user)):
    if not LLM_API_KEY:
        raise HTTPException(status_code=503, detail="AI is not configured.")
    prompts = {
        "description": "Write a premium, editorial 3-paragraph project description for this luxury real estate project. No invented facts beyond what is given; mark unknowns as [TBC]. Project context:\n",
        "seo": "Generate SEO for this real estate project as strict JSON {\"title\": \"<=60 chars\", \"description\": \"<=160 chars\", \"keywords\": \"comma separated\"}. Project context:\n",
        "alt": "Write one concise, descriptive image alt text (<=120 chars) for this real estate image context:\n",
        "whatsapp": "Write a short, warm WhatsApp follow-up message template for a sales agent to send to a lead interested in this project. Use {{name}} and {{project}} placeholders. Context:\n",
        "blog": "Write a 500-word premium real-estate blog post draft based on this brief. Mark any unverifiable facts as [TBC]. Brief:\n",
    }
    if body.kind not in prompts:
        raise HTTPException(status_code=422, detail="Unknown generation kind")
    try:
        resp = await get_llm_client().chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": "You are the ATLANTIS AI Content Studio — a luxury real estate copywriter for the Chandigarh Tricity market. Be precise, editorial, never invent facts."},
                {"role": "user", "content": prompts[body.kind] + body.context},
            ],
        )
        return {"kind": body.kind, "output": resp.choices[0].message.content or ""}
    except Exception as e:
        logger.warning(f"AI generate failed: {e}")
        raise HTTPException(status_code=502, detail="AI generation failed. Please retry.")


# ---------------- Startup ----------------

@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.projects.create_index("slug", unique=True)
    await db.leads.create_index("status")
    await db.chat_messages.create_index("session_id")

    admin_email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if admin_email and admin_password:
        existing = await db.users.find_one({"email": admin_email})
        if existing is None:
            await db.users.insert_one({
                "id": new_id(), "email": admin_email, "password_hash": hash_password(admin_password),
                "name": "ATLANTIS Admin", "role": "super_admin", "created_at": now_iso(),
            })
            logger.info(f"Seeded admin user {admin_email}")
        elif not verify_password(admin_password, existing["password_hash"]):
            await db.users.update_one({"email": admin_email}, {"$set": {"password_hash": hash_password(admin_password)}})
            logger.info("Admin password updated from env")

    if await db.projects.count_documents({}) == 0:
        await db.projects.insert_many([dict(p) for p in PROJECTS])
        logger.info(f"Seeded {len(PROJECTS)} projects from ATLANTIS domains")
    if await db.company.count_documents({"id": "company"}) == 0:
        await db.company.insert_one(dict(COMPANY))
    if await db.settings.count_documents({"id": "global"}) == 0:
        await db.settings.insert_one(dict(SETTINGS))
    if await db.faqs.count_documents({}) == 0:
        await db.faqs.insert_many([dict(f) for f in FAQS])
    if await db.blog.count_documents({}) == 0:
        await db.blog.insert_many([{**b, "kind": b.get("kind", "blog")} for b in BLOG] + [dict(u) for u in UPDATES])
    if await db.testimonials.count_documents({}) == 0 and TESTIMONIALS:
        await db.testimonials.insert_many([dict(t) for t in TESTIMONIALS])
    if await db.team.count_documents({}) == 0:
        await db.team.insert_many([dict(t) for t in TEAM])
        logger.info(f"Seeded {len(TEAM)} team members")

    # Enrichment: SEO specifications + brochure download for every project
    for pid, specs in EXTRA_SPECS.items():
        await db.projects.update_one(
            {"id": pid, "$or": [{"specifications": {"$exists": False}}, {"specifications": {"$size": 0}}]},
            {"$set": {"specifications": specs}},
        )
    brochure_dir = ROOT_DIR / "uploads"
    async for p in db.projects.find({}, {"id": 1, "documents": 1}):
        if not p.get("documents") and (brochure_dir / f"brochure-{p['id']}.pdf").exists():
            await db.projects.update_one(
                {"id": p["id"]},
                {"$set": {"documents": [{"name": "E-Brochure", "url": f"/api/uploads/brochure-{p['id']}.pdf", "category": "BROCHURE"}]}},
            )


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()


app.include_router(api)

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
from fastapi.staticfiles import StaticFiles
app.mount("/api/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in os.environ.get("CORS_ORIGINS", "*").split(",") if o != "*"] or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
