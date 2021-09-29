const registerForm = document.getElementById("registerForm");
const password = document.getElementById("register-password");
const confirmPassword = document.getElementById("register-confirmPassword");

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!(password.value === confirmPassword.value)) {
    alert("Password do not match...Try Once Again");
    location.reload(true);
  } else {
    registerForm.submit();
  }
});
