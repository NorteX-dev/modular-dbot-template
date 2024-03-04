import { Guild } from "discord.js";
import { CHANNEL } from "./validators";

/**
 * This is the place to edit the available settings. They will then be available to get & set via /settings.
 * The keys listed in this array correspond to the keys seen in the Settings entity.
 * @see entities.ts Settings
 * Settings require a validator, transformator and formatter.
 * The validator is the method used to validate whether user-input is valid. Returns string (error) or null (valid).
 * The transformator is the method used to transform user-input into a format that can be stored in the database. Reverse of formatter. Returns string or undefined (for not found).
 * The formatter is the method used to format the stored value back into a human-readable format. Reverse of transformator. Returns string or undefined (for not found).
 */

type Setting = {
	key: string;
	name: string;
	description: string;
	validator: (opts: { value: string; guild: Guild }) => string | null;
	transform: (opts: { value: string; guild: Guild }) => string | undefined;
	formatter: (opts: { value: string; guild: Guild }) => string | undefined;
};

export const settingsData: Setting[] = [
	{
		key: "exampleSetting",
		name: "Example",
		description: "hi",
		...CHANNEL,
	},
];
