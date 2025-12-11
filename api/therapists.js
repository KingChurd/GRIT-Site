// api/therapists.js
// Vercel serverless function for GRIT therapist search using NPI Registry

const MENTAL_HEALTH_TAXONOMY_CODES = [
  "101YP2500X", // Professional counselor
  "101YM0800X", // Mental health counselor
  "101YA0400X", // Addiction counselor
  "103TC0700X", // Clinical psychologist
  "1041C0700X", // Clinical social worker
  "106H00000X", // Marriage & family therapist
];

export default async function handler(req, res) {
  // Basic CORS (fine even though it's same-origin)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { zip, focus } = req.query || {};

  if (!zip || !/^\d{5}$/.test(zip)) {
    res.status(400).json({ error: "zip (5-digit) is required" });
    return;
  }

  try {
    const params = new URLSearchParams({
      version: "2.1",
      postal_code: zip,
      country_code: "US",
      enumeration_type: "NPI-1",
      limit: "100",
    });

    const url = `https://npiregistry.cms.hhs.gov/api/?${params.toString()}`;

    const npiResponse = await fetch(url);
    if (!npiResponse.ok) {
      throw new Error(`NPI API error: ${npiResponse.status}`);
    }

    const data = await npiResponse.json();
    const results = data.results || [];

    const cleaned = results
      .map((r) => {
        const basic = r.basic || {};
        const addresses = r.addresses || [];
        const taxonomies = r.taxonomies || [];

        const practice =
          addresses.find((a) => a.address_purpose === "LOCATION") ||
          addresses[0] ||
          {};

        const mhTaxonomies = taxonomies.filter((tx) =>
          MENTAL_HEALTH_TAXONOMY_CODES.includes(tx.code)
        );
        if (mhTaxonomies.length === 0) return null;

        const fullName =
          basic.name ||
          [basic.first_name, basic.last_name].filter(Boolean).join(" ");

        return {
          npi: r.number,
          name: fullName,
          credential: basic.credential || null,
          gender: basic.gender || null,
          city: practice.city || null,
          state: practice.state || null,
          postal_code: practice.postal_code || null,
          phone: practice.telephone_number || null,
          taxonomies: mhTaxonomies.map((tx) => ({
            code: tx.code,
            desc: tx.desc,
          })),
        };
      })
      .filter(Boolean);

    const focusLower = (focus || "").toLowerCase();
    const scored = cleaned
      .map((t) => {
        let score = 0;

        if (focusLower) {
          const combinedTaxDesc = t.taxonomies
            .map((tx) => tx.desc.toLowerCase())
            .join(" ");

          if (
            combinedTaxDesc.includes("addiction") &&
            focusLower.includes("addiction")
          ) {
            score += 2;
          }
          if (
            combinedTaxDesc.includes("family") &&
            focusLower.includes("marriage")
          ) {
            score += 2;
          }
          if (combinedTaxDesc.includes("mental health")) {
            score += 1;
          }
        }

        return { ...t, score };
      })
      .sort((a, b) => b.score - a.score);

    res.status(200).json({
      query: { zip, focus: focus || null },
      count: scored.length,
      results: scored,
    });
  } catch (err) {
    console.error("Therapists API error:", err);
    res.status(500).json({
      error: "Internal error",
      detail: err.message || "Unknown error",
    });
  }
}

