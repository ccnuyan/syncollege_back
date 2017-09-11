import { Router } from 'express';

import files from './files';
import auth from '../authMiddleware';

const router = Router();

router.get('', files.require_file);
router.post('', auth, files.create_file);
router.put('', auth, files.update_file);
router.delete('', auth, files.delete_file);

router.get('/uploaded', auth, files.require_created_files);


export default router;
