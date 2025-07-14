import {renderRoleBasedContent} from './creationSetup.js'

document.addEventListener('DOMContentLoaded', () => {
  const userRole = localStorage.getItem('rol');

  if (userRole === 'admin') {
    // Solo muestra el botón de admin
    renderRoleBasedContent({
      roleRequired: ['admin'],
      containerClass: 'creation_div',
      html: '',
      buttonText: 'Ver nuevas quejas',
      buttonHref: 'complaintAdmin.html',
    });
  } else {
    // Muestra el botón normal (ciudadano/emprendedor)
    renderRoleBasedContent({
      roleRequired: ['citizen', 'entrepreneur'],
      containerClass: 'creation_div',
      html: '',
      buttonText: 'Crear queja',
      buttonHref: 'complaintForm.html',
    });
  }
});