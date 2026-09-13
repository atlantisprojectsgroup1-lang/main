"""Seed data scraped from atlantisprojects.in, atlantisgroup.in, atlantisgroup.info.
Gaps are marked in each record's `placeholders` list — editable in admin, never invented on the public site."""

COMPANY = {
    "id": "company",
    "legal_name": "Atlantis Group",
    "brand_name": "ATLANTIS",
    "tagline": "Building Tomorrow's Landmarks",
    "about_long": (
        "Atlantis Group is a pioneering real estate development firm with a vision to redefine luxury living. "
        "Specialising in premium residential, commercial and mixed-use developments across the Chandigarh Tricity — "
        "Mohali, Zirakpur and Aerocity — the group is known for its innovative approach, commitment to quality and a "
        "strong belief in sustainability. Atlantis builds low-density, with precision, and to last: every project is "
        "RERA registered and shaped by a consortium of leading architects, landscape designers and structural engineers."
    ),
    "vision": "To build the addresses people aspire to — premium living in Tricity delivered to a higher standard.",
    "mission": "Low-density design. RERA compliance, always. Prime connectivity. A consortium of excellence on every project.",
    "founded_year": 2016,
    "milestones": [
        {"year": 2016, "title": "Atlantis Group Established", "description": "Founded with a vision to redefine luxury living in the Tricity region.", "image": ""},
        {"year": 2021, "title": "Atlantis at Wave Delivered", "description": "Stylish homes in a prime Zirakpur location handed over in July 2021.", "image": "https://atlantisgroup.in/assets/images/wave/renders/atlantis-at-wave.webp"},
        {"year": 2026, "title": "Atlantis Three Sixty Possession", "description": "Zirakpur's most coveted ready-to-move address at PR-7 Airport Road reaches possession.", "image": "https://atlantisprojects.in/wp-content/uploads/2026/05/23_00105-1024x576.jpg"},
    ],
    "certifications": [
        {"name": "Punjab RERA Registered", "detail": "Every project registered with Punjab Real Estate Regulatory Authority. Full transparency from booking to possession."},
        {"name": "RERA No. PBRERA-SAS79-PR1159", "detail": "Atlantis Three Sixty, PR-7 Airport Road, Zirakpur."},
    ],
    "leadership": [
        {"name": "Ar. Vishwas Chadha", "designation": "Director", "photo": "https://atlantisgroup.in/assets/images/leadership/vishwas-chadha-home.jpg", "bio": "Guides the larger direction of the company, shaping each address through design clarity, market understanding and a long-view approach to development. TEDx Sukhna Lake speaker.", "linkedin": ""},
        {"name": "Pardeep Chadha", "designation": "Director Sales", "photo": "https://atlantisgroup.in/assets/images/leadership/pardeep-chadha.jpg", "bio": "Over 30 years in real estate, shaping sales strategy, client relationships and successful project launches.", "linkedin": ""},
        {"name": "Amarjit Singh", "designation": "Director of Marketing", "photo": "https://atlantisgroup.in/assets/images/leadership/amarjit-singh.jpg", "bio": "An industrialist with India and UAE experience, guiding branding, market expansion and investor confidence.", "linkedin": ""},
        {"name": "CA Mohinder Pal Satija", "designation": "Director Accounts & Finance", "photo": "https://atlantisgroup.in/assets/images/leadership/mohinder-pal-satija.jpg", "bio": "Leads accounts and finance with multinational experience across India and Japan.", "linkedin": ""},
        {"name": "Jasbir Singh", "designation": "Director of Construction", "photo": "https://atlantisgroup.in/assets/images/leadership/jasbir-singh.jpg", "bio": "Brings construction precision and landmark delivery experience to Atlantis Group developments.", "linkedin": ""},
    ],
    "design_partners": ["Ar. Tripat", "Subah & Associates", "Oracle Landscape", "Designing Earth", "BARAQ", "RREN Consultants & Contractors", "Arete Design Studio", "AIMS", "Bobby Mukherrji Architects", "GPM Architects and Planners"],
    "awards": [],
    "offices": [
        {"name": "Corporate Office — Zirakpur", "address": "Office No. 25, 3rd Floor, Uptown Insignia, Airport Road", "city": "Zirakpur, Punjab 140603", "phone": "+91 97083 97083", "email": "", "map_lat": None, "map_lng": None, "google_maps_url": ""},
    ],
    "social_links": [
        {"name": "Instagram", "url": "https://www.instagram.com/atlantisgroup.in/"},
        {"name": "LinkedIn", "url": "https://www.linkedin.com/company/atlantisgroup-in/"},
        {"name": "Facebook", "url": ""},
        {"name": "YouTube", "url": ""},
    ],
    "builder": {
        "focus": "Luxury Residential & Commercial",
        "regions": "Mohali · Zirakpur · Aerocity",
        "rera_note": "Every project registered with Punjab RERA",
        "delivery_promise": "On-time handover, transparent pricing, consortium-built quality",
    },
    "phones": {"primary": "+91 97083 97083", "sales": "+91 96078 96078"},
    "stats": {"total_projects": 6, "luxury_residences": 500, "prime_locations": 3, "design_partners": 6},
    "placeholders": ["social_links", "awards", "office email", "office geo-coordinates"],
}

