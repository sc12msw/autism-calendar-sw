const fs = require('fs');
const path = require('path');

// --- Configuration ---
const OUTPUT_FILE = path.join(__dirname, '../public/schedule.json');
const TARGET_DAILY_ENERGY = 12;

// --- Day Constants (0 = Sunday, 1 = Monday, ..., 6 = Saturday) ---
const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;
const ALL_DAYS_INDICES = [SUNDAY, MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY];
const WEEKDAY_INDICES = [MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY];
const WEEKEND_INDICES = [SUNDAY, SATURDAY];
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


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
    {
        event: createEventBase("Brush Teeth and Morning Routine", 6, 30, 7, 0, -1),
        repeatType: 'daily'
    },
    {
        event: createEventBase("Wind-down (Reading as a couple)", 21, 0, 22, 0, 2),
        repeatType: 'daily'
    },
    {
        event: createEventBase("Dinner", 19, 0, 20, 0, 0),
        repeatType: 'daily'
    },

    // --- Weekday Schedule ---
    {
        event: createEventBase("Focused Work Block 1", 9, 0, 10, 30, -2),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Short Break / Sensory Reset", 10, 30, 11, 0, 2),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Focused Work Block 2", 11, 0, 13, 0, -2),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Lunch Break", 13, 0, 14, 0, 1),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Meetings / Collaborative Work", 14, 0, 15, 30, -2),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Snack & Hydrate", 15, 30, 16, 0, 1),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Focused Work Block 3", 16, 0, 18, 0, -2),
        repeatType: 'weekday'
    },
    {
        event: createEventBase("Decompression Time (Music, Low light)", 18, 0, 19, 0, 4),
        repeatType: 'weekday'
    },
    
    // --- Weekend Schedule ---
    {
        event: createEventBase("Relaxed Morning (Wake, Breakfast)", 8, 0, 9, 30, 0),
        repeatType: 'weekend'
    },
    {
        event: createEventBase("Household Chores / Errands / Driving", 9, 30, 12, 0, -3),
        repeatType: 'weekend'
    },
    {
        event: createEventBase("Lunch", 12, 0, 13, 0, 1),
        repeatType: 'weekend'
    },
    {
        event: createEventBase("Evening Relaxation", 20, 0, 21, 0, 2),
        repeatType: 'weekend'
    },

    // --- Specific Day Overrides/Additions ---
    // These events will override any 'daily' or 'weekday/weekend' expanded events.

    // Wednesday
    { event: createEventBase("Gym", 7, 0, 9, 0, -2), day: MONDAY },
    { event: createEventBase("Run/Cardio", 7, 0, 9, 0, -2), day: TUESDAY },
    { event: createEventBase("Gym", 7, 0, 9, 0, -2), day: WEDNESDAY },
    { event: createEventBase("Run/Cardio", 7, 0, 9, 0, -2), day: THURSDAY },
    { event: createEventBase("Gym", 7, 0, 9, 0, -2), day: FRIDAY },
    { event: createEventBase("Run/Cardio", 7, 0, 9, 0, -2), day: SATURDAY },
    { event: createEventBase("Gym", 13, 0, 16, 0, -2), day: SUNDAY },
];

