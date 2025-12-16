import { carColors, instructorColors, state } from './state.js';
import { formatDate, getStatusClass, getStudentName, getInstructorName, findConflicts } from './utils.js';

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

export function showNewAppointmentForm(date, time, groupKey) {
    const modal = document.getElementById('appointmentModal');
    const modalBody = document.getElementById('modalBody');

    // Determine if we're grouping by instructor or car
    const isInstructorView = state.currentGroupBy === 'instructor';

    // Generate instructor options
    const instructorOptions = Object.keys(state.instructors)
        .map(id => {
            const instructor = state.instructors[id];
            const selected = (isInstructorView && groupKey === id) ? 'selected' : '';
            return `<option value="${id}" ${selected}>${instructor.firstName} ${instructor.lastName}</option>`;
        })
        .join('');

    // Generate car options (from carColors)
    const carOptions = Object.keys(carColors)
        .map(id => {
            const selected = (!isInstructorView && groupKey === id) ? 'selected' : '';
            return `<option value="${id}" ${selected}>${id}</option>`;
        })
        .join('');

    // Store the pre-filled values
    const prefilledInstructor = isInstructorView && groupKey ? groupKey : '';
    const prefilledCar = !isInstructorView && groupKey ? groupKey : '';

    // Calculate end time (default to 2 hours later)
    const [hours, minutes] = time.split(':').map(Number);
    const endHours = hours + 2;
    const endTime = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    modalBody.innerHTML = `
        <form id="newAppointmentForm">
            <div class="modal-row">
                <div class="modal-field">
                    <label>Date *</label>
                    <input type="date" id="apptDate" class="form-input" value="${date}" required>
                </div>
                <div class="modal-field">
                    <label>Start Time *</label>
                    <input type="time" id="apptStartTime" class="form-input" value="${time}" required>
                </div>
            </div>
            <div class="modal-field">
                <label>End Time *</label>
                <input type="time" id="apptEndTime" class="form-input" value="${endTime}" required>
            </div>
            <div class="modal-field">
                <label>Student *</label>
                <div style="position: relative;">
                    <input type="text" id="apptStudentSearch" class="form-input" placeholder="Search for a student..." autocomplete="off" required>
                    <input type="hidden" id="apptStudent" required>
                    <div id="studentDropdown" class="autocomplete-dropdown"></div>
                </div>
                <div id="studentError" class="error-message"></div>
            </div>
            <div class="modal-row">
                <div class="modal-field">
                    <label>Instructor *</label>
                    <select id="apptInstructor" class="form-input" required ${isInstructorView && groupKey ? 'disabled' : ''} data-prefilled="${prefilledInstructor}">
                        <option value="">Select an instructor...</option>
                        ${instructorOptions}
                    </select>
                    <div id="instructorError" class="error-message"></div>
                </div>
                <div class="modal-field">
                    <label>Car *</label>
                    <select id="apptCar" class="form-input" required ${!isInstructorView && groupKey ? 'disabled' : ''} data-prefilled="${prefilledCar}">
                        <option value="">Select a car...</option>
                        ${carOptions}
                    </select>
                    <div id="carError" class="error-message"></div>
                </div>
            </div>
            <div class="modal-field">
                <label>Lesson Type *</label>
                <select id="apptLessonType" class="form-input" required>
                    <option value="">Select lesson type...</option>
                    <option value="Road Test">Road Test</option>
                    <option value="Practice">Practice</option>
                    <option value="Highway">Highway</option>
                    <option value="Parallel Parking">Parallel Parking</option>
                    <option value="City Driving">City Driving</option>
                </select>
            </div>
            <div class="modal-field">
                <label>Pickup Location</label>
                <input type="text" id="apptPickup" class="form-input" placeholder="Enter pickup location">
            </div>
            <div class="modal-field">
                <label>Notes</label>
                <textarea id="apptNotes" class="form-input" rows="3" placeholder="Optional notes..."></textarea>
            </div>
            <div style="display: flex; gap: 1rem; margin-top: 1.5rem;">
                <button type="submit" class="btn btn-primary" style="flex: 1;">Create Appointment</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            </div>
        </form>
    `;

    document.getElementById('appointmentModal').querySelector('.modal-header h2').textContent = 'New Appointment';
    modal.classList.add('active');

    // Add form submit handler
    document.getElementById('newAppointmentForm').addEventListener('submit', handleNewAppointmentSubmit);

    // Setup student autocomplete
    setupStudentAutocomplete();

    // Setup real-time validation (runs initial check automatically)
    setupConflictValidation();
}

