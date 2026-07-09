/**
 * @module modules/scans/scans.service
 * Scan management business logic.
 */

import { db } from '../../database/connection.js';
import { generateId } from '../../utils/crypto.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, buildPaginationMeta, calculateOffset } from '@milkboy/shared';
import type { PaginationInput } from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';
import { imageProcessor } from '../../services/image/processor.service.js';
import { inferenceService } from '../../services/ai/inference.service.js';

const log = createModuleLogger('scans-service');

export class ScansService {
  /**
   * Add an image to a scan.
   */
  async addImage(
    scanId: string,
    userId: string,
    file: { path: string; originalname: string; mimetype: string; size: number },
  ) {
    // Verify scan ownership
    const scan = await db('scans').where({ id: scanId, user_id: userId }).first();
    if (!scan) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Scan not found.');
    }

    if (scan.status === 'completed' || scan.status === 'analyzing') {
      throw AppError.badRequest(
        ERROR_CODES.RES_CONFLICT,
        'Cannot add images to a completed or analyzing scan.',
      );
    }

    // Process image
    const processed = await imageProcessor.processImage(file.path, scanId);

    // Save image record
    const imageId = generateId();
    await db('scan_images').insert({
      id: imageId,
      scan_id: scanId,
      original_path: file.path,
      processed_path: processed.processedPath,
      thumbnail_path: processed.thumbnailPath,
      original_filename: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      width: processed.width,
      height: processed.height,
      quality_score: processed.qualityCheck.overallScore,
      quality_status: processed.qualityCheck.passed ? 'passed' : 'rejected',
    });

    // Save quality checks
    await imageProcessor.saveQualityCheck(imageId, processed.qualityCheck);

    // Update scan image count
    await db('scans').where('id', scanId).increment('image_count', 1);

    log.info(`Image ${imageId} added to scan ${scanId}`);

