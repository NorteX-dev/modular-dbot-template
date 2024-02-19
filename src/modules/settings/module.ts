import { ModuleMetadata } from "../../lib/modules";
import { settingsRouter } from "./api";
import { SettingsCommand } from "./commands/settings";

export const metadata: ModuleMetadata = {
	enabled: true,
	id: "settings",
	commands: [new SettingsCommand()],
	events: [],
	components: [],
	router: settingsRouter,
	routerPrefix: "/settings",
};

export const init = () => {};
