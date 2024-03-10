import { EmbedBuilder } from "discord.js";

let config: any = {};

const baseEmbed = (content?: string) => {
	let embed = new EmbedBuilder().setTimestamp();
	if (content) embed.setDescription(content).setColor(config.embeds.colors.normal);
	// if (config.embeds.footer) embed.setFooter({ text: config.embeds.footer });
	return embed;
};

export const infoEmbed = (content?: string) => {
	return baseEmbed(content); //.setColor(config.embeds.colors.normal);
};

export const errorEmbed = (content?: string) => {
	return baseEmbed(content); //.setColor(config.embeds.colors.error);
};

export const warnEmbed = (content?: string) => {
	return baseEmbed(content); //.setColor(0xbe7a22);
};

export const successEmbed = (content?: string) => {
	return baseEmbed(content); //.setColor(config.embeds.colors.success);
};
