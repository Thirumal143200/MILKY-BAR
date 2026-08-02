/**
 * @module services/report/pdf.service
 * PDF report generation using PDFKit with QR code embedding.
 */

import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'node:fs';
import path from 'node:path';
import { config } from '../../config/env.js';
import { db } from '../../database/connection.js';
import { generateId } from '../../utils/crypto.js';
import { createModuleLogger } from '../../utils/logger.js';
import { formatFileSize, getQualityColor, getConfidenceLevel } from '@milkboy/shared';

const log = createModuleLogger('pdf-service');

export class PdfService {
  /**
   * Generate a PDF report for a completed scan.
   */
  async generateReport(
    scanId: string,
  ): Promise<{ reportId: string; filePath: string; qrCodePath: string }> {
    // Fetch all scan data
    const scan = await db('scans').where('id', scanId).first();
    if (!scan) throw new Error(`Scan not found: ${scanId}`);

    const images = await db('scan_images').where('scan_id', scanId);
    const predictions = await db('predictions').where('scan_id', scanId);
    const user = await db('users').where('id', scan.user_id).first();

    // Setup output paths
    const reportDir = path.join(config.storage.localPath, 'reports', scanId);
    if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

    const reportId = generateId();
    const pdfFileName = `report-${scanId.substring(0, 8)}.pdf`;
    const pdfPath = path.join(reportDir, pdfFileName);
    const qrCodePath = path.join(reportDir, `qr-${scanId.substring(0, 8)}.png`);

    // Generate QR code
    const reportUrl = `${config.appUrl}/reports/${reportId}`;
    await QRCode.toFile(qrCodePath, reportUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });

    // Generate PDF
    await this.buildPdf(pdfPath, {
      scan,
      images,
      predictions,
      user,
      qrCodePath,
      reportId,
      reportUrl,
    });

    // Get file size
    const stats = fs.statSync(pdfPath);

    // Save to database
    await db('reports').insert({
      id: reportId,
      scan_id: scanId,
      file_path: pdfPath,
      file_size: stats.size,
    });

    await db('report_qr_codes').insert({
      id: generateId(),
      report_id: reportId,
      qr_data: reportUrl,
      qr_image_path: qrCodePath,
    });

    log.info(`Report generated: ${reportId} (${formatFileSize(stats.size)})`);

