import express from 'express';
import {getAllClients,getClientById,createClient, updateClient,deactivateClient} from '../controllers/clientController.js'; 
import { Permissions } from '../config/permission.config.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { authN } from '../middlewares/auth.js';
const router = express.Router();


router.get('/clients', getAllClients); 
router.get('/client/:id',getClientById); 
router.post('/client/create',createClient);
router.put('/client/upadte/:id',updateClient)
router.patch(
    'deactivateClient/:clientId',
    authN,
    checkPermission(Permissions.MANAGE_CLIENTS), 
    deactivateClient
);
export default router;