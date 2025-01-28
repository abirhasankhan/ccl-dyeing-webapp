import { db } from "../config/drizzleSetup.js";
import { machines } from "../models/machines.model.js";
import { eq, asc } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";


// Create a new machine record
const createMachine = asyncHandler(async (req, res) => {

    // Check if request body is missing
    if (!req.body) {
        throw new ApiError(400, "Request body is missing");
    }

    const {
        machineid,
        machine_name,
        machine_type,
        capacity,
        manufacturer,
        model,
        installation_date,
        last_maintenance_date,
        next_maintenance_date,
        remarks,
    } = req.body;

    // Required field validation
    const requiredFields = [
        "machineid",
        "machine_name",
        "machine_type",
        "capacity",
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
    const normalizedMachineid = String(machineid).trim();
    const normalizedMachineName = String(machine_name).trim();
    const normalizedType = String(machine_type).trim();
    const normalizedCapacity = Number(capacity);
    const normalizedManufacturer = String(manufacturer).trim();
    const normalizedModel = String(model).trim();
    const normalizedInstallationDate = installation_date ? new Date(installation_date) : null;
    const normalizedLastMaintenanceDate = last_maintenance_date ? new Date(last_maintenance_date) : null;
    const normalizedNextMaintenanceDate = next_maintenance_date ? new Date(next_maintenance_date) : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (isNaN(normalizedCapacity)) {
        throw new ApiError(400, "Invalid numeric value provided for capacity");
    }

    // Create new machine object
    const newMachine = {
        machineid: normalizedMachineid,
        machine_name: normalizedMachineName,
        machine_type: normalizedType,
        capacity: normalizedCapacity,
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

    // Fetch all machines from the database
    const result = await db
        .select({
            machineid: machines.machineid,
            machine_name: machines.machine_name,
            machine_type: machines.machine_type, // Corrected key to match schema
            capacity: machines.capacity,
            status: machines.status,
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
    const formattedResult = result.map((item) => {
        const formatDate = (date) => (date ? new Date(date).toLocaleString() : null);

        return {
            ...item,
            installation_date: formatDate(item.installation_date),
            last_maintenance_date: formatDate(item.last_maintenance_date),
            next_maintenance_date: formatDate(item.next_maintenance_date),
            created_at: formatDate(item.created_at),
            updated_at: formatDate(item.updated_at),
        };
    });

    // Return success response
    return res.status(200).json(
        new ApiResponse(200, formattedResult, "Machines fetched successfully")
    );
});


// Update an existing machine record
const updateMachine = asyncHandler(async (req, res) => {

    const { id } = req.params;

    const {
        machineid,
        machine_name,
        machine_type,
        capacity,
        status,
        manufacturer,
        model,
        installation_date,
        last_maintenance_date,
        next_maintenance_date,
        remarks,
    } = req.body;

    // Required field validation
    const requiredFields = [
        "machineid",
        "machine_name",
        "machine_type",
        "capacity",
        "status",
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
    const normalizedMachineid = String(machineid).trim();
    const normalizedMachineName = String(machine_name).trim();
    const normalizedType = String(machine_type).trim();
    const normalizedCapacity = Number(capacity);
    const normalizedStatus = status.trim();
    const normalizedManufacturer = String(manufacturer).trim();
    const normalizedModel = String(model).trim();
    const normalizedInstallationDate = installation_date ? new Date(installation_date) : null;
    const normalizedLastMaintenanceDate = last_maintenance_date ? new Date(last_maintenance_date) : null;
    const normalizedNextMaintenanceDate = next_maintenance_date ? new Date(next_maintenance_date) : null;
    const normalizedRemarks = remarks ? String(remarks).trim() : null;

    // Validate numeric values
    if (isNaN(normalizedCapacity)) {
        throw new ApiError(400, "Invalid numeric value provided for capacity");
    }

    // Create update machine object
    const updateMachine = {
        machineid: normalizedMachineid,
        machine_name: normalizedMachineName,
        machine_type: normalizedType,
        capacity: normalizedCapacity,
        status: normalizedStatus,
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
        throw new ApiError(500, "Failed to update machine record");
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


export { 
    createMachine, 
    getAllMachines, 
    updateMachine, 
    deleteMachine
};