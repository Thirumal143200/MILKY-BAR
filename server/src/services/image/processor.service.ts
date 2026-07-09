/**
 * @module services/image/processor.service
 * Image processing pipeline using Sharp.js.
 * Handles preprocessing, quality checks, thumbnails, and normalization.
 */

import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';
import { config } from '../../config/env.js';
import { generateId } from '../../utils/crypto.js';
import { IMAGE_CONFIG, QUALITY_THRESHOLDS } from '@milkboy/shared';
import { db } from '../../database/connection.js';
import { createModuleLogger } from '../../utils/logger.js';

const log = createModuleLogger('image-processor');

export interface QualityCheckResult {
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

export interface ProcessedImageResult {
  processedPath: string;
  thumbnailPath: string;
  width: number;
  height: number;
  qualityCheck: QualityCheckResult;
}

export class ImageProcessorService {
  /**
   * Process an uploaded image: resize, normalize, create thumbnail, run quality checks.
   */
  async processImage(originalPath: string, scanId: string): Promise<ProcessedImageResult> {
    const processedDir = path.join(config.storage.localPath, 'processed', scanId);
    const thumbnailDir = path.join(config.storage.localPath, 'thumbnails', scanId);

    if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });
    if (!fs.existsSync(thumbnailDir)) fs.mkdirSync(thumbnailDir, { recursive: true });

    const fileName = `${generateId()}.jpg`;
    const processedPath = path.join(processedDir, fileName);
    const thumbnailPath = path.join(thumbnailDir, fileName);

    // Process: resize, normalize white balance, remove noise
    await sharp(originalPath)
      .resize(IMAGE_CONFIG.PROCESSED_MAX_WIDTH, IMAGE_CONFIG.PROCESSED_MAX_HEIGHT, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .normalize() // Auto white-balance and contrast
      .median(3) // Light noise removal
      .sharpen({ sigma: 1.0 }) // Gentle sharpen for clarity
      .jpeg({ quality: IMAGE_CONFIG.QUALITY_COMPRESSION })
      .toFile(processedPath);

    // Create thumbnail
    await sharp(originalPath)
      .resize(IMAGE_CONFIG.THUMBNAIL_WIDTH, IMAGE_CONFIG.THUMBNAIL_HEIGHT, {
        fit: 'cover',
      })
      .jpeg({ quality: 70 })
      .toFile(thumbnailPath);

    // Run quality checks
    const qualityCheck = await this.runQualityChecks(originalPath);

    // Get processed image dimensions
    const processedMeta = await sharp(processedPath).metadata();

    log.info(`Image processed: ${fileName} (quality: ${qualityCheck.overallScore.toFixed(2)})`);

    return {
      processedPath,
      thumbnailPath,
      width: processedMeta.width ?? 0,
      height: processedMeta.height ?? 0,
      qualityCheck,
    };
  }

