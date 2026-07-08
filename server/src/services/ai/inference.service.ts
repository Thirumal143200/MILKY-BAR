/**
 * @module services/ai/inference.service
 * AI inference service for milk quality detection using image analysis.
 * Uses color-based heuristic analysis as a demonstration model.
 * Architecture supports swapping in a real TensorFlow.js CNN model.
 */

import sharp from 'sharp';
import path from 'node:path';
import { config } from '../../config/env.js';
import { createModuleLogger } from '../../utils/logger.js';
import { db } from '../../database/connection.js';
import { generateId } from '../../utils/crypto.js';
import type { QualityLabel } from '@milkboy/shared';

const log = createModuleLogger('ai-inference');

/** Raw scores for each quality category */
interface QualityScores {
  excellent: number;
  good: number;
  acceptable: number;
  poor: number;
  adulterated: number;
  spoiled: number;
  inconclusive: number;
}

/** Inference result */
interface InferenceResult {
  qualityLabel: QualityLabel;
  confidence: number;
  scores: QualityScores;
  explanation: string;
  processingTimeMs: number;
}

/** Color statistics from image analysis */
interface ColorStats {
  meanR: number;
  meanG: number;
  meanB: number;
  stdR: number;
  stdG: number;
  stdB: number;
  brightness: number;
  saturation: number;
  whiteness: number;
  yellowness: number;
}

export class InferenceService {
  private modelLoaded = false;
  private defaultModelVersionId: string | null = null;

  /**
   * Initialize the inference service.
   * In production, this would load a TensorFlow.js model.
   */
  async initialize(): Promise<void> {
    try {
      // Load default model version from database
      const modelVersion = await db('ai_model_versions')
        .where('is_default', true)
        .where('is_active', true)
        .first();

      if (modelVersion) {
        this.defaultModelVersionId = modelVersion.id;
        log.info(`AI model loaded: v${modelVersion.version} (${modelVersion.id})`);
      } else {
        log.warn('No default AI model version found. Using heuristic analysis.');
      }

      this.modelLoaded = true;
    } catch (error) {
      log.error('Failed to initialize AI model', { error });
      // Continue with heuristic fallback
      this.modelLoaded = true;
    }
  }

  /**
   * Run inference on a processed image.
   * @param imagePath - Path to the processed image
   * @returns InferenceResult with quality label, confidence, and explanation
   */
  async predict(imagePath: string): Promise<InferenceResult> {
    const startTime = Date.now();

    try {
      // Extract color features from the image
      const stats = await this.extractColorFeatures(imagePath);

      // Run quality classification based on color analysis
      const scores = this.classifyQuality(stats);

      // Get the top prediction
      const entries = Object.entries(scores) as [QualityLabel, number][];
      entries.sort((a, b) => b[1] - a[1]);
      const [topLabel, topScore] = entries[0]!;

      // Generate human-readable explanation
      const explanation = this.generateExplanation(topLabel, scores, stats);

      const processingTimeMs = Date.now() - startTime;

      log.info(`Prediction: ${topLabel} (${(topScore * 100).toFixed(1)}%) in ${processingTimeMs}ms`);

      return {
        qualityLabel: topLabel,
        confidence: topScore,
        scores,
        explanation,
        processingTimeMs,
      };
    } catch (error) {
      log.error('Inference failed', { error, imagePath });
      throw error;
    }
  }

  /**
   * Save prediction result to database.
   */
  async savePrediction(
    scanId: string,
    imageId: string,
    result: InferenceResult,
  ): Promise<string> {
    const predictionId = generateId();

    await db('predictions').insert({
      id: predictionId,
      scan_id: scanId,
      image_id: imageId,
      model_version_id: this.defaultModelVersionId ?? 'heuristic',
      quality_label: result.qualityLabel,
      confidence: result.confidence,
      explanation: result.explanation,
      raw_scores: JSON.stringify(result.scores),
      processing_time_ms: result.processingTimeMs,
    });

    return predictionId;
  }

  /**
   * Extract color statistics from an image using Sharp.
   */
  private async extractColorFeatures(imagePath: string): Promise<ColorStats> {
    const image = sharp(imagePath);
    const metadata = await image.metadata();

    // Resize for faster analysis
    const { data, info } = await image
      .resize(100, 100, { fit: 'cover' })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = info.width * info.height;
    let sumR = 0, sumG = 0, sumB = 0;
    let sumR2 = 0, sumG2 = 0, sumB2 = 0;

    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i]! / 255;
      const g = data[i + 1]! / 255;
      const b = data[i + 2]! / 255;

