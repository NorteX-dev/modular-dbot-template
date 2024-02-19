import chalk from "chalk";
import { readPackageJson } from "./util";
import path from "path";
import { inspect } from "util";
import { existsSync, writeFile, writeFileSync } from "fs";

export const welcome = () => {
	const { pretty_name, version } = readPackageJson();
	console.log(chalk.green(`┌ ${pretty_name} • v${version}`));
};

export const debugLog = (...messages: any[]) => {
	console.log(chalk.gray("└ Debug"), ...messages);
	writeLogToFile("[Debug]", ...messages);
};

export const infoLog = (...messages: any[]) => {
	console.log(chalk.yellow("└ Info"), ...messages);
	writeLogToFile("[Info]", ...messages);
};

export const severeLog = (...messages: any[]) => {
	console.log(chalk.red("└ Severe"), ...messages);
	writeLogToFile("[Severe]", ...messages);
};

export const warnLog = (...messages: any[]) => {
	console.log(chalk.yellow("└ Warn"), ...messages);
	writeLogToFile("[Warn]", ...messages);
};

export const writeLogToFile = (...messages: any[]) => {
	const filePath = path.join(__dirname, "../../log.txt");
	const log = messages.map((m) => (typeof m === "string" ? m : inspect(m))).join(" ") + "\n";
	if (!existsSync(filePath)) writeFileSync(filePath, log);
	writeFile(filePath, log, { flag: "a" }, (err) => {
		if (err) severeLog("Failed to write log to file.");
	});
};
