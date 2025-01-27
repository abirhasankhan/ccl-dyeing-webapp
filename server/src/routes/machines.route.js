import express from "express";
import {
    createMachine, getAllMachines, updateMachine, deleteMachine
} from "../controllers/machines.controller.js";

const router = express.Router();

router.post("/", createMachine);
router.get("/", getAllMachines);
router.put("/:id", updateMachine);
router.delete("/:id", deleteMachine);

export default router;
