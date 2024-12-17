"use client";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";

import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { StudentRespon } from "@/app/interface/UserManagement";
import {
  deleteStudent,
  getAllAssistantData,
  getAllStudentData,
} from "@/app/api/manageUser";
import Pagination from "@/app/component/general/PaginationCustom";
import Modal from "@/app/component/general/Modal";
import { postImportStudent } from "@/app/api/admin/student";
import Button from "@/app/component/general/Button";

const HomeDashboardPenggunaMahasiswa = () => {
  const access_token = Cookies.get("access_token");
  const role_user = Cookies.get("user_role");

  const [DataStudent, setDataStudent] = useState<StudentRespon>();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 10; // Jumlah data per halaman

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const openModalDelete = (id: number, name: string) => {
    setSelectedStudents({ id, name });
    setIsModalDeleteOpen(true);
  };

  const closeModalDelete = () => {
    setIsModalDeleteOpen(false);
    setSelectedStudents(null);
  };

  const confirmDelete = () => {
    if (selectedStudents) {
      handleDelete(selectedStudents.id, selectedStudents.name);
      closeModalDelete();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const fetchData = useCallback(async () => {
    if (!access_token) {
      throw new Error("Access token not found");
    }
    try {
      let response;
      // Check the user's role and fetch data accordingly
      if (role_user && (role_user === "superadmin" || role_user === "admin")) {
        response = await getAllStudentData(
          searchTerm,
          currentPage,
          itemsPerPage
        );
      }

      if (response) {
        setDataStudent(response);
        setTotalPages(response.meta.pagination.total_pages); // Set total halaman dari meta pagination API
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [role_user, searchTerm, access_token, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchData();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 650);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [fetchData]);

  const handleDelete = async (idStudent: number, nameStudent: string) => {
    try {
      await deleteStudent(idStudent);
      toast.success(`Berhasil Menghapus Mahasiswa ${nameStudent} 😁`);
      fetchData();
    } catch (error) {
      console.error("Failed to delete classroom", error);
      toast.error(`Gagal Menghapus Dosen 😔: ${error.message}`);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
    }
  };

  const handleDownloadFileXlsx = () => {
    // Programmatically create a link and trigger the download
    const filePath = "/data/template-student-import.xlsx";
    const link = document.createElement("a");
    link.href = filePath;
    link.download = "template-student-import.xlsx";
    link.click();
  };

  const allowedFileTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel",
  ];

  const [isModalImportOpen, setIsModalImportOpen] = useState(false);

  const openModalImport = () => {
    setIsModalImportOpen(true);
  };

  const closeModalImport = () => {
    setIsModalImportOpen(false);
    setSelectedStudents(null);
  };

  const [formData, setFormData] = useState({ studentData: null });
  const [status, setStatus] = useState({
    loading: true,
    error: null,
    success: null,
  });

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    if (e.target instanceof HTMLInputElement && e.target.files) {
      const files = e.target.files;
      setFormData((prev) => ({
        ...prev,
        [id]: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handlePostImport = async () => {
    const { studentData } = formData;

    if (!studentData) {
      setStatus({
        loading: false,
        error: "Please fill all fields",
        success: null,
      });
      toast.error(status.error);
      return;
    }

    if (!allowedFileTypes.includes(studentData.type)) {
      setStatus({
        loading: false,
        error: "File must be of type xlsx",
        success: null,
      });
      toast.error(status.error);
      return;
    }

    try {
      await postImportStudent(studentData);
      setStatus({
        loading: false,
        error: null,
        success: "File uploaded successfully",
      });
      toast.success("Berhasil import data!");
      fetchData();
      closeModalImport();
    } catch (error) {
      toast.error(status.error);
      setStatus({
        loading: false,
        error: "File upload failed",
        success: null,
      });
    }
  };

  return (
    <>
      <div className=" overflow-x-auto">
        {/* Searching + Button */}
        <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
          {/* Search */}
          <label className="sr-only">Search</label>
          <div className="relative ml-2">
            <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
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
              className="block w-[200px] lg:w-[300px] p-2 ps-10 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
              placeholder="Cari mahasiswa"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadFileXlsx}
              className="flex items-center gap-2 bg-green-700 text-white fill-white hover:bg-green-600 focus:ring-primary5 px-4 py-2 lg:px-5 lg:py-2.5 font-medium rounded-lg focus:ring-4 focus:outline-none transition-all ease-in-out duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
              >
                <path d="M480-337q-8 0-15-2.5t-13-8.5L308-492q-12-12-11.5-28t11.5-28q12-12 28.5-12.5T365-549l75 75v-286q0-17 11.5-28.5T480-800q17 0 28.5 11.5T520-760v286l75-75q12-12 28.5-11.5T652-548q11 12 11.5 28T652-492L508-348q-6 6-13 8.5t-15 2.5ZM240-160q-33 0-56.5-23.5T160-240v-80q0-17 11.5-28.5T200-360q17 0 28.5 11.5T240-320v80h480v-80q0-17 11.5-28.5T760-360q17 0 28.5 11.5T800-320v80q0 33-23.5 56.5T720-160H240Z" />
              </svg>
              <p>Format Import</p>
            </button>
            <button
              onClick={openModalImport}
              className="flex items-center gap-2 bg-blue-700 text-white fill-white hover:bg-blue-600 focus:ring-primary5 px-4 py-2 lg:px-5 lg:py-2.5 font-medium rounded-lg focus:ring-4 focus:outline-none transition-all ease-in-out duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
              >
                <path d="M440-367v127q0 17 11.5 28.5T480-200q17 0 28.5-11.5T520-240v-127l36 36q6 6 13.5 9t15 2.5q7.5-.5 14.5-3.5t13-9q11-12 11.5-28T612-388L508-492q-6-6-13-8.5t-15-2.5q-8 0-15 2.5t-13 8.5L348-388q-12 12-11.5 28t12.5 28q12 11 28 11.5t28-11.5l35-35ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h287q16 0 30.5 6t25.5 17l194 194q11 11 17 25.5t6 30.5v447q0 33-23.5 56.5T720-80H240Zm280-560v-160H240v640h480v-440H560q-17 0-28.5-11.5T520-640ZM240-800v200-200 640-640Z" />
              </svg>
              <p>Import Mahasiswa</p>
            </button>
            <Link
              href={"mahasiswa/tambah"}
              className="flex items-center gap-2 bg-primary1 text-white fill-white hover:bg-primary2 focus:ring-primary5 px-4 py-2 lg:px-5 lg:py-2.5 font-medium rounded-lg focus:ring-4 focus:outline-none transition-all ease-in-out duration-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20px"
                viewBox="0 0 24 24"
                width="20px"
              >
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M18 13h-5v5c0 .55-.45 1-1 1s-1-.45-1-1v-5H6c-.55 0-1-.45-1-1s.45-1 1-1h5V6c0-.55.45-1 1-1s1 .45 1 1v5h5c.55 0 1 .45 1 1s-.45 1-1 1z" />
              </svg>
              <p>Mahasiswa</p>
            </Link>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
          <thead className="text-sm text-neutral2 bg-gray-100">
            <tr>
              <th scope="col" className="p-4 text-center">
                No
              </th>
              <th scope="col" className="px-6 py-3">
                Nama Asisten
              </th>
              <th scope="col" className="px-6 py-3">
                NIM
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {DataStudent && DataStudent.data ? (
              DataStudent.data.map((listStudent, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="w-4 p-4 texr-center">{index + 1}</td>
                  <td className="px-6 py-4 font-semibold">
                    {listStudent.name}
                  </td>
                  <td className="px-6 py-4">{listStudent.nim}</td>
                  <td className="px-6 py-4">{listStudent.email}</td>
                  <td className="px-6 py-4">
                    <p className="w-max px-4 rounded-sm text-green-600 bg-green-100">
                      {listStudent.is_active ? (
                        <p className="w-max px-4 rounded-sm text-green-600 bg-green-100">
                          Aktif
                        </p>
                      ) : (
                        <p className="w-max px-4 rounded-sm text-slate-600 bg-slate-100">
                          Tidak Aktif
                        </p>
                      )}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <Link
                        href={{
                          pathname: `mahasiswa/tambah`,
                          query: {
                            idStudent: listStudent.id,
                            status: "edit",
                          },
                        }}
                        className="block bg-yellow2 p-1 rounded-md fill-white hover:bg-yellow1 transition-all ease-in-out duration-150"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="18px"
                          viewBox="0 0 24 24"
                          width="18px"
                        >
                          <path d="M0 0h24v24H0V0z" fill="none" />
                          <path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() =>
                          openModalDelete(listStudent.id, listStudent.name)
                        }
                        className="block bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="18px"
                          viewBox="0 0 24 24"
                          width="18px"
                        >
                          <path d="M0 0h24v24H0V0z" fill="none" />
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center p-4">
                  Loading data...
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
      </div>
      <ToastContainer />

      {/* Modal konfirmasi */}
      <Modal
        isOpen={isModalDeleteOpen}
        onClose={closeModalDelete}
        title="Konfirmasi Hapus"
      >
        <p>
          Apakah Anda yakin ingin menghapus Mahasiswa {selectedStudents?.name}?
        </p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={closeModalDelete}
            className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded mr-2"
          >
            Batal
          </button>
          <button
            onClick={confirmDelete}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
          >
            Hapus
          </button>
        </div>
      </Modal>

      {/* Modal Import Student Data */}
      <Modal
        isOpen={isModalImportOpen}
        onClose={closeModalImport}
        title="Import Data Mahasiswa"
      >
        {/* Answer File */}
        <div className="flex flex-col space-y-2 mt-4 mb-2">
          <label htmlFor="studentData" className="text-neutral-700 font-medium">
            Upload File
          </label>
          <input
            type="file"
            id="studentData"
            accept=".xlsx"
            className="p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary2"
            onChange={handleFormChange}
            required
          />
        </div>

        {/* Submit Button */}
        <Button
          text="Kirim"
          onClick={handlePostImport}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200 ease-in-out"
        />
      </Modal>
    </>
  );
};

export default HomeDashboardPenggunaMahasiswa;
