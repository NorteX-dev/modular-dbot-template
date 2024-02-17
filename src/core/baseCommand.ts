import { ChatInputCommandInteraction, Client } from "discord.js";
import { Command, CommandError } from "nhandler";
import { errorEmbed } from "./embeds";

export abstract class BaseCommand implements Command {
	client!: Client;
	abstract name: string;
	abstract description: string;

	async error(interaction: ChatInputCommandInteraction, error: CommandError): Promise<void> {
		interaction.reply({ embeds: [errorEmbed(error.message)], ephemeral: true });
		return;
	}

	abstract run(interaction: ChatInputCommandInteraction): Promise<void>;
}
