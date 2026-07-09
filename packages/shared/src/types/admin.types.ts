/**
 * @module @milkboy/shared/types/admin
 * Admin, settings, audit, and system type definitions.
 */

/** Audit log action types */
export type AuditAction =
  | 'login'
  | 'logout'
  | 'register'
  | 'password_reset'
  | 'mfa_setup'
  | 'user_create'
  | 'user_update'
  | 'user_delete'
  | 'user_suspend'
  | 'scan_create'
  | 'scan_delete'
  | 'image_upload'
  | 'prediction_run'
  | 'report_generate'
  | 'report_download'
  | 'batch_create'
  | 'batch_analyze'
  | 'model_upload'
  | 'model_update'
  | 'model_rollback'
  | 'settings_update'
  | 'feature_flag_toggle'
  | 'backup_create'
  | 'backup_restore'
  | 'feedback_create'
  | 'feedback_update'
  | 'lab_validate';

/** Audit log entry */
export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

/** System setting */
export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: SettingCategory;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

export type SettingCategory =
  'general' | 'security' | 'ai' | 'email' | 'storage' | 'notifications' | 'maintenance';

/** Feature flag */
export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  updatedBy?: string;
  updatedAt: string;
}

/** AI model */
export interface AIModel {
  id: string;
  name: string;
  description: string;
  type: 'classification' | 'detection' | 'segmentation';
  createdAt: string;
}

/** AI model version */
export interface AIModelVersion {
  id: string;
  modelId: string;
  version: string;
  filePath: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  isActive: boolean;
  isDefault: boolean;
  changelog?: string;
  createdAt: string;
}

/** Backup log entry */
export interface BackupLog {
  id: string;
  type: 'full' | 'incremental' | 'differential';
  filePath: string;
  fileSize: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  errorMessage?: string;
  createdAt: string;
  completedAt?: string;
}

/** System health status */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  version: string;
  services: {
    database: ServiceHealth;
    cache: ServiceHealth;
    aiModel: ServiceHealth;
    storage: ServiceHealth;
    queue: ServiceHealth;
  };
  metrics: {
    totalUsers: number;
    totalScans: number;
    scansToday: number;
    avgProcessingTime: number;
    storageUsed: number;
  };
}

export interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  latencyMs?: number;
  message?: string;
}

/** Dashboard analytics */
export interface DashboardAnalytics {
  period: 'day' | 'week' | 'month' | 'year';
  scansOverTime: TimeSeriesData[];
  qualityDistribution: Record<string, number>;
  userGrowth: TimeSeriesData[];
  topProducers: ProducerStat[];
  modelAccuracy: number;
  avgConfidence: number;
  rejectionRate: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface ProducerStat {
  userId: string;
  name: string;
  scanCount: number;
  avgQuality: number;
}

/** Notification */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export type NotificationType =
  | 'scan_complete'
  | 'scan_failed'
  | 'report_ready'
  | 'batch_complete'
  | 'lab_validated'
  | 'system_alert'
  | 'account_update'
  | 'model_update';

/** Feedback / bug report */
export interface Feedback {
  id: string;
  userId: string;
  type: 'feedback' | 'bug_report' | 'feature_request';
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

/** Batch testing */
export interface Batch {
  id: string;
  userId: string;
  name: string;
  description?: string;
  status: 'created' | 'processing' | 'completed' | 'failed';
  scanCount: number;
  completedCount: number;
  createdAt: string;
  completedAt?: string;
}

/** Laboratory validation */
export interface LabValidation {
  id: string;
  scanId: string;
  labStaffId: string;
  labStaffName: string;
  result: 'confirmed' | 'rejected' | 'inconclusive';
  notes?: string;
  parameters?: LabParameters;
  validatedAt: string;
}

export interface LabParameters {
  fatContent?: number;
  proteinContent?: number;
  lactoseContent?: number;
  snf?: number; // Solids Not Fat
  ph?: number;
  density?: number;
  temperature?: number;
  adulterants?: string[];
}

/** Data retention policy */
export interface DataRetentionPolicy {
  id: string;
  resource: string;
  retentionDays: number;
  action: 'archive' | 'delete' | 'anonymize';
  isActive: boolean;
  updatedAt: string;
}

/** Permission definition */
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  description: string;
}

/** Role with permissions */
export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  createdAt: string;
}
