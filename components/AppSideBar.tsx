import { GitBranch, GitPullRequest, Home } from "lucide-react";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    group: "Overview",
    items: [{ title: "Dashboard", url: "/", icon: Home }],
  },
  {
    group: "Repository",
    items: [{ title: "Code Review", url: "/code-review", icon: GitPullRequest }],
  },
  {
    group: "Settings",
    items: [{ title: "Repository Settings", url: "/settings", icon: GitBranch }],
  },
];

const AppSideBar = () => {
  return (
    <Sidebar>
      <SidebarHeader className="border-b p-[18px]">
        <h2 className="text-xl font-semibold">GitTrack Dashboard</h2>
      </SidebarHeader>
      <SidebarContent>
        {items.map((item) => (
          <SidebarGroup key={item.group}>
            <SidebarGroupLabel>{item.group}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((subItem) => (
                  <SidebarMenuItem key={subItem.title}>
                    <SidebarMenuButton asChild>
                      <a href={subItem.url}>
                        <subItem.icon />
                        <span>{subItem.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSideBar;
