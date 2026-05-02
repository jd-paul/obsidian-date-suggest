# Date Suggest

Quickly insert dates in Obsidian using an `@` trigger — no more typing out today's date by hand.

## Features

- **Type `@`** (or your custom trigger) anywhere in a note to open the date suggester
- **Instant shortcuts**: Today, Tomorrow, Yesterday
- **Calendar picker**: Choose any date from a visual calendar popup
- **Wikilink support**: Optionally wrap inserted dates in `[[ ]]`
- **Customizable format**: Use any Moment.js date format string
- **Smart triggering**: Only activates when the trigger follows whitespace or starts a line

## Usage

1. In any note, type `@` (or your configured trigger phrase).
2. A suggest menu appears with options:
   - **View calendar** — opens a date picker popup
   - **Today** — inserts today's date
   - **Tomorrow** — inserts tomorrow's date
   - **Yesterday** — inserts yesterday's date
3. Use arrow keys to navigate, `Enter` to select, or keep typing to filter results.

## Settings

| Setting | Description | Default |
|---|---|---|
| **Date format** | Moment.js format string for inserted dates | `DD-MM-YYYY` |
| **Trigger phrase** | Character(s) that open the suggest menu | `@` |
| **Insert as link** | Wrap inserted dates in `[[wikilinks]]` | `false` |

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
