import express from "express";
import {
    createClientDeals,
    getClientDeals,
    updateClientDeals,
    deleteClientDeals,
    searchClientDeals,
} from "../controllers/clientDeals.controller.js";

const router = express.Router();

router.post("/", createClientDeals);
router.get("/", getClientDeals);
router.get("/search", searchClientDeals); // Search clients by name
router.put("/:id", updateClientDeals);
router.delete("/:id", deleteClientDeals);

export default router;
