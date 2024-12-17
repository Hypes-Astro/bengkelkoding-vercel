"use client";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import Pagination from "@/app/component/general/PaginationCustom";
import Modal from "@/app/component/general/Modal";
import Button from "@/app/component/general/Button";
import { FAQResponse } from "@/app/interface/dashboard/admin/FAQ";
import {
  deleteAdminFAQ,
  getAdminAnsweredFAQ,
  postAdminFAQ,
  putAdminFAQ,
} from "@/app/api/admin/faq";
import Input from "@/app/component/general/Input";

const HomeDashboardPertanyaan = () => {
  const access_token = Cookies.get("access_token");
  const role_user = Cookies.get("user_role");

  const [FAQ, setFAQ] = useState<FAQResponse>();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState(0);
  const itemsPerPage = 10;

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
      if (role_user && (role_user === "superadmin" || role_user === "admin")) {
        response = await getAdminAnsweredFAQ(
          searchTerm,
          currentPage,
          itemsPerPage,
          status
        );
      }

      if (response) {
        setFAQ(response);
        setTotalPages(response.meta.pagination.total_pages);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [role_user, searchTerm, access_token, currentPage, itemsPerPage, status]);

  // useEffect untuk memanggil fetchData setiap kali searchTerm berubah
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const [FAQId, setFAQId] = useState(0);
  const [FAQQuestion, setFAQQuestion] = useState("");
  const [FAQAnswer, setFAQAnswer] = useState("");
  const [FAQStatus, setFAQStatus] = useState<number>();

  // Add FAQ
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const handleOpenModalAdd = () => {
    setIsModalAddOpen(true);
  };
  const handleCloseModalAdd = () => {
    setIsModalAddOpen(false);
  };

  const handleAdd = async () => {
    try {
      await postAdminFAQ(FAQQuestion, FAQAnswer, FAQStatus);
      toast.success(`Berhasil menambahkan FAQ ${FAQQuestion}`);
      fetchData();
      handleCloseModalAdd();
    } catch (error) {
      console.error("Failed to delete classroom", error);
      toast.error(`Gagal menambahkan FAQ: ${error.message}`);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
    }
  };

  // Edit FAQ
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const handleOpenModalEdit = (
    FAQId: number,
    FAQQuestion: string,
    FAQAnswer: string,
    FAQStatus: number
  ) => {
    setFAQId(FAQId);
    setFAQQuestion(FAQQuestion);
    setFAQAnswer(FAQAnswer);
    setFAQStatus(FAQStatus);
    setIsModalEditOpen(true);
  };
  const handleCloseModalEdit = () => {
    setIsModalEditOpen(false);
  };

  const handleEdit = async () => {
    try {
      await putAdminFAQ(FAQId, FAQQuestion, FAQAnswer, FAQStatus);
      toast.success(`Berhasil mengedit FAQ ${FAQQuestion}`);
      fetchData();
      handleCloseModalEdit();
    } catch (error) {
      console.error("Failed to delete classroom", error);
      toast.error(`Gagal mengedit FAQ: ${error.message}`);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
    }
  };

  // Delete FAQ
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const handleOpenModalDelete = (FAQId: number, FAQQuestion: string) => {
    setFAQId(FAQId);
    setFAQQuestion(FAQQuestion);
    setIsModalDeleteOpen(true);
  };
  const handleCloseModalDelete = () => {
    setIsModalDeleteOpen(false);
  };

  const handleDelete = async () => {
    try {
      await deleteAdminFAQ(FAQId);
      toast.success(`Berhasil menghapus FAQ ${FAQQuestion}`);
      fetchData();
      handleCloseModalDelete();
    } catch (error) {
      console.error("Failed to delete classroom", error);
      toast.error(`Gagal menghapus FAQ: ${error.message}`);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
    }
  };

  return (
    <>
      <div className="overflow-x-auto max-w-7xl">
        {/* Searching + Button */}
        <div className="flex flex-column sm:flex-row flex-wrap space-y-4 sm:space-y-0 items-center justify-between pb-4">
          <div className="flex gap-4 items-center">
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
                placeholder="Cari pertanyaan"
              />
            </div>

            {/* Status Selector */}
            <select
              value={status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="bg-white block p-2 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
            >
              <option value={0}>Semua</option>
              <option value={1}>Tidak Ditampilkan</option>
              <option value={2}>Ditampilkan di FAQ</option>
              <option value={3}>Ditampilkan di Home Page</option>
            </select>
          </div>
          <button
            onClick={() => handleOpenModalAdd()}
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
            <p>FAQ</p>
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
          <thead className="text-sm text-neutral2 bg-gray-100">
            <tr>
              <th scope="col" className="w-4 p-4">
                <div className="flex items-center">No</div>
              </th>
              <th scope="col" className="px-6 py-3">
                Pertanyaan
              </th>
              <th scope="col" className="px-6 py-3">
                Jawaban
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {FAQ && FAQ.data ? (
              FAQ.data.map((faq, index) => (
                <tr key={index} className="bg-white border-b hover:bg-gray-50">
                  <td className="w-4 p-4">
                    <div className="flex items-center">{index + 1}</div>
                  </td>
                  <td className="px-6">{faq.question}</td>
                  <td className="px-6 py-4">{faq.answer}</td>
                  <td className="px-6 py-4">{faq.status_label}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1">
                      {faq.status === 0 ? (
                        <button
                          onClick={() =>
                            handleOpenModalEdit(
                              faq.id,
                              faq.question,
                              faq.answer,
                              faq.status
                            )
                          }
                          className="flex gap-1 text-white items-center bg-blue2 p-1 rounded-md fill-white hover:bg-blue1 transition-all ease-in-out duration-150"
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
                          <p className="text-sm px-0.5">Jawab</p>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            handleOpenModalEdit(
                              faq.id,
                              faq.question,
                              faq.answer,
                              faq.status
                            )
                          }
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
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleOpenModalDelete(faq.id, faq.question)
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
                  Tidak ada data
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* pagination */}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Modal Tambah FAQ */}
      <Modal
        title="Tambah FAQ"
        isOpen={isModalAddOpen}
        onClose={handleCloseModalAdd}
      >
        <div className="mt-4">
          <Input
            label="Pertanyaan"
            type="text"
            name="question"
            placeholder="Masukkan Pertanyaan"
            required
            onChange={(e) => setFAQQuestion(e.target.value)}
          />
          <Input
            label="Jawaban"
            type="text"
            name="question"
            placeholder="Masukkan Jawaban"
            required
            onChange={(e) => setFAQAnswer(e.target.value)}
          />

          <div className="mb-4">
            <label htmlFor="status"></label>
            <select
              onChange={(e) => setFAQStatus(Number(e.target.value))}
              className="w-full bg-white block p-2 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
              required
            >
              <option value="" disabled selected>
                Pilih Status
              </option>
              <option value={1}>Tidak Ditampilkan</option>
              <option value={2}>Ditampilkan di FAQ</option>
              <option value={3}>Ditampilkan di Home Page</option>
            </select>
          </div>
          <Button text="Tambah FAQ" className="w-full" onClick={handleAdd} />
        </div>
      </Modal>

      {/* Modal Edit FAQ */}
      <Modal
        title="Edit FAQ"
        isOpen={isModalEditOpen}
        onClose={handleCloseModalEdit}
      >
        <div className="mt-4">
          <Input
            label="Pertanyaan"
            type="text"
            name="question"
            placeholder="Masukkan Pertanyaan"
            required
            value={FAQQuestion}
            onChange={(e) => setFAQQuestion(e.target.value)}
          />
          <Input
            label="Jawaban"
            type="text"
            name="question"
            placeholder="Masukkan Jawaban"
            required
            value={FAQAnswer}
            onChange={(e) => setFAQAnswer(e.target.value)}
          />

          <div className="mb-4">
            <label htmlFor="status"></label>
            <select
              onChange={(e) => setFAQStatus(Number(e.target.value))}
              className="w-full bg-white block p-2 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
              required
              value={FAQStatus}
            >
              <option value={1}>Tidak Ditampilkan</option>
              <option value={2}>Ditampilkan di FAQ</option>
              <option value={3}>Ditampilkan di Home Page</option>
            </select>
          </div>
          <Button text="Edit FAQ" className="w-full" onClick={handleEdit} />
        </div>
      </Modal>

      {/* Modal Hapus FAQ */}
      <Modal
        title="Hapus FAQ"
        isOpen={isModalDeleteOpen}
        onClose={handleCloseModalDelete}
      >
        <div className="mt-4">
          <p className="mb-4 text-sm">
            Anda yakin ingin menghapus FAQ <b>{FAQQuestion}</b>
          </p>
          <Button text="Hapus FAQ" className="w-full" onClick={handleDelete} />
        </div>
      </Modal>
      <ToastContainer />
    </>
  );
};

export default HomeDashboardPertanyaan;
