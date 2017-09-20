import { Router } from 'express';

import files from './files';
import auth from '../authMiddleware';

const router = Router();

router.get('', files.require_file);
router.post('', auth, files.create_file);
router.put('', auth, files.update_file_title);
router.delete('', auth, files.delete_file);

router.post('/upload_callback', files.update_file_status); // there is no auth for qiniu callback
router.get('/uploaded', auth, files.require_uploaded_files);
router.get('/access', files.access_file);

export default router;
