"""Generate branded one-page e-brochure PDFs for every ATLANTIS project."""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas

OUT = "/app/backend/uploads"
os.makedirs(OUT, exist_ok=True)

NAVY = HexColor("#050B14")
NAVY2 = HexColor("#101B2E")
GOLD = HexColor("#D4AF37")
CHAMPAGNE = HexColor("#F3E5AB")
SLATE = HexColor("#94A3B8")
WHITE = HexColor("#F8FAFC")

PROJECTS = [
    ("atlantis-three-sixty", "Atlantis Three Sixty", "Zirakpur's most coveted ready-to-move address",
     "PR-7 Airport Road, Zirakpur", "ONGOING · POSSESSION MARCH 2026", "Price on Request",
     ["3 BHK · 3+1 BHK · 4+1 BHK Residences", "Penthouses up to 5,320 sq.ft", "16 premium retail units (Basement-01)", "RERA: PBRERA-SAS79-PR1159"]),
    ("the-marq-by-atlantis", "The Marq by Atlantis", "A new landmark rising on Airport Road, Mohali",
     "Sector 82, Airport Road, Mohali", "UPCOMING", "Price on Request",
     ["5 min to Chandigarh International Airport", "10 min to IT City / Infosys", "5 min to Amity University"]),
    ("atlantis-central-park", "Atlantis Central Park", "Rising 22 floors above Aerocity",
     "Block-1, Aerocity, SAS Nagar Mohali", "UPCOMING", "Price on Request",
     ["Signature 4 BHK residences · Tower B", "Opposite Aerovista", "8 min to Chandigarh International Airport"]),
    ("atlantis-grand", "Atlantis Grand", "Low-density luxury on High Ground Road",
     "High Ground Road, Zirakpur", "ONGOING · POSSESSION 2026", "From Rs 1.44 Cr.",
     ["3 BHK luxury residences & Sky Villas", "7+ acres · 11 towers · Mivan construction", "~30% lush greenery · 33-storey RCC standard", "Premium clubhouse, pool, spa & sports arena"]),
    ("atlantis-heights", "Atlantis Heights", "Zirakpur's first sky walk — forest-facing living",
     "Zirakpur", "NEW LAUNCH", "From Rs 1.53 Cr.",
     ["2 & 3 BHK forest-facing homes", "Zirakpur's first elevated sky walk", "65+ acres of surrounding greenery"]),
    ("atlantis-at-wave", "Atlantis at Wave", "Stylish homes in a prime area",
     "Zirakpur", "DELIVERED JULY 2021", "Sold Out",
     ["Completed & handed over July 2021", "Fully sold out", "Proof of the Atlantis delivery promise"]),
]

W, H = A4
for pid, name, tagline, location, status, price, bullets in PROJECTS:
    c = canvas.Canvas(os.path.join(OUT, f"brochure-{pid}.pdf"), pagesize=A4)
    c.setTitle(f"{name} — E-Brochure | ATLANTIS")
    c.setFillColor(NAVY)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setStrokeColor(GOLD)
    c.setLineWidth(2)
    c.rect(14 * mm, 14 * mm, W - 28 * mm, H - 28 * mm, fill=0, stroke=1)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(W / 2, H - 32 * mm, "A T L A N T I S")
    c.setFillColor(SLATE)
    c.setFont("Helvetica", 8)
    c.drawCentredString(W / 2, H - 38 * mm, "G R O U P")
    c.setFillColor(WHITE)
    c.setFont("Times-Roman", 34)
    c.drawCentredString(W / 2, H - 80 * mm, name)
    c.setFillColor(CHAMPAGNE)
    c.setFont("Times-Italic", 15)
    c.drawCentredString(W / 2, H - 92 * mm, tagline)
    c.setFillColor(SLATE)
    c.setFont("Helvetica", 11)
    c.drawCentredString(W / 2, H - 106 * mm, location)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 12)
    c.drawCentredString(W / 2, H - 122 * mm, status)
    c.setFillColor(WHITE)
    c.setFont("Times-Roman", 20)
    c.drawCentredString(W / 2, H - 138 * mm, price)
    y = H - 168 * mm
    c.setFillColor(NAVY2)
    c.roundRect(30 * mm, y - 14 * mm, W - 60 * mm, 14 * mm + 9 * mm * len(bullets), 4, fill=1, stroke=0)
    c.setFont("Helvetica", 11)
    for b in bullets:
        c.setFillColor(GOLD)
        c.drawString(38 * mm, y, "*")
        c.setFillColor(WHITE)
        c.drawString(46 * mm, y, b)
        y -= 9 * mm
    c.setFillColor(CHAMPAGNE)
    c.setFont("Helvetica-Bold", 11)
    c.drawCentredString(W / 2, 52 * mm, "Call +91 97083 97083  ·  WhatsApp +91 96078 96078")
    c.setFillColor(SLATE)
    c.setFont("Helvetica", 7.5)
    c.drawCentredString(W / 2, 42 * mm, "This e-brochure is published for marketing & promotional purposes by QUALITY REAL ESTATE,")
    c.drawCentredString(W / 2, 37 * mm, "authorised channel partner of ATLANTIS — qualityrealestate.in. Details indicative; verify with Punjab RERA.")
    c.showPage()
    c.save()
    print(f"brochure-{pid}.pdf")
print("done")
