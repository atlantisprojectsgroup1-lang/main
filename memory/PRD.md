# ATLANTIS — Real Estate Developer & Promoter Platform — PRD

## Original Problem Statement
Production-ready, SEO-optimized, AI-assisted platform for ATLANTIS (real estate developer & promoter, Chandigarh Tricity) with public site, admin CMS, CRM, lead automation, AI features and content synced from atlantisprojects.in, atlantisgroup.in, atlantisgroup.info. User approved React + FastAPI + MongoDB stack (SEO via react-helmet-async, JSON-LD, sitemap, robots.txt instead of Next.js SSR).

## User Personas
- HNI / luxury homebuyer browsing projects, comparing configs, enquiring
- Investor / channel partner
- Super Admin (atlantisprojectsgroup@gmail.com) managing CMS + CRM
- Sales team working the lead pipeline

## Architecture
- Frontend: React 19 + Tailwind + framer-motion + react-helmet-async (SEO) + recharts. Routes: /, /projects, /projects/:slug, /portfolio, /about, /blog, /blog/:slug, /contact, /admin/* (login, dashboard, projects CMS, CRM kanban, AI studio, settings)
- Backend: FastAPI + MongoDB (motor), JWT cookie/bearer auth with bcrypt + brute-force lockout, SSE-streamed AI chat, AI lead scoring (background task), AI content studio. LLM calls use the official `openai` SDK (openai==1.99.9): defaults to EMERGENT_LLM_KEY via Emergent proxy (https://integrations.emergentagent.com/llm, model gpt-5.4); on external hosts (Vercel) set OPENAI_API_KEY (+ optional LLM_MODEL, LLM_BASE_URL) and the same code uses real OpenAI — no emergentintegrations/litellm dependencies (removed for Vercel PyPI-only builds)
- Seeded from real scraped data: 6 projects (Three Sixty, The Marq, Central Park, Grand, Heights, at Wave), company profile, 5 leadership profiles, 10 design partners, 3 FAQs, 6 blog posts, Grand specs/amenities/landmarks

## Implemented (June 12, 2026)
- Vercel build fix: removed `emergentintegrations==0.2.0` (private index package, unresolvable on Vercel) and the private litellm wheel URL from requirements.txt; rewrote all 3 AI call sites (chat SSE stream, lead scoring, Content Studio) in server.py to the official `openai` SDK with a lazy shared AsyncOpenAI client (env-driven: OPENAI_API_KEY > EMERGENT_LLM_KEY, LLM_MODEL default gpt-5.4). Verified: chat streams tokens, lead scored HOT with reason, AI generate returns alt text. Vercel env needed: MONGO_URL, DB_NAME, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, OPENAI_API_KEY (else AI features degrade gracefully to 503/fallback)
- Brand sync update: real ATLANTIS wordmark logo (from atlantisgroup.in) in header + footer, brand favicon, hero headings bumped to medium/semibold weight
- Header + footer nav: About Us, Contact Us, Privacy Policy (/privacy-policy), Booking & Cancellation Policy (/booking-cancellation-policy) — both policy pages live
- Social connect links in footer (Instagram + LinkedIn synced from atlantisgroup.in; Facebook/YouTube editable in Admin → Settings → Social Media Links)
- Footer credit: "designed, published and managed by authorised channel partner QUALITY REAL ESTATE" linking to https://qualityrealestate.in/
- WhatsApp float redesigned: 3D black-gold sphere emblem (/assets/wa-3d-black-gold.jpg, AI-generated), stacked directly above the AI Concierge pill bottom-right; concierge drawer repositioned to avoid overlap
- Home hero search bar removed → replaced with Enquire Now (opens popup) + Explore Residences CTAs
- EnquiryPopup: auto-opens once per session (~1.8s after first visit), ATLANTIS logo on top, project + budget filter selects, posts lead with source=enquiry_popup (verified end-to-end)
- Hot Selling Properties section on home (is_hot_selling projects) with red-accent styling; hot badges on cards now crimson
- Red theme layer: crimson accents (hero gradient tint, popup strip, hot section glow, scrollbar, selection, button hover glow) over the navy-gold base
- Home hero is now an auto-rotating image slider: crossfades through all 21 project images every 5s, with a "Now Showcasing" caption chip (links to the project) and click-to-jump progress dots; falls back to the static hero image before projects load
- Per-project logo system: admin editor has Upload & Crop (react-easy-crop modal → canvas → 512×512 PNG with transparent background preserved → POST /api/admin/upload → stored in /app/backend/uploads, served at /api/uploads/*) plus paste-URL fallback and remove; logo renders on project cards (top-right) and project detail hero. Verified end-to-end (UI crop→upload→save→public display; API 401s without auth)
- Red theme washes reverted (user feedback): hero crimson overlay, hot-selling red glow/bar, popup red strip, red scrollbar/selection/button-glow, About builder-profile red radial all removed — back to clean navy-gold; small crimson Hot Selling badge retained on cards
- "TRICITY" removed from hero area: header logo sublabel now reads "GROUP", hero eyebrow reads "Premium Residences · Chandigarh" (verified via DOM + screenshot)
- Header Enquire button now opens the enquiry popup (desktop + mobile) instead of navigating to Contact; popup form has Project + Property Type + Budget selects, name/phone/email/message — verified end-to-end (lead stored with email + config_interest)
- AI Concierge: floating toggle morphs to a gold X "Close" when the chat is open (plus existing in-drawer X)
- Coverflow slides restyled: rounded corners (rounded-2xl) + red-gold gradient outline (135deg crimson→gold→champagne border via border-box trick) on home and project detail showcases; auto 2.8s, transition 0.55s
- Red-gold .img-frame (rounded 16px gradient border) applied site-wide: project cards, category tiles, gallery/video thumbs, blog covers, team photos, milestone images
- Project detail: media sections moved to top (Showcase → Gallery → Videos → Overview…), subnav reordered to match; showcase now renders for single-image projects and includes video slides (YouTube thumb/MP4, click opens player modal)
- Blogs & Daily Updates: blog collection extended with kind/platform/external_url; home + /blog have All/Blogs/Daily Updates tabs; updates can link to social posts; Admin → Blogs & Updates page (create/edit/delete, cover upload); seeded 2 factual updates; fixed pre-filter slice bug on home
- Locations map on home (react-leaflet + Esri dark-gray tiles, gold-red pins for 6 pinned projects, popups link to projects; lat/lng editable in project editor)
- SEO specs + brochures for ALL projects: EXTRA_SPECS enrichment at backend startup (every project now has specification sections; Grand has full scraped specs) + branded e-brochure PDFs generated via reportlab (/app/scripts/make_brochures.py → /api/uploads/brochure-<id>.pdf), auto-attached as documents — Brochures & Downloads section now live on every project page
- Number format normalized to "+91 9041795879" everywhere (display strings in code, DB phones/office/FAQ, brochure PDFs regenerated); iteration 6 testing: 35/35 passed — mobile dialer bug verified fixed, contact sweep verified
- Mobile direct-call fix: gold dialer icon button (header-call-btn-mobile) now visible in the mobile header bar next to hamburger, tel:+919041795879; hamburger menu also carries the call link; Contact SEO description updated
- Global contact update: all phone numbers → +91 90417 95879, email → support@atlantisprojectsgroup.com, website https://atlantisprojectsgroup.com stored on company doc, office address → Atlantis Corporate Office, Sector 82A, Mohali — applied across DB (company/settings/faqs), seed data, chatbot, header/footer/contact/about/policy pages (Contact sections added to Terms/Payment/Booking policies), WhatsApp float number, and regenerated e-brochure PDFs
- Dual-zone projects: projects support Residential Zone + Commercial Zone published in parallel on the same page — zone tabs above the inline inventory table (Atlantis Three Sixty live with both zones); zones editable in admin project editor (Zone Label | Config | Price | Area per line); mixed-use cards show "Residential + Commercial" eyebrow
- Inventory table moved INTO the Overview left column (compact sizing) — fills the black gap next to the RERA/EMI/builder sidebar; standalone Inventory section removed; Downloads sits after the ticker
- Project detail: moving TickerBar (marquee, gold serif, pause on hover) fills the gap between Overview and Inventory; Downloads section moved after Inventory
- Iteration 4: initial report flagged dynamic subnav as missing — stale-bundle artifact; live re-verified (grand: Showcase/Overview/Amenities/Specs/Location/FAQs/Enquire; wave: Showcase/Overview/Location/FAQs/Enquire, 100% anchor integrity); FAQs section got scroll-mt-32; retest dispatched for independent confirmation. The 2 console 401s are the benign guest /api/auth/me probe (StrictMode double-effect)
- Project detail: separate "Gallery/Imagery" section deleted — the 3D Showcase ("A Closer Look") is now the single image+video showcase (auto-scroll 2.8s + manual drag/arrows/dots); sticky subnav is now dynamic (only shows sections that have data, per iteration-3 report); home coverflow heading now "Multiple Addresses. One Standard \"Quality\""
- Iteration 3 testing: 100% (backend 35/35, frontend 8/8 flows) — showcase bug fix, map pins, updates CRUD incl. cleanup, lat/lng editor all verified coverflow fix verified, email popup field, header call btn, videos/documents sections + PDF upload, READY_TO_MOVE status, tile images, GROUP label — all green; filter "- All" labels renamed to plain Category/City/Property Type; coverflow sped up (auto 2.8s, transition 0.55s)
- Projects filter bar simplified: status tabs + Category + City + Property Type (Configuration/Budget/Search removed); backend `/api/projects` now filters by `ptype` against project_type, `/api/projects/meta/filters` returns cities + types; URL-persisted (?ptype=Villas) — verified backend + mobile UI
- Public site: cinematic hero + quick search, animated stats, 3D coverflow showcase (auto-scroll, drag, keyboard, infinite loop), status tabs, category tiles, why-ATLANTIS, milestones, blog teasers, enquiry CTAs
- Projects listing: URL-persisted filters (status/category/city/config/budget/search), empty state
- Project detail: sticky subnav, 3D showcase, gallery + lightbox, inventory/price table, EMI calculator, RERA block, landmarks, FAQs, similar projects, enquiry form, JSON-LD
- About, Delivered Portfolio, Blog (+detail), Contact pages
- Admin: JWT login (super_admin), dashboard (funnel/score/source charts + recent leads), Projects CRUD editor, CRM kanban (7 stages, drawer, notes, AI rescore), AI Content Studio (description/SEO/alt/WhatsApp/blog), Settings (brand + integration IDs)
- AI: concierge chatbot (RAG over project DB, SSE streaming), lead scoring (HOT/WARM/COLD, background), content studio
- SEO: per-page meta/OG/canonical, JSON-LD (RealEstateAgent/Residence/Article), /api/sitemap.xml, robots.txt
- Integration config fields: WhatsApp number/prefill (float button LIVE via wa.me), Cloud API token, Meta Pixel, GA4 (auto-injects when ID saved), GTM, Cloudinary, SMTP

## Test Status
- Iteration 1: backend 29/29 pytest, frontend 16/16 Playwright — all green
- Fixed post-test: combined search+budget filter ($and merge); lead scoring moved to background (instant form response)
- TEST_ prefixed leads from testing remain in CRM (harmless)

## Backlog (Prioritized)
- P0: Wire live WhatsApp Cloud API (auto-reply, brochure delivery, OTP) once user pastes credentials; paste Meta Pixel/GA4/GTM IDs in Settings
- P1: Map view on /projects; project Compare (up to 4); media upload via object storage + gated PDF downloads; landing pages builder /lp/<slug>; testimonials/FAQ/blog admin UI; inventory availability matrix; 301 redirect manager
- P2: Meta/Google lead-ad webhooks, drip campaigns, round-robin assignment, channel partner portal, NRI corner, careers, multilingual (hi), voice search, CSV import/export, version history, role management UI
