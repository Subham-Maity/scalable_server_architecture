export interface GeoLogJob {
  ipAddress: string;
  action: string;
  userAgent: string;
  userId?: string | null;
  email?: string | null;
  reason?: string;
}
