import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GitBranch, GitCommit, GitPullRequest, Users } from "lucide-react";

export const revalidate = 1;

const fetchData = async () => {
  const response = await fetch("http://localhost:3001/api/github-webhook");
  const data = await response.json();
  console.log(data);
  return data;
};
const getCommitsNum = (data: any) => {
  const commits = data.commits;
  const totalCommits = Object.values(commits).reduce((acc, branchCommits) => acc + branchCommits.length, 0);

  return totalCommits;
};
const getPRNums = (data: any) => {
  const prs = data.pull_requests;
  return prs.length;
};
const getBranchNums = (data: any) => {
  const branches = data.branches;
  return branches.length;
};
const getContributorNums = (data: any) => {
  const contributors = data.contributors;
  return contributors.length;
};

const DashboardPage = async () => {
  const data = await fetchData();

  return (
    <div className={`space-y-6 transition-all duration-300 max-w-full`}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
            <GitCommit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCommitsNum(data) as number}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open PRs</CardTitle>
            <GitPullRequest className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getPRNums(data) as number}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Branches</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getBranchNums(data) as number}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contributors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getContributorNums(data) as number}</div>
          </CardContent>
        </Card>
      </div>
      {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                  <AvatarFallback>SC</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Pull Request Merged</p>
                  <p className="text-sm text-muted-foreground">Fix navigation bug in dashboard</p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="secondary">Merged</Badge>
                </div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">New Branch</p>
                  <p className="text-sm text-muted-foreground">Created feature/user-settings</p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="secondary">Branch</Badge>
                </div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                  <AvatarFallback>TD</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">New Commit</p>
                  <p className="text-sm text-muted-foreground">Update README.md documentation</p>
                </div>
                <div className="ml-auto font-medium">
                  <Badge variant="secondary">Commit</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Contributors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-sm text-muted-foreground">324 commits</p>
                </div>
                <div className="ml-auto font-medium">Owner</div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                  <AvatarFallback>SD</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Sarah Davis</p>
                  <p className="text-sm text-muted-foreground">256 commits</p>
                </div>
                <div className="ml-auto font-medium">Admin</div>
              </div>
              <div className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-user.jpg" alt="@shadcn" />
                  <AvatarFallback>MC</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Mike Chen</p>
                  <p className="text-sm text-muted-foreground">198 commits</p>
                </div>
                <div className="ml-auto font-medium">Member</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div> */}
    </div>
  );
};

export default DashboardPage;
