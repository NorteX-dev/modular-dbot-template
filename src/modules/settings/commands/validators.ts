import { CategoryChannel, ChannelType, Collection, Guild, GuildBasedChannel, Role, TextChannel } from "discord.js";

function getChannel({ value, guild }: { value: string; guild: Guild }): TextChannel | undefined {
	const textChannels = guild.channels.cache.filter((r: GuildBasedChannel) => r.type === ChannelType.GuildText) as Collection<string, TextChannel>;
	return (
		textChannels.find((r: GuildBasedChannel) => r.toString() === value) ||
		textChannels.find((r: GuildBasedChannel) => r.name.toLowerCase() === value.toLowerCase()) ||
		textChannels.find((r: GuildBasedChannel) => r.id === value)
	);
}

function getRole({ value, guild }: { value: string; guild: Guild }): Role | undefined {
	return (
		guild.roles.cache.find((role: Role) => role.toString() === value) ||
		guild.roles.cache.find((role: Role) => role.name.toLowerCase() === value.toLowerCase()) ||
		guild.roles.cache.find((role: Role) => role.id === value)
	);
}

function getCategory({ value, guild }: { value: string; guild: Guild }): CategoryChannel | undefined {
	const categoryChannels = guild.channels.cache.filter((r: GuildBasedChannel) => r.type === ChannelType.GuildCategory) as Collection<
		string,
		CategoryChannel
	>;
	return (
		categoryChannels.find((cat: GuildBasedChannel) => cat.toString() === value) ||
		categoryChannels.find((cat: GuildBasedChannel) => cat.name.toLowerCase() === value.toLowerCase()) ||
		categoryChannels.find((cat: GuildBasedChannel) => cat.id === value)
	);
}

// Channels
const CHANNEL_VALIDATOR = ({ value, guild }: { value: string; guild: Guild }) => {
	const channel = getChannel({ value, guild });
	if (!channel) return "Please provide a valid channel.";
	return null;
};
const CHANNEL_TRANSFORM = ({ value, guild }: { value: string; guild: Guild }) => {
	const channel = getChannel({ value, guild });
	return channel?.id;
};
const CHANNEL_FORMATTER = ({ value, guild }: { value: string; guild: Guild }) => {
	return getChannel({ value, guild }) ?? "Not set";
};

// Role
const ROLE_VALIDATOR = ({ value, guild }: { value: string; guild: Guild }) => {
	const role = getRole({ value, guild });
	if (!role) return "Please provide a valid role.";
	return null;
};
const ROLE_TRANSFORM = ({ value, guild }: { value: string; guild: Guild }) => {
	const role = getRole({ value, guild });
	return role?.id;
};
const ROLE_FORMATTER = ({ value, guild }: { value: string; guild: Guild }) => {
	return getRole({ value, guild });
};

// Categories
const CATEGORY_VALIDATOR = ({ value, guild }: { value: string; guild: Guild }) => {
	const category = getCategory({ value, guild });
	if (!category) return "Please provide a valid category.";
	return null;
};
const CATEGORY_TRANSFORM = ({ value, guild }: { value: string; guild: Guild }) => {
	const category = getCategory({ value, guild });
	return category?.id;
};
const CATEGORY_FORMATTER = ({ value, guild }: { value: string; guild: Guild }) => {
	const category = getCategory({ value, guild });
	return category?.name ?? "Not set";
};

export const CHANNEL = {
	validator: CHANNEL_VALIDATOR,
	transform: CHANNEL_TRANSFORM,
	formatter: CHANNEL_FORMATTER,
};

export const ROLE = {
	validator: ROLE_VALIDATOR,
	transform: ROLE_TRANSFORM,
	formatter: ROLE_FORMATTER,
};
export const CATEGORY = {
	validator: CATEGORY_VALIDATOR,
	transform: CATEGORY_TRANSFORM,
	formatter: CATEGORY_FORMATTER,
};
