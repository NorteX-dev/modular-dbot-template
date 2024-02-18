import { readFileSync } from "fs";
import { Client, IntentsBitField } from "discord.js";
import { debugLog, infoLog, severeLog, welcome } from "./logger";
import { createCommands, createComponents, createEvents } from "nhandler";
import path from "path";
import yaml from "js-yaml";
import { Module } from "./types";

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

export const init = async () => {
	try {
		welcome();
		await client.login(process.env.DISCORD_BOT_TOKEN);
		loadModules();
		infoLog(`Logged in as ${client.user?.username}!`);
	} catch (err) {
		severeLog(err);
		process.exit(1);
	}
};

const loadModules = async () => {
	let paths = [];
	debugLog("Loading modules...");
	// Parse module paths yaml
	try {
		const yamlFile: any = yaml.load(readFileSync(path.join(__dirname, "..", "./modules.yml"), "utf-8"));
		paths = yamlFile.modules;
	} catch (err) {
		severeLog("Fatal: modules.yml is not a valid YAML file.");
		process.exit(1);
	}

	// Load modules into array
	try {
		for (let modulePath of paths) {
			const module = await import("file://" + path.join(__dirname, "..", modulePath, "./module.ts"));
			if (!("metadata" in module) || !("init" in module)) {
				severeLog(
					`Skipping loading module from '${modulePath}'. Please make sure the module exports a 'metadata' and 'init' property.`
				);
				continue;
			}

			if (!module.metadata.id) {
				severeLog(
					`Skipping loading module from '${modulePath}'. Please make sure the module exports a 'metadata.id' property.`
				);
				continue;
			}

			if (modules.find((m) => m.metadata.id === module.metadata.id)) {
				severeLog(
					`Skipping loading module from '${modulePath}'. Module with id '${module.metadata.id}' already loaded.`
				);
				continue;
			}

			modules.push(module);
		}
	} catch (err) {
		severeLog("Failed to load module. Please check the module's path in modules.yml.");
		severeLog(err);
		process.exit(1);
	}

	// Check dependencies
	for (let module of modules) {
		if (!module.metadata.depends) continue;

		for (let dependency of module.metadata.depends) {
			if (!modules.find((m) => m.metadata.id === dependency)) {
				debugLog(
					`Module '${module.metadata.id}' depends on module '${dependency}', which is not loaded. Disabling module.`
				);
				module.metadata.enabled = false;
			}
		}
	}

	// Sort modules by dependencies & filter out disabled.
	modules = modules.sort((a, b) => {
		if (a.metadata.depends && a.metadata.depends.includes(b.metadata.id)) return 1;
		return 0;
	});
	modules = modules.filter((module) => module.metadata.enabled);

	for (let module of modules) {
		for (let command of module.metadata.commands || []) commandHandler.register(command);
		for (let event of module.metadata.events || []) eventHandler.register(event);
		for (let component of module.metadata.components || []) componentHandler.register(component);
	}

	// Initialize
	for (let module of modules) {
		await module.init();
		debugLog(`Initialized module '${module.metadata.id}'.`);
	}
};
