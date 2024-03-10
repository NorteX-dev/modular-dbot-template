import { readdirSync } from "fs";
import path from "path";
import type { Hono } from "hono";
import type { Command, CommandHandler, Component, ComponentHandler, Event, EventHandler } from "nhandler";
import type { BaseEntity } from "typeorm";

import { debugLog, severeLog, warnLog } from ".";

export let modules: Module[] = [];

export const loadModules = async ({
	commandHandler,
	eventHandler,
	componentHandler,
	modulesPath,
}: {
	commandHandler: CommandHandler;
	eventHandler: EventHandler;
	componentHandler: ComponentHandler;
	modulesPath: string;
}): Promise<void> => {
	let rootModulesDir = modulesPath;
	let loadedModules: Module[] = [];
	let paths = readdirSync(rootModulesDir);
	paths = paths.map((p) => path.join(rootModulesDir, p));

	debugLog("Loading modules...");

	// Load modules into array
	try {
		for (let modulePath of paths) {
			const module = await import(
				path.join("file:///" + modulePath, "./module.ts").replace(new RegExp("\\\\", "gi"), "/")
			);
			if (!("metadata" in module) || !("init" in module)) {
				severeLog(
					`Skipping loading module from '${modulePath}'. Please make sure the module exports a 'metadata' and 'init' property.`,
				);
				continue;
			}

			if (!module.metadata.id) {
				severeLog(
					`Skipping loading module from '${modulePath}'. Please make sure the module exports a 'metadata.id' property.`,
				);
				continue;
			}

			if (loadedModules.find((m) => m.metadata.id === module.metadata.id)) {
				severeLog(
					`Skipping loading module from '${modulePath}'. Module with id '${module.metadata.id}' already loaded.`,
				);
				continue;
			}

			loadedModules.push(module);
		}
	} catch (err) {
		severeLog("Failed to load module.");
		severeLog(err);
		process.exit(1);
	}

	// Check dependencies
	for (let module of loadedModules) {
		if (!module.metadata.depends) continue;

		for (let dependency of module.metadata.depends) {
			if (!loadedModules.find((m) => m.metadata.id === dependency)) {
				warnLog(
					`Module '${module.metadata.id}' depends on module '${dependency}', which is not available. Disabling module.`,
				);
				module.metadata.enabled = false;
			}
		}
	}

	// Sort modules by dependencies & filter out disabled.
	loadedModules = loadedModules.sort((a, b) => {
		if (a.metadata.depends && a.metadata.depends.includes(b.metadata.id)) return 1;
		return 0;
	});
	loadedModules = loadedModules.filter((module) => module.metadata.enabled);

	for (let module of loadedModules) {
		for (let command of module.metadata.commands || []) commandHandler.register(command);
		for (let event of module.metadata.events || []) eventHandler.register(event);
		for (let component of module.metadata.components || []) componentHandler.register(component);
	}

	// Initialize
	for (let module of loadedModules) {
		await module.init();
		debugLog(`Initialized module '${module.metadata.id}'.`);
	}

	modules = loadedModules;
};

/**
 * Gets all enabled modules.
 * Disabled modules are discarded at the loading stage, so it is impossible to get disabled modules.
 */
export const getModules = () => {
	return modules;
};

/**
 * Gets a module by ID or undefined if the module does not exist.
 *
 * @param moduleId The id of the module.
 */
export const getModule = (moduleId: string): Module | undefined => {
	return modules.find((m) => m.metadata.id === moduleId);
};

/**
 * Returns a boolean defining whether the module is active (loaded & enabled) or not.
 *
 * @param moduleId The id of the module.
 */

export const moduleActive = (moduleId: string): boolean => {
	const module = getModule(moduleId);
	return module?.metadata.enabled ?? false;
};

/**
 * Returns either the function signature of undefined (if the module is non-existent/disabled).
 * Before using getAciton it is recommended to check if the module is active using moduleEnabled().
 *
 * @param moduleId The id of the module.
 * @param actionId The name of the action (as defined in the object key).
 * */
export const getAction = (moduleId: string, actionId: string) => {
	const module = getModule(moduleId);
	return module?.metadata.actions?.[actionId];
};

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
