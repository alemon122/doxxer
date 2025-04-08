import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import { 
  users, 
  trackingLinks, 
  ipLogs, 
  type User, 
  type InsertUser, 
  type TrackingLink, 
  type InsertTrackingLink, 
  type IpLog, 
  type InsertIpLog 
} from "@shared/schema";
import { IStorage } from "./storage";

// Database storage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Tracking link methods
  async createTrackingLink(insertLink: InsertTrackingLink): Promise<TrackingLink> {
    const [link] = await db.insert(trackingLinks).values(insertLink).returning();
    return link;
  }

  async getTrackingLink(id: string): Promise<TrackingLink | undefined> {
    const [link] = await db.select().from(trackingLinks).where(eq(trackingLinks.id, id));
    return link || undefined;
  }

  async getAllTrackingLinks(): Promise<TrackingLink[]> {
    return await db.select().from(trackingLinks).orderBy(desc(trackingLinks.createdAt));
  }

  async incrementLinkClicks(id: string): Promise<TrackingLink | undefined> {
    const [link] = await db.select().from(trackingLinks).where(eq(trackingLinks.id, id));
    if (!link) return undefined;
    
    const [updatedLink] = await db
      .update(trackingLinks)
      .set({ clicks: link.clicks + 1 })
      .where(eq(trackingLinks.id, id))
      .returning();
      
    return updatedLink;
  }

  // IP log methods
  async logIpAddress(partialLog: Partial<InsertIpLog>): Promise<IpLog> {
    if (!partialLog.ipAddress || !partialLog.linkId) {
      throw new Error("IP address and link ID are required");
    }

    // Extract browser and OS info from user agent if not provided
    let browser = partialLog.browser || "Unknown";
    let os = partialLog.os || "Unknown";
    let deviceType = partialLog.deviceType || "Unknown";
    
    if (partialLog.userAgent && !partialLog.browser) {
      const ua = partialLog.userAgent.toLowerCase();
      
      // Detect browser
      if (ua.includes("chrome")) browser = "Chrome";
      else if (ua.includes("firefox")) browser = "Firefox";
      else if (ua.includes("safari")) browser = "Safari";
      else if (ua.includes("edge")) browser = "Edge";
      else if (ua.includes("opera")) browser = "Opera";
      
      // Detect OS
      if (ua.includes("windows")) os = "Windows";
      else if (ua.includes("mac")) os = "macOS";
      else if (ua.includes("linux")) os = "Linux";
      else if (ua.includes("android")) os = "Android";
      else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";
      
      // Detect device type
      if (ua.includes("mobile")) deviceType = "Mobile";
      else if (ua.includes("tablet")) deviceType = "Tablet";
      else deviceType = "Desktop";
    }
    
    const ipLogData = {
      ipAddress: partialLog.ipAddress,
      linkId: partialLog.linkId,
      userAgent: partialLog.userAgent || "",
      location: partialLog.location || "Unknown",
      isp: partialLog.isp || "Unknown",
      deviceType,
      browser,
      os
    };
    
    const [ipLog] = await db.insert(ipLogs).values(ipLogData).returning();
    return ipLog;
  }

  async getAllIpLogs(): Promise<IpLog[]> {
    return await db.select().from(ipLogs).orderBy(desc(ipLogs.timestamp));
  }

  async getIpLogsByLink(linkId: string): Promise<IpLog[]> {
    return await db
      .select()
      .from(ipLogs)
      .where(eq(ipLogs.linkId, linkId))
      .orderBy(desc(ipLogs.timestamp));
  }

  async deleteIpLog(id: number): Promise<boolean> {
    const result = await db.delete(ipLogs).where(eq(ipLogs.id, id)).returning();
    return result.length > 0;
  }
}