import { Client, IntentsBitField } from "discord.js";
import { debugLog, infoLog, severeLog, welcome, writeLogToFile } from "./lib/logger";
import { createCommands, createComponents, createEvents } from "nhandler";
import { Module, loadModules } from "./lib/modules";
import { Config } from "./configShape";
import { PrismaClient } from "@prisma/client";
import { initWebserver } from "./webserver";
import { loadConfig } from "./lib/util";

export let client = new Client({
	intents: [IntentsBitField.Flags.GuildMembers],
});
export let prisma: PrismaClient = new PrismaClient();
export let commandHandler = createCommands({ client });
export let eventHandler = createEvents({ client });
export let componentHandler = createComponents({ client });
export let modules: Module[] = [];
export let config: Config;

commandHandler.on("debug", debugLog);
eventHandler.on("debug", debugLog);
componentHandler.on("debug", debugLog);

export const init = async () => {
	try {
		writeLogToFile(`\n--- Log start at ${new Date().toISOString()} ---\n`);
		welcome();
		modules = await loadModules();
		config = await loadConfig();
		initWebserver(config.webserver.port);
		await client.login(config.token || process.env.DISCORD_BOT_TOKEN);
		infoLog(`Logged in as ${client.user?.username}!`);
	} catch (err) {
		severeLog(err);
		process.exit(1);
	}
};

process.on("unhandledRejection", (reason, promise) => {
	severeLog("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
	severeLog("Uncaught Exception thrown", err);
});

init();
