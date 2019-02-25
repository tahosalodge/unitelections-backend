import { Router } from 'express';
import { catchErrors } from 'utils/errors';
import { tokenMiddleware, adminMiddleware } from 'user/controller';
import * as unitImport from './unitImport';
import * as exportCsv from './exportCsv';

const router = Router();

router.get(
  '/unit-import/one',
  tokenMiddleware,
  adminMiddleware,
  catchErrors(unitImport.single)
);
router.get(
  '/unit-import/all',
  tokenMiddleware,
  adminMiddleware,
  catchErrors(unitImport.all)
);
router.get(
  '/candidate-export',
  tokenMiddleware,
  adminMiddleware,
  catchErrors(exportCsv.candidates)
);

export default router;
