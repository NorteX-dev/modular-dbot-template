import { debugLog, getAction, infoLog, moduleActive } from "$lib";
import { Client, Interaction } from "discord.js";
import { Event, isAutocompleteInteraction, isCommandInteraction, isComponentInteraction } from "nhandler";

import { commandHandler, componentHandler } from ".";

export class ReadyEvent implements Event {
	client!: Client;
	name = "ready";

	async run() {
		commandHandler.updateApplicationCommands();
		infoLog(`Logged in as ${this.client.user?.username}!`);
	}
}

export class InteractionCreateEvent implements Event {
	client!: Client;
	name = "interactionCreate";

	async run(interaction: Interaction) {
		let settings = null;
		if (moduleActive("core")) {
			const getSettings = getAction("settings", "getSettings")!;
			const createSettings = getAction("settings", "createSettings")!;
			debugLog(`Fetching settings for guild ${interaction.guildId}.`);
			settings = await getSettings(interaction.guildId);
			if (!settings) settings = await createSettings(interaction.guildId);
		}

		if (isCommandInteraction(interaction)) {
			commandHandler.runCommand(interaction, { settings });
		} else if (isAutocompleteInteraction(interaction)) {
			commandHandler.runAutocomplete(interaction, { settings });
		} else if (isComponentInteraction(interaction)) {
			componentHandler.runComponent(interaction, { settings });
		}
	}
}
