document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("emailModal");
  const content = modal.querySelector(".email-modal-content");
  const openBtn = document.getElementById("email-card");
  const closeBtn = modal.querySelector("button");

 
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
});
