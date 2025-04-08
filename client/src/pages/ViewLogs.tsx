import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { IpLog, TrackingLink } from "@/lib/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import IpDetailsModal from "@/components/ui/ip-details-modal";
import { FileIcon, MapPinIcon } from "lucide-react";

export default function ViewLogs() {
  const { toast } = useToast();
  const [selectedLink, setSelectedLink] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [searchIp, setSearchIp] = useState<string>("");
  const [selectedIp, setSelectedIp] = useState<IpLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: links = [] } = useQuery<TrackingLink[]>({
    queryKey: ["/api/links"],
  });

  const { data: logs = [], isLoading } = useQuery<IpLog[]>({
    queryKey: ["/api/logs"],
  });

  const deleteLogMutation = useMutation({
    mutationFn: async (logId: number) => {
      await apiRequest("DELETE", `/api/logs/${logId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/logs"] });
      toast({
        title: "Log deleted",
        description: "The log entry has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting log",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleDeleteLog = (logId: number) => {
    deleteLogMutation.mutate(logId);
  };

  const handleViewDetails = (log: IpLog) => {
    setSelectedIp(log);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIp(null);
  };

  // Filter logs based on selected filters
  const filteredLogs = logs.filter((log: IpLog) => {
    // Filter by link
    if (selectedLink !== "all" && log.linkId !== selectedLink) {
      return false;
    }

    // Filter by IP search
    if (searchIp && !log.ipAddress.includes(searchIp)) {
      return false;
    }

    // Filter by date range
    if (dateRange !== "all") {
      const logDate = new Date(log.timestamp);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastMonth = new Date(today);
      lastMonth.setDate(lastMonth.getDate() - 30);

      if (dateRange === "today" && logDate < today) {
        return false;
      } else if (dateRange === "yesterday" && (logDate < yesterday || logDate >= today)) {
        return false;
      } else if (dateRange === "week" && logDate < lastWeek) {
        return false;
      } else if (dateRange === "month" && logDate < lastMonth) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">IP Logger Tool</h1>
          <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Admin Panel</div>
        </div>
        
        <nav className="flex border-b border-gray-700 mb-6">
          <Link href="/">
            <a className="px-4 py-2 font-medium text-gray-400 hover:text-gray-300">
              IP Capture Setup
            </a>
          </Link>
          <Link href="/logs">
            <a className="px-4 py-2 font-medium text-blue-500 border-b-2 border-blue-500 -mb-px">
              View Logged IPs
            </a>
          </Link>
        </nav>
      </header>
      
      <Card className="bg-gray-900 rounded-lg shadow-md mb-6 border border-gray-800">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Logged IP Addresses</h2>
          
          <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
            <div className="w-full md:w-1/3">
              <Label htmlFor="linkFilter" className="block text-sm font-medium text-gray-300 mb-1">
                Filter by Link
              </Label>
              <Select value={selectedLink} onValueChange={setSelectedLink}>
                <SelectTrigger id="linkFilter" className="border-gray-700 bg-gray-800 text-gray-200">
                  <SelectValue placeholder="All Links" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Links</SelectItem>
                  {links.map((link: TrackingLink) => (
                    <SelectItem key={link.id} value={link.id}>
                      {link.alias || link.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3">
              <Label htmlFor="dateFilter" className="block text-sm font-medium text-gray-300 mb-1">
                Date Range
              </Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger id="dateFilter" className="border-gray-700 bg-gray-800 text-gray-200">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-1/3">
              <Label htmlFor="searchIP" className="block text-sm font-medium text-gray-300 mb-1">
                Search by IP
              </Label>
              <Input
                type="text"
                id="searchIP"
                placeholder="Enter IP address"
                value={searchIp}
                onChange={(e) => setSearchIp(e.target.value)}
                className="border-gray-700 bg-gray-800 text-gray-200"
              />
            </div>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-300">Loading IP logs...</div>
          ) : filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Source Link</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {filteredLogs.map((log: IpLog) => {
                    const linkObj = links.find((l: TrackingLink) => l.id === log.linkId);
                    const linkName = linkObj ? (linkObj.alias || linkObj.id) : log.linkId;
                    
                    return (
                      <tr key={log.id} className="hover:bg-gray-800">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-mono text-sm text-gray-300">{log.ipAddress}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm">
                            <span className="text-gray-300">{linkName}</span>
                            {linkObj?.fakeDomain && (
                              <span className="text-orange-400 text-xs block">
                                https://{linkObj.fakeDomain}/special-offer
                              </span>
                            )}
                            <span className="text-gray-500 text-xs block">{log.linkId}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{new Date(log.timestamp).toLocaleString()}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-300">
                            {log.location ? (
                              <div className="flex items-center">
                                <MapPinIcon className="h-4 w-4 text-red-500 mr-1 flex-shrink-0" />
                                <span>{log.location.replace(/\s*\([-\d.]+,\s*[-\d.]+\)/, '')}</span>
                              </div>
                            ) : 'Unknown'}
                            
                            {/* Browser and device info */}
                            {(log.browser || log.os || log.deviceType) && (
                              <div className="mt-1.5 text-xs text-gray-400 flex flex-wrap gap-2">
                                {log.browser && (
                                  <span className="inline-flex items-center bg-gray-800 rounded px-2 py-0.5">
                                    {log.browser === "Chrome" && "🌐"}
                                    {log.browser === "Firefox" && "🦊"}
                                    {log.browser === "Safari" && "🧭"}
                                    {log.browser === "Edge" && "🌀"}
                                    {!["Chrome", "Firefox", "Safari", "Edge"].includes(log.browser) && "🌐"}
                                    <span className="ml-1">{log.browser}</span>
                                  </span>
                                )}
                                
                                {log.os && (
                                  <span className="inline-flex items-center bg-gray-800 rounded px-2 py-0.5">
                                    {log.os === "Windows" && "🪟"}
                                    {log.os === "macOS" && "🍎"}
                                    {log.os === "Linux" && "🐧"}
                                    {log.os === "Android" && "🤖"}
                                    {log.os === "iOS" && "📱"}
                                    {!["Windows", "macOS", "Linux", "Android", "iOS"].includes(log.os) && "💻"}
                                    <span className="ml-1">{log.os}</span>
                                  </span>
                                )}
                                
                                {log.deviceType && (
                                  <span className="inline-flex items-center bg-gray-800 rounded px-2 py-0.5">
                                    {log.deviceType === "Mobile" && "📱"}
                                    {log.deviceType === "Tablet" && "📟"}
                                    {log.deviceType === "Desktop" && "🖥️"}
                                    {!["Mobile", "Tablet", "Desktop"].includes(log.deviceType) && "📊"}
                                    <span className="ml-1">{log.deviceType}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            className="text-blue-400 hover:text-blue-300 mr-3"
                            onClick={() => handleViewDetails(log)}
                          >
                            Details
                          </button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="text-red-400 hover:text-red-300">
                                Delete
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-800 border-gray-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-gray-200">Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-400">
                                  This will permanently delete this IP log entry. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-700 text-gray-200 hover:bg-gray-600">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleDeleteLog(log.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div id="emptyState" className="py-12 text-center">
              <FileIcon className="h-16 w-16 mx-auto text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-200 mb-2">No IP addresses logged yet</h3>
              <p className="text-gray-400 mb-4">Share your tracking links to start capturing IP addresses.</p>
              <Link href="/">
                <Button className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white">
                  Create a Tracking Link
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedIp && (
        <IpDetailsModal 
          isOpen={isModalOpen} 
          onClose={closeModal} 
          ipLog={selectedIp} 
          linkName={links.find((l: TrackingLink) => l.id === selectedIp.linkId)?.alias || selectedIp.linkId}
          fakeDomain={links.find((l: TrackingLink) => l.id === selectedIp.linkId)?.fakeDomain}
        />
      )}
      
      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} IP Logger Tool. All rights reserved.</p>
        <p className="mt-1 text-gray-500 text-xs opacity-70">made by 『ꪶ𝒁𝑬𝑭𝑰𝑹𝜣̸͢ꫂ 𝒜𝓵ℯ𝓂ℴ𝓷</p>
      </footer>
    </div>
  );
}
