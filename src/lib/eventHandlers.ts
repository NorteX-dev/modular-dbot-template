import { Client, Interaction } from "discord.js";
import { commandHandler, componentHandler } from "..";
import { Event, isAutocompleteInteraction, isCommandInteraction, isComponentInteraction } from "nhandler";
import { infoLog } from "./logger";

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
		if (isCommandInteraction(interaction)) {
			commandHandler.runCommand(interaction);
		} else if (isAutocompleteInteraction(interaction)) {
			commandHandler.runAutocomplete(interaction);
		} else if (isComponentInteraction(interaction)) {
			componentHandler.runComponent(interaction);
		}
	}
}
