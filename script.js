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
     Therapist Form "AI-style" Summary
     =========================== */
  const therapistForm = document.getElementById("therapist-form");

  if (therapistForm) {
    const submitBtn = therapistForm.querySelector('button[type="button"]');

    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        const loc = therapistForm.querySelector("#location")?.value.trim();
        const format = therapistForm.querySelector("#format")?.value || "";
        const focus = therapistForm.querySelector("#focus")?.value || "";
        const budget = therapistForm.querySelector("#budget")?.value || "";
        const prefs = therapistForm.querySelector("#preferences")?.value.trim();

        let summary = `<p>Based on what you shared, here’s a starting point:</p><ul>`;

        if (focus) summary += `<li><strong>Main focus:</strong> ${focus}</li>`;
        if (format && format !== "No preference")
          summary += `<li><strong>Preferred format:</strong> ${format}</li>`;
        if (budget && budget !== "No preference")
          summary += `<li><strong>Budget:</strong> ${budget} per session</li>`;
        if (loc) summary += `<li><strong>Location:</strong> ${loc}</li>`;
        if (prefs)
          summary += `<li><strong>Preferences:</strong> ${prefs}</li>`;

        summary += `</ul>
          <p>This suggests looking for:</p>
          <ul>
            <li>A therapist who lists <strong>${focus ||
              "your main concern"}</strong> as a specialty.</li>
            <li>Offers <strong>${
              format && format !== "No preference"
                ? format.toLowerCase()
                : "in-person or telehealth"
            }</strong> sessions.</li>
            <li>Fits roughly in the <strong>${
              budget && budget !== "No preference"
                ? budget
                : "budget range you’re comfortable with"
            }</strong>.</li>
          </ul>
          <p>Use this summary as a script when you reach out or schedule an intro call.</p>`;

        let results = document.getElementById("therapist-results");
        if (!results) {
          results = document.createElement("section");
          results.id = "therapist-results";

          const main = document.querySelector("main");
          if (main) {
            main.appendChild(results);
          } else if (therapistForm.parentNode) {
            therapistForm.parentNode.insertBefore(
              results,
              therapistForm.nextSibling
            );
          }
        }

        results.innerHTML = `
          <div class="card">
            <div class="card-label">Step 2</div>
            <h2 class="card-title">Your starting recommendation</h2>
            <p class="card-tagline">
              This isn’t a diagnosis, just a direction to help you have a clearer first conversation with a therapist.
            </p>
            ${summary}
          </div>
        `;

        results.scrollIntoView({ behavior: "smooth", block: "start" });
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
        threshold: 0.1,
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
