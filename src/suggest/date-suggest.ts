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

function parseNaturalLanguage(query: string): moment.Moment | null {
	const nextMatch = query.match(/^next\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
	if (nextMatch) {
		const day = nextMatch[1].charAt(0).toUpperCase() + nextMatch[1].slice(1);
		return window.moment().day(day).add(1, "week");
	}

	const lastMatch = query.match(/^last\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/);
	if (lastMatch) {
		const day = lastMatch[1].charAt(0).toUpperCase() + lastMatch[1].slice(1);
		return window.moment().day(day).subtract(1, "week");
	}

	const inMatch = query.match(/^in\s+(\d+)\s+(day|days|week|weeks|month|months)$/);
	if (inMatch) {
		const num = parseInt(inMatch[1], 10);
		let unit = inMatch[2];
		if (unit.endsWith("s")) unit = unit.slice(0, -1);
		return window.moment().add(num, unit as "day" | "week" | "month");
	}

	const agoMatch = query.match(/^(\d+)\s+(day|days|week|weeks|month|months)\s+ago$/);
	if (agoMatch) {
		const num = parseInt(agoMatch[1], 10);
		let unit = agoMatch[2];
		if (unit.endsWith("s")) unit = unit.slice(0, -1);
		return window.moment().subtract(num, unit as "day" | "week" | "month");
	}

	return null;
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
		if ((editor as any).cm?.composing) return null;

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

		if (this.plugin.settings.enableNaturalLanguage && query.length > 0) {
			const parsed = parseNaturalLanguage(query);
			if (parsed) {
				suggestions.push({
					label: query,
					description: parsed.format(this.plugin.settings.dateFormat),
					date: parsed,
				});
			}
		}

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
			this.activePopup = null;
			this.activePopup = new DatePickerPopup({
				app: this.app,
				editor: context.editor,
				startPos: context.start,
				endPos: context.end,
				dateFormat: this.plugin.settings.dateFormat,
				insertAsLink: this.plugin.settings.insertAsLink,
				firstDayOfWeek: this.plugin.settings.firstDayOfWeek,
				enableTime: this.plugin.settings.enableTime,
				timeFormat: this.plugin.settings.timeFormat,
				keepAlias: this.plugin.settings.keepAlias,
				onClose: () => {
					this.activePopup = null;
				},
			});
			this.activePopup.open();
			return;
		}

		this.activePopup?.destroy();
		this.activePopup = null;
		let formatted = suggestion.date!.format(this.plugin.settings.dateFormat);
		if (this.plugin.settings.enableTime) {
			formatted += " " + window.moment().format(this.plugin.settings.timeFormat);
		}
		let insertValue: string;
		if (this.plugin.settings.insertAsLink) {
			insertValue = this.plugin.settings.keepAlias
				? `[[${formatted}|${suggestion.label}]]`
				: `[[${formatted}]]`;
		} else {
			insertValue = formatted;
		}
		context.editor.replaceRange(insertValue, context.start, context.end);
		context.editor.setCursor({
			line: context.start.line,
			ch: context.start.ch + insertValue.length,
		});
		context.editor.focus();
	}
}
