import { Router } from 'express';

import authenticate from './authenticate';
import register from './register';
import username_check from './username_check';
import oauth_user from './oauth_user';

const router = Router();

router.post('/authenticate', authenticate);
router.post('/register', register);
router.post('/username_check', username_check);
router.post('/oauth_user', oauth_user);

export default router;
