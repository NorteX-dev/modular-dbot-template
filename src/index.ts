import "reflect-metadata";
import { config as env } from "dotenv";
import { Client, IntentsBitField } from "discord.js";
import { debugLog, infoLog, severeLog, welcome, writeLogToFile } from "./lib/logger";
import { createCommands, createComponents, createEvents } from "nhandler";
import { Module, loadModules } from "./lib/modules";
import { Config } from "./configShape";
import { initWebserver } from "./webserver";
import { loadConfig } from "./lib/util";
import { BaseEntity, DataSource } from "typeorm";
import { InteractionCreateEvent, ReadyEvent } from "./lib/eventHandlers";

env();

export let client = new Client({
	intents: [IntentsBitField.Flags.GuildMembers],
});
export let commandHandler = createCommands({ client });
export let eventHandler = createEvents({ client });
export let componentHandler = createComponents({ client });
export let dataSource: DataSource;
export let modules: Module[] = [];
export let config: Config;

commandHandler.on("debug", debugLog);
eventHandler.on("debug", debugLog);
componentHandler.on("debug", debugLog);

export const init = async () => {
	try {
		writeLogToFile(`\n--- Log start at ${new Date().toISOString()} ---\n`);
		welcome();
		eventHandler.register(new ReadyEvent()).register(new InteractionCreateEvent());
		modules = await loadModules();
		config = await loadConfig();
		if (config.webserver.enabled) initWebserver(config.webserver.port);

		let entities: BaseEntity[] = [];
		for (let module of modules) {
			if (module.metadata.entities) {
				entities = entities.concat(module.metadata.entities);
			}
		}

		dataSource = new DataSource({
			type: config.database.type,
			host: config.database.host,
			port: config.database.port,
			username: config.database.username || process.env.DB_USER,
			password: config.database.password || process.env.DB_PASSWORD,
			database: config.database.database,
			synchronize: true,
			logging: true,
			entities: entities as any[],
		});
		await dataSource.initialize();
		await client.login(config.token || process.env.DISCORD_BOT_TOKEN);
	} catch (err) {
		severeLog("Failed to initialize bot. Error:");
		severeLog(err);
		severeLog("When contacting support, make sure to send them a screenshot of this error in full.");
		process.exit(1);
	}
};

process.on("unhandledRejection", (err) => {
	severeLog("Unhandled rejection:", err);
	severeLog("When contacting support, make sure to send them a screenshot of this error in full.");
});

process.on("uncaughtException", (err) => {
	severeLog("Uncaught exception:", err);
	severeLog("When contacting support, make sure to send them a screenshot of this error in full.");
});

init();
