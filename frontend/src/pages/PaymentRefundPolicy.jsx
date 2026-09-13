import SEO from "../components/SEO";

const SECTIONS = [
  { title: "1. Official Payment Channels", body: "All payments for any ATLANTIS project must be made only to the developer's official bank account or through officially communicated payment channels, against valid receipts. This website is a marketing platform published by QUALITY REAL ESTATE (authorised channel partner) and does not collect any payments." },
  { title: "2. Booking Amount & Schedule", body: "The booking amount, instalment schedule, due dates and applicable charges (PLC, IFMS, GST, stamp duty, registration and other statutory levies) are detailed in the project's official cost sheet and agreement, provided by the developer at the time of booking." },
  { title: "3. Mode of Payment", body: "Payments are accepted via cheque, demand draft, RTGS/NEFT or UPI in favour of the developer's official account as per the application form. Cash payments are discouraged and accepted only as per applicable law with proper receipts." },
  { title: "4. Late Payment", body: "Delayed instalments may attract interest/penal charges as per the payment plan and the agreement to sell. Persistent default may lead to cancellation of allotment as per the agreement and RERA provisions." },
  { title: "5. Refund Policy", body: "Refunds on cancellation are processed by the developer as per the project terms, the agreement to sell and the Real Estate (Regulation and Development) Act, 2016 — after deduction of applicable cancellation/administrative charges, without interest, within the timeline prescribed under RERA (typically 45–90 days from cancellation approval), through the original mode of payment wherever possible." },
  { title: "6. Taxes", body: "GST, TDS (where applicable) and other statutory taxes are payable by the buyer as per prevailing law and are not included unless expressly stated in the official cost sheet." },
  { title: "7. No Payment to Channel Partner", body: "Do not hand over any booking amount, instalment or fee to any individual, agent or channel partner in cash or personal accounts. QUALITY REAL ESTATE facilitates enquiries, site visits and documentation support only; it is not authorised to collect project payments." },
  { title: "8. Disputes", body: "Payment and refund disputes are governed by the agreement to sell and the RERA Act, 2016, subject to the jurisdiction of courts/fora at SAS Nagar (Mohali), Punjab." },
  { title: "9. Contact", body: "ATLANTIS Group — Corporate Office: Sector 82A, Mohali, Punjab, India · Phone / WhatsApp: +91 9041795879 · Email: support@atlantisprojectsgroup.com · Web: atlantisprojectsgroup.com" },
];

export default function PaymentRefundPolicy() {
  return (
    <div data-testid="payment-refund-policy-page" className="pt-32 pb-24">
      <SEO title="Payment & Refund Policy" path="/payment-refund-policy"
        description="Payment & Refund Policy for ATLANTIS projects — official payment channels, schedules, RERA-compliant refunds. Published by QUALITY REAL ESTATE, authorised channel partner." />
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <p className="eyebrow mb-3">Legal</p>
        <h1 className="font-serif text-4xl sm:text-5xl font-normal tracking-tight mb-4">Payment & <span className="gold-text italic">Refund Policy</span></h1>
        <p className="text-sm text-slate-500 font-mono mb-12">Last updated: June 2026</p>
        <div className="space-y-8">
          {SECTIONS.map((s, i) => (
            <section key={i} data-testid={`payment-section-${i + 1}`}>
              <h2 className="font-serif text-xl text-slate-100 mb-2">{s.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed font-light">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
