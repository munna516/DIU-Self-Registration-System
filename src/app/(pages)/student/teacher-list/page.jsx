"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const teachersData = [
  {
    name: "Fatema Tuj Johora",
    email: "fatema.tuz@diu.edu",
    designation: "Assistant Professor",
    mobile: "01717171717",
    room: "KT-726",
    department: "CSE",
  },
  {
    name: "Md Ashikur Rahman",
    email: "ashikur.rahman@diu.edu",
    designation: "Assistant Professor",
    mobile: "01717171717",
    room: "302",
    department: "EEE",
  },
  {
    name: "Md Moniruzzaman",
    email: "moniruzzaman@diu.edu",
    designation: "Head of Department",
    mobile: "01717171717",
    room: "KT-726",
    department: "CSE",
  },
  {
    name: "Dr. Fazlul Hoque",
    email: "fazlul.hoque@diu.edu",
    designation: "Associate Professor",
    mobile: "01717171717",
    room: "KT-505",
    department: "CSE",
  },
  {
    name: "Md Soyeb Hossain",
    email: "soyeb.hossain@diu.edu",
    designation: "Lecturer",
    mobile: "01717171717",
    room: "KT-1202",
    department: "ENG",
  },
  {
    name: "Md. Shahriar Hossain",
    email: "shahriar.hossain@diu.edu",
    designation: "Lecturer",
    mobile: "01717171717",
    room: "820",
    department: "BBA",
  },
  {
    name: "Md. Shakil Hossain",
    email: "shakil.hossain@diu.edu",
    designation: "Lecturer",
    mobile: "01717171717",
    room: "101",
    department: "LAW",
  },
  {
    name: "Md. Sojib Hossain",
    email: "sojib.hossain@diu.edu",
    designation: "Lecturer",
    mobile: "01717171717",
    room: "101",
    department: "CSE",
  },
];

export default function TeacherList() {
  const [search, setSearch] = useState("");

  const filteredTeachers = teachersData.filter((teacher) => {
    const q = search.toLowerCase();
    return (
      teacher.name.toLowerCase().includes(q) ||
      teacher.designation.toLowerCase().includes(q) ||
      teacher.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="">
      <Card className="p-6 dark:bg-slate-800">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-bold">Teachers List</CardTitle>
          <div className="w-80">
            <Input
              type="text"
              placeholder="Search by name, designation, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-blue-300 dark:border-gray-700"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mt-3">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    #
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Designation
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Mobile
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Room
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200">
                    Department
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-500 dark:text-gray-300"
                    >
                      No teachers found.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher, idx) => (
                    <tr key={teacher.email}>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                        {teacher.name}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {teacher.email}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {teacher.designation}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {teacher.mobile}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {teacher.room}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">
                        {teacher.department}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
