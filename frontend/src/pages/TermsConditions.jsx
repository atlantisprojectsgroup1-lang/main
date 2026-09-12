import SEO from "../components/SEO";

const SECTIONS = [
  { title: "1. Acceptance of Terms", body: "By accessing or using this website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please discontinue use of the website." },
  { title: "2. Marketing & Promotional Purpose", body: "This website is published for marketing, branding and promotional purposes only. It is designed, published and managed by QUALITY REAL ESTATE (https://qualityrealestate.in), an authorised channel partner of ATLANTIS Group. It is not the official website of the developer." },
  { title: "3. Accuracy of Information", body: "All project details — including images, renders, floor plans, areas, prices, amenities, specifications, timelines and availability — are indicative and sourced from official developer communication. They may change without notice and do not constitute a legal offer. Visitors must verify all details, including RERA registration, directly with the developer and the Punjab RERA portal before making any decision." },
  { title: "4. No Offer or Contract", body: "Nothing on this website constitutes an offer, allotment, agreement or contract. All bookings are executed solely with the developer under its official terms, application forms and agreements." },
  { title: "5. Intellectual Property", body: "The ATLANTIS name, logo, project names, renders and imagery are the property of ATLANTIS Group and are used here by the channel partner for authorised promotion. Website design and compilation belong to the channel partner. No content may be reproduced without written permission." },
  { title: "6. Third-Party Links", body: "This website may link to third-party websites (including qualityrealestate.in, WhatsApp and social platforms). We are not responsible for their content, accuracy or practices." },
  { title: "7. Limitation of Liability", body: "Neither the channel partner nor the developer shall be liable for any direct or indirect loss arising from reliance on information presented on this website, or from interruptions, errors or omissions in its content." },
  { title: "8. Privacy", body: "Use of this website is also governed by our Privacy Policy, which explains how enquiry data is collected and used in compliance with the DPDP Act, 2023." },
  { title: "9. Governing Law", body: "These terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of courts at SAS Nagar (Mohali), Punjab." },
  { title: "10. Updates", body: "These Terms & Conditions may be updated periodically. Continued use of the website after changes constitutes acceptance of the revised terms." },
];

export default function TermsConditions() {
  return (
    <div data-testid="terms-conditions-page" className="pt-32 pb-24">
      <SEO title="Terms & Conditions" path="/terms-and-conditions"
        description="Terms & Conditions for the ATLANTIS marketing website published by QUALITY REAL ESTATE, authorised channel partner of ATLANTIS Group." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-4">Terms & <span className="gold-text italic">Conditions</span></h1>
        <p className="text-sm text-slate-500 font-mono mb-12">Last updated: June 2026</p>
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <section key={i} data-testid={`terms-section-${i + 1}`}>
              <h2 className="font-serif text-xl text-slate-100 mb-2">{s.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-light">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
