import { Router } from 'express';

import download from './download';
import works from './works';
import auth from '../authMiddleware';

const router = Router();

router.get('/latest', works.require_latest_works);
router.get('/popular', works.require_popular_works);
router.get('/download', download);

router.get('', works.require_work);
router.post('', auth, works.create_work);
router.put('', auth, works.update_work);
router.delete('', auth, works.delete_work);

router.get('/created', auth, works.require_created_works);


export default router;
