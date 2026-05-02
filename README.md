# Date Suggest

Quickly insert dates in Obsidian using an `@` trigger — no more typing out today's date by hand.

## Features

- **Type `@`** (or your custom trigger) anywhere in a note to open the date suggester
- **Instant shortcuts**: Today, Tomorrow, Yesterday
- **Natural language**: Type `@next monday`, `@in 3 days`, `@2 weeks ago` (optional setting)
- **Calendar picker**: Choose any date from a visual calendar popup with keyboard navigation
- **Wikilink support**: Optionally wrap inserted dates in `[[ ]]` or preserve aliases like `[[date|Today]]`
- **Time support**: Append the current time alongside dates (optional setting)
- **Customizable format**: Use any Moment.js date/time format string
- **First day of week**: Override locale defaults for the calendar grid
- **Smart triggering**: Only activates when the trigger follows whitespace or starts a line
- **Command palette commands**: Insert today's date or open the date picker without typing the trigger

## Usage

1. In any note, type `@` (or your configured trigger phrase).
2. A suggest menu appears with options:
   - **View calendar** — opens a date picker popup
   - **Today** — inserts today's date
   - **Tomorrow** — inserts tomorrow's date
   - **Yesterday** — inserts yesterday's date
3. Use arrow keys to navigate, `Enter` to select, or keep typing to filter results.
4. In the calendar popup:
   - `←` `→` `↑` `↓` to navigate days
   - `Enter` to select the highlighted date
   - `Escape` to close without inserting

## Settings

| Setting | Description | Default |
|---|---|---|
| **Date format** | Moment.js format string for inserted dates | `DD-MM-YYYY` |
| **Trigger phrase** | Character(s) that open the suggest menu | `@` |
| **Insert as link** | Wrap inserted dates in `[[wikilinks]]` | `false` |
| **First day of week** | Calendar grid start day | `Locale default` |
| **Enable time** | Append current time when inserting dates | `false` |
| **Time format** | Moment.js format string for appended time | `HH:mm` |
| **Keep alias** | Preserve original text as link alias `[[date\|Today]]` | `false` |
| **Enable natural language** | Allow phrases like "next friday" or "in 3 days" | `false` |

## Command Palette

Two commands are available even without typing the trigger:

- **Insert today's date** — inserts the current date at the cursor position
- **Open date picker** — opens the calendar popup at the cursor position

## Installation

### From Community Plugins (once published)

1. Open **Settings → Community Plugins**
2. Turn on **Safe Mode** if prompted
3. Click **Browse** and search for "Date Suggest"
4. Click **Install**, then **Enable**

### Manual Installation

1. Download the latest release from GitHub
2. Extract the archive into your Obsidian vault's `.obsidian/plugins/obsidian-date-suggest/` folder
3. Ensure `main.js`, `manifest.json`, and `styles.css` are present
4. Open **Settings → Community Plugins** and enable **Date Suggest**

## Development

```bash
npm install
npm run build
```

## Author

Made by [jd-paul](https://github.com/jd-paul).

## License

MIT
