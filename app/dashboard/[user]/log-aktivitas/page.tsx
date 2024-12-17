"use client";
import Link from "next/link";
import React, { use, useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";

import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import Pagination from "@/app/component/general/PaginationCustom";
import {
  deleteActivityLogs,
  getActivityLogs,
} from "@/app/api/superadmin/activityLogs";
import { ActivityLogRespon } from "@/app/interface/ActivityLogs";
import { formatDate } from "@/app/lib/formatDate";
import Modal from "@/app/component/general/Modal";
import Button from "@/app/component/general/Button";

const HomeDashboardLogAktifitasMahasiswa = () => {
  const access_token = Cookies.get("access_token");
  const role_user = Cookies.get("user_role");

  const [activityLogs, setActivityLogs] = useState<ActivityLogRespon>();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
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
        response = await getActivityLogs(
          searchTerm,
          currentPage,
          itemsPerPage,
          startDate,
          endDate
        );
      }

      if (response) {
        setActivityLogs(response);
        setTotalPages(response.meta.pagination.total_pages); // Set total halaman dari meta pagination API
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [
    role_user,
    searchTerm,
    access_token,
    currentPage,
    itemsPerPage,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Modal generate token
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idActivityLog, setIdActivityLog] = useState(0);
  const handleOpenModal = (idActivityLog: number) => {
    setIsModalOpen(true);
    setIdActivityLog(idActivityLog);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteActivityLogs(idActivityLog);
      toast.success(`Berhasil Menghapus Log Aktifitas`);
      fetchData();

      handleCloseModal();
    } catch (error) {
      console.error("Failed to delete classroom", error);
      toast.error(`Gagal Menghapus Log Aktifitas`);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
    }
  };

  return (
    <>
      <div className=" overflow-x-auto">
        {/* Search, Date Filter, and Items Per Page Selector */}
        <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
          <div className="flex gap-4 items-center">
            {/* Search Input */}
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
                placeholder="Cari log aktifitas"
              />
            </div>

            {/* Items Per Page Selector */}
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="bg-white block p-2 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
            >
              <option value={10}>10 items per page</option>
              <option value={20}>20 items per page</option>
              <option value={50}>50 items per page</option>
              <option value={100}>100 items per page</option>
            </select>
          </div>
          {/* Date Filter Inputs */}
          <div className="flex gap-2 items-center text-neutral1">
            <p>from</p>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded-md text-neutral1"
              placeholder="Start Date"
            />
            <p>to</p>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded-md text-neutral1"
              placeholder="End Date"
            />
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
          <thead className="text-sm text-neutral2 bg-gray-100">
            <tr>
              <th scope="col" className="p-4">
                <div className="flex items-center">
                  <input
                    id="checkbox-all-search"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label className="sr-only">checkbox</label>
                </div>
              </th>
              <th scope="col" className="px-6 py-3">
                Nama Pengguna
              </th>
              <th scope="col" className="px-6 py-3">
                Aksi
              </th>
              <th scope="col" className="px-6 py-3">
                IP Address
              </th>
              <th scope="col" className="px-6 py-3">
                Device
              </th>
              <th scope="col" className="px-6 py-3">
                Waktu
              </th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {activityLogs && activityLogs.data ? (
              activityLogs.data.map((log, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="w-4 p-4">
                    <div className="flex items-center">
                      <input
                        id="checkbox-table-search-1"
                        type="checkbox"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="sr-only">checkbox</label>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">{log.name}</td>
                  <td className="px-6 py-4">{log.action}</td>
                  <td className="px-6 py-4">{log.ip_address}</td>
                  <td className="px-6 py-4">{log.device}</td>
                  <td className="px-6 py-4">{formatDate(log.created_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenModal(log.id)}
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

      <Modal
        title="Hapus Log Aktifitas"
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      >
        <div className="mt-4">
          <p className="mb-4 text-sm">Anda yakin ingin menghapus log ini?</p>
          <Button
            text="Hapus Log Aktifitas"
            className="w-full"
            onClick={handleDelete}
          />
        </div>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default HomeDashboardLogAktifitasMahasiswa;
