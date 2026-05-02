import { App, PluginSettingTab, Setting } from "obsidian";
import type DateSuggestPlugin from "../main";

export class DateSuggestSettingTab extends PluginSettingTab {
	plugin: DateSuggestPlugin;

	constructor(app: App, plugin: DateSuggestPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Date format")
			.setDesc("Moment.js format string for inserted dates")
			.addText((text) =>
				text.setValue(this.plugin.settings.dateFormat).onChange(async (value) => {
					this.plugin.settings.dateFormat = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Trigger phrase")
			.setDesc("Character(s) that open the date suggest menu")
			.addText((text) =>
				text.setValue(this.plugin.settings.triggerPhrase).onChange(async (value) => {
					this.plugin.settings.triggerPhrase = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Insert as link")
			.setDesc("Wrap inserted dates in [[wikilinks]]")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.insertAsLink).onChange(async (value) => {
					this.plugin.settings.insertAsLink = value;
					await this.plugin.saveSettings();
				})
			);
	}
}
