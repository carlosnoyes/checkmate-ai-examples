import { carColors, instructorColors, state } from './state.js';
import { showAppointmentDetails, showNewAppointmentForm } from './modal.js';
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

    // Single compact header row with date above each group
    html += '<div class="week-header">';
    html += '<div class="week-time-spacer"></div>';

    days.forEach((day, dayIdx) => {
        const isToday = isSameDay(day, today);
        const dayOfWeek = dayNames[day.getDay()];
        const dateNum = day.getDate();

        if (groupKeys.length === 0) {
            // No groups, just show the day
            html += `<div class="week-day-header ${isToday ? 'today' : ''}" style="width: 140px; min-width: 140px; flex: 0 0 140px;">
                <div class="compact-day-label">${dayOfWeek} ${dateNum}</div>
            </div>`;
        } else {
            // Create a container for this day's columns
            html += `<div class="day-header-container" style="display: flex; flex-direction: column; width: ${groupKeys.length * 140}px; min-width: ${groupKeys.length * 140}px; ${dayIdx > 0 ? 'border-left: 2px solid var(--text-muted);' : ''}">`;

            // Date label spanning all groups for this day
            html += `<div class="compact-date-label ${isToday ? 'today' : ''}">${dayOfWeek} ${dateNum}</div>`;

            // Group labels below the date
            html += '<div style="display: flex;">';
            groupKeys.forEach((key, idx) => {
                const label = state.currentGroupBy === 'instructor' ? getInstructorName(key) : key;
                const colorSet = state.currentGroupBy === 'instructor' ? instructorColors[key] : carColors[key];
                html += `<div class="week-group-header" style="width: 140px; min-width: 140px; flex: 0 0 140px; ${idx > 0 ? 'border-left: 1px solid var(--border);' : ''} background: ${colorSet?.border || 'var(--bg-dark)'}22;">${label}</div>`;
            });
            html += '</div>';

            html += '</div>';
        }
    });
    html += '</div>';

    html += '<div class="week-body">';

    html += '<div class="week-time-column">';
    for (let hour = 8; hour <= 20; hour++) {
        html += `<div class="week-time-slot">${hour.toString().padStart(2, '0')}:00</div>`;
    }
    html += '</div>';

    days.forEach((day, dayIdx) => {
        const dayAppts = getAppointmentsForDate(day);

        const groupedAppts = {};
        groupKeys.forEach(key => groupedAppts[key] = []);
        dayAppts.forEach(appt => {
            const key = state.currentGroupBy === 'instructor' ? appt.instructorId : appt.carId;
            if (groupedAppts[key]) {
                groupedAppts[key].push(appt);
            }
        });

        html += `<div class="week-day-container" style="width: ${groupKeys.length * 140}px; min-width: ${groupKeys.length * 140}px; flex: 0 0 ${groupKeys.length * 140}px;">`;
        html += '<div class="week-day-groups">';

        if (groupKeys.length === 0) {
            html += `<div class="week-group-column" style="width: 140px; min-width: 140px; flex: 0 0 140px; ${dayIdx > 0 ? 'border-left: 2px solid var(--text-muted);' : ''}">`;
            for (let hour = 8; hour <= 20; hour++) {
                const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                html += `<div class="week-hour-row" onclick="showNewAppointmentForm('${dateStr}', '${timeStr}', null)" style="cursor: pointer;" title="Click to create appointment"></div>`;
            }
            html += '</div>';
        } else {
            groupKeys.forEach((key, idx) => {
                // First column of each day (idx === 0) gets the thick day border if it's not Sunday (dayIdx > 0)
                // Subsequent columns get the thin instructor separator
                let columnBorder = '';
                if (idx === 0 && dayIdx > 0) {
                    columnBorder = 'border-left: 2px solid var(--text-muted);';
                } else if (idx > 0) {
                    columnBorder = 'border-left: 1px solid var(--border);';
                }

                html += `<div class="week-group-column" style="width: 140px; min-width: 140px; flex: 0 0 140px; ${columnBorder}">`;
                html += '<div class="week-group-body">';
                for (let hour = 8; hour <= 20; hour++) {
                    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
                    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    html += `<div class="week-hour-row" onclick="showNewAppointmentForm('${dateStr}', '${timeStr}', '${key}')" style="cursor: pointer;" title="Click to create appointment"></div>`;
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

