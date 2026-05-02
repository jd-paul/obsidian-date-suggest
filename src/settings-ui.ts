import { App, PluginSettingTab, Setting } from "obsidian";
import type DateSuggestPlugin from "./main";

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

		new Setting(containerEl).setName("Calendar").setHeading();

		new Setting(containerEl)
			.setName("First day of week")
			.setDesc("Choose the first day displayed in the calendar popup")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("locale", "Locale default")
					.addOption("sunday", "Sunday")
					.addOption("monday", "Monday")
					.setValue(this.plugin.settings.firstDayOfWeek)
					.onChange(async (value) => {
						this.plugin.settings.firstDayOfWeek = value as "locale" | "sunday" | "monday";
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl).setName("Time").setHeading();

		new Setting(containerEl)
			.setName("Enable time")
			.setDesc("Append the current time when inserting a date")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableTime).onChange(async (value) => {
					this.plugin.settings.enableTime = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Time format")
			.setDesc("Moment.js format string for the appended time")
			.addText((text) =>
				text.setValue(this.plugin.settings.timeFormat).onChange(async (value) => {
					this.plugin.settings.timeFormat = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl).setName("Advanced").setHeading();

		new Setting(containerEl)
			.setName("Keep alias")
			.setDesc("When inserting as a link, preserve the original trigger text as an alias (e.g. [[date|alias]])")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.keepAlias).onChange(async (value) => {
					this.plugin.settings.keepAlias = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName("Enable natural language")
			.setDesc("Allow typing phrases like 'next monday' or 'in 3 days' to find dates")
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.enableNaturalLanguage).onChange(async (value) => {
					this.plugin.settings.enableNaturalLanguage = value;
					await this.plugin.saveSettings();
				})
			);
	}
}