  /**
   * Run comprehensive quality checks on an image.
   */
  async runQualityChecks(imagePath: string): Promise<QualityCheckResult> {
    const rejectionReasons: string[] = [];
    const suggestions: string[] = [];

    // Resize for analysis
    const { data, info } = await sharp(imagePath)
      .resize(200, 200, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Blur detection (using Laplacian variance approximation)
    const blurScore = this.calculateBlurScore(data, info.width, info.height, info.channels);

    // Lighting detection
    const lightingScore = this.calculateLightingScore(data, info.channels);

    // Focus score (edge density)
    const focusScore = this.calculateFocusScore(data, info.width, info.height, info.channels);

    // Reflection detection
    const reflectionDetected = this.detectReflection(data, info.width, info.height, info.channels);

    // Noise estimation
    const noiseLevel = this.estimateNoise(data, info.width, info.height, info.channels);

    // White balance check
    const stats = await sharp(imagePath).stats();
    const whiteBalanceOk = this.checkWhiteBalance(stats);

    // Perspective check (basic — checks if image is mostly rectangular)
    const perspectiveOk = true; // Simplified for demo

    // Build rejection reasons
    if (blurScore < QUALITY_THRESHOLDS.MIN_BLUR_SCORE) {
      rejectionReasons.push('Image is too blurry.');
      suggestions.push('Hold the camera steadily and ensure the subject is in focus.');
    }
    if (lightingScore < QUALITY_THRESHOLDS.MIN_LIGHTING_SCORE) {
      rejectionReasons.push('Insufficient lighting detected.');
      suggestions.push('Move to a well-lit area or use the camera flash.');
    }
    if (focusScore < QUALITY_THRESHOLDS.MIN_FOCUS_SCORE) {
      rejectionReasons.push('Image appears out of focus.');
      suggestions.push('Tap on the milk sample to focus before capturing.');
    }
    if (reflectionDetected) {
      rejectionReasons.push('Strong reflections detected on the surface.');
      suggestions.push('Adjust the angle to avoid glare and reflections.');
    }
    if (noiseLevel > QUALITY_THRESHOLDS.MAX_NOISE_LEVEL) {
      rejectionReasons.push('High image noise detected.');
      suggestions.push('Use better lighting to reduce image noise.');
    }

    // Calculate overall score (weighted average)
    const overallScore =
      blurScore * 0.25 +
      lightingScore * 0.25 +
      focusScore * 0.2 +
      (reflectionDetected ? 0 : 1) * 0.15 +
      (1 - noiseLevel) * 0.15;

    const passed =
      overallScore >= QUALITY_THRESHOLDS.MIN_OVERALL_SCORE && rejectionReasons.length === 0;

    if (!passed && suggestions.length === 0) {
      suggestions.push('Please retake the image with better conditions.');
    }

    return {
      blurScore,
      lightingScore,
      focusScore,
      reflectionDetected,
      perspectiveOk,
      whiteBalanceOk,
      noiseLevel,
      overallScore,
      passed,
      rejectionReasons,
      suggestions,
    };
  }

  /**
   * Save quality check results to database.
   */
  async saveQualityCheck(imageId: string, result: QualityCheckResult): Promise<string> {
    const checkId = generateId();
    await db('image_quality_checks').insert({
      id: checkId,
      image_id: imageId,
      blur_score: result.blurScore,
      lighting_score: result.lightingScore,
      focus_score: result.focusScore,
      reflection_detected: result.reflectionDetected,
      perspective_ok: result.perspectiveOk,
      white_balance_ok: result.whiteBalanceOk,
      noise_level: result.noiseLevel,
      overall_score: result.overallScore,
      passed: result.passed,
      rejection_reasons: JSON.stringify(result.rejectionReasons),
      suggestions: JSON.stringify(result.suggestions),
    });
    return checkId;
  }

  // ─── Private Analysis Methods ─────────────────────────

  private calculateBlurScore(
    data: Buffer,
    width: number,
    height: number,
    channels: number,
  ): number {
    // Laplacian variance approximation for blur detection
    let variance = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * channels;
        const gray = (data[idx]! + data[idx + 1]! + data[idx + 2]!) / 3;

        const up =
          (data[((y - 1) * width + x) * channels]! +
            data[((y - 1) * width + x) * channels + 1]! +
            data[((y - 1) * width + x) * channels + 2]!) /
          3;
        const down =
          (data[((y + 1) * width + x) * channels]! +
            data[((y + 1) * width + x) * channels + 1]! +
            data[((y + 1) * width + x) * channels + 2]!) /
          3;
        const left =
          (data[(y * width + x - 1) * channels]! +
            data[(y * width + x - 1) * channels + 1]! +
            data[(y * width + x - 1) * channels + 2]!) /
          3;
        const right =
          (data[(y * width + x + 1) * channels]! +
            data[(y * width + x + 1) * channels + 1]! +
            data[(y * width + x + 1) * channels + 2]!) /
          3;

        const laplacian = Math.abs(up + down + left + right - 4 * gray);
        variance += laplacian * laplacian;
        count++;
      }
    }

