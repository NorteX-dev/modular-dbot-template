import yaml from "js-yaml";
import path from "path";
import { readFileSync, writeFileSync } from "fs";
import { debugLog, severeLog } from "./logger";
import { Module } from "./modules";
import { ZodSchema, z } from "zod";
import { logZodError } from "@nortex/pretty-zod-error";

const coreSchema = {
	token: z.string(),
};

const zodCoreSchema = z.object(coreSchema);

export type Config = any;

export const loadConfig = async (modules: Module[]): Promise<Config> => {
	let yamlFile: any;
	try {
		yamlFile = yaml.load(readFileSync(path.join(__dirname, "../..", "./config.yml"), "utf-8"));
	} catch (err) {
		severeLog("Fatal: config.yml is not a valid YAML file.");
		process.exit(1);
	}

	let schemaObj: Record<string, ZodSchema> = {
		...coreSchema,
	};
	for (let module of modules) {
		if (!module.metadata.config) continue;
		schemaObj[module.metadata.id] = module.metadata.config;
		debugLog(`Loaded config schema for module ${module.metadata.id}`);
	}
	let schema = z.object(schemaObj);

	let result = schema.safeParse(yamlFile);
	if (!result.success) {
		severeLog("Fatal: Failed to parse configuration file. Errors:");
		severeLog(logZodError(result.error));
		process.exit(1);
	}

	let config = result.data;
	return config;
};
