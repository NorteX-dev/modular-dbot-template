import { Client, IntentsBitField } from "discord.js";
import { debugLog, infoLog, severeLog, welcome } from "./logger";
import { createCommands, createComponents, createEvents } from "nhandler";
import { Module, loadModules } from "./modules";
import { Config, loadConfig } from "./config";

export let client = new Client({
	intents: [IntentsBitField.Flags.GuildMembers],
});
let loadedModules: Module[] = [];

export let commandHandler = createCommands({ client });
commandHandler.on("debug", (...m) => debugLog(...m));
export let eventHandler = createEvents({ client });
eventHandler.on("debug", (...m) => debugLog(...m));
export let componentHandler = createComponents({ client });
componentHandler.on("debug", (...m) => debugLog(...m));

export const init = async () => {
	try {
		welcome();
		loadedModules = await loadModules();
		const config: Config = await loadConfig(loadedModules);
		await client.login();
		infoLog(`Logged in as ${client.user?.username}!`);
	} catch (err) {
		severeLog(err);
		process.exit(1);
	}
};