    return { reportId, filePath: pdfPath, qrCodePath };
  }

  /**
   * Build the PDF document.
   */
  private async buildPdf(
    outputPath: string,
    data: {
      scan: Record<string, unknown>;
      images: Record<string, unknown>[];
      predictions: Record<string, unknown>[];
      user: Record<string, unknown>;
      qrCodePath: string;
      reportId: string;
      reportUrl: string;
    },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `MIRA Quality Report - ${data.scan.id}`,
          Author: 'MIRA AI Quality Detection',
          Subject: 'Milk Quality Analysis Report',
          Creator: 'MIRA v1.0.0',
        },
      });

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      const pageWidth = doc.page.width - 100; // Subtract margins

      // ─── Header ───────────────────────────────────────
      doc
        .fontSize(24)
        .fillColor('#1a1a2e')
        .text('🥛 MIRA', { align: 'center' })
        .fontSize(14)
        .fillColor('#4a4a6a')
        .text('Milk Quality Analysis Report', { align: 'center' })
        .moveDown(0.5);

      // Divider
      doc
        .strokeColor('#e0e0e0')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(50 + pageWidth, doc.y)
        .stroke()
        .moveDown();

      // ─── Report Info ──────────────────────────────────
      doc
        .fontSize(10)
        .fillColor('#666')
        .text(`Report ID: ${data.reportId}`, { align: 'left' })
        .text(`Scan ID: ${String(data.scan.id).substring(0, 8)}...`, { align: 'left' })
        .text(`Generated: ${new Date().toLocaleString()}`, { align: 'left' })
        .text(`Analyst: ${data.user.first_name} ${data.user.last_name}`, { align: 'left' })
        .moveDown();

      // ─── Quality Summary ──────────────────────────────
      if (data.predictions.length > 0) {
        const mainPrediction = data.predictions[0]!;
        const label = String(mainPrediction.quality_label).toUpperCase();
        const confidence = Number(mainPrediction.confidence) * 100;
        const confLevel = getConfidenceLevel(Number(mainPrediction.confidence));

        doc
          .fontSize(18)
          .fillColor('#1a1a2e')
          .text('Quality Assessment', { underline: true })
          .moveDown(0.5);

        doc
          .fontSize(28)
          .fillColor(getQualityColor(String(mainPrediction.quality_label)))
          .text(label, { align: 'center' })
          .moveDown(0.3);

        doc
          .fontSize(14)
          .fillColor(confLevel.color)
          .text(`${confLevel.label}: ${confidence.toFixed(1)}%`, { align: 'center' })
          .moveDown();

        // Explanation
        if (mainPrediction.explanation) {
          doc
            .fontSize(11)
            .fillColor('#333')
            .text('Analysis Details:', { underline: true })
            .moveDown(0.3)
            .fontSize(10)
            .fillColor('#555')
            .text(String(mainPrediction.explanation).replace(/\*\*/g, ''), {
              width: pageWidth,
              align: 'justify',
            })
            .moveDown();
        }

        // Score breakdown
        doc
          .fontSize(11)
          .fillColor('#333')
          .text('Score Breakdown:', { underline: true })
          .moveDown(0.3);

        let rawScores: Record<string, number> = {};
        try {
          rawScores =
            typeof mainPrediction.raw_scores === 'string'
              ? JSON.parse(mainPrediction.raw_scores as string)
              : (mainPrediction.raw_scores as Record<string, number>);
        } catch {
          // ignore parse errors
        }

        if (rawScores && typeof rawScores === 'object') {
          for (const [scoreLabel, scoreValue] of Object.entries(rawScores)) {
            const pct = (Number(scoreValue) * 100).toFixed(1);
            const barWidth = Math.max(0, Math.min(Number(scoreValue) * 200, 200));

            doc
              .fontSize(9)
              .fillColor('#555')
              .text(
                `${scoreLabel.charAt(0).toUpperCase() + scoreLabel.slice(1)}: ${pct}%`,
                50,
                doc.y,
                { continued: false },
              );

            // Draw bar
            const barY = doc.y - 10;
            doc.rect(200, barY, 200, 8).fillColor('#f0f0f0').fill();
            doc.rect(200, barY, barWidth, 8).fillColor(getQualityColor(scoreLabel)).fill();

            doc.moveDown(0.2);
          }
        }

        doc.moveDown();
      }

      // ─── Scan Details ─────────────────────────────────
      doc.fontSize(14).fillColor('#1a1a2e').text('Scan Details', { underline: true }).moveDown(0.5);

      const details = [
        ['Title', data.scan.title ?? 'Untitled Scan'],
        ['Status', String(data.scan.status).toUpperCase()],
        ['Images', `${data.images.length} image(s)`],
        ['Date', new Date(String(data.scan.created_at)).toLocaleString()],
      ];

      if (data.scan.notes) {
        details.push(['Notes', String(data.scan.notes)]);
      }

      for (const [key, value] of details) {
        doc
          .fontSize(10)
          .fillColor('#333')
          .text(`${key}: `, { continued: true })
          .fillColor('#555')
          .text(String(value));
      }

      doc.moveDown();

      // ─── QR Code ──────────────────────────────────────
      if (fs.existsSync(data.qrCodePath)) {
        doc
          .fontSize(11)
          .fillColor('#333')
          .text('Scan QR code to view this report online:', { align: 'center' })
          .moveDown(0.3);

        doc.image(data.qrCodePath, doc.page.width / 2 - 50, doc.y, {
          width: 100,
          height: 100,
        });

        doc.moveDown(6);
      }

      // ─── Footer ───────────────────────────────────────
      doc
        .fontSize(8)
        .fillColor('#999')
        .text('─'.repeat(80), { align: 'center' })
        .moveDown(0.2)
        .text('This report was generated automatically by MIRA AI Quality Detection System.', {
          align: 'center',
        })
        .text(
          'Results are based on visual image analysis and should be confirmed by laboratory testing for critical decisions.',
          { align: 'center' },
        )
        .text(`© ${new Date().getFullYear()} MIRA. All rights reserved.`, { align: 'center' });

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', reject);
    });
  }
}

export const pdfService = new PdfService();
