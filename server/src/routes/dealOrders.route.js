import express from "express";
import {
    createDealOrder,
    getAllDealOrders,
    updateDealOrder,
    deleteDealOrder
} from "../controllers/dealOrders.controller.js";

const router = express.Router();

router.post("/", createDealOrder);
router.get("/", getAllDealOrders);
router.put("/:id", updateDealOrder);
router.delete("/:id", deleteDealOrder);

export default router;
