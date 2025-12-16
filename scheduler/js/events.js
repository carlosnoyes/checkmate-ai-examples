import { renderCalendar, navigateCalendar, goToToday } from './calendar.js';
import { renderTable } from './table.js';
import { closeModal } from './modal.js';
import { loadExampleData } from './dataLoader.js';
import { state } from './state.js';

export function registerEventHandlers() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.view-container').forEach(v => v.classList.remove('active'));
            tab.classList.add('active');

            const tabName = tab.dataset.tab;
            document.getElementById(`${tabName}View`).classList.add('active');

            const calendarControls = document.getElementById('calendarControls');
            calendarControls.style.display = tabName === 'calendar' ? 'flex' : 'none';
        });
    });


    document.querySelectorAll('[data-group]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-group]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentGroupBy = btn.dataset.group;
            renderCalendar();
        });
    });

    document.getElementById('prevBtn').addEventListener('click', () => navigateCalendar(-1));
    document.getElementById('nextBtn').addEventListener('click', () => navigateCalendar(1));
    document.getElementById('todayBtn').addEventListener('click', goToToday);

    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('appointmentModal').addEventListener('click', (e) => {
        if (e.target.id === 'appointmentModal') closeModal();
    });

    document.getElementById('loadDataBtn').addEventListener('click', loadExampleData);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
        if (e.key === 'ArrowLeft' && state.appointments.length > 0) navigateCalendar(-1);
        if (e.key === 'ArrowRight' && state.appointments.length > 0) navigateCalendar(1);
    });

    // Ensure initial table render stays wired when search inputs set values manually
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', renderTable);
    }
}
