document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // CONFIGURATION
  // Paste your published Google Apps Script URL here:
  // ==========================================
  const API_URL =
    "https://script.google.com/macros/s/AKfycbyw2k9fljh39cQRumWknS7ByoKAic4I4L7qSeGHRb96vxajCMclENgN2WZohKtJ7Umt/exec";

  // 1. Mobile Nav Toggle (Same as main page for consistency)
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
      });
    });
  }

  // 2. ID Input Masking (allow only digits)
  const candidateIdInput = document.getElementById('candidate-id');
  const idValidationError = document.getElementById('id-validation-error');

  if (candidateIdInput) {
    candidateIdInput.addEventListener('input', (e) => {
      // Clean non-digits
      e.target.value = e.target.value.replace(/\D/g, '');

      // Hide error if they are editing
      idValidationError.style.display = 'none';
    });
  }

  // 3. Candidate Lookup Form Submission
  const lookupForm = document.getElementById('status-lookup-form');
  const lookupLoading = document.getElementById('lookup-loading');
  const lookupResult = document.getElementById('lookup-result');
  const lookupError = document.getElementById('lookup-error');
  const lookupSubmitBtn = document.getElementById('lookup-submit-btn');

  // DOM fields for candidate output
  const statusBadge = document.getElementById('candidate-status-badge');
  const stepItems = document.querySelectorAll('.status-step-item');
  const personalStatusWrapper = document.getElementById('candidate-personal-status-wrapper');
  const personalStatusText = document.getElementById('candidate-personal-status');

  if (lookupForm) {
    lookupForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const idVal = candidateIdInput.value.trim();

      // Validation
      if (idVal.length !== 9) {
        idValidationError.style.display = 'block';
        return;
      }

      idValidationError.style.display = 'none';

      // Reset UI
      lookupResult.style.display = 'none';
      lookupError.style.display = 'none';

      // Show loading
      lookupLoading.style.display = 'block';
      lookupSubmitBtn.disabled = true;

      // Check if URL is not configured
      if (API_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
        setTimeout(() => {
          showDemoData(idVal);
        }, 800);
        return;
      }

      // Fetch status from Apps Script GET endpoint
      fetch(`${API_URL}?id=${idVal}`)
        .then(response => response.json())
        .then(data => {
          lookupLoading.style.display = 'none';
          lookupSubmitBtn.disabled = false;

          if (data.success) {
            renderCandidateStatus(data.status, data.step, data.personalStatus);
          } else {
            showLookupError("מספר תעודת הזהות שהזנת אינו מופיע במערכת הגיוס.");
          }
        })
        .catch(error => {
          console.error("Error fetching status:", error);
          lookupLoading.style.display = 'none';
          lookupSubmitBtn.disabled = false;
          showLookupError("שגיאת תקשורת. לא הצלחנו להתחבר לשרת הגיוס. אנא נסה שוב מאוחר יותר.");
        });
    });
  }

  function renderCandidateStatus(statusText, activeStepNum, personalStatusVal) {
    // 1. Update Status Badge text and styling
    statusBadge.textContent = statusText;

    // Clear status classes
    statusBadge.className = 'status-pill';

    // Assign class based on status value (for visual color scheme)
    if (statusText.includes('שובץ') || statusText.includes('מלא') || statusText.includes('מתאים') && !statusText.includes('לא')) {
      statusBadge.classList.add('status-approved');
    } else if (statusText.includes('לא') || statusText.includes('דחוי')) {
      statusBadge.classList.add('status-rejected');
    } else if (statusText.includes('בתהליך') || statusText.includes('בדיקה') || statusText.includes('ממתין')) {
      statusBadge.classList.add('status-review');
    } else {
      statusBadge.classList.add('status-pending');
    }

    // 2. Highlight recruitment steps
    stepItems.forEach(item => {
      const stepNum = parseInt(item.getAttribute('data-step'));

      // Reset classes
      item.classList.remove('active', 'completed');

      if (stepNum < activeStepNum) {
        item.classList.add('completed');
      } else if (stepNum === activeStepNum) {
        item.classList.add('active');
      }
    });

    // 3. Update Personal Status if provided
    if (personalStatusVal && personalStatusVal.trim() !== '') {
      personalStatusText.textContent = personalStatusVal;
      personalStatusWrapper.style.display = 'block';
    } else {
      personalStatusWrapper.style.display = 'none';
    }

    // Show results panel
    lookupResult.style.display = 'block';
    lookupResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function showLookupError(message) {
    const errorMsg = document.getElementById('lookup-error-msg');
    if (errorMsg) {
      errorMsg.textContent = message;
    }
    lookupError.style.display = 'block';
    lookupError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Demo Fallback Data for test when URL is not set yet
  function showDemoData(idVal) {
    lookupLoading.style.display = 'none';
    lookupSubmitBtn.disabled = false;

    // Hardcoded demo responses for validation testing
    if (idVal === "123456789") {
      renderCandidateStatus("נקבעה טירונות (מועד: 26.02.26)", 4, "נא לתאם מול רכזת הגיוס הגשת מסמכים חסרים עד סוף השבוע.");
    } else if (idVal === "987654321") {
      renderCandidateStatus("שובץ במילואים פעילים באלו״ג 99", 7, "גיוסך הושלם בהצלחה! תודה על תרומתך.");
    } else if (idVal === "111111111") {
      renderCandidateStatus("בתהליך סינון ראשוני", 2, "המסמכים שלך בבדיקה אצל קצין המיון.");
    } else if (idVal === "000000000") {
      renderCandidateStatus("לא נמצא מתאים לגיוס שלב ב׳", 2, "לפרטים נוספים ניתן לפנות למרכז השירות.");
    } else {
      showLookupError("הערת הדגמה: תעודת זהות זו לא רשומה במאגר. (נסה להקליד 123456789 או 987654321 או 111111111 לצורך בדיקת דמו).");
    }
  }

  // ==========================================
  // ADMIN PANEL LOGIC
  // ==========================================
  const toggleAdminLink = document.getElementById('toggle-admin-link');
  const adminSection = document.getElementById('admin-section');
  const adminLoginBox = document.getElementById('admin-login-box');
  const adminDashboardPanel = document.getElementById('admin-dashboard-panel');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminPasswordInput = document.getElementById('admin-password');
  const adminLoginError = document.getElementById('admin-login-error');

  // Roster table components
  const rosterLoading = document.getElementById('roster-loading');
  const rosterTableWrapper = document.getElementById('roster-table-wrapper');
  const rosterTableBody = document.getElementById('roster-table-body');
  const rosterEmptyMsg = document.getElementById('roster-empty-msg');
  const refreshRosterBtn = document.getElementById('refresh-roster-btn');

  // Candidate edit form components
  const candidateUpdateForm = document.getElementById('candidate-update-form');
  const formActionTitle = document.getElementById('form-action-title');
  const editIdInput = document.getElementById('edit-id');
  const editNameInput = document.getElementById('edit-name');
  const editStatusSelect = document.getElementById('edit-status');
  const editStepSelect = document.getElementById('edit-step');
  const editCommentsInput = document.getElementById('edit-comments');
  const editPhoneInput = document.getElementById('edit-phone');
  const editPersonalStatusInput = document.getElementById('edit-personal-status');
  const saveCandidateBtn = document.getElementById('save-candidate-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editSubmitMsg = document.getElementById('edit-submit-msg');

  let isEditingMode = false;

  // Toggle Admin Section Visibility
  if (toggleAdminLink) {
    toggleAdminLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (adminSection.style.display === 'none') {
        adminSection.style.display = 'block';
        adminSection.scrollIntoView({ behavior: 'smooth' });

        // Auto check if already logged in this session
        const savedPass = sessionStorage.getItem('adminPassword');
        if (savedPass) {
          adminLoginBox.style.display = 'none';
          adminDashboardPanel.style.display = 'block';
          loadRoster(savedPass);
        }
      } else {
        adminSection.style.display = 'none';
      }
    });
  }

  // Check URL parameters (e.g. personal.html?admin=true)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('admin') === 'true' && adminSection) {
    adminSection.style.display = 'block';
    setTimeout(() => {
      adminSection.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  }

  // Admin login request
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = adminPasswordInput.value;

      adminLoginError.style.display = 'none';

      if (API_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
        // Mock Login for local testing
        if (password === "99_admin_secure_pass") {
          sessionStorage.setItem('adminPassword', password);
          adminLoginBox.style.display = 'none';
          adminDashboardPanel.style.display = 'block';
          loadRoster(password);
        } else {
          adminLoginError.textContent = "סיסמה שגויה. (הערת דמו: סיסמת ברירת המחדל היא 99_admin_secure_pass)";
          adminLoginError.style.display = 'block';
        }
        return;
      }

      // Real API Authentication
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // Avoid CORS preflight on simple requests
        body: JSON.stringify({ action: "login", password: password })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            sessionStorage.setItem('adminPassword', password);
            adminLoginBox.style.display = 'none';
            adminDashboardPanel.style.display = 'block';
            loadRoster(password);
          } else {
            adminLoginError.textContent = "סיסמה שגויה. אנא נסה שנית.";
            adminLoginError.style.display = 'block';
          }
        })
        .catch(err => {
          console.error("Login request failed:", err);
          adminLoginError.textContent = "שגיאת תקשורת בחיבור למאגר.";
          adminLoginError.style.display = 'block';
        });
    });
  }

  // Roster fetching
  function loadRoster(password) {
    rosterTableWrapper.style.display = 'none';
    rosterEmptyMsg.style.display = 'none';
    rosterLoading.style.display = 'block';

    if (API_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
      // Mock data load
      setTimeout(() => {
        const mockRoster = [
          { id: "123456789", name: "ישראל ישראלי", status: "נקבעה טירונות (מועד: 26.02.26)", step: 4, comments: "בחור מצוין, עבר צו ראשון", lastUpdated: "10/06/2026 12:00", phone: "0501234567", personalStatus: "נא לתאם מול רכזת הגיוס הגשת מסמכים חסרים" },
          { id: "987654321", name: "אלי כהן", status: "שובץ במילואים פעילים באלו״ג 99", step: 7, comments: "שובץ בגדוד ניוד", lastUpdated: "09/06/2026 15:30", phone: "0529876543", personalStatus: "גיוסך הושלם בהצלחה!" },
          { id: "111111111", name: "משה לוי", status: "בתהליך סינון ראשוני", step: 2, comments: "ממתין להשלמת טפסים", lastUpdated: "10/06/2026 09:15", phone: "0541112222", personalStatus: "המסמכים שלך בבדיקה אצל קצין המיון." },
          { id: "000000000", name: "יוסי אברהם", status: "לא נמצא מתאים לגיוס שלב ב׳", step: 2, comments: "פטור על רקע רפואי", lastUpdated: "08/06/2026 10:00", phone: "0530000000", personalStatus: "לפרטים נוספים ניתן לפנות למרכז השירות." }
        ];
        renderRoster(mockRoster);
      }, 500);
      return;
    }

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: "get_all", password: password })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          renderRoster(data.roster);
        } else {
          alert("פג תוקף החיבור או שהסיסמה אינה תקינה. אנא התחבר מחדש.");
          logoutAdmin();
        }
      })
      .catch(err => {
        console.error("Error loading roster:", err);
        rosterLoading.style.display = 'none';
        alert("שגיאת תקשורת בטעינת רשימת המועמדים.");
      });
  }

  function renderRoster(roster) {
    rosterLoading.style.display = 'none';
    rosterTableBody.innerHTML = '';

    if (!roster || roster.length === 0) {
      rosterEmptyMsg.style.display = 'block';
      rosterTableWrapper.style.display = 'none';
      return;
    }

    roster.forEach(c => {
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid rgba(68, 91, 68, 0.15)';
      row.innerHTML = `
        <td style="padding: 12px 8px; font-weight: 500;">${c.name}</td>
        <td style="padding: 12px 8px; font-family: monospace;">${c.id}</td>
        <td style="padding: 12px 8px; font-family: monospace;">${c.phone || ''}</td>
        <td style="padding: 12px 8px;"><span class="status-pill ${getStatusPillClass(c.status)}" style="font-size: 0.8rem; padding: 4px 10px;">${c.status}</span></td>
        <td style="padding: 12px 8px; text-align: center; font-weight: 700; color: var(--color-gold);">${c.step}</td>
        <td style="padding: 12px 8px; font-size: 0.85rem; color: var(--text-muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c.personalStatus || ''}">${c.personalStatus || ''}</td>
        <td style="padding: 12px 8px;">
          <button class="edit-candidate-btn" data-id="${c.id}" data-name="${c.name}" data-status="${c.status}" data-step="${c.step}" data-comments="${c.comments || ''}" data-phone="${c.phone || ''}" data-personal-status="${c.personalStatus || ''}" style="background-color: var(--color-green-medium); border: 1px solid var(--color-green-light); color: var(--text-primary); padding: 4px 8px; border-radius: var(--border-radius-sm); cursor: pointer; font-size: 0.85rem;">
            ערוך <i class="fas fa-edit"></i>
          </button>
        </td>
      `;
      rosterTableBody.appendChild(row);
    });

    rosterTableWrapper.style.display = 'block';

    // Attach event listeners to all newly created Edit buttons
    const editButtons = rosterTableBody.querySelectorAll('.edit-candidate-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.currentTarget;
        enterEditingMode({
          id: target.getAttribute('data-id'),
          name: target.getAttribute('data-name'),
          status: target.getAttribute('data-status'),
          step: target.getAttribute('data-step'),
          comments: target.getAttribute('data-comments'),
          phone: target.getAttribute('data-phone'),
          personalStatus: target.getAttribute('data-personal-status')
        });
      });
    });
  }

  function getStatusPillClass(statusText) {
    if (statusText.includes('שובץ') || statusText.includes('מלא') || statusText.includes('מתאים') && !statusText.includes('לא')) {
      return 'status-approved';
    } else if (statusText.includes('לא') || statusText.includes('דחוי')) {
      return 'status-rejected';
    } else if (statusText.includes('בתהליך') || statusText.includes('בדיקה') || statusText.includes('ממתין')) {
      return 'status-review';
    } else {
      return 'status-pending';
    }
  }

  // Refresh Roster Event
  if (refreshRosterBtn) {
    refreshRosterBtn.addEventListener('click', () => {
      const password = sessionStorage.getItem('adminPassword');
      if (password) {
        loadRoster(password);
      }
    });
  }

  // Enter Editing Mode
  function enterEditingMode(candidate) {
    isEditingMode = true;

    formActionTitle.innerHTML = `<i class="fas fa-user-edit" style="color: var(--color-gold); margin-left: 6px;"></i> עריכת מועמד`;
    editIdInput.value = candidate.id;
    editIdInput.disabled = true; // Disable editing primary key ID
    editIdInput.style.opacity = '0.6';

    editNameInput.value = candidate.name;
    editStatusSelect.value = candidate.status;

    // Auto select stage index or fallback
    editStepSelect.value = candidate.step.toString();
    editCommentsInput.value = candidate.comments;
    editPhoneInput.value = candidate.phone || '';
    editPersonalStatusInput.value = candidate.personalStatus || '';

    saveCandidateBtn.textContent = 'עדכן מועמד';
    cancelEditBtn.style.display = 'block';

    editSubmitMsg.style.display = 'none';

    // Scroll form into view on mobile
    candidateUpdateForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Cancel Editing Mode
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', exitEditingMode);
  }

  function exitEditingMode() {
    isEditingMode = false;

    formActionTitle.innerHTML = `<i class="fas fa-user-plus" style="color: var(--color-gold); margin-left: 6px;"></i> הוספת מועמד חדש`;
    editIdInput.value = '';
    editIdInput.disabled = false;
    editIdInput.style.opacity = '1';

    editNameInput.value = '';
    editStatusSelect.selectedIndex = 0;
    editStepSelect.selectedIndex = 0;
    editCommentsInput.value = '';
    editPhoneInput.value = '';
    editPersonalStatusInput.value = '';

    saveCandidateBtn.textContent = 'שמור מועמד';
    cancelEditBtn.style.display = 'none';

    editSubmitMsg.style.display = 'none';
  }

  // Add/Update Candidate form submit
  if (candidateUpdateForm) {
    candidateUpdateForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const password = sessionStorage.getItem('adminPassword');
      if (!password) {
        alert("נא להתחבר מחדש.");
        logoutAdmin();
        return;
      }

      const id = editIdInput.value.trim().replace(/\D/g, '');
      const name = editNameInput.value.trim();
      const status = editStatusSelect.value;
      const step = parseInt(editStepSelect.value);
      const comments = editCommentsInput.value.trim();
      const phone = editPhoneInput.value.trim();
      const personalStatus = editPersonalStatusInput.value.trim();

      if (id.length !== 9) {
        alert("תעודת הזהות חייבת להכיל 9 ספרות בדיוק.");
        return;
      }

      editSubmitMsg.textContent = 'שומר שינויים במאגר...';
      editSubmitMsg.style.color = 'var(--text-muted)';
      editSubmitMsg.style.display = 'block';

      if (API_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE") {
        // Mock Update for local testing
        setTimeout(() => {
          editSubmitMsg.textContent = 'המועמד נשמר בהצלחה (מצב דמו)';
          editSubmitMsg.style.color = 'var(--color-gold)';

          exitEditingMode();
          loadRoster(password);
        }, 500);
        return;
      }

      const payload = {
        action: "update",
        password: password,
        id: id,
        name: name,
        status: status,
        step: step,
        comments: comments,
        phone: phone,
        personalStatus: personalStatus
      };

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            editSubmitMsg.textContent = isEditingMode ? 'המועמד עודכן בהצלחה!' : 'המועמד נוסף בהצלחה!';
            editSubmitMsg.style.color = 'var(--color-gold)';

            exitEditingMode();
            loadRoster(password);
          } else {
            editSubmitMsg.textContent = `שגיאה: ${data.error}`;
            editSubmitMsg.style.color = 'var(--color-red)';
          }
        })
        .catch(err => {
          console.error("Update request failed:", err);
          editSubmitMsg.textContent = 'שגיאת תקשורת בחיבור לשרת.';
          editSubmitMsg.style.color = 'var(--color-red)';
        });
    });
  }

  function logoutAdmin() {
    sessionStorage.removeItem('adminPassword');
    adminLoginBox.style.display = 'block';
    adminDashboardPanel.style.display = 'none';
    adminPasswordInput.value = '';
    exitEditingMode();
  }
});
