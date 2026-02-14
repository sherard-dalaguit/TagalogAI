"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "./user-menu";
import { cn } from "@/lib/utils";
import { Home, PlayCircle, Settings, Menu } from "lucide-react";

const navLinks = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Practice", href: "/practice", icon: PlayCircle },
  { name: "Settings", href: "/settings", icon: Settings },
];

export const Navbar = ({ user }: { user?: any }) => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:px-14">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">
            Tagalog<span className="text-indigo-500">AI</span>
          </span>
        </Link>

        {/* Middle: Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white",
                  isActive ? "text-white" : "text-zinc-400"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Right: Auth & Mobile Menu Toggle */}
        <div className="flex items-center gap-4">
          <UserMenu user={user} />
          <button
            className="md:hidden text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-950 px-6 py-4 space-y-4">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 text-sm font-medium transition-colors hover:text-white",
                  isActive ? "text-white" : "text-zinc-400"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={18} />
                {link.name}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
};
