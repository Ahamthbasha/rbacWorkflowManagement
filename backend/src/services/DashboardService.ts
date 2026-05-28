// services/dashboardService.ts
import { Op } from "sequelize";
import RequestModel, { RequestStatus } from "../models/requestModel";
import User from "../models/userModel";
import { formatRecentRequest } from "../utils/requestFormatters";

const Request = RequestModel;

export interface DashboardStatsConfig {
  userId?: string;
  userRole: string;
  department?: string | null;
}

export interface DashboardStats {
  counts: Record<string, number>;
  breakdown?: {
    pendingPct: number;
    approvedPct: number;
    rejectedPct: number;
    closedPct?: number;
    cancelledPct?: number;
  };
  recentRequests: any[];
}

export class DashboardService {
  /**
   * Get dashboard statistics based on user role
   */
  static async getDashboardStats(
    config: DashboardStatsConfig,
  ): Promise<DashboardStats> {
    const { userId, userRole, department } = config;

    switch (userRole) {
      case "admin":
        return this.getAdminStats();
      case "manager":
        return this.getManagerStats(department);
      case "user":
        return this.getUserStats(userId!);
      default:
        throw new Error("Invalid user role");
    }
  }

  /**
   * Get stats for Admin - overview of all requests
   */
  private static async getAdminStats(): Promise<DashboardStats> {
    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      closedRequests,
      cancelledRequests,
      clarificationRequests,
      recentRequests,
    ] = await Promise.all([
      Request.count(),
      Request.count({
        where: {
          status: {
            [Op.in]: [
              RequestStatus.SUBMITTED,
              RequestStatus.PENDING,
              RequestStatus.CLARIFICATION,
            ],
          },
        },
      }),
      Request.count({ where: { status: RequestStatus.APPROVED } }),
      Request.count({ where: { status: RequestStatus.REJECTED } }),
      Request.count({ where: { status: RequestStatus.CLOSED } }),
      Request.count({ where: { status: RequestStatus.CANCELLED } }),
      Request.count({ where: { status: RequestStatus.CLARIFICATION } }),
      Request.findAll({
        limit: 5,
        order: [["createdAt", "DESC"]],
        attributes: [
          "id",
          "title",
          "category",
          "priority",
          "status",
          "submittedAt",
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "department"],
          },
        ],
      }),
    ]);

    const safeTotal = totalRequests || 1;
    const breakdown = {
      pendingPct: +((pendingRequests / safeTotal) * 100).toFixed(1),
      approvedPct: +((approvedRequests / safeTotal) * 100).toFixed(1),
      rejectedPct: +((rejectedRequests / safeTotal) * 100).toFixed(1),
      closedPct: +((closedRequests / safeTotal) * 100).toFixed(1),
      cancelledPct: +((cancelledRequests / safeTotal) * 100).toFixed(1),
    };

    return {
      counts: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        closed: closedRequests,
        cancelled: cancelledRequests,
        clarification: clarificationRequests,
      },
      breakdown,
      recentRequests: recentRequests.map(formatRecentRequest),
    };
  }

  /**
   * Get stats for Manager - requests under their department
   */
  private static async getManagerStats(
    department?: string | null,
  ): Promise<DashboardStats> {
    // Find all users in the manager's department
    const departmentUsers = await User.findAll({
      where: {
        department: department || undefined,
        role: "user",
      },
      attributes: ["id"],
    });

    const userIds = departmentUsers.map((user) => user.id);

    const whereClause =
      userIds.length > 0 ? { userId: { [Op.in]: userIds } } : {};

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      clarificationRequests,
      recentRequests,
    ] = await Promise.all([
      Request.count({ where: whereClause }),
      Request.count({
        where: {
          ...whereClause,
          status: {
            [Op.in]: [
              RequestStatus.SUBMITTED,
              RequestStatus.PENDING,
              RequestStatus.CLARIFICATION,
            ],
          },
        },
      }),
      Request.count({
        where: {
          ...whereClause,
          status: RequestStatus.APPROVED,
        },
      }),
      Request.count({
        where: {
          ...whereClause,
          status: RequestStatus.REJECTED,
        },
      }),
      Request.count({
        where: {
          ...whereClause,
          status: RequestStatus.CLARIFICATION,
        },
      }),
      Request.findAll({
        where: whereClause,
        limit: 5,
        order: [["createdAt", "DESC"]],
        attributes: [
          "id",
          "title",
          "category",
          "priority",
          "status",
          "submittedAt",
        ],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email", "department"],
          },
          {
            model: User,
            as: "manager",
            attributes: ["id", "name", "email"],
          },
        ],
      }),
    ]);

    const safeTotal = totalRequests || 1;
    const breakdown = {
      pendingPct: +((pendingRequests / safeTotal) * 100).toFixed(1),
      approvedPct: +((approvedRequests / safeTotal) * 100).toFixed(1),
      rejectedPct: +((rejectedRequests / safeTotal) * 100).toFixed(1),
    };

    return {
      counts: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        clarification: clarificationRequests,
      },
      breakdown,
      recentRequests: recentRequests.map(formatRecentRequest),
    };
  }

  /**
   * Get stats for regular User - their own requests
   */
  private static async getUserStats(userId: string): Promise<DashboardStats> {
    const whereClause = { userId };

    const [
      totalRequests,
      submittedRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      clarificationRequests,
      cancelledRequests,
      recentRequests,
    ] = await Promise.all([
      Request.count({ where: whereClause }),
      Request.count({
        where: {
          ...whereClause,
          status: RequestStatus.SUBMITTED,
        },
      }),
      Request.count({
        where: {
          ...whereClause,
          status: {
            [Op.in]: [RequestStatus.PENDING, RequestStatus.CLARIFICATION],
          },
        },
      }),
      Request.count({
        where: {
          ...whereClause,
          status: RequestStatus.APPROVED,
        },
      }),
      Request.count({
        where: {
          ...whereClause,
          status: RequestStatus.REJECTED,
        },
      }),
      Request.count({
        where: {
          ...whereClause,
          status: RequestStatus.CLARIFICATION,
        },
      }),
      Request.count({
        where: {
          ...whereClause,
          status: RequestStatus.CANCELLED,
        },
      }),
      Request.findAll({
        where: whereClause,
        limit: 5,
        order: [["createdAt", "DESC"]],
        attributes: [
          "id",
          "title",
          "category",
          "priority",
          "status",
          "submittedAt",
        ],
        include: [
          {
            model: User,
            as: "manager",
            attributes: ["id", "name", "email"],
          },
        ],
      }),
    ]);

    return {
      counts: {
        total: totalRequests,
        submitted: submittedRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests,
        clarification: clarificationRequests,
        cancelled: cancelledRequests,
      },
      recentRequests: recentRequests.map(formatRecentRequest),
    };
  }

  /**
   * Get status distribution for charts
   */
  static async getStatusDistribution(
    userRole: string,
    userId?: string,
    department?: string | null,
  ): Promise<any> {
    let whereClause = {};

    if (userRole === "user" && userId) {
      whereClause = { userId };
    } else if (userRole === "manager" && department) {
      const departmentUsers = await User.findAll({
        where: { department, role: "user" },
        attributes: ["id"],
      });
      const userIds = departmentUsers.map((user) => user.id);
      whereClause = userIds.length > 0 ? { userId: { [Op.in]: userIds } } : {};
    }

    const statusCounts = await Promise.all([
      Request.count({
        where: { ...whereClause, status: RequestStatus.SUBMITTED },
      }),
      Request.count({
        where: { ...whereClause, status: RequestStatus.PENDING },
      }),
      Request.count({
        where: { ...whereClause, status: RequestStatus.APPROVED },
      }),
      Request.count({
        where: { ...whereClause, status: RequestStatus.REJECTED },
      }),
      Request.count({
        where: { ...whereClause, status: RequestStatus.CLOSED },
      }),
      Request.count({
        where: { ...whereClause, status: RequestStatus.CANCELLED },
      }),
      Request.count({
        where: { ...whereClause, status: RequestStatus.CLARIFICATION },
      }),
    ]);

    return {
      submitted: statusCounts[0],
      pending: statusCounts[1],
      approved: statusCounts[2],
      rejected: statusCounts[3],
      closed: statusCounts[4],
      cancelled: statusCounts[5],
      clarification: statusCounts[6],
    };
  }
}

export default DashboardService;
