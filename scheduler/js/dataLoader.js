import { state } from './state.js';
import { parseAppointments, parseInstructors, parseStudents } from './parsers.js';
import { renderCalendar } from './calendar.js';
import { renderTable } from './table.js';

export async function loadExampleData() {
    const btn = document.getElementById('loadDataBtn');
    btn.innerHTML = '<span>⏳</span> Loading...';
    btn.disabled = true;

    try {
        const [instructorsCSV, studentsCSV, appointmentsCSV] = await Promise.all([
            fetch('Data/instructures.csv').then(r => r.text()),
            fetch('Data/students.csv').then(r => r.text()),
            fetch('Data/appointments.csv').then(r => r.text())
        ]);

        state.instructors = parseInstructors(instructorsCSV);
        state.students = parseStudents(studentsCSV);
        state.appointments = parseAppointments(appointmentsCSV);

        // Hide empty states, show content
        document.getElementById('calendarEmptyState').style.display = 'none';
        document.getElementById('calendarContent').style.display = 'flex';

        document.getElementById('tableEmptyState').style.display = 'none';
        document.getElementById('tableContent').style.display = 'block';

        // Hide load button, show header elements
        btn.style.display = 'none';
        document.getElementById('headerTabs').style.display = 'flex';
        document.getElementById('headerNav').style.display = 'flex';
        document.getElementById('calendarFooter').style.display = 'flex';

        renderCalendar();
        renderTable();
    } catch (error) {
        console.error('Error loading CSV files:', error);
        btn.innerHTML = '<span>❌</span> Error Loading Data';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        alert('Error loading CSV files. Make sure the files exist in the Data folder and the page is served via HTTP (not file://)');
        btn.disabled = false;
    }
}
