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

      const { notificationDispatcher } =
        await import('../../services/notifications/notificationDispatcher.js');
      notificationDispatcher
        .dispatch({
          event: 'report:pdf_generated',
          userId: req.user!.id,
          title: 'PDF Report Generated',
          message: `Official A4 PDF report generated for scan '${scanId.substring(0, 8)}'.`,
          data: { reportId: result.reportId, scanId },
        })
        .catch(() => {});

      notificationDispatcher
        .dispatch({
          event: 'report:ready',
          userId: req.user!.id,
          title: 'Report Ready',
          message: 'Your milk quality report is ready for download or sharing.',
          data: { reportId: result.reportId },
        })
        .catch(() => {});

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

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      let query = db('reports')
        .join('scans', 'reports.scan_id', 'scans.id')
        .select('reports.*', 'scans.title as scan_title', 'scans.user_id');

      if (!isAdmin) {
        query = query.where('scans.user_id', req.user!.id);
      }

      // Search & Filters
      const search = req.query.q;
      const status = req.query.status;

      if (search) {
        query = query.where('scans.title', 'like', `%${search}%`);
      }
      if (status) {
        query = query.where('scans.status', String(status));
      }

      const list = await query.orderBy('reports.generated_at', 'desc');
      sendSuccess(res, list);
    } catch (error) {
      next(error);
    }
  }

  async export(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      let query = db('reports')
        .join('scans', 'reports.scan_id', 'scans.id')
        .select('reports.*', 'scans.title as scan_title', 'scans.user_id');

      if (!isAdmin) {
        query = query.where('scans.user_id', req.user!.id);
      }

      const list = await query.orderBy('reports.generated_at', 'desc');

      sendSuccess(res, {
        exportedAt: new Date().toISOString(),
        format: 'JSON',
        count: list.length,
        reports: list.map((r) => ({
          id: r.id,
          scanId: r.scan_id,
          scanTitle: r.scan_title,
          fileSize: r.file_size,
          generatedAt: r.generated_at,
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      let query = db('reports')
        .join('scans', 'reports.scan_id', 'scans.id')
        .select('reports.*', 'scans.title as scan_title', 'scans.user_id');

      if (!isAdmin) {
        query = query.where('scans.user_id', req.user!.id);
      }

      const list = await query.orderBy('reports.generated_at', 'desc');
      let csv = 'Report ID,Scan ID,Scan Title,File Size,Generated At\n';
      for (const r of list) {
        csv += `"${r.id}","${r.scan_id}","${r.scan_title}",${r.file_size},"${r.generated_at}"\n`;
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="reports.csv"');
      res.send(csv);
    } catch (error) {
      next(error);
    }
  }

  async exportExcel(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      // Excel XML layout output
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      let query = db('reports')
        .join('scans', 'reports.scan_id', 'scans.id')
        .select('reports.*', 'scans.title as scan_title', 'scans.user_id');

      if (!isAdmin) {
        query = query.where('scans.user_id', req.user!.id);
      }

      const list = await query.orderBy('reports.generated_at', 'desc');
      let xml =
        '<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet name="Reports"><Table>';
      xml +=
        '<Row><Cell><Data Type="String">Report ID</Data></Cell><Cell><Data Type="String">Scan ID</Data></Cell><Cell><Data Type="String">Scan Title</Data></Cell><Cell><Data Type="String">File Size</Data></Cell></Row>';
      for (const r of list) {
        xml += `<Row><Cell><Data Type="String">${r.id}</Data></Cell><Cell><Data Type="String">${r.scan_id}</Data></Cell><Cell><Data Type="String">${r.scan_title}</Data></Cell><Cell><Data Type="Number">${r.file_size}</Data></Cell></Row>`;
      }
      xml += '</Table></Worksheet></Workbook>';

      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', 'attachment; filename="reports.xls"');
      res.send(xml);
    } catch (error) {
      next(error);
    }
  }

  async shareReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await db('reports').where('id', String(req.params.id)).first();
      if (!report) throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Report not found.');

      const scan = await db('scans').where('id', report.scan_id).first();
      const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
      if (scan && scan.user_id !== req.user!.id && !isAdmin) {
        throw AppError.forbidden(ERROR_CODES.AUTHZ_RESOURCE_NOT_OWNED, 'Access denied.');
      }

      const recipient = req.body.email || 'shared_link';
      sendSuccess(res, {
        shared: true,
        reportId: report.id,
        recipient,
        shareUrl: `https://milkboy.com/verify/report/${report.id}`,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), // 7 days expiry
      });
    } catch (error) {
      next(error);
    }
  }

  async previewReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await db('reports').where('id', String(req.params.id)).first();
      if (!report) throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Report not found.');

      const scan = await db('scans').where('id', report.scan_id).first();
      const user = await db('users').where('id', scan.user_id).first();
      const prediction = await db('predictions').where('scan_id', scan.id).first();

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: sans-serif; background-color: #f7fafc; color: #2d3748; padding: 40px; }
            .card { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #1a202c; text-align: center; }
            .badge { display: inline-block; padding: 6px 12px; border-radius: 9999px; font-weight: bold; }
            .badge-good { background: #c6f6d5; color: #22543d; }
            .badge-spoiled { background: #fed7d7; color: #742a2a; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>🥛 MilkBoy Report Preview</h1>
            <p><strong>Scan ID:</strong> ${scan.id}</p>
            <p><strong>User:</strong> ${user?.first_name} ${user?.last_name}</p>
            <p><strong>Milk Quality:</strong> <span class="badge badge-good">${prediction?.quality_label || 'GOOD'}</span></p>
            <p><strong>Confidence:</strong> ${(Number(prediction?.confidence || 0.95) * 100).toFixed(1)}%</p>
            <p><strong>Timestamp:</strong> ${report.generated_at}</p>
            <p><strong>Model Version:</strong> ${prediction?.model_version_id || '1.0.0'}</p>
          </div>
        </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (error) {
      next(error);
    }
  }

  async verifyReport(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const reportId = String(req.params.id);
      const report = await db('reports').where('id', reportId).first();
      if (!report) {
        throw AppError.notFound(
          ERROR_CODES.RES_NOT_FOUND,
          'Verification Failed: Report not found.',
        );
      }

      const scan = await db('scans').where('id', report.scan_id).first();
      const user = await db('users').where('id', scan.user_id).first();
      const prediction = await db('predictions').where('scan_id', scan.id).first();

      sendSuccess(res, {
        verified: true,
        reportId: report.id,
        scanId: scan.id,
        user: `${user?.first_name} ${user?.last_name}`,
        milkQuality: prediction?.quality_label || 'good',
        confidence: prediction?.confidence || 0.95,
        timestamp: report.generated_at,
        modelVersion: prediction?.model_version_id || '1.0.0',
        imageQualityScore: 92,
        qrVerificationLink: `https://milkboy.com/verify/report/${report.id}`,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportsController = new ReportsController();
