/**
 * @module database/seed
 * Seeds the database with initial data:
 * - System roles and permissions
 * - Super Admin account
 * - Default AI model
 * - Default feature flags and settings
 * - Sample data for development
 */

import { db, testConnection } from './connection.js';
import { up } from './migrations/001_initial_schema.js';
import { hashPassword, generateId } from '../utils/crypto.js';
import { config } from '../config/env.js';
import { createModuleLogger } from '../utils/logger.js';

const log = createModuleLogger('seed');

async function seed() {
  try {
    log.info('Starting database seed...');

    const connected = await testConnection();
    if (!connected) throw new Error('Cannot connect to database');

    // Run migrations first if needed
    const hasUsers = await db.schema.hasTable('users');
    if (!hasUsers) {
      log.info('Running migrations...');
      await up(db);
    }

    // ─── Roles ────────────────────────────────────────────
    const roleIds = {
      super_admin: generateId(),
      admin: generateId(),
      producer: generateId(),
      consumer: generateId(),
      lab_staff: generateId(),
    };

    const existingRoles = await db('roles').select('name');
    if (existingRoles.length === 0) {
      await db('roles').insert([
        {
          id: roleIds.super_admin,
          name: 'super_admin',
          display_name: 'Super Administrator',
          description: 'Full system access. Only one account allowed.',
          is_system: true,
        },
        {
          id: roleIds.admin,
          name: 'admin',
          display_name: 'Administrator',
          description: 'Operational management access.',
          is_system: true,
        },
        {
          id: roleIds.producer,
          name: 'producer',
          display_name: 'Producer',
          description: 'Upload and manage milk batches.',
          is_system: true,
        },
        {
          id: roleIds.consumer,
          name: 'consumer',
          display_name: 'Consumer',
          description: 'Scan milk and view personal reports.',
          is_system: true,
        },
        {
          id: roleIds.lab_staff,
          name: 'lab_staff',
          display_name: 'Laboratory Staff',
          description: 'Validate lab samples.',
          is_system: true,
        },
      ]);
      log.info('Roles seeded');
    } else {
      // Load existing role IDs
      for (const role of existingRoles) {
        const r = await db('roles').where('name', role.name).first();
        if (r) roleIds[role.name as keyof typeof roleIds] = r.id;
      }
      log.info('Roles already exist, skipping');
    }

    // ─── Permissions ──────────────────────────────────────
    const existingPerms = await db('permissions').select('name');
    if (existingPerms.length === 0) {
      const resources = [
        'users',
        'scans',
        'images',
        'predictions',
        'reports',
        'batches',
        'audit_logs',
        'notifications',
        'settings',
        'feature_flags',
        'ai_models',
        'backups',
        'feedback',
        'lab_validations',
        'analytics',
      ];
      const actions = ['create', 'read', 'update', 'delete', 'manage'];

      const permissions = resources.flatMap((resource) =>
        actions.map((action) => ({
          id: generateId(),
          name: `${resource}:${action}`,
          resource,
          action,
          description: `${action} ${resource}`,
        })),
      );

      await db('permissions').insert(permissions);
      log.info(`${permissions.length} permissions seeded`);
    }

    // ─── Super Admin ──────────────────────────────────────
    const existingAdmin = await db('users').where('email', config.superAdmin.email).first();
    if (!existingAdmin) {
      const passwordHash = await hashPassword(config.superAdmin.password);
      await db('users').insert({
        id: generateId(),
        email: config.superAdmin.email,
        password_hash: passwordHash,
        first_name: config.superAdmin.firstName,
        last_name: config.superAdmin.lastName,
        role_id: roleIds.super_admin,
        status: 'active',
        email_verified: true,
        language: 'en',
        theme: 'system',
      });
      log.info(`Super Admin created: ${config.superAdmin.email}`);
    } else {
      log.info('Super Admin already exists, skipping');
    }

    // ─── Default AI Model ─────────────────────────────────
    const existingModel = await db('ai_models').first();
    if (!existingModel) {
      const modelId = generateId();
      await db('ai_models').insert({
        id: modelId,
        name: 'milk-quality-classifier',
        description:
          'CNN-based milk quality classification model analyzing color, turbidity, and visual markers.',
        type: 'classification',
      });

      await db('ai_model_versions').insert({
        id: generateId(),
        model_id: modelId,
        version: '1.0.0',
        file_path: config.ai.modelPath,
        accuracy: 0.92,
        precision_score: 0.915,
        recall: 0.908,
        f1_score: 0.911,
        is_active: true,
        is_default: true,
        changelog: 'Initial release — trained on 10,000 milk sample images.',
      });
      log.info('Default AI model seeded');
    }

    // ─── Feature Flags ────────────────────────────────────
    const existingFlags = await db('feature_flags').first();
    if (!existingFlags) {
      await db('feature_flags').insert([
        {
          id: generateId(),
          name: 'batch_testing',
          description: 'Enable batch milk testing for producers',
          enabled: true,
        },
        {
          id: generateId(),
          name: 'lab_validation',
          description: 'Enable laboratory validation workflow',
          enabled: true,
        },
        {
          id: generateId(),
          name: 'pdf_reports',
          description: 'Enable PDF report generation with QR codes',
          enabled: true,
        },
        {
          id: generateId(),
          name: 'dark_mode',
          description: 'Enable dark mode in web and mobile apps',
          enabled: true,
        },
        {
          id: generateId(),
          name: 'multi_language',
          description: 'Enable multi-language support',
          enabled: true,
        },
        {
          id: generateId(),
          name: 'push_notifications',
          description: 'Enable push notifications',
          enabled: false,
        },
        {
          id: generateId(),
          name: 'offline_mode',
          description: 'Enable offline mode for mobile app',
          enabled: true,
        },
        {
          id: generateId(),
          name: 'mfa',
          description: 'Enable multi-factor authentication',
          enabled: true,
        },
        {
          id: generateId(),
          name: 'ai_explainability',
          description: 'Show AI prediction explanations',
          enabled: true,
        },
        {
          id: generateId(),
          name: 'ab_testing',
          description: 'Enable A/B testing for AI models',
          enabled: false,
        },
      ]);
      log.info('Feature flags seeded');
    }

    // ─── System Settings ──────────────────────────────────
    const existingSettings = await db('system_settings').first();
    if (!existingSettings) {
      await db('system_settings').insert([
        {
          id: generateId(),
          key: 'maintenance_mode',
          value: 'false',
          category: 'general',
          description: 'Enable maintenance mode',
        },
        {
          id: generateId(),
          key: 'max_upload_size_mb',
          value: '10',
          category: 'storage',
          description: 'Maximum upload file size in MB',
        },
        {
          id: generateId(),
          key: 'auto_backup_enabled',
          value: 'true',
          category: 'general',
          description: 'Enable automatic backups',
        },
        {
          id: generateId(),
          key: 'backup_frequency_hours',
          value: '24',
          category: 'general',
          description: 'Backup frequency in hours',
        },
        {
          id: generateId(),
          key: 'ai_confidence_threshold',
          value: '0.6',
          category: 'ai',
          description: 'Minimum AI confidence threshold',
        },
        {
          id: generateId(),
          key: 'session_timeout_hours',
          value: '24',
          category: 'security',
          description: 'Session timeout in hours',
        },
        {
          id: generateId(),
          key: 'max_login_attempts',
          value: '5',
          category: 'security',
          description: 'Maximum login attempts before lockout',
        },
        {
          id: generateId(),
          key: 'data_retention_days',
          value: '365',
          category: 'general',
          description: 'Default data retention period in days',
        },
      ]);
      log.info('System settings seeded');
    }

    // ─── Data Retention Policies ──────────────────────────
    const existingPolicies = await db('data_retention_policies').first();
    if (!existingPolicies) {
      await db('data_retention_policies').insert([
        {
          id: generateId(),
          resource: 'audit_logs',
          retention_days: 365,
          action: 'archive',
          is_active: true,
        },
        {
          id: generateId(),
          resource: 'scan_images',
          retention_days: 180,
          action: 'delete',
          is_active: true,
        },
        {
          id: generateId(),
          resource: 'notifications',
          retention_days: 90,
          action: 'delete',
          is_active: true,
        },
        {
          id: generateId(),
          resource: 'user_sessions',
          retention_days: 30,
          action: 'delete',
          is_active: true,
        },
      ]);
      log.info('Data retention policies seeded');
    }

    // ─── Sample Data (Development Only) ───────────────────
    if (config.isDev) {
      const existingSamples = await db('users').whereNot('email', config.superAdmin.email).first();
      if (!existingSamples) {
        const samplePassword = await hashPassword('Test@1234');

        // Sample producer
        const producerId = generateId();
        await db('users').insert({
          id: producerId,
          email: 'producer@demo.com',
          password_hash: samplePassword,
          first_name: 'Raj',
          last_name: 'Kumar',
          role_id: roleIds.producer,
          status: 'active',
          email_verified: true,
          language: 'en',
          theme: 'system',
        });

        // Sample consumer
        await db('users').insert({
          id: generateId(),
          email: 'consumer@demo.com',
          password_hash: samplePassword,
          first_name: 'Priya',
          last_name: 'Sharma',
          role_id: roleIds.consumer,
          status: 'active',
          email_verified: true,
          language: 'en',
          theme: 'system',
        });

        // Sample admin
        await db('users').insert({
          id: generateId(),
          email: 'admin@demo.com',
          password_hash: samplePassword,
          first_name: 'Admin',
          last_name: 'User',
          role_id: roleIds.admin,
          status: 'active',
          email_verified: true,
          language: 'en',
          theme: 'system',
        });

        // Sample lab staff
        await db('users').insert({
          id: generateId(),
          email: 'lab@demo.com',
          password_hash: samplePassword,
          first_name: 'Dr. Arun',
          last_name: 'Patel',
          role_id: roleIds.lab_staff,
          status: 'active',
          email_verified: true,
          language: 'en',
          theme: 'system',
        });

        log.info('Sample users created (password: Test@1234)');

        // Sample scans for producer
        const scanId = generateId();
        await db('scans').insert({
          id: scanId,
          user_id: producerId,
          status: 'completed',
          title: 'Morning Batch Sample',
          notes: 'First batch of the day from Farm A',
          image_count: 1,
          completed_at: new Date().toISOString(),
        });

        log.info('Sample scan data created');
      }
    }

    log.info('Database seeding completed successfully!');
    await db.destroy();
    process.exit(0);
  } catch (error) {
    log.error('Seeding failed', { error });
    await db.destroy();
    process.exit(1);
  }
}

seed();
