const fs = require('fs');
const path = require('path');

// --- Configuration ---
const OUTPUT_FILE = path.join(__dirname, '../public/schedule.json');
const TARGET_DAILY_ENERGY = 12; // New constant for the target energy

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
    // --- Daily Recurring Events (will be expanded to all 7 days by the script) ---
    {
        event: createEventBase("Brush Teeth", 7, 0, 7, 10, 0),
        repeatType: 'daily'
    },
    {
        event: createEventBase("Shower", 7, 10, 7, 30, 0),
        repeatType: 'daily'
    },
    {
        event: createEventBase("Wind-down (Reading as a couple)", 21, 0, 22, 0, 2),
        repeatType: 'daily'
    },
    {
        event: createEventBase("Dinner", 19, 0, 20, 0, 0), // Default dinner time
        repeatType: 'daily'
    },

    // --- Weekday Schedule (These will have the 'repeat-weekday' flag) ---
    // Note: If you want to override a daily event for a weekday, define it as a specific 'day' event.
    {
        event: createEventBase("Morning Routine (Wake, Dress, Breakfast)", 7, 30, 8, 0, -2),
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
    
    // --- Weekend Schedule (These will have the 'repeat-weekend' flag) ---
    // Note: If you want to override a daily event for a weekend day, define it as a specific 'day' event.
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
    // These events will override any 'daily' or 'weekday/weekend' expanded events that fall into
    // the same exact day and time slot.

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
    {
        event: createEventBase("Sunday Dinner (Special)", 18, 0, 19, 0, 0), // This will override the daily dinner for Sunday
        day: SUNDAY
    },
];

// --- Schedule Generation Logic ---
function buildSchedule(definitions) {
    const concreteEvents = new Map(); // Key: `${day}_${startHour}_${startMinute}_${endHour}_${endMinute}`
    const repeatingFlagEvents = []; // Events with repeat-weekday or repeat-weekend flags

    // Pass 1: Process Daily Events (lowest precedence, expanded to specific days)
    definitions.filter(def => def.repeatType === 'daily').forEach(def => {
        ALL_DAYS_INDICES.forEach(dayIndex => {
            const event = { ...def.event, day: dayIndex };
            const key = `${dayIndex}_${event.startHour}_${event.startMinute}_${event.endHour}_${event.endMinute}`;
            concreteEvents.set(key, event);
        });
    });

    // Pass 2: Process Weekday/Weekend Events (add to repeatingFlagEvents list)
    definitions.filter(def => def.repeatType === 'weekday').forEach(def => {
        repeatingFlagEvents.push({ ...def.event, 'repeat-weekday': true });
    });

    definitions.filter(def => def.repeatType === 'weekend').forEach(def => {
        repeatingFlagEvents.push({ ...def.event, 'repeat-weekend': true });
    });

    // Pass 3: Process Specific Day Events (highest precedence, override concreteEvents)
    definitions.filter(def => def.day !== undefined && def.repeatType === undefined).forEach(def => {
        const event = { ...def.event, day: def.day };
        const key = `${event.day}_${event.startHour}_${event.startMinute}_${event.endHour}_${event.endMinute}`;
        concreteEvents.set(key, event); // This will overwrite any daily event at the same slot
    });

    // Combine all events: concrete day-specific events + repeating flagged events
    let finalScheduleList = [...Array.from(concreteEvents.values()), ...repeatingFlagEvents];

    // Sort events by day, then by start time, ensuring repeating flags are sorted consistently
    finalScheduleList.sort((a, b) => {
        // Assign a numeric value for sorting. Specific days take precedence.
        // repeat-weekday (-2) < repeat-weekend (-1) < specific day (0-6)
        // A placeholder of 99 is used for events without day or repeat flags (shouldn't happen with current definitions)
        let dayA = a.day !== undefined ? a.day : (a['repeat-weekday'] ? -2 : (a['repeat-weekend'] ? -1 : 99));
        let dayB = b.day !== undefined ? b.day : (b['repeat-weekday'] ? -2 : (b['repeat-weekend'] ? -1 : 99));
        
        if (dayA !== dayB) {
            return dayA - dayB;
        }

        // If days are the same (or both repeating flags of the same type), sort by time
        if (a.startHour !== b.startHour) {
            return a.startHour - b.startHour;
        }
        return a.startMinute - b.startMinute;
    });

    return finalScheduleList;
}

