"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Activity,
  AreaChart,
  Calendar,
  FileText,
  HelpCircle,
  Home,
  LineChart,
  RefreshCw,
  Search,
  Settings,
  TrendingUp,
  User,
  Cloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DatePickerWithRange } from "@/components/date-picker-with-range"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [dateRange, setDateRange] = useState({
    from: new Date(2023, 0, 1),
    to: new Date(),
  })

  return (
    <SidebarProvider>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Activity className="h-6 w-6 text-emerald-500" />
            <span className="hidden md:inline-block">HealthEconomics Dashboard</span>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden md:block">
              <DatePickerWithRange dateRange={dateRange} setDateRange={setDateRange} />
            </div>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Actualizar datos</span>
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Search className="h-4 w-4" />
                  <span className="sr-only">Buscar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Input placeholder="Buscar..." />
                  </div>
                  <div className="grid gap-2">
                    <h3 className="text-sm font-medium">Búsquedas recientes</h3>
                    <ul className="grid gap-2">
                      <li>
                        <Link href="#" className="block rounded-md border p-2 text-sm hover:bg-muted">
                          Costos de Urgencias - Último mes
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="block rounded-md border p-2 text-sm hover:bg-muted">
                          Comparativo NSE - Hospitalización
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="block rounded-md border p-2 text-sm hover:bg-muted">
                          Tendencias anuales - Laboratorios
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Configuración</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Usuario</span>
            </Button>
          </div>
        </header>
        <div className="flex flex-1">
          <Sidebar>
            <SidebarHeader>
              <SidebarTrigger />
            </SidebarHeader>
            <SidebarContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/"}>
                    <Link href="/">
                      <Home className="h-4 w-4" />
                      <span>Vista General</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/areas"}>
                    <Link href="/areas">
                      <AreaChart className="h-4 w-4" />
                      <span>Análisis por Áreas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/trends"}>
                    <Link href="/trends">
                      <TrendingUp className="h-4 w-4" />
                      <span>Tendencias Temporales</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/predictive"}>
                    <Link href="/predictive">
                      <LineChart className="h-4 w-4" />
                      <span>Análisis Predictivo</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/aws-hybrid"}>
                    <Link href="/aws-hybrid">
                      <Cloud className="h-4 w-4" />
                      <span>AWS Híbrido</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/reports"}>
                    <Link href="/reports">
                      <FileText className="h-4 w-4" />
                      <span>Reportes y Exportación</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <div className="p-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>Última actualización: 14/05/2025 18:30</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <HelpCircle className="h-3 w-3" />
                  <Link href="#" className="hover:underline">
                    Ayuda y soporte
                  </Link>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
