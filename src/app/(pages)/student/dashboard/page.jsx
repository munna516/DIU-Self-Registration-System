"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BookOpen, Layers, Calendar, Clock } from "lucide-react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const stats = [
  {
    title: "Registered Courses",
    icon: <BookOpen className="w-8 h-8 text-blue-600" />,
    value: 7,
    color: "bg-blue-50",
  },
  {
    title: "Total Credit",
    icon: <Layers className="w-8 h-8 text-green-600" />,
    value: 21,
    color: "bg-green-50",
  },
  {
    title: "Semester",
    icon: <Calendar className="w-8 h-8 text-purple-600" />,
    value: "Spring 2025",
    color: "bg-purple-50",
  },
  {
    title: "Deadline",
    icon: <Clock className="w-8 h-8 text-red-600" />,
    value: "2025-03-15",
    color: "bg-red-50",
  },
];

const barData = {
  labels: [
    "CSE101",
    "CSE102",
    "CSE201",
    "CSE202",
    "CSE301",
    "CSE302",
    "CSE401",
  ],
  datasets: [
    {
      label: "Credit Hours",
      data: [3, 3, 3, 3, 3, 3, 3],
      backgroundColor: [
        "#2563eb",
        "#059669",
        "#a21caf",
        "#f59e42",
        "#e11d48",
        "#fbbf24",
        "#10b981",
      ],
      borderRadius: 8,
      borderWidth: 1,
    },
  ],
};

const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: "#334155",
        font: { size: 14 },
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "#e5e7eb",
      },
      ticks: {
        color: "#334155",
        font: { size: 14 },
        stepSize: 1,
      },
    },
  },
};

export default function Dashboard() {
  return (
    <div className="">
      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Card
            key={idx}
            className={`flex items-center justify-between p-6 ${stat.color} dark:bg-slate-800`}
          >
            <div className="">
              <div className="p-5">{stat.icon}</div>
              <div>
                <CardTitle className="text-lg font-semibold">
                  {stat.title}
                </CardTitle>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-700 dark:text-white">
              {stat.value}
            </div>
          </Card>
        ))}
      </div>
      {/* Bar Chart */}
      <Card className="p-6 mt-10 mb-20 dark:bg-slate-800">
        <CardHeader>
          <CardTitle>Credit Hours by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex flex-col items-center justify-center ">
            <div className="w-full sm:max-w-sm md:max-w-md lg:max-w-2xl ">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
