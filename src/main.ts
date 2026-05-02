import { Plugin } from "obsidian";
import { DateSuggestSettings, DEFAULT_SETTINGS } from "./settings";
import { DateSuggestSettingTab } from "./settings-ui";
import { DateSuggest } from "./suggest/date-suggest";

export default class DateSuggestPlugin extends Plugin {
	settings: DateSuggestSettings;
	private suggester!: DateSuggest;

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new DateSuggestSettingTab(this.app, this));
		this.suggester = new DateSuggest(this.app, this);
		this.registerEditorSuggest(this.suggester);
	}

	onunload() {
		this.suggester.destroy();
		this.suggester = undefined!;
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
