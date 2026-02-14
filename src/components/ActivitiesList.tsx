import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, CheckCircle, XCircle, Play } from "lucide-react";
import { Suspense } from "react";

interface ActivityItem {
  _id: string;
  agent: string;
  action: string;
  description: string;
  status: "running" | "completed" | "failed";
  timestamp: number;
  metadata?: any;
}

function ActivitiesContent() {
  const activities = useQuery(api.activities.getActivities, {
    limit: 50,
  });

  const logActivity = useMutation(api.activities.logActivity);

  const handleLogActivity = async () => {
    try {
      await logActivity({
        agent: "Begubot",
        action: "Manual Test",
        description: "Test activity logged from Mission Control UI",
        status: "completed",
        metadata: {
          source: "ui_button",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-[#5EAD5E]";
      case "running":
        return "text-[#5E8FAD]";
      case "failed":
        return "text-[#E55454]";
      default:
        return "text-[#8A8A8A]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "running":
        return <Play className="w-4 h-4" />;
      case "failed":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.round(diff / 3600000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  if (!activities) {
    return <div className="text-[#8A8A8A]">Loading activities...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={handleLogActivity}
          className="bg-[#5E6AD2] hover:bg-[#4A56B8] text-white"
        >
          <Activity className="w-4 h-4 mr-2" />
          Log Activity
        </Button>
      </div>

      <div className="space-y-2">
        {activities.length === 0 ? (
          <p className="text-sm text-[#8A8A8A] text-center py-8">
            No activities yet
          </p>
        ) : (
          activities.map((activity: ActivityItem) => (
            <div
              key={activity._id}
              className="flex items-start gap-3 p-3 rounded-md hover:bg-[#141414] transition-colors"
            >
              <div className={`mt-0.5 ${getStatusColor(activity.status)}`}>
                {getStatusIcon(activity.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm text-white">
                    {activity.action}
                  </p>
                  <span className="text-xs text-[#8A8A8A]">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-[#8A8A8A] truncate">
                  {activity.description}
                </p>
                <p className="text-xs text-[#5E6AD2] mt-1">{activity.agent}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function ActivitiesList() {
  return (
    <Suspense fallback={<div className="text-[#8A8A8A]">Loading activities...</div>}>
      <ActivitiesContent />
    </Suspense>
  );
}

