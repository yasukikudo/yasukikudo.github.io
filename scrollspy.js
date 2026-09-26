// Scrollspy for the in-page navbar links (publications / in progress / teaching).
// Quarto only highlights links to other pages, so this script:
//   - marks the navbar link whose section is under the navbar (.is-current),
//   - scrolls smoothly on click (instantly with prefers-reduced-motion),
//   - closes the collapsed mobile menu after a tap.
(() => {
  const header = document.getElementById("quarto-header");
  const links = [...document.querySelectorAll(".navbar .nav-link[href*='#']")];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Each section heading sits in the left column of a .columns row;
  // the whole row is what the reader sees as "the section".
  const entries = links.map((link) => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    return target && { link, id: target.id, row: target.closest("div.columns") || target };
  }).filter(Boolean);
  if (!entries.length) return;

  const navHeight = () => (header ? header.offsetHeight : 0);
  const syncNavHeight = () =>
    document.documentElement.style.setProperty("--nav-h", navHeight() + "px");

  const setCurrent = (current) => {
    for (const { link } of entries) {
      const on = link === current;
      link.classList.toggle("is-current", on);
      if (on) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    }
  };

  // The current section is the last one whose row has crossed a line a
  // little below the navbar; at the very bottom of the page, the last one.
  const spyLine = () => Math.round(navHeight() + window.innerHeight * 0.3);
  const update = () => {
    const line = spyLine();
    const doc = document.documentElement;
    const atBottom = window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
    let current = null;
    for (const e of entries) {
      if (e.row.getBoundingClientRect().top <= line) current = e.link;
    }
    setCurrent(atBottom ? entries[entries.length - 1].link : current);
  };

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };

  // Shrink the observer's root to a 1px strip at the spy line, so it fires
  // exactly when a row's top or bottom edge crosses that line.
  let rowObserver;
  const observeRows = () => {
    if (rowObserver) rowObserver.disconnect();
    const line = spyLine();
    const below = Math.max(window.innerHeight - line - 1, 0);
    rowObserver = new IntersectionObserver(schedule, { rootMargin: `-${line}px 0px -${below}px 0px` });
    entries.forEach((e) => rowObserver.observe(e.row));
  };
  // A second observer catches "scrolled to the end of the page".
  const footer = document.querySelector("main footer");
  if (footer) new IntersectionObserver(schedule).observe(footer);

  for (const { link, id, row } of entries) {
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      history.pushState(null, "", "#" + id);
      setCurrent(link);

      const scroll = () => row.scrollIntoView({
        behavior: reduceMotion.matches ? "auto" : "smooth",
        block: "start",
      });

      // On mobile, close the open menu first: the page shifts while the
      // menu collapses, so scroll only once it has finished closing.
      const menu = document.getElementById("navbarCollapse");
      if (menu && menu.classList.contains("show") && window.bootstrap) {
        menu.addEventListener("hidden.bs.collapse", scroll, { once: true });
        window.bootstrap.Collapse.getOrCreateInstance(menu).hide();
      } else {
        scroll();
      }
    });
  }

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { syncNavHeight(); observeRows(); schedule(); }, 150);
  });

  // Opening the page with a hash (e.g. /#teaching): the browser's initial
  // jump can land short while fonts and images are still shifting the
  // layout, so re-align once everything has loaded.
  const initial = entries.find((e) => "#" + e.id === decodeURIComponent(location.hash));
  if (initial) {
    const realign = () => document.fonts.ready.then(() => {
      initial.row.scrollIntoView({ behavior: "instant", block: "start" });
    });
    if (document.readyState === "complete") realign();
    else window.addEventListener("load", realign, { once: true });
  }

  syncNavHeight();
  observeRows();
  update();
})();
