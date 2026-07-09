/**
 * @module modules/batches/batches.service
 * Batch management business logic for producers.
 */

import { db } from '../../database/connection.js';
import { generateId } from '../../utils/crypto.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, buildPaginationMeta, calculateOffset } from '@milkboy/shared';
import type { PaginationInput } from '@milkboy/shared';
import { scansService } from '../scans/scans.service.js';
import { createModuleLogger } from '../../utils/logger.js';

const log = createModuleLogger('batches-service');

export class BatchesService {
  /**
   * Create a new batch.
   */
  async create(userId: string, data: { name: string; description?: string }) {
    const batchId = generateId();

    await db('batches').insert({
      id: batchId,
      user_id: userId,
      name: data.name,
      description: data.description ?? null,
      status: 'created',
      scan_count: 0,
      completed_count: 0,
    });

    const batch = await db('batches').where('id', batchId).first();
    log.info(`Batch created: ${batchId} by user ${userId}`);
    return this.formatBatch(batch);
  }

  /**
   * List batches for a user.
   */
  async listByUser(userId: string, params: PaginationInput & { status?: string }) {
    let query = db('batches').where('user_id', userId);

    if (params.status) {
      query = query.where('status', params.status);
    }

    if (params.search) {
      query = query.where('name', 'like', `%${params.search}%`);
    }

    const countResult = (await query.clone().count('* as count')) as unknown as {
      count: string | number;
    }[];
    const total = Number(countResult[0]?.count ?? 0);

    const batches = await query
      .orderBy(params.sortBy ?? 'created_at', params.sortOrder ?? 'desc')
      .limit(params.limit)
      .offset(calculateOffset(params.page, params.limit));

    return {
      data: batches.map((b) => this.formatBatch(b)),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * Add scans to a batch.
   */
  async addScans(batchId: string, userId: string, scanIds: string[]) {
    // Verify batch ownership
    const batch = await db('batches').where({ id: batchId, user_id: userId }).first();
    if (!batch) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Batch not found.');
    }

    if (batch.status !== 'created') {
      throw AppError.badRequest(
        ERROR_CODES.RES_CONFLICT,
        'Cannot add scans to a batch that is processing or completed.',
      );
    }

    // Verify all scans belong to this user
    const scans = await db('scans').whereIn('id', scanIds).where('user_id', userId);
    if (scans.length !== scanIds.length) {
      throw AppError.badRequest(
        ERROR_CODES.VAL_INVALID_INPUT,
        'Some scans were not found or do not belong to you.',
      );
    }

    // Filter out scans already in a batch to avoid duplicates
    const existingMappings = await db('batch_scans')
      .where('batch_id', batchId)
      .whereIn('scan_id', scanIds)
      .select('scan_id');
    const existingScanIds = new Set(existingMappings.map((m) => m.scan_id));
    const newScanIds = scanIds.filter((id) => !existingScanIds.has(id));

    if (newScanIds.length > 0) {
      const mappings = newScanIds.map((scanId) => ({
        batch_id: batchId,
        scan_id: scanId,
      }));

      await db('batch_scans').insert(mappings);
      await db('batches').where('id', batchId).increment('scan_count', newScanIds.length);
    }

    log.info(`Added ${newScanIds.length} scans to batch ${batchId}`);
    return this.getById(batchId, userId);
  }

  /**
   * Get a batch by ID.
   */
  async getById(batchId: string, userId?: string) {
    let query = db('batches').where('id', batchId);
    if (userId) query = query.where('user_id', userId);

    const batch = await query.first();
    if (!batch) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Batch not found.');
    }

    // Get scans in this batch
    const scanMappings = await db('batch_scans').where('batch_id', batchId).select('scan_id');
    const scanIds = scanMappings.map((m) => m.scan_id);

    const scans = scanIds.length > 0 ? await db('scans').whereIn('id', scanIds) : [];

    return {
      batch: this.formatBatch(batch),
      scans: scans.map((s) => ({
        id: s.id,
        status: s.status,
        title: s.title,
        imageCount: s.image_count,
        createdAt: s.created_at,
      })),
    };
  }

  /**
   * Run analysis on all scans in the batch.
   */
  async analyzeBatch(batchId: string, userId: string) {
    const batch = await db('batches').where({ id: batchId, user_id: userId }).first();
    if (!batch) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Batch not found.');
    }

    if (batch.status === 'processing') {
      throw AppError.badRequest(
        ERROR_CODES.BATCH_ALREADY_PROCESSING,
        'Batch is already being processed.',
      );
    }

    // Get scans
    const scanMappings = await db('batch_scans').where('batch_id', batchId).select('scan_id');
    const scanIds = scanMappings.map((m) => m.scan_id);

    if (scanIds.length === 0) {
      throw AppError.badRequest(ERROR_CODES.VAL_MISSING_FIELD, 'Cannot analyze an empty batch.');
    }

    // Update status to processing
    await db('batches').where('id', batchId).update({
      status: 'processing',
      updated_at: new Date().toISOString(),
    });

    log.info(`Started processing batch ${batchId} with ${scanIds.length} scans`);

    // Process scans sequentially in the background/async or in loop for demo
    // In production, we'd queue these via BullMQ
    let completedCount = 0;
    const errors = [];

    for (const scanId of scanIds) {
      try {
        const scan = await db('scans').where('id', scanId).first();
        if (scan && scan.status !== 'completed' && scan.status !== 'failed') {
          await scansService.analyze(scanId, userId);
        }
        completedCount++;
        await db('batches').where('id', batchId).update({
          completed_count: completedCount,
        });
      } catch (error) {
        log.error(`Failed to analyze scan ${scanId} in batch ${batchId}`, { error });
        errors.push({
          scanId,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const finalStatus = completedCount === scanIds.length ? 'completed' : 'failed';
    await db('batches').where('id', batchId).update({
      status: finalStatus,
      completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    log.info(
      `Batch ${batchId} processing finished. Status: ${finalStatus}, errors: ${errors.length}`,
    );

    return {
      batchId,
      status: finalStatus,
      total: scanIds.length,
      completed: completedCount,
      failed: errors.length,
      errors,
    };
  }

  private formatBatch(row: Record<string, unknown>) {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description,
      status: row.status,
      scanCount: row.scan_count ?? 0,
      completedCount: row.completed_count ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      completedAt: row.completed_at,
    };
  }
}

export const batchesService = new BatchesService();
