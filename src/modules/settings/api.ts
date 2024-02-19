import { Hono } from "hono";

const app = new Hono();

app.get("/", (ctx) => {
	return ctx.json({
		ok: true,
		message: "Welcome to the settings module!",
	});
});

export { app as settingsRouter };
