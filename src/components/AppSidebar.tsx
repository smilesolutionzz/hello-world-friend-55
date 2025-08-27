import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Clock, 
  BookOpen, 
  MessageCircle, 
  Info, 
  Crown, 
  History, 
  Users, 
  Brain, 
  Shield,
  FileText
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "홈", url: "/", icon: Home },
  { title: "3분체크", url: "/assessment", icon: Clock },
  { title: "검사기록", url: "/assessment-history", icon: History },
  { title: "프리미엄검사", url: "/premium-assessment", icon: Crown },
  { title: "관찰일지", url: "/observation", icon: BookOpen },
];

const counselingItems = [
  { title: "상담", url: "/counseling", icon: MessageCircle },
  { title: "AI 상담", url: "/ai-counselor", icon: Brain },
];

const expertItems = [
  { title: "전문가 고용", url: "/experts", icon: Users },
  { title: "제휴기관", url: "/institutions", icon: FileText },
];

const otherItems = [
  { title: "가족케어", url: "/family", icon: Users },
  { title: "구독플랜", url: "/token-subscription", icon: Shield },
  { title: "FAQ", url: "/faq", icon: Info },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={isCollapsed ? "w-14" : "w-64"}
      variant="sidebar"
      collapsible="icon"
    >
      <SidebarContent className="bg-background/95 backdrop-blur-sm">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-sm font-bold text-primary">
            메인 메뉴
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-5 h-5 mr-3" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-sm font-bold text-primary">
            상담 서비스
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {counselingItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-5 h-5 mr-3" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-sm font-bold text-primary">
            전문가 연결
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {expertItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-5 h-5 mr-3" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-sm font-bold text-primary">
            기타
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {otherItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className="w-5 h-5 mr-3" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}