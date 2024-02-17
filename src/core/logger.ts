import chalk from "chalk";
import { readFileSync, existsSync } from "fs";
import path from "path";

export const welcome = () => {
	if (!existsSync(path.join(__dirname, "../../package.json"))) {
		severeLog("Fatal: package.json not found. Please make sure you are in the root directory of the project.");
		process.exit(1);
	}
	const version = JSON.parse(readFileSync(path.join(__dirname, "../../package.json"), "utf-8")).version;
	console.log(chalk.green(`┌ NLicensing • v${version}`));
};

export const debugLog = (...messages: any[]) => {
	console.log(chalk.gray("└ Debug"), ...messages);
};

export const infoLog = (...messages: any[]) => {
	console.log(chalk.yellow("└ Info"), ...messages);
};

export const severeLog = (...messages: any[]) => {
	console.log(chalk.red("└ Severe"), ...messages);
};
