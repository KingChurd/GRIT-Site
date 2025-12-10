// therapist-api.js
// Front-end for GRIT therapist finder using your Vercel NPI API

// IMPORTANT: same-origin API for your GRIT-Site Vercel project
const API_BASE = "/api/therapists";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("therapist-form");
  const button = document.getElementById("find-matches-btn");
  const resultsSection = document.getElementById("therapist-results");

  if (!form || !button || !resultsSection) return;

  button.addEventListener("click", async () => {
    const data = readFormData(form);
    const summaryText = buildSummaryText(data);

    // Show loading state
    renderResults(resultsSection, summaryText, [], { loading: true });

    const { results, error } = await fetchRealTherapists(data);

    renderResults(resultsSection, summaryText, results, { error });
  });
});

function readFormData(form) {
  return {
    location: form.querySelector("#location")?.value.trim() || "",
    focus: form.querySelector("#focus")?.value || "",
    format: form.querySelector("#format")?.value || "Any",
    budget: form.querySelector("#budget")?.value || "No preference",
    preferences: form.querySelector("#preferences")?.value.trim() || "",
  };
}

function extractZip(location) {
  const match = location.match(/\b\d{5}\b/);
  return match ? match[0] : null;
}

// 🔧 Updated to show real error messages and log details
async function fetchRealTherapists({ location, focus }) {
  const zip = extractZip(location);
  if (!zip) {
    return {
      results: [],
      error: "Please include a 5-digit ZIP code in your location.",
    };
  }

  try {
    const url = `${API_BASE}?zip=${encodeURIComponent(
      zip
    )}&focus=${encodeURIComponent(focus || "")}`;

    console.log("Calling therapist API:", url);

    const res = await fetch(url);

    console.log("API response status:", res.status);

    if (!res.ok) {
      // API responded but with an error status
      return {
        results: [],
        error:
          "There was a problem contacting the therapist directory (status " +
          res.status +
          ").",
      };
    }

    const data = await res.json();
    console.log("API JSON:", data);
    return { results: data.results || [], error: null };
  } catch (err) {
    console.error("Therapist fetch error:", err);
    return {
      results: [],
      error:
        "Unexpected error: " +
        (err && err.message ? err.message : "Please try again."),
    };
  }
}

function buildSummaryText({ location, focus, format, budget, preferences }) {
  const parts = [
    "I'm looking for a therapist who understands men's mental health.",
  ];

  if (location) parts.push(`I'm located in ${location}.`);
  if (focus)
    parts.push(`The main thing I want help with is: ${focus.toLowerCase()}.`);
  else parts.push("I'm open to general support around stress or life balance.");

  if (format !== "Any")
    parts.push(`I prefer ${format.toLowerCase()} sessions.`);

  if (budget !== "No preference")
    parts.push(`My budget per session is around ${budget}.`);

  if (preferences) parts.push(`Additional preferences: ${preferences}.`);

  parts.push(
    "I want someone who understands the pressure men feel to provide, stay strong, and handle everything."
  );

  return parts.join(" ");
}

function renderResults(container, summaryText, matches, options = {}) {
  const { loading = false, error = null } = options;

  let shell = container.querySelector(".shell");
  if (!shell) {
    shell = document.createElement("div");
    shell.className = "shell";
    container.appendChild(shell);
  }

  if (loading) {
    shell.innerHTML = `
      <div class="results-summary-card">
        <p>Finding therapists near you...</p>
      </div>`;
    return;
  }

  const hasMatches = matches && matches.length > 0;

  shell.innerHTML = `
    <div class="results-wrapper">

      <!-- SUMMARY CARD -->
      <div class="results-summary-card">
        <div class="section-kicker">Step 2</div>
        <h2 class="section-title">Use this summary when you search or reach out</h2>
        <p class="section-body">Copy this into directories or messages to therapists.</p>

        <div class="summary-box">
          <p id="summary-text">${escapeHtml(summaryText)}</p>
        </div>
      </div>

      <!-- RESULTS CARD -->
      <div class="results-matches">
        <div class="section-kicker">Therapists near you</div>
        <h2 class="section-title">Licensed providers</h2>

        ${
          error
            ? `<p style="color:#ff6a00;">${escapeHtml(error)}</p>`
            : ""
        }

        ${
          !error && hasMatches
            ? `
          <div class="therapist-grid">
            ${matches
              .map(
                (t) => `
                <article class="therapist-card">
                  <div class="therapist-header">
                    <h3>${escapeHtml(t.name || "Therapist")}</h3>
                    <span class="therapist-location">
                      ${escapeHtml(
                        [t.city, t.state, t.postal_code].filter(Boolean).join(", ")
                      )}
                    </span>
                  </div>

                  <div class="therapist-meta-row">
                    <div class="therapist-meta">
                      <strong>Credential</strong>
                      <span>${escapeHtml(t.credential || "N/A")}</span>
                    </div>

                    <div class="therapist-meta">
                      <strong>Phone</strong>
                      <span>${escapeHtml(t.phone || "N/A")}</span>
                    </div>

                    <div class="therapist-meta">
                      <strong>Specialty</strong>
                      <span>${(t.taxonomies || [])
                        .map((tx) => escapeHtml(tx.desc))
                        .join(", ")}</span>
                    </div>
                  </div>
                </article>`
              )
              .join("")}
          </div>
        `
            : !error
            ? `<p>No mental health providers were found in that ZIP code.</p>`
            : ""
        }
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
