// CV viewer: on desktop, the "Curriculum Vitae" button opens the PDF in an
// overlay (a modal <dialog> with Download / New tab / Close). On touch devices
// and narrow screens, and without JavaScript, the button stays a plain link
// that opens the PDF in a new tab.
//
// The PDF URL lives only in index.qmd (the button's href, a Dropbox link with
// raw=1); the download link is derived from it (dl=1).
(() => {
  const button = document.querySelector("a.cv-button");
  if (!button || typeof HTMLDialogElement !== "function") return;

  const viewUrl = button.href;
  const downloadUrl = viewUrl.replace(/([?&])raw=1\b/, "$1dl=1");
  const useOverlay = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    window.innerWidth >= 768;

  // Build the dialog once, on first use.
  let dialog, frame, savedScroll = 0;
  const build = () => {
    dialog = document.createElement("dialog");
    dialog.className = "cv-dialog";
    dialog.setAttribute("aria-labelledby", "cv-dialog-title");
    dialog.tabIndex = -1;
    dialog.innerHTML = `
      <div class="cv-dialog__panel">
        <div class="cv-dialog__bar">
          <h2 class="cv-dialog__title" id="cv-dialog-title">Curriculum Vitae</h2>
          <a class="cv-dialog__action" href="${downloadUrl}" rel="noopener">
            <i class="bi bi-download" aria-hidden="true"></i> Download</a>
          <a class="cv-dialog__action" href="${viewUrl}" target="_blank" rel="noopener">
            <i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> New tab</a>
          <button type="button" class="cv-dialog__close" aria-label="Close">
            <i class="bi bi-x-lg" aria-hidden="true"></i></button>
        </div>
        <div class="cv-dialog__body">
          <p class="cv-dialog__hint">Loading the CV&hellip;<br>
            If it does not appear here, use <strong>Download</strong> or <strong>New tab</strong> above.</p>
          <iframe class="cv-dialog__frame" title="Curriculum Vitae (PDF)"></iframe>
        </div>
      </div>`;
    frame = dialog.querySelector("iframe");
    dialog.querySelector(".cv-dialog__close").addEventListener("click", () => dialog.close());
    // A click on the dimmed area outside the panel closes the viewer.
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    // Esc closes the dialog natively (cancel -> close); tidy up on any close.
    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("cv-open");
      window.scrollTo({ top: savedScroll, behavior: "instant" });
      button.focus({ preventScroll: true });
    });
    document.body.appendChild(dialog);
  };

  const open = () => {
    if (!dialog) build();
    if (!frame.src) frame.src = viewUrl;       // load the PDF on first open only
    savedScroll = window.scrollY;
    document.documentElement.classList.add("cv-open");  // lock the page behind
    dialog.showModal();
    dialog.focus();

    // Google Analytics: count opening the viewer as a CV view.
    if (typeof window.gtag === "function") {
      window.gtag("event", "cv_view", { method: "overlay" });
    }
  };

  button.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (!useOverlay()) return;                 // phones and tablets: follow the link
    event.preventDefault();
    open();
  });
})();
