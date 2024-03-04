import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { client } from ".";
import { debugLog, getModules } from "nhandler/framework";

export const masterHono = new Hono();

const init = async (port: number) => {
	masterHono.use(logger(debugLog));
	masterHono.use(cors());

	masterHono.use(async (ctx, next) => {
		if (!client.readyAt) {
			return ctx.json({ ok: false, message: "Bot not ready" }, 503);
		}
		await next();
	});

	let registeredEndpoints = [];
	for (let module of getModules()) {
		if (module.metadata.router) {
			masterHono.route(`${module.metadata.routerPrefix || module.metadata.id}`, module.metadata.router);
			registeredEndpoints.push(module.metadata.id);
		}
	}

	debugLog(
		`[Webserver] Mounted ${registeredEndpoints.length} API routes: ${registeredEndpoints
			.map((e) => `/${e}`)
			.join(", ")}.`
	);

	masterHono.all("*", (ctx) => {
		return ctx.json({ ok: false, message: "Not found" }, 404);
	});

	serve({
		fetch: masterHono.fetch,
		port: port,
	});

	debugLog(`[Webserver] Webserver serving on http://localhost:${port}.`);
};

export { init as initWebserver };
