// File: src/controllers/admin.controller.js
import { db } from "../config/drizzleSetup.js";
import { users } from "../models/users.model.js";
import { eq } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const adminDashboardHandler = asyncHandler(async (req, res) => {
    // Example admin-only statistics
    const [totalUsers, activeUsers, recentUsers] = await Promise.all([
        db.select({ count: sql`count(*)` }).from(users),
        db.select({ count: sql`count(*)` })
            .from(users)
            .where(eq(users.status, 'active')),
        db.select()
            .from(users)
            .orderBy(users.createdAt)
            .limit(5)
    ]);

    const dashboardData = {
        metrics: {
            totalUsers: totalUsers[0].count,
            activeUsers: activeUsers[0].count,
            inactiveUsers: totalUsers[0].count - activeUsers[0].count
        },
        recentSignups: recentUsers.map(user => ({
            id: user.userid,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }))
    };

    return res
        .status(200)
        .json(new ApiResponse(200, dashboardData, "Admin dashboard data retrieved"));
});