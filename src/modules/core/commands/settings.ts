import { ApplicationCommandOptionType, ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import { CommandError } from "nhandler";

import { settingsData } from "./lib";
import Settings from "../entities";
import { BaseCommand } from "../../../abstract";
import { infoEmbed, successEmbed } from "nhandler/framework";

export default class SettingsCommand extends BaseCommand {
	name = "settings";
	description = "View or change settings.";
	metadata = {
		category: "Configuration",
	};
	options = [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "set",
			description: "Update a certain settings value.",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The setting to update.",
					required: true,
					choices: settingsData.map((s) => ({
						name: s.name,
						value: s.key,
						description: s.description,
					})),
				},
				{
					type: ApplicationCommandOptionType.String,
					name: "value",
					description:
						"The new value for the setting. For users, channels and roles, either a mention, name or ID is fine.",
					required: true,
				},
			],
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: "view",
			description: "View either all settings or a specific one.",
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: "name",
					description: "The setting to look up.",
					required: false,
					choices: settingsData.map((s) => ({
						name: s.name,
						value: s.key,
						description: s.description,
					})),
				},
			],
		},
	];
	defaultMemberPermissions = PermissionsBitField.Flags.ManageGuild;

	async run(interaction: ChatInputCommandInteraction, { settings }: { settings: Settings }): Promise<void> {
		const sub = interaction.options.getSubcommand();
		if (sub === "set") await this.runSet(interaction, { settings });
		if (sub === "view") await this.runView(interaction, { settings });
	}

	async runSet(interaction: ChatInputCommandInteraction, { settings }: { settings: any }): Promise<void> {
		const name = interaction.options.getString("name", true);
		const value = interaction.options.getString("value", true);
		const data = settingsData.find((s) => s.key === name);
		if (!data) {
			throw new CommandError(`No setting with the name \`${name}\` exists.`);
		}
		const error = data.validator({ value: value, guild: interaction.guild! });
		if (error) {
			throw new CommandError(error);
		}
		const newValue = data.transform({
			value: value,
			guild: interaction.guild!,
		});
		if (!newValue) {
			throw new CommandError("Invalid value.");
		}
		if (newValue === settings[name]) {
			throw new CommandError("The value is already set to that.");
		}
		await interaction.deferReply({ ephemeral: true });
		settings[name] = newValue;
		await settings.save();
		const setting = settingsData.find((s) => s.key === name)?.name || name;
		interaction.editReply({
			embeds: [
				successEmbed(
					`Successfully set \`${setting}\` to ${data.formatter({
						value: newValue,
						guild: interaction.guild!,
					})}.`
				),
			],
		});
	}

	async runView(interaction: ChatInputCommandInteraction, { settings }: { settings: any }): Promise<void> {
		const name = interaction.options.getString("name");
		if (!name) {
			const cleanSettings = settings;

			delete cleanSettings.id;
			delete cleanSettings.guildId;
			delete cleanSettings.createdAt;
			delete cleanSettings.updatedAt;

			// Display all settings
			const embed = infoEmbed()
				.setTitle("Settings")
				.setDescription(`Current settings for *\`${interaction.guild!.name}\`*:`);
			Object.keys(cleanSettings).forEach((key) => {
				const name = settingsData.find((s) => s.key === key)?.name || key;
				if (cleanSettings[key] === null) {
					return embed.addFields([{ name: name, value: "Not set", inline: true }]);
				}
				const formattedValue =
					settingsData
						.find((r) => r.key === key)
						?.formatter({
							value: cleanSettings[key],
							guild: interaction.guild!,
						}) || "Not set";
				embed.addFields({ name: name, value: formattedValue, inline: true });
			});
			interaction.reply({ embeds: [embed], ephemeral: true });
		} else {
			// Display single
			const data = settingsData.find((s) => s.key === name);
			if (!data) {
				throw new CommandError(`No setting with the name \`${name}\` exists.`);
			}

			const formatter = data.formatter({ value: settings[data.key], guild: interaction.guild! }) || "Invalid";
			const embed = infoEmbed(`\`${data.name}\` is set to ${formatter}.`);
			interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});
		}
	}
}
