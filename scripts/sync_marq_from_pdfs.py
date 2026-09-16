"""One-off sync: The Marq by Atlantis — data + images + PDFs from uploaded R6 brief & layout booklet."""
import os
import shutil

import pymupdf
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv("/app/backend/.env")
d = MongoClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]]
UP = "/app/backend/uploads"
R6 = "/app/tmp_pdfs/r6_rera.pdf"
BOOKLET = "/app/tmp_pdfs/marq_booklet.pdf"


def render(src, page, out, clip=None, dpi=150):
    doc = pymupdf.open(src)
    pg = doc[page - 1]
    r = pg.rect
    c = pymupdf.Rect(r.width * clip[0], r.height * clip[1], r.width * clip[2], r.height * clip[3]) if clip else None
    pg.get_pixmap(dpi=dpi, clip=c).save(f"{UP}/{out}")
    doc.close()
    print("saved", out)


render(BOOKLET, 3, "marq-hero-render.png", clip=(0.24, 0.0, 1.0, 1.0))
render(R6, 1, "marq-cover-render.png", clip=(0.0, 0.13, 1.0, 0.90))
render(R6, 5, "marq-site-plan.png")
render(R6, 8, "marq-typical-floor-plan.png")
render(R6, 9, "marq-commercial-ground-floor.png")
render(R6, 16, "marq-cluster-tower-1.png")
render(R6, 17, "marq-unit-4bhk-type-3.png")
render(R6, 31, "marq-unit-5bhk1-type-1.png")

shutil.copy(BOOKLET, f"{UP}/marq-layout-booklet.pdf")
shutil.copy(R6, f"{UP}/marq-project-brief-r6.pdf")
print("pdfs copied")

zones = [
    {"key": "residential-zone", "label": "Residential Zone", "configs": [
        {"config": "3 BHK", "price_label": "On Request", "area": "2,525 sq.ft", "availability": "AVAILABLE"},
        {"config": "4 BHK", "price_label": "On Request", "area": "2,850 sq.ft", "availability": "AVAILABLE"},
        {"config": "4+1 BHK", "price_label": "On Request", "area": "3,150 sq.ft", "availability": "AVAILABLE"},
        {"config": "5+1 BHK", "price_label": "On Request", "area": "5,050 sq.ft", "availability": "AVAILABLE"},
    ]},
    {"key": "commercial-zone", "label": "Commercial Zone", "configs": [
        {"config": "Retail Shop (Ground Floor)", "price_label": "On Request", "area": "360 – 1,604 sq.ft", "availability": "AVAILABLE"},
        {"config": "Retail Shop (Basement -1)", "price_label": "On Request", "area": "471 – 1,667 sq.ft", "availability": "AVAILABLE"},
        {"config": "SCO (G+2)", "price_label": "On Request", "area": "", "availability": "AVAILABLE"},
    ]},
]

new_images = [
    {"url": "/api/uploads/marq-hero-render.png", "alt": "The Marq by Atlantis — signature glass towers with retail boulevard, Aerocity Mohali", "category": "EXTERIOR"},
    {"url": "/api/uploads/marq-cover-render.png", "alt": "The Marq by Atlantis — dusk elevation render, PR-7 Airport Road", "category": "EXTERIOR"},
    {"url": "/api/uploads/marq-site-plan.png", "alt": "The Marq site plan — 4 towers (G+22), SCO frontage, 200 ft green-buffer road", "category": "PLANS"},
    {"url": "/api/uploads/marq-typical-floor-plan.png", "alt": "The Marq typical floor plan — 3/4/4+1/5+1 BHK unit mix", "category": "PLANS"},
    {"url": "/api/uploads/marq-commercial-ground-floor.png", "alt": "The Marq commercial ground floor plan — retail shops", "category": "PLANS"},
    {"url": "/api/uploads/marq-cluster-tower-1.png", "alt": "The Marq Tower-1 cluster plan — 4 BHK & 3 BHK, 4 to a core", "category": "PLANS"},
    {"url": "/api/uploads/marq-unit-4bhk-type-3.png", "alt": "The Marq 4 BHK (Type 3) unit plan — 2,850 sq.ft", "category": "PLANS"},
    {"url": "/api/uploads/marq-unit-5bhk1-type-1.png", "alt": "The Marq 5+1 BHK (Type 1) unit plan — 5,050 sq.ft", "category": "PLANS"},
]

