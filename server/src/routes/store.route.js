import express from "express";
import {
    createStore,
    getAllStore,
    updateStore,
    deleteStore,
} from "../controllers/store.controller.js";

const router = express.Router();

router.post("/", createStore);
router.get("/", getAllStore);
router.put("/:id", updateStore);
router.delete("/:id", deleteStore);

export default router;