import { ChatInputCommandInteraction, Client } from "discord.js";
import { Command, CommandError } from "nhandler";
import { errorEmbed } from "../../nhandler/src/framework/embeds";
import { BaseEntity, BeforeInsert, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { nanoid } from "nanoid";

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
