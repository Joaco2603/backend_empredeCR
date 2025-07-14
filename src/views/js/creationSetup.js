/**
 * Renderiza contenido basado en roles permitidos (ahora con array).
 * @param {Object} config - Configuración para la página actual.
 * @param {string|string[]} config.roleRequired - Rol o array de roles permitidos (ej: 'entrepreneur' o ['admin', 'organizer']).
 * @param {string} config.containerClass - ID del contenedor donde se insertará el contenido.
 * @param {string} config.html - Template string con HTML personalizado.
 * @param {string} [config.buttonText] - Texto del botón (opcional).
 * @param {string} [config.buttonHref] - Enlace del botón (opcional).
 * @param {Function} [config.onButtonClick] - Función al hacer clic en el botón (opcional).
 */
export function renderRoleBasedContent(config) {
  const userRole = localStorage.getItem('rol');
  const container = document.querySelector('.'+config.containerClass);

  // Convertir roleRequired a array si es un string (para simplificar la lógica)
  const allowedRoles = Array.isArray(config.roleRequired) 
    ? config.roleRequired 
    : [config.roleRequired];

  // Verificar si el rol del usuario está en los permitidos y si el contenedor existe
  if (allowedRoles.includes(userRole) && container) {
    container.innerHTML = config.html;

    if (config.buttonText) {
      const button = document.createElement('button');
      button.textContent = config.buttonText;
      button.classList.add('button', 'button_color_primary');

      if (config.buttonHref) {
        button.addEventListener('click', () => {
          window.location.href = config.buttonHref;
        });
      } else if (config.onButtonClick) {
        button.addEventListener('click', config.onButtonClick);
      }

      container.appendChild(button);
    }
  } else if (container) {
    container.style.display = 'none'; // Opcional: ocultar si el rol no coincide
  }
}