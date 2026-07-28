/**
 * @module database/migrations/001_initial_schema
 * Initial database schema — creates all core tables.
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // ─── Roles ──────────────────────────────────────────────
  await knex.schema.createTable('roles', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('name', 50).notNullable().unique();
    t.string('display_name', 100).notNullable();
    t.text('description');
    t.boolean('is_system').notNullable().defaultTo(true);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // ─── Permissions ────────────────────────────────────────
  await knex.schema.createTable('permissions', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('name', 100).notNullable().unique();
    t.string('resource', 50).notNullable();
    t.string('action', 20).notNullable();
    t.text('description');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.unique(['resource', 'action']);
  });

  // ─── Role-Permission Mapping ────────────────────────────
  await knex.schema.createTable('role_permissions', (t) => {
    t.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
    t.uuid('permission_id')
      .notNullable()
      .references('id')
      .inTable('permissions')
      .onDelete('CASCADE');
    t.primary(['role_id', 'permission_id']);
  });

  // ─── Users ──────────────────────────────────────────────
  await knex.schema.createTable('users', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('email', 255).notNullable().unique();
    t.string('password_hash', 255).notNullable();
    t.string('first_name', 100).notNullable();
    t.string('last_name', 100).notNullable();
    t.uuid('role_id').notNullable().references('id').inTable('roles');
    t.string('status', 30).notNullable().defaultTo('active');
    t.string('phone', 20);
    t.string('avatar_url', 500);
    t.boolean('mfa_enabled').notNullable().defaultTo(false);
    t.string('mfa_secret', 255);
    t.string('language', 5).notNullable().defaultTo('en');
    t.string('theme', 10).notNullable().defaultTo('system');
    t.boolean('email_verified').notNullable().defaultTo(false);
    t.string('email_verify_token', 255);
    t.string('password_reset_token', 255);
    t.timestamp('password_reset_expires');
    t.integer('login_attempts').notNullable().defaultTo(0);
    t.timestamp('lockout_until');
    t.timestamp('last_login_at');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('deleted_at');

    t.index('email');

    t.index('status');
    t.index('role_id');
  });

  // ─── User Sessions ────────────────────────────────────
  await knex.schema.createTable('user_sessions', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('token_hash', 255).notNullable().unique();
    t.string('refresh_token_hash', 255).notNullable().unique();
    t.string('device_info', 500);
    t.string('ip_address', 45);
    t.string('user_agent', 500);
    t.timestamp('last_active_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('expires_at').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('expires_at');
  });

  // ─── User Devices ──────────────────────────────────────
  await knex.schema.createTable('user_devices', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('device_name', 200).notNullable();
    t.string('device_type', 20).notNullable(); // android, ios, web
    t.string('push_token', 500);
    t.timestamp('last_active_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('user_id');
  });

  // ─── Scans ──────────────────────────────────────────────
  await knex.schema.createTable('scans', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.string('status', 30).notNullable().defaultTo('created');
    t.string('title', 200);
    t.text('notes');
    t.decimal('latitude', 10, 7);
    t.decimal('longitude', 10, 7);
    t.string('address', 500);
    t.string('client_scan_id', 200);
    t.integer('image_count').notNullable().defaultTo(0);
    t.timestamp('completed_at');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('deleted_at');

    t.index('user_id');
    t.index('client_scan_id');
    t.index(['user_id', 'client_scan_id']);
    t.index('status');
    t.index('created_at');
  });

  // ─── Scan Images ────────────────────────────────────────
  await knex.schema.createTable('scan_images', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('scan_id').notNullable().references('id').inTable('scans').onDelete('CASCADE');
    t.string('original_path', 500).notNullable();
    t.string('processed_path', 500);
    t.string('thumbnail_path', 500);
    t.string('original_filename', 255).notNullable();
    t.string('mime_type', 50).notNullable();
    t.integer('file_size').notNullable();
    t.integer('width');
    t.integer('height');
    t.decimal('quality_score', 4, 3);
    t.string('quality_status', 20).notNullable().defaultTo('pending');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('scan_id');
  });

  // ─── Image Quality Checks ──────────────────────────────
  await knex.schema.createTable('image_quality_checks', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('image_id').notNullable().references('id').inTable('scan_images').onDelete('CASCADE');
    t.decimal('blur_score', 4, 3).notNullable();
    t.decimal('lighting_score', 4, 3).notNullable();
    t.decimal('focus_score', 4, 3).notNullable();
    t.boolean('reflection_detected').notNullable().defaultTo(false);
    t.boolean('perspective_ok').notNullable().defaultTo(true);
    t.boolean('white_balance_ok').notNullable().defaultTo(true);
    t.decimal('noise_level', 4, 3).notNullable();
    t.decimal('overall_score', 4, 3).notNullable();
    t.boolean('passed').notNullable();
    t.json('rejection_reasons');
    t.json('suggestions');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('image_id');
  });

  // ─── AI Models ──────────────────────────────────────────
  await knex.schema.createTable('ai_models', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('name', 100).notNullable().unique();
    t.text('description');
    t.string('type', 50).notNullable(); // classification, detection, segmentation
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // ─── AI Model Versions ─────────────────────────────────
  await knex.schema.createTable('ai_model_versions', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('model_id').notNullable().references('id').inTable('ai_models').onDelete('CASCADE');
    t.string('version', 50).notNullable();
    t.string('file_path', 500).notNullable();
    t.decimal('accuracy', 5, 4);
    t.decimal('precision_score', 5, 4);
    t.decimal('recall', 5, 4);
    t.decimal('f1_score', 5, 4);
    t.boolean('is_active').notNullable().defaultTo(true);
    t.boolean('is_default').notNullable().defaultTo(false);
    t.text('changelog');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.unique(['model_id', 'version']);
    t.index('model_id');
    t.index('is_default');
  });

  // ─── Predictions ────────────────────────────────────────
  await knex.schema.createTable('predictions', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('scan_id').notNullable().references('id').inTable('scans').onDelete('CASCADE');
    t.uuid('image_id').notNullable().references('id').inTable('scan_images').onDelete('CASCADE');
    t.uuid('model_version_id').notNullable().references('id').inTable('ai_model_versions');
    t.string('quality_label', 30).notNullable();
    t.decimal('confidence', 5, 4).notNullable();
    t.text('explanation');
    t.json('raw_scores');
    t.integer('processing_time_ms');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('scan_id');
    t.index('image_id');
    t.index('quality_label');
  });

  // ─── Reports ────────────────────────────────────────────
  await knex.schema.createTable('reports', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('scan_id').notNullable().references('id').inTable('scans').onDelete('CASCADE');
    t.string('file_path', 500).notNullable();
    t.integer('file_size').notNullable().defaultTo(0);
    t.timestamp('generated_at').notNullable().defaultTo(knex.fn.now());

    t.index('scan_id');
  });

  // ─── Report QR Codes ───────────────────────────────────
  await knex.schema.createTable('report_qr_codes', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('report_id').notNullable().references('id').inTable('reports').onDelete('CASCADE');
    t.text('qr_data').notNullable();
    t.string('qr_image_path', 500).notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('report_id');
  });

  // ─── Batches ────────────────────────────────────────────
  await knex.schema.createTable('batches', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.string('name', 200).notNullable();
    t.text('description');
    t.string('status', 30).notNullable().defaultTo('created');
    t.integer('scan_count').notNullable().defaultTo(0);
    t.integer('completed_count').notNullable().defaultTo(0);
    t.timestamp('completed_at');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('deleted_at');

    t.index('user_id');

    t.index('status');
  });

  // ─── Batch-Scan Mapping ─────────────────────────────────
  await knex.schema.createTable('batch_scans', (t) => {
    t.uuid('batch_id').notNullable().references('id').inTable('batches').onDelete('CASCADE');
    t.uuid('scan_id').notNullable().references('id').inTable('scans').onDelete('CASCADE');
    t.primary(['batch_id', 'scan_id']);
  });

  // ─── Lab Validations ───────────────────────────────────
  await knex.schema.createTable('lab_validations', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('scan_id').notNullable().references('id').inTable('scans');
    t.uuid('lab_staff_id').notNullable().references('id').inTable('users');
    t.string('result', 30).notNullable(); // confirmed, rejected, inconclusive
    t.text('notes');
    t.json('parameters'); // fat, protein, lactose, pH, etc.
    t.timestamp('validated_at').notNullable().defaultTo(knex.fn.now());

    t.index('scan_id');
    t.index('lab_staff_id');
  });

  // ─── Audit Logs ─────────────────────────────────────────
  await knex.schema.createTable('audit_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').references('id').inTable('users');
    t.string('user_email', 255);
    t.string('action', 50).notNullable();
    t.string('resource', 50).notNullable();
    t.string('resource_id', 100);
    t.json('details');
    t.string('ip_address', 45);
    t.string('user_agent', 500);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('action');
    t.index('resource');
    t.index('created_at');
  });

  // ─── Notifications ─────────────────────────────────────
  await knex.schema.createTable('notifications', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    t.string('type', 50).notNullable();
    t.string('title', 200).notNullable();
    t.text('message').notNullable();
    t.json('data');
    t.boolean('read').notNullable().defaultTo(false);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('read');
    t.index('created_at');
  });

  // ─── System Settings ───────────────────────────────────
  await knex.schema.createTable('system_settings', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('key', 100).notNullable().unique();
    t.text('value').notNullable();
    t.string('category', 50).notNullable();
    t.text('description');
    t.uuid('updated_by').references('id').inTable('users');
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // ─── Feature Flags ─────────────────────────────────────
  await knex.schema.createTable('feature_flags', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('name', 100).notNullable().unique();
    t.text('description');
    t.boolean('enabled').notNullable().defaultTo(false);
    t.uuid('updated_by').references('id').inTable('users');
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // ─── Feedback ───────────────────────────────────────────
  await knex.schema.createTable('feedback', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('user_id').notNullable().references('id').inTable('users');
    t.string('type', 30).notNullable(); // feedback, bug_report, feature_request
    t.string('subject', 200).notNullable();
    t.text('message').notNullable();
    t.string('status', 30).notNullable().defaultTo('open');
    t.string('priority', 20).notNullable().defaultTo('medium');
    t.json('attachments');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    t.index('user_id');
    t.index('status');
    t.index('type');
  });

  // ─── Backup Logs ────────────────────────────────────────
  await knex.schema.createTable('backup_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('type', 30).notNullable(); // full, incremental, differential
    t.string('file_path', 500).notNullable();
    t.bigInteger('file_size').notNullable().defaultTo(0);
    t.string('status', 30).notNullable().defaultTo('pending');
    t.text('error_message');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('completed_at');
  });

  // ─── Data Retention Policies ────────────────────────────
  await knex.schema.createTable('data_retention_policies', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('resource', 50).notNullable().unique();
    t.integer('retention_days').notNullable();
    t.string('action', 30).notNullable(); // archive, delete, anonymize
    t.boolean('is_active').notNullable().defaultTo(true);
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });

  // ─── Sync Queue ─────────────────────────────────────────
  await knex.schema.createTable('sync_queue', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('action', 100).notNullable();
    t.json('payload').notNullable();
    t.string('status', 30).notNullable().defaultTo('pending'); // pending, processing, completed, failed
    t.integer('attempts').notNullable().defaultTo(0);
    t.text('last_error');
    t.timestamp('run_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    t.index('status');
    t.index('run_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  const tables = [
    'sync_queue',
    'data_retention_policies',
    'backup_logs',

    'feedback',
    'feature_flags',
    'system_settings',
    'notifications',
    'audit_logs',
    'lab_validations',
    'batch_scans',
    'batches',
    'report_qr_codes',
    'reports',
    'predictions',
    'ai_model_versions',
    'ai_models',
    'image_quality_checks',
    'scan_images',
    'scans',
    'user_devices',
    'user_sessions',
    'users',
    'role_permissions',
    'permissions',
    'roles',
  ];

  for (const table of tables) {
    await knex.schema.dropTableIfExists(table);
  }
}
