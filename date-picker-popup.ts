import { App, Editor, EditorPosition } from "obsidian";

const PLUGIN_ID = "date-suggest";
const $ = (cls: string) => `${PLUGIN_ID}__${cls}`;

interface DatePickerPopupOptions {
	app: App;
	editor: Editor;
	insertPos: EditorPosition;
	dateFormat: string;
	insertAsLink: boolean;
	onClose?: () => void;
}

export class DatePickerPopup {
	private app: App;
	private editor: Editor;
	private insertPos: EditorPosition;
	private dateFormat: string;
	private insertAsLink: boolean;
	private onClose?: () => void;

	private popupEl: HTMLElement | null = null;
	private cleanupFns: (() => void)[] = [];
	private currentMonth: moment.Moment;

	constructor(options: DatePickerPopupOptions) {
		this.app = options.app;
		this.editor = options.editor;
		this.insertPos = options.insertPos;
		this.dateFormat = options.dateFormat;
		this.insertAsLink = options.insertAsLink;
		this.onClose = options.onClose;
		this.currentMonth = window.moment().startOf("month");
	}

	open(): void {
		const cursorCoords = this.editor.coordsAtPos(this.insertPos);
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
			dayEl.onclick = () => {
				const formatted = date.format(this.dateFormat);
				const insertValue = this.insertAsLink ? `[[${formatted}]]` : formatted;
				this.editor.replaceRange(insertValue, this.insertPos, this.insertPos);
				this.destroy();
			};
		}

		// Next month padding
		const remainingCells = 42 - (daysFromPrevMonth + endOfMonth.date());
		for (let day = 1; day <= remainingCells; day++) {
			grid.createDiv({ cls: `${$("day")} is-padding-day`, text: String(day) });
		}
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

		// Escape key
		const keyHandler = (evt: KeyboardEvent) => {
			if (evt.key === "Escape") {
				this.destroy();
			}
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