function setupConflictValidation() {
    const dateInput = document.getElementById('apptDate');
    const startTimeInput = document.getElementById('apptStartTime');
    const endTimeInput = document.getElementById('apptEndTime');
    const studentInput = document.getElementById('apptStudent');
    const instructorInput = document.getElementById('apptInstructor');
    const carInput = document.getElementById('apptCar');
    const submitBtn = document.querySelector('#newAppointmentForm button[type="submit"]');

    function validateConflicts() {
        const date = dateInput.value;
        const startTime = startTimeInput.value;
        const endTime = endTimeInput.value;
        const studentId = studentInput.value;
        // Get values even if fields are disabled - check data attribute first, then value
        const instructorId = instructorInput.dataset.prefilled || instructorInput.value;
        const carId = carInput.dataset.prefilled || carInput.value;

        // Debug logging
        console.log('Validating conflicts:', { date, startTime, endTime, studentId, instructorId, carId });
        console.log('Total appointments in state:', state.appointments.length);
        console.log('Appointments on this date:', state.appointments.filter(a => a.date === date));

        // Clear previous errors
        document.getElementById('studentError').textContent = '';
        document.getElementById('instructorError').textContent = '';
        document.getElementById('carError').textContent = '';
        document.getElementById('apptStudentSearch').classList.remove('error');
        instructorInput.classList.remove('error');
        carInput.classList.remove('error');

        // Need all time fields to validate
        if (!date || !startTime || !endTime) {
            submitBtn.disabled = false;
            return;
        }

        const conflicts = findConflicts(date, startTime, endTime, instructorId, carId, studentId);
        console.log('Conflicts found:', conflicts);
        let hasConflict = false;

        // Check student conflict
        if (conflicts.student) {
            document.getElementById('studentError').textContent =
                `⚠️ Student already has an appointment from ${conflicts.student.time} with ${conflicts.student.instructor}`;
            document.getElementById('apptStudentSearch').classList.add('error');
            hasConflict = true;
        }

        // Check instructor conflict
        if (conflicts.instructor) {
            document.getElementById('instructorError').textContent =
                `⚠️ Instructor already teaching ${conflicts.instructor.student} from ${conflicts.instructor.time}`;
            instructorInput.classList.add('error');
            hasConflict = true;
        }

        // Check car conflict
        if (conflicts.car) {
            document.getElementById('carError').textContent =
                `⚠️ Car already in use with ${conflicts.car.student} from ${conflicts.car.time}`;
            carInput.classList.add('error');
            hasConflict = true;
        }

        // Disable submit if there are conflicts
        submitBtn.disabled = hasConflict;
    }

    // Add event listeners to all relevant fields
    dateInput.addEventListener('change', validateConflicts);
    startTimeInput.addEventListener('change', validateConflicts);
    endTimeInput.addEventListener('change', validateConflicts);
    studentInput.addEventListener('change', validateConflicts);
    instructorInput.addEventListener('change', validateConflicts);
    carInput.addEventListener('change', validateConflicts);

    // Run initial validation immediately
    validateConflicts();
}

