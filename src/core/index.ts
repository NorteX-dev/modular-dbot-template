import { Client, IntentsBitField } from "discord.js";
import { debugLog, infoLog, severeLog, welcome } from "./logger";
import { createCommands, createComponents, createEvents } from "nhandler";
import { Module, loadModules } from "./modules";
import { Config, loadConfig } from "./config";
import { PrismaClient } from "@prisma/client";

export let client = new Client({
	intents: [IntentsBitField.Flags.GuildMembers],
});
export let commandHandler = createCommands({ client });
commandHandler.on("debug", (...m) => debugLog(...m));
export let eventHandler = createEvents({ client });
eventHandler.on("debug", (...m) => debugLog(...m));
export let componentHandler = createComponents({ client });
componentHandler.on("debug", (...m) => debugLog(...m));

export let modules: Module[] = [];
export let config: Config;
export let prisma: PrismaClient = new PrismaClient();

export const init = async () => {
	try {
		welcome();
		modules = await loadModules();
		config = await loadConfig();

		await client.login(config.token || process.env.DISCORD_BOT_TOKEN);
		infoLog(`Logged in as ${client.user?.username}!`);
	} catch (err) {
		severeLog(err);
		process.exit(1);
	}
};
