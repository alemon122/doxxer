import { 
  type User, 
  type InsertUser, 
  type TrackingLink, 
  type InsertTrackingLink, 
  type IpLog, 
  type InsertIpLog 
} from "@shared/schema";
import { DatabaseStorage } from "./database-storage";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Tracking link methods
  createTrackingLink(link: InsertTrackingLink): Promise<TrackingLink>;
  getTrackingLink(id: string): Promise<TrackingLink | undefined>;
  getAllTrackingLinks(): Promise<TrackingLink[]>;
  incrementLinkClicks(id: string): Promise<TrackingLink | undefined>;
  
  // IP log methods
  logIpAddress(log: Partial<InsertIpLog>): Promise<IpLog>;
  getAllIpLogs(): Promise<IpLog[]>;
  getIpLogsByLink(linkId: string): Promise<IpLog[]>;
  deleteIpLog(id: number): Promise<boolean>;
}

// We switched from in-memory storage to database storage
export const storage = new DatabaseStorage();
