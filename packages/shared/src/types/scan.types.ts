/**
 * @module @milkboy/shared/types/scan
 * Scan, image, and prediction type definitions.
 */

/** Scan status lifecycle */
export type ScanStatus =
  'created' | 'uploading' | 'preprocessing' | 'analyzing' | 'completed' | 'failed' | 'rejected';

/** Milk quality classification labels */
export type QualityLabel =
  'excellent' | 'good' | 'acceptable' | 'poor' | 'adulterated' | 'spoiled' | 'inconclusive';

/** Image quality status */
export type ImageQualityStatus = 'passed' | 'warning' | 'rejected';

/** A single milk quality scan */
export interface Scan {
  id: string;
  userId: string;
  status: ScanStatus;
  title?: string;
  notes?: string;
  location?: ScanLocation;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/** Location data for a scan */
export interface ScanLocation {
  latitude?: number;
  longitude?: number;
  address?: string;
}

/** Image attached to a scan */
export interface ScanImage {
  id: string;
  scanId: string;
  originalPath: string;
  processedPath?: string;
  thumbnailPath?: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  qualityScore?: number;
  qualityStatus: ImageQualityStatus;
  createdAt: string;
}

/** Image quality check results */
export interface ImageQualityCheck {
  id: string;
  imageId: string;
  blurScore: number;
  lightingScore: number;
  focusScore: number;
  reflectionDetected: boolean;
  perspectiveOk: boolean;
  whiteBalanceOk: boolean;
  noiseLevel: number;
  overallScore: number;
  passed: boolean;
  rejectionReasons: string[];
  suggestions: string[];
}

/** AI prediction result */
export interface Prediction {
  id: string;
  scanId: string;
  imageId: string;
  modelVersionId: string;
  qualityLabel: QualityLabel;
  confidence: number;
  explanation: string;
  rawScores: Record<QualityLabel, number>;
  processingTimeMs: number;
  createdAt: string;
}

/** Detailed scan result combining scan, images, and predictions */
export interface ScanResult {
  scan: Scan;
  images: ScanImage[];
  qualityChecks: ImageQualityCheck[];
  predictions: Prediction[];
  report?: ReportSummary;
}

/** Report summary (without file content) */
export interface ReportSummary {
  id: string;
  scanId: string;
  filePath: string;
  fileSize: number;
  qrCodeUrl?: string;
  generatedAt: string;
}

/** Offline scan item submitted in a batch sync request */
export interface BatchSyncItem {
  clientScanId: string;
  timestamp: number;
  title?: string;
  notes?: string;
  location?: ScanLocation;
  imageData?: {
    filename: string;
    mimeType: string;
    base64Data?: string;
    size?: number;
  };
}

/** Payload for POST /api/v1/scans/batch-sync */
export interface BatchSyncPayload {
  scans: BatchSyncItem[];
}

/** Result for a single item in a batch sync response */
export interface BatchSyncResultItem {
  clientScanId: string;
  serverId?: string;
  status: 'synced' | 'duplicate' | 'failed';
  error?: string;
  scanResult?: ScanResult;
}

/** Response for POST /api/v1/scans/batch-sync */
export interface BatchSyncResponse {
  syncedCount: number;
  duplicateCount: number;
  failedCount: number;
  totalProcessed: number;
  results: BatchSyncResultItem[];
}

