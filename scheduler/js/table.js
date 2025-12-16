import { carColors, instructorColors, state } from './state.js';
import { formatDate, getInstructorName, getStatusClass, getStudentName } from './utils.js';

export function renderTable() {
    const container = document.getElementById('tableContent');
    const searchTerm = document.getElementById('searchInput')?.value?.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const instructorFilter = document.getElementById('instructorFilter')?.value || '';
    const carFilter = document.getElementById('carFilter')?.value || '';

    let filtered = state.appointments.filter(appt => {
        const studentName = getStudentName(appt.studentId).toLowerCase();
        const instructorName = getInstructorName(appt.instructorId).toLowerCase();

        const matchesSearch = !searchTerm ||
            studentName.includes(searchTerm) ||
            instructorName.includes(searchTerm) ||
            appt.lessonType.toLowerCase().includes(searchTerm) ||
            appt.date.includes(searchTerm) ||
            appt.id.toLowerCase().includes(searchTerm);

        const matchesStatus = !statusFilter || appt.status.toLowerCase().includes(statusFilter.toLowerCase());
        const matchesInstructor = !instructorFilter || appt.instructorId === instructorFilter;
        const matchesCar = !carFilter || appt.carId === carFilter;

        return matchesSearch && matchesStatus && matchesInstructor && matchesCar;
    });

    filtered.sort((a, b) => {
        let valA;
        let valB;
        switch (state.sortColumn) {
            case 'date':
                valA = a.date + a.startTime;
                valB = b.date + b.startTime;
                break;
            case 'student':
                valA = getStudentName(a.studentId);
                valB = getStudentName(b.studentId);
                break;
            case 'instructor':
                valA = getInstructorName(a.instructorId);
                valB = getInstructorName(b.instructorId);
                break;
            case 'type':
                valA = a.lessonType;
                valB = b.lessonType;
                break;
            case 'status':
                valA = a.status;
                valB = b.status;
                break;
            default:
                valA = a.date;
                valB = b.date;
        }

        if (state.sortDirection === 'asc') {
            return valA > valB ? 1 : -1;
        } else {
            return valA < valB ? 1 : -1;
        }
    });

    let html = `
        <div class="search-filter-bar">
            <div class="search-box">
                <input type="text" id="searchInput" placeholder="Search appointments..." value="${searchTerm}" oninput="renderTable()">
            </div>
            <select class="filter-select" id="statusFilter" onchange="renderTable()">
                <option value="">All Statuses</option>
                <option value="completed" ${statusFilter === 'completed' ? 'selected' : ''}>Completed</option>
                <option value="cancelled" ${statusFilter === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                <option value="no-show" ${statusFilter === 'no-show' ? 'selected' : ''}>No-Show</option>
            </select>
            <select class="filter-select" id="instructorFilter" onchange="renderTable()">
                <option value="">All Instructors</option>
                ${Object.entries(state.instructors).map(([id, inst]) =>
                    `<option value="${id}" ${instructorFilter === id ? 'selected' : ''}>${inst.firstName} ${inst.lastName}</option>`
                ).join('')}
            </select>
            <select class="filter-select" id="carFilter" onchange="renderTable()">
                <option value="">All Cars</option>
                <option value="CAR-01" ${carFilter === 'CAR-01' ? 'selected' : ''}>CAR-01</option>
                <option value="CAR-02" ${carFilter === 'CAR-02' ? 'selected' : ''}>CAR-02</option>
                <option value="CAR-03" ${carFilter === 'CAR-03' ? 'selected' : ''}>CAR-03</option>
                <option value="CAR-04" ${carFilter === 'CAR-04' ? 'selected' : ''}>CAR-04</option>
                <option value="CAR-05" ${carFilter === 'CAR-05' ? 'selected' : ''}>CAR-05</option>
            </select>
        </div>
        <div class="table-stats">
            <span>Showing ${filtered.length} of ${state.appointments.length} appointments</span>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th onclick="sortTable('date')" class="${state.sortColumn === 'date' ? 'sorted' : ''}">Date/Time ${state.sortColumn === 'date' ? (state.sortDirection === 'asc' ? '�' : '�') : ''}</th>
                    <th onclick="sortTable('student')" class="${state.sortColumn === 'student' ? 'sorted' : ''}">Student ${state.sortColumn === 'student' ? (state.sortDirection === 'asc' ? '�' : '�') : ''}</th>
                    <th onclick="sortTable('instructor')" class="${state.sortColumn === 'instructor' ? 'sorted' : ''}">Instructor ${state.sortColumn === 'instructor' ? (state.sortDirection === 'asc' ? '�' : '�') : ''}</th>
                    <th>Car</th>
                    <th onclick="sortTable('type')" class="${state.sortColumn === 'type' ? 'sorted' : ''}">Type ${state.sortColumn === 'type' ? (state.sortDirection === 'asc' ? '�' : '�') : ''}</th>
                    <th onclick="sortTable('status')" class="${state.sortColumn === 'status' ? 'sorted' : ''}">Status ${state.sortColumn === 'status' ? (state.sortDirection === 'asc' ? '�' : '�') : ''}</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>`;

    filtered.forEach(appt => {
        const insColor = instructorColors[appt.instructorId] || { border: '#666' };
        const carColor = carColors[appt.carId] || { border: '#666' };

        html += `<tr onclick="showAppointmentDetails('${appt.id}')" style="cursor: pointer;">
            <td>
                <div style="font-weight: 500; color: var(--text-primary);">${formatDate(appt.date)}</div>
                <div style="font-size: 0.75rem;">${appt.startTime} - ${appt.endTime}</div>
            </td>
            <td style="color: var(--text-primary);">${getStudentName(appt.studentId)}</td>
            <td>
                <span class="instructor-badge" style="background: ${insColor.bg}; color: ${insColor.border}; border: 1px solid ${insColor.border};">
                    ${getInstructorName(appt.instructorId)}
                </span>
            </td>
            <td>
                <span class="car-badge" style="background: ${carColor.bg}; color: ${carColor.border}; border: 1px solid ${carColor.border};">
                    ${appt.carId}
                </span>
            </td>
            <td>${appt.lessonType}</td>
            <td><span class="status-badge ${getStatusClass(appt.status)}">${appt.status}</span></td>
            <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${appt.notes}">${appt.notes}</td>
        </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

export function sortTable(column) {
    if (state.sortColumn === column) {
        state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        state.sortColumn = column;
        state.sortDirection = 'asc';
    }
    renderTable();
}