update = {
    "status": "ONGOING",
    "description": ("Set upon 3.4 acres at Block B, Aerocity on PR-7 Airport Road, The Marq by Atlantis is a distinguished "
                    "mixed-use development — four G+22 towers of luxury 3, 4, 4+1 and 5+1 BHK residences rising above a "
                    "signature retail boulevard and SCO (G+2) frontage. Designed by GPM Architects & Planners, with a "
                    "double-height club, stilt parking and landscaped podium greens — minutes from Chandigarh "
                    "International Airport and IT City."),
    "city": "Mohali",
    "locality": "Block B, Aerocity",
    "address": "The Marq, PR-7 Airport Road, Block B, Aerocity, Mohali, Punjab - 140306",
    "total_area": "3.4 acres",
    "total_towers": 4,
    "floors": 22,
    "project_type": ["Apartments", "Showrooms"],
    "configs": [
        {"config": "3 BHK", "area": "2,525 sq.ft", "price_label": "On Request", "availability": "AVAILABLE"},
        {"config": "4 BHK", "area": "2,850 sq.ft", "price_label": "On Request", "availability": "AVAILABLE"},
        {"config": "4+1 BHK", "area": "3,150 sq.ft", "price_label": "On Request", "availability": "AVAILABLE"},
        {"config": "5+1 BHK", "area": "5,050 sq.ft", "price_label": "On Request", "availability": "AVAILABLE"},
    ],
    "zones": zones,
    "amenities": [
        {"name": "Double-Height Club", "group": "Clubhouse"},
        {"name": "Swimming Pool", "group": "Outdoor"},
        {"name": "Landscaped Podium Greens", "group": "Outdoor"},
        {"name": "Residents' Lounge", "group": "Clubhouse"},
        {"name": "Stilt Parking", "group": "Parking"},
        {"name": "Double Basement Parking & Services", "group": "Parking"},
        {"name": "Gated Entry/Exit — 200 ft & 164 ft Wide Road Frontage", "group": "Security"},
    ],
    "specifications": [
        {"section": "Location", "details": ["The Marq, PR-7 Airport Road, Block B, Aerocity, Mohali, Punjab - 140306", "Opposite Ambika La Parisian, near Marbella Grand"]},
        {"section": "Project Mix", "details": ["3.4 acres mixed-use development", "4 towers · G+22 floors", "Residences: 3/4/4+1/5+1 BHK (2,525 – 5,050 sq.ft)", "Retail shops (GF & Basement -1) + SCOs (G+2)"]},
        {"section": "Design & Architecture", "details": ["Architect: GPM Architects & Planners, New Delhi", "Double-height club & entrance lobbies", "1830 mm wide balconies", "Stilt + double basement parking"]},
        {"section": "Connectivity", "details": ["5 min to Chandigarh International Airport", "10 min to IT City / Infosys campus", "5 min to Amity University"]},
        {"section": "Status", "details": ["Ongoing — under development by Atlantis Group", "RERA registration: being updated"]},
    ],
    "placeholders": ["rera_number", "pricing"],
    "seo": {
        "title": "The Marq by Atlantis — 3/4/5 BHK & Retail at Aerocity, PR-7 Airport Road Mohali | Ongoing",
        "description": "Ongoing mixed-use landmark by Atlantis at Block B, Aerocity, PR-7 Airport Road, Mohali. 3/4/4+1/5+1 BHK residences (2,525–5,050 sq.ft) + retail & SCOs across 4 G+22 towers on 3.4 acres. 5 min from Chandigarh International Airport.",
        "keywords": "the marq atlantis, aerocity mohali flats, airport road mohali, 4 bhk aerocity, sco mohali",
    },
}

r = d.projects.update_one(
    {"slug": "the-marq-by-atlantis"},
    {"$set": update,
     "$push": {"images": {"$each": new_images},
               "documents": {"$each": [
                   {"name": "The Marq — Layout Booklet (PDF)", "url": "/api/uploads/marq-layout-booklet.pdf", "category": "BROCHURE"},
                   {"name": "The Marq — Project Brief R6, May 2026 (PDF)", "url": "/api/uploads/marq-project-brief-r6.pdf", "category": "BROCHURE"},
               ]}}},
)
print("db updated:", r.modified_count)
print("rera_number left as:", d.projects.find_one({"slug": "the-marq-by-atlantis"}, {"_id": 0, "rera_number": 1}))
