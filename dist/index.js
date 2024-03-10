import path from 'path';
import { Client, GatewayIntentBits } from 'discord.js';
import { config as config$1 } from 'dotenv';
import moduleAlias from 'module-alias';
import { isCommandInteraction, isAutocompleteInteraction, isComponentInteraction, createCommands, createEvents, createComponents } from 'nhandler';
import { PrimaryColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, BaseEntity, DataSource } from 'typeorm';
import { z } from 'zod';
import { infoLog, moduleActive, getAction, debugLog as debugLog$1, severeLog as severeLog$1, warnLog, getModules } from '$lib';
import { readdirSync, existsSync, writeFileSync, writeFile, readFileSync } from 'fs';
import { inspect } from 'util';
import c from 'ansi-colors';
import { prettifyZodError } from '@nortex/pretty-zod-error';
import yaml from 'js-yaml';
import { nanoid } from 'nanoid';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

let configShape = z.object({
  token: z.string().optional(),
  database: z.object({
    url: z.string(),
    logging: z.boolean().default(false),
    synchronize: z.boolean().default(false)
  }),
  webserver: z.object({
    enabled: z.boolean().default(true),
    port: z.number().min(1).max(65535)
  })
});

class ReadyEvent {
  client;
  name = "ready";
  async run() {
    commandHandler.updateApplicationCommands();
    infoLog(`Logged in as ${this.client.user?.username}!`);
  }
}
class InteractionCreateEvent {
  client;
  name = "interactionCreate";
  async run(interaction) {
    let settings = null;
    if (moduleActive("core")) {
      const getSettings = getAction("settings", "getSettings");
      const createSettings = getAction("settings", "createSettings");
      debugLog$1(`Fetching settings for guild ${interaction.guildId}.`);
      settings = await getSettings(interaction.guildId);
      if (!settings)
        settings = await createSettings(interaction.guildId);
    }
    if (isCommandInteraction(interaction)) {
      commandHandler.runCommand(interaction, { settings });
    } else if (isAutocompleteInteraction(interaction)) {
      commandHandler.runAutocomplete(interaction, { settings });
    } else if (isComponentInteraction(interaction)) {
      componentHandler.runComponent(interaction, { settings });
    }
  }
}

let modules = [];
const loadModules = async ({
  commandHandler,
  eventHandler,
  componentHandler,
  modulesPath
}) => {
  let rootModulesDir = modulesPath;
  let loadedModules = [];
  let paths = readdirSync(rootModulesDir);
  paths = paths.map((p) => path.join(rootModulesDir, p));
  debugLog$1("Loading modules...");
  try {
    for (let modulePath of paths) {
      const module = await import(path.join("file:///" + modulePath, "./module.ts").replace(new RegExp("\\\\", "gi"), "/"));
      if (!("metadata" in module) || !("init" in module)) {
        severeLog$1(
          `Skipping loading module from '${modulePath}'. Please make sure the module exports a 'metadata' and 'init' property.`
        );
        continue;
      }
      if (!module.metadata.id) {
        severeLog$1(
          `Skipping loading module from '${modulePath}'. Please make sure the module exports a 'metadata.id' property.`
        );
        continue;
      }
      if (loadedModules.find((m) => m.metadata.id === module.metadata.id)) {
        severeLog$1(
          `Skipping loading module from '${modulePath}'. Module with id '${module.metadata.id}' already loaded.`
        );
        continue;
      }
      loadedModules.push(module);
    }
  } catch (err) {
    severeLog$1("Failed to load module.");
    severeLog$1(err);
    process.exit(1);
  }
  for (let module of loadedModules) {
    if (!module.metadata.depends)
      continue;
    for (let dependency of module.metadata.depends) {
      if (!loadedModules.find((m) => m.metadata.id === dependency)) {
        warnLog(
          `Module '${module.metadata.id}' depends on module '${dependency}', which is not available. Disabling module.`
        );
        module.metadata.enabled = false;
      }
    }
  }
  loadedModules = loadedModules.sort((a, b) => {
    if (a.metadata.depends && a.metadata.depends.includes(b.metadata.id))
      return 1;
    return 0;
  });
  loadedModules = loadedModules.filter((module) => module.metadata.enabled);
  for (let module of loadedModules) {
    for (let command of module.metadata.commands || [])
      commandHandler.register(command);
    for (let event of module.metadata.events || [])
      eventHandler.register(event);
    for (let component of module.metadata.components || [])
      componentHandler.register(component);
  }
  for (let module of loadedModules) {
    await module.init();
    debugLog$1(`Initialized module '${module.metadata.id}'.`);
  }
  modules = loadedModules;
};

const welcomeLog = (name, version) => {
  console.log(c.green(`\u250C ${name} \u2022 v${version}`));
};
const debugLog = (...messages) => {
  console.log(c.gray("\u2514 Debug"), ...messages);
  writeLogToFile("[Debug]", ...messages);
};
const severeLog = (...messages) => {
  console.log(c.red("\u2514 Severe"), ...messages);
  writeLogToFile("[Severe]", ...messages);
};
const writeLogToFile = (...messages) => {
  const filePath = path.join(__dirname, "../../log.txt");
  const log = messages.map((m) => typeof m === "string" ? m : inspect(m)).join(" ") + "\n";
  if (!existsSync(filePath))
    writeFileSync(filePath, log);
  writeFile(filePath, log, { flag: "a" }, (err) => {
    if (err)
      severeLog("Failed to write log to file.");
  });
};

