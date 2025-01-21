import express from "express";
import {
    createShipment,
    getAllShipments,
    updateShipment,
    deleteShipment
} from "../controllers/shipments.controller.js";

const router = express.Router();

router.post("/", createShipment);
router.get("/", getAllShipments);
router.put("/:id", updateShipment);
router.delete("/:id", deleteShipment);

export default router;
