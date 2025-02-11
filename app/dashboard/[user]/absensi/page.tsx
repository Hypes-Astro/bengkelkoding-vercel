"use client";
import ViewModalPDF from "@/app/component/general/ViewModalPDF";
import Modal from "@/app/component/general/Modal";
import PDFView from "@/app/component/general/PDFView";
import Keterangan from "@/app/component/general/Keterangan";
import Link from "next/link";
import React, { useCallback, useEffect, useState } from "react";

import Cookies from "js-cookie";
import { Absence } from "@/app/interface/Absence";

import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import PdfViewer from "@/app/component/general/PDFView";
import { getAllAbsence, postUpdateStatusAbsence } from "@/app/api/absence";
import Pagination from "@/app/component/general/PaginationCustom";
import { getRole } from "@/app/api/general";

// dropdown
const StatusFilterDropdown = ({
  onFilterChange,
}: {
  onFilterChange: (status: string) => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>("menunggu");

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedStatus(value);
    onFilterChange(value);
  };

  return (
    <select
      value={selectedStatus}
      onChange={handleStatusChange}
      className="w-full  p-2 pl-3 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
    >
      <option value="menunggu">Menunggu</option>
      <option value="approved">Diterima</option>
      <option value="rejected">Ditolak</option>
    </select>
  );
};

