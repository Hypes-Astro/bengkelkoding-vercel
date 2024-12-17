"use client";

import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";

import { SubmissionResponse } from "@/app/interface/Submission";
import InputBasic from "@/app/component/general/InputBasic";

import {
  getDownloadAllFile,
  getSubmissionAdmin,
  getSubmissionAssistant,
  getSubmissionLecture,
  postForceSubmit,
  postForceSubmitLecture,
  postGradeAdmin,
  postGradeAssistant,
  postGradeLecture,
} from "@/app/api/penugasan";
import { stringify } from "querystring";
import Pagination from "@/app/component/general/PaginationCustom";
import { getRolePath } from "@/app/lib/getRolePath";
import Button from "@/app/component/general/Button";
import { createRequestDownload } from "@/app/api/request";

export default function PenilaianTugas() {
  const searchParams = useSearchParams();
  const role_user = Cookies.get("user_role");
  const IdClassroom = searchParams.get("idClassroom");
  const IdAssignment = searchParams.get("idAssignment");

  const deadlineTask = searchParams.get("deadlineTask");

  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [isDownloading, setIsDownloading] = useState(false);

  const itemsPerPage = 10;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const [grades, setGrades] = useState<{ [key: number]: number | null }>({});

  const handleGradeChange = (id: number, inputScore: number) => {
    setGrades((prevGrades) => ({
      ...prevGrades,
      [id]: inputScore, // Simpan nilai berdasarkan id submission
    }));
  };

  const handleDownloadAllFile = async () => {
    setIsDownloading(true); // Menunjukkan proses download sedang berjalan
    try {
      // Panggil API menggunakan fungsi `createRequestDownload`
      const response = await createRequestDownload(
        `/api/v1/${role_user}/classrooms/${IdClassroom}/assignments/${IdAssignment}/tasks/download-zip`
      );

      // Membuat Blob dari arraybuffer respons
      const blob = new Blob([response.data], { type: "application/zip" });

      // Membuat URL objek untuk Blob
      const url = window.URL.createObjectURL(blob);

      // Membuat elemen <a> untuk mendownload file
      const a = document.createElement("a");
      a.href = url;
      a.download = "all-files.zip"; // Nama file ZIP
      document.body.appendChild(a); // Tambahkan elemen <a> ke dokumen
      a.click(); // Klik otomatis untuk memulai download
      document.body.removeChild(a); // Hapus elemen <a> setelah digunakan

      // Membersihkan URL Blob dari memori
      window.URL.revokeObjectURL(url);

      toast.success("Semua file berhasil didownload!"); // Notifikasi sukses
    } catch (error) {
      console.error("Error saat mendownload file:", error);
      toast.error("Gagal mendownload file."); // Notifikasi error
    } finally {
      setIsDownloading(false); // Reset indikator download
    }
  };

  const fetchDataSubmission = useCallback(async () => {
    try {
      let response;
      if (role_user === "superadmin" || role_user === "admin") {
        response = await getSubmissionAdmin(
          parseInt(IdClassroom),
          parseInt(IdAssignment),
          searchTerm,
          currentPage,
          itemsPerPage
        );
      } else if (role_user === "lecture") {
        response = await getSubmissionLecture(
          parseInt(IdClassroom),
          parseInt(IdAssignment),
          searchTerm,
          currentPage,
          itemsPerPage
        );
      } else if (role_user === "assistant") {
        response = await getSubmissionAssistant(
          parseInt(IdClassroom),
          parseInt(IdAssignment),
          searchTerm,
          currentPage,
          itemsPerPage
        );
      }

      if (response) {
        setSubmission(response);

        setTotalPages(response.meta.pagination.total_pages);
        // Inisialisasi grades dari data response
        const initialGrades = response.data.reduce(
          (acc: any, submission: any) => {
            acc[submission.id] =
              submission.grade !== null ? submission.grade : ""; // Set nilai grade
            return acc;
          },
          {}
        );

        setGrades(initialGrades); // Simpan nilai grades ke state
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    }
  }, [searchTerm, currentPage, itemsPerPage]);

  const handleGrade = async (inputScore: number, taskId: number) => {
    try {
      let response;
      if (role_user === "superadmin" || role_user === "admin") {
        response = await postGradeAdmin(
          IdClassroom,
          IdAssignment,
          taskId,
          inputScore
        );
        toast.success("Berhasil Menilai Mahasiswa 😁");
      }

      if (role_user === "lecture") {
        response = await postGradeLecture(
          IdClassroom,
          IdAssignment,
          taskId,
          inputScore
        );
        toast.success("Berhasil Menilai Mahasiswa 😁");
      }

      if (role_user === "assistant") {
        response = await postGradeAssistant(
          IdClassroom,
          IdAssignment,
          taskId,
          inputScore
        );
        toast.success("Berhasil Menilai Mahasiswa 😁");
      }
    } catch (error) {
      console.error("Error submit score:", error);
      toast.error("Gagal Menilai Mahasiswa 😔");
    }
  };

  const hasAutoForceSubmitted = useRef(false); // Untuk mencegah eksekusi berulang

  // Fungsi untuk memfilter mahasiswa yang memenuhi kriteria
  const filterLateAndNullTaskSubmissions = (submissions) => {
    const deadlineDate = new Date(deadlineTask);
    const now = new Date();

    // console.log("Menjalankan filter...");
    return submissions.filter((submission) => {
      const isTaskIdNull = submission.task_id === null;
      const isSubmitDateNull = submission.submit_date === null;
      const isAfterDeadline = now > deadlineDate;

      // console.log(
      //   `Mahasiswa ID: ${submission.id} -> Task ID Null: ${isTaskIdNull}, Submit Date Null: ${isSubmitDateNull}, Setelah Deadline: ${isAfterDeadline}`
      // );

      // console.log("hasil dari hari ini adalah ", now);

      return isTaskIdNull && isSubmitDateNull && isAfterDeadline;
    });
  };

  // Auto force submit untuk mahasiswa yang memenuhi kriteria
  useEffect(() => {
    const autoForceSubmitLateTasks = async () => {
      if (!submission?.data || !deadlineTask || hasAutoForceSubmitted.current)
        return;

      const lateAndNullTaskSubmissions = filterLateAndNullTaskSubmissions(
        submission.data
      );

      if (lateAndNullTaskSubmissions.length === 0) {
        // console.log("Tidak ada mahasiswa untuk force submit.");
        return;
      }

      for (const lateSubmission of lateAndNullTaskSubmissions) {
        try {
          await postForceSubmit(
            IdClassroom,
            IdAssignment,
            lateSubmission.id,
            getRolePath(role_user)
          );
        } catch (error) {
          console.error(
            `Gagal force submit untuk ID: ${lateSubmission.id}`,
            error
          );
        }
      }

      hasAutoForceSubmitted.current = true;
      fetchDataSubmission(); // Refresh data setelah selesai
    };

    autoForceSubmitLateTasks();
  }, [
    submission,
    deadlineTask,
    IdClassroom,
    IdAssignment,
    fetchDataSubmission,
  ]);

  useEffect(() => {
    fetchDataSubmission();
  }, [currentPage, IdClassroom, IdAssignment, searchTerm]);

  return (
    <div className="overflow-auto">
      <label className="sr-only">Search</label>
      <div className="flex justify-between my-4">
        <div className="md:relative ml-2 mb-2">
          <div className="hidden md:absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 md:flex items-center ps-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-neutral3"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clip-rule="evenodd"
              ></path>
            </svg>
          </div>
          <input
            type="text"
            id="table-search"
            onChange={handleSearchChange}
            className="block w-[200px] lg:w-[300px] p-2 ps-2 md:ps-10 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
            placeholder="Cari Mahasiswa"
          />
        </div>

        <div className="flex items-center">
          <Button
            text="Download Semua File"
            onClick={handleDownloadAllFile}
            className="py-2"
            disabled={isDownloading}
          />
          {isDownloading && (
            <div className="flex items-center ml-4">
              <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce mr-1"></div>
              <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.2s] mr-1"></div>
              <div className="h-4 w-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.4s]"></div>
            </div>
          )}
        </div>
      </div>
      <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
        <thead className="text-sm text-neutral2 bg-gray-100">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">No</div>
            </th>
            <th scope="col" className="px-6 py-3">
              Nama
            </th>
            <th scope="col" className="px-6 py-3">
              Status
            </th>
            <th scope="col" className="px-6 py-3">
              Komentar
            </th>
            <th scope="col" className="px-6 py-3">
              Tanggal Submit
            </th>
            <th scope="col" className="px-6 py-3">
              File
            </th>
            <th scope="col" className="px-6 py-3">
              Nilai
            </th>

            <th scope="col" className="px-6 py-3">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody>
          {submission?.data.length > 0 ? (
            submission?.data.map((submission, index) => (
              <tr
                key={submission.id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="w-4 p-4">
                  <div className="flex items-center">{index + 1}</div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-sm text-neutral2">
                    {submission.name}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="font-normal text-xs">
                    {submission.status_label}
                  </p>
                </td>
                <td className="px-6 py-4">
                  {submission.comment !== null ? submission.comment : "-"}
                </td>
                <td className="px-6 py-4">
                  {submission.submit_date !== null
                    ? submission.submit_date
                    : "-"}
                </td>
                <td className="px-6 py-4">
                  {submission.file_url ? (
                    <a
                      href={submission.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Download File
                    </a>
                  ) : (
                    "Tidak ada file"
                  )}
                </td>
                <td className="px-6 py-4">
                  <InputBasic
                    label=""
                    name={`grade-${submission.id}`}
                    type="number"
                    className="w-14 text-center font-semibold border ..."
                    value={
                      grades && grades[submission.id] !== undefined
                        ? grades[submission.id]
                        : ""
                    }
                    onChange={(e) => {
                      let value = e.target.value;

                      // Hapus tanda minus jika ada
                      if (value.includes("-")) {
                        value = value.replace("-", "");
                        toast.error("Nilai tidak boleh negatif");
                      }

                      // Jika input kosong, perbarui nilai menjadi kosong
                      if (value === "") {
                        handleGradeChange(submission.id, null); // Atur null atau "" untuk menandakan kosong
                        return;
                      }

                      // Menghapus awalan nol kecuali jika hanya "0"
                      if (value.length > 1 && value.startsWith("0")) {
                        value = value.replace(/^0+/, "");
                      }

                      const numericValue = parseInt(value);
                      if (numericValue >= 0 && numericValue <= 100) {
                        handleGradeChange(submission.id, numericValue);
                      } else {
                        toast.error("Hanya diperbolehkan nilai 0 hingga 100");
                      }

                      // Update nilai input
                      e.target.value = value;
                    }}
                    required
                  />
                </td>

                <td className="px-6 py-4">
                  <button
                    className="ml-2 px-4 py-2 bg-primary1 text-white rounded-md"
                    onClick={() => {
                      const inputScore = grades[submission.id] || 0; // Ambil nilai dari state grades
                      handleGrade(inputScore, submission.task_id); // Panggil handleGrade dengan nilai yang diinput
                    }}
                  >
                    Submit
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4">
                Loading
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <ToastContainer />
    </div>
  );
}
