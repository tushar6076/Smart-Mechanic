"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Wrench, 
  ShoppingCart, 
  Compass, 
  CalendarDays, 
  User as UserIcon, 
  LogOut, 
  LogIn,
  LayoutDashboard
} from "lucide-react";

export default function UserNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // 📡 Live Telemetry State Vectors
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false); 
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function syncNavbarAuthVector() {
      try {
        const res = await fetch("/api/auth/session");
        
        if (res.ok) {
          const data = await res.json();
          
          // 🟢 FIXED CRITICAL CONDITION: Depend strictly on server auth metadata response
          if (data && data.user && data.user.id) {
            if (isMounted) {
              setIsSignedIn(true);
              setUserName(data.user.name || "User Node");
            }
            return;
          }
        }

        // 🟢 FIXED: If the server returns no active user, force the signed-out Login view by default!
        // This stops old localStorage guest flags from faking a live sign-in state.
        if (isMounted) {
          setIsSignedIn(false);
          setUserName(null);
        }
      } catch (err) {
        console.error("Navbar authorization synchronizer drop:", err);
        if (isMounted) {
          setIsSignedIn(false);
          setUserName(null);
        }
      }
    }

    syncNavbarAuthVector();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleGlobalSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout execution communication delay:", err);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sm_returning_guest");
        sessionStorage.removeItem("sm_session_active");
      }
      setIsSignedIn(false);
      setUserName(null);
      router.push("/home");
    }
  };

  const navLinks = [
    { name: "Home", href: "/user", icon: LayoutDashboard },
    { name: "Explore", href: "/user/explore", icon: Compass },
    { name: "Appointment", href: "/user/appointment", icon: CalendarDays },
    { name: "Cart", href: "/user/cart", icon: ShoppingCart },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-2">
          <Link href="/user" className="flex items-center gap-2 group">
            <div className="rounded-xl bg-primary p-2 text-white group-hover:bg-red-700 transition-colors">
              <Wrench size={18} className="rotate-45 group-hover:rotate-90 transition-transform duration-300" />
            </div>
            <span className="text-xl font-black uppercase italic tracking-tighter text-white">
              SMART<span className="text-primary">MECHANIC</span>
            </span>
          </Link>
        </div>

        {/* CENTER NAVIGATION LINKS */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = link.href === "/user" 
              ? pathname === "/user" 
              : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200",
                  isActive 
                    ? "bg-zinc-900 text-primary border border-zinc-800" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                )}
              >
                <Icon size={14} />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* RIGHT SIDE PROFILE CONTROLS */}
        <div className="flex items-center gap-4">
          
          {/* 🟢 CONDITIONAL SWITCH: If false, it renders your original structured Button style */}
          {!isSignedIn ? (
            <Link href="/auth/login">
              <Button className="bg-primary hover:bg-red-700 text-white font-bold uppercase tracking-widest text-control h-9 px-4">
                Login <LogIn size={14} className="ml-2" />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/user/profile" 
                className={cn(
                  "flex items-center justify-center h-9 w-9 rounded-full bg-zinc-900 border text-zinc-400 hover:text-white transition-all overflow-hidden text-xs font-mono font-bold uppercase",
                  pathname.startsWith("/user/profile") ? "border-primary" : "border-zinc-800 hover:border-zinc-700"
                )}
                title={userName || "Profile Command"}
              >
                {userName ? userName.substring(0, 2) : <UserIcon size={16} />}
              </Link>

              <button 
                onClick={handleGlobalSignOut}
                className="p-2 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-zinc-900/30 transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}