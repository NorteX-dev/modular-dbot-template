# Modular Discord Bot Template

## modular-dbot-template

⭐ A fully modular Discord bot template.

It is meant to streamline creation of Discord bots in a concern-separation paradigm where you use "modules" to structure your app.

## The idea behind it

The "core" is responsible for loading and managing modules.
It does not (and should never) have any front-facing functionality, like commands, events, components, API routes, database accesses etc. Core files are located in `/lib`, `index.ts`.

`configShape.ts` and `webserver.ts` are also part of the core, but meant to be editable in the development process.

A module should be removable without causing other modules to break - except those, which depend on it.

### Exceptions

The only aspect except of this rule is database schema definition.

Since this template uses Prisma as the model definition tool and Prisma uses a single file for schema definition, concern separation in this case is impossible.
However, any database accesses, should nonetheless be streamlined to the concept-separation model.

## Concepts

### Dependency trees

A module can depend on other modules. This means a module will not be loaded if not all of its dependencies are present.

In the case of a missing dependency, the module will fail to load and will output a warning.

### Configuration

This template uses a single configuration file available to access from any module. It is stored in YAML and uses a strict validation schema.

Modules have access to the whole config. However, semantically, should only access properties nested in the object named by the module id.

For example, a `ticketing` module should only ever access `config.ticketing.*`.

## The stack

This template utilises:

- `esmodule` - runs on ES Modules (nodenext); this means that Node v18 is required and module-compatible packages are required
- `typescript` - provides type safety and better quality code
- [`discordjs`](https://github.com/discordjs/discord.js) - library for connecting to Discord
- [`nhandler`](https://github.com/nortex-dev/nhandler) - handler for loading, updating and managing commands, events and component callbacks.
- [`prisma`](https://github.com/prisma/prisma) - database ORM and query engine
- [`hono`](https://github.com/honojs/hono) - the next-gen web framework that runs natively on ES modules, and supports cloudflare workers among many others

Optional:

- [`eslint`](https://eslint.org/) - linter for keeping consistency
- [`prettier`](https://prettier.io/) - opinionated code formatter for keeping constant formatting across the codebase

## Conventions for API Routes

Each module can export a `router` prop in the metadata. This router prop should be an instance of `Hono` and will, by default, be mounted on `/<module id>`, for example `/ticketing`.

This can however be changed. By exporting `routerPrefix` alongside the `router` and specifying a string like `"/tickets"` you can rewrite the route prefix.
