import { Op, WhereOptions } from "sequelize";
import RequestModel, { RequestAttributes, RequestStatus } from "../models/requestModel";
import User from "../models/userModel";
import { formatRecentRequest } from "../utils/requestFormatters";

const Request = RequestModel;

export interface DashboardStatsConfig {
  userId?: string;
  userRole: string;
}

export interface StatusCounts {
  total: number;
  submitted: number;
  pending: number;
  approved: number;
  rejected: number;
  clarification: number;
  closed: number;
  cancelled: number;
  reopened: number;
}

export interface DashboardStats {
  counts: StatusCounts;
  recentRequests: any[];
}

export class DashboardService {
  static async getDashboardStats(config: DashboardStatsConfig): Promise<DashboardStats> {
    const { userId, userRole } = config;

    switch (userRole) {
      case "admin":   return this.getAdminStats();
      case "manager": return this.getManagerStats();
      case "user":    return this.getUserStats(userId!);
      default:        throw new Error("Invalid user role");
    }
  }

  private static async computeStats(
    whereClause: WhereOptions<RequestAttributes>,
    includeAssociations: object[],
  ): Promise<DashboardStats> {
    const count = (extra: WhereOptions<RequestAttributes> = {}): Promise<number> =>
      Request.count({ where: { ...whereClause, ...extra } as WhereOptions<RequestAttributes> });

    const [
      total,
      submitted,
      pending,
      approved,
      rejected,
      clarification,
      closed,
      cancelled,
      reopened,
      recentRows,
    ] = await Promise.all([
      count(),
      count({ status: RequestStatus.SUBMITTED }),
      count({ status: RequestStatus.PENDING }),
      count({ status: RequestStatus.APPROVED }),
      count({ status: RequestStatus.REJECTED }),
      count({ status: RequestStatus.CLARIFICATION }),
      count({ status: RequestStatus.CLOSED }),
      count({ status: RequestStatus.CANCELLED }),
      count({ status: RequestStatus.REOPENED }),
      Request.findAll({
        where: whereClause,
        limit: 5,
        order: [["createdAt", "DESC"]],
        attributes: ["id", "title", "category", "priority", "status", "submittedAt"],
        include: includeAssociations,
      }),
    ]);

    return {
      counts: { total, submitted, pending, approved, rejected, clarification, closed, cancelled, reopened },
      recentRequests: recentRows.map(formatRecentRequest),
    };
  }

  private static async getAdminStats(): Promise<DashboardStats> {
    return this.computeStats(
      {},
      [{ model: User, as: "user", attributes: ["id", "name", "email"] }],
    );
  }

  private static async getManagerStats(): Promise<DashboardStats> {
    const regularUsers = await User.findAll({
      where: { role: "user" },
      attributes: ["id"],
    });

    const userIds = regularUsers.map((u) => u.id);
    const whereClause: WhereOptions<RequestAttributes> =
      userIds.length > 0 ? { userId: { [Op.in]: userIds } } : {};

    return this.computeStats(whereClause, [
      { model: User, as: "user", attributes: ["id", "name", "email"] },
      { model: User, as: "manager", attributes: ["id", "name", "email"] },
    ]);
  }

  private static async getUserStats(userId: string): Promise<DashboardStats> {
    return this.computeStats(
      { userId } as WhereOptions<RequestAttributes>,
      [],
    );
  }

  static async getStatusDistribution(
    userRole: string,
    userId?: string,
  ): Promise<StatusCounts> {
    let whereClause: WhereOptions<RequestAttributes> = {};

    if (userRole === "user" && userId) {
      whereClause = { userId } as WhereOptions<RequestAttributes>;
    } else if (userRole === "manager") {
      const regularUsers = await User.findAll({
        where: { role: "user" },
        attributes: ["id"],
      });
      const userIds = regularUsers.map((u) => u.id);
      whereClause = userIds.length > 0 ? { userId: { [Op.in]: userIds } } : {};
    }

    const stats = await this.computeStats(whereClause, []);
    return stats.counts;
  }
}

export default DashboardService;