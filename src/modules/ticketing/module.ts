import { ModuleMetadata } from "../../lib/modules";
import { ticketingRouter } from "./api";

// Ticketing
export const metadata: ModuleMetadata = {
	enabled: true,
	id: "ticketing",
	commands: [],
	events: [],
	components: [],
	router: ticketingRouter,
	routerPrefix: "/tickets",
};

export const init = () => {};
