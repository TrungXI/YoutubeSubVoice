import { pgTable, serial, text, varchar, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  youtubeUrl: varchar('youtube_url', { length: 500 }).notNull(),
  status: varchar('status', { length: 50 }).default('queued').notNull(), // queued, running, done, error
  targetLang: varchar('target_lang', { length: 10 }).default('vi').notNull(),
  enableDub: boolean('enable_dub').default(false).notNull(),
  voiceId: varchar('voice_id', { length: 100 }),
  
  // Metadata
  videoTitle: varchar('video_title', { length: 500 }),
  videoDuration: integer('video_duration'), // seconds
  originalLang: varchar('original_lang', { length: 10 }),
  
  // Processing info
  errorMessage: text('error_message'),
  progress: integer('progress').default(0).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const assets = pgTable('assets', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').references(() => jobs.id, { onDelete: 'cascade' }).notNull(),
  
  // Asset type: original_video, original_audio, transcript_json, srt, vtt, dub_audio, dub_video
  assetType: varchar('asset_type', { length: 50 }).notNull(),
  
  // File paths
  filePath: varchar('file_path', { length: 500 }).notNull(),
  fileUrl: varchar('file_url', { length: 500 }),
  
  // Metadata
  fileSize: integer('file_size'), // bytes
  language: varchar('language', { length: 10 }),
  
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;

