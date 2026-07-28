/**
 * @module modules/lab/lab.service
 * Laboratory validation business logic for lab staff.
 */

import { db } from '../../database/connection.js';
import { generateId } from '../../utils/crypto.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, buildPaginationMeta, calculateOffset } from '@milkboy/shared';
import type { PaginationInput } from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';

const log = createModuleLogger('lab-service');

export class LabService {
  /**
   * List pending validation scans (status = completed, and not validated yet).
   */
  async getPending(params: PaginationInput) {
    // Scans that are completed but don't have a lab validation record yet
    const query = db('scans')
      .join('users', 'scans.user_id', 'users.id')
      .leftJoin('lab_validations', 'scans.id', 'lab_validations.scan_id')
      .where('scans.status', 'completed')
      .whereNull('lab_validations.id')
      .select(
        'scans.*',
        'users.email as user_email',
        'users.first_name as user_first_name',
        'users.last_name as user_last_name',
      );

    if (params.search) {
      query.where('scans.title', 'like', `%${params.search}%`);
    }

    const countResult = (await query.clone().count('* as count')) as unknown as {
      count: string | number;
    }[];
    const total = Number(countResult[0]?.count ?? 0);

    const scans = await query
      .orderBy('scans.created_at', 'asc') // Oldest first for queue
      .limit(params.limit)
      .offset(calculateOffset(params.page, params.limit));

    return {
      data: scans.map((s) => ({
        id: s.id,
        userId: s.user_id,
        userEmail: s.user_email,
        userName: `${s.user_first_name} ${s.user_last_name}`,
        title: s.title,
        notes: s.notes,
        imageCount: s.image_count,
        createdAt: s.created_at,
      })),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * Validate a scan.
   */
  async validate(
    scanId: string,
    labStaffId: string,
    data: {
      result: 'confirmed' | 'rejected' | 'inconclusive';
      notes?: string;
      parameters?: {
        fatContent?: number;
        proteinContent?: number;
        lactoseContent?: number;
        snf?: number;
        ph?: number;
        density?: number;
        temperature?: number;
        adulterants?: string[];
      };
    },
  ) {
    const scan = await db('scans').where('id', scanId).first();
    if (!scan) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Scan not found.');
    }

    const existing = await db('lab_validations').where('scan_id', scanId).first();
    if (existing) {
      throw AppError.conflict(ERROR_CODES.RES_CONFLICT, 'Scan has already been validated.');
    }

    const validationId = generateId();
    await db('lab_validations').insert({
      id: validationId,
      scan_id: scanId,
      lab_staff_id: labStaffId,
      result: data.result,
      notes: data.notes ?? null,
      parameters: data.parameters ? JSON.stringify(data.parameters) : null,
      validated_at: new Date().toISOString(),
    });

    log.info(`Scan ${scanId} validated as ${data.result} by lab staff ${labStaffId}`);

    const { notificationDispatcher } = await import('../../services/notifications/notificationDispatcher.js');
    const event = data.result === 'confirmed' ? 'lab:sample_approved' : data.result === 'rejected' ? 'lab:sample_rejected' : 'lab:verification_completed';
    notificationDispatcher.dispatch({
      event: event as any,
      userId: scan.user_id,
      title: `Laboratory Sample ${data.result.toUpperCase()}`,
      message: `Laboratory staff completed verification for scan '${scanId.substring(0, 8)}' with result: ${data.result}.`,
      data: { scanId, validationId, result: data.result },
    }).catch(() => {});

    // Fetch lab staff details for response
    const staff = await db('users').where('id', labStaffId).first();

    return {
      id: validationId,
      scanId,
      labStaffId,
      labStaffName: staff ? `${staff.first_name} ${staff.last_name}` : 'Unknown',
      result: data.result,
      notes: data.notes ?? null,
      parameters: data.parameters ?? null,
      validatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get validation history.
   */
  async getHistory(params: PaginationInput) {
    const query = db('lab_validations')
      .join('scans', 'lab_validations.scan_id', 'scans.id')
      .join('users as lab_staff', 'lab_validations.lab_staff_id', 'lab_staff.id')
      .select(
        'lab_validations.*',
        'scans.title as scan_title',
        'lab_staff.first_name as staff_first_name',
        'lab_staff.last_name as staff_last_name',
      );

    if (params.search) {
      query.where('scans.title', 'like', `%${params.search}%`);
    }

    const countResult = (await query.clone().count('* as count')) as unknown as {
      count: string | number;
    }[];
    const total = Number(countResult[0]?.count ?? 0);

    const history = await query
      .orderBy('lab_validations.validated_at', 'desc')
      .limit(params.limit)
      .offset(calculateOffset(params.page, params.limit));

    return {
      data: history.map((h) => ({
        id: h.id,
        scanId: h.scan_id,
        scanTitle: h.scan_title,
        labStaffId: h.lab_staff_id,
        labStaffName: `${h.staff_first_name} ${h.staff_last_name}`,
        result: h.result,
        notes: h.notes,
        parameters: h.parameters
          ? typeof h.parameters === 'string'
            ? JSON.parse(h.parameters)
            : h.parameters
          : null,
        validatedAt: h.validated_at,
      })),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * Compare AI predictions vs Lab validations.
   */
  async compareAiVsLab() {
    const validations = await db('lab_validations')
      .join('predictions', 'lab_validations.scan_id', 'predictions.scan_id')
      .select('lab_validations.result as lab_result', 'predictions.quality_label as ai_label');

    const total = validations.length;
    let matches = 0;
    let discrepancies = 0;
    const matrix: Record<string, Record<string, number>> = {};

    for (const v of validations) {
      const ai = String(v.ai_label);
      const lab = String(v.lab_result);

      if (!matrix[ai]) matrix[ai] = {};
      matrix[ai][lab] = (matrix[ai][lab] || 0) + 1;

      const isPositiveAi = ['excellent', 'good', 'acceptable'].includes(ai);
      const isPositiveLab = lab === 'confirmed';
      const isNegativeAi = ['poor', 'adulterated', 'spoiled'].includes(ai);
      const isNegativeLab = lab === 'rejected';

      if ((isPositiveAi && isPositiveLab) || (isNegativeAi && isNegativeLab)) {
        matches++;
      } else {
        discrepancies++;
      }
    }

    return {
      total,
      matches,
      discrepancies,
      accuracyRate: total > 0 ? matches / total : 1.0,
      discrepancyMatrix: matrix,
    };
  }
}

export const labService = new LabService();