      sumR += r; sumG += g; sumB += b;
      sumR2 += r * r; sumG2 += g * g; sumB2 += b * b;
    }

    const meanR = sumR / pixels;
    const meanG = sumG / pixels;
    const meanB = sumB / pixels;
    const stdR = Math.sqrt(sumR2 / pixels - meanR * meanR);
    const stdG = Math.sqrt(sumG2 / pixels - meanG * meanG);
    const stdB = Math.sqrt(sumB2 / pixels - meanB * meanB);

    const brightness = (meanR + meanG + meanB) / 3;
    const maxC = Math.max(meanR, meanG, meanB);
    const minC = Math.min(meanR, meanG, meanB);
    const saturation = maxC > 0 ? (maxC - minC) / maxC : 0;

    // Whiteness: how close to pure white
    const whiteness = 1 - Math.sqrt(
      Math.pow(meanR - 1, 2) + Math.pow(meanG - 1, 2) + Math.pow(meanB - 1, 2),
    ) / Math.sqrt(3);

    // Yellowness: yellow tint indicator
    const yellowness = (meanR + meanG) / 2 - meanB;

    return {
      meanR, meanG, meanB,
      stdR, stdG, stdB,
      brightness, saturation,
      whiteness, yellowness,
    };
  }

  /**
   * Classify milk quality based on color features.
   * 
   * Good milk characteristics:
   * - High whiteness (opaque white)
   * - Low saturation
   * - Moderate brightness (not too dark, not transparent)
   * - Slight yellowness is normal (cream content)
   * 
   * Problem indicators:
   * - High yellowness → possible adulteration
   * - Low whiteness → possible dilution
   * - High saturation → possible contamination
   * - Very dark → possible spoilage
   * - High color variance → non-uniform sample
   */
  private classifyQuality(stats: ColorStats): QualityScores {
    // Base scores
    let excellent = 0, good = 0, acceptable = 0, poor = 0;
    let adulterated = 0, spoiled = 0, inconclusive = 0;

    // Whiteness scoring (ideal: 0.7-0.95)
    if (stats.whiteness > 0.8) {
      excellent += 0.3;
      good += 0.2;
    } else if (stats.whiteness > 0.65) {
      good += 0.3;
      acceptable += 0.2;
    } else if (stats.whiteness > 0.5) {
      acceptable += 0.2;
      poor += 0.2;
    } else {
      poor += 0.3;
      spoiled += 0.1;
    }

    // Saturation scoring (ideal: low, < 0.15)
    if (stats.saturation < 0.1) {
      excellent += 0.2;
      good += 0.15;
    } else if (stats.saturation < 0.2) {
      good += 0.2;
      acceptable += 0.1;
    } else if (stats.saturation < 0.35) {
      acceptable += 0.15;
      adulterated += 0.1;
    } else {
      adulterated += 0.25;
      poor += 0.1;
    }

    // Brightness scoring (ideal: 0.7-0.9)
    if (stats.brightness > 0.7 && stats.brightness < 0.95) {
      excellent += 0.2;
      good += 0.15;
    } else if (stats.brightness > 0.55) {
      good += 0.15;
      acceptable += 0.15;
    } else if (stats.brightness > 0.35) {
      poor += 0.2;
      spoiled += 0.1;
    } else {
      spoiled += 0.3;
      poor += 0.1;
    }

    // Yellowness scoring (slight is normal: 0.02-0.08)
    if (stats.yellowness > -0.02 && stats.yellowness < 0.08) {
      excellent += 0.15;
      good += 0.1;
    } else if (stats.yellowness < 0.15) {
      good += 0.1;
      acceptable += 0.1;
    } else {
      adulterated += 0.2;
      poor += 0.1;
    }

    // Color uniformity (low std dev = uniform)
    const colorVariance = (stats.stdR + stats.stdG + stats.stdB) / 3;
    if (colorVariance < 0.1) {
      excellent += 0.15;
      good += 0.1;
    } else if (colorVariance < 0.2) {
      good += 0.1;
      acceptable += 0.1;
    } else {
      poor += 0.15;
      inconclusive += 0.1;
    }

    // Normalize to probabilities
    const total = excellent + good + acceptable + poor + adulterated + spoiled + inconclusive;
    if (total === 0) {
      return { excellent: 0, good: 0, acceptable: 0, poor: 0, adulterated: 0, spoiled: 0, inconclusive: 1 };
    }

    return {
      excellent: excellent / total,
      good: good / total,
      acceptable: acceptable / total,
      poor: poor / total,
      adulterated: adulterated / total,
      spoiled: spoiled / total,
      inconclusive: inconclusive / total,
    };
  }

  /**
   * Generate a human-readable explanation for the prediction.
   */
  private generateExplanation(
    label: QualityLabel,
    scores: QualityScores,
    stats: ColorStats,
  ): string {
    const parts: string[] = [];

    // Main result
    const confidence = scores[label] * 100;
    parts.push(`The milk sample is classified as **${label.toUpperCase()}** with ${confidence.toFixed(1)}% confidence.`);

    // Feature-based explanations
    if (stats.whiteness > 0.75) {
      parts.push('The sample shows good opacity and whiteness, consistent with unaltered whole milk.');
    } else if (stats.whiteness > 0.5) {
      parts.push('The sample shows moderate whiteness. This could indicate dilution or reduced fat content.');
    } else {
      parts.push('The sample has low whiteness, which may indicate significant dilution or contamination.');
    }

    if (stats.saturation > 0.25) {
      parts.push('Elevated color saturation was detected, which may indicate the presence of additives.');
    }

    if (stats.yellowness > 0.12) {
      parts.push('Noticeable yellow tint detected. While slight yellowness is normal, high levels may suggest adulteration with synthetic additives.');
    }

    if (stats.brightness < 0.4) {
      parts.push('The sample appears unusually dark, which could indicate bacterial contamination or spoilage.');
    }

    const colorVariance = (stats.stdR + stats.stdG + stats.stdB) / 3;
    if (colorVariance > 0.2) {
      parts.push('Color non-uniformity detected. The sample may not be well-mixed or may contain particulates.');
    }

    // Recommendations
    if (label === 'poor' || label === 'adulterated' || label === 'spoiled') {
      parts.push('\n**Recommendation:** This sample should be sent for laboratory testing before consumption or distribution.');
    } else if (label === 'acceptable') {
      parts.push('\n**Recommendation:** Sample quality is borderline. Consider additional testing for safety assurance.');
    }

    return parts.join(' ');
  }

  /** Get the default model version ID */
  getModelVersionId(): string | null {
    return this.defaultModelVersionId;
  }

  /** Check if service is ready */
  isReady(): boolean {
    return this.modelLoaded;
  }
}

export const inferenceService = new InferenceService();
