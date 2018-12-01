import { Router } from 'express';
import { catchErrors } from '../../utils/errors';
import * as controller from './controller';

const { tokenMiddleware } = controller;

const router = Router();

router.post('/login', catchErrors(controller.login));
router.post('/register', catchErrors(controller.register));
router.get('/verify', tokenMiddleware, catchErrors(controller.verify));
router.post('/oops', tokenMiddleware, catchErrors(controller.resetPassword));
router.get('/', tokenMiddleware, catchErrors(controller.list));
router.post('/', tokenMiddleware, catchErrors(controller.create));
router.get('/:userId', tokenMiddleware, catchErrors(controller.get));
router.patch('/:userId', tokenMiddleware, catchErrors(controller.update));
router.delete('/:userId', tokenMiddleware, catchErrors(controller.remove));

export default router;
