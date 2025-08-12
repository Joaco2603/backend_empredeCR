import { showInformationInCards } from "./showInformationInCards.js";

document.addEventListener('DOMContentLoaded', () => {
    const properties = [
        { key: '_id', label: 'ID' },
        { key: 'name', label: 'Nombre' },
        { key: 'description', label: 'Descripción' },
        { key: 'date', label: 'Fecha' },
        { key: 'address', label: 'Ubicación' },
        { key: 'isActive', label: 'Activo' },
        { key: 'type', label: 'Tipo' }
    ];


    showInformationInCards('/api/announcement/active', 'container_cards', properties);
});

