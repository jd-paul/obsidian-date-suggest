import { App, Editor, EditorPosition } from "obsidian";
import { $ } from "../utils";

interface DatePickerPopupOptions {
	app: App;
	editor: Editor;
	startPos: EditorPosition;
	endPos: EditorPosition;
	dateFormat: string;
	insertAsLink: boolean;
	onClose?: () => void;
}

export class DatePickerPopup {
	private app: App;
	private editor: Editor;
	private startPos: EditorPosition;
	private endPos: EditorPosition;
	private dateFormat: string;
	private insertAsLink: boolean;
	private onClose?: () => void;

	private popupEl: HTMLElement | null = null;
	private cleanupFns: (() => void)[] = [];
	private currentMonth: moment.Moment;
	private selectedDate: moment.Moment;
	private dayElements: { date: moment.Moment; el: HTMLElement }[] = [];

	constructor(options: DatePickerPopupOptions) {
		this.app = options.app;
		this.editor = options.editor;
		this.startPos = options.startPos;
		this.endPos = options.endPos;
		this.dateFormat = options.dateFormat;
		this.insertAsLink = options.insertAsLink;
		this.onClose = options.onClose;
		this.currentMonth = window.moment().startOf("month");
		this.selectedDate = window.moment().startOf("day");
	}

	open(): void {
		const cursorCoords = this.editor.coordsAtPos(this.startPos);
		if (!cursorCoords) {
			this.destroy();
			return;
		}

		this.popupEl = document.createElement("div");
		this.popupEl.addClass($("popup"));
		this.popupEl.style.position = "fixed";
		this.popupEl.style.left = `${cursorCoords.left}px`;
		this.popupEl.style.top = `${cursorCoords.bottom + 4}px`;
		this.popupEl.style.zIndex = "1000";
		document.body.appendChild(this.popupEl);

		this.render();
		this.attachCloseListeners();
	}

	private render(): void {
		if (!this.popupEl) return;
		this.popupEl.empty();
		this.dayElements = [];

		// Header
		const header = this.popupEl.createDiv({ cls: $("header") });
		const prevBtn = header.createEl("button", { cls: $("nav"), text: "‹" });
		prevBtn.onclick = () => {
			this.currentMonth.subtract(1, "month");
			this.render();
		};
		header.createDiv({ cls: $("title"), text: this.currentMonth.format("MMMM YYYY") });
		const nextBtn = header.createEl("button", { cls: $("nav"), text: "›" });
		nextBtn.onclick = () => {
			this.currentMonth.add(1, "month");
			this.render();
		};

		// Weekdays
		const weekdays = this.popupEl.createDiv({ cls: $("weekdays") });
		const weekStart = window.moment().localeData().firstDayOfWeek();
		for (let i = 0; i < 7; i++) {
			const dayIndex = (weekStart + i) % 7;
			weekdays.createDiv({
				cls: $("weekday"),
				text: window.moment().day(dayIndex).format("dd"),
			});
		}

		// Days grid
		const grid = this.popupEl.createDiv({ cls: $("grid") });
		const startOfMonth = this.currentMonth.clone().startOf("month");
		const endOfMonth = this.currentMonth.clone().endOf("month");
		const startDay = startOfMonth.day();
		const daysFromPrevMonth = (startDay - weekStart + 7) % 7;
		const prevMonth = startOfMonth.clone().subtract(1, "month");
		const prevMonthDays = prevMonth.daysInMonth();
		const today = window.moment().startOf("day");

		// Previous month padding
		for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
			grid.createDiv({ cls: `${$("day")} is-padding-day`, text: String(prevMonthDays - i) });
		}

		// Current month days
		for (let day = 1; day <= endOfMonth.date(); day++) {
			const date = this.currentMonth.clone().date(day);
			const dayEl = grid.createDiv({ cls: $("day"), text: String(day) });
			if (date.isSame(today, "day")) dayEl.addClass("is-today");
			this.dayElements.push({ date, el: dayEl });
			dayEl.onclick = () => {
				this.selectDate(date);
			};
		}

		// Next month padding
		const remainingCells = 42 - (daysFromPrevMonth + endOfMonth.date());
		for (let day = 1; day <= remainingCells; day++) {
			grid.createDiv({ cls: `${$("day")} is-padding-day`, text: String(day) });
		}

		this.highlightSelectedDate();
	}

	private highlightSelectedDate(): void {
		for (const { date, el } of this.dayElements) {
			if (date.isSame(this.selectedDate, "day")) {
				el.addClass("is-selected");
			} else {
				el.removeClass("is-selected");
			}
		}
	}

	private moveSelection(dir: "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight"): void {
		let newDate = this.selectedDate.clone();

		if (dir === "ArrowLeft") {
			newDate.subtract(1, "day");
		} else if (dir === "ArrowRight") {
			newDate.add(1, "day");
		} else if (dir === "ArrowUp") {
			newDate.subtract(1, "week");
		} else if (dir === "ArrowDown") {
			newDate.add(1, "week");
		}

		if (!newDate.isSame(this.currentMonth, "month")) {
			this.currentMonth = newDate.clone().startOf("month");
			this.selectedDate = newDate;
			this.render();
		} else {
			this.selectedDate = newDate;
			this.highlightSelectedDate();
		}
	}

	private selectDate(date: moment.Moment): void {
		const formatted = date.format(this.dateFormat);
		const insertValue = this.insertAsLink ? `[[${formatted}]]` : formatted;
		this.editor.replaceRange(insertValue, this.startPos, this.endPos);
		this.editor.setCursor({
			line: this.startPos.line,
			ch: this.startPos.ch + insertValue.length,
		});
		this.editor.focus();
		this.destroy();
	}

	private attachCloseListeners(): void {
		// Click outside
		const clickHandler = (evt: MouseEvent) => {
			if (this.popupEl && !this.popupEl.contains(evt.target as Node)) {
				this.destroy();
			}
		};
		document.addEventListener("mousedown", clickHandler);
		this.cleanupFns.push(() => document.removeEventListener("mousedown", clickHandler));

		// Keyboard navigation & dismissal
		const keyHandler = (evt: KeyboardEvent) => {
			const hasModifiers = evt.ctrlKey || evt.metaKey || evt.altKey || evt.shiftKey;

			if (!hasModifiers && evt.key === "Escape") {
				evt.preventDefault();
				this.destroy();
				return;
			}

			if (!hasModifiers && evt.key === "Enter") {
				evt.preventDefault();
				this.selectDate(this.selectedDate);
				return;
			}

			if (!hasModifiers && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(evt.key)) {
				evt.preventDefault();
				this.moveSelection(evt.key as "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight");
				return;
			}

			// Any other key closes the popup and passes through to the editor
			this.destroy();
		};
		document.addEventListener("keydown", keyHandler);
		this.cleanupFns.push(() => document.removeEventListener("keydown", keyHandler));

		// Tab switch / pane change
		const tabHandler = () => this.destroy();
		this.app.workspace.on("active-leaf-change", tabHandler);
		this.cleanupFns.push(() => this.app.workspace.off("active-leaf-change", tabHandler));

		// Window blur (clicking outside Obsidian)
		const blurHandler = () => this.destroy();
		window.addEventListener("blur", blurHandler);
		this.cleanupFns.push(() => window.removeEventListener("blur", blurHandler));
	}

	destroy(): void {
		this.cleanupFns.forEach((fn) => fn());
		this.cleanupFns = [];

		if (this.popupEl) {
			this.popupEl.remove();
			this.popupEl = null;
		}

		this.onClose?.();
	}
}
