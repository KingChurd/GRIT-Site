
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
