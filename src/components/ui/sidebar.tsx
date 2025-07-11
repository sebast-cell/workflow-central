'use client';

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { PanelLeft, Pin, PinOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_PINNED_COOKIE_NAME = "sidebar_pinned_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

// --- CORRECCIÓN AÑADIENDO openMobile y setOpenMobile ---
interface SidebarContextType {
  isOpen: boolean
  isPinned: boolean
  isMobile: boolean
  onOpenChange: (open: boolean) => void
  togglePin: () => void
  toggleSidebar: () => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
}

const SidebarContext = React.createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const { isMobile } = useIsMobile()
  const [isOpen, setIsOpen] = React.useState(true)
  const [isPinned, setIsPinned] = React.useState(true)
  const [openMobile, setOpenMobile] = React.useState(false)

  React.useEffect(() => {
      const pinnedCookie = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${SIDEBAR_PINNED_COOKIE_NAME}=`))
        ?.split("=")[1]
      
      const pinned = pinnedCookie ? pinnedCookie === 'true' : true
      setIsPinned(pinned)
      setIsOpen(pinned)
  }, [])

  const onOpenChange = (open: boolean) => {
    if (!isPinned) {
      setIsOpen(open)
    }
  }

  const togglePin = () => {
    const newPinState = !isPinned
    setIsPinned(newPinState)
    setIsOpen(newPinState)
    document.cookie = `${SIDEBAR_PINNED_COOKIE_NAME}=${newPinState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }

  const toggleSidebar = () => {
    if (isMobile) {
      setOpenMobile((v) => !v)
    } else {
      togglePin()
    }
  }

  const contextValue: SidebarContextType = {
    isOpen: isMobile ? true : isOpen,
    isPinned,
    isMobile,
    onOpenChange, 
    togglePin,
    toggleSidebar,
    openMobile, 
    setOpenMobile
  }

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "fixed inset-y-0 z-40 h-svh bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out",
  {
    variants: {
      side: {
        left: "left-0 border-r border-sidebar-border",
        right: "right-0 border-l border-sidebar-border",
      },
      state: {
        expanded: "w-[240px]",
        collapsed: "w-14",
      },
    },
    defaultVariants: {
      side: "left",
      state: "expanded",
    },
  }
)

export const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen, isMobile, onOpenChange, openMobile, setOpenMobile } = useSidebar()
  const state = isOpen ? "expanded" : "collapsed"
  
  if (isMobile) {
    return (
       <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-[240px] bg-sidebar p-0 text-sidebar-foreground border-sidebar-border [&>button]:hidden">
          <div ref={ref} className={cn("flex h-full flex-col", className)} {...props} />
        </SheetContent>
      </Sheet>
    )
  }
  
  return (
    <aside
      ref={ref}
      className={cn(
        "group/sidebar flex flex-col",
        sidebarVariants({ state }),
        className
      )}
      onMouseEnter={() => onOpenChange(true)}
      onMouseLeave={() => onOpenChange(false)}
      data-state={state}
      {...props}
    />
  )
})
Sidebar.displayName = "Sidebar"


export const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isOpen, isMobile } = useSidebar();
  const [style, setStyle] = React.useState({});

  React.useEffect(() => {
    setStyle({
        transition: 'margin-left 300ms ease-in-out',
        marginLeft: isMobile ? '0' : (isOpen ? '240px' : '3.5rem')
    });
  }, [isOpen, isMobile]);

  return (
    <main
      ref={ref}
      className={cn(
        "relative flex min-h-svh flex-1 flex-col bg-background",
        className
      )}
      style={style}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


export const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar();
  
  if (!isMobile) return null;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      className={cn(className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

export const SidebarPin = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { isPinned, togglePin, isOpen } = useSidebar()

  return (
    <button
      ref={ref}
      onClick={togglePin}
      className={cn(
        "flex items-center justify-center p-2 text-sidebar-muted-foreground outline-none ring-sidebar-ring transition-opacity hover:text-sidebar-foreground focus-visible:ring-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isOpen ? "opacity-100" : "opacity-0",
        className
      )}
      disabled={!isOpen}
      {...props}
    >
      {isPinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
      <span className="sr-only">{isPinned ? "Unpin sidebar" : "Pin sidebar"}</span>
    </button>
  )
})
SidebarPin.displayName = "SidebarPin"

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-2 p-3", className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-1 flex-col gap-1 overflow-auto px-3", className)}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col p-3 mt-auto", className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-col gap-1", className)}
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.LiHTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-3 overflow-hidden rounded-md p-2 text-left text-sm font-medium text-sidebar-foreground outline-none ring-sidebar-ring transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:h-5 [&_svg]:w-5 [&_svg]:shrink-0",
  {
    variants: {
      active: {
        true: "bg-sidebar-active text-sidebar-active-foreground",
      },
      collapsed: {
        true: "justify-center [&>span]:hidden",
      }
    },
  }
)

export const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: React.ComponentProps<typeof TooltipContent>
  }
>(({ asChild, isActive, tooltip, className, children, ...props }, ref) => {
  const { isOpen, isMobile } = useSidebar()
  const Comp = asChild ? Slot : "button"
  
  const isEffectivelyCollapsed = !isOpen && !isMobile

  const button = (
      <Comp
        ref={ref}
        className={cn(sidebarMenuButtonVariants({ active: isActive, collapsed: isEffectivelyCollapsed }), className)}
        {...props}
      >
        {children}
      </Comp>
  )
  
  if (!tooltip || isMobile) {
    return button;
  }

  return (
    <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent {...tooltip} hidden={isOpen}>
            {tooltip.children}
        </TooltipContent>
    </Tooltip>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"