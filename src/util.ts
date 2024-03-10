import { existsSync, readFileSync } from "fs";
import path from "path";
import { errorEmbed, severeLog } from "@lib/index";
import { ChatInputCommandInteraction, Client } from "discord.js";
import { nanoid } from "nanoid";
import { Command, CommandError } from "nhandler";
import { BaseEntity, BeforeInsert, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";

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
	const packagePath = path.join(__dirname, "../package.json");
	if (!existsSync(packagePath)) {
		severeLog("Fatal: package.json not found. Please make sure you are in the root directory of the project.");
		process.exit(1);
	}
	const pckg: Package = JSON.parse(readFileSync(packagePath, "utf-8"));
	return pckg;
};

export abstract class BaseCommand implements Command {
	client!: Client;
	abstract name: string;
	abstract description: string;

	async error(interaction: ChatInputCommandInteraction, error: CommandError): Promise<void> {
		interaction.reply({ embeds: [errorEmbed(error.message)], ephemeral: true });
		return;
	}

	abstract run(interaction: ChatInputCommandInteraction, ...args: any[]): Promise<void>;
}

export abstract class WithIdAndTimestamps extends BaseEntity {
	@PrimaryColumn({ type: "varchar", length: 12 })
	id!: string;

	@BeforeInsert()
	assignId() {
		this.id = nanoid(12);
	}

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;
}
