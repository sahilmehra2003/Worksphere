import express from "express"
import { getAllTransactions, transactionData } from "../controllers/transactionController.js"
const router=express.Router()

router.get("/transaction/:id",transactionData)

router.get("/transactions",getAllTransactions)

export default router