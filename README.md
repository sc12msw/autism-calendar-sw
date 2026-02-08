# Autism Star Wars Calendar

A personalized daily schedule and energy tracking application with a Star Wars theme, designed to assist individuals who benefit from routine and visual schedules. This application aims to provide a clear, engaging, and customizable way to manage daily activities and monitor personal energy levels.

## Features

*   **Daily/Weekly Schedule Visualization:** Clearly displays daily routines and upcoming events.
*   **Energy Level Tracking:** Tasks are associated with an "energy" impact, allowing users to track their energy fluctuations throughout the day.
*   **Customizable Schedule:** Easily modify and manage your entire weekly schedule using a simple JavaScript file.
*   **Star Wars Theme:** Engaging visual and auditory elements inspired by the Star Wars universe.
*   **Responsive Design:** Optimized for both desktop and mobile viewing experiences.

## Technologies Used

*   **React:** A JavaScript library for building user interfaces.
*   **Vite:** A fast frontend build tool that provides a lightning-fast development experience.
*   **CSS Modules:** For scoped, modular, and maintainable component-level styling.
*   **Node.js & npm:** For package management and running build scripts.

## Setup

To get this project up and running on your local machine:

### Prerequisites

*   Node.js (LTS version recommended)
*   npm (comes with Node.js)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/sc12msw/autism-calendar-sw.git
    cd autism-calendar-sw
    ```
2.  Install project dependencies:
    ```bash
    npm install
    ```

## Running Locally

To start the development server:

```bash
npm run dev
```

This will open the application in your browser, typically at `http://localhost:5173`.

## Editing the Schedule

The schedule data is managed through a JavaScript file, making it easy to define and update your weekly routine without directly editing complex JSON.

1.  **Edit `scripts/generateSchedule.cjs`:**
    Open this file in your code editor. You will find a `scheduleDefinitions` array. This is your primary editing surface.
    *   Use the `createEventBase` helper function to define your event's `title`, `startHour`, `startMinute`, `endHour`, `endMinute`, and `energy` impact.
    *   **Specify repetition:**
        *   `repeatType: 'daily'`: For events that occur every day of the week.
        *   `repeatType: 'weekday'`: For events that occur Monday through Friday.
        *   `repeatType: 'weekend'`: For events that occur on Saturday and Sunday.
        *   `day: MONDAY` (or `SUNDAY`, `TUESDAY`, etc.): For events that occur on a specific day of the week.
    *   The `generateSchedule.cjs` script automatically handles expanding `daily` events into individual day entries and correctly applying `repeat-weekday` or `repeat-weekend` flags for other types.

2.  **Generate `schedule.json`:**
    After making changes to `scripts/generateSchedule.cjs`, run the following command in your terminal:
    ```bash
    node scripts/generateSchedule.cjs
    ```
    This will process your definitions and update the `public/schedule.json` file, which your application reads.

## Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages.

1.  **Ensure you have committed your changes** (including any updates to the schedule and the `CNAME` file).
2.  **Run the deploy script:**
    ```bash
    npm run deploy
    ```
    This command will build your application and push the production-ready code to the `gh-pages` branch of your repository.

### Custom Domain Setup (e.g., `calendar.tojourn.uk`)

If you wish to use a custom domain:

1.  **`public/CNAME` file:** Ensure this file exists in your `public` directory and contains your custom domain (e.g., `calendar.tojourn.uk`). The `npm run deploy` command will automatically copy this file to your `gh-pages` branch.
2.  **DNS Configuration:** Go to your domain registrar's DNS settings and add a CNAME record:
    *   **Host/Name:** `calendar` (or your subdomain prefix)
    *   **Target/Value/Points to:** `sc12msw.github.io` (your GitHub Pages primary domain)

It may take some time for DNS changes to propagate across the internet.

## Screenshot / Demo

*(Add a screenshot or link to a live demo here)*