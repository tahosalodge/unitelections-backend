import { Router } from 'express';
import { catchErrors } from 'utils/errors';
import { tokenMiddleware } from 'user/controller';
import * as controller from './controller';

const router = Router();

router.post('/', tokenMiddleware, catchErrors(controller.create));
router.get('/', tokenMiddleware, catchErrors(controller.list));
router.get('/:nominationId', tokenMiddleware, catchErrors(controller.get));
router.patch('/:nominationId', tokenMiddleware, catchErrors(controller.update));
router.delete(
  '/:nominationId',
  tokenMiddleware,
  catchErrors(controller.remove)
);

export default router;
