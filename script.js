document.addEventListener("DOMContentLoaded", () => {
  /* ===========================
     Mobile Navbar Toggle
     =========================== */
  const navInner = document.querySelector(".nav-inner");
  const navLinks = document.querySelector(".nav-links");

  if (navInner && navLinks) {
    let toggle = document.querySelector(".nav-toggle");

    // Create a hamburger button if it doesn't exist yet
    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "nav-toggle";
      toggle.type = "button";
      toggle.setAttribute("aria-label", "Toggle navigation");
      toggle.innerHTML = "<span></span><span></span><span></span>";

      const navCta = document.querySelector(".nav-cta");
      if (navCta) {
        navInner.insertBefore(toggle, navCta);
      } else {
        navInner.appendChild(toggle);
      }
    }

    toggle.addEventListener("click", () => {
      document.body.classList.toggle("nav-open");
    });
  }

  /* ===========================
     Helpers
     =========================== */
  function extractZip(raw) {
    if (!raw) return null;
    const m = raw.match(/\b(\d{5})(?:-\d{4})?\b/);
    return m ? m[1] : null;
  }

  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /* ===========================
     Therapist Form:
     Summary + Live Matches
     =========================== */
  const therapistForm = document.getElementById("therapist-form");

  if (therapistForm) {
    const submitBtn =
      document.getElementById("find-matches-btn") ||
      therapistForm.querySelector('button[type="button"]');

    // Where we render everything
    let resultsSection = document.getElementById("therapist-results");
    if (!resultsSection) {
      resultsSection = document.createElement("section");
      resultsSection.id = "therapist-results";
      const main = document.querySelector("main");
      if (main) main.appendChild(resultsSection);
    }

    async function handleTherapistSubmit() {
      const locInput = therapistForm.querySelector("#location");
      const formatEl = therapistForm.querySelector("#format");
      const focusEl = therapistForm.querySelector("#focus");
      const budgetEl = therapistForm.querySelector("#budget");
      const prefsEl = therapistForm.querySelector("#preferences");

      const loc = locInput?.value.trim() || "";
      const format = formatEl?.value || "";
      const focus = focusEl?.value || "";
      const budget = budgetEl?.value || "";
      const prefs = prefsEl?.value.trim() || "";

      const zip = extractZip(loc);

      // Build summary HTML
      let summary = `<p>Based on what you shared, here’s a starting point:</p><ul>`;

      if (focus) summary += `<li><strong>Main focus:</strong> ${escapeHtml(focus)}</li>`;
      if (format && format !== "No preference")
        summary += `<li><strong>Preferred format:</strong> ${escapeHtml(format)}</li>`;
      if (budget && budget !== "No preference")
        summary += `<li><strong>Budget:</strong> ${escapeHtml(budget)} per session</li>`;
      if (loc) summary += `<li><strong>Location:</strong> ${escapeHtml(loc)}</li>`;
      if (prefs)
        summary += `<li><strong>Preferences:</strong> ${escapeHtml(prefs)}</li>`;

      summary += `</ul>
        <p>This suggests looking for:</p>
        <ul>
          <li>A therapist who lists <strong>${escapeHtml(
            focus || "your main concern"
          )}</strong> as a specialty.</li>
          <li>Offers <strong>${
            format && format !== "No preference"
              ? escapeHtml(format.toLowerCase())
              : "in-person or telehealth"
          }</strong> sessions.</li>
          <li>Fits roughly in the <strong>${
            budget && budget !== "No preference"
              ? escapeHtml(budget)
              : "budget range you’re comfortable with"
          }</strong>.</li>
        </ul>
        <p>Use this summary as a script when you reach out or schedule an intro call.</p>`;

      // Base layout for results area
      resultsSection.innerHTML = `
        <div class="results-wrapper">
          <div class="results-summary-card">
            <div class="card-label">Step 2</div>
            <h2 class="card-title">Your starting recommendation</h2>
            <p class="card-tagline">
              This isn’t a diagnosis, just a direction to help you have a clearer first conversation with a therapist.
            </p>
            <div class="summary-box">
              ${summary}
            </div>
          </div>

          <div class="results-matches">
            <div class="card-label">Step 3</div>
            <h2 class="card-title">Therapists near you</h2>
            <p class="card-tagline" id="matches-status">
              ${
                zip
                  ? "Searching the NPI registry for mental-health providers in your ZIP..."
                  : "Add a 5-digit ZIP code to see live therapist matches pulled from the NPI registry."
              }
            </p>
            <div class="therapist-grid" id="therapist-grid"></div>
          </div>
        </div>
      `;

      resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });

      // If no zip, we stop after summary
      if (!zip) {
        return;
      }

      const grid = document.getElementById("therapist-grid");
      const statusEl = document.getElementById("matches-status");

      if (!grid || !statusEl) return;

      // Call your backend API
      try {
        const params = new URLSearchParams({
          zip,
          focus: focus || ""
        });

        const res = await fetch(`/api/therapists?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        const results = Array.isArray(data.results) ? data.results : [];

        if (!results.length) {
          statusEl.textContent =
            "We didn’t find mental-health therapists in that exact ZIP. Try another ZIP, or search a nearby city on Psychology Today, your insurance portal, or local directories.";
          return;
        }

        statusEl.textContent = `${data.count || results.length} therapist${
          (data.count || results.length) === 1 ? "" : "s"
        } found in the NPI registry for that ZIP. Here are some you can start with:`;

        // Limit how many we show at once
        results.slice(0, 12).forEach((t) => {
          const name = escapeHtml(t.name || "Therapist");
          const credential = escapeHtml(t.credential || "");
          const city = escapeHtml(t.city || "");
          const state = escapeHtml(t.state || "");
          const postal = escapeHtml(t.postal_code || "");
          const phone = escapeHtml(t.phone || "");

          const specialtyText = (t.taxonomies || [])
            .map((tx) => tx && tx.desc)
            .filter(Boolean)
            .join(", ");

          const specialties = escapeHtml(
            specialtyText || "Mental / behavioral health"
          );

          const card = document.createElement("article");
          card.className = "therapist-card";

          card.innerHTML = `
            <div class="therapist-header">
              <h3>${name}${credential ? ", " + credential : ""}</h3>
              <div class="therapist-location">
                ${[city, state, postal].filter(Boolean).join(", ")}
              </div>
            </div>
            <div class="therapist-meta-row">
              <div class="therapist-meta">
                <strong>Specialties</strong>
                <span>${specialties}</span>
              </div>
              <div class="therapist-meta">
                <strong>Phone</strong>
                <span>${phone || "See their website or directory listing"}</span>
              </div>
              <div class="therapist-meta">
                <strong>Next step</strong>
                <span>Look up this name with “therapist” + your city on Google or your insurance portal.</span>
              </div>
            </div>
          `;

          grid.appendChild(card);
        });
      } catch (err) {
        console.error("Therapist API error:", err);
        if (statusEl) {
          statusEl.textContent =
            "We had trouble pulling live matches right now. Your summary is still a great script to use when you search on Psychology Today, your insurance portal, or local directories.";
        }
      }
    }

    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        handleTherapistSubmit();
      });
    }
  }

  /* ===========================
     Library Filters
     =========================== */
  const pillarSelect = document.getElementById("pillar-filter");
  const typeSelect = document.getElementById("type-filter");
  const lengthSelect = document.getElementById("length-filter");
  const cards = document.querySelectorAll(".grid-card");

  if ((pillarSelect || typeSelect || lengthSelect) && cards.length) {
    const meta = new Map();

    // Extract info from grid-tag text
    cards.forEach((card) => {
      const tagEl = card.querySelector(".grid-tag");
      const tagText = (tagEl?.textContent || "").toLowerCase();

      let pillar = "all";
      if (tagText.includes("mental")) pillar = "mental";
      else if (tagText.includes("physical")) pillar = "physical";
      else if (tagText.includes("spiritual")) pillar = "spiritual";

      let type = "other";
      if (tagText.includes("video")) type = "video";
      else if (tagText.includes("article")) type = "article";
      else if (tagText.includes("audio")) type = "audio";
      else if (tagText.includes("reflection")) type = "reflection";

      let length = null;
      const m = tagText.match(/(\d+)\s*min/);
      if (m) length = parseInt(m[1], 10);

      meta.set(card, { pillar, type, length });
    });

    function applyFilters() {
      const pillarVal = (pillarSelect?.value || "All Pillars").toLowerCase();
      const typeVal = (typeSelect?.value || "All Types").toLowerCase();
      const lengthVal = lengthSelect?.value || "Any length";

      cards.forEach((card) => {
        const data = meta.get(card) || {};
        let show = true;

        if (pillarSelect && pillarVal !== "all pillars") {
          if (data.pillar !== pillarVal) show = false;
        }

        if (typeSelect && typeVal !== "all types") {
          const normalizedType = typeVal.split(" ")[0].toLowerCase();
          if (data.type !== normalizedType) show = false;
        }

        if (lengthSelect && lengthVal !== "Any length" && data.length != null) {
          if (lengthVal === "Under 10 minutes" && !(data.length < 10))
            show = false;
          if (
            lengthVal === "10–20 minutes" &&
            !(data.length >= 10 && data.length <= 20)
          )
            show = false;
          if (lengthVal === "20+ minutes" && !(data.length > 20))
            show = false;
        }

        card.style.display = show ? "" : "none";
      });
    }

    pillarSelect?.addEventListener("change", applyFilters);
    typeSelect?.addEventListener("change", applyFilters);
    lengthSelect?.addEventListener("change", applyFilters);
  }

  /* ===========================
     Scroll Reveal Animations
     =========================== */
  const revealTargets = document.querySelectorAll(
    ".card, .grid-card, .section-header, .hero-main, .hero-media"
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1
      }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  } else {
    // Fallback: just show everything
    document
      .querySelectorAll(".reveal")
      .forEach((el) => el.classList.add("is-visible"));
  }
});
