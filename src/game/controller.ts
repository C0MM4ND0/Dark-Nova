import * as express from 'express';
import requireSession from '../middlewares/require-session';
import { NovaRequest } from '../typings';
import NovaCore from './core/nova-core';
import * as PlayerErrors from './core/errors/player';
import logger from '../logger';
import { inspect } from 'util';
import initCore from './middlewares/init-core';
import config from '../config';
import NovaView from './view/nova-view';

const router = express.Router();
export default router;

router.use(requireSession);
// ==== ROUTES BELOW REQUIRE USER TO BE LOGGED IN!!! ====
router.get('/createPlayer', async (req: NovaRequest, res) => {
    return res.render('game/create-player');
});
router.post('/createPlayer', async(req: NovaRequest, res) => {
    try {
        if(req.body.nickname) {
            const userId = res.locals.user.id;
            const nickname = req.body.nickname;
            const core = new NovaCore(userId);
            await core.createNewPlayer(nickname);
            return res.redirect('/game/');
        }
    }
    catch(err) {
        if(err instanceof PlayerErrors.InvalidNickname) {
            return res.render('game/create-player', {
                error: "Invalid nickname. Nickname should have 4-16 characters and contain only letters, numbers and max one space."
            });
        }
        if(err instanceof PlayerErrors.NicknameIsInUse) {
            return res.render('game/create-player', { error: "This nickname is used by someone else" });
        }
        if(err instanceof PlayerErrors.UserAlreadyGotPlayer) {
            return res.redirect('/game/');
        }
        logger.error("Error while creating player: %s", inspect(err));
        return res.status(500).render('game/create-player', { error: "500 - Internal Error, try again later" });
    }
});

router.use(initCore);
// ==== ROUTES BELOW REQUIRE PLAYER TO EXISTS!!! ====
// ==== ROUTES BELOW LOADS OR CREATES PLANET!!!! ====

if(config.get('env') === 'development') {
    router.get('/test-view', async (req: NovaRequest, res, next) => {
        return res.render('game/' + req.query.view);
    });    
}
router.get(['/', '/overview', '/index'], async (req: NovaRequest, res, next) => {
    try {
        const core = res.locals.core as NovaCore;
        let view = new NovaView(core);
        return res.render('game/index', view.overview());
    }
    catch(err) {
        next(err);
    }
});
router.get('/buildings', async (req: NovaRequest, res, next) => {
    try {
        const core = res.locals.core as NovaCore;
        let view = new NovaView(core);
        return res.render('game/buildings', await view.buildings());
    }
    catch(err) {
        next(err);
    }
});

