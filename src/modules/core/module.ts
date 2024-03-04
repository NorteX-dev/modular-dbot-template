import { ModuleMetadata } from "nhandler/framework";
import { coreRouter } from "./api";
import SettingsCommand from "./commands/settings";
import SettingsEntity from "./entities";

export const metadata: ModuleMetadata = {
	enabled: true,
	id: "core",
	commands: [new SettingsCommand()],
	events: [],
	components: [],
	entities: [SettingsEntity],
	router: coreRouter,
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