const loadConfig = async (configShape, path) => {
  let yamlFile;
  try {
    yamlFile = yaml.load(readFileSync(path, "utf-8"));
  } catch (err) {
    severeLog$1("Fatal: config.yml is not a valid YAML file.");
    process.exit(1);
  }
  let result = configShape.safeParse(yamlFile);
  if (!result.success) {
    severeLog$1("Fatal: Failed to parse configuration file. Errors:");
    severeLog$1(prettifyZodError(result.error));
    process.exit(1);
  }
  let config = result.data;
  return config;
};

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
const readPackageJson = () => {
  const packagePath = path.join(__dirname, "../package.json");
  if (!existsSync(packagePath)) {
    severeLog$1("Fatal: package.json not found. Please make sure you are in the root directory of the project.");
    process.exit(1);
  }
  const pckg = JSON.parse(readFileSync(packagePath, "utf-8"));
  return pckg;
};
class WithIdAndTimestamps extends BaseEntity {
  id;
  assignId() {
    this.id = nanoid(12);
  }
  createdAt;
  updatedAt;
}
__decorateClass([
  PrimaryColumn({ type: "varchar", length: 12 })
], WithIdAndTimestamps.prototype, "id", 2);
__decorateClass([
  BeforeInsert()
], WithIdAndTimestamps.prototype, "assignId", 1);
__decorateClass([
  CreateDateColumn()
], WithIdAndTimestamps.prototype, "createdAt", 2);
__decorateClass([
  UpdateDateColumn()
], WithIdAndTimestamps.prototype, "updatedAt", 2);

const masterHono = new Hono();
const init = async (port) => {
  masterHono.use(logger(debugLog$1));
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
  debugLog$1(
    `[Webserver] Mounted ${registeredEndpoints.length} API routes: ${registeredEndpoints.map((e) => `/${e}`).join(", ")}.`
  );
  masterHono.all("*", (ctx) => {
    return ctx.json({ ok: false, message: "Not found" }, 404);
  });
  serve({
    fetch: masterHono.fetch,
    port
  });
  debugLog$1(`[Webserver] Webserver serving on http://localhost:${port}.`);
};

moduleAlias(path.join(__dirname, ".."));
config$1();
let client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.MessageContent
  ]
});
let commandHandler = createCommands({ client });
let eventHandler = createEvents({ client });
let componentHandler = createComponents({ client });
let dataSource;
let config;
commandHandler.on("debug", debugLog);
eventHandler.on("debug", debugLog);
componentHandler.on("debug", debugLog);
process.on("unhandledRejection", (err) => {
  severeLog("Unhandled rejection:", err);
  severeLog("When contacting support, make sure to send them a screenshot of this error in full.");
});
process.on("uncaughtException", (err) => {
  severeLog("Uncaught exception:", err);
  severeLog("When contacting support, make sure to send them a screenshot of this error in full.");
});
const createApp = async () => {
  try {
    writeLogToFile(`
--- Log start at ${(/* @__PURE__ */ new Date()).toISOString()} ---
`);
    const { name, pretty_name, version } = readPackageJson();
    welcomeLog(pretty_name || name || "Unknown", version || "Unknown");
    eventHandler.register(new ReadyEvent()).register(new InteractionCreateEvent());
    await loadModules({ modulesPath: path.join(__dirname, "modules"), commandHandler, eventHandler, componentHandler });
    config = await loadConfig(configShape, path.join(__dirname, "../config.yml"));
    if (config.webserver.enabled)
      init(config.webserver.port);
    let entities = modules.map((module) => module.metadata.entities || []).flat();
    await createDb(entities);
    await client.login(config.token || process.env.DISCORD_BOT_TOKEN);
  } catch (err) {
    severeLog("Failed to initialize bot. Error:");
    severeLog(err);
    severeLog("When contacting support, make sure to send them a screenshot of this error in full.");
    process.exit(1);
  }
};
const createDb = async (entities) => {
  const dbUrl = new URL(config.database.url);
  const sqlProtocol = dbUrl.protocol.replace(":", "");
  const commonOptions = {
    synchronize: config.database.synchronize,
    logging: config.database.logging,
    entities
  };
  if (!["mysql", "postgres"].includes(sqlProtocol)) {
    dataSource = new DataSource({
      type: sqlProtocol,
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port),
      username: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      ...commonOptions
    });
  } else if (sqlProtocol === "sqlite") {
    dataSource = new DataSource({
      type: "sqlite",
      database: dbUrl.hostname,
      ...commonOptions
    });
  } else {
    severeLog("Invalid database protocol. The only allowed protocols are 'mysql', 'postgres', and 'sqlite'.");
    process.exit(1);
  }
  await dataSource.initialize();
};
createApp();

export { client, commandHandler, componentHandler, config, createApp, dataSource, eventHandler };
