import { ChatInputCommandInteraction } from "discord.js";
import { BaseCommand } from "../../core/baseCommand";

export class CreateCommand extends BaseCommand {
	name = "create2";
	description = "Create a ticket";
	options = [];

	async run(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply("Create command");
	}
}
