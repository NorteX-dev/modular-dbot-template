import { Hono } from "hono";

const app = new Hono();

app.get("/", (ctx) => {
	return ctx.json({
		ok: true,
		message: "Welcome to the ticketing module!",
	});
});

export { app as ticketingRouter };
