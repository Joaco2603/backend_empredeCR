// nav-user.js
async function setupUserNav() {
  const menu = document.querySelector('.menu');
  if (!menu) {
    console.warn('Elemento con clase ".menu" no encontrado. La navegación de usuario no se inicializará.');
    return;
  }

  
}

// Función para manejar el logout
async function handleLogout(e) {
  e.preventDefault();
  
  if (confirm('¿Cerrar sesión?')) {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Redirigir a la página de login o recargar
        window.location.href = '/login'; // o location.reload();
      } else {
        console.error('Error al cerrar sesión');
        alert('Error al cerrar sesión. Intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error de red al cerrar sesión:', error);
      alert('Error de conexión. Intenta de nuevo.');
    }
  }
}

// Inicializar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', setupUserNav);