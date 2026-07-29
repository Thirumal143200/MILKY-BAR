/**
 * @module database/migrations/002_performance_indexes
 * Enterprise Database Indexing Migration — adds high-cardinality compound indexes
 * for sub-millisecond query execution across scans, notifications, predictions, and audit logs.
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // ─── Notifications Compound Indexes ─────────────────────────
  await knex.schema.alterTable('notifications', (t) => {
    t.index(['user_id', 'read', 'created_at'], 'idx_notifications_user_read_created');
    t.index(['user_id', 'created_at'], 'idx_notifications_user_created');
  });

  // ─── Scans Compound Indexes ─────────────────────────────────
  await knex.schema.alterTable('scans', (t) => {
    t.index(['user_id', 'status', 'created_at'], 'idx_scans_user_status_created');
    t.index(['status', 'created_at'], 'idx_scans_status_created');
  });

  // ─── Predictions Compound Indexes ───────────────────────────
  await knex.schema.alterTable('predictions', (t) => {
    t.index(['scan_id', 'created_at'], 'idx_predictions_scan_created');
    t.index(['scan_id', 'quality_label'], 'idx_predictions_scan_quality');
  });

  // ─── Scan Images Compound Indexes ───────────────────────────
  await knex.schema.alterTable('scan_images', (t) => {
    t.index(['scan_id', 'quality_status'], 'idx_scan_images_scan_quality');
  });

  // ─── Audit Logs Compound Indexes ────────────────────────────
  await knex.schema.alterTable('audit_logs', (t) => {
    t.index(['action', 'created_at'], 'idx_audit_logs_action_created');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('notifications', (t) => {
    t.dropIndex([], 'idx_notifications_user_read_created');
    t.dropIndex([], 'idx_notifications_user_created');
  });

  await knex.schema.alterTable('scans', (t) => {
    t.dropIndex([], 'idx_scans_user_status_created');
    t.dropIndex([], 'idx_scans_status_created');
  });

  await knex.schema.alterTable('predictions', (t) => {
    t.dropIndex([], 'idx_predictions_scan_created');
    t.dropIndex([], 'idx_predictions_scan_quality');
  });

  await knex.schema.alterTable('scan_images', (t) => {
    t.dropIndex([], 'idx_scan_images_scan_quality');
  });

  await knex.schema.alterTable('audit_logs', (t) => {
    t.dropIndex([], 'idx_audit_logs_action_created');
  });
}
