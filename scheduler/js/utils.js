import { carColors, instructorColors, state } from './state.js';

export function getInstructorName(id) {
    const instructor = state.instructors[id];
    return instructor ? `${instructor.firstName} ${instructor.lastName}` : id;
}

export function getStudentName(id) {
    const student = state.students[id];
    return student ? `${student.firstName} ${student.lastName}` : id;
}

export function getUniqueInstructors() {
    const unique = new Set();
    state.appointments.forEach(appt => unique.add(appt.instructorId));
    return Array.from(unique).sort();
}

export function getUniqueCars() {
    const unique = new Set();
    state.appointments.forEach(appt => unique.add(appt.carId));
    return Array.from(unique).sort();
}

export function getColor(appointment) {
    const colorSet = state.currentGroupBy === 'instructor'
        ? carColors[appointment.carId]
        : instructorColors[appointment.instructorId];
    return colorSet || { bg: 'rgba(100, 100, 100, 0.25)', border: '#666', text: '#ccc' };
}

export function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

export function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

export function getAppointmentsForDate(date) {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return state.appointments.filter(a => a.date === dateStr);
}

export function getStatusClass(status) {
    if (status.toLowerCase().includes('completed')) return 'status-completed';
    if (status.toLowerCase().includes('cancelled') || status.toLowerCase().includes('no-show')) return 'status-cancelled';
    return 'status-scheduled';
}
