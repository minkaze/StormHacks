document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("emailModal");
  const content = modal.querySelector(".email-modal-content");
  const openBtn = document.getElementById("email-card");
  const closeBtn = modal.querySelector("button");
  const fromDiv = document.getElementById("modal-from");
  const subjectDiv = document.getElementById("modal-subject");
  const bodyDiv = document.getElementById("modal-body");

  const showModal = () => {
    gsap.set(modal, { pointerEvents: "auto" });
    gsap.to(modal, { opacity: 1, duration: 0.25, ease: "power1.out" });
    gsap.fromTo(
      content,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
    );
  };

  const hideModal = () => {
    gsap.to(content, {
      scale: 0.8,
      opacity: 0,
      duration: 0.25,
      ease: "power1.in",
      onComplete: () => {
        gsap.to(modal, {
          opacity: 0,
          pointerEvents: "none",
          duration: 0.2,
        });
      },
    });
  };

  openBtn.addEventListener("click", showModal);
  closeBtn.addEventListener("click", hideModal);

  document.querySelectorAll(".open-modal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = btn.getAttribute("data-idx");
      const details = document.querySelector(
        `.email-card[data-idx="${idx}"] .email-details`
      );
      fromDiv.innerHTML = `<strong>From:</strong> ${details.dataset.fromname} &lt;${details.dataset.from}&gt;`;
      subjectDiv.innerHTML = `<strong>Subject:</strong> ${details.dataset.subject}`;
      bodyDiv.innerHTML = `<strong>Body:</strong><br>${details.dataset.content}`;

      modal.classList.remove("hidden");
      gsap.set(modal, { pointerEvents: "auto" });
      gsap.to(modal, { opacity: 1, duration: 0.25, ease: "power1.out" });
    });
  });

  closeBtn.addEventListener("click", () => {
    gsap.to(modal, {
      opacity: 0,
      duration: 0.2,
      ease: "power1.in",
      onComplete: () => {
        modal.classList.add("hidden");
        gsap.set(modal, { pointerEvents: "none" });
      },
    });
  });
});
