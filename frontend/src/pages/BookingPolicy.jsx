import SEO from "../components/SEO";

const SECTIONS = [
  { title: "1. Booking Process", body: "A unit is considered booked only upon receipt of the booking amount along with a duly filled application form and KYC documents, subject to realisation of payment and execution of the agreement to sell as per the terms of the developer, ATLANTIS Group." },
  { title: "2. Booking Amount", body: "The booking amount varies by project and configuration and will be communicated in writing at the time of booking. All payments must be made only through official channels against valid receipts. Cash payments without receipt are strictly discouraged." },
  { title: "3. Payment Plans", body: "Construction-linked, flexi and other payment plans are offered per project. Schedule, milestones and applicable charges (PLC, IFMS, GST, stamp duty, registration and other statutory charges) are detailed in the project's official cost sheet available on request." },
  { title: "4. Cancellation by Buyer", body: "In the event of cancellation by the allottee before execution of the agreement, the booking amount may be refunded after deduction of administrative/cancellation charges as per the applicable project terms and prevailing RERA guidelines. After execution of the agreement to sell, cancellation and forfeiture are governed by the terms of that agreement and the Real Estate (Regulation and Development) Act, 2016." },
  { title: "5. Refund Timeline", body: "Approved refunds are processed without interest within the timeline prescribed by the project terms and applicable RERA rules, typically within 45–90 days of cancellation approval, through the original mode of payment wherever possible." },
  { title: "6. Cancellation by Developer", body: "The developer reserves the right to cancel an allotment in case of non-payment of dues as per the payment schedule, misrepresentation, or breach of agreement terms, subject to notices and remedies as provided under the agreement and RERA." },
  { title: "7. RERA Compliance", body: "All ATLANTIS projects are registered with the Punjab Real Estate Regulatory Authority. Buyers are encouraged to verify registration details (e.g., Atlantis Three Sixty — PBRERA-SAS79-PR1159) on the official RERA portal before booking." },
  { title: "8. Channel Partner Disclosure", body: "This website is designed, published and managed by an authorised channel partner of ATLANTIS — QUALITY REAL ESTATE (https://qualityrealestate.in). All bookings are executed directly with the developer under its official terms; the channel partner facilitates enquiry, site visits and documentation support only." },
  { title: "9. Jurisdiction", body: "All disputes are subject to the jurisdiction of courts/fora at SAS Nagar (Mohali), Punjab, and the remedies available under the Real Estate (Regulation and Development) Act, 2016." },
];

export default function BookingPolicy() {
  return (
    <div data-testid="booking-policy-page" className="pt-32 pb-24">
      <SEO title="Booking & Cancellation Policy" path="/booking-cancellation-policy"
        description="Booking, payment, cancellation and refund policy for ATLANTIS projects — RERA compliant terms for homebuyers in Chandigarh Tricity." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-4">Booking & <span className="gold-text italic">Cancellation Policy</span></h1>
        <p className="text-sm text-slate-500 font-mono mb-12">Last updated: June 2026</p>
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <section key={i} data-testid={`booking-section-${i + 1}`}>
              <h2 className="font-serif text-xl text-slate-100 mb-2">{s.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-light">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
