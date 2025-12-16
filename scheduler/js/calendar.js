import { carColors, instructorColors, state } from './state.js';
import { showAppointmentDetails } from './modal.js';
import {
    formatDate,
    getAppointmentsForDate,
    getColor,
    getInstructorName,
    getStudentName,
    getUniqueCars,
    getUniqueInstructors,
    isSameDay,
    timeToMinutes
} from './utils.js';

export function renderCalendar() {
    const calendarBody = document.getElementById('calendarBody');
    const calendarTitle = document.getElementById('calendarTitle');

    // Only week view is supported
    const startOfWeek = new Date(state.currentDate);
    startOfWeek.setDate(state.currentDate.getDate() - state.currentDate.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    calendarTitle.textContent = `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    renderWeekView(calendarBody);

    renderLegend();
}


function renderWeekView(container) {
    renderWeekViewExpanded(container);
}

function renderWeekViewExpanded(container) {
    const startOfWeek = new Date(state.currentDate);
    startOfWeek.setDate(state.currentDate.getDate() - state.currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        days.push(day);
    }

    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const allGroups = new Set();
    days.forEach(day => {
        const dayAppts = getAppointmentsForDate(day);
        dayAppts.forEach(appt => {
            const key = state.currentGroupBy === 'instructor' ? appt.instructorId : appt.carId;
            allGroups.add(key);
        });
    });
    const groupKeys = Array.from(allGroups).sort();

    let html = '<div class="week-view expanded">';

    html += '<div class="week-header">';
    html += '<div class="week-time-spacer"></div>';
    days.forEach((day, i) => {
        const isToday = isSameDay(day, today);
        const numGroups = groupKeys.length || 1;
        html += `<div class="week-day-header ${isToday ? 'today' : ''}" style="min-width: ${numGroups * 140}px; flex: 0 0 ${numGroups * 140}px;">
            <div class="day-name">${dayNames[i]}</div>
            <div class="day-number">${day.getDate()}</div>
        </div>`;
    });
    html += '</div>';

    if (groupKeys.length > 0) {
        html += '<div class="week-header" style="border-radius: 0;">';
        html += '<div class="week-time-spacer"></div>';
        days.forEach(day => {
            html += '<div style="display: flex; border-left: 1px solid var(--border);">';
            groupKeys.forEach((key, idx) => {
                const label = state.currentGroupBy === 'instructor' ? getInstructorName(key) : key;
                const colorSet = state.currentGroupBy === 'instructor' ? instructorColors[key] : carColors[key];
                html += `<div class="week-group-header" style="width: 140px; min-width: 140px; border-left-color: ${colorSet?.border || '#666'}; ${idx > 0 ? 'border-left: 1px solid var(--border);' : ''}">${label}</div>`;
            });
            html += '</div>';
        });
        html += '</div>';
    }

    html += '<div class="week-body">';

    html += '<div class="week-time-column">';
    for (let hour = 8; hour <= 20; hour++) {
        html += `<div class="week-time-slot">${hour.toString().padStart(2, '0')}:00</div>`;
    }
    html += '</div>';

    days.forEach(day => {
        const dayAppts = getAppointmentsForDate(day);

        const groupedAppts = {};
        groupKeys.forEach(key => groupedAppts[key] = []);
        dayAppts.forEach(appt => {
            const key = state.currentGroupBy === 'instructor' ? appt.instructorId : appt.carId;
            if (groupedAppts[key]) {
                groupedAppts[key].push(appt);
            }
        });

        html += '<div class="week-day-container">';
        html += '<div class="week-day-groups">';

        if (groupKeys.length === 0) {
            html += '<div class="week-group-column" style="min-width: 140px;">';
            for (let hour = 8; hour <= 20; hour++) {
                html += '<div class="week-hour-row"></div>';
            }
            html += '</div>';
        } else {
            groupKeys.forEach(key => {
                const colorSet = state.currentGroupBy === 'instructor' ? instructorColors[key] : carColors[key];

                html += '<div class="week-group-column">';
                html += '<div class="week-group-body">';
                for (let hour = 8; hour <= 20; hour++) {
                    html += '<div class="week-hour-row"></div>';
                }

                groupedAppts[key].forEach(appt => {
                    const startMins = timeToMinutes(appt.startTime) - 8 * 60;
                    const endMins = timeToMinutes(appt.endTime) - 8 * 60;
                    const top = (startMins / 60) * 50;
                    const height = ((endMins - startMins) / 60) * 50;
                    const color = getColor(appt);
                    const student = getStudentName(appt.studentId);

                    html += `<div class="week-expanded-appointment"
                        style="top: ${top}px; height: ${height}px; background: ${color.bg}; border-left-color: ${color.border}; color: ${color.text};"
                        onclick="showAppointmentDetails('${appt.id}')">
                        <div class="appt-time">${appt.startTime}</div>
                        <div class="appt-student">${student}</div>
                        <div class="appt-type">${appt.lessonType}</div>
                    </div>`;
                });

                html += '</div></div>';
            });
        }

        html += '</div></div>';
    });

    html += '</div></div>';
    container.innerHTML = html;
}


function renderLegend() {
    const legend = document.getElementById('calendarLegend');
    let html = '';

    if (state.currentGroupBy === 'instructor') {
        const usedCars = getUniqueCars();
        usedCars.forEach(id => {
            const color = carColors[id] || { border: '#666' };
            html += `<div class="legend-item">
                <div class="legend-color" style="background: ${color.border}"></div>
                <span>${id}</span>
            </div>`;
        });
    } else {
        const usedInstructors = getUniqueInstructors();
        usedInstructors.forEach(id => {
            const color = instructorColors[id] || { border: '#666' };
            const name = getInstructorName(id);
            html += `<div class="legend-item">
                <div class="legend-color" style="background: ${color.border}"></div>
                <span>${name}</span>
            </div>`;
        });
    }

    legend.innerHTML = html;
}

export function navigateCalendar(direction) {
    // Only week view is supported
    state.currentDate.setDate(state.currentDate.getDate() + (direction * 7));
    renderCalendar();
}

export function goToToday() {
    state.currentDate = new Date(2025, 11, 1);
    renderCalendar();
}

