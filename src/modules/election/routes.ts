import { Router } from 'express';
import { catchErrors } from 'utils/errors';
import { tokenMiddleware } from 'modules/user/controller';
import * as controller from './controller';

const router = Router();

router.post('/', tokenMiddleware, catchErrors(controller.create));
router.get('/', tokenMiddleware, catchErrors(controller.list));
router.get('/:electionId', tokenMiddleware, catchErrors(controller.get));
router.patch('/:electionId', tokenMiddleware, catchErrors(controller.update));
router.delete('/:electionId', tokenMiddleware, catchErrors(controller.remove));

export default router;
