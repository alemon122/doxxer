import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { nanoid } from "nanoid";
import { z } from "zod";
import { insertIpLogSchema, insertTrackingLinkSchema } from "@shared/schema";
import axios from 'axios';
import { generateTypoSquattingDomain } from './utils/domain-typos';

// Interface for the IP Geolocation API response
interface GeoLocationData {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  latitude: number;
  longitude: number;
  isp: string;
  timezone?: string;
  postal?: string;
}

// Function to get location data from IP
async function getIpLocationData(ip: string): Promise<GeoLocationData | null> {
  try {
    // Using ipapi.co which provides free geolocation API without key requirement
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    
    if (response.status === 200 && response.data) {
      return {
        ip: response.data.ip,
        city: response.data.city || 'Unknown',
        region: response.data.region || 'Unknown',
        country_name: response.data.country_name || 'Unknown',
        latitude: response.data.latitude || 0,
        longitude: response.data.longitude || 0,
        isp: response.data.org || 'Unknown',
        timezone: response.data.timezone,
        postal: response.data.postal
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching IP location data:", error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a new tracking link
  app.post("/api/links", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        alias: z.string().optional()
      });
      
      const data = schema.parse(req.body);
      
      const linkId = nanoid(8); // Generate a short unique ID
      
      // Generate a fake domain that looks like a real one but with a typo
      const fakeDomain = generateTypoSquattingDomain();
      
      const newLink = await storage.createTrackingLink({
        id: linkId,
        alias: data.alias || "",
        fakeDomain
      });
      
      res.status(201).json(newLink);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create tracking link" });
      }
    }
  });

  // Get all tracking links
  app.get("/api/links", async (_req: Request, res: Response) => {
    try {
      const links = await storage.getAllTrackingLinks();
      res.json(links);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tracking links" });
    }
  });

  // Log a visit to a tracking link
  app.post("/api/track/:linkId", async (req: Request, res: Response) => {
    try {
      const { linkId } = req.params;
      
      // Check if link exists
      const link = await storage.getTrackingLink(linkId);
      if (!link) {
        return res.status(404).json({ message: "Tracking link not found" });
      }
      
      // Increment clicks counter
      await storage.incrementLinkClicks(linkId);
      
      // Extract IP address - first try X-Forwarded-For header, then use the connection remote address
      const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(',')[0] || 
                       (req.socket.remoteAddress || "");
      
      // Get user agent from the request
      const userAgent = req.headers["user-agent"] || "";
      
      // Get location data from IP
      let locationStr = "Unknown";
      let ispStr = "Unknown";
      let cityStr = "";
      let regionStr = "";
      let countryStr = "";
      let longitudeStr = "";
      let latitudeStr = "";
      
      try {
        const locationData = await getIpLocationData(ipAddress);
        
        if (locationData) {
          // Format the location string: City, Region, Country
          cityStr = locationData.city;
          regionStr = locationData.region;
          countryStr = locationData.country_name;
          longitudeStr = locationData.longitude.toString();
          latitudeStr = locationData.latitude.toString();
          
          locationStr = [
            locationData.city,
            locationData.region,
            locationData.country_name
          ].filter(Boolean).join(", ");
          
          // Add coordinates to the location if available
          if (locationData.latitude && locationData.longitude) {
            locationStr += ` (${locationData.latitude.toFixed(4)}, ${locationData.longitude.toFixed(4)})`;
          }
          
          ispStr = locationData.isp;
        }
      } catch (err) {
        console.error("Error getting IP location data:", err);
      }
      
      // Parse user agent to extract browser, OS and device information
      let browser = "Unknown";
      let os = "Unknown";
      let deviceType = "Unknown";
      
      if (userAgent) {
        // Detect browser
        if (userAgent.includes("Firefox/")) {
          browser = "Firefox";
        } else if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/") && !userAgent.includes("OPR/")) {
          browser = "Chrome";
        } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) {
          browser = "Safari";
        } else if (userAgent.includes("Edg/")) {
          browser = "Edge";
        } else if (userAgent.includes("OPR/") || userAgent.includes("Opera/")) {
          browser = "Opera";
        } else if (userAgent.includes("MSIE") || userAgent.includes("Trident/")) {
          browser = "Internet Explorer";
        }
        
        // Detect OS
        if (userAgent.includes("Windows")) {
          os = "Windows";
        } else if (userAgent.includes("Mac OS X")) {
          os = "macOS";
        } else if (userAgent.includes("Android")) {
          os = "Android";
        } else if (userAgent.includes("iOS") || userAgent.includes("iPhone") || userAgent.includes("iPad")) {
          os = "iOS";
        } else if (userAgent.includes("Linux")) {
          os = "Linux";
        }
        
        // Detect device type
        if (userAgent.includes("Mobile") || userAgent.includes("iPhone") || userAgent.includes("Android") && !userAgent.includes("Tablet")) {
          deviceType = "Mobile";
        } else if (userAgent.includes("Tablet") || userAgent.includes("iPad")) {
          deviceType = "Tablet";
        } else {
          deviceType = "Desktop";
        }
      }
      
      // Log the IP address with all the data
      const ipLog = await storage.logIpAddress({
        ipAddress,
        linkId,
        userAgent,
        location: locationStr,
        isp: ispStr,
        deviceType,
        browser,
        os
      });
      
      res.status(201).json(ipLog);
    } catch (error) {
      console.error("Error logging IP visit:", error);
      res.status(500).json({ message: "Failed to log visit" });
    }
  });

  // Get all IP logs
  app.get("/api/logs", async (_req: Request, res: Response) => {
    try {
      const logs = await storage.getAllIpLogs();
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch IP logs" });
    }
  });

  // Delete an IP log
  app.delete("/api/logs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const deleted = await storage.deleteIpLog(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "IP log not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete IP log" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
