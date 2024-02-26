import { exec } from "child_process";
import { Command } from "commander";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const program = new Command();

program
	.name("nbot")
	.description(
		"The NBot command line utility for generating projects and adding modules."
	)
	.version("0.1.0");

program
	.command("new")
	.description("create a new project")
	.argument("<project_name>", "The name of the project.")
	.option("--use-npm <template>", "Force use of npm to create project.")
	.action((str, opts) => {
		const fullPath = path.join(__dirname, str);
		console.log("Creating a new project inside:", fullPath);
		const cmds = [
			`cd "${path.dirname(fullPath)}"`,
			`git clone https://github.com/NorteX-dev/modular-dbot-template.git`,
		];
		exec(cmds.join(" && "), (err, stdout, stderr) => {
			if (err) {
				console.error(err);
				return;
			}
			const packageJson = readFileSync(
				path.join(fullPath, "package.json"),
				"utf-8"
			);
			const parsed = JSON.parse(packageJson);
			parsed.name = str;
			const stringified = JSON.stringify(parsed, null, 2);
			writeFileSync(path.join(fullPath, "package.json"), stringified);
		});
	});

program.parse();
