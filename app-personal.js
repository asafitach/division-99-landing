document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. Mobile Nav Toggle
  // ==========================================
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

  // ==========================================
  // 2. Default Status Map (Fallback & Definition)
  // ==========================================
  const defaultStatusMap = {
    "A": { code: "A", title: "לא מאושר", message: "הי, לצערנו אין אישור להמשיך בתהליך, כנראה שנמצאה חוסר התאמה (רפואית, נפשית או פלילית). לפרטים נוספים, פנה לצוות הגיוס" },
    "B": { code: "B", title: "לא רלוונטי - יהודי", message: "שלום, יש בעיה עם הרישום שלך כיהודי. נדרש להוציא תמצית מרשם אוכלוסין ממשרד הפנים (באינטירנט) ולהעביר לצוות הגיוס" },
    "C": { code: "C", title: "לא רלוונטי - גיל", message: "יש בעיה - אתם לא נמצאים בטווח הגילאים המתאים. גיל מבוגר ניתן לנסות להחריג" },
    "D": { code: "D", title: "פרופיל לא תקין", message: "הי, לצערנו אין אפשרות להמשיך בתהליך הגיוס עם הפרופיל הנוכחי" },
    "E": { code: "E", title: "חויל", message: "מזל טוב! הגעת ליחידה ולנחלה. תודה רבה על השירות" },
    "F": { code: "F", title: "בטירונות", message: "עוד קצת ומתחילים מילואים!! :)" },
    "G": { code: "G", title: "מיוצב לטירונות", message: "זהו! מוכנים לטירונות. אתם בפנים!" },
    "H": { code: "H", title: "מוכן לגיוס", message: "מצוין! הפרופיל שלך תקין, עכשיו נשארה רק הרשמה לטירונות. כנראה שייצרו איתך קשר ממיט\"ב כדי להזמין לטירונות הקרובה" },
    "I": { code: "I", title: "פרופיל תקין", message: "בשורות מעולות!! יש לך פרופיל מתאים וכנראה שממש בקרוב תוכל לקבל אישור לגיוס בהצלחה!!" },
    "J": { code: "J", title: "השלמת מסמכים - רפואי", message: "הי! איך היה בצו ראשון? שמענו שחסר לך מסמך רפואי - ברגע שתשיג אותו, שלח אותו לצוות הגיוס כדי שיעבירו לצוות המטפל במיט\"ב. בהצלחה ורפואה שלמה!!" },
    "K": { code: "K", title: "עבר צו ראשון", message: "עברת צו ראשון, זה מעולה! זה אומר שעברנו את הבעיות הבירוקרטיות" },
    "L": { code: "L", title: "מזומן לצו ראשון", message: "יופי! נקבע לך תאריך לצו ראשון - מזכירים לך להגיע עם האישור הרפואי בתוקף (תקף עד 4 חודשים מהחתימה)" },
    "M": { code: "M", title: "אישור לביצוע צו ראשון", message: "זה ממש אחלה, אישרו אותך להתחיל בתהליך, השלב הבא זה תור לצו ראשון, נציגי מיט\"ב יצרו איתך קשר בשבועיים הקרובים כדי לזמן אותך לצו ראשון, זה הזמן לבדוק את האישור הרפואי (בתוקף עד 4 חודשים), בהצלחה!!" },
    "N": { code: "N", title: "נדרש בפתיחת רשומה", message: "הצבא עוד לא מכיר אותך! עכשיו צריך לפתוח רשומה כדי שיהיה אפשר להכיר אותך ולהכשיר אותך לטירונות. לצערנו, ההליך הזה יכול לקחת זמן, אז התמלאו סבלנות וקוו לטוב. בפתיחת רשומה עוברים על פרטים ממשרד הפנים/משטרה/קופות חולים אז זה תהליך שלוקח זמן" },
    "O": { code: "O", title: "ממתין לאישור גורמי הצבא", message: "העברנו את הפרטים שלך והם נבחנים כעת ביחידות צה\"ל על מנת למצוא לך התאמה (הבדיקות מתבצעות על ידי הגופים אכ\"א ומיט\"ב)" },
    "P": { code: "P", title: "הרשמה בוצעה בהצלחה", message: "עשית את הצעד הראשון! עכשיו, אנחנו עוברים על הפרטים ומעבירים אותם לבדיקה על ידי צה\"ל כדי לקבל אישור להתחלת התהליך" },
    "Q": { code: "Q", title: "אין הרשמה", message: "לא מצאנו את ההרשמה שלך, עוד לא עשית את הצעד הזה? אם עשית, צור קשר עם צוות הגיוס" }
  };

  // Step mapping for timeline (1-7)
  const statusStepMapping = {
    "P": 1, // הרשמה לשלב ב'
    "N": 2, // סינון ראשוני / פתיחת רשומה
    "O": 2, // ממתין לאישור גורמים
    "M": 3, // אישור לביצוע צו ראשון
    "L": 3, // מזומן לצו ראשון
    "J": 3, // השלמת מסמכים
    "K": 3, // עבר צו ראשון
    "I": 4, // פרופיל תקין
    "H": 4, // מוכן לגיוס
    "G": 4, // מיוצב לטירונות
    "F": 5, // בטירונות
    "E": 7, // חויל - שירות מילואים פעיל
    "A": 0, // לא מאושר
    "B": 0, // לא רלוונטי
    "C": 0, // לא רלוונטי
    "D": 0, // פרופיל לא תקין
    "Q": 0  // אין הרשמה
  };

  let activeStatusMap = { ...defaultStatusMap };
  let statusDataCache = null;

  // ==========================================
  // 3. Load personalStatusMap.csv
  // ==========================================
  function parseCSVMap(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsedMap = {};
    for (const line of lines) {
      const match = line.match(/^([A-Za-z0-9]+)\s*,\s*([^,]+)\s*,\s*"?(".*?"|.+?)"?$/);
      if (match) {
        const code = match[1].trim().toUpperCase();
        const title = match[2].trim();
        let message = match[3].trim();
        message = message.replace(/^"+|"+$/g, '').replace(/""/g, '"').trim();
        parsedMap[code] = { code, title, message };
      } else {
        const parts = line.split(',');
        if (parts.length >= 3) {
          const code = parts[0].trim().toUpperCase();
          const title = parts[1].trim();
          let message = parts.slice(2).join(',').trim();
          message = message.replace(/^"+|"+$/g, '').replace(/""/g, '"').trim();
          parsedMap[code] = { code, title, message };
        }
      }
    }
    return parsedMap;
  }

  // Fetch CSV map if available
  fetch('personalStatusMap.csv')
    .then(res => {
      if (res.ok) return res.text();
      throw new Error("Could not load CSV");
    })
    .then(csvText => {
      const parsed = parseCSVMap(csvText);
      if (parsed && Object.keys(parsed).length > 0) {
        activeStatusMap = { ...defaultStatusMap, ...parsed };
      }
    })
    .catch(err => {
      // Fallback already in activeStatusMap
    });

  // Preload personalStatusData.json
  function loadPersonalStatusData() {
    if (statusDataCache) {
      return Promise.resolve(statusDataCache);
    }
    return fetch('personalStatusData.json')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error("Could not load personalStatusData.json");
      })
      .then(data => {
        statusDataCache = data || {};
        return statusDataCache;
      })
      .catch(err => {
        console.warn("Could not load external personalStatusData.json, using empty dataset:", err);
        statusDataCache = {};
        return statusDataCache;
      });
  }

  // Pre-fetch immediately
  loadPersonalStatusData();

  // ==========================================
  // 4. Candidate Lookup Form Handling
  // ==========================================
  const candidateIdInput = document.getElementById('candidate-id');
  const idValidationError = document.getElementById('id-validation-error');
  const lookupForm = document.getElementById('status-lookup-form');
  const lookupLoading = document.getElementById('lookup-loading');
  const lookupResult = document.getElementById('lookup-result');
  const lookupError = document.getElementById('lookup-error');
  const lookupSubmitBtn = document.getElementById('lookup-submit-btn');

  // DOM fields for candidate output
  const statusBadge = document.getElementById('candidate-status-badge');
  const stepItems = document.querySelectorAll('.status-step-item');
  const timelineWrapper = document.getElementById('timeline-status-wrapper');
  const personalStatusWrapper = document.getElementById('candidate-personal-status-wrapper');
  const personalStatusText = document.getElementById('candidate-personal-status');
  const candidateActionCta = document.getElementById('candidate-action-cta');

  if (candidateIdInput) {
    candidateIdInput.addEventListener('input', (e) => {
      // Clean non-digits
      e.target.value = e.target.value.replace(/\D/g, '');
      idValidationError.style.display = 'none';
    });
  }

  if (lookupForm) {
    lookupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const rawId = candidateIdInput.value.trim().replace(/\D/g, '');
      // Strip leading zeros before comparing with the database (e.g., 020106864 -> 20106864)
      const cleanId = rawId.replace(/^0+/, '');

      // Validation: Must be non-empty, up to 9 digits, and have at least 5 digits
      if (!cleanId || rawId.length > 9 || cleanId.length < 5) {
        idValidationError.style.display = 'block';
        return;
      }

      idValidationError.style.display = 'none';
      lookupResult.style.display = 'none';
      lookupError.style.display = 'none';

      // Show loading spinner
      lookupLoading.style.display = 'block';
      lookupSubmitBtn.disabled = true;

      try {
        const data = await loadPersonalStatusData();
        
        // Short artificial delay for smooth UX transition
        setTimeout(() => {
          lookupLoading.style.display = 'none';
          lookupSubmitBtn.disabled = false;
          
          findAndRenderStatus(cleanId, data);
        }, 200);

      } catch (err) {
        lookupLoading.style.display = 'none';
        lookupSubmitBtn.disabled = false;
        findAndRenderStatus(cleanId, {});
      }
    });
  }

  /**
   * Search for ID across all nodes in personalStatusData.json.
   * Compares IDs after removing leading zeros so both 020106864 and 20106864 match properly.
   * If not found, use status 'Q'.
   */
  function findAndRenderStatus(candidateId, data) {
    const cleanCandidateId = String(candidateId).replace(/\D/g, '').replace(/^0+/, '');
    let matchedStatusCode = 'Q'; // Default if not found

    if (data && typeof data === 'object') {
      for (const [key, node] of Object.entries(data)) {
        const upperKey = key.trim().toUpperCase();
        if (Array.isArray(node)) {
          const isFound = node.some(item => {
            const strItem = String(item).replace(/\D/g, '').replace(/^0+/, '');
            return strItem === cleanCandidateId;
          });
          if (isFound) {
            matchedStatusCode = upperKey;
            break;
          }
        } else if (node && typeof node === 'object') {
          // Object key check
          for (const itemKey of Object.keys(node)) {
            const strKey = String(itemKey).replace(/\D/g, '').replace(/^0+/, '');
            if (strKey === cleanCandidateId) {
              matchedStatusCode = upperKey;
              break;
            }
          }
          if (matchedStatusCode !== 'Q') break;
        } else if (typeof node === 'string' || typeof node === 'number') {
          const strItem = String(node).replace(/\D/g, '').replace(/^0+/, '');
          if (strItem === cleanCandidateId) {
            matchedStatusCode = upperKey;
            break;
          }
        }
      }
    }

    const statusInfo = activeStatusMap[matchedStatusCode] || defaultStatusMap[matchedStatusCode] || defaultStatusMap["Q"];
    const activeStep = statusStepMapping[matchedStatusCode] !== undefined ? statusStepMapping[matchedStatusCode] : 0;

    renderCandidateResult(statusInfo, activeStep);
  }

  function renderCandidateResult(statusInfo, activeStepNum) {
    // 1. Update Status Badge
    statusBadge.textContent = statusInfo.title;
    statusBadge.className = 'status-pill';

    const code = statusInfo.code;
    if (['E', 'F', 'G', 'H', 'I', 'K'].includes(code)) {
      statusBadge.classList.add('status-approved');
    } else if (['A', 'B', 'C', 'D', 'Q'].includes(code)) {
      statusBadge.classList.add('status-rejected');
    } else {
      statusBadge.classList.add('status-review');
    }

    // 2. Update Personal Status Message
    if (statusInfo.message && statusInfo.message.trim() !== '') {
      personalStatusText.textContent = statusInfo.message;
      personalStatusWrapper.style.display = 'block';
    } else {
      personalStatusWrapper.style.display = 'none';
    }

    // 3. CTA button if status is Q (No registration)
    if (code === 'Q' && candidateActionCta) {
      candidateActionCta.style.display = 'block';
    } else if (candidateActionCta) {
      candidateActionCta.style.display = 'none';
    }

    // 4. Timeline Steps
    if (activeStepNum > 0) {
      if (timelineWrapper) timelineWrapper.style.display = 'block';
      stepItems.forEach(item => {
        const stepNum = parseInt(item.getAttribute('data-step'));
        item.classList.remove('active', 'completed');

        if (stepNum < activeStepNum) {
          item.classList.add('completed');
        } else if (stepNum === activeStepNum) {
          item.classList.add('active');
        }
      });
    } else {
      // Disqualified / Not in timeline (A, B, C, D, Q)
      if (timelineWrapper) timelineWrapper.style.display = 'none';
    }

    // Display result card
    lookupResult.style.display = 'block';
    lookupResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

});
