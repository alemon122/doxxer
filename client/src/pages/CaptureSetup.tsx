import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import CopyButton from "@/components/ui/copy-button";
import { CheckIcon } from "lucide-react";
import { TrackingLink } from "@/lib/types";

export default function CaptureSetup() {
  const [location, setLocation] = useLocation();
  const [linkAlias, setLinkAlias] = useState("");
  const [generatedLink, setGeneratedLink] = useState<TrackingLink | null>(null);
  const { toast } = useToast();

  const createLinkMutation = useMutation({
    mutationFn: async (alias: string) => {
      const res = await apiRequest("POST", "/api/links", { alias });
      return res.json();
    },
    onSuccess: (data: TrackingLink) => {
      setGeneratedLink(data);
      queryClient.invalidateQueries({ queryKey: ["/api/links"] });
      
      toast({
        title: "Tracking link generated",
        description: "Your link is ready to use",
      });
    },
    onError: (error) => {
      toast({
        title: "Error generating link",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerateLink = () => {
    createLinkMutation.mutate(linkAlias);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">IP Logger Tool</h1>
          <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm">Admin Panel</div>
        </div>
        
        <nav className="flex border-b border-gray-700 mb-6">
          <Link href="/">
            <a className="px-4 py-2 font-medium text-blue-500 border-b-2 border-blue-500 -mb-px">
              IP Capture Setup
            </a>
          </Link>
          <Link href="/logs">
            <a className="px-4 py-2 font-medium text-gray-400 hover:text-gray-300">
              View Logged IPs
            </a>
          </Link>
        </nav>
      </header>
      
      <Card className="bg-gray-900 rounded-lg shadow-md mb-6 border border-gray-800">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Generate IP Capture Link</h2>
          
          <div className="mb-6">
            <p className="text-gray-300 mb-4">
              Create a link that captures visitor IP addresses when clicked. Use this link in your communications to track when someone accesses it.
            </p>
            
            <div className="mb-6">
              <Label htmlFor="linkAlias" className="block text-sm font-medium text-gray-300 mb-1">
                Link Name (Optional)
              </Label>
              <div className="flex">
                <Input
                  type="text"
                  id="linkAlias"
                  className="flex-grow rounded-l-md border border-gray-700 bg-gray-800 text-gray-200"
                  placeholder="e.g., Campaign Link, Customer Support"
                  value={linkAlias}
                  onChange={(e) => setLinkAlias(e.target.value)}
                />
                <Button
                  className="rounded-l-none bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleGenerateLink}
                  disabled={createLinkMutation.isPending}
                >
                  {createLinkMutation.isPending ? "Generating..." : "Generate"}
                </Button>
              </div>
            </div>
            
            {generatedLink && (
              <div className="bg-gray-800 rounded-md p-4 border border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-200">Your Capture Link</h3>
                  <span className="text-xs bg-green-900 text-green-300 px-2 py-1 rounded">Active</span>
                </div>
                
                <div className="mb-3 flex items-center">
                  <Input
                    type="text"
                    className="w-full font-mono text-sm bg-gray-700 text-gray-200 rounded-r-none border-gray-600"
                    value={`${window.location.origin}/track/${generatedLink.id}`}
                    readOnly
                  />
                  <CopyButton textToCopy={`${window.location.origin}/track/${generatedLink.id}`} />
                </div>
                
                {generatedLink.fakeDomain && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-300 mb-1">Generated with fake domain:</p>
                    <div className="flex items-center">
                      <Input
                        type="text"
                        className="w-full font-mono text-sm bg-yellow-900 text-yellow-300 rounded-r-none border-yellow-800"
                        value={`https://${generatedLink.fakeDomain}/special-offer`}
                        readOnly
                      />
                      <CopyButton textToCopy={`https://${generatedLink.fakeDomain}/special-offer`} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">This typosquatting domain makes your link appear more legitimate</p>
                  </div>
                )}
                
                <div className="text-sm text-gray-400 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Created {generatedLink.createdAt}</span>
                  <span className="mx-2">•</span>
                  <span>Clicks: {generatedLink.clicks}</span>
                </div>
              </div>
            )}
            
            <div className="mt-6 bg-blue-900 bg-opacity-30 rounded-md p-4 border border-blue-800">
              <h3 className="font-medium text-blue-300 mb-2">How to use your link</h3>
              <ul className="text-sm text-blue-300 space-y-2">
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-400" />
                  <span>Share this link with your target via email, message, or any other communication channel.</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-400" />
                  <span>When they click the link, their IP address will be logged automatically.</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 mr-2 flex-shrink-0 text-blue-400" />
                  <span>View all captured IPs in the "View Logged IPs" tab.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <footer className="mt-8 text-center text-gray-400 text-sm">
        <p>&copy; {new Date().getFullYear()} IP Logger Tool. All rights reserved.</p>
        <p className="mt-1 text-gray-500 text-xs opacity-70">made by 『ꪶ𝒁𝑬𝑭𝑰𝑹𝜣̸͢ꫂ 𝒜𝓵ℯ𝓂ℴ𝓷</p>
      </footer>
    </div>
  );
}
