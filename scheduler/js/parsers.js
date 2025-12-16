export function parseInstructors(csv) {
    const lines = csv.trim().split('\n');
    const result = {};
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        if (cols.length >= 3) {
            result[cols[0]] = {
                id: cols[0],
                firstName: cols[1],
                lastName: cols[2],
                type: cols[3] || '',
                targetHours: parseInt(cols[4]) || 0
            };
        }
    }
    return result;
}

export function parseStudents(csv) {
    const lines = csv.trim().split('\n');
    const result = {};
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 2) {
            result[cols[0]] = {
                id: cols[0],
                firstName: cols[1],
                lastName: cols[2],
                phone: cols[4] || '',
                email: cols[5] || '',
                skillLevel: cols[11] || ''
            };
        }
    }
    return result;
}

export function parseAppointments(csv) {
    const lines = csv.trim().split('\n');
    const result = [];
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length >= 10) {
            result.push({
                id: cols[0],
                date: cols[1],
                startTime: cols[2],
                endTime: cols[3],
                studentId: cols[4],
                instructorId: cols[5],
                carId: cols[6],
                lessonType: cols[7],
                pickupLocation: cols[8],
                status: cols[9],
                notes: cols.slice(10).join(',')
            });
        }
    }
    return result;
}
