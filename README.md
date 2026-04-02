# MMM-DaysOff

A [MagicMirror²](https://magicmirror.builders/) module that parses a Google Calendar iCal feed for events tagged with `[A]`, `[M]`, or `[A&M]` in the title and displays upcoming days off grouped by person.

Unlike the built-in calendar module, MMM-DaysOff performs tag-based parsing so you can track days off for specific people from a single shared calendar.

![Screenshot placeholder](screenshot.png)

## Installation

1. Navigate to your MagicMirror modules directory:

```bash
cd ~/MagicMirror/modules
```

2. Clone this repository:

```bash
git clone https://github.com/MatthewNewsum/MMM-DaysOff.git
```

No `npm install` is required -- this module has no external dependencies.

## Configuration

Add the following to the `modules` array in your `config/config.js` file:

```javascript
{
    module: "MMM-DaysOff",
    position: "top_left",
    config: {
        icalUrl: "https://calendar.google.com/calendar/ical/YOUR_CALENDAR_ID/public/basic.ics",
        tags: ["A", "M", "A&M"],
        maxEvents: 10,
        header: "DAYS OFF",
        dateFormat: { month: "short", day: "numeric" },
        updateInterval: 3600000
    }
}
```

## Config Options

| Option           | Description                                             | Default                            |
| ---------------- | ------------------------------------------------------- | ---------------------------------- |
| `icalUrl`        | **Required.** URL of your Google Calendar iCal feed.    | `""`                               |
| `tags`           | Array of tags to look for in event titles.              | `["A", "M", "A&M"]`               |
| `maxEvents`      | Maximum number of upcoming events to display.           | `10`                               |
| `header`         | Header text shown above the list.                       | `"DAYS OFF"`                       |
| `dateFormat`     | Date formatting options passed to `toLocaleDateString`. | `{ month: "short", day: "numeric" }` |
| `updateInterval` | How often to refresh the calendar feed (ms).            | `3600000` (1 hour)                 |

## How It Works

1. The module fetches the iCal feed from the configured URL at the configured interval.
2. It parses each `VEVENT` block and looks for a tag at the start of the `SUMMARY` field matching the pattern `[TAG]` (e.g. `[A] Holiday`, `[M] Sick day`, `[A&M] Bank holiday`).
3. Only future events with a matching tag are kept.
4. Events are sorted by date and the first N (controlled by `maxEvents`) are displayed on the mirror.

### Setting Up Your Google Calendar

1. Create a Google Calendar (or use an existing one) for tracking days off.
2. Add events with a tag prefix in the title, for example: `[A] Annual leave` or `[M] Doctor appointment`.
3. Go to the calendar's settings, scroll to "Integrate calendar", and copy the "Secret address in iCal format" URL.
4. Paste that URL as the `icalUrl` value in your module config.

## License

MIT
