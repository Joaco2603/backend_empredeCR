async function getCurrentSession() {
    try {
        const response = await fetch('/api/session', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) return null;
        return await response.json();

    } catch (error) {
        console.error('Error al obtener sesión:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const session = await getCurrentSession();
    if (!session || !session.user) return;

    // Card de usuario
    const userInfoPs = document.querySelectorAll('.div_user_info p');
    if (userInfoPs.length >= 4) {
        userInfoPs[0].innerHTML = `<strong>Nombre:</strong> ${session.user.name || ''}`;
        userInfoPs[3].innerHTML = `<strong>Apellido:</strong> ${session.user.last_name || ''}`;
        userInfoPs[1].innerHTML = `<strong>Correo:</strong> ${session.user.email || ''}`;
        userInfoPs[2].innerHTML = `<strong>Telefono:</strong> ${session.user.phone || ''}`;
    }
    const dateInput = document.querySelector('.div_user_info input[type="date"]');
    if (dateInput && session.user.birthdate) {
        dateInput.value = session.user.birthdate.slice(0, 10);
    }

    console.log(userInfoPs[3])

    // Formulario editable
    document.getElementById('name').value = session.user.name || '';
    document.getElementById('last_name').value = session.user.last_name || '';
    document.getElementById('email').value = session.user.email || '';
    document.getElementById('phone').value = session.user.phone || '';
    // Si tienes birthdate en el formulario:
    const formDateInput = document.querySelector('.form_user_profile input[type="date"]');
    if (formDateInput && session.user.birthdate) {
        formDateInput.value = session.user.birthdate.slice(0, 10);
    }
});