// --- Energy Validation Logic ---
function validateDailyEnergy(schedule, targetEnergy) {
    const dailyEnergyTotals = Array(7).fill(0); // For SUNDAY to SATURDAY
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const validationIssues = [];

    // First, process all concrete events (those with a 'day' property)
    schedule.filter(event => event.day !== undefined).forEach(event => {
        if (event.energy !== undefined && typeof event.energy === 'number') {
            dailyEnergyTotals[event.day] += event.energy;
        }
    });

    // Then, process repeating events and add their energy to relevant days,
    // only if that day's slot isn't already covered by a more specific event.
    // This requires re-simulating the app's event layering.
    // However, the "schedule" here is already the final, processed list.
    // We need to re-extract the base-level daily events for each day,
    // accounting for overrides, similar to how the calendar app would *actually* render.

    // Let's create a temporary structure that represents the final expanded schedule for energy calculation.
    const expandedDailySchedule = ALL_DAYS_INDICES.map(() => new Map()); // Map<time_slot_key, event> for each day

    schedule.forEach(event => {
        if (event.day !== undefined) {
            const key = `${event.startHour}_${event.startMinute}_${event.endHour}_${event.endMinute}`;
            expandedDailySchedule[event.day].set(key, event);
        } else if (event['repeat-weekday']) {
            WEEKDAY_INDICES.forEach(dayIndex => {
                const key = `${event.startHour}_${event.startMinute}_${event.endHour}_${event.endMinute}`;
                // Only add if not already overridden by a specific day event
                if (!expandedDailySchedule[dayIndex].has(key)) {
                    expandedDailySchedule[dayIndex].set(key, { ...event, day: dayIndex });
                }
            });
        } else if (event['repeat-weekend']) {
            WEEKEND_INDICES.forEach(dayIndex => {
                const key = `${event.startHour}_${event.startMinute}_${event.endHour}_${event.endMinute}`;
                // Only add if not already overridden by a specific day event
                if (!expandedDailySchedule[dayIndex].has(key)) {
                    expandedDailySchedule[dayIndex].set(key, { ...event, day: dayIndex });
                }
            });
        }
    });

    // Now calculate totals from the expandedDailySchedule
    ALL_DAYS_INDICES.forEach(dayIndex => {
        let totalEnergyForDay = 0;
        expandedDailySchedule[dayIndex].forEach(event => {
            if (event.energy !== undefined && typeof event.energy === 'number') {
                totalEnergyForDay += event.energy;
            }
        });
        dailyEnergyTotals[dayIndex] = totalEnergyForDay;

        if (totalEnergyForDay !== targetEnergy) {
            validationIssues.push(
                `${dayNames[dayIndex]}: Expected ${TARGET_DAILY_ENERGY}, Got ${totalEnergyForDay}`
            );
        }
    });

    if (validationIssues.length > 0) {
        console.warn("\n--- Daily Energy Validation Warnings ---");
        validationIssues.forEach(issue => console.warn(`WARNING: ${issue}`));
        console.warn("----------------------------------------\n");
    } else {
        console.log("\n--- Daily Energy Validation: All days meet target energy. ---\n");
    }
}


const finalGeneratedSchedule = buildSchedule(scheduleDefinitions);
validateDailyEnergy(finalGeneratedSchedule, TARGET_DAILY_ENERGY);

// --- Write to JSON file ---
try {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalGeneratedSchedule, null, 2));
    console.log(`Successfully generated schedule to ${OUTPUT_FILE}`);
} catch (error) {
    console.error(`Error writing schedule file: ${error.message}`);
}