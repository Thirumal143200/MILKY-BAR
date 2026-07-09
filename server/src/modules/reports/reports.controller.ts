/**
 * @module modules/reports/reports.controller
 * Report generation and download handlers.
 */

import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../../middleware/auth.js';
import { pdfService } from '../../services/report/pdf.service.js';
import { db } from '../../database/connection.js';
import { sendSuccess, sendCreated } from '../../utils/response.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES } from '@milkboy/shared';
import path from 'node:path';
import fs from 'node:fs';

export class ReportsController {
  async generate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const scanId = String(req.params.scanId);

      // Verify scan exists and user owns it (or is admin)
      const scan = await db('scans').where('id', scanId).first();
      if (!scan) throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Scan not found.');

      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      if (scan.user_id !== req.user!.id && !isAdmin) {
        throw AppError.forbidden(
          ERROR_CODES.AUTHZ_RESOURCE_NOT_OWNED,
          'You can only generate reports for your own scans.',
        );
      }

      if (scan.status !== 'completed') {
        throw AppError.badRequest(
          ERROR_CODES.RPT_NOT_READY,
          'Scan must be completed before generating a report.',
        );
      }

      const result = await pdfService.generateReport(scanId);
      sendCreated(res, result, 'Report generated successfully.');
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await db('reports').where('id', String(req.params.id)).first();
      if (!report) throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Report not found.');

      // Verify ownership
      const scan = await db('scans').where('id', report.scan_id).first();
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      if (scan && scan.user_id !== req.user!.id && !isAdmin) {
        throw AppError.forbidden(ERROR_CODES.AUTHZ_RESOURCE_NOT_OWNED, 'Access denied.');
      }

      const qr = await db('report_qr_codes').where('report_id', report.id).first();

      sendSuccess(res, {
        id: report.id,
        scanId: report.scan_id,
        filePath: report.file_path,
        fileSize: report.file_size,
        qrCodeUrl: qr?.qr_data ?? null,
        generatedAt: report.generated_at,
      });
    } catch (error) {
      next(error);
    }
  }

  async download(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await db('reports').where('id', String(req.params.id)).first();
      if (!report) throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Report not found.');

      // Verify ownership
      const scan = await db('scans').where('id', report.scan_id).first();
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      if (scan && scan.user_id !== req.user!.id && !isAdmin) {
        throw AppError.forbidden(ERROR_CODES.AUTHZ_RESOURCE_NOT_OWNED, 'Access denied.');
      }

      if (!fs.existsSync(report.file_path)) {
        throw AppError.notFound(ERROR_CODES.RPT_NOT_READY, 'Report file not found on disk.');
      }

      const fileName = path.basename(report.file_path);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      fs.createReadStream(report.file_path).pipe(res);
    } catch (error) {
      next(error);
    }
  }

  async getQrCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const qr = await db('report_qr_codes').where('report_id', String(req.params.id)).first();
      if (!qr) throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'QR code not found.');

      if (!fs.existsSync(qr.qr_image_path)) {
        throw AppError.notFound(ERROR_CODES.RPT_QR_GENERATION_FAILED, 'QR code image not found.');
      }

      res.setHeader('Content-Type', 'image/png');
      fs.createReadStream(qr.qr_image_path).pipe(res);
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
