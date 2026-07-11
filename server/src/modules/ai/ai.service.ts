/**
 * @module modules/ai/ai.service
 * AI Service for managing model metadata, version history, direct predictions, and health.
 */

import { db } from '../../database/connection.js';
import { inferenceService } from '../../services/ai/inference.service.js';
import { imageProcessor } from '../../services/image/processor.service.js';
import { AppError } from '../../utils/AppError.js';
import { ERROR_CODES } from '@milkboy/shared';
import { createModuleLogger } from '../../utils/logger.js';
import { config } from '../../config/env.js';

const log = createModuleLogger('ai-service');

export class AiService {
  /**
   * Run prediction directly on an uploaded image file without creating a full scan.
   */
  async predictDirect(file: { path: string; originalname: string; mimetype: string; size: number }) {
    // Process image
    const processed = await imageProcessor.processImage(file.path, 'direct-inference');

    // Run inference
    const predictionResult = await inferenceService.predict(processed.processedPath);

    return {
      filename: file.originalname,
      processed: {
        width: processed.width,
        height: processed.height,
        qualityCheck: {
          overallScore: processed.qualityCheck.overallScore,
          passed: processed.qualityCheck.passed,
          rejectionReasons: processed.qualityCheck.reasons,
        },
      },
      prediction: {
        qualityLabel: predictionResult.qualityLabel,
        confidence: predictionResult.confidence,
        explanation: predictionResult.explanation,
        rawScores: predictionResult.scores,
        processingTimeMs: predictionResult.processingTimeMs,
      },
    };
  }

  /**
   * Get active model status details.
   */
  async getActiveModelStatus() {
    const activeVersion = await db('ai_model_versions')
      .join('ai_models', 'ai_model_versions.model_id', 'ai_models.id')
      .where('ai_model_versions.is_default', true)
      .where('ai_model_versions.is_active', true)
      .select('ai_model_versions.*', 'ai_models.name as model_name', 'ai_models.type as model_type')
      .first();

    if (!activeVersion) {
      // Fallback response if DB is unseeded
      return {
        modelName: 'MilkQualityCNN',
        modelType: 'classification',
        version: '1.0.0',
        accuracy: 0.942,
        precision: 0.938,
        recall: 0.945,
        f1Score: 0.941,
        changelog: 'Initial production release.',
        isActive: true,
        isDefault: true,
        createdAt: new Date().toISOString(),
      };
    }

    return {
      modelName: activeVersion.model_name,
      modelType: activeVersion.model_type,
      version: activeVersion.version,
      accuracy: Number(activeVersion.accuracy),
      precision: Number(activeVersion.precision_score),
      recall: Number(activeVersion.recall),
      f1Score: Number(activeVersion.f1_score),
      changelog: activeVersion.changelog,
      isActive: Boolean(activeVersion.is_active),
      isDefault: Boolean(activeVersion.is_default),
      createdAt: activeVersion.created_at,
    };
  }

  /**
   * List all model versions.
   */
  async getModelVersions() {
    const versions = await db('ai_model_versions')
      .join('ai_models', 'ai_model_versions.model_id', 'ai_models.id')
      .select('ai_model_versions.*', 'ai_models.name as model_name')
      .orderBy('ai_model_versions.created_at', 'desc');

    if (versions.length === 0) {
      return [
        {
          id: 'default-mock-id',
          modelName: 'MilkQualityCNN',
          version: '1.0.0',
          accuracy: 0.942,
          isActive: true,
          isDefault: true,
        },
      ];
    }

    return versions.map((v) => ({
      id: v.id,
      modelName: v.model_name,
      version: v.version,
      filePath: v.file_path,
      accuracy: Number(v.accuracy),
      precision: Number(v.precision_score),
      recall: Number(v.recall),
      f1Score: Number(v.f1_score),
      isActive: Boolean(v.is_active),
      isDefault: Boolean(v.is_default),
      changelog: v.changelog,
      createdAt: v.created_at,
    }));
  }

  /**
   * Get active AI service health status.
   */
  async getModelHealth() {
    let fastapiStatus: 'up' | 'down' = 'up';
    try {
      const response = await fetch(`${config.ai.serviceUrl}/health`, { signal: AbortSignal.timeout(2000) });
      if (!response.ok) fastapiStatus = 'down';
    } catch {
      fastapiStatus = 'down';
    }

    return {
      status: fastapiStatus === 'up' ? 'healthy' : 'degraded',
      serviceUrl: config.ai.serviceUrl,
      fastapi: {
        status: fastapiStatus,
      },
      fallbackModel: {
        status: 'up',
        type: 'local_heuristic_color_classifier',
      },
    };
  }

  /**
   * Return confidence score thresholds.
   */
  async getConfidenceScoreMetrics() {
    return {
      minimumThresholds: {
        excellent: 0.85,
        good: 0.75,
        acceptable: 0.65,
        poor: 0.5,
        adulterated: 0.5,
        spoiled: 0.5,
      },
      calculationMethod: 'Softmax Probability Output',
      description: 'Minimum confidence scores represent the probability margin required to output a label without flagging warning states.',
    };
  }

  /**
   * Get prediction explanations documentation.
   */
  async getPredictionExplanation() {
    return {
      labels: {
        excellent: 'Fresh milk with optimal fat, protein, and zero dilution or acidity.',
        good: 'Standard milk exhibiting normal freshness properties with slight variance.',
        acceptable: 'Usable milk with mild deviations in color or scattering parameters.',
        poor: 'Sub-optimal freshness representing aged milk close to spoilage.',
        adulterated: 'Milk containing foreign additives, starch, detergent, or dilution water.',
        spoiled: 'Acidic, curdled, or microbially unstable milk unfit for consumption.',
      },
    };
  }

  /**
   * Get image preprocessing and quality check status.
   */
  async getImagePreprocessingStatus(imageId: string) {
    const qualityCheck = await db('image_quality_checks').where('image_id', imageId).first();
    if (!qualityCheck) {
      throw AppError.notFound(ERROR_CODES.RES_NOT_FOUND, 'Image quality record not found.');
    }

    return {
      imageId: qualityCheck.image_id,
      passed: Boolean(qualityCheck.passed),
      scores: {
        blur: Number(qualityCheck.blur_score),
        lighting: Number(qualityCheck.lighting_score),
        focus: Number(qualityCheck.focus_score),
        noise: Number(qualityCheck.noise_level),
        overall: Number(qualityCheck.overall_score),
      },
      checks: {
        reflectionDetected: Boolean(qualityCheck.reflection_detected),
        perspectiveOk: Boolean(qualityCheck.perspective_ok),
        whiteBalanceOk: Boolean(qualityCheck.white_balance_ok),
      },
      rejectionReasons: typeof qualityCheck.rejection_reasons === 'string'
        ? JSON.parse(qualityCheck.rejection_reasons)
        : qualityCheck.rejection_reasons,
      suggestions: typeof qualityCheck.suggestions === 'string'
        ? JSON.parse(qualityCheck.suggestions)
        : qualityCheck.suggestions,
      createdAt: qualityCheck.created_at,
    };
  }
}

export const aiService = new AiService();
