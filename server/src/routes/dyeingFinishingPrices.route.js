import express from "express";
import {
    createDyeingFinishingPrice,
    getAllDyeingFinishingPrices,
    updateDyeingFinishingPrice,
    deleteDyeingFinishingPrice,
} from "../controllers/dyeingFinishingPrices.controller.js";

const router = express.Router();

router.post("/create", createDyeingFinishingPrice);
router.get("/", getAllDyeingFinishingPrices);
router.put("/:id", updateDyeingFinishingPrice);
router.delete("/:id", deleteDyeingFinishingPrice);

export default router;
