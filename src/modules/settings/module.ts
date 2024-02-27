import { ModuleMetadata } from "../../lib/modules";
import { settingsRouter } from "./api";
import SettingsCommand from "./commands/settings";
import SettingsEntity from "./entities";

export const metadata: ModuleMetadata = {
	enabled: true,
	id: "settings",
	commands: [new SettingsCommand()],
	events: [],
	components: [],
	entities: [SettingsEntity],
	router: settingsRouter,
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
