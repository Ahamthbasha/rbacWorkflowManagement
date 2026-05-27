// models/requestLogModel.ts
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../config/database";

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  STATUS_CHANGE = 'status_change',
  CLARIFICATION_REQUESTED = 'clarification_requested',
  CLARIFICATION_RESPONDED = 'clarification_responded',
  EDITED = 'edited',
  RESUBMITTED = 'resubmitted',
  REOPENED = 'reopened'
}

interface RequestLogAttributes {
  id: string;
  requestId: string;
  oldStatus: string | null;
  newStatus: string | null;
  changedBy: string;
  role: string;
  action: ActionType;
  comments: string | null;
  timestamp: Date;
}

interface RequestLogCreationAttributes extends Optional<RequestLogAttributes, 'id' | 'timestamp'> {}

class RequestLog extends Model<RequestLogAttributes, RequestLogCreationAttributes> implements RequestLogAttributes {
  public id!: string;
  public requestId!: string;
  public oldStatus!: string | null;
  public newStatus!: string | null;
  public changedBy!: string;
  public role!: string;
  public action!: ActionType;
  public comments!: string | null;
  public timestamp!: Date;
}

RequestLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    requestId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'requests',
        key: 'id',
      },
    },
    oldStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    newStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    changedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    action: {
      type: DataTypes.ENUM(...Object.values(ActionType)),
      allowNull: false,
    },
    comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "RequestLog",
    tableName: "request_logs",
    timestamps: false,
  }
);

export default RequestLog;