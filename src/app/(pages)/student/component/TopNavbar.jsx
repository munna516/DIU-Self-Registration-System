"use client";

import { Button } from "@/components/ui/button";
import { Bell, Menu, User } from "lucide-react";

import { Moon, Sun } from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
export default function TopNavbar({
  isSidebarOpen,
  setIsSidebarOpen,
  mobileSidebar,
  setMobileSidebar,
}) {
  const { theme, setTheme } = useTheme();
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("Logged out successfully");
  };
  return (
    <nav className="h-16  border-b dark:border-0  border-gray-200 flex px-4 z-20 dark:bg-slate-800">
      <div className="flex items-center justify-between w-full  ">
        <div className="text-xl font-semibold">
          <Menu
            className="cursor-pointer hidden md:block"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <Menu
            className="cursor-pointer md:hidden "
            onClick={() => setMobileSidebar(!mobileSidebar)}
          />
        </div>
        <div className="flex items-center gap-4 space-x-4 cursor-pointer">
          <div
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className=""
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </div>
          <div>
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <Button variant="logout" onClick={() => handleLogout()}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
