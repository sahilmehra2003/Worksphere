import express from 'express';
import { getAllClients, getClientById, createClient, updateClient, deactivateClient } from '../controllers/clientController.js';
import { Permissions } from '../config/permission.config.js';
import { checkPermission } from '../middlewares/permission.middleware.js';
import { authN } from '../middlewares/auth.js';
const router = express.Router();


router.get('/clients', authN, checkPermission(Permissions.VIEW_CLIENT), getAllClients);
router.get('/client/:id', authN, checkPermission(Permissions.VIEW_CLIENT), getClientById);
router.post('/client/create', authN, checkPermission(Permissions.CREATE_CLIENT), createClient);
router.put('/client/update/:id', authN, checkPermission(Permissions.UPDATE_CLIENT), updateClient);
router.patch(
    '/deactivateClient/:clientId',
    authN,
    checkPermission(Permissions.DELETE_CLIENT),
    deactivateClient
);
export default router;