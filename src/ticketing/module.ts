import { ModuleMetadata } from "../core/types";
import { CreateCommand } from "./commands/create";

export const metadata: ModuleMetadata = {
	enabled: true,
	id: "ticketing",
	commands: [new CreateCommand()],
	events: [],
	components: [],
};

export const init = () => {};
