/**
 * Script genérico para editar cards y enviar PUT a un endpoint.
 * 
 * @param {string} cardSelector - Selector de las cards (ej: '.card')
 * @param {Object} fields - Mapeo de clase en card a { label, inputType, key, placeholder }
 * @param {string} editBtnSelector - Selector del botón editar dentro de la card (ej: '.edit-btn')
 * @param {string} putUrl - URL base para el endpoint PUT (ej: '/api/entrepreneurship')
 * @param {Function} [onSuccess] - Callback opcional tras éxito
 */
export function enableCardEditing({
  cardSelector = '.card',
  fields = {},
  editBtnSelector = '.edit-btn',
  putUrl = '',
  onSuccess
}) {
  document.querySelectorAll(cardSelector).forEach(card => {
    const editBtn = card.querySelector(editBtnSelector);
    if (!editBtn) return;

    // Obtener el ID de la card (puedes ajustar esto según tu estructura)
    let cardId = card.dataset.id;
    if (!cardId) {
      // Busca el ID en los campos si no está en data-id
      const idField = card.querySelector('.id, [data-key="_id"]');
      cardId = idField ? idField.textContent.trim() : null;
    }

    editBtn.addEventListener('click', async () => {
      // Guardar valores originales
      const originalValues = {};
      Object.entries(fields).forEach(([className, config]) => {
        const el = card.querySelector(`.${className}`);
        if (el) originalValues[className] = el.textContent;
      });

      if (editBtn.textContent === 'Editar') {
        // Cambiar a modo edición
        Object.entries(fields).forEach(([className, config]) => {
          const el = card.querySelector(`.${className}`);
          if (el) {
            const value = el.textContent.replace(`${config.label}:`, '').trim();
            el.innerHTML = `<strong>${config.label}:</strong> <input type="${config.inputType}" class="edit-${className}" value="${value}" placeholder="${config.placeholder || ''}" />`;
          }
        });

        editBtn.textContent = 'Guardar';

        // Botón cancelar
        let cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.classList.add('cancel-btn');
        editBtn.insertAdjacentElement('afterend', cancelBtn);

        cancelBtn.onclick = () => {
          // Restaurar valores originales
          Object.entries(fields).forEach(([className, config]) => {
            const el = card.querySelector(`.${className}`);
            if (el) el.innerHTML = `<strong>${config.label}:</strong> ${originalValues[className]}`;
          });
          editBtn.textContent = 'Editar';
          cancelBtn.remove();
        };

      } else if (editBtn.textContent === 'Guardar') {
        // Tomar valores editados
        const updatedData = {};
        Object.entries(fields).forEach(([className, config]) => {
          const input = card.querySelector(`.edit-${className}`);
          updatedData[config.key] = input ? input.value : '';
        });

        // Guardar cambios en el DOM
        Object.entries(fields).forEach(([className, config]) => {
          const el = card.querySelector(`.${className}`);
          if (el) el.innerHTML = `<strong>${config.label}:</strong> ${updatedData[config.key]}`;
        });

        editBtn.textContent = 'Editar';
        const cancelBtn = card.querySelector('.cancel-btn');
        if (cancelBtn) cancelBtn.remove();

        // Enviar cambios al servidor con fetch PUT
        if (putUrl && cardId) {
          try {
            const response = await fetch(`${putUrl}/${cardId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedData)
            });
            if (!response.ok) {
              const error = await response.text();
              alert(`Error al actualizar: ${error}`);
            } else if (typeof onSuccess === 'function') {
              onSuccess(card, updatedData);
            }
          } catch (err) {
            alert('Error de red al actualizar.');
            console.error(err);
          }
        }
      }
    });
  });
}

// Ejemplo de uso para cards de emprendimiento:
// enableCardEditing({
//   cardSelector: '.card',
//   fields: {
//     name:    { label: 'Nombre', inputType: 'text', key: 'name', placeholder: 'Nombre' },
//     date:    { label: 'Fecha', inputType: 'text', key: 'date', placeholder: 'Fecha' },
//     address: { label: 'Ubicación', inputType: 'text', key: 'address', placeholder: 'Ubicación' }
//   },
//   editBtnSelector: '.edit-btn',
//   putUrl: '/api/entrepreneurship'
// });
