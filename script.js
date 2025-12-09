// GRIT base script
// - Mobile nav toggle
// - Scroll reveal animations

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------------------
  // Mobile nav toggle (for small screens)
  // ----------------------------------------
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navAuth = document.querySelector(".nav-auth");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("nav-open");
      if (navAuth) navAuth.classList.toggle("nav-open");
    });
  }

  // ----------------------------------------
  // Scroll reveal for sections
  // ----------------------------------------
  const sections = document.querySelectorAll("main section, .static-page section");

  if (sections.length > 0) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
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
    });
  }
});
