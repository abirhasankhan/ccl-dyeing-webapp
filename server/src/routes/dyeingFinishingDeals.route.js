import express from "express";
import {
    createDyeingFinishingDeals,
    getAllDyeingFinishingDeals,
    updateDyeingFinishingDeals,
    deleteDyeingFinishingDeals
} from "../controllers/dyeingFinishingDeals.controller.js";

const router = express.Router();

router.post("/", createDyeingFinishingDeals);
router.get("/", getAllDyeingFinishingDeals);
router.put("/:id", updateDyeingFinishingDeals);
router.delete("/:id", deleteDyeingFinishingDeals);

export default router;
