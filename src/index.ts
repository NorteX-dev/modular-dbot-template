import { Client, GatewayIntentBits } from "discord.js";
import { createCommands, createComponents, createEvents } from "nhandler";
import { debugLog, severeLog, welcomeLog, writeLogToFile, loadModules, modules, loadConfig } from "nhandler/framework";
import { InteractionCreateEvent, ReadyEvent } from "./eventHandlers";
import { Config, configShape } from "./configShape";
import { initWebserver } from "./webserver";
import { BaseEntity, DataSource } from "typeorm";
import { config as env } from "dotenv";
import { readPackageJson } from "./util";
import path from "path";

env();

export let client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildPresences,
		GatewayIntentBits.MessageContent,
	],
});
export let commandHandler = createCommands({ client });
export let eventHandler = createEvents({ client });
export let componentHandler = createComponents({ client });
export let dataSource: DataSource;
export let config: Config;

commandHandler.on("debug", debugLog);
eventHandler.on("debug", debugLog);
componentHandler.on("debug", debugLog);

export const createApp = async () => {
	try {
		writeLogToFile(`\n--- Log start at ${new Date().toISOString()} ---\n`);
		const { name, pretty_name, version } = readPackageJson();
		welcomeLog(pretty_name || name || "Unknown", version || "Unknown");
		eventHandler.register(new ReadyEvent()).register(new InteractionCreateEvent());
		await loadModules({ modulesPath: path.join(__dirname, "modules"), commandHandler, eventHandler, componentHandler });

		config = await loadConfig<Config>(configShape, path.join(__dirname, "../config.yml"));
		if (config.webserver.enabled) initWebserver(config.webserver.port);

		let entities: (typeof BaseEntity)[] = modules.map((module) => module.metadata.entities || []).flat();

		await createDb(entities);
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

const createDb = async (entities: (typeof BaseEntity)[]) => {
	const dbUrl = new URL(config.database.url);

	const sqlProtocol = dbUrl.protocol.replace(":", "");

	const commonOptions = {
		synchronize: config.database.synchronize,
		logging: config.database.logging,
		entities: entities,
	};

	if (!["mysql", "postgres"].includes(sqlProtocol)) {
		dataSource = new DataSource({
			type: sqlProtocol as "mysql" | "postgres",
			host: dbUrl.hostname,
			port: parseInt(dbUrl.port),
			username: dbUrl.username,
			password: dbUrl.password,
			database: dbUrl.pathname.slice(1),
			...commonOptions,
		});
	} else if (sqlProtocol === "sqlite") {
		dataSource = new DataSource({
			type: "sqlite",
			database: dbUrl.hostname,
			...commonOptions,
		});
	} else {
		severeLog("Invalid database protocol. The only allowed protocols are 'mysql', 'postgres', and 'sqlite'.");
		process.exit(1);
	}

	await dataSource.initialize();
};

createApp();
