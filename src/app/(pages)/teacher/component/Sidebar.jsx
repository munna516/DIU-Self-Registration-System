"use client";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  UserCircle,
  Ticket,
  LogOut,
  LayoutDashboard,
  Menu,
  User,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";
import diu from "../../../../../public/assets/logos/diulogoside.png";
import Image from "next/image";
import { usePathname } from "next/navigation";
const navMain = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/teacher/dashboard" },
  { label: "Profile", icon: User, href: "/teacher/profile" },
];

export default function Sidebar({
  isSidebarOpen,
  mobileSidebar,
  setMobileSidebar,
}) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const isActive = (href) => {
    return pathname === href;
  };
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    toast.success("Signed out successfully");
  };
  const SidebarContent = (
    <div className="flex flex-col ">
      {/* Logo */}
      {(isSidebarOpen || mobileSidebar) && (
        <div className="flex justify-center  items-center mt-5 ">
          <Image src={diu} alt="DIU Logo" className="w-full mb-2 px-2" />
        </div>
      )}
      {/* Profile */}
      <div className="flex flex-col items-center py-4"> 
        <img
          src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
          alt="Profile"
          className="w-12 h-12 lg:w-16 lg:h-16 rounded-full border-4 border-green-100 shadow mb-2"
        />
        {(isSidebarOpen || mobileSidebar) && (
          <div
            className={`font-semibold ${
              mobileSidebar
                ? "text-black dark:text-white"
                : "text-gray-700 dark:text-white"
            }`}
          >
            {session?.user?.name}
          </div>
        )}
        <div
          className={`text-sm ${
            mobileSidebar
              ? "text-black dark:text-white"
              : "text-gray-700 dark:text-white"
          } font-semibold mt-2`}
        >
          {isSidebarOpen || mobileSidebar ? "Id:" : ""} {session?.user?.teacherId}
        </div>
        <div
          className={`text-sm ${
            mobileSidebar
              ? "text-black dark:text-white"
              : "text-gray-700 dark:text-white"
          } font-semibold mt-2`}
        >
          {session?.user?.role.toUpperCase()}
        </div>
      </div>
      {/* Main Navigation */}
      <div className="px-6 mt-4">
        <div
          className={`text-xs ${
            mobileSidebar
              ? "text-black dark:text-white"
              : "text-gray-700 dark:text-white"
          } font-semibold mb-3`}
        >
          MAIN
        </div>
        <nav className="flex flex-col gap-1">
          {navMain.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition ${
                isActive(item.href)
                  ? "text-green-600 bg-green-100 dark:bg-white dark:text-green-600"
                  : "text-gray-700 dark:text-white  "
              }`}
            >
              <item.icon className="w-5 h-5 lg:w-7 lg:h-7 font-semibold " />
              {(isSidebarOpen || mobileSidebar) && (
                <span className="text-sm lg:text-base font-semibold">
                  {item.label}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className={`hidden md:flex  justify-center  w-full bg-green-200 dark:bg-slate-800`}
      >
        {SidebarContent}
      </div>

      {/* Mobile Sidebar */}
      <div className="flex md:hidden ">
        <Sheet open={mobileSidebar} onOpenChange={setMobileSidebar}>
          <SheetTrigger asChild>
            <button className="p-2 m-2 rounded-md border border-gray-200 bg-green-500 shadow">
              <Menu />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <VisuallyHidden>
              <SheetTitle></SheetTitle>
            </VisuallyHidden>
            <div className="h-full overflow-y-auto hide-scrollbar">
              {SidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
