document.addEventListener('DOMContentLoaded', () => {
    gsap.set('.email-card', { opacity: 0, y: 40 });
    gsap.to('.email-card', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out'
    });
  
   
    gsap.to('.floating-inbox-btn', {
      opacity: 1,
      y: 0,
      duration: 0.7,
      delay: 0.3,
      ease: 'power3.out'
    });
  });