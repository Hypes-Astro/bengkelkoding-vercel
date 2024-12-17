"use client";
import {
  getAdminDropdownCourses,
  getAdminDropdownStudents,
} from "@/app/api/admin/dropdown-select/dropdown";
import { postAdminFeedback } from "@/app/api/admin/feedback";
import Button from "@/app/component/general/Button";
import Input from "@/app/component/general/Input";
import InputBasic from "@/app/component/general/InputBasic";
import React, { useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DashboardTambahFeedbackPage = () => {
  const [courseId, setCourseId] = useState(0);
  const [studentId, setStudentId] = useState(0);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [searchStudent, setSearchStudent] = useState("");
  const [studentList, setStudentList] = useState([
    {
      id: 0,
      identity_code: "",
      name: "",
      is_active: false,
    },
  ]);

  const [courseList, setCourseList] = useState([
    {
      id: 0,
      title: "",
    },
  ]);

  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchStudentList = async () => {
    try {
      const response = await getAdminDropdownStudents(searchStudent);

      setStudentList(response.data);
    } catch (error) {
      console.error("error", error);
    }
  };

  const fetchCourseList = async () => {
    try {
      const response = await getAdminDropdownCourses();

      setCourseList(response.data);
    } catch (error) {
      console.error("error", error);
    }
  };

  useEffect(() => {
    fetchStudentList();
    fetchCourseList();
  }, []);

  // Filter student berdasarkan pencarian
  const filteredStudent = studentList.filter((option) =>
    option.name.toLowerCase().includes(searchStudent.toLowerCase())
  );
  // Fungsi untuk menangani perubahan pada input pencarian student
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearchStudent(value);
    setIsStudentDropdownOpen(true);
  };
  // Fungsi untuk memilih student
  const handleSelectStudent = (studentId: number, studentName: string) => {
    setStudentId(studentId);
    setSearchStudent(studentName);
    setIsStudentDropdownOpen(false);
  };

  const handleRating = (value: number) => {
    setRating(value);
  };

  const handlePostFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await postAdminFeedback(courseId, studentId, rating, comment);
      toast.success("Berhasil tambah feedback");
      window.location.href = "./";
    } catch (error: any) {
      toast.error(`Gagal tambah feedback 😔: ${error.message}`);
    }
  };

  return (
    <>
      {/* title */}
      <div className="mb-4">
        <p className="font-semibold text-neutral2 text-base">Tambah Data</p>
        <p className="text-neutral3 text-sm">Feedback</p>
      </div>
      {/* form */}
      <form onSubmit={handlePostFeedback} className="max-w-5xl">
        <div className="grid grid-cols-3 gap-x-4">
          {/* student */}
          <div className="block" ref={dropdownRef}>
            <InputBasic
              type="text"
              label="Mahasiswa"
              name="searchStudent"
              value={searchStudent}
              onChange={handleSearchChange}
              onFocus={() => setIsStudentDropdownOpen(true)}
            />

            {isStudentDropdownOpen && (
              <div className="absolute z-10 w-[90%] sm:w-[40%] max-h-96 overflow-y-auto mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                {filteredStudent.length > 0 ? (
                  filteredStudent.map((option) => (
                    <div
                      key={option.id}
                      className="cursor-pointer p-2 hover:bg-gray-100"
                      onClick={() =>
                        handleSelectStudent(option.id, option.name)
                      }
                    >
                      {option.name}
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">
                    Tidak ada mahasiswa yang cocok
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="CourseId" className="block text-neutral2">
              Kursus
            </label>
            <select
              name="CourseId"
              id="CourseId"
              className="mt-1 bg-white block w-full px-3 py-2 border rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
              onChange={(e) => setCourseId(Number(e.target.value))}
            >
              <option value="" disabled selected>
                Pilih Kursus
              </option>
              {courseList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="Rating" className="block text-neutral2">
              Rating
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  onClick={() => handleRating(star)}
                  className={`cursor-pointer text-2xl focus:outline-none ${
                    star <= rating ? "fill-yellow-500" : "fill-gray-300"
                  }`}
                >
                  <svg
                    viewBox="0 0 88 84"
                    xmlns="http://www.w3.org/2000/svg"
                    className="py-1 w-8"
                  >
                    <path d="M42.0979 1.8541C42.6966 0.0114782 45.3034 0.0114802 45.9021 1.8541L54.7767 29.1672C55.0444 29.9912 55.8123 30.5491 56.6788 30.5491H85.3975C87.3349 30.5491 88.1405 33.0284 86.573 34.1672L63.3391 51.0476C62.6382 51.5569 62.3448 52.4596 62.6126 53.2837L71.4872 80.5968C72.0859 82.4394 69.9769 83.9716 68.4095 82.8328L45.1756 65.9524C44.4746 65.4431 43.5254 65.4431 42.8244 65.9524L19.5905 82.8328C18.0231 83.9716 15.9141 82.4394 16.5128 80.5967L25.3874 53.2837C25.6552 52.4596 25.3618 51.5569 24.6609 51.0476L1.42697 34.1672C-0.14046 33.0284 0.665094 30.5491 2.60254 30.5491H31.3212C32.1877 30.5491 32.9556 29.9912 33.2233 29.1672L42.0979 1.8541Z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-3">
            <Input
              label="Komentar"
              type="text"
              name="comment"
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="text-end">
          <Button text="Tambah Feedback" type="submit" />
        </div>
      </form>
      <ToastContainer />
    </>
  );
};

export default DashboardTambahFeedbackPage;
