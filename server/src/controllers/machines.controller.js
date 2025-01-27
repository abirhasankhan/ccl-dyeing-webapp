import { db } from "../config/drizzleSetup.js";
import { machines } from "../models/machines.model.js";
import { eq, asc } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";

// Create a new machine record
const createMachine = asyncHandler(async (req, res) => {

    const {
        machine_name,
        type,
        capacity,
        status,
        location,
        manufacturer,
        model,
        installation_date,
        last_maintenance_date,
        next_maintenance_date,
        remarks,
    } = req.body;

    // Required field validation
    const requiredFields = [
        "machine_name",
        "type",
        "capacity",
        "status",
        "location",
        "manufacturer",
        "model",
    ];
    const missingFields = requiredFields.filter(
        (field) => {
            const value = req.body[field];
            return (
                (typeof value !== "string" && typeof value !== "number") || // Check both string and number types
                (typeof value === "string" && !value.trim())               // If it's a string, ensure it's not empty
            );
    });

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedMachineName = machine_name.trim();
    const normalizedType = type.trim();
    const normalizedCapacity = Number(capacity);
    const normalizedStatus = status.trim();
    const normalizedLocation = location.trim();
    const normalizedManufacturer = manufacturer.trim();
    const normalizedModel = model.trim();
    const normalizedInstallationDate = installation_date ? new Date(installation_date) : null;
    const normalizedLastMaintenanceDate = last_maintenance_date ? new Date(last_maintenance_date) : null;
    const normalizedNextMaintenanceDate = next_maintenance_date ? new Date(next_maintenance_date) : null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedCapacity)) {
        throw new ApiError(400, "Invalid numeric value provided for capacity");
    }

    // Create new machine object
    const newMachine = {
        machine_name: normalizedMachineName,
        type: normalizedType,
        capacity: normalizedCapacity,
        status: normalizedStatus,
        location: normalizedLocation,
        manufacturer: normalizedManufacturer,
        model: normalizedModel,
        installation_date: normalizedInstallationDate,
        last_maintenance_date: normalizedLastMaintenanceDate,
        next_maintenance_date: normalizedNextMaintenanceDate,
        remarks: normalizedRemarks,
    };

    // Insert into database
    const result = await db.insert(machines).values(newMachine).returning();

    if (!result.length) {
        throw new ApiError(500, "Failed to create machine record");
    }

    return res.status(201).json(
        new ApiResponse(201, result[0], "Machine record created successfully")
    );
});

// Fetch all machine records
const getAllMachines = asyncHandler(async (req, res) => {
    const result = await db
        .select({
            machineid: machines.machineid,
            machine_name: machines.machine_name,
            type: machines.type,
            capacity: machines.capacity,
            status: machines.status,
            location: machines.location,
            manufacturer: machines.manufacturer,
            model: machines.model,
            installation_date: machines.installation_date,
            last_maintenance_date: machines.last_maintenance_date,
            next_maintenance_date: machines.next_maintenance_date,
            remarks: machines.remarks,
            created_at: machines.created_at,
            updated_at: machines.updated_at,
        })
        .from(machines)
        .orderBy(asc(machines.machineid));

    // Format timestamps
    const formattedResult = result.map((item) => ({
        ...item,
        installation_date: item.installation_date ? new Date(item.installation_date).toLocaleString() : null,
        last_maintenance_date: item.last_maintenance_date ? new Date(item.last_maintenance_date).toLocaleString() : null,
        next_maintenance_date: item.next_maintenance_date ? new Date(item.next_maintenance_date).toLocaleString() : null,
        created_at: new Date(item.created_at).toLocaleString(),
        updated_at: new Date(item.updated_at).toLocaleString(),
    }));

    return res.status(200).json(
        new ApiResponse(200, formattedResult, "Machines fetched successfully")
    );
});

// Update an existing machine record
const updateMachine = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        machine_name,
        type,
        capacity,
        status,
        location,
        manufacturer,
        model,
        installation_date,
        last_maintenance_date,
        next_maintenance_date,
        remarks,
    } = req.body;

    // Required field validation
    const requiredFields = [
        "machine_name",
        "type",
        "capacity",
        "status",
        "location",
        "manufacturer",
        "model",
    ];
    const missingFields = requiredFields.filter(
        (field) => {
            const value = req.body[field];
            return (
                (typeof value !== "string" && typeof value !== "number") || // Check both string and number types
                (typeof value === "string" && !value.trim())               // If it's a string, ensure it's not empty
            );
        });

    if (missingFields.length > 0) {
        throw new ApiError(400, `Missing required fields: ${missingFields.join(", ")}`);
    }

    // Normalize inputs by trimming strings where applicable
    const normalizedMachineName = machine_name.trim();
    const normalizedType = type.trim();
    const normalizedCapacity = Number(capacity);
    const normalizedStatus = status.trim();
    const normalizedLocation = location.trim();
    const normalizedManufacturer = manufacturer.trim();
    const normalizedModel = model.trim();
    const normalizedInstallationDate = installation_date ? new Date(installation_date) : null;
    const normalizedLastMaintenanceDate = last_maintenance_date ? new Date(last_maintenance_date) : null;
    const normalizedNextMaintenanceDate = next_maintenance_date ? new Date(next_maintenance_date) : null;
    const normalizedRemarks = remarks?.trim() || null;

    // Validate numeric values
    if (isNaN(normalizedCapacity)) {
        throw new ApiError(400, "Invalid numeric value provided for capacity");
    }

    // Create update machine object
    const updateMachine = {
        machine_name: normalizedMachineName,
        type: normalizedType,
        capacity: normalizedCapacity,
        status: normalizedStatus,
        location: normalizedLocation,
        manufacturer: normalizedManufacturer,
        model: normalizedModel,
        installation_date: normalizedInstallationDate,
        last_maintenance_date: normalizedLastMaintenanceDate,
        next_maintenance_date: normalizedNextMaintenanceDate,
        remarks: normalizedRemarks,
    };

    // Update the record in the database
    const result = await db
        .update(machines)
        .set(updateMachine)
        .where(eq(machines.machineid, id))
        .returning();

    if (!result.length) {
        throw new ApiError(404, "Machine record not found");
    }

    return res.status(200).json(
        new ApiResponse(200, result[0], "Machine record updated successfully")
    );
});

// Delete a machine record
const deleteMachine = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const deletedMachine = await db
        .delete(machines)
        .where(eq(machines.machineid, id))
        .returning();

    if (!deletedMachine.length) {
        throw new ApiError(404, "Machine record not found");
    }

    return res.status(200).json(
        new ApiResponse(200, deletedMachine[0], "Machine record deleted successfully")
    );
});

export { createMachine, getAllMachines, updateMachine, deleteMachine };