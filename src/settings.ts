export interface DateSuggestSettings {
	dateFormat: string;
	triggerPhrase: string;
	insertAsLink: boolean;
}

export const DEFAULT_SETTINGS: DateSuggestSettings = {
	dateFormat: "DD-MM-YYYY",
	triggerPhrase: "@",
	insertAsLink: false,
};
