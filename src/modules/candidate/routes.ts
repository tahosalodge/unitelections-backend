import { Router } from 'express';
import { catchErrors } from 'utils/errors';
import { tokenMiddleware } from 'user/controller';
import * as controller from './controller';

const router = Router();

router.post('/', tokenMiddleware, catchErrors(controller.create));
router.get('/', tokenMiddleware, catchErrors(controller.list));
router.get('/:candidateId', tokenMiddleware, catchErrors(controller.get));
router.patch('/:candidateId', tokenMiddleware, catchErrors(controller.update));
router.delete('/:candidateId', tokenMiddleware, catchErrors(controller.remove));

export default router;
