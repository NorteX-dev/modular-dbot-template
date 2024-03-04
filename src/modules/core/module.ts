import { ModuleMetadata } from "nhandler/framework";
import SettingsCommand from "./commands/settings/settings";
import SettingsEntity from "./entities";

export const metadata: ModuleMetadata = {
	enabled: true,
	id: "core",

	commands: [new SettingsCommand()],
	events: [],
	components: [],
	entities: [SettingsEntity],

	actions: {
		getSettings: (guildId: string) => {
			return SettingsEntity.findOne({ where: { guildId: guildId } });
		},
		createSettings: (guildId: string) => {
			return SettingsEntity.create({ guildId: guildId }).save();
		},
	},
};

export const init = () => {};
