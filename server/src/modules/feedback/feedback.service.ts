/**
 * @module modules/feedback/feedback.service
 * User feedback, bug reports, and feature requests business logic.
 */

import { db } from '../../database/connection.js';
import { generateId } from '../../utils/crypto.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES, buildPaginationMeta, calculateOffset } from '@milkboy/shared';
import type { PaginationInput } from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';

const log = createModuleLogger('feedback-service');

export class FeedbackService {
  /**
   * Submit new feedback or bug report.
   */
  async create(
    userId: string,
    data: { type: string; subject: string; message: string; priority?: string },
  ) {
    const feedbackId = generateId();

    const newFeedback = {
      id: feedbackId,
      user_id: userId,
      type: data.type,
      subject: data.subject,
      message: data.message,
      status: 'open',
      priority: data.priority ?? 'medium',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await db('feedback').insert(newFeedback);
    log.info(`Feedback ${feedbackId} submitted by user ${userId}`);

    return newFeedback;
  }

  /**
   * List feedback (admin/support view).
   */
  async list(params: PaginationInput & { type?: string; status?: string }) {
    let query = db('feedback')
      .join('users', 'feedback.user_id', 'users.id')
      .select(
        'feedback.*',
        'users.email as user_email',
        'users.first_name as user_first_name',
        'users.last_name as user_last_name',
      );

    if (params.type) {
      query = query.where('feedback.type', params.type);
    }
    if (params.status) {
      query = query.where('feedback.status', params.status);
    }

    if (params.search) {
      query = query.where((builder) => {
        builder
          .where('feedback.subject', 'like', `%${params.search}%`)
          .orWhere('users.email', 'like', `%${params.search}%`);
      });
    }

    const countResult = (await query.clone().count('* as count')) as unknown as {
      count: string | number;
    }[];
    const total = Number(countResult[0]?.count ?? 0);

    const feedbackList = await query
      .orderBy('feedback.created_at', 'desc')
      .limit(params.limit)
      .offset(calculateOffset(params.page, params.limit));

    return {
      data: feedbackList.map((f) => ({
        id: f.id,
        userId: f.user_id,
        userEmail: f.user_email,
        userName: `${f.user_first_name} ${f.user_last_name}`,
        type: f.type,
        subject: f.subject,
        message: f.message,
        status: f.status,
        priority: f.priority,
        createdAt: f.created_at,
        updatedAt: f.updated_at,
      })),
      meta: buildPaginationMeta(total, params.page, params.limit),
    };
  }

  /**
   * Update feedback status.
   */
  async updateStatus(feedbackId: string, status: string) {
    const updated = await db('feedback').where('id', feedbackId).update({
      status,
      updated_at: new Date().toISOString(),
    });

    if (!updated) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Feedback not found.');
    }

    log.info(`Feedback ${feedbackId} status updated to ${status}`);
  }
}

export const feedbackService = new FeedbackService();
