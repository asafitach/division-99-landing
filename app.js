document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll effect
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Nav Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      // Simple toggle animation for hamburger menu
      const spans = navToggle.querySelectorAll('span');
      spans.forEach(span => span.classList.toggle('active'));
    });

    // Close menu when clicking nav link
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // 3. Active Nav Link on scroll
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - 150)) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').slice(1) === current) {
        link.classList.add('active');
      }
    });
  });

  // 4. Interactive Eligibility Checker
  const checkerForm = document.getElementById('checker-form');
  const checkerBox = document.getElementById('eligibility-checker');
  const resultEligible = document.getElementById('result-eligible');
  const resultNotEligible = document.getElementById('result-not-eligible');
  const notEligibleReason = document.getElementById('not-eligible-reason');

  if (checkerForm) {
    checkerForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const age = parseInt(document.getElementById('user-age').value);
      const checkMental = document.getElementById('check-mental-exemption').checked;
      const checkHealth = document.getElementById('check-health').checked;
      const checkDates = document.getElementById('check-dates').checked;
      const checkLoyalty = document.getElementById('check-loyalty').checked;

      // Hide previous results
      resultEligible.style.display = 'none';
      resultNotEligible.style.display = 'none';
      checkerBox.classList.remove('success', 'fail');

      let reasons = [];

      // Validate age (27 - 45)
      if (isNaN(age) || age < 26 || age > 46) {
        reasons.push('הגיל המוכר למסלול זה הוא בין 27 ל-45.');
      }

      // Validate checkboxes (all must be checked to proceed)
      if (!checkMental) {
        reasons.push('פטור מסיבות לא מתאימות (רקע נפשי/עריקות/פלילי) מונע השתלבות במסלול.');
      }
      if (!checkHealth) {
        reasons.push('קיומה של מניעה בריאותית או רפואית המונעת שירות בבסיס סגור.');
      }
      if (!checkDates) {
        reasons.push('אי-זמינות להשתתף בטירונות המתוכננת של שבועיים.');
      }
      if (!checkLoyalty) {
        reasons.push('אי-אישור הצהרת ההצטרפות על דעת שירות ביחידות אוגדה 99 בלבד.');
      }

      // Display evaluation results
      if (reasons.length === 0) {
        // Success
        checkerBox.classList.add('success');
        resultEligible.style.display = 'block';
        resultEligible.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        // Fail
        checkerBox.classList.add('fail');
        let htmlReason = 'לצערנו, נמצאו אי-התאמות לפי הקריטריונים הבאים:<br><ul style="text-align: right; margin-top: 10px; margin-right: 20px;">';
        reasons.forEach(r => {
          htmlReason += `<li>${r}</li>`;
        });
        htmlReason += '</ul>';
        notEligibleReason.innerHTML = htmlReason;
        resultNotEligible.style.display = 'block';
        resultNotEligible.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }
});