    const score = Math.min(1, variance / count / 1000);
    return score;
  }

  private calculateLightingScore(data: Buffer, channels: number): number {
    let totalBrightness = 0;
    const pixels = data.length / channels;

    for (let i = 0; i < data.length; i += channels) {
      totalBrightness += (data[i]! * 0.299 + data[i + 1]! * 0.587 + data[i + 2]! * 0.114) / 255;
    }

    const avgBrightness = totalBrightness / pixels;

    // Score: penalize both too dark and too bright
    if (avgBrightness < 0.15) return (avgBrightness / 0.15) * 0.3;
    if (avgBrightness > 0.95) return ((1 - avgBrightness) / 0.05) * 0.5;
    if (avgBrightness > 0.4 && avgBrightness < 0.85) return 1.0;
    return 0.5 + ((avgBrightness - 0.15) / 0.25) * 0.5;
  }

  private calculateFocusScore(
    data: Buffer,
    width: number,
    height: number,
    channels: number,
  ): number {
    // Edge density as a proxy for focus
    let edgeCount = 0;
    const threshold = 30;

    for (let y = 0; y < height - 1; y++) {
      for (let x = 0; x < width - 1; x++) {
        const idx = (y * width + x) * channels;
        const nextX = (y * width + x + 1) * channels;
        const nextY = ((y + 1) * width + x) * channels;

        const grayH =
          Math.abs(
            data[idx]! -
              data[nextX]! +
              (data[idx + 1]! - data[nextX + 1]!) +
              (data[idx + 2]! - data[nextX + 2]!),
          ) / 3;

        const grayV =
          Math.abs(
            data[idx]! -
              data[nextY]! +
              (data[idx + 1]! - data[nextY + 1]!) +
              (data[idx + 2]! - data[nextY + 2]!),
          ) / 3;

        if (grayH > threshold || grayV > threshold) edgeCount++;
      }
    }

    const edgeDensity = edgeCount / ((width - 1) * (height - 1));
    return Math.min(1, edgeDensity * 10);
  }

  private detectReflection(data: Buffer, width: number, height: number, channels: number): boolean {
    // Detect bright spots (potential reflections)
    let brightPixels = 0;
    const pixels = width * height;
    const threshold = 250;

    for (let i = 0; i < data.length; i += channels) {
      if (data[i]! > threshold && data[i + 1]! > threshold && data[i + 2]! > threshold) {
        brightPixels++;
      }
    }

    return brightPixels / pixels > QUALITY_THRESHOLDS.REFLECTION_THRESHOLD;
  }

  private estimateNoise(data: Buffer, width: number, height: number, channels: number): number {
    // Simple noise estimation using local variance
    let totalVariance = 0;
    let count = 0;

    for (let y = 1; y < height - 1; y += 3) {
      for (let x = 1; x < width - 1; x += 3) {
        const values: number[] = [];
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * channels;
            values.push((data[idx]! + data[idx + 1]! + data[idx + 2]!) / 3);
          }
        }
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
        totalVariance += variance;
        count++;
      }
    }

    return Math.min(1, totalVariance / count / 500);
  }

  private checkWhiteBalance(stats: sharp.Stats): boolean {
    const channels = stats.channels;
    if (channels.length < 3) return true;

    const rMean = channels[0]!.mean;
    const gMean = channels[1]!.mean;
    const bMean = channels[2]!.mean;

    // Check if color channels are reasonably balanced
    const avgMean = (rMean + gMean + bMean) / 3;
    const maxDeviation = Math.max(
      Math.abs(rMean - avgMean),
      Math.abs(gMean - avgMean),
      Math.abs(bMean - avgMean),
    );

    return maxDeviation < 40; // Allow up to 40 deviation
  }
}

export const imageProcessor = new ImageProcessorService();