AMENITIES_GRAND = [
    {"name": "Premium Clubhouse", "group": "Lifestyle"}, {"name": "Swimming Pool (Adult & Kids)", "group": "Lifestyle"},
    {"name": "Spa & Wellness Center", "group": "Lifestyle"}, {"name": "Restaurant / Café", "group": "Lifestyle"},
    {"name": "Terrace Café", "group": "Lifestyle"}, {"name": "Banquet Hall", "group": "Lifestyle"},
    {"name": "Multi-purpose Event Spaces", "group": "Lifestyle"}, {"name": "Guest Waiting Area", "group": "Lifestyle"},
    {"name": "Gymnasium", "group": "Sports"}, {"name": "Multi-purpose Sports Court", "group": "Sports"},
    {"name": "Yoga / Meditation Center", "group": "Sports"},
    {"name": "24/7 Security", "group": "Safety"}, {"name": "High-Tech Security Systems", "group": "Safety"},
    {"name": "Automated Gate Entry", "group": "Safety"},
    {"name": "Lush Green Parks", "group": "Green"}, {"name": "Pet Zone", "group": "Green"},
    {"name": "Children's Play Area", "group": "Convenience"}, {"name": "Indoor Playrooms", "group": "Convenience"},
    {"name": "Crèche / Daycare Facilities", "group": "Convenience"}, {"name": "High-Speed Elevators", "group": "Convenience"},
    {"name": "Drivers Dormitory", "group": "Convenience"},
]

SPECS_GRAND = [
    {"section": "Structure", "details": ["33-Storey Earthquake-Resistant RCC Structure", "Mivan Formwork Technology (Malaysian Construction System)", "Selective Brickwork for Enhanced Strength & Durability"]},
    {"section": "Kitchen", "details": ["Premium Modular Kitchen & Branded Appliances", "High-Quality Flooring & Dado Finish", "Luxury Wall & Ceiling Finishes"]},
    {"section": "Bathrooms", "details": ["Branded CP & Sanitary Fittings", "Luxury Shower & Vanity Setup", "Designer Finishes & Ventilation"]},
    {"section": "Doors & Windows", "details": ["Grand 8 Ft. High Flush Doors", "Wide Designer Door Frames", "Premium Aluminum Windows"]},
    {"section": "Electrical", "details": ["Concealed Electrical Wiring", "Complete Connectivity Provision", "Premium Safety & Switchgear"]},
    {"section": "Smart Features", "details": ["Smart Home Ready", "Video Door Phone", "High-Speed Internet Ready"]},
    {"section": "Balcony", "details": ["Anti-Skid Balcony Flooring", "Designer Handrails & Enclosures", "Weather-Proof Ceiling & Utility Provisions"]},
    {"section": "Entrance Lobby", "details": ["Grand Air-Conditioned Lobby", "Luxury Flooring Finishes", "Premium Wall & Ceiling Treatment"]},
    {"section": "Bedrooms", "details": ["Luxury Modular Wardrobes", "Premium Bedroom Flooring", "Designer Wall & Ceiling Finishes"]},
    {"section": "Lifts", "details": ["Dedicated Service Elevator", "Three Passenger Elevators", "Premium Elevator Brands"]},
    {"section": "Staircases", "details": ["Granite Stair Finish", "6 Ft. Wide Grand Staircases", "Premium Handrails & Finishes"]},
    {"section": "Supplements", "details": ["All-Weather VRV Air Conditioning", "Advanced Safety Systems", "Premium Comfort Fixtures"]},
]

