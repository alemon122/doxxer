import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function TrackingPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const logVisitMutation = useMutation({
    mutationFn: async (linkId: string) => {
      const response = await apiRequest("POST", `/api/track/${linkId}`, {});
      return response.json();
    },
    onSuccess: () => {
      // Redirect to a benign page after logging
      setLocation("/");
    },
    onError: () => {
      // If there's an error, still redirect to avoid a blank page
      setLocation("/");
    }
  });

  useEffect(() => {
    if (id) {
      logVisitMutation.mutate(id);
    }
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative">
      <div className="text-center p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700">
        <div className="mb-4">
          <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p className="text-gray-300">Redirecting you to the content...</p>
      </div>
      <div className="absolute bottom-2 right-2 text-gray-500 text-xs opacity-70">
        made by 『ꪶ𝒁𝑬𝑭𝑰𝑹𝜣̸͢ꫂ 𝒜𝓵ℯ𝓂ℴ𝓷
      </div>
    </div>
  );
}
