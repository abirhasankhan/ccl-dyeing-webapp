import express from "express";
import {
    createProductDetail,
    getAllProductDetail,
    updateProductDetail,
    deleteProductDetail
} from "../controllers/productDetails.controller.js";

const router = express.Router();

router.post("/", createProductDetail);
router.get("/", getAllProductDetail);
router.put("/:id", updateProductDetail);
router.delete("/:id", deleteProductDetail);

export default router;
