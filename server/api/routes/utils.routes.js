import { Router } from 'express';
import * as UtilsController from '../controllers/utils.controller';
const router = new Router();

router.route('/utils/componentandmetadatafromroute').get(UtilsController.getComponentAndMetadataFromRoute);

export default router;
