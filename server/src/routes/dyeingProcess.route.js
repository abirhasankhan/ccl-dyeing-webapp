import express from "express";
import {
    createDyeingProcess,
    getAllDyeingProcess,
    updateDyeingProcess,
    deleteDyeingProcess
} from "../controllers/dyeingProcess.controller.js";

const router = express.Router();

router.post("/", createDyeingProcess);
router.get("/", getAllDyeingProcess);
router.put("/:id", updateDyeingProcess);
router.delete("/:id", deleteDyeingProcess);

export default router;
