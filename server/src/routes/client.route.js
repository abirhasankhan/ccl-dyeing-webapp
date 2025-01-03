import express from "express";
import {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient,
    searchClients,
} from "../controllers/client.controller.js";

const router = express.Router();

router.post("/create", createClient);
router.get("/clients", getClients);
router.get("/search", searchClients); // Search clients by name
router.get("/:id", getClientById);
router.put("/update/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
