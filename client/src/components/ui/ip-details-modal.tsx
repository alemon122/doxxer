import { IpLog } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPinIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for the default icon issue in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

interface IpDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ipLog: IpLog;
  linkName: string;
  fakeDomain?: string;
}

export default function IpDetailsModal({ isOpen, onClose, ipLog, linkName, fakeDomain }: IpDetailsModalProps) {
  // Extract coordinates if available in the location string
  let hasCoordinates = false;
  let latitude = 0;
  let longitude = 0;
  
  if (ipLog.location && ipLog.location.includes('(') && ipLog.location.includes(')')) {
    const coordsMatch = ipLog.location.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
    if (coordsMatch && coordsMatch.length >= 3) {
      hasCoordinates = true;
      latitude = parseFloat(coordsMatch[1]);
      longitude = parseFloat(coordsMatch[2]);
    }
  }
  
  // Format location for display (without coordinates)
  const displayLocation = ipLog.location ? ipLog.location.replace(/\s*\([-\d.]+,\s*[-\d.]+\)/, '') : 'Unknown';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-gray-100">IP Details</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-gray-300 hover:bg-gray-800">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">IP Address</h4>
            <p className="font-mono text-gray-200">{ipLog.ipAddress}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Source Link</h4>
            <p className="text-gray-200">{linkName} ({ipLog.linkId})</p>
            {fakeDomain && (
              <p className="text-sm text-orange-400 mt-1">
                Disguised as: https://{fakeDomain}/special-offer
              </p>
            )}
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Access Time</h4>
            <p className="text-gray-200">{new Date(ipLog.timestamp).toLocaleString()}</p>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">Location</h4>
            <div className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-red-500" />
              <p className="text-gray-200 font-medium">{displayLocation}</p>
            </div>
            
            {hasCoordinates && (
              <p className="text-gray-400 text-sm mt-1">
                Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </p>
            )}
            
            {hasCoordinates && (
              <div className="mt-2 flex flex-col gap-2">
                <a 
                  href={`https://www.google.com/maps?q=${latitude},${longitude}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View on Google Maps
                </a>
                
                <div className="h-[200px] w-full mt-2 rounded-md overflow-hidden border border-gray-700">
                  <MapContainer 
                    center={[latitude, longitude]} 
                    zoom={13} 
                    style={{ height: '100%', width: '100%' }}
                    attributionControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={[latitude, longitude]}>
                      <Popup>
                        <div className="text-sm font-medium">
                          <span className="text-red-500">IP:</span> {ipLog.ipAddress}
                          <br />
                          <span className="text-gray-700">Location:</span> {displayLocation}
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>
            )}
          </div>
          
          {ipLog.isp && (
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-1">ISP / Organization</h4>
              <p className="text-gray-200">{ipLog.isp}</p>
            </div>
          )}
          
          <div>
            <h4 className="text-sm font-medium text-gray-400 mb-1">User Agent</h4>
            <p className="text-sm text-gray-200 break-words">{ipLog.userAgent}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mt-2">
            {ipLog.deviceType && (
              <div className="flex-1 min-w-[120px]">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Device Type</h4>
                <p className="text-gray-200">{ipLog.deviceType}</p>
              </div>
            )}
            
            {ipLog.browser && (
              <div className="flex-1 min-w-[120px]">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Browser</h4>
                <p className="text-gray-200">{ipLog.browser}</p>
              </div>
            )}
            
            {ipLog.os && (
              <div className="flex-1 min-w-[120px]">
                <h4 className="text-sm font-medium text-gray-400 mb-1">Operating System</h4>
                <p className="text-gray-200">{ipLog.os}</p>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
