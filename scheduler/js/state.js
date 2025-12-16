export const state = {
    appointments: [],
    instructors: {},
    students: {},
    currentView: 'week',
    currentGroupBy: 'instructor',
    currentDate: new Date(2025, 11, 1),
    sortColumn: 'date',
    sortDirection: 'asc'
};

// Shared palette that both instructors and cars pull from in order.
const basePalette = [
    { border: '#f97316', bg: 'rgba(249, 115, 22, 0.25)', text: '#fed7aa' },
    { border: '#06b6d4', bg: 'rgba(6, 182, 212, 0.25)', text: '#cffafe' },
    { border: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.25)', text: '#e9d5ff' },
    { border: '#ec4899', bg: 'rgba(236, 72, 153, 0.25)', text: '#fbcfe8' },
    { border: '#14b8a6', bg: 'rgba(20, 184, 166, 0.25)', text: '#ccfbf1' },
    { border: '#f43f5e', bg: 'rgba(244, 63, 94, 0.25)', text: '#fecdd3' },
    { border: '#84cc16', bg: 'rgba(132, 204, 22, 0.25)', text: '#ecfccb' },
    { border: '#eab308', bg: 'rgba(234, 179, 8, 0.25)', text: '#fef3c7' },
    { border: '#6366f1', bg: 'rgba(99, 102, 241, 0.25)', text: '#e0e7ff' },
    { border: '#22d3ee', bg: 'rgba(34, 211, 238, 0.25)', text: '#cffafe' }
];

const buildColorMap = (ids) => {
    const map = {};
    ids.forEach((id, idx) => {
        const color = basePalette[idx % basePalette.length];
        map[id] = { ...color };
    });
    return map;
};

export const instructorColors = buildColorMap([
    'INS-001', 'INS-002', 'INS-003', 'INS-004', 'INS-005',
    'INS-006', 'INS-007', 'INS-008', 'INS-009', 'INS-010'
]);

export const carColors = buildColorMap([
    'CAR-01', 'CAR-02', 'CAR-03', 'CAR-04', 'CAR-05'
]);
