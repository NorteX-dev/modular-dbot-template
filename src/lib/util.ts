import { existsSync, readFileSync } from "fs";
import path from "path";
import { severeLog } from "./logger";
import { Config, configSchema } from "../configShape";
import yaml from "js-yaml";
import { prettifyZodError } from "@nortex/pretty-zod-error";

type Package = {
	name?: string;
	pretty_name?: string;
	version?: string;
	description?: string;
	main?: string;
	scripts?: Record<string, string>;
	repository?: string;
	keywords?: string[];
	author?: string;
	license?: string;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
};

export const readPackageJson = (): Package => {
	if (!existsSync(path.join(__dirname, "../../package.json"))) {
		severeLog("Fatal: package.json not found. Please make sure you are in the root directory of the project.");
		process.exit(1);
	}
	const pckg: Package = JSON.parse(readFileSync(path.join(__dirname, "../../package.json"), "utf-8"));
	return pckg;
};

export const loadConfig = async (): Promise<Config> => {
	let yamlFile: any;
	try {
		yamlFile = yaml.load(readFileSync(path.join(__dirname, "../../config.yml"), "utf-8"));
	} catch (err) {
		severeLog("Fatal: config.yml is not a valid YAML file.");
		process.exit(1);
	}

	let result = configSchema.safeParse(yamlFile);
	if (!result.success) {
		severeLog("Fatal: Failed to parse configuration file. Errors:");
		severeLog(prettifyZodError(result.error));
		process.exit(1);
	}

	let config = result.data;
	return config;
};
