const fs = require('fs');
const path = require('path');

// --- Configuration ---
const OUTPUT_FILE = path.join(__dirname, '../public/schedule.json');

// --- Day Constants (0 = Sunday, 1 = Monday, ..., 6 = Saturday) ---
const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;
const ALL_DAYS_INDICES = [SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY];

// --- Helper to create a base event object ---
function createEventBase(title, startHour, startMinute, endHour, endMinute, energy) {
    return { title, startHour, startMinute, endHour, endMinute, energy };
}

// --- High-level Schedule Definitions ---
// Define your schedule here. Each entry can specify:
// - event: The base event details (title, startHour, etc.)
// - repeatType: 'daily', 'weekday', 'weekend', or undefined for specific day events
// - day: The specific day index (0-6) for non-repeating events

const scheduleDefinitions = [
    // --- Daily Recurring Events ---
    // "Reading as a couple" every night at 9pm
    {
        event: createEventBase("Wind-down (Reading as a couple)", 21, 0, 22, 0, 2),
        repeatType: 'daily'
    },
    // "Brush Teeth" every morning
    {
        event: createEventBase("Brush Teeth", 7, 0, 7, 10, 0),
        repeatType: 'daily'
    },
    // "Dinner" every evening
    {
        event: createEventBase("Dinner", 19, 0, 20, 0, 0),
        repeatType: 'daily'
    },

    // --- Weekday Schedule ---
    {
        event: createEventBase("Morning Routine (Wake, Dress, Breakfast)", 7, 10, 8, 0, -2),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Focused Work Block 1", 9, 0, 10, 30, -3),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Short Break / Sensory Reset", 10, 30, 11, 0, 2),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Focused Work Block 2", 11, 0, 12, 30, -3),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Lunch Break (Quiet)", 12, 30, 13, 30, 1),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Meetings / Collaborative Work", 13, 30, 15, 0, -4),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Snack & Hydrate", 15, 0, 15, 30, 1),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Wrap-up tasks", 15, 30, 17, 0, -2),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Decompression Time (Music, Low light)", 18, 0, 19, 0, 3),
        repeatType: 'weekday'
    },
    
    // --- Weekend Schedule ---
    {
        event: createEventBase("Relaxed Morning (Wake, Breakfast)", 8, 0, 9, 30, 0),
        repeatType: 'weekend'
    },
    {
        event: createEventBase("Household Chores / Errands", 9, 30, 12, 0, -4),
        repeatType: 'weekend'
    },
    {
        event: createEventBase("Lunch", 12, 0, 13, 0, 1),
        repeatType: 'weekend'
    },
    {
        event: createEventBase("Free Time / Personal Projects", 13, 0, 18, 0, 3),
        repeatType: 'weekend'
    },
    {
        event: createEventBase("Evening Relaxation", 20, 0, 21, 0, 2),
        repeatType: 'weekend'
    },

    // --- Specific Day Overrides/Additions ---
    // Example: Wednesday Appointments
    {
        event: createEventBase("Appointments / Errands", 9, 0, 11, 0, -3),
        day: WEDNESDAY
    },
    {
        event: createEventBase("Rest & Recover", 11, 0, 12, 0, 2),
        day: WEDNESDAY
    },
    {
        event: createEventBase("Deep Work", 13, 0, 17, 0, -4),
        day: WEDNESDAY
    },
    {
        event: createEventBase("Evening Free Time", 17, 0, 22, 0, 3),
        day: WEDNESDAY
    },

    // Example: Thursday Social Outing
    {
        event: createEventBase("Social Outing / Event", 8, 0, 12, 0, -5),
        day: THURSDAY
    },
    {
        event: createEventBase("Recovery / Quiet Time", 13, 0, 16, 0, 4),
        day: THURSDAY
    },
    {
        event: createEventBase("Hobby / Special Interest", 16, 0, 18, 0, 3),
        day: THURSDAY
    },
    {
        event: createEventBase("Evening Relaxation", 18, 0, 22, 0, 2),
        day: THURSDAY
    },

    // Example: Friday Socializing
    {
        event: createEventBase("Work", 13, 0, 17, 0, -3),
        day: FRIDAY
    },
    {
        event: createEventBase("Decompression", 17, 0, 19, 0, 3),
        day: FRIDAY
    },
    {
        event: createEventBase("Socializing with friends (optional)", 19, 0, 22, 0, -4),
        day: FRIDAY
    },
    
    // Example: Sunday specific events (e.g., preparing for the week)
    {
        event: createEventBase("Prepare for the week ahead", 13, 0, 15, 0, -2),
        day: SUNDAY
    },
    {
        event: createEventBase("Quiet Hobby", 15, 0, 18, 0, 3),
        day: SUNDAY
    },
];

// --- Schedule Generation Logic ---
function buildSchedule(definitions) {
    const fullSchedule = [];

    definitions.forEach(def => {
        const baseEvent = def.event;
        switch (def.repeatType) {
            case 'daily':
                ALL_DAYS_INDICES.forEach(dayIndex => {
                    fullSchedule.push({ ...baseEvent, day: dayIndex });
                });
                break;
            case 'weekday':
                fullSchedule.push({ ...baseEvent, 'repeat-weekday': true });
                break;
            case 'weekend':
                fullSchedule.push({ ...baseEvent, 'repeat-weekend': true });
                break;
            default: // Specific day event or no repeat specified
                if (def.day !== undefined) {
                    fullSchedule.push({ ...baseEvent, day: def.day });
                } else {
                    // Handle events that might have 'day' directly in baseEvent or are one-off
                    fullSchedule.push(baseEvent);
                }
                break;
        }
    });

    // Sort events by day, then by start time
    fullSchedule.sort((a, b) => {
        let dayA = a.day !== undefined ? a.day : (a['repeat-weekday'] ? -1 : (a['repeat-weekend'] ? 8 : 7)); // -1 for weekdays, 8 for weekends, 7 for unspecified
        let dayB = b.day !== undefined ? b.day : (b['repeat-weekday'] ? -1 : (b['repeat-weekend'] ? 8 : 7));

        if (dayA !== dayB) {
            return dayA - dayB;
        }
        if (a.startHour !== b.startHour) {
            return a.startHour - b.startHour;
        }
        return a.startMinute - b.startMinute;
    });

    return fullSchedule;
}

const finalGeneratedSchedule = buildSchedule(scheduleDefinitions);

// --- Write to JSON file ---
try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalGeneratedSchedule, null, 2));
    console.log(`Successfully generated schedule to ${OUTPUT_FILE}`);
} catch (error) {
    console.error(`Error writing schedule file: ${error.message}`);
}
