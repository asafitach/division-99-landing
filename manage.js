// הגדר כאן את סיסמת הניהול
const SECRET_PASSWORD = "jG98!jdi99))"; 

function checkPassword() {
  const inputEl = document.getElementById("password-input");
  const input = inputEl ? inputEl.value.trim() : "";
  const errorMsg = document.getElementById("error-msg");
  
  if (input === SECRET_PASSWORD) {
    // הסתרת ההתחברות והצגת אזור הניהול
    document.getElementById("login-section").style.display = "none";
    document.getElementById("content-section").style.display = "block";
    if (errorMsg) errorMsg.style.display = "none";
    
    // שמירת המצב בסשן כדי שלא יידרש להקליד שוב בכל רענון
    sessionStorage.setItem("isManager", "true");
  } else {
    if (errorMsg) {
      errorMsg.style.display = "inline-flex";
    }
    if (inputEl) {
      inputEl.focus();
      inputEl.select();
    }
  }
}

function logout() {
  sessionStorage.removeItem("isManager");
  document.getElementById("login-section").style.display = "block";
  document.getElementById("content-section").style.display = "none";
  const inputEl = document.getElementById("password-input");
  if (inputEl) {
    inputEl.value = "";
    inputEl.focus();
  }
  const errorMsg = document.getElementById("error-msg");
  if (errorMsg) errorMsg.style.display = "none";
}

// בדיקה בעת טעינת הדף ותמיכה במקש Enter
document.addEventListener("DOMContentLoaded", function() {
  if (sessionStorage.getItem("isManager") === "true") {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("content-section").style.display = "block";
  }

  const pwdInput = document.getElementById("password-input");
  if (pwdInput) {
    pwdInput.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        checkPassword();
      }
    });
    if (sessionStorage.getItem("isManager") !== "true") {
      pwdInput.focus();
    }
  }
});