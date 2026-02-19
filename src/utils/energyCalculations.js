// src/utils/energyCalculations.js

/**
 * Calculates the cumulative daily energy totals and the weekly energy total
 * based on a starting balance of MAX_DAILY_ENERGY and carry-over logic.
 * The "sleep event" is integrated into the daily starting balance calculation.
 *
 * @param {Array<Object>} expandedSchedule - The schedule of events for the week, already expanded and sorted.
 * @param {number} MAX_DAILY_ENERGY - The maximum energy (spoons) a person starts with each day (e.g., 12).
 * @returns {{dailyEnergyTotals: Object, weeklyEnergyTotal: number}} An object containing
 *   dailyEnergyTotals (cumulative balance at the end of each day) and
 *   weeklyEnergyTotal (final cumulative balance at the end of Saturday).
 */
export const calculateEnergyTotals = (expandedSchedule, MAX_DAILY_ENERGY) => {
    const dailyEnergyTotals = {};
    let currentDayStartingBalance = MAX_DAILY_ENERGY; // Balance available at the start of the current day, BEFORE that day's events.

    for (let day = 0; day <= 6; day++) { // Iterate through days from Sunday (0) to Saturday (6)
        // Adjust starting balance for the current day based on previous day's carry-over
        if (day > 0) {
            const previousDayEndBalance = dailyEnergyTotals[day - 1]; // Balance AFTER previous day's events

            // "Sleep event adds 12 spoons every night" + "carry-over" logic:
            // The previous day's balance is compared to MAX_DAILY_ENERGY to find the carry-over.
            // This carry-over then modifies the current day's MAX_DAILY_ENERGY starting point.
            // Example:
            //   - If previousDayEndBalance was 15 (MAX_DAILY_ENERGY + 3), carryOver is +3.
            //     currentDayStartingBalance = MAX_DAILY_ENERGY + 3 = 15.
            //   - If previousDayEndBalance was 10 (MAX_DAILY_ENERGY - 2), carryOver is -2.
            //     currentDayStartingBalance = MAX_DAILY_ENERGY - 2 = 10.
            const carryOverFromPreviousDay = previousDayEndBalance - MAX_DAILY_ENERGY;
            currentDayStartingBalance = MAX_DAILY_ENERGY + carryOverFromPreviousDay;
        }

        // Calculate net change from events for the current day
        const eventsForDay = expandedSchedule.filter(event => event.day === day);
        const dailyNetChangeFromEvents = eventsForDay.reduce((sum, event) => sum + event.energy, 0);

        // Calculate balance at the end of the current day
        const endOfDayBalance = currentDayStartingBalance + dailyNetChangeFromEvents;
        dailyEnergyTotals[day] = endOfDayBalance;
    }

    const weeklyEnergyTotal = dailyEnergyTotals[6]; // The final balance at the end of Saturday

    return { dailyEnergyTotals, weeklyEnergyTotal };
};
