export interface TrackingLink {
  id: string;
  alias: string;
  createdAt: string;
  clicks: number;
  fakeDomain?: string;
}

export interface IpLog {
  id: number;
  ipAddress: string;
  linkId: string;
  timestamp: string;
  userAgent: string;
  location?: string;
  isp?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}