PROJECTS = [
    {
        "id": "atlantis-three-sixty", "name": "Atlantis Three Sixty", "slug": "atlantis-three-sixty",
        "tagline": "Zirakpur's most coveted ready-to-move address",
        "description": "Zirakpur's most coveted ready-to-move address — where every apartment opens to light, space, and a life well-chosen. Low-density towers of 3 BHK, 3+1 BHK, 4+1 BHK residences and penthouses up to 5,320 sq.ft, with 16 premium retail units in Basement-01 connected directly to the residential tower lobbies and multi-level parking.",
        "status": "ONGOING", "category": "RESIDENTIAL", "project_type": ["Apartments", "Showrooms"],
        "rera_number": "PBRERA-SAS79-PR1159", "rera_qr_image": "",
        "city": "Zirakpur", "locality": "PR-7 Airport Road", "address": "PR 7 International Airport Road, Zirakpur, Punjab 140603",
        "total_area": "", "total_towers": 5, "floors": None, "possession": "March 2026", "completion_percentage": None,
        "price_from": None, "price_label": "Price on Request", "price_on_request": True, "currency": "INR",
        "configs": [
            {"config": "3 BHK", "area": "", "price_label": "On Request", "availability": "AVAILABLE"},
            {"config": "3+1 BHK", "area": "", "price_label": "On Request", "availability": "AVAILABLE"},
            {"config": "4+1 BHK", "area": "", "price_label": "On Request", "availability": "FEW_LEFT"},
            {"config": "Penthouse", "area": "up to 5,320 sq.ft", "price_label": "On Request", "availability": "FEW_LEFT"},
            {"config": "Retail Unit (Basement-01)", "area": "805 – 1,686 sq.ft", "price_label": "On Request", "availability": "AVAILABLE"},
        ],
        "images": [
            {"url": "https://atlantisprojects.in/wp-content/uploads/2026/05/23_00105-1024x576.jpg", "alt": "Atlantis Three Sixty residences, PR-7 Airport Road Zirakpur", "category": "EXTERIOR"},
        ],
        "amenities": [
            {"name": "Low-Density Towers", "group": "Lifestyle"}, {"name": "Multi-Level Parking", "group": "Convenience"},
            {"name": "Premium Retail at Doorstep", "group": "Convenience"}, {"name": "Landscaped Greens", "group": "Green"},
            {"name": "Advanced Security Systems", "group": "Safety"},
        ],
        "specifications": [],
        "landmarks": [
            {"name": "Chandigarh International Airport", "distance": "10 min", "type": "airport"},
            {"name": "NH-44 Expressway", "distance": "5 min", "type": "highway"},
            {"name": "Schools, Hospitals & Commercial Hubs", "distance": "Close by", "type": "convenience"},
        ],
        "featured": True, "is_hot_selling": True, "sort_order": 1,
        "source": "atlantisprojects.in",
        "placeholders": ["total_area", "floors", "pricing", "gallery", "specifications", "rera_qr_image"],
        "seo": {"title": "Atlantis Three Sixty — 3/4 BHK Luxury Residences, PR-7 Airport Road Zirakpur", "description": "RERA-registered (PBRERA-SAS79-PR1159) low-density luxury residences at PR-7 Airport Road, Zirakpur. 3 BHK, 3+1, 4+1 BHK & penthouses up to 5,320 sq.ft. Possession March 2026.", "keywords": "3 bhk zirakpur, luxury flats airport road, atlantis three sixty"},
    },
    {
        "id": "the-marq-by-atlantis", "name": "The Marq by Atlantis", "slug": "the-marq-by-atlantis",
        "tagline": "A new landmark rising on Airport Road, Mohali",
        "description": "Coming soon to Sector 82, Airport Road, Mohali — The Marq by Atlantis brings the group's uncompromising standard to one of Tricity's fastest-appreciating corridors, minutes from Chandigarh International Airport and the IT City.",
        "status": "UPCOMING", "category": "RESIDENTIAL", "project_type": ["Apartments"],
        "rera_number": "", "rera_qr_image": "",
        "city": "Mohali", "locality": "Sector 82, Airport Road", "address": "B Block, Airport Road, Sector 82, Mohali",
        "total_area": "", "total_towers": None, "floors": None, "possession": "Coming Soon", "completion_percentage": None,
        "price_from": None, "price_label": "Price on Request", "price_on_request": True, "currency": "INR",
        "configs": [],
        "images": [
            {"url": "https://atlantisprojects.in/wp-content/uploads/2026/05/image2-1024x678.jpg", "alt": "The Marq by Atlantis, Sector 82 Mohali", "category": "EXTERIOR"},
        ],
        "amenities": [],
        "specifications": [],
        "landmarks": [
            {"name": "Chandigarh International Airport", "distance": "5 min", "type": "airport"},
            {"name": "IT City / Infosys Campus", "distance": "10 min", "type": "employment"},
            {"name": "Amity University", "distance": "5 min", "type": "education"},
            {"name": "Ambika La Parisian & Marbella Grand", "distance": "Opposite / nearby", "type": "landmark"},
        ],
        "featured": True, "is_hot_selling": False, "sort_order": 2,
        "source": "atlantisprojects.in",
        "placeholders": ["rera_number", "configurations", "pricing", "amenities", "specifications", "gallery"],
        "seo": {"title": "The Marq by Atlantis — Sector 82, Airport Road Mohali | Coming Soon", "description": "Upcoming premium residences by Atlantis at Sector 82, Airport Road, Mohali. 5 min from Chandigarh International Airport, 10 min from IT City.", "keywords": "the marq atlantis, sector 82 mohali flats, airport road mohali"},
    },
    {
        "id": "atlantis-central-park", "name": "Atlantis Central Park", "slug": "atlantis-central-park",
        "tagline": "Rising 22 floors above Aerocity",
        "description": "Coming soon to Block-1, Aerocity, SAS Nagar Mohali — Atlantis Central Park is a high-growth investment corridor address opposite Aerovista, with signature 4 BHK residences in Tower B rising 22 floors above Aerocity. The view is not incidental — it is a feature you will use every morning.",
        "status": "UPCOMING", "category": "RESIDENTIAL", "project_type": ["Apartments"],
        "rera_number": "", "rera_qr_image": "",
        "city": "Mohali", "locality": "Aerocity, Block-1", "address": "Adjoining Block-1, Aerocity, SAS Nagar, Mohali",
        "total_area": "", "total_towers": None, "floors": 22, "possession": "Coming Soon", "completion_percentage": None,
        "price_from": None, "price_label": "Price on Request", "price_on_request": True, "currency": "INR",
        "configs": [
            {"config": "4 BHK (Tower B)", "area": "", "price_label": "On Request", "availability": "AVAILABLE"},
        ],
        "images": [
            {"url": "https://atlantisprojects.in/wp-content/uploads/2026/05/central1.jpg", "alt": "Atlantis Central Park, Aerocity Mohali", "category": "EXTERIOR"},
        ],
        "amenities": [],
        "specifications": [],
        "landmarks": [
            {"name": "Aerovista", "distance": "Opposite", "type": "landmark"},
            {"name": "Chandigarh International Airport", "distance": "8 min", "type": "airport"},
            {"name": "High-Growth Investment Corridor", "distance": "—", "type": "investment"},
        ],
        "featured": True, "is_hot_selling": False, "sort_order": 3,
        "source": "atlantisprojects.in",
        "placeholders": ["rera_number", "total_towers", "pricing", "amenities", "specifications", "gallery"],
        "seo": {"title": "Atlantis Central Park — 4 BHK Residences, Aerocity Mohali | Coming Soon", "description": "Upcoming 4 BHK residences at Block-1 Aerocity, Mohali. Tower B rising 22 floors, 8 min from Chandigarh International Airport.", "keywords": "atlantis central park, aerocity mohali, 4 bhk mohali"},
    },
    {
        "id": "atlantis-grand", "name": "Atlantis Grand", "slug": "atlantis-grand",
        "tagline": "Low-density luxury on High Ground Road — Possession 2026",
        "description": "Atlantis Grand is a premium residential community on a 110 ft. prime road at High Ground Road, Zirakpur. Spread over 7+ acres of 100% owned land with 11 beautifully designed towers, ~30% lush greenery and Mivan formwork construction, it offers 3 BHK luxury residences and Sky Villas built to a 33-storey earthquake-resistant RCC standard — from ₹1.44 Cr.",
        "status": "ONGOING", "category": "RESIDENTIAL", "project_type": ["Apartments", "Villas"],
        "rera_number": "", "rera_qr_image": "",
        "city": "Zirakpur", "locality": "High Ground Road", "address": "High Ground Road, Zirakpur, Punjab",
        "total_area": "7+ acres", "total_towers": 11, "floors": 33, "possession": "2026", "completion_percentage": None,
        "price_from": 14400000, "price_label": "From ₹1.44 Cr.", "price_on_request": False, "currency": "INR",
        "configs": [
            {"config": "3 BHK (Category 1)", "area": "", "price_label": "From ₹1.44 Cr.", "availability": "AVAILABLE"},
            {"config": "4 BHK (Category 2)", "area": "", "price_label": "On Request", "availability": "AVAILABLE"},
            {"config": "5 BHK Sky Villa (Category 3)", "area": "", "price_label": "On Request", "availability": "FEW_LEFT"},
        ],
        "images": [
            {"url": "https://atlantisgroup.in/assets/images/grand/renders/grand-day-front.webp", "alt": "Atlantis Grand arrival court and residential towers, High Ground Road Zirakpur", "category": "EXTERIOR"},
            {"url": "https://atlantisgroup.in/assets/images/grand/renders/grand-aerial.webp", "alt": "Atlantis Grand aerial view — low-density living", "category": "DRONE"},
            {"url": "https://atlantisgroup.in/assets/images/grand/renders/grand-arrival-night.webp", "alt": "Atlantis Grand arrival experience at night", "category": "EXTERIOR"},
        ],
        "amenities": AMENITIES_GRAND,
        "specifications": SPECS_GRAND,
        "landmarks": [
            {"name": "International Airport", "distance": "20 min", "type": "airport"},
            {"name": "EuroKids Preschool", "distance": "22 min", "type": "school"},
            {"name": "Zirakpur Bus Stand", "distance": "14 min", "type": "transport"},
            {"name": "Mohali City Centre", "distance": "14 min", "type": "mall"},
            {"name": "D Mart", "distance": "14 min", "type": "mall"},
            {"name": "Decathlon Sports", "distance": "15 min", "type": "sports"},
        ],
        "featured": True, "is_hot_selling": True, "sort_order": 4,
        "source": "atlantisgroup.in + atlantisgroup.info",
        "placeholders": ["rera_number", "unit areas", "floor plans", "payment plan"],
        "seo": {"title": "Atlantis Grand — 3 BHK Luxury Flats on High Ground Road, Zirakpur | From ₹1.44 Cr", "description": "RERA-registered 3 BHK luxury flats & Sky Villas at High Ground Road, Zirakpur. 7+ acres, 11 towers, Mivan construction, possession 2026. From ₹1.44 Cr.", "keywords": "3 bhk zirakpur, atlantis grand, high ground road flats, mivan construction"},
    },
    {
        "id": "atlantis-heights", "name": "Atlantis Heights", "slug": "atlantis-heights",
        "tagline": "Zirakpur's first sky walk — forest-facing living",
        "description": "Atlantis Heights is a new launch of 2 & 3 BHK forest-facing homes with Zirakpur's first elevated sky walk and 65+ acres of surrounding greenery — crafted for families seeking stronger connectivity, refined planning and dependable long-term value. From ₹1.53 Cr.",
        "status": "UPCOMING", "category": "RESIDENTIAL", "project_type": ["Apartments"],
        "rera_number": "", "rera_qr_image": "",
        "city": "Zirakpur", "locality": "Zirakpur", "address": "Zirakpur, Punjab",
        "total_area": "", "total_towers": None, "floors": None, "possession": "New Launch", "completion_percentage": None,
        "price_from": 15300000, "price_label": "From ₹1.53 Cr.", "price_on_request": False, "currency": "INR",
        "configs": [
            {"config": "2 BHK", "area": "", "price_label": "On Request", "availability": "AVAILABLE"},
            {"config": "3 BHK", "area": "", "price_label": "From ₹1.53 Cr.", "availability": "AVAILABLE"},
        ],
        "images": [
            {"url": "https://atlantisgroup.in/assets/images/heights/renders/heights-hero.webp", "alt": "Atlantis Heights forest-facing towers and elevated sky walk", "category": "EXTERIOR"},
            {"url": "https://atlantisgroup.in/assets/images/heights/renders/heights-garden-sunset.webp", "alt": "Atlantis Heights landscaped gardens at sunset", "category": "AMENITY"},
            {"url": "https://atlantisgroup.in/assets/images/heights/renders/heights-upward-view.webp", "alt": "Atlantis Heights upward view", "category": "EXTERIOR"},
        ],
        "amenities": [
            {"name": "Zirakpur's First Sky Walk", "group": "Lifestyle"},
            {"name": "65+ Acres of Greenery", "group": "Green"},
            {"name": "Forest-Facing Residences", "group": "Green"},
        ],
        "specifications": [],
        "landmarks": [],
        "featured": True, "is_hot_selling": False, "sort_order": 5,
        "source": "atlantisgroup.in",
        "placeholders": ["rera_number", "exact location", "unit areas", "specifications", "landmarks"],
        "seo": {"title": "Atlantis Heights — 2 & 3 BHK Forest-Facing Homes, Zirakpur | From ₹1.53 Cr", "description": "New launch: 2 & 3 BHK forest-facing residences with Zirakpur's first sky walk and 65+ acres of greenery. From ₹1.53 Cr.", "keywords": "atlantis heights, sky walk zirakpur, forest facing flats"},
    },
    {
        "id": "atlantis-at-wave", "name": "Atlantis at Wave", "slug": "atlantis-at-wave",
        "tagline": "Stylish homes in a prime area — handed over July 2021",
        "description": "A completed Atlantis address: stylish homes in a prime Zirakpur location, handed over in July 2021. Atlantis at Wave stands as proof of the group's delivery promise — thoughtful planning, quality construction and on-time handover.",
        "status": "DELIVERED", "category": "RESIDENTIAL", "project_type": ["Apartments"],
        "rera_number": "", "rera_qr_image": "",
        "city": "Zirakpur", "locality": "Zirakpur", "address": "Zirakpur, Punjab",
        "total_area": "", "total_towers": None, "floors": None, "possession": "Delivered July 2021", "completion_percentage": 100,
        "price_from": None, "price_label": "Sold Out", "price_on_request": True, "currency": "INR",
        "configs": [],
        "images": [
            {"url": "https://atlantisgroup.in/assets/images/wave/renders/atlantis-at-wave.webp", "alt": "Atlantis at Wave — completed residential address, Zirakpur", "category": "EXTERIOR"},
        ],
        "amenities": [], "specifications": [], "landmarks": [],
        "featured": False, "is_hot_selling": False, "sort_order": 6,
        "source": "atlantisgroup.in",
        "placeholders": ["gallery", "unit details"],
        "seo": {"title": "Atlantis at Wave — Delivered July 2021 | Atlantis Group Zirakpur", "description": "Completed Atlantis address in Zirakpur, handed over July 2021. Explore the delivered portfolio of Atlantis Group.", "keywords": "atlantis wave, delivered projects zirakpur"},
    },
]