function setupStudentAutocomplete() {
    const searchInput = document.getElementById('apptStudentSearch');
    const hiddenInput = document.getElementById('apptStudent');
    const dropdown = document.getElementById('studentDropdown');

    // Create student list for searching
    const students = Object.keys(state.students).map(id => ({
        id,
        name: `${state.students[id].firstName} ${state.students[id].lastName}`,
        email: state.students[id].email
    }));

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();

        if (!query) {
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            hiddenInput.value = '';
            return;
        }

        const matches = students.filter(student =>
            student.name.toLowerCase().includes(query) ||
            student.email.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
            dropdown.innerHTML = '<div class="autocomplete-item autocomplete-no-results">No students found</div>';
            dropdown.style.display = 'block';
            hiddenInput.value = '';
        } else {
            dropdown.innerHTML = matches.map(student =>
                `<div class="autocomplete-item" data-id="${student.id}" data-name="${student.name}">
                    <div class="autocomplete-name">${student.name}</div>
                    <div class="autocomplete-email">${student.email}</div>
                </div>`
            ).join('');
            dropdown.style.display = 'block';
            hiddenInput.value = '';
        }
    });

    // Handle dropdown clicks
    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.autocomplete-item');
        if (item && item.dataset.id) {
            searchInput.value = item.dataset.name;
            hiddenInput.value = item.dataset.id;
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            // Trigger change event for validation
            hiddenInput.dispatchEvent(new Event('change'));
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.autocomplete-item[data-id]');
        const activeItem = dropdown.querySelector('.autocomplete-item.active');

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!activeItem && items.length > 0) {
                items[0].classList.add('active');
            } else if (activeItem) {
                activeItem.classList.remove('active');
                const next = activeItem.nextElementSibling;
                if (next && next.dataset.id) {
                    next.classList.add('active');
                } else {
                    items[0].classList.add('active');
                }
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (activeItem) {
                activeItem.classList.remove('active');
                const prev = activeItem.previousElementSibling;
                if (prev && prev.dataset.id) {
                    prev.classList.add('active');
                } else {
                    items[items.length - 1].classList.add('active');
                }
            }
        } else if (e.key === 'Enter' && activeItem && activeItem.dataset.id) {
            e.preventDefault();
            searchInput.value = activeItem.dataset.name;
            hiddenInput.value = activeItem.dataset.id;
            dropdown.innerHTML = '';
            dropdown.style.display = 'none';
            // Trigger change event for validation
            hiddenInput.dispatchEvent(new Event('change'));
        }
    });
}

async function handleNewAppointmentSubmit(e) {
    e.preventDefault();

    const instructorInput = document.getElementById('apptInstructor');
    const carInput = document.getElementById('apptCar');
    const studentId = document.getElementById('apptStudent').value;
    const date = document.getElementById('apptDate').value;
    const startTime = document.getElementById('apptStartTime').value;
    const endTime = document.getElementById('apptEndTime').value;

    // Get values - use data-prefilled for disabled fields
    const instructorId = instructorInput.dataset.prefilled || instructorInput.value;
    const carId = carInput.dataset.prefilled || carInput.value;

    // Final validation check before saving - this is the last line of defense
    const conflicts = findConflicts(date, startTime, endTime, instructorId, carId, studentId);

    if (conflicts.student) {
        alert(`Cannot create appointment: ${getStudentName(studentId)} already has an appointment from ${conflicts.student.time} with ${conflicts.student.instructor}`);
        return;
    }

    if (conflicts.instructor) {
        alert(`Cannot create appointment: Instructor is already teaching ${conflicts.instructor.student} from ${conflicts.instructor.time}`);
        return;
    }

    if (conflicts.car) {
        alert(`Cannot create appointment: Car is already in use with ${conflicts.car.student} from ${conflicts.car.time}`);
        return;
    }

    // Generate a unique ID
    const newId = `APPT-${Date.now()}`;

    // Create appointment object
    const newAppt = {
        id: newId,
        date: date,
        startTime: startTime,
        endTime: endTime,
        studentId: studentId,
        instructorId: instructorId,
        carId: carId,
        lessonType: document.getElementById('apptLessonType').value,
        pickupLocation: document.getElementById('apptPickup').value,
        notes: document.getElementById('apptNotes').value,
        status: 'Scheduled'
    };

    // Add to state
    state.appointments.push(newAppt);

    // Re-render calendar and table
    const { renderCalendar } = await import('./calendar.js');
    const { renderTable } = await import('./table.js');
    renderCalendar();
    renderTable();

    // Close modal
    closeModal();
}
