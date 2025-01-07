import express from "express";
import {
    createAdditionalProcessPrice,
    getAllAdditionalProcessPrices,
    updateAdditionalProcessPrice,
    deleteAdditionalProcessPrice
} from "../controllers/additionalProcessPrices.controller.js";

const router = express.Router();

router.post("/create", createAdditionalProcessPrice);
router.get("/", getAllAdditionalProcessPrices);
router.put("/:id", updateAdditionalProcessPrice);
router.delete("/:id", deleteAdditionalProcessPrice);

export default router;