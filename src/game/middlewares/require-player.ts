import { NovaRequest } from "../../typings";
import { Response, NextFunction } from "express";
import User from "../../db/models/user";
import Player from "../../db/models/player";
import logger from "../../logger";
import { inspect } from "util";

/** Checks if there's created player for logged in user.  
 *  Requires requireSession middleware before it.  
 *  If player exists it place it to res.locals.player and call next function.  
 *  If player does not exits redirects to createPlayer page.
 */
export default async function requirePlayer(req: NovaRequest, res: Response, next: NextFunction) {
    try {
        let user = res.locals.user as User;
        let player = await Player.findOne({ where: {
            userId: user.id
        }});
        if(player) {
            res.locals.player = player;
            return next();
        }
        return res.redirect('/game/createPlayer');
    }
    catch(err) {
        logger.error("Error in middleware requirePlayer: %s", inspect(err));
        return res.status(500).send("<h1>500 - Internal Error</h1>"); //TODO: Make a nicer message for this :)
    }
}
