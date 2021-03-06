import config from "../config";
import logger from "../logger";
import { createConnection } from "typeorm";
import DatabaseLogger from "./logger";
import User from "./models/user";
import Player from "./models/player";
import Planet from "./models/planet";
import PlanetBuildings from "./models/planet-buildings";
import BuildTask from "./models/build-task";
import Message from "./models/message";
import Research from "./models/research";
import ResearchTask from "./models/research-task";
import Defense from "./models/defense";
import Ships from "./models/ships";

export default async function initDatabase() {
    const entities = [
        User, Player, Planet, PlanetBuildings, BuildTask, Message,
        Research, ResearchTask, Defense, Ships
    ];
    const dbConfig = config.get("db");
    const databaseOptions: any = {
        logging: dbConfig.logging,
        logger: dbConfig.logging && new DatabaseLogger(),
        entities: entities,
        synchronize: true
    };
    if(dbConfig.dialect === "sqlite") {
        databaseOptions.type = "sqlite";
        databaseOptions.database = dbConfig.storage;
    }
    else {
        databaseOptions.type = dbConfig.dialect;
        databaseOptions.host = dbConfig.host;
        databaseOptions.username = dbConfig.user;
        databaseOptions.password = dbConfig.password;
        databaseOptions.database = dbConfig.name;
        if(dbConfig.port) databaseOptions.port = dbConfig.port;
    }

    await createConnection(databaseOptions);
    logger.info("<DATABASE> Connected to database!");
}