UPDATES = [
    {"id": "update-1", "kind": "update", "title": "Atlantis Heights — Construction Started", "slug": "atlantis-heights-construction-started", "excerpt": "Construction has officially begun at Atlantis Heights, Zirakpur — forest-facing 2 & 3 BHK homes with the city's first elevated sky walk.", "body": "", "cover": "https://atlantisgroup.in/assets/images/heights/renders/heights-hero.webp", "author": "Atlantis Group", "tags": ["Construction Update"], "platform": "Website", "external_url": "/projects/atlantis-heights", "published_at": "2026-06-10"},
    {"id": "update-2", "kind": "update", "title": "Atlantis at Wave — Sold Out", "slug": "atlantis-at-wave-sold-out", "excerpt": "Atlantis at Wave is fully sold out. Delivered July 2021 — thank you to every family who trusted us.", "body": "", "cover": "https://atlantisgroup.in/assets/images/wave/renders/atlantis-at-wave.webp", "author": "Atlantis Group", "tags": ["Milestone"], "platform": "Website", "external_url": "/projects/atlantis-at-wave", "published_at": "2026-05-01"},
]

FAQS = [
    {"id": "faq-1", "project_id": None, "question": "What types of homes does Atlantis Group offer in Zirakpur?", "answer": "Atlantis Group focuses on premium residential communities in Zirakpur, including luxury 3 BHK flats at Atlantis Grand and 2 & 3 BHK homes at Atlantis Heights. Each project page includes renders, location maps, downloads and floor plan information for easier comparison.", "sort_order": 1},
    {"id": "faq-2", "project_id": None, "question": "Which Atlantis project is near possession?", "answer": "Atlantis Grand (Possession 2026) and Atlantis Three Sixty (Possession March 2026) are the near-possession addresses. Review the project pages for layout previews, location details and availability.", "sort_order": 2},
    {"id": "faq-3", "project_id": None, "question": "How can I book a site visit?", "answer": "Use the Enquire or Book Site Visit forms on any page, the WhatsApp button, or call +91 97083 97083. The relationship team will arrange a private appointment and help you compare Atlantis Grand, Atlantis Heights, Three Sixty and the delivered Atlantis at Wave.", "sort_order": 3},
]

