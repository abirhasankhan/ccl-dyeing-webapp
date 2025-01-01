import express from "express";
import {
    createClient,
    getClients,
    getClientById,
    updateClient,
    deleteClient,
    searchClientsByName,
} from "../controllers/client.controller.js";

const router = express.Router();

router.post("/create", createClient);
router.get("/clients", getClients);
router.get("/search", searchClientsByName); // Search clients by name
router.get("/:id", getClientById);
router.put("/:id", updateClient);
router.delete("/:id", deleteClient);

export default router;
