import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// First, define the tables without relations
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const trackingLinks = pgTable("tracking_links", {
  id: text("id").primaryKey(),
  alias: text("alias"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  clicks: integer("clicks").notNull().default(0),
  fakeDomain: text("fake_domain"),
});

export const ipLogs = pgTable("ip_logs", {
  id: serial("id").primaryKey(),
  ipAddress: text("ip_address").notNull(),
  linkId: text("link_id").notNull().references(() => trackingLinks.id, { onDelete: 'cascade' }),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  userAgent: text("user_agent"),
  location: text("location"),
  isp: text("isp"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
});

// Then define the relations
export const usersRelations = relations(users, ({ many }) => ({
  trackingLinks: many(trackingLinks),
}));

export const trackingLinksRelations = relations(trackingLinks, ({ many }) => ({
  ipLogs: many(ipLogs),
}));

export const ipLogsRelations = relations(ipLogs, ({ one }) => ({
  trackingLink: one(trackingLinks, {
    fields: [ipLogs.linkId],
    references: [trackingLinks.id],
  }),
}));

// Define insert schemas and types
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTrackingLinkSchema = createInsertSchema(trackingLinks).pick({
  id: true,
  alias: true,
  fakeDomain: true,
});

export const insertIpLogSchema = createInsertSchema(ipLogs).pick({
  ipAddress: true,
  linkId: true,
  userAgent: true,
  location: true,
  isp: true,
  deviceType: true,
  browser: true,
  os: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTrackingLink = z.infer<typeof insertTrackingLinkSchema>;
export type TrackingLink = typeof trackingLinks.$inferSelect;

export type InsertIpLog = z.infer<typeof insertIpLogSchema>;
export type IpLog = typeof ipLogs.$inferSelect;
