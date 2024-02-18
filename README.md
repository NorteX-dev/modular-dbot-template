# modular-dbot-template

This is a fully modular Discord bot template.

It is meant to streamline creation of completely detached "modules" with their own, focused behavior.

## The idea behind it

The core is responsible for loading and managing modules.
It does not (and should never) have any front-facing functionality, like commands, events, components, API routes, database accesses etc.

A module should be removable without causing other modules to break - except those, which depend on it.

### Exceptions

The only aspect except of this rule is database schema definition.

Since this template uses Prisma as the model definition tool and Prisma uses a single file for schema definition, concern separation in this case is impossible.
However, any database accesses, should nonetheless be streamlined to the concept-separation model.

## Concepts

### Dependency trees

A module can depend on other modules. This means a module will not be loaded if not all of its dependencies are present.

In the case of a missing dependency, the module will silently fail (on debug mode will print).

### Configuration

This template uses a single configuration file available to access from any module.

### Triggers

Modules can share "triggers", which are nothing more than functions. This way data can be passed through various models without causing instability if certain modules are not installed.

This is somewhat comparable to the concept of triggering a tRPC function.

## The stack

This template utilises:

- `esmodule` - runs on ES Modules (nodenext); this means that Node v18 is required and module-compatible packages are required
- `typescript` - provides type safety and better quality code
- [`discordjs`](https://github.com/discordjs/discord.js) - library for connecting to Discord
- [`nhandler`](https://github.com/nortex-dev/nhandler) - handler for loading, updating and managing commands, events and component callbacks.
- [`prisma`](https://github.com/prisma/prisma) - database ORM and query engine

Optional:

- [`eslint`](https://eslint.org/) - linter for keeping consistency
- [`prettier`](https://prettier.io/) - opinionated code formatter for keeping constant formatting across the codebase
