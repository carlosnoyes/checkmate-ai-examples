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

export function checkTimeOverlap(start1, end1, start2, end2) {
    const start1Mins = timeToMinutes(start1);
    const end1Mins = timeToMinutes(end1);
    const start2Mins = timeToMinutes(start2);
    const end2Mins = timeToMinutes(end2);

    return start1Mins < end2Mins && end1Mins > start2Mins;
}

export function findConflicts(date, startTime, endTime, instructorId, carId, studentId, excludeApptId = null) {
    const conflicts = {
        instructor: null,
        car: null,
        student: null
    };

    // Use the date string directly to avoid timezone issues with new Date() parsing
    const dateAppts = state.appointments.filter(a => a.date === date);

    for (const appt of dateAppts) {
        // Skip the appointment we're editing (if any)
        if (excludeApptId && appt.id === excludeApptId) continue;

        const hasTimeOverlap = checkTimeOverlap(startTime, endTime, appt.startTime, appt.endTime);

        if (!hasTimeOverlap) continue;

        // Check instructor conflict
        if (instructorId && appt.instructorId === instructorId && !conflicts.instructor) {
            conflicts.instructor = {
                time: `${appt.startTime} - ${appt.endTime}`,
                student: getStudentName(appt.studentId)
            };
        }

        // Check car conflict
        if (carId && appt.carId === carId && !conflicts.car) {
            conflicts.car = {
                time: `${appt.startTime} - ${appt.endTime}`,
                student: getStudentName(appt.studentId)
            };
        }

        // Check student conflict
        if (studentId && appt.studentId === studentId && !conflicts.student) {
            conflicts.student = {
                time: `${appt.startTime} - ${appt.endTime}`,
                instructor: getInstructorName(appt.instructorId)
            };
        }
    }

    return conflicts;
}
