"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = exports.config = exports.dataSource = exports.componentHandler = exports.eventHandler = exports.commandHandler = exports.client = void 0;
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const module_alias_1 = __importDefault(require("module-alias"));
const nhandler_1 = require("nhandler");
const typeorm_1 = require("typeorm");
const configShape_1 = require("./configShape");
const eventHandlers_1 = require("./eventHandlers");
const lib_1 = require("./lib");
const util_1 = require("./util");
const webserver_1 = require("./webserver");
(0, module_alias_1.default)(process.cwd());
(0, dotenv_1.config)();
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildPresences,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
exports.commandHandler = (0, nhandler_1.createCommands)({ client: exports.client });
exports.eventHandler = (0, nhandler_1.createEvents)({ client: exports.client });
exports.componentHandler = (0, nhandler_1.createComponents)({ client: exports.client });
exports.commandHandler.on("debug", lib_1.debugLog);
exports.eventHandler.on("debug", lib_1.debugLog);
exports.componentHandler.on("debug", lib_1.debugLog);
process.on("unhandledRejection", (err) => {
    (0, lib_1.severeLog)("Unhandled rejection:", err);
    (0, lib_1.severeLog)("When contacting support, make sure to send them a screenshot of this error in full.");
});
process.on("uncaughtException", (err) => {
    (0, lib_1.severeLog)("Uncaught exception:", err);
    (0, lib_1.severeLog)("When contacting support, make sure to send them a screenshot of this error in full.");
});
const createApp = async () => {
    try {
        (0, lib_1.writeLogToFile)(`\n--- Log start at ${new Date().toISOString()} ---\n`);
        const { name, pretty_name, version } = (0, util_1.readPackageJson)();
        (0, lib_1.welcomeLog)(pretty_name || name || "Unknown", version || "Unknown");
        exports.eventHandler.register(new eventHandlers_1.ReadyEvent()).register(new eventHandlers_1.InteractionCreateEvent());
        await (0, lib_1.loadModules)({
            modulesPath: path_1.default.join(__dirname, "./modules"),
            commandHandler: exports.commandHandler,
            eventHandler: exports.eventHandler,
            componentHandler: exports.componentHandler,
        });
        exports.config = await (0, lib_1.loadConfig)(configShape_1.configShape, path_1.default.join(process.cwd(), "config.yml"));
        if (exports.config.webserver.enabled)
            (0, webserver_1.initWebserver)(exports.config.webserver.port);
        let entities = lib_1.modules.map((module) => module.metadata.entities || []).flat();
        await createDb(entities);
        await exports.client.login(exports.config.token || process.env.DISCORD_BOT_TOKEN);
    }
    catch (err) {
        (0, lib_1.severeLog)("Failed to initialize bot. Error:");
        (0, lib_1.severeLog)(err);
        (0, lib_1.severeLog)("When contacting support, make sure to send them a screenshot of this error in full.");
        process.exit(1);
    }
};
exports.createApp = createApp;
const createDb = async (entities) => {
    const dbUrl = new URL(exports.config.database.url);
    const sqlProtocol = dbUrl.protocol.replace(":", "");
    const commonOptions = {
        synchronize: exports.config.database.synchronize,
        logging: exports.config.database.logging,
        entities: entities,
    };
    if (!["mysql", "postgres"].includes(sqlProtocol)) {
        exports.dataSource = new typeorm_1.DataSource({
            type: sqlProtocol,
            host: dbUrl.hostname,
            port: parseInt(dbUrl.port),
            username: dbUrl.username,
            password: dbUrl.password,
            database: dbUrl.pathname.slice(1),
            ...commonOptions,
        });
    }
    else if (sqlProtocol === "sqlite") {
        exports.dataSource = new typeorm_1.DataSource({
            type: "sqlite",
            database: dbUrl.hostname,
            ...commonOptions,
        });
    }
    else {
        (0, lib_1.severeLog)("Invalid database protocol. The only allowed protocols are 'mysql', 'postgres', and 'sqlite'.");
        process.exit(1);
    }
    await exports.dataSource.initialize();
};
(0, exports.createApp)();
