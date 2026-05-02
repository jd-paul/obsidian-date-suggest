import {
	App,
	Editor,
	EditorPosition,
	EditorSuggest,
	EditorSuggestContext,
	EditorSuggestTriggerInfo,
	TFile,
} from "obsidian";
import type DateSuggestPlugin from "../main";
import { $ } from "../utils";
import { DatePickerPopup } from "../components/date-picker-popup";

export interface DateSuggestion {
	label: string;
	description?: string;
	date?: moment.Moment;
	isCalendarAction?: boolean;
}

export class DateSuggest extends EditorSuggest<DateSuggestion> {
	private plugin: DateSuggestPlugin;
	private activePopup: DatePickerPopup | null = null;

	constructor(app: App, plugin: DateSuggestPlugin) {
		super(app);
		this.plugin = plugin;
	}

	destroy(): void {
		this.activePopup?.destroy();
		this.activePopup = null;
	}

	onTrigger(
		cursor: EditorPosition,
		editor: Editor,
		file: TFile
	): EditorSuggestTriggerInfo | null {
		const trigger = this.plugin.settings.triggerPhrase;
		const range = editor.getRange({ line: cursor.line, ch: 0 }, cursor);

		const lastTriggerIndex = range.lastIndexOf(trigger);
		if (lastTriggerIndex === -1) return null;

		const charBeforeTrigger = range.charAt(lastTriggerIndex - 1);
		if (lastTriggerIndex > 0 && !/\s/.test(charBeforeTrigger)) {
			return null;
		}

		return {
			start: { line: cursor.line, ch: lastTriggerIndex },
			end: cursor,
			query: range.substring(lastTriggerIndex + trigger.length),
		};
	}

	getSuggestions(context: EditorSuggestContext): DateSuggestion[] {
		const query = context.query.toLowerCase().trim();
		const suggestions: DateSuggestion[] = [];
		const now = window.moment();

		suggestions.push({ label: "View calendar", isCalendarAction: true });
		suggestions.push(
			{ label: "Today", description: now.format(this.plugin.settings.dateFormat), date: now.clone() },
			{ label: "Tomorrow", description: now.clone().add(1, "day").format(this.plugin.settings.dateFormat), date: now.clone().add(1, "day") },
			{ label: "Yesterday", description: now.clone().subtract(1, "day").format(this.plugin.settings.dateFormat), date: now.clone().subtract(1, "day") }
		);

		if (query.length > 0) {
			return suggestions.filter((s) => s.label.toLowerCase().includes(query));
		}
		return suggestions;
	}

	renderSuggestion(suggestion: DateSuggestion, el: HTMLElement): void {
		if (suggestion.isCalendarAction) {
			el.addClass($("action"));
		}
		el.createSpan({ text: suggestion.label });
		if (suggestion.description) {
			el.createSpan({ cls: $("hint"), text: suggestion.description });
		}
	}

	selectSuggestion(suggestion: DateSuggestion, evt: MouseEvent | KeyboardEvent): void {
		const { context } = this;
		if (!context) return;

		if (suggestion.isCalendarAction) {
			this.close();
			this.activePopup?.destroy();
			this.activePopup = new DatePickerPopup({
				app: this.app,
				editor: context.editor,
				insertPos: context.start,
				dateFormat: this.plugin.settings.dateFormat,
				insertAsLink: this.plugin.settings.insertAsLink,
				onClose: () => {
					this.activePopup = null;
				},
			});
			this.activePopup.open();
			return;
		}

		const formatted = suggestion.date!.format(this.plugin.settings.dateFormat);
		const insertValue = this.plugin.settings.insertAsLink ? `[[${formatted}]]` : formatted;
		context.editor.replaceRange(insertValue, context.start, context.end);
	}
}
