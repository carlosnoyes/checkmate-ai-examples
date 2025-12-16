import { state } from './state.js';
import { parseAppointments, parseInstructors, parseStudents } from './parsers.js';
import { renderCalendar } from './calendar.js';
import { renderTable } from './table.js';

export async function loadExampleData() {
    const btn = document.getElementById('loadDataBtn');
    btn.innerHTML = '<span></span> Loading...';
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

        document.getElementById('calendarEmptyState').style.display = 'none';
        document.getElementById('calendarContent').style.display = 'flex';
        document.getElementById('calendarLegend').style.display = 'flex';
        document.getElementById('calendarControls').style.display = 'flex';

        document.getElementById('tableEmptyState').style.display = 'none';
        document.getElementById('tableContent').style.display = 'block';

        btn.innerHTML = '<span></span> Data Loaded';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');

        renderCalendar();
        renderTable();
    } catch (error) {
        console.error('Error loading CSV files:', error);
        btn.innerHTML = '<span></span> Error Loading Data';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        alert('Error loading CSV files. Make sure the files exist in the Data folder and the page is served via HTTP (not file://)');
        btn.disabled = false;
    }
}