BLOG = [
    {"id": "blog-1", "title": "4 BHK Flats vs. Penthouse: Which Is the Better Investment?", "slug": "4-bhk-flats-vs-penthouse-investment", "excerpt": "When investing in a premium home, buyers often compare spacious 4 BHK apartments with luxurious penthouses. Both offer comfort, privacy...", "body": "Full article originally published on atlantisprojects.in. This is an admin-editable placeholder summary — replace with the complete post in the CMS.\n\nWhen investing in a premium home, buyers often compare spacious 4 BHK apartments with luxurious penthouses. Both offer comfort, privacy and strong appreciation potential in the Tricity market.", "cover": "", "author": "Atlantis Editorial", "tags": ["Investment", "4 BHK", "Penthouse"], "published_at": "2026-08-27", "source_url": "https://atlantisprojects.in/4-bhk-flats-vs-penthouse-which-is-the-better-investment/"},
    {"id": "blog-2", "title": "Why Premium Homes Continue to Outperform the Market", "slug": "why-premium-homes-outperform-market", "excerpt": "The property market is constantly changing, but premium homes continue to attract strong interest from buyers and investors...", "body": "Full article originally published on atlantisprojects.in. This is an admin-editable placeholder summary — replace with the complete post in the CMS.\n\nThe property market is constantly changing, but premium homes continue to attract strong interest from buyers and investors. While market cycles shift, quality addresses in prime corridors hold and grow value.", "cover": "", "author": "Atlantis Editorial", "tags": ["Market Insights"], "published_at": "2026-08-27", "source_url": "https://atlantisprojects.in/why-premium-homes-continue-to-outperform-the-market/"},
    {"id": "blog-3", "title": "Luxury 3 BHK Flats in Zirakpur & Mohali: Find Your Perfect Dream Home", "slug": "luxury-3bhk-flats-zirakpur-mohali", "excerpt": "Buying a home is one of the biggest decisions in life, and today's homebuyers are looking for more than just...", "body": "Full article originally published on atlantisprojects.in. This is an admin-editable placeholder summary — replace with the complete post in the CMS.\n\nBuying a home is one of the biggest decisions in life, and today's homebuyers are looking for more than just square footage — they want light, air, privacy and a location that works every single day.", "cover": "", "author": "Atlantis Editorial", "tags": ["3 BHK", "Zirakpur", "Mohali"], "published_at": "2026-07-25", "source_url": "https://atlantisprojects.in/luxury-3-bhk-flats-in-zirakpur-mohali-find-your-perfect-dream-home/"},
    {"id": "blog-4", "title": "What Makes a Luxury Apartment Truly Luxurious? A Buyer's Evaluation Checklist", "slug": "luxury-apartment-buyer-checklist", "excerpt": "A practical checklist to evaluate luxury apartments in Zirakpur by planning, space, light, construction, amenities, maintenance and transparency.", "body": "Full article originally published on atlantisgroup.in. This is an admin-editable placeholder summary — replace with the complete post in the CMS.\n\nEvaluate planning, space, light, construction quality, amenities, maintenance and transparency before you commit.", "cover": "https://atlantisgroup.in/assets/images/grand/renders/grand-day-front.webp", "author": "Atlantis Editorial", "tags": ["Buyer Guide"], "published_at": "2026-07-01", "source_url": "https://atlantisgroup.in/blog/luxury-apartment-buyer-checklist/"},
    {"id": "blog-5", "title": "Why Low-Density Living Is Becoming the New Definition of Luxury in Zirakpur", "slug": "low-density-living-luxury-zirakpur", "excerpt": "Privacy, fewer homes per floor, quieter common areas, daylight and ventilation are redefining luxury living in Zirakpur.", "body": "Full article originally published on atlantisgroup.in. This is an admin-editable placeholder summary — replace with the complete post in the CMS.\n\nPrivacy, fewer homes per floor, quieter common areas, daylight and ventilation are redefining luxury living in Zirakpur.", "cover": "https://atlantisgroup.in/assets/images/grand/renders/grand-aerial.webp", "author": "Atlantis Editorial", "tags": ["Planning"], "published_at": "2026-06-15", "source_url": "https://atlantisgroup.in/blog/low-density-living-luxury-zirakpur/"},
    {"id": "blog-6", "title": "Mivan Construction vs Conventional Construction: What Homebuyers Should Know", "slug": "mivan-vs-conventional-construction", "excerpt": "A simple comparison of Mivan and conventional construction covering structure, finish, durability, speed, alterations and buyer checks.", "body": "Full article originally published on atlantisgroup.in. This is an admin-editable placeholder summary — replace with the complete post in the CMS.\n\nMivan aluminium formwork delivers superior finish, durability and speed compared to conventional construction.", "cover": "https://atlantisgroup.in/assets/images/construction/mivan-aluminium-formwork.webp", "author": "Atlantis Editorial", "tags": ["Construction"], "published_at": "2026-06-01", "source_url": "https://atlantisgroup.in/blog/mivan-vs-conventional-construction-homebuyers/"},
]

