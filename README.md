## modular-dbot-template

This is a fully modular Discord bot template.

It is meant to streamline creation of completely detached "modules" with their own, focused behavior.

A module can depend on other modules, and use each others data through the concept of triggers.

The core "module" is responsible for loading and managing modules.
It does not (and should never) have any front-facing functionality, like commands, events, components, API routes, database accesses etc.

Runs on [`nhandler`](https://github.com/nortex-dev/nhandler).
