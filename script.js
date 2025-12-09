
document.addEventListener("DOMContentLoaded", () => {
  const yearSpan = document.getElementById("footer-year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Mobile nav toggle (simple)
  const toggle = document.querySelector(".nav-toggle");
  const links = document.querySelector(".nav-links");
  const auth = document.querySelector(".nav-auth");
  if (toggle && links && auth) {
    toggle.addEventListener("click", () => {
      const isOpen = links.style.display === "flex";
      links.style.display = isOpen ? "none" : "flex";
      auth.style.display = isOpen ? "none" : "flex";
    });
  }
});
// ----------------------------------------
// Scroll reveal for sections
// ----------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(
    "main section, .static-page section"
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          // Once visible, we don't need to observe it again
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    }
  );

  sections.forEach((section) => {
    section.classList.add("reveal-section");
    observer.observe(section);

    // If you want staggered children in certain sections, you can
    // add the "reveal-stagger" class in HTML later.
  });
});
