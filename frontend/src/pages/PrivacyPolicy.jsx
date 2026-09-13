import SEO from "../components/SEO";

const SECTIONS = [
  { title: "1. Information We Collect", body: "When you submit an enquiry, book a site visit, or interact with our AI concierge, we collect your name, phone number, email address, project interest and message. We also collect standard analytics data (pages visited, device, approximate location) to improve your experience." },
  { title: "2. How We Use Your Information", body: "Your details are used solely to respond to your enquiry, arrange site visits, share project information, pricing and availability, and — with your consent — send relevant updates about ATLANTIS projects. We do not sell your personal data to any third party." },
  { title: "3. Consent & DPDP Compliance", body: "By submitting any form on this website, you expressly consent to being contacted by the ATLANTIS relationship team and its authorised channel partners via call, SMS, WhatsApp or email, in compliance with the Digital Personal Data Protection (DPDP) Act, 2023. You may withdraw consent at any time by writing to us." },
  { title: "4. Data Sharing", body: "Your information may be shared with ATLANTIS Group and its authorised channel partner QUALITY REAL ESTATE strictly for the purpose of servicing your enquiry. Data is never shared with unrelated third parties for marketing." },
  { title: "5. Cookies & Tracking", body: "This site may use cookies and tracking pixels (Google Analytics, Meta Pixel) to measure campaign performance and improve content. You can disable cookies in your browser settings without affecting core site functionality." },
  { title: "6. Data Security & Retention", body: "Lead data is stored securely with access restricted to authorised personnel. Enquiry data is retained only as long as necessary to service your request and meet legal obligations." },
  { title: "7. Your Rights", body: "You may request access, correction or deletion of your personal data at any time by contacting us at +91 9041795879, emailing support@atlantisprojectsgroup.com, or through the contact form on this website." },
  { title: "8. Channel Partner Disclosure", body: "This website is designed, published and managed by an authorised channel partner of ATLANTIS — QUALITY REAL ESTATE (https://qualityrealestate.in). Project information is sourced from official ATLANTIS communication; please verify all details, including RERA registration, independently before making a purchase decision." },
];

export default function PrivacyPolicy() {
  return (
    <div data-testid="privacy-policy-page" className="pt-32 pb-24">
      <SEO title="Privacy Policy" path="/privacy-policy"
        description="Privacy Policy — how ATLANTIS and its authorised channel partner collect, use and protect your personal information. DPDP Act 2023 compliant." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-4">Privacy <span className="gold-text italic">Policy</span></h1>
        <p className="text-sm text-slate-500 font-mono mb-12">Last updated: June 2026</p>
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <section key={i} data-testid={`privacy-section-${i + 1}`}>
              <h2 className="font-serif text-xl text-slate-100 mb-2">{s.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-light">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
