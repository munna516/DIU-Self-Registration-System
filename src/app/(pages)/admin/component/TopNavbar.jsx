"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Menu, User } from "lucide-react";

import { Moon, Sun } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TopNavbar({
  isSidebarOpen,
  setIsSidebarOpen,
  mobileSidebar,
  setMobileSidebar,
}) {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/admin/login" });
    toast.success("Logged out successfully");
  };
  return (
    <nav className="h-16  border-b dark:border-0  border-gray-200 flex px-4 z-20 dark:bg-gray-800">
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10 rounded-full">
                    <AvatarImage
                      src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      alt="Profile"
                    />
                    <AvatarFallback>
                      {session?.user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Hello{" "}
                      <span className="font-bold text-green-500 ml-2">
                        {session?.user?.name || "Admin"}
                      </span>
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={`/admin/profile`} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400 cursor-pointer"
                  onClick={() => handleSignOut()}
                >
                  <LogOut className="mr-2 h-4 w-4 font-bold" />
                  <span className="font-bold">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
