import express from "express";
import {
    createInvoice, getAllInvoices, updateInvoice, deleteInvoice
} from "../controllers/invoices.controller.js";

const router = express.Router();

router.post("/", createInvoice);
router.get("/", getAllInvoices);
router.put("/:id", updateInvoice);
router.delete("/:id", deleteInvoice);

export default router;