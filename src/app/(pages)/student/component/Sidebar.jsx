"use client";
import Image from "next/image";
import diu from "../../../../../public/assets/logos/diu.jpg";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { LayoutDashboard, List, Menu, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

const navMain = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/student/dashboard" },
  { label: "Profile", icon: User, href: "/student/profile" },
  { label: "Teacher List", icon: List, href: "/student/teacher-list" },
];

export default function Sidebar({
  isSidebarOpen,
  mobileSidebar,
  setMobileSidebar,
}) {
  const { data: session } = useSession();
  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
    toast.success("Signed out successfully");
  };
  const SidebarContent = (
    <div className="flex flex-col ">
      {/* Logo */}
      <div className="flex justify-center  items-center mt-5 ">
        <Image src={diu} alt="DIU Logo" className="h-16 w-16 mb-2 rounded-lg" />
      </div>
      {/* Profile */}
      <div className="flex flex-col items-center py-4">
        <img
          src="https://randomuser.me/api/portraits/men/32.jpg"
          alt="Profile"
          className="w-12 h-12 lg:w-16 lg:h-16 rounded-full border-4 border-green-100 shadow mb-2"
        />
        {(isSidebarOpen || mobileSidebar) && (
          <div className="font-semibold">{session?.user?.name}</div>
        )}
        <div className="text-sm text-green-500 mt-2 font-bold uppercase ">
          {session?.user?.role}
        </div>
      </div>
      {/* Main Navigation */}
      <div className="px-6 mt-4">
        <div className="text-xs text-gray-400 font-semibold mb-3">MAIN</div>
        <nav className="flex flex-col gap-1">
          {navMain.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 dark:text-white hover:bg-green-100 hover:text-green-700   dark:hover:text-black transition"
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
      <div className={`hidden md:flex  justify-center  w-full`}>
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
              <SheetTitle>Pay ESV</SheetTitle>
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
