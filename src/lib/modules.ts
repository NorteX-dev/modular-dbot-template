import { readdirSync } from "fs";
import { debugLog, severeLog, warnLog } from "./logger";
import path from "path";
import { Hono } from "hono";
import { commandHandler, componentHandler, eventHandler } from "..";
import { Command, Component, Event } from "nhandler";
import { BaseEntity } from "typeorm";

export type ModuleMetadata = {
	enabled: boolean;
	id: string;
	depends?: string[];
	commands?: Command[];
	events?: Event[];
	components?: Component[];
	entities?: (typeof BaseEntity)[];
	router?: Hono;
	routerPrefix?: string;
	actions?: Record<string, Function>;
};

export type Module = {
	metadata: ModuleMetadata;
	init: () => void;
};

export const loadModules = async (): Promise<Module[]> => {
	let modules: Module[] = [];
	let rootModulesDir = path.join(__dirname, "../modules");
	let paths = readdirSync(rootModulesDir);
	paths = paths.map((p) => path.join(rootModulesDir, p));

	debugLog("Loading modules...");

	// Load modules into array
	try {
		for (let modulePath of paths) {
			const module = await import("file://" + path.join(modulePath, "./module.ts"));
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
		severeLog("Failed to load module.");
		severeLog(err);
		process.exit(1);
	}

	// Check dependencies
	for (let module of modules) {
		if (!module.metadata.depends) continue;

		for (let dependency of module.metadata.depends) {
			if (!modules.find((m) => m.metadata.id === dependency)) {
				warnLog(
					`Module '${module.metadata.id}' depends on module '${dependency}', which is not available. Disabling module.`
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

	return modules;
};
