document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }

  // 2. Mobile Nav Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const spans = navToggle.querySelectorAll('span');
      spans.forEach(span => span.classList.toggle('active'));
    });

    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans.forEach(span => span.classList.remove('active'));
      });
    });
  }

  // 3. Role Filter Buttons
  const filterBtns = document.querySelectorAll('.role-filter-btn');
  const roleCards = document.querySelectorAll('.role-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      roleCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || filter === category) {
          card.style.display = 'grid';
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 40);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 4. Multi-Image Thumbnail Switcher for Optics & Armament
  const thumbBtns = document.querySelectorAll('.role-thumb-btn');
  thumbBtns.forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      const parentMedia = thumb.closest('.role-card-media');
      const mainImg = parentMedia.querySelector('.role-card-img');
      const targetSrc = thumb.getAttribute('data-src');

      if (mainImg && targetSrc) {
        mainImg.style.opacity = '0.4';
        setTimeout(() => {
          mainImg.src = targetSrc;
          mainImg.style.opacity = '1';
        }, 120);

        parentMedia.querySelectorAll('.role-thumb-btn').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      }
    });
  });
});
