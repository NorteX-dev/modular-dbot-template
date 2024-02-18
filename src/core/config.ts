import yaml from "js-yaml";
import path from "path";
import { readFileSync } from "fs";
import { severeLog } from "./logger";
import { z } from "zod";
import { logZodError } from "@nortex/pretty-zod-error";

let schema = z.object({
	token: z.string().optional(),
});
export type Config = z.infer<typeof schema>;

export const loadConfig = async (): Promise<Config> => {
	let yamlFile: any;
	try {
		yamlFile = yaml.load(readFileSync(path.join(__dirname, "../..", "./config.yml"), "utf-8"));
	} catch (err) {
		severeLog("Fatal: config.yml is not a valid YAML file.");
		process.exit(1);
	}

	let result = schema.safeParse(yamlFile);
	if (!result.success) {
		severeLog("Fatal: Failed to parse configuration file. Errors:");
		severeLog(logZodError(result.error));
		process.exit(1);
	}

	let config = result.data;
	return config;
};
