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

        let results = document.getElementById("therapist-results")
