import {renderRoleBasedContent} from './creationSetup.js'

document.addEventListener('DOMContentLoaded', () => {
  renderRoleBasedContent({
    roleRequired: 'admin',
    containerClass: 'creation_div',
    html: ``,
    buttonText: 'Crear transporte',
    buttonHref: 'transportForm.html',
  });
});