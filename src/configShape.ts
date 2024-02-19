import { z } from "zod";

export let configSchema = z.object({
	token: z.string().optional(),
	webserver: z.object({
		port: z.number().min(1).max(65535),
	}),
});

export type Config = z.infer<typeof configSchema>;
