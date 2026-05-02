import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	Plugin,
	PluginSettingTab,
	Setting,
	TFile,
} from "obsidian";

interface DateSuggestSettings {
	dateFormat: string;
	triggerPhrase: string;
	insertAsLink: boolean;
}

const DEFAULT_SETTINGS: DateSuggestSettings = {
	dateFormat: "DD-MM-YYYY",
	triggerPhrase: "@",
	insertAsLink: false,
};

interface DateSuggestion {
	label: string;
	description?: string;
	date: moment.Moment;
}

class DateSuggest extends EditorSuggest<DateSuggestion> {
	plugin: DateSuggestPlugin;

	constructor(app: App, plugin: DateSuggestPlugin) {
		super(app);
		this.plugin = plugin;
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		file: TFile
	): EditorSuggestTriggerInfo | null {
		const trigger = this.plugin.settings.triggerPhrase;
		const range = editor.getRange(
			{ line: cursor.line, ch: 0 },
			cursor
		);

		// Find the last trigger character before cursor
		const lastTriggerIndex = range.lastIndexOf(trigger);
		if (lastTriggerIndex === -1) return null;

		// Make sure trigger is at a word boundary (not mid-word like an email)
		const charBeforeTrigger = range.charAt(lastTriggerIndex - 1);
		if (lastTriggerIndex > 0 && !/\s/.test(charBeforeTrigger)) {
			return null;
		}

		return {
			start: {
				line: cursor.line,
				ch: lastTriggerIndex,
			},
			end: cursor,
			query: range.substring(lastTriggerIndex + trigger.length),
		};
	}

	getSuggestions(context: EditorSuggestContext): DateSuggestion[] {
		const query = context.query.toLowerCase().trim();
		const suggestions: DateSuggestion[] = [];

		const now = window.moment();

		// Always add static shortcuts
		suggestions.push(
			{ label: "Today", description: now.format(this.plugin.settings.dateFormat), date: now.clone() },
			{ label: "Tomorrow", description: now.clone().add(1, "day").format(this.plugin.settings.dateFormat), date: now.clone().add(1, "day") },
			{ label: "Yesterday", description: now.clone().subtract(1, "day").format(this.plugin.settings.dateFormat), date: now.clone().subtract(1, "day") }
		);

		// Filter by query if user typed something
		if (query.length > 0) {
			return suggestions.filter((s) =>
				s.label.toLowerCase().includes(query)
			);
		}

		return suggestions;
	}

	renderSuggestion(suggestion: DateSuggestion, el: HTMLElement): void {
		el.createSpan({ text: suggestion.label });
		if (suggestion.description) {
			el.createSpan({
				cls: "date-suggest-hint",
				text: suggestion.description,
			});
		}
	}

	selectSuggestion(
		suggestion: DateSuggestion,
		evt: MouseEvent | KeyboardEvent
	): void {
		const { context } = this;
		if (!context) return;

		const formatted = suggestion.date.format(this.plugin.settings.dateFormat);
		const insertValue = this.plugin.settings.insertAsLink
			? `[[${formatted}]]`
			: formatted;

		context.editor.replaceRange(
			insertValue,
			context.start,
			context.end
		);
	}
}

class DateSuggestSettingTab extends PluginSettingTab {
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
				text
					.setValue(this.plugin.settings.dateFormat)
					.onChange(async (value) => {
						this.plugin.settings.dateFormat = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Trigger phrase")
			.setDesc("Character(s) that open the date suggest menu")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.triggerPhrase)
					.onChange(async (value) => {
						this.plugin.settings.triggerPhrase = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Insert as link")
			.setDesc("Wrap inserted dates in [[wikilinks]]")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.insertAsLink)
					.onChange(async (value) => {
						this.plugin.settings.insertAsLink = value;
						await this.plugin.saveSettings();
					})
			);
	}
}

export default class DateSuggestPlugin extends Plugin {
	settings: DateSuggestSettings;

	async onload() {
		await this.loadSettings();

		this.addSettingTab(new DateSuggestSettingTab(this.app, this));
		this.registerEditorSuggest(new DateSuggest(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
