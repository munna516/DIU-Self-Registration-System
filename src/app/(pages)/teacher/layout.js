"use client";
import { useState } from "react";
import Sidebar from "./component/Sidebar";
import TopNavbar from "./component/TopNavbar";

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden ">
        <div
          className={`
            hidden md:flex overflow-y-auto hide-scrollbar border-r-2 dark:border-0 border-gray-200
            transition-all duration-700 ease-in-out dark:bg-gray-800
            ${isSidebarOpen ? "w-0 md:w-[25%]" : "w-[7%]"}
          `}
        >
          <Sidebar
            isSidebarOpen={isSidebarOpen}
            setMobileSidebar={setMobileSidebar}
            mobileSidebar={mobileSidebar}
          />
        </div>
        <div className={`${isSidebarOpen ? "w-[100%]" : "w-[100%]"}  `}>
          <div>
            <TopNavbar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
              mobileSidebar={mobileSidebar}
              setMobileSidebar={setMobileSidebar}
            />
          </div>
          <div className="p-4 md:p-8 bg-[#f2f2f2] dark:bg-slate-900 h-full overflow-y-auto hide-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
