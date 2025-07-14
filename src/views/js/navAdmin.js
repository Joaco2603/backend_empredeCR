// nav-user.js
function setupUserNav() {
  // Obtener datos de usuario (ejemplo con localStorage)
  // Asegúrate de que 'rol' en localStorage sea un JSON string si esperas un objeto.
  // Si solo guardas 'admin', 'user', etc., entonces userData será un string.
  const userData = localStorage.getItem('rol');

  const menu = document.querySelector('.menu');
  if (!menu) {
    console.warn('Elemento con clase ".menu" no encontrado. La navegación de usuario no se inicializará.');
    return;
  }

  // Limpiar item existente si hay
  const oldUserItem = document.querySelector('.user-nav-item');
  if (oldUserItem) {
    oldUserItem.remove();
  }

  // --- Código para crear el nuevo item ---

  // 1. Crear el elemento <li> (el contenedor del ítem del menú)
  const userNavItem = document.createElement('li');
  userNavItem.classList.add('nav-item', 'user-nav-item'); // Añade clases para estilos y para identificarlo

  // 2. Crear el elemento <a> (el enlace)
  const userLink = document.createElement('a');
  userLink.classList.add('nav-link'); // Clase para estilos del enlace

  // 4. Añadir el enlace (<a>) al elemento de lista (<li>)
  userNavItem.appendChild(userLink);

  // 5. Añadir el elemento de lista (<li>) al menú (<ul> o <nav>)
  menu.appendChild(userNavItem);

  // --- Fin del código de creación ---

  // Añadir funcionalidad de logout SOLO si el usuario está logueado y no es 'admin'
  // Nota: Si 'userData' es solo el string 'admin', 'user', etc., no tiene una propiedad 'role'.
  // Si esperas un objeto, deberías hacer JSON.parse(localStorage.getItem('rol'))
  if (userData && userData !== 'admin') { // Asumiendo que userData es el string 'admin' o 'user'
    userLink.addEventListener('click', (e) => {
      e.preventDefault(); // Previene la navegación por defecto del enlace
      if (confirm('¿Cerrar sesión?')) {
        localStorage.removeItem('rol'); // Limpia el rol del localStorage
        location.reload(); // Recarga la página para aplicar los cambios de sesión
      }
    });
  } else if (userData === 'admin') {
      // Si es admin, puedes querer redirigir a un panel de administración
      userLink.href = './users.html'; // Ejemplo: un enlace para administradores
      userLink.textContent = `Usuarios`;
  }
}

// Inicializar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', setupUserNav);