import { Router } from 'express';
import { catchErrors } from '../../utils/errors';
import { tokenMiddleware } from '../user/controller';
import * as controller from './controller';

const router = Router();

router.post('/', catchErrors(controller.create));
router.get('/', tokenMiddleware, catchErrors(controller.list));
router.get('/:unitId', tokenMiddleware, catchErrors(controller.get));
router.patch('/:unitId', tokenMiddleware, catchErrors(controller.update));
router.delete('/:unitId', tokenMiddleware, catchErrors(controller.remove));

export default router;
