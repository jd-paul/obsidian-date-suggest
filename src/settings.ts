export interface DateSuggestSettings {
	dateFormat: string;
	triggerPhrase: string;
	insertAsLink: boolean;
	firstDayOfWeek: "locale" | "sunday" | "monday";
	enableTime: boolean;
	timeFormat: string;
	keepAlias: boolean;
	enableNaturalLanguage: boolean;
}

export const DEFAULT_SETTINGS: DateSuggestSettings = {
	dateFormat: "DD-MM-YYYY",
	triggerPhrase: "@",
	insertAsLink: false,
	firstDayOfWeek: "locale",
	enableTime: false,
	timeFormat: "HH:mm",
	keepAlias: false,
	enableNaturalLanguage: false,
};
