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
	entities: [new SettingsEntity()],
	router: settingsRouter,
};

export const init = () => {};
