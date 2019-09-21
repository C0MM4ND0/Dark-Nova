import * as express from 'express';
import requireSession from './middleware/require-session';
import APIRequest from './interfaces/api-request';
import APIResponse from './interfaces/api-response';
import NovaCore from '@core/nova-core';
import * as PlayerErrors from '@core/errors/player';
import apiError from './helpers/api-error';
import logger from '@logger';
import { inspect } from 'util';
import IPlayer from './interfaces/dtos/player';
import IPlanet from './interfaces/dtos/planet';
import initCore from './middleware/init-core';

const routerek = express.Router();
export default routerek;

routerek.use(requireSession);

/**
 * @apiDefine Session
 * 
 * @apiHeader (Session) {string} X-Nova-Token Session token
 * @apiHeaderExample {json} Header-Example:
 *      {
 *          "X-Nova-Token": "2a707cba-e4ca-4c4b-a0ec-2a59a1a54041"
 *      }
 */

/**
 * @api {post} /game/create-player Create Player
 * @apiVersion 1.0.0
 * @apiName CreatePlayer
 * @apiGroup Account Management
 * 
 * @apiUse Session
 * 
 * @apiParam {string} nickname Player nickname
 * 
 * @apiSuccessExample Success-Response:
 *      HTTP/1.1 201 Created
 * 
 * @apiError (Error 4xx) INVALID_REQUEST Request is invalid, propably some params are missing
 * @apiError (Error 4xx) INVALID_NICKNAME Nickname is invalid
 * @apiError (Error 4xx) NICKNAME_IN_USE This nickname is used by someone else
 * @apiError (Error 4xx) USER_ALREADY_GOT_PLAYER This user already got player
 */
routerek.post('/create-player', async (req: APIRequest, res: APIResponse, next) => {
    try {
        if (req.body.nickname) {
            const userId = res.locals.user.id;
            const nickname = req.body.nickname;
            const core = new NovaCore(userId);
            await core.createNewPlayer(nickname);
            return res.status(201).send();
        }
        return apiError(res, 400, "INVALID_REQUEST");
    }
    catch(err) {
        if(err instanceof PlayerErrors.InvalidNickname) {
            return apiError(res, 400, "INVALID_NICKNAME");
        }
        if(err instanceof PlayerErrors.NicknameIsInUse) {
            return apiError(res, 400, "NICKNAME_IN_USE");
        }
        if(err instanceof PlayerErrors.UserAlreadyGotPlayer) {
            return apiError(res, 400, "USER_ALREADY_GOT_PLAYER");
        }
        return next(err);
    }
});

routerek.use(initCore);
// ==== ROUTES BELOW REQUIRE PLAYER TO EXISTS!!! ==== //
// ==== ROUTES BELOW LOADS OR CREATES PLANET!!!! ==== //

// < G E T   R O U T E S > //
routerek.get('/basic-data', async(req: APIRequest, res: APIResponse, next: express.NextFunction) => {
    try {
        const core = res.locals.core;
        const player = core.$player;
        const planet = core.$planet;

        const response = {
            player: {
                nickname: player.nickname
            },
            planet: {
                name: planet.name,
                energy: planet.energy,
                energyUsage: planet.usedEnergy,
                metal: planet.metal,
                crystal: planet.crystal,
                deuterium: planet.deuter,
                metalPerHour: planet.metalPerHour,
                crystalPerHour: planet.crystalPerHour,
                deuteriumPerHour: planet.deuteriumPerHour,
                metalStorage: planet.metalStorage,
                crystalStorage: planet.crystalStorage,
                deuteriumStorage: planet.deuteriumStorage
            }
        } as {
            player: Partial<IPlayer>,
            planet: Partial<IPlanet>
        };

        return res.status(200).json(response);
    }
    catch(err) {
        next(err);
    }
});
routerek.get('/overview', async (req: APIRequest, res: APIResponse, next: express.NextFunction) => {
    try {
        const core = res.locals.core;
        const player = core.$player;
        const planet = core.$planet;

        const response = {
            player: {
                nickname: player.nickname
            },
            planet: {
                name: planet.name,
                maxFields: planet.maxFields,
                usedFields: planet.usedFields,
                galaxy: planet.galaxy,
                system: planet.system,
                position: planet.position,
                diameter: planet.diameter,
                minTemperature: planet.minTemperature,
                maxTemperature: planet.maxTemperature,
                planetType: planet.planetType
            }
        } as {
            player: Partial<IPlayer>,
            planet: Partial<IPlanet>
        };
        
        return res.status(200).json(response);
    }
    catch(err) {
        next(err);
    }
});

//Da Error Handla
routerek.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error("API::Game: %s", inspect(err));
    return res.status(500).send({
        statusCode: 500,
        error: "INTERNAL_ERROR"
    });
});
