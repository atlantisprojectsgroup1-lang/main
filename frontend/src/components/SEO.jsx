import { Helmet } from "react-helmet-async";

export default function SEO({ title, description, keywords, image, path, jsonLd }) {
  const base = process.env.REACT_APP_BACKEND_URL || "";
  const fullTitle = title ? `${title} | ATLANTIS` : "ATLANTIS — Premium Real Estate Developers, Chandigarh Tricity";
  const desc = description || "ATLANTIS builds premium residential & commercial landmarks across Mohali, Zirakpur and Aerocity. RERA registered. Low-density. Built to last.";
  const url = `${base}${path || ""}`;
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      {image && <meta property="og:image" content={image} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
