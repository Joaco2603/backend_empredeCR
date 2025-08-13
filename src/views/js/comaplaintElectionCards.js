import { showInformationInCards } from "./showInformationInCards.js";

document.addEventListener('DOMContentLoaded', async () => {
    const properties = [
        { key: '_id', label: 'ID' },
        { key: 'name', label: 'Nombre' },
        { key: 'description', label: 'Descripción' },
        { key: 'date', label: 'Fecha' },
        { key: 'address', label: 'Ubicación' },
    ];

    await showInformationInCards('/api/report/inactive', 'container_cards', properties, true);

    // Obtiene el rol del usuario usando fetch a /api/session
    try {
        const res = await fetch('/api/session');
        if (res.ok) {
            const session = await res.json();
            const rol = session?.user?.rol;
            if (rol === 'ADMIN_ROLE') {
                import('./changeCardsAdmin.js').then(module => {
                    if (typeof module.renderElectionButtons === 'function') {
                        module.renderElectionButtons('.card', '/api/report', '/api/report/activate/');
                    } else if (typeof window.renderElectionButtons === 'function') {
                        window.renderElectionButtons();
                    }
                }).catch(() => {
                    if (typeof window.renderElectionButtons === 'function') {
                        window.renderElectionButtons();
                    }
                });
            }
        }
    } catch (error) {
        // Manejo de error opcional
        console.error('Error obteniendo la sesión:', error);
    }
});

