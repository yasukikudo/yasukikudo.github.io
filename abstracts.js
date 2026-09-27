// Abstract toggles: each paper title is a plain link to the paper; the small
// "Abstract" button after it shows or hides the abstract below.
// Without JavaScript the buttons are hidden and every abstract stays open
// (styles.css keys this on the "js" class set in head-links.html).
(() => {
  for (const button of document.querySelectorAll(".abstract-toggle")) {
    const abstract = document.getElementById(button.getAttribute("aria-controls"));
    if (!abstract) continue;
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      button.setAttribute("aria-expanded", String(open));
      abstract.classList.toggle("is-open", open);
    });
  }

  // A pill that wraps onto a line of its own (a long title, a narrow
  // screen) gets the class "on-own-line": styles.css then sets it flush left
  // with a little room above, instead of indented and touching the title.
  const pills = [...document.querySelectorAll(".pub-title .abstract-toggle")];
  const mark = () => {
    for (const pill of pills) {
      pill.classList.remove("on-own-line");
      const text = pill.previousElementSibling;           // the title (<strong> or <span>)
      if (!text) continue;
      const range = document.createRange();
      range.selectNodeContents(text);
      const lines = range.getClientRects();
      const last = lines[lines.length - 1];
      if (last && pill.getBoundingClientRect().top >= last.bottom - 2) pill.classList.add("on-own-line");
    }
  };
  let frame = 0;
  const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(mark); };
  schedule();
  document.fonts?.ready.then(schedule);
  window.addEventListener("resize", schedule);
})();
