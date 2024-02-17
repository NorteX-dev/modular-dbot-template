import { Command, Event, Component } from "nhandler";

export type ModuleMetadata = {
	enabled: boolean;
	id: string;
	depends?: string[];
	commands?: Command[];
	events?: Event[];
	components?: Component[];
};

export type Module = {
	metadata: ModuleMetadata;
	init: () => void;
};
