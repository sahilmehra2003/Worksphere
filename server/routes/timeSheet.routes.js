import express from 'express'
import {
    addTimesheetEntry,
    getTimesheetEntries,
    updateTimesheetEntry,
    deleteTimesheetEntry,
    // time sheets
    getAllTimesheets,
    getSubmittedTimesheets,
    submitTimesheet,
    rejectTimesheet,
    approveTimesheet,
    getMyTimesheets,
    getTimesheetById
    
} from '../controllers/timesheet.controller.js'
import {authN} from '../middlewares/auth.js'
import {checkPermission} from '../middlewares/permission.middleware.js'
import { Permissions } from '../config/permission.config.js'

const router = express.Router();

router.post('/addEntries',authN,addTimesheetEntry);
router.patch('/updateEntries',authN,updateTimesheetEntry);
router.delete('/deleteEntries/:entryId',authN,deleteTimesheetEntry);
router.get('/getALLTimesheets',authN,checkPermission(Permissions.VIEW_ALL_TIMESHEETS),getAllTimesheets);
router.get('/myTimeSheets',authN,getMyTimesheets);
router.get('/submitted',
    authN,
    checkPermission(Permissions.APPROVE_TIMESHEETS), 
    getSubmittedTimesheets
);
router.get('/getTimesheetById/:timesheetId',
    authN, 
    getTimesheetById
);
router.patch('/draftTimeSheet/:timesheetId/submit', 
    authN, 
    submitTimesheet
);
router.patch('/approveTimesheet/:timesheetId/approve', 
    authN,
    checkPermission(Permissions.APPROVE_TIMESHEETS), 
    approveTimesheet 
);
router.patch('/checkTimesheet/:timesheetId/reject', 
    authN,
    checkPermission(Permissions.APPROVE_TIMESHEETS), 
    rejectTimesheet
);

export default router;