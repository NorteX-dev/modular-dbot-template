import yaml from "js-yaml";
import path from "path";
import { readFileSync } from "fs";
import { debugLog, infoLog, severeLog } from "./logger";
import { Module } from "./modules";
import { ZodSchema, z } from "zod";
import { logZodError } from "@nortex/pretty-zod-error";

export const loadConfig = async (modules: Module[]) => {
	try {
		const yamlFile: any = yaml.load(readFileSync(path.join(__dirname, "../..", "./config.yml"), "utf-8"));
		// const validated = configSchema.safeParse(yamlFile);
		let schemaObj: Record<string, ZodSchema> = {};
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
	} catch (err) {
		severeLog("Fatal: config.yml is not a valid YAML file.");
		process.exit(1);
	}
};
