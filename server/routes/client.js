import express from 'express';
import {getAllClients,getClientById,createClient, updateClient} from '../controllers/clientController.js'; 

const router = express.Router();


router.get('/clients', getAllClients); 
router.get('/client/:id',getClientById); 
router.post('/client/create',createClient);
router.put('/client/upadte/:id',updateClient)
router.delete('/client/delete/:id',);
export default router;