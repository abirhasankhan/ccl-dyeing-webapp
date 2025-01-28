import express from "express";
import {
    createReturn,
    getAllReturns,
    updateReturn,
    deleteReturn
} from "../controllers/returns.controller.js";

const router = express.Router();

router.post("/", createReturn);
router.get("/", getAllReturns);
router.put("/:id", updateReturn);
router.delete("/:id", deleteReturn);

export default router;
