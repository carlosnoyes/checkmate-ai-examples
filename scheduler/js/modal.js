import { carColors, instructorColors, state } from './state.js';
import { formatDate, getStatusClass, getStudentName, getInstructorName } from './utils.js';

export function showAppointmentDetails(appointmentId) {
    const appt = state.appointments.find(a => a.id === appointmentId);
    if (!appt) return;

    const modal = document.getElementById('appointmentModal');
    const modalBody = document.getElementById('modalBody');

    const student = state.students[appt.studentId];
    const insColor = instructorColors[appt.instructorId] || { border: '#666' };
    const carColor = carColors[appt.carId] || { border: '#666' };

    modalBody.innerHTML = `
        <div class="modal-row">
            <div class="modal-field">
                <label>Date</label>
                <div class="value">${formatDate(appt.date)}</div>
            </div>
            <div class="modal-field">
                <label>Time</label>
                <div class="value">${appt.startTime} - ${appt.endTime}</div>
            </div>
        </div>
        <div class="modal-field">
            <label>Student</label>
            <div class="value">${getStudentName(appt.studentId)}</div>
            ${student ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">${student.email} Лил ${student.phone} Лил ${student.skillLevel}</div>` : ''}
        </div>
        <div class="modal-row">
            <div class="modal-field">
                <label>Instructor</label>
                <div class="value">
                    <span class="instructor-badge" style="background: ${insColor.bg}; color: ${insColor.border}; border: 1px solid ${insColor.border};">
                        ${getInstructorName(appt.instructorId)}
                    </span>
                </div>
            </div>
            <div class="modal-field">
                <label>Car</label>
                <div class="value">
                    <span class="car-badge" style="background: ${carColor.bg}; color: ${carColor.border}; border: 1px solid ${carColor.border};">
                        ${appt.carId}
                    </span>
                </div>
            </div>
        </div>
        <div class="modal-row">
            <div class="modal-field">
                <label>Lesson Type</label>
                <div class="value">${appt.lessonType}</div>
            </div>
            <div class="modal-field">
                <label>Status</label>
                <div class="value"><span class="status-badge ${getStatusClass(appt.status)}">${appt.status}</span></div>
            </div>
        </div>
        <div class="modal-field">
            <label>Pickup Location</label>
            <div class="value">${appt.pickupLocation}</div>
        </div>
        <div class="modal-field">
            <label>Instructor Notes</label>
            <div class="value" style="background: var(--bg-dark); padding: 0.75rem; border-radius: 6px; font-size: 0.875rem; line-height: 1.5;">
                ${appt.notes || 'No notes recorded.'}
            </div>
        </div>
    `;

    modal.classList.add('active');
}

export function closeModal() {
    document.getElementById('appointmentModal').classList.remove('active');
}
