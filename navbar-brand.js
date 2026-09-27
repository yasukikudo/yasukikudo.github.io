// Navbar brand: Quarto renders the logo and the name as two separate links
// to the same page. Merge them into one link ("Yasuki Kudo"), with the logo
// as decoration, so keyboard and screen-reader users meet a single stop.
(() => {
  const container = document.querySelector(".navbar-brand-container");
  if (!container) return;
  const [logoLink, nameLink] = container.querySelectorAll("a.navbar-brand");
  if (!logoLink || !nameLink) return;
  logoLink.querySelectorAll("img").forEach((img) => { img.alt = ""; });
  logoLink.append(...nameLink.childNodes);
  nameLink.remove();
})();