// --- Schedule Generation Logic ---
function buildSchedule(definitions) {
    const dailySchedule = ALL_DAYS_INDICES.map(() => []);

    const toMinutes = (hour, minute) => hour * 60 + minute;

    // A helper to add an event to a day's schedule, checking for overlaps
    const addEventToDay = (event, dayIndex) => {
        const eventStart = toMinutes(event.startHour, event.startMinute);
        const eventEnd = toMinutes(event.endHour, event.endMinute);

        // Remove any existing event that this new event overlaps
        dailySchedule[dayIndex] = dailySchedule[dayIndex].filter(existingEvent => {
            const existingStart = toMinutes(existingEvent.startHour, existingEvent.startMinute);
            const existingEnd = toMinutes(existingEvent.endHour, existingEvent.endMinute);
            // If the existing event starts during the new event, or ends during it, it's an overlap.
            const startsDuring = existingStart >= eventStart && existingStart < eventEnd;
            const endsDuring = existingEnd > eventStart && existingEnd <= eventEnd;
            const spansOver = existingStart < eventStart && existingEnd > eventEnd;
            return !(startsDuring || endsDuring || spansOver);
        });

        dailySchedule[dayIndex].push(event);
    };

    // Pass 1: Process Weekday/Weekend events (lowest precedence)
    definitions.filter(def => def.repeatType === 'weekday').forEach(def => {
        WEEKDAY_INDICES.forEach(dayIndex => addEventToDay(def.event, dayIndex));
    });
    definitions.filter(def => def.repeatType === 'weekend').forEach(def => {
        WEEKEND_INDICES.forEach(dayIndex => addEventToDay(def.event, dayIndex));
    });

    // Pass 2: Process Daily events (medium precedence)
    definitions.filter(def => def.repeatType === 'daily').forEach(def => {
        ALL_DAYS_INDICES.forEach(dayIndex => addEventToDay(def.event, dayIndex));
    });

    // Pass 3: Process Specific Day events (highest precedence)
    definitions.filter(def => def.day !== undefined).forEach(def => {
        addEventToDay(def.event, def.day);
    });

    // Flatten the array and add day property to each event
    const finalSchedule = [];
    dailySchedule.forEach((events, dayIndex) => {
        events.forEach(event => {
            finalSchedule.push({ ...event, day: dayIndex });
        });
    });

    // Sort the final flat list
    finalSchedule.sort((a, b) => {
        if (a.day !== b.day) return a.day - b.day;
        if (a.startHour !== b.startHour) return a.startHour - b.startHour;
        return a.startMinute - b.startMinute;
    });

    return finalSchedule;
}


// --- Validation Logic ---
function validateSchedule(schedule, targetEnergy) {
    const dailyEnergyTotals = Array(7).fill(0);
    const overlapIssues = [];

    // --- Time Overlap Detection ---
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const eventsForDay = schedule.filter(e => e.day === dayIndex)
                                     .sort((a, b) => a.startHour * 60 + a.startMinute - (b.startHour * 60 + b.startMinute));

        for (let i = 0; i < eventsForDay.length - 1; i++) {
            const currentEvent = eventsForDay[i];
            const nextEvent = eventsForDay[i + 1];
            const currentEventEndTime = currentEvent.endHour * 60 + currentEvent.endMinute;
            const nextEventStartTime = nextEvent.startHour * 60 + nextEvent.startMinute;

            if (currentEventEndTime > nextEventStartTime) {
                overlapIssues.push(
                    `${dayNames[dayIndex]}: Overlap between "${currentEvent.title}" (ends ${currentEvent.endHour}:${String(currentEvent.endMinute).padStart(2, '0')}) ` +
                    `and "${nextEvent.title}" (starts ${nextEvent.startHour}:${String(nextEvent.startMinute).padStart(2, '0')})`
                );
            }
        }
    }

    if (overlapIssues.length > 0) {
        console.error("\n--- Time Overlap Warnings ---");
        overlapIssues.forEach(issue => console.error(`ERROR: ${issue}`));
        console.error("------------------------------\n");
    } else {
        console.log("\n--- Time Overlap Validation: No overlaps detected. ---\n");
    }

    // --- Energy Validation ---
    schedule.forEach(event => {
        if (event.energy !== undefined && typeof event.energy === 'number') {
            dailyEnergyTotals[event.day] += event.energy;
        }
    });

    const energyIssues = [];
    dailyEnergyTotals.forEach((total, dayIndex) => {
        if (total !== targetEnergy) {
            energyIssues.push(`${dayNames[dayIndex]}: Expected ${targetEnergy}, Got ${total}`);
        }
    });

    if (energyIssues.length > 0) {
        console.warn("\n--- Daily Energy Validation Warnings ---");
        energyIssues.forEach(issue => console.warn(`WARNING: ${issue}`));
        console.warn("----------------------------------------\n");
    } else {
        console.log("\n--- Daily Energy Validation: All days meet target energy. ---\n");
    }

    return overlapIssues.length === 0; // Return true if valid, false if not
}


const finalGeneratedSchedule = buildSchedule(scheduleDefinitions);
const isScheduleValid = validateSchedule(finalGeneratedSchedule, TARGET_DAILY_ENERGY);

// --- Write to JSON file ---
if (isScheduleValid) {
    try {
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalGeneratedSchedule, null, 2));
        console.log(`Successfully generated schedule to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error(`Error writing schedule file: ${error.message}`);
    }
} else {
    console.error("Schedule generation aborted due to time overlaps. Please fix the schedule definitions.");
}
