document.querySelectorAll('.card').forEach(card => {
  const editBtn = card.querySelector('.edit-btn');

  editBtn.addEventListener('click', () => {
    let nameEl = card.querySelector('.name');
    let dateEl = card.querySelector('.date');
    let locationEl = card.querySelector('.location');

    if (editBtn.textContent === 'Editar') {
      // Guardar valores actuales
      const nameText = nameEl.textContent;
      const dateText = dateEl.textContent.replace('Fecha:', '').trim();
      const locationText = locationEl.textContent.replace('Lugar:', '').trim();

      // Cambiar a modo edición
      nameEl.innerHTML = `<input type="text" class="edit-name" value="${nameText}" />`;
      dateEl.innerHTML = `<strong>Fecha:</strong> <input type="text" class="edit-date" value="${dateText}" />`;
      locationEl.innerHTML = `<strong>Lugar:</strong> <input type="text" class="edit-location" value="${locationText}" />`;

      editBtn.textContent = 'Guardar';

      // Botón cancelar
      let cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancelar';
      cancelBtn.classList.add('cancel-btn');
      editBtn.insertAdjacentElement('afterend', cancelBtn);

      cancelBtn.onclick = () => {
        nameEl.textContent = nameText;
        dateEl.innerHTML = `<strong>Fecha:</strong> ${dateText}`;
        locationEl.innerHTML = `<strong>Lugar:</strong> ${locationText}`;
        editBtn.textContent = 'Editar';
        cancelBtn.remove();
      };

    } else if (editBtn.textContent === 'Guardar') {
      // Tomar valores editados
      const newName = card.querySelector('.edit-name').value;
      const newDate = card.querySelector('.edit-date').value;
      const newLocation = card.querySelector('.edit-location').value;

      // Guardar cambios en el DOM
      nameEl.textContent = newName;
      dateEl.innerHTML = `<strong>Fecha:</strong> ${newDate}`;
      locationEl.innerHTML = `<strong>Lugar:</strong> ${newLocation}`;

      editBtn.textContent = 'Editar';

      const cancelBtn = card.querySelector('.cancel-btn');
      if (cancelBtn) cancelBtn.remove();

      // Aquí podrías enviar los cambios al servidor con fetch/AJAX
    }
  });
});
