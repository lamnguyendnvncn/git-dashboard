import SettingAccessForm from "@/components/SettingAccessForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GitFork, GitPullRequest, Star } from "lucide-react";

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN;
// Mock repository data - in a real app, this would come from an API
const repositoryData = {
  name: "github-dashboard",
  description: "A dashboard for monitoring GitHub repository activities",
  url: "https://github.com/username/github-dashboard",
  owner: "username",
  stars: 42,
  forks: 12,
  watchers: 8,
  lastUpdated: "2023-04-15T10:30:00Z",
  defaultBranch: "main",
  isPrivate: false,
};

const fetchData = async () => {
  const url = `https://api.github.com/repos/lamnguyendnvncn/dummy_repo`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${GITHUB_ACCESS_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!response.ok) {
    return { error: "Failed to fetch repo info" };
  }

  return response.json();
};

const SettingsPage = async () => {
  const data = await fetchData();
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`space-y-6 transition-all duration-300`}>
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Repository Settings</h2>
        <p className="text-muted-foreground">Manage your repository settings and access tokens.</p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Repository Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Repository Information</CardTitle>
            <CardDescription>Details about the repository being monitored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium">Name</h3>
              <p className="text-sm text-muted-foreground">{repositoryData.name}</p>
            </div>
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-sm text-muted-foreground">{repositoryData.description}</p>
            </div>
            <div>
              <h3 className="font-medium">URL</h3>
              <p className="text-sm text-muted-foreground">
                <a href={repositoryData.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {repositoryData.url}
                </a>
              </p>
            </div>
            <div>
              <h3 className="font-medium">Owner</h3>
              <p className="text-sm text-muted-foreground">{repositoryData.owner}</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{repositoryData.stars}</span>
              </div>
              <div className="flex items-center gap-2">
                <GitFork className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{repositoryData.forks}</span>
              </div>
              <div className="flex items-center gap-2">
                <GitPullRequest className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{repositoryData.watchers}</span>
              </div>
            </div>
            <div>
              <h3 className="font-medium">Last Updated</h3>
              <p className="text-sm text-muted-foreground">{formatDate(repositoryData.lastUpdated)}</p>
            </div>
            <div>
              <h3 className="font-medium">Default Branch</h3>
              <p className="text-sm text-muted-foreground">{repositoryData.defaultBranch}</p>
            </div>
            <div>
              <h3 className="font-medium">Visibility</h3>
              <p className="text-sm text-muted-foreground">{repositoryData.isPrivate ? "Private" : "Public"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Settings Form Card */}
        <SettingAccessForm />
      </div>
    </div>
  );
};

export default SettingsPage;
