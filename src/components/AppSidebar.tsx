import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import { 
  Brain, 
  FileText, 
  BarChart3, 
  Settings, 
  User, 
  ClipboardCheck,
  Home,
  Heart,
  Building2,
  Share2,
  Sparkles,
  CalendarDays,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { MIND_TRACK_7_PRICE, MIND_TRACK_PRICE } from "@/constants/tokenCosts"

const mindTrackItems = [
  { title: `7일 마음 트랙 · ₩${MIND_TRACK_7_PRICE.toLocaleString()}`, url: "/mind-track", icon: Sparkles, badge: "추천" },
]

const mainItems = [
  { title: "홈", url: "/", icon: Home },
  { title: "AI 분석", url: "/observation", icon: Brain },
  { title: "AI 음성일기", url: "/voice-emotion-diary", icon: Heart },
  { title: "관찰일지", url: "/observation", icon: FileText },
  { title: "나만의 맞춤리포팅 신청", url: "/comprehensive-reporting", icon: ClipboardCheck },
  { title: "데이터 공유 관리", url: "/data-sharing", icon: Share2 },
]

const institutionItems = [
  { title: "고객 관리 대시보드", url: "/institution-clients", icon: Building2 },
]

const accountItems = [
  { title: "프로필", url: "/profile", icon: User },
  { title: "설정", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const isMainExpanded = mainItems.some((i) => isActive(i.url))
  const isAccountExpanded = accountItems.some((i) => isActive(i.url))

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "flex items-center gap-2 bg-accent text-white font-semibold" 
      : "flex items-center gap-2 text-white hover:bg-accent/50"

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-medium">마음 트랙</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mindTrackItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4 text-amber-300" />
                      {state !== "collapsed" && (
                        <span className="flex items-center gap-1.5 text-xs">
                          {item.title}
                          {item.badge && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-200 text-[9px] font-bold">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-medium">메인</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-medium">기관 관리</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {institutionItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-medium">계정</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="h-4 w-4" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}