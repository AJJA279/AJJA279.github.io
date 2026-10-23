// Referencias al DO
const btnTabLogin = document.getElementById('btn-tab-login');
const btnTabRegister = document.getElementById('btn-tab-register');

const authSubheading = document.getElementById('auth-subheading');
const authTitle = document.getElementById('auth-title');
const authDescription = document.getElementById('auth-description');

const usernameInput = document.getElementById('username');
const usernameCounter = document.getElementById('username-counter');
const usernameHelper = document.getElementById('username-helper');

const forgotLink = document.getElementById('forgot-link');
const pwdHelper = document.getElementById('pwd-helper');
const groupConfirmPassword = document.getElementById('group-confirm-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const termsCheckbox = document.getElementById('terms-checkbox');
const termsLabel = document.getElementById('terms-label');
const btnSubmit = document.getElementById('btn-submit');
const authForm = document.getElementById('auth-form');
const togglePwd = document.getElementById('toggle-pwd');
const passwordInput = document.getElementById('password');

let currentMode = 'login';

// Actualizar contador del nombre de usuario y filtrar caracteres no válidos
usernameInput.addEventListener('input', (e) => {
  // Elimina espacios y caracteres especiales en tiempo real
  e.target.value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
  usernameCounter.textContent = `${e.target.value.length}/20`;
});

// Cambiar a vista Iniciar Sesión
btnTabLogin.addEventListener('click', () => {
  currentMode = 'login';
  btnTabLogin.classList.add('active');
  btnTabRegister.classList.remove('active');

  authSubheading.textContent = 'BIENVENIDO DE NUEVO';
  authTitle.textContent = 'Inicia sesión';
  authDescription.textContent = 'Ingresa tus datos para acceder a tu espacio de trabajo.';
  
  usernameHelper.style.display = 'none';
  forgotLink.style.display = 'block';
  pwdHelper.style.display = 'none';
  groupConfirmPassword.style.display = 'none';
  confirmPasswordInput.removeAttribute('required');

  termsCheckbox.checked = false;
  termsLabel.innerHTML = 'Mantener mi sesión iniciada';
  btnSubmit.textContent = 'Ingresar a SIGECOM';
});

// Cambiar a vista Registrarse
btnTabRegister.addEventListener('click', () => {
  currentMode = 'register';
  btnTabRegister.classList.add('active');
  btnTabLogin.classList.remove('active');

  authSubheading.textContent = 'COMIENZA HOY';
  authTitle.textContent = 'Crea tu cuenta gratis';
  authDescription.textContent = 'Solo necesitas tu cuenta de Gmail y una contraseña segura.';
  
  usernameHelper.style.display = 'block';
  forgotLink.style.display = 'none';
  pwdHelper.style.display = 'block';
  groupConfirmPassword.style.display = 'flex';
  confirmPasswordInput.setAttribute('required', 'true');

  termsCheckbox.checked = false;
  termsLabel.innerHTML = 'Acepto los <a href="#" style="color:#2563eb; text-decoration:none;">términos y condiciones</a> y la política de privacidad.';
  btnSubmit.textContent = 'Crear mi cuenta';
});

// Inicializar vista de login por defecto (ocultar ayuda de username en login)
usernameHelper.style.display = 'none';

// Mostrar/Ocultar contraseña
togglePwd.addEventListener('click', () => {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  togglePwd.classList.toggle('fa-eye');
  togglePwd.classList.toggle('fa-eye-slash');
});

// Manejo del formulario
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const username = usernameInput.value.trim();
  const email = document.getElementById('email').value.trim();
  const password = passwordInput.value;

  let users = JSON.parse(localStorage.getItem('sigecom_users')) || [];

  if (currentMode === 'register') {
    const confirmPassword = confirmPasswordInput.value;

    if (!termsCheckbox.checked) {
      alert('Debes aceptar los términos y condiciones para crear una cuenta.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }

    // Verificar si el correo o el nombre de usuario ya existen
    const emailExists = users.find(u => u.email === email);
    if (emailExists) {
      alert('Ya existe una cuenta registrada con este correo.');
      return;
    }

    const usernameExists = users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
      alert('El nombre de usuario ya está en uso. Elige otro.');
      return;
    }

    // Guardar nuevo usuario con nombre de usuario
    users.push({ username, email, password });
    localStorage.setItem('sigecom_users', JSON.stringify(users));
    alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
    
    btnTabLogin.click();
    authForm.reset();
    usernameCounter.textContent = '0/20';

  } else {
    // Validación al Iniciar Sesión con Nombre de usuario, Correo y Contraseña
    const validUser = users.find(
      u => u.username === username && u.email === email && u.password === password
    );

    if (validUser) {
      localStorage.setItem('sigecom_logged_user', JSON.stringify(validUser));
      window.location.href = 'dashboard.html';
    } else {
      alert('Datos incorrectos. Verifica tu Nombre de usuario, Correo y Contraseña.');
    }
  }
});