const HomeDashboardAbsensiPage = () => {
  const access_token = Cookies.get("access_token");
  const role_user = Cookies.get("user_role");

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 3;

  const [keterangan, setKeterangan] = useState("");
  const [selectedIdClassroom, setSelectedIdClassroom] = useState<number | null>(
    null
  );
  const [selectedIdAbsence, setSelectedIdAbsence] = useState<number | null>(
    null
  );
  const [approvalAction, setApprovalAction] = useState<
    "approve" | "reject" | null
  >(null);
  const [filteredStatus, setFilteredStatus] = useState<string>("menunggu");

  const [totalApproved, setTotalApproved] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isKetModalOpen, setIsKetModalOpen] = useState(false);

  const [selectedMhsName, setSelectedMhsName] = useState<string | null>(null);
  const [selectedMhsNim, setSelectedMhsNim] = useState<string | null>(null);
  const [selectedMhsFile, setSelectedMhsFile] = useState<string | null>(null);
  // state api
  const [DataAbsence, setDataAbsence] = useState<Absence[]>();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const [user, setUser] = useState({
    role: "",
  });

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const response = await getRole();
        if (response.data.role == "superadmin") {
          setUser({ role: "admin" });
        } else {
          setUser({ role: response.data.role });
        }
        // setRole(response.data.role); // Simpan role di state
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };
    fetchRole();
  }, []);

  const fetchData = useCallback(async () => {
    if (!user.role) return;
    try {
      let response;

      response = await getAllAbsence(
        searchTerm,
        currentPage,
        itemsPerPage,
        user.role
      );

      if (response) {
        setDataAbsence(response.data);
        setTotalPages(response.meta.pagination.total_pages);
        countStatus(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      window.location.reload();
    }
  }, [role_user, searchTerm, access_token, currentPage, itemsPerPage, user]);

  useEffect(() => {
    fetchData();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 650);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [fetchData]);

  const countStatus = (data: Absence[] | undefined) => {
    const totalApproved =
      data?.filter((izin) => izin.approve_status === 2).length || 0;
    const totalRejected =
      data?.filter((izin) => izin.approve_status === 3).length || 0;

    setTotalApproved(totalApproved);
    setTotalRejected(totalRejected);
  };

  // update status
  const openModalForApproval = (idClassroom: number, idAbsence: number) => {
    setSelectedIdClassroom(idClassroom);
    setSelectedIdAbsence(idAbsence);
    setApprovalAction("approve");
    setIsKetModalOpen(true);
  };

  const openModalForRejection = (idClassroom: number, idAbsence: number) => {
    setSelectedIdClassroom(idClassroom);
    setSelectedIdAbsence(idAbsence);
    setApprovalAction("reject");
    setIsKetModalOpen(true);
  };

  const handleSaveKeterangan = async () => {
    if (
      selectedIdClassroom !== null &&
      selectedIdAbsence !== null &&
      approvalAction !== null
    ) {
      const status = approvalAction === "approve" ? 2 : 3;
      const actionText = approvalAction === "approve" ? "Diterima" : "Ditolak";

      if (!user.role) return;
      try {
        let response;

        response = await postUpdateStatusAbsence(
          selectedIdClassroom,
          selectedIdAbsence,
          status,
          keterangan,
          user.role
        );
        toast.success(`Absen Mahasiswa ${actionText} 😁`);

        // mari dapatkan datanya lagi
        fetchData();

        setIsKetModalOpen(false);
      } catch (error) {
        console.error(`Error ${actionText} absence:`, error);
        toast.error(`Absen Mahasiswa ${actionText} 😁`);
      }
    } else {
      console.error("Classroom ID, Absence ID, or Action is missing.");
    }
  };

  const handleOpenViewModal = (name: string, nim: string, file: string) => {
    setSelectedMhsName(name);
    setSelectedMhsNim(nim);
    setSelectedMhsFile(file);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
  };

  const handleCloseKetModal = () => {
    setIsKetModalOpen(false);
  };

  const handleFilterChange = (status: string) => {
    setFilteredStatus(status);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Diterima";
      case "rejected":
        return "Ditolak";
      default:
        return "Menunggu";
    }
  };

  const filteredData =
    DataAbsence?.filter((izin) => {
      if (filteredStatus === "approved") {
        return izin.approve_status === 2;
      }
      if (filteredStatus === "rejected") {
        return izin.approve_status === 3;
      }
      return izin.approve_status === 1; // Default "Menunggu"
    }) || [];

  return (
    <>
      <div className="overflow-x-auto">
        {/* Searching + Button */}
        <div className="flex  flex-col w-full md:flex-row sm:justify-between items-center gap-2 pb-4">
          <div className="grid grid-cols-2 gap-5 sm:gap-1 md:gap-1 ">
            {/* Search */}
            <div className=" ml-2">
              <input
                type="text"
                id="table-search"
                onChange={handleSearchChange}
                className="block w-[200px] lg:w-[300px] p-2 ps-10 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
                placeholder="Cari Mahasiswa"
              />
            </div>

            <StatusFilterDropdown onFilterChange={handleFilterChange} />
          </div>

          <div className="flex w-full md:w-1/2 lg:w-1/3 gap-2">
            <div className="box-tolak px-3 text-white w-full rounded-md flex justify-center items-center bg-primary1">
              <span className="font-semibold pr-1 text-xl">
                {totalRejected}
              </span>{" "}
              Ditolak
            </div>

            <div className="box-tolak px-3 text-white w-full p-2 rounded-md flex justify-center items-center bg-primary1">
              <span className="font-semibold pr-1 text-xl">
                {totalApproved}
              </span>{" "}
              Diterima
            </div>
          </div>
        </div>

        {isMobile ? (
          <>
            <div className="flex flex-col gap-4">
              {filteredData.length > 0 ? (
                filteredData.map((izin) => (
                  <div
                    key={izin.id}
                    className="bg-white p-4 rounded-lg shadow-md"
                  >
                    <div className="info mt-2">
                      <div className="flex justify-end pb-2 rounded-lg">
                        <p
                          className={`text-right p-2 ${
                            izin.approve_status == 1
                              ? "bg-orange-500"
                              : izin.approve_status == 2
                              ? "bg-green-500"
                              : izin.approve_status == 3
                              ? "bg-red-500"
                              : ""
                          } rounded-lg font-medium text-white`}
                        >
                          {izin.approve_status_label}
                        </p>
                      </div>
                      <div className="profil flex gap-5 pb-2 w-full  border-b-2">
                        <div className="foto w-10 h-10 bg-blue-200 rounded-full"></div>
                        <div className="flex flex-col">
                          <p>{izin.student?.name}</p>
                          <p>{izin.student?.identity_code}</p>
                        </div>
                      </div>

                      <div className="info-detail py-2">
                        <p>
                          <strong>Kelas:</strong>{" "}
                          {izin.presence?.classroom_name}
                        </p>
                        <p>
                          <strong>Pertemuan:</strong> {izin.presence.id}
                        </p>
                        <p>
                          <strong>Keterangan:</strong> {izin.notes}
                        </p>

                        <p>
                          <strong>Pesan:</strong> {izin.approve_note}
                        </p>
                      </div>
                    </div>

                    <div className="flex  justify-between items-center gap-2">
                      <p className="font-medium text-xs">
                        {izin.approve_changed_at_formatted}
                      </p>
                      <div className="flex gap-2 items-center mt-2">
                        <Link
                          href={izin.attachment ? izin.attachment : "kosong"}
                        >
                          <svg
                            fill="none"
                            aria-hidden="true"
                            className="w-5 h-5 flex-shrink-0"
                            viewBox="0 0 20 21"
                          >
                            <g clip-path="url(#clip0_3173_1381)">
                              <path
                                fill="#E2E5E7"
                                d="M5.024.5c-.688 0-1.25.563-1.25 1.25v17.5c0 .688.562 1.25 1.25 1.25h12.5c.687 0 1.25-.563 1.25-1.25V5.5l-5-5h-8.75z"
                              />
                              <path
                                fill="#B0B7BD"
                                d="M15.024 5.5h3.75l-5-5v3.75c0 .688.562 1.25 1.25 1.25z"
                              />
                              <path
                                fill="#CAD1D8"
                                d="M18.774 9.25l-3.75-3.75h3.75v3.75z"
                              />
                              <path
                                fill="#F15642"
                                d="M16.274 16.75a.627.627 0 01-.625.625H1.899a.627.627 0 01-.625-.625V10.5c0-.344.281-.625.625-.625h13.75c.344 0 .625.281.625.625v6.25z"
                              />
                              <path
                                fill="#fff"
                                d="M3.998 12.342c0-.165.13-.345.34-.345h1.154c.65 0 1.235.435 1.235 1.269 0 .79-.585 1.23-1.235 1.23h-.834v.66c0 .22-.14.344-.32.344a.337.337 0 01-.34-.344v-2.814zm.66.284v1.245h.834c.335 0 .6-.295.6-.605 0-.35-.265-.64-.6-.64h-.834zM7.706 15.5c-.165 0-.345-.09-.345-.31v-2.838c0-.18.18-.31.345-.31H8.85c2.284 0 2.234 3.458.045 3.458h-1.19zm.315-2.848v2.239h.83c1.349 0 1.409-2.24 0-2.24h-.83zM11.894 13.486h1.274c.18 0 .36.18.36.355 0 .165-.18.3-.36.3h-1.274v1.049c0 .175-.124.31-.3.31-.22 0-.354-.135-.354-.31v-2.839c0-.18.135-.31.355-.31h1.754c.22 0 .35.13.35.31 0 .16-.13.34-.35.34h-1.455v.795z"
                              />
                              <path
                                fill="#CAD1D8"
                                d="M15.649 17.375H3.774V18h11.875a.627.627 0 00.625-.625v-.625a.627.627 0 01-.625.625z"
                              />
                            </g>
                          </svg>
                        </Link>
                        <button
                          onClick={() =>
                            openModalForApproval(izin.presence?.id, izin.id)
                          }
                          className="block bg-green-500 p-1 rounded-md fill-white hover:bg-green-600 transition-all ease-in-out duration-150"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="18px"
                            viewBox="0 0 24 24"
                            width="18px"
                          >
                            <path
                              d="M0 0h24v24H0V0zm0 0h24v24H0V0z"
                              fill="none"
                            />
                            <path d="M13.12 2.06 7.58 7.6c-.37.37-.58.88-.58 1.41V19c0 1.1.9 2 2 2h9c.8 0 1.52-.48 1.84-1.21l3.26-7.61C23.94 10.2 22.49 8 20.34 8h-5.65l.95-4.58c.1-.5-.05-1.01-.41-1.37-.59-.58-1.53-.58-2.11.01zM3 21c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2s-2 .9-2 2v8c0 1.1.9 2 2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() =>
                            openModalForRejection(izin.presence?.id, izin.id)
                          }
                          className="block bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
                        >
                          <span className="sr-only">EditFormKelas</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            height="18px"
                            viewBox="0 0 24 24"
                            width="18px"
                          >
                            <path
                              d="M0 0h24v24H0V0zm0 0h24v24H0V0z"
                              fill="none"
                            />
                            <path d="m10.88 21.94 5.53-5.54c.37-.37.58-.88.58-1.41V5c0-1.1-.9-2-2-2H6c-.8 0-1.52.48-1.83 1.21L.91 11.82C.06 13.8 1.51 16 3.66 16h5.65l-.95 4.58c-.1.5.05 1.01.41 1.37.59.58 1.53.58 2.11-.01zM21 3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    {`Data ${getStatusLabel(filteredStatus)} kosong`}
                  </td>
                </tr>
              )}
            </div>
          </>
        ) : (
          <>
            <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
              <thead className="text-sm text-neutral2 bg-gray-100">
                <tr>
                  <th scope="col" className="p-4">
                    <div className="flex items-center">No</div>
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    MATA KULIAH
                  </th>

                  <th scope="col" className="px-6 py-3">
                    Pertemuan
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Tanggal Permohonan
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Keterangan
                  </th>
                  <th scope="col" className="px-6 py-3">
                    File
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Pesan
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((izin, index) => (
                    <tr
                      key={izin.id}
                      className="bg-white border-b hover:bg-gray-50"
                    >
                      <td className="w-4 p-4">
                        <div className="flex items-center">{index + 1}</div>
                      </td>
                      <th scope="row" className="px-6 py-4 whitespace-nowrap ">
                        <div className="text-xs flex flex-col gap-1">
                          <p className="font-medium text-sm text-neutral2">
                            {izin.student?.name}
                          </p>
                          <p className="font-normal text-xs">
                            {izin.student?.identity_code}
                          </p>
                        </div>
                      </th>
                      <td className="px-6 py-4">
                        {izin.presence?.classroom_name}
                      </td>

                      <td className="px-6 py-4">
                        Pertemuan {izin.presence.week}
                      </td>
                      <td className="px-6 py-4">
                        {izin.approve_changed_at_formatted}
                      </td>
                      <td className="px-6 py-4">{izin.notes}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`${izin.attachment}`}
                          onClick={(e) => {
                            e.preventDefault();
                            handleOpenViewModal(
                              izin.student?.name || "",
                              izin.student?.identity_code || "",
                              izin.attachment || ""
                            );
                          }}
                          className="text-gray-500 gap-2 bg-gray-50 hover:bg-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2"
                        >
                          <svg
                            fill="none"
                            aria-hidden="true"
                            className="w-5 h-5 flex-shrink-0"
                            viewBox="0 0 20 21"
                          >
                            <g clip-path="url(#clip0_3173_1381)">
                              <path
                                fill="#E2E5E7"
                                d="M5.024.5c-.688 0-1.25.563-1.25 1.25v17.5c0 .688.562 1.25 1.25 1.25h12.5c.687 0 1.25-.563 1.25-1.25V5.5l-5-5h-8.75z"
                              />
                              <path
                                fill="#B0B7BD"
                                d="M15.024 5.5h3.75l-5-5v3.75c0 .688.562 1.25 1.25 1.25z"
                              />
                              <path
                                fill="#CAD1D8"
                                d="M18.774 9.25l-3.75-3.75h3.75v3.75z"
                              />
                              <path
                                fill="#F15642"
                                d="M16.274 16.75a.627.627 0 01-.625.625H1.899a.627.627 0 01-.625-.625V10.5c0-.344.281-.625.625-.625h13.75c.344 0 .625.281.625.625v6.25z"
                              />
                              <path
                                fill="#fff"
                                d="M3.998 12.342c0-.165.13-.345.34-.345h1.154c.65 0 1.235.435 1.235 1.269 0 .79-.585 1.23-1.235 1.23h-.834v.66c0 .22-.14.344-.32.344a.337.337 0 01-.34-.344v-2.814zm.66.284v1.245h.834c.335 0 .6-.295.6-.605 0-.35-.265-.64-.6-.64h-.834zM7.706 15.5c-.165 0-.345-.09-.345-.31v-2.838c0-.18.18-.31.345-.31H8.85c2.284 0 2.234 3.458.045 3.458h-1.19zm.315-2.848v2.239h.83c1.349 0 1.409-2.24 0-2.24h-.83zM11.894 13.486h1.274c.18 0 .36.18.36.355 0 .165-.18.3-.36.3h-1.274v1.049c0 .175-.124.31-.3.31-.22 0-.354-.135-.354-.31v-2.839c0-.18.135-.31.355-.31h1.754c.22 0 .35.13.35.31 0 .16-.13.34-.35.34h-1.455v.795z"
                              />
                              <path
                                fill="#CAD1D8"
                                d="M15.649 17.375H3.774V18h11.875a.627.627 0 00.625-.625v-.625a.627.627 0 01-.625.625z"
                              />
                            </g>
                          </svg>
                        </Link>
                      </td>
                      <td className="px-6 py-4">{izin.approve_note}</td>
                      <td className="px-6 py-4">{izin.approve_status_label}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              openModalForApproval(izin.presence?.id, izin.id)
                            }
                            className="block bg-green-500 p-1 rounded-md fill-white hover:bg-green-600 transition-all ease-in-out duration-150"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="18px"
                              viewBox="0 0 24 24"
                              width="18px"
                            >
                              <path
                                d="M0 0h24v24H0V0zm0 0h24v24H0V0z"
                                fill="none"
                              />
                              <path d="M13.12 2.06 7.58 7.6c-.37.37-.58.88-.58 1.41V19c0 1.1.9 2 2 2h9c.8 0 1.52-.48 1.84-1.21l3.26-7.61C23.94 10.2 22.49 8 20.34 8h-5.65l.95-4.58c.1-.5-.05-1.01-.41-1.37-.59-.58-1.53-.58-2.11.01zM3 21c1.1 0 2-.9 2-2v-8c0-1.1-.9-2-2-2s-2 .9-2 2v8c0 1.1.9 2 2 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              openModalForRejection(izin.presence?.id, izin.id)
                            }
                            className="block bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
                          >
                            <span className="sr-only">EditFormKelas</span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              height="18px"
                              viewBox="0 0 24 24"
                              width="18px"
                            >
                              <path
                                d="M0 0h24v24H0V0zm0 0h24v24H0V0z"
                                fill="none"
                              />
                              <path d="m10.88 21.94 5.53-5.54c.37-.37.58-.88.58-1.41V5c0-1.1-.9-2-2-2H6c-.8 0-1.52.48-1.83 1.21L.91 11.82C.06 13.8 1.51 16 3.66 16h5.65l-.95 4.58c-.1.5.05 1.01.41 1.37.59.58 1.53.58 2.11-.01zM21 3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2s2-.9 2-2V5c0-1.1-.9-2-2-2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-4">
                      {`Data ${getStatusLabel(filteredStatus)} kosong`}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        <ViewModalPDF
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          mhsName={selectedMhsName}
          mhsNim={selectedMhsNim}
          mhsFile={selectedMhsFile}
        >
          <PdfViewer fileUrl={selectedMhsFile} />
        </ViewModalPDF>
        <Modal
          title="Keterangan"
          isOpen={isKetModalOpen}
          onClose={handleCloseKetModal}
        >
          <Keterangan
            setKeterangan={setKeterangan}
            onSave={handleSaveKeterangan}
          />{" "}
        </Modal>

        {/* pagination */}
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>{" "}
      <ToastContainer />
    </>
  );
};

export default HomeDashboardAbsensiPage;
