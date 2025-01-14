import express from "express";
import {
    createAdditionalProcessDeals,
    getAllAdditionalProcessDeals,
    updateAdditionalProcessDeals,
    deleteAdditionalProcessDeals
} from "../controllers/additionalProcessDeals.controller.js";

const router = express.Router();

router.post("/", createAdditionalProcessDeals);
router.get("/", getAllAdditionalProcessDeals);
router.put("/:id", updateAdditionalProcessDeals);
router.delete("/:id", deleteAdditionalProcessDeals);

export default router;
