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
- Backend: FastAPI + MongoDB (motor), JWT cookie/bearer auth with bcrypt + brute-force lockout, SSE-streamed AI chat (Emergent LLM key, gpt-5.4), AI lead scoring (background task), AI content studio
- Seeded from real scraped data: 6 projects (Three Sixty, The Marq, Central Park, Grand, Heights, at Wave), company profile, 5 leadership profiles, 10 design partners, 3 FAQs, 6 blog posts, Grand specs/amenities/landmarks

## Implemented (June 12, 2026)
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
- Iteration 2 testing (35/35 backend, all frontend flows): coverflow fix verified, email popup field, header call btn, videos/documents sections + PDF upload, READY_TO_MOVE status, tile images, GROUP label — all green; filter "- All" labels renamed to plain Category/City/Property Type; coverflow sped up (auto 2.8s, transition 0.55s)
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
