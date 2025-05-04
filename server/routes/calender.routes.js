import express from "express";
import {
  upsertCountryCalendar,
  getCountryCalendar,
  getAllCountryCalendars,
  deleteCountryCalendar,
  addHoliday,
  deleteHoliday
} from '../controllers/calender.controller.js'
import { Permissions } from "../config/permission.config.js";
import { authN } from "../middlewares/auth.js"
import { checkPermission } from "../middlewares/permission.middleware.js";

const router = express.Router();


router.post(
  "/create",
  authN,
  checkPermission(Permissions.MANAGE_CALENDAR),
  upsertCountryCalendar
);



router.get("/fetchAll", authN, getAllCountryCalendars);
router.delete('/:countryCode/holidays/:holidayId',authN,deleteHoliday);

router.get("/fetchcountrycalender/:country", authN, getCountryCalendar);

router.delete(
  "/:country",
  authN,
  checkPermission(Permissions.MANAGE_CALENDAR),
  deleteCountryCalendar
);

export default router;
