"use client";

import { GitBranch, GitCommit, GitPullRequestIcon, MessageSquareText } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

const HandleWebhookTrigger = () => {
  useEffect(() => {
    const eventSource = new EventSource("/api/webhook-events");
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        let icon, message;
        switch (data.eventType) {
          case "push":
            icon = <GitCommit className="h-4 w-4" />;
            message = "New commit pushed";
            break;
          case "merge":
            icon = <GitBranch className="h-4 w-4" />;
            message = "Branch merged";
            break;
          case "pull_request":
            icon = <GitPullRequestIcon className="h-4 w-4" />;
            message = `New pull request ${data.payload.action as string}`;
            break;
          case "fork":
            icon = <GitCommit className="h-4 w-4" />;
            message = "New fork";
            break;
          case "issue_comment":
            icon = <MessageSquareText className="h-4 w-4" />;
            message = "New issue comment";
            break;
          default:
            icon = <GitCommit className="h-4 w-4" />;
            message = "Unknown event";
        }
        toast(`${message}. Refresh to see change!`, {
          icon,
          action: {
            label: "Refresh",
            onClick: () => location.reload(),
          },
        });
      } catch (error) {
        console.log("Error parsing event data", error);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return <></>;
};

export default HandleWebhookTrigger;
