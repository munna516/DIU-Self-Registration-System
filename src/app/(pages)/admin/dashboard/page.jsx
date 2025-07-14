"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, UserCheck, BookOpen, ClipboardList, Calendar, Lock } from "lucide-react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const stats = [
  {
    title: "Total Students",
    icon: <Users className="w-8 h-8 text-blue-600" />,
    count: 1200,
    color: "bg-blue-50",
  },
  {
    title: "Total Teachers",
    icon: <UserCheck className="w-8 h-8 text-green-600" />,
    count: 80,
    color: "bg-green-50",
  },
  {
    title: "Total Courses",
    icon: <BookOpen className="w-8 h-8 text-purple-600" />,
    count: 45,
    color: "bg-purple-50",
  },
  {
    title: "Total Registration",
    icon: <ClipboardList className="w-8 h-8 text-yellow-600" />,
    count: 1100,
    color: "bg-yellow-50",
  },
  {
    title: "Ongoing Semester",
    icon: <Calendar className="w-8 h-8 text-pink-600" />,
    count: "Spring 2025",
    color: "bg-pink-50",
  },
  {
    title: "Registration Status",
    icon: <Lock className="w-8 h-8 text-red-600" />,
    count: "Open",
    color: "bg-red-50",
  },
];

const pieData = {
  labels: ["CSE", "EEE", "BBA", "ENG", "LAW"],
  datasets: [
    {
      label: "Registrations",
      data: [400, 300, 200, 150, 50],
      backgroundColor: [
        "#2563eb", // blue-600
        "#059669", // green-600
        "#a21caf", // purple-800
        "#f59e42", // orange-400
        "#e11d48", // rose-600
      ],
      borderWidth: 2,
    },
  ],
};

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      labels: {
        color: "#334155",
        font: { size: 14 },
      },
    },
  },
};

export default function AdminDashboard() {
  return (
    <div className="">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className={`flex items-center justify-between p-6 ${stat.color}`}>
            <div className="flex flex-col  gap-4">
              <div className="p-5   ">
                {stat.icon}
              </div>
              <div>
                <CardTitle className="text-lg font-semibold">{stat.title}</CardTitle>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-700 dark:text-white">
              {stat.count}
            </div>
          </Card>
        ))}
      </div>
      {/* Chart */}
      <Card className="p-6 mt-10 mb-20">
        <CardHeader>
          <CardTitle>Course Registration Per Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex flex-col items-center justify-center">
            <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
              <Doughnut data={pieData} options={pieOptions} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
