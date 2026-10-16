"use client";

import React from "react";
import Link from "next/link";
import { 
  Wrench, 
  ShoppingBag, 
  Users, 
  CalendarDays, 
  ShieldCheck, 
  MapPin, 
  PhoneCall,
  Mail,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 text-zinc-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* 📐 THE 3-COLUMN ARCHITECTURAL GRID */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          
          {/* COLUMN 1: BRAND IDENTITY & SOCIAL CHANNELS */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-primary p-2 text-white">
                <Wrench size={16} className="rotate-45" />
              </div>
              <span className="text-lg font-black uppercase italic tracking-tighter text-white">
                SMART<span className="text-primary">MECHANIC</span>
              </span>
            </div>
            
            <p className="text-xs leading-relaxed text-zinc-500 max-w-sm">
              Your all-in-one digital garage ecosystem. Book certified mechanics for on-site services or purchase premium heavy-duty tools and diagnostic equipment effortlessly.
            </p>

            {/* 🌐 COMMUNITY HANDLES */}
            <div className="flex items-center gap-2 mt-1">
              <Link 
                href="https://www.instagram.com/hacksmithsdev"
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-pink-500 hover:border-pink-500/30 transition-all duration-200"
                title="Follow HackSmiths on Instagram"
                aria-label="Follow HackSmiths on Instagram"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </Link>

              <Link 
                href="https://x.com/hacksmithsdev"
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all duration-200"
                title="Follow HackSmiths on X"
                aria-label="Follow HackSmiths on X"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </Link>
            </div>

            {/* API Engine Status Dot */}
            <div className="flex items-center gap-2 mt-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-label font-bold uppercase tracking-wider text-zinc-500">
                All Systems Operational
              </span>
            </div>
          </div>

          {/* COLUMN 2: DISCOVER PORTAL (Guest Navigation Hub) */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200">
              Discover Platform
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs font-bold uppercase tracking-wider">
              <li>
                <Link href="/user/explore/products" className="flex items-center gap-2 hover:text-white transition-colors">
                  <ShoppingBag size={14} className="text-zinc-600" /> Browse Tools & Equipment
                </Link>
              </li>
              <li>
                <Link href="/user/explore/workers" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Users size={14} className="text-zinc-600" /> Find Professional Mechanics
                </Link>
              </li>
              <li>
                <Link href="/user/appointment" className="flex items-center gap-2 hover:text-white transition-colors">
                  <CalendarDays size={14} className="text-zinc-600" /> Schedule an Appointment
                </Link>
              </li>
            </ul>
          </div>

          {/* COLUMN 3: CORPORATE ADDR, TELEPHONY, & PAYMENTS */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-200">
              Secure Operations
            </h3>
            <div className="flex flex-col gap-3 text-xs text-zinc-500">
              {/* Location Node */}
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-zinc-600 shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Smart+Mechanic+Workspace+Ltd%2C+GE+Road%2C+Durg%2C+Chhattisgarh+491001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-relaxed hover:text-white transition-colors"
                >
                  Smart Mechanic Workspace Ltd,<br />
                  GE Road, Durg, Chhattisgarh, 491001
                </a>
              </div>
              
              {/* Support Telephony */}
              <div className="flex items-center gap-2.5">
                <PhoneCall size={15} className="text-zinc-600 shrink-0" />
                <a href="tel:+917000435413" className="font-bold tracking-wide text-zinc-400 hover:text-white transition-colors">
                  +91 70004 35413
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-zinc-600 shrink-0" />
                <a href="mailto:contact@hacksmiths.dev" className="text-zinc-400 hover:text-white transition-colors">
                  contact@hacksmiths.dev
                </a>
              </div>

              {/* Gateway Core Hook */}
              <div className="flex items-start gap-2.5 border-t border-zinc-900 pt-3 mt-1">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  Checkout uses Razorpay test mode only; no real payment or live charge can be made.
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 🛑 HORIZONTAL DIVIDER */}
        <div className="my-8 h-px w-full bg-zinc-900" />

        {/* 📝 THE BASE LEVEL: EXCLUSIVE LEGAL & BOUNDARIES */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between text-control font-medium tracking-wide text-zinc-600">
          <div>
            <p>© {new Date().getFullYear()} SMART MECHANIC. All Rights Reserved.</p>
          </div>
        </div>

      </div>
    </footer>
  );
}