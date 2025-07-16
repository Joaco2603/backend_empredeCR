import {renderRoleBasedContent} from './creationSetup.js'

document.addEventListener('DOMContentLoaded', () => {
  const userRole = localStorage.getItem('rol');

  if (userRole === 'admin') {
    // Solo muestra el botón de admin
    renderRoleBasedContent({
      roleRequired: ['admin'],
      containerClass: 'creation_div',
      html: '',
      buttonText: 'Ver nuevos emprendimientos',
      buttonHref: 'entrepreneurAdmin.html',
    });
  } else {
    // Muestra el botón normal (ciudadano/emprendedor)
    renderRoleBasedContent({
    roleRequired: 'entrepreneur',
    containerClass: 'creation_div',
    html: ``,
    buttonText: 'Crear evento',
    buttonHref: 'entrepreneurForm.html',
  });
  }
});