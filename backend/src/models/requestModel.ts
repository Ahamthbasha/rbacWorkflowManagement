// models/requestModel.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";
import User from "./userModel";
import RequestLog from "./requestLogModel"; // ✅ Add this import

export enum RequestStatus {
  SUBMITTED = 'submitted',
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CLARIFICATION = 'clarification_needed',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export enum RequestPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export enum RequestCategory {
  ACCESS = 'access',
  SOFTWARE = 'software',
  HARDWARE = 'hardware',
  LEAVE = 'leave',
  BUDGET = 'budget',
  OTHER = 'other'
}

interface RequestAttributes {
  id: string;
  title: string;
  description: string;
  category: RequestCategory;
  priority: RequestPriority;
  status: RequestStatus;
  userId: string;
  managerId: string | null;
  adminId: string | null;
  comments: string | null;
  clarificationRequest: string | null;
  clarificationResponse: string | null;
  submittedAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
}

interface RequestCreationAttributes extends Optional<RequestAttributes,
  'id' | 'status' | 'managerId' | 'adminId' | 'comments' | 'clarificationRequest' | 'clarificationResponse' | 'approvedAt' | 'rejectedAt' | 'submittedAt'
> {}

class Request extends Model<RequestAttributes, RequestCreationAttributes> implements RequestAttributes {
  public id!: string;
  public title!: string;
  public description!: string;
  public category!: RequestCategory;
  public priority!: RequestPriority;
  public status!: RequestStatus;
  public userId!: string;
  public managerId!: string | null;
  public adminId!: string | null;
  public comments!: string | null;
  public clarificationRequest!: string | null;
  public clarificationResponse!: string | null;
  public submittedAt!: Date;
  public approvedAt!: Date | null;
  public rejectedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Request.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(...Object.values(RequestCategory)),
      allowNull: false,
      defaultValue: RequestCategory.OTHER,
    },
    priority: {
      type: DataTypes.ENUM(...Object.values(RequestPriority)),
      allowNull: false,
      defaultValue: RequestPriority.MEDIUM,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(RequestStatus)),
      allowNull: false,
      defaultValue: RequestStatus.SUBMITTED,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clarificationRequest: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    clarificationResponse: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    rejectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Request",
    tableName: "requests",
    timestamps: true,
    hooks: {
      beforeCreate: async (request: any) => {
        if (request.userId) {
          const user = await User.findByPk(request.userId);
          if (user && user.department) {
            const manager = await User.findOne({
              where: { department: user.department, role: 'manager' }
            });
            if (manager) {
              request.managerId = manager.id;
            }
          }
        }
      },
    },
  }
);

// ── User ↔ Request associations ────────────────────────────────────────────
Request.belongsTo(User, { as: 'user',    foreignKey: 'userId' });
Request.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });
Request.belongsTo(User, { as: 'admin',   foreignKey: 'adminId' });
User.hasMany(Request, { as: 'requests', foreignKey: 'userId' });

// ── Request ↔ RequestLog associations ──────────────────────────────────────
Request.hasMany(RequestLog, {             // ✅ One request → many log entries
  as: 'logs',
  foreignKey: 'requestId',
  onDelete: 'CASCADE',
});
RequestLog.belongsTo(Request, {           // ✅ Each log entry → one request
  as: 'request',
  foreignKey: 'requestId',
});

// ── RequestLog ↔ User (changedBy) association ───────────────────────────────
RequestLog.belongsTo(User, {             // ✅ Bonus: lets you include the actor
  as: 'changedByUser',
  foreignKey: 'changedBy',
});

export default Request;