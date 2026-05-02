import { Plugin, Editor } from "obsidian";
import { DateSuggestSettings, DEFAULT_SETTINGS } from "./settings";
import { DateSuggestSettingTab } from "./settings-ui";
import { DateSuggest } from "./suggest/date-suggest";
import { DatePickerPopup } from "./components/date-picker-popup";

export default class DateSuggestPlugin extends Plugin {
	settings: DateSuggestSettings;
	private suggester!: DateSuggest;
	private unloaded = false;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new DateSuggestSettingTab(this.app, this));
		this.suggester = new DateSuggest(this.app, this);
		this.registerEditorSuggest(this.suggester);

		this.addCommand({
			id: "insert-today",
			name: "Insert today's date",
			editorCallback: (editor: Editor) => {
				let formatted = window.moment().format(this.settings.dateFormat);
				if (this.settings.enableTime) {
					formatted += " " + window.moment().format(this.settings.timeFormat);
				}
				const insertValue = this.settings.insertAsLink ? `[[${formatted}]]` : formatted;
				const cursor = editor.getCursor();
				editor.replaceRange(insertValue, cursor);
				editor.setCursor({
					line: cursor.line,
					ch: cursor.ch + insertValue.length,
				});
				editor.focus();
			},
		});

		this.addCommand({
			id: "open-date-picker",
			name: "Open date picker",
			editorCallback: (editor: Editor) => {
				const cursor = editor.getCursor();
				const popup = new DatePickerPopup({
					app: this.app,
					editor,
					startPos: cursor,
					endPos: cursor,
					dateFormat: this.settings.dateFormat,
					insertAsLink: this.settings.insertAsLink,
					firstDayOfWeek: this.settings.firstDayOfWeek,
					enableTime: this.settings.enableTime,
					timeFormat: this.settings.timeFormat,
					keepAlias: this.settings.keepAlias,
				});
				popup.open();
			},
		});
	}

	onunload() {
		this.unloaded = true;
		try {
			this.suggester.destroy();
		} catch {
			// ignore errors during unload
		}
		this.suggester = undefined!;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
