import { renderCalendar } from './calendar.js';
import { renderTable, sortTable } from './table.js';
import { showAppointmentDetails } from './modal.js';
import { registerEventHandlers } from './events.js';

function exposeGlobals() {
    window.renderTable = renderTable;
    window.sortTable = sortTable;
    window.showAppointmentDetails = showAppointmentDetails;
}

document.addEventListener('DOMContentLoaded', () => {
    exposeGlobals();
    registerEventHandlers();

    // Keep empty states visible until data is loaded; calendar/table render will be triggered by loadExampleData
    renderCalendar();
    renderTable();
});
