import { z } from "zod";

export let configSchema = z.object({
	token: z.string().optional(),
	database: z.object({
		type: z.enum(["postgres", "mysql", "sqlite", "mariadb"]),
		host: z.string(),
		port: z.number().min(1).max(65535),
		username: z.string(),
		password: z.string(),
		database: z.string(),
		synchronize: z.boolean(),
	}),
	webserver: z.object({
		enabled: z.boolean().default(true),
		port: z.number().min(1).max(65535),
	}),
});

export type Config = z.infer<typeof configSchema>;
