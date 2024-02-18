import { ModuleMetadata } from "../core/modules";
import { CreateCommand } from "./commands/create";
import { z } from "zod";

export const metadata: ModuleMetadata = {
	enabled: true,
	id: "ticketing",
	commands: [new CreateCommand()],
	events: [],
	components: [],
	config: z.object({
		active: z.boolean(),
	}),
};

export const init = () => {};