    return {
      imageId,
      qualityCheck: processed.qualityCheck,
    };
  }

  /**
   * Run AI analysis on the scan.
   */
  async analyze(scanId: string, userId: string) {
    const scan = await db('scans').where({ id: scanId, user_id: userId }).first();
    if (!scan) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Scan not found.');
    }

    const images = await db('scan_images').where('scan_id', scanId);
    if (images.length === 0) {
      throw AppError.badRequest(
        ERROR_CODES.VAL_MISSING_FIELD,
        'Cannot analyze scan without images.',
      );
    }

    // Update status to analyzing
    await this.updateStatus(scanId, 'analyzing');

    const predictions = [];
    let hasPassedImages = false;

    for (const image of images) {
      // Check if image quality checks passed
      const qualityCheck = await db('image_quality_checks').where('image_id', image.id).first();
      if (!qualityCheck || !qualityCheck.passed) {
        continue;
      }

      hasPassedImages = true;

      // Predict quality
      const predictionResult = await inferenceService.predict(image.processed_path);

      // Save prediction
      const predictionId = await inferenceService.savePrediction(
        scanId,
        image.id,
        predictionResult,
      );
      predictions.push({
        id: predictionId,
        imageId: image.id,
        ...predictionResult,
      });
    }

    if (!hasPassedImages) {
      await this.updateStatus(scanId, 'rejected');
      throw AppError.badRequest(
        ERROR_CODES.IMG_QUALITY_TOO_LOW,
        'All uploaded images failed quality checks. Please retake the images following the guidelines.',
      );
    }

    // Set final status
    await this.updateStatus(scanId, 'completed');

    log.info(`Scan ${scanId} analyzed successfully. Status: completed`);

    return predictions;
  }
  /**
   * Create a new scan.
   */
  async create(
    userId: string,
    data: {
      title?: string;
      notes?: string;
      location?: { latitude?: number; longitude?: number; address?: string };
    },
  ) {
    const scanId = generateId();

    await db('scans').insert({
      id: scanId,
      user_id: userId,
      status: 'created',
      title: data.title ?? null,
      notes: data.notes ?? null,
      latitude: data.location?.latitude ?? null,
      longitude: data.location?.longitude ?? null,
      address: data.location?.address ?? null,
    });

    const scan = await db('scans').where('id', scanId).first();
    log.info(`Scan created: ${scanId} by user ${userId}`);

    return this.formatScan(scan);
  }

  /**
   * List scans for a user with pagination.
   */
  async listByUser(
    userId: string,
    params: PaginationInput & { status?: string; qualityLabel?: string },
  ) {
    let query = db('scans')
      .leftJoin('predictions', 'scans.id', 'predictions.scan_id')
      .where('scans.user_id', userId);

    if (params.status) {
      query = query.where('scans.status', params.status);
    }

    if (params.search) {
      query = query.where((builder) => {
        builder
          .where('scans.title', 'like', `%${params.search}%`)
          .orWhere('scans.notes', 'like', `%${params.search}%`);
      });
    }

    // Count total
    const countResult = (await query.clone().count('scans.id as count')) as unknown as {
      count: string | number;
    }[];
    const total = Number(countResult[0]?.count ?? 0);

    // Fetch paginated results
    const scans = await query
      .select('scans.*', 'predictions.quality_label', 'predictions.confidence')
      .orderBy(`scans.${params.sortBy ?? 'created_at'}`, params.sortOrder ?? 'desc')
      .limit(params.limit)
      .offset(calculateOffset(params.page, params.limit));

    return {
      data: scans.map((s: Record<string, unknown>) => this.formatScan(s)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * List all scans (admin view).
   */
  async listAll(params: PaginationInput & { status?: string; userId?: string }) {
    let query = db('scans')
      .join('users', 'scans.user_id', 'users.id')
      .select(
        'scans.*',
        'users.email as user_email',
        'users.first_name as user_first_name',
        'users.last_name as user_last_name',
      );

    if (params.status) query = query.where('scans.status', params.status);
    if (params.userId) query = query.where('scans.user_id', params.userId);

    if (params.search) {
      query = query.where((builder) => {
        builder
          .where('scans.title', 'like', `%${params.search}%`)
          .orWhere('users.email', 'like', `%${params.search}%`);
      });
    }

    const countResult = (await query.clone().count('* as count')) as unknown as {
      count: string | number;
    }[];
    const total = Number(countResult[0]?.count ?? 0);

    const scans = await query
      .orderBy(`scans.${params.sortBy ?? 'created_at'}`, params.sortOrder ?? 'desc')
      .limit(params.limit)
      .offset(calculateOffset(params.page, params.limit));

    return {
      data: scans.map((s: Record<string, unknown>) => ({
        ...this.formatScan(s),
        userEmail: s.user_email,
        userName: `${s.user_first_name} ${s.user_last_name}`,
      })),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * Get a single scan with all related data.
   */
  async getById(scanId: string, userId?: string) {
    let query = db('scans').where('scans.id', scanId);
    if (userId) query = query.where('scans.user_id', userId);

    const scan = await query.first();
    if (!scan) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Scan not found.');
    }

    // Get images
    const images = await db('scan_images').where('scan_id', scanId);

    // Get quality checks
    const imageIds = images.map((i: Record<string, unknown>) => String(i.id));
    const qualityChecks =
      imageIds.length > 0 ? await db('image_quality_checks').whereIn('image_id', imageIds) : [];

    // Get predictions
    const predictions = await db('predictions').where('scan_id', scanId);

    // Get report
    const report = await db('reports').where('scan_id', scanId).first();

    return {
      scan: this.formatScan(scan),
      images: images.map((i: Record<string, unknown>) => this.formatImage(i)),
      qualityChecks,
      predictions: predictions.map((p: Record<string, unknown>) => this.formatPrediction(p)),
      report: report ? this.formatReport(report) : null,
    };
  }

  /**
   * Delete a scan and all related data.
   */
  async delete(scanId: string, userId?: string) {
    let query = db('scans').where('id', scanId);
    if (userId) query = query.where('user_id', userId);

    const scan = await query.first();
    if (!scan) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Scan not found.');
    }

    await db('scans').where('id', scanId).delete();
    log.info(`Scan deleted: ${scanId}`);
  }

  /**
   * Update scan status.
   */
  async updateStatus(scanId: string, status: string) {
    const updates: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    await db('scans').where('id', scanId).update(updates);
  }

  // ─── Formatters ─────────────────────────────────────────

  private formatScan(row: Record<string, unknown>) {
    return {
      id: row.id,
      userId: row.user_id,
      status: row.status,
      title: row.title,
      notes: row.notes,
      location: row.latitude
        ? {
            latitude: Number(row.latitude),
            longitude: Number(row.longitude),
            address: row.address,
          }
        : undefined,
      imageCount: row.image_count ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
      qualityLabel: row.quality_label,
      confidence: row.confidence ? Number(row.confidence) : undefined,
    };
  }

  private formatImage(row: Record<string, unknown>) {
    return {
      id: row.id,
      scanId: row.scan_id,
      originalPath: row.original_path,
      processedPath: row.processed_path,
      thumbnailPath: row.thumbnail_path,
      originalFilename: row.original_filename,
      mimeType: row.mime_type,
      fileSize: row.file_size,
      width: row.width,
      height: row.height,
      qualityScore: row.quality_score ? Number(row.quality_score) : undefined,
      qualityStatus: row.quality_status,
      createdAt: row.created_at,
    };
  }

  private formatPrediction(row: Record<string, unknown>) {
    return {
      id: row.id,
      scanId: row.scan_id,
      imageId: row.image_id,
      modelVersionId: row.model_version_id,
      qualityLabel: row.quality_label,
      confidence: Number(row.confidence),
      explanation: row.explanation,
      rawScores:
        typeof row.raw_scores === 'string' ? JSON.parse(row.raw_scores as string) : row.raw_scores,
      processingTimeMs: row.processing_time_ms,
      createdAt: row.created_at,
    };
  }

  private formatReport(row: Record<string, unknown>) {
    return {
      id: row.id,
      scanId: row.scan_id,
      filePath: row.file_path,
      fileSize: row.file_size,
      generatedAt: row.generated_at,
    };
  }
}

export const scansService = new ScansService();