TESTIMONIALS = []

TEAM = [
    {"id": "team-1", "name": "Ar. Vishwas Chadha", "designation": "Director", "group": "Leadership", "photo": "https://atlantisgroup.in/assets/images/leadership/vishwas-chadha-home.jpg", "bio": "Guides the larger direction of the company, shaping each address through design clarity, market understanding and a long-view approach to development. TEDx Sukhna Lake speaker.", "linkedin": "", "sort_order": 1},
    {"id": "team-2", "name": "Pardeep Chadha", "designation": "Director Sales", "group": "Leadership", "photo": "https://atlantisgroup.in/assets/images/leadership/pardeep-chadha.jpg", "bio": "Over 30 years in real estate, shaping sales strategy, client relationships and successful project launches.", "linkedin": "", "sort_order": 2},
    {"id": "team-3", "name": "Amarjit Singh", "designation": "Director of Marketing", "group": "Leadership", "photo": "https://atlantisgroup.in/assets/images/leadership/amarjit-singh.jpg", "bio": "An industrialist with India and UAE experience, guiding branding, market expansion and investor confidence.", "linkedin": "", "sort_order": 3},
    {"id": "team-4", "name": "CA Mohinder Pal Satija", "designation": "Director Accounts & Finance", "group": "Leadership", "photo": "https://atlantisgroup.in/assets/images/leadership/mohinder-pal-satija.jpg", "bio": "Leads accounts and finance with multinational experience across India and Japan.", "linkedin": "", "sort_order": 4},
    {"id": "team-5", "name": "Jasbir Singh", "designation": "Director of Construction", "group": "Leadership", "photo": "https://atlantisgroup.in/assets/images/leadership/jasbir-singh.jpg", "bio": "Brings construction precision and landmark delivery experience to Atlantis Group developments.", "linkedin": "", "sort_order": 5},
]

SETTINGS = {
    "id": "global",
    "whatsapp_number": "919607896078",
    "whatsapp_default_message": "Hi, I'm interested in ATLANTIS projects. Please share details.",
    "meta_pixel_id": "", "ga4_id": "", "gtm_id": "",
    "whatsapp_cloud_api_token": "", "whatsapp_phone_number_id": "",
    "cloudinary_cloud_name": "", "cloudinary_api_key": "",
    "smtp_host": "", "smtp_user": "",
    "placeholders_note": "Integration IDs are configured here by the admin. Empty values keep the corresponding feature disabled gracefully.",
}
