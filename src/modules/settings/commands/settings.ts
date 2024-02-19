import { ChatInputCommandInteraction } from "discord.js";
import { BaseCommand } from "../../../lib/baseCommand";

export class SettingsCommand extends BaseCommand {
	name = "settings";
	description = "Manage guild settings.";
	options = [];

	async run(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply("Create command");
	}
}
