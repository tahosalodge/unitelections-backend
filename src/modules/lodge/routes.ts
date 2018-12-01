import { Router } from 'express';
import { catchErrors } from '../../utils/errors';
import { tokenMiddleware } from '../user/controller';
import * as controller from './controller';

const router = Router();

router.post('/', catchErrors(controller.create));
router.get('/', tokenMiddleware, catchErrors(controller.list));
router.get('/:lodgeId', tokenMiddleware, catchErrors(controller.get));
router.patch('/:lodgeId', tokenMiddleware, catchErrors(controller.update));
router.delete('/:lodgeId', tokenMiddleware, catchErrors(controller.remove));

export default router;
