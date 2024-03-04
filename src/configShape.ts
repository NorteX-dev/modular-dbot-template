import { z } from "zod";

export let configShape = z.object({
	token: z.string().optional(),
	database: z.object({
		url: z.string(),
		logging: z.boolean().default(false),
		synchronize: z.boolean().default(false),
	}),
	webserver: z.object({
		enabled: z.boolean().default(true),
		port: z.number().min(1).max(65535),
	}),
});

export type Config = z.infer<typeof configShape>;
