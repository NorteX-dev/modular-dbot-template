import { readFileSync } from "fs";
import { prettifyZodError } from "@nortex/pretty-zod-error";
import { severeLog } from "$lib";
import yaml from "js-yaml";
import type { ZodObject } from "zod";

export const loadConfig = async <T>(configShape: ZodObject<any>, path: string): Promise<T> => {
	let yamlFile: any;
	try {
		yamlFile = yaml.load(readFileSync(path, "utf-8"));
	} catch (err) {
		severeLog("Fatal: config.yml is not a valid YAML file.");
		process.exit(1);
	}

	let result = configShape.safeParse(yamlFile);
	if (!result.success) {
		severeLog("Fatal: Failed to parse configuration file. Errors:");
		severeLog(prettifyZodError(result.error));
		process.exit(1);
	}

	let config = result.data;
	return <T>config;
};
