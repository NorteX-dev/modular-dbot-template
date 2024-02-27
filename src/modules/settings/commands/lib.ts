import { Guild, TextChannel } from "discord.js";
import { CHANNEL } from "./validators";

/**
 * This is the place to edit the available settings. They will then be available to get & set via /settings.
 * The keys listed in this array correspond to the keys seen in the Settings entity.
 * @see entities.ts#Settings
 * Settings require a validator, transformator and formatter.
 * The validator is the method used to validate whether user-input is valid.
 * The transformator is the method used to transform user-input into a format that can be stored in the database. Reverse of formatter.
 * The formatter is the method used to format the stored value back into a human-readable format. Reverse of transformator.
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
		key: "commissionLog",
		name: "Commission Log Channel",
		description: "The channel where commissions are sent and are available for claim and messaging.",
		...CHANNEL,
	},
];
