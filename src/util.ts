import { existsSync, readFileSync } from "fs";
import path from "path";
import { severeLog } from "nhandler/framework";

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
