"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Modal from "@/app/component/general/Modal";
import EditForm from "@/app/component/general/EditForm";

import { usePathname } from "next/navigation";
import {
  Assignment,
  Assistant,
  ClassInformation,
  ClassroomData,
  Presence,
} from "@/app/interface/Kelas";

import ApexCharts from "apexcharts";
import ReactApexChart from "react-apexcharts";
import Cookies from "js-cookie";

import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";

import EditFormInfo from "@/app/component/general/EditFormInfo";
import PostFormInfo from "@/app/component/general/PostFormInfo";

import { deleteAssignment, getAssigment } from "@/app/api/penugasan";
import {
  addPresence,
  deletePresence,
  updatePresence,
} from "@/app/api/presensi";
import { getDetailClassroom } from "@/app/api/detailClassroom";
import splitTextByURL from "@/app/lib/validUrl";
import Button from "@/app/component/general/Button";
import { Student } from "@/app/interface/DetailSesi";
import PostFormAsisten from "@/app/component/general/PostFormAsisten";
import { dateFormated, dayFormated, hourFormated } from "@/app/lib/formatDate";
import {
  deleteAssistant,
  deleteFinalScore,
  postAssistant,
  postFinalScore,
} from "@/app/api/kelas";
import SkeletonDetailKelas from "@/app/component/skleton/SkeletonDetailKelas";

import Pagination from "@/app/component/general/PaginationCustom";
import { routeModule } from "next/dist/build/templates/app-page";
import {
  deleteInformation,
  postInformation,
  updateInformation,
} from "@/app/api/information";
import PostFormPresence from "@/app/component/general/PostFormPresence";

const DashboardDetailKelasPage = () => {
  const url = usePathname();
  const parts = url.split("/");
  let role_user = Cookies.get("user_role");
  const access = Cookies.get("access_token");

  if (role_user == "superadmin") {
    role_user = "admin";
  }

  // search
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // page
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageInfo, setCurrentPageInfo] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const itemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Presence | null>(null);
  const [selectedInformation, setSelectedInformation] =
    useState<ClassInformation | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistant | null>(
    null
  );

  const [modalMode, setModalMode] = useState<"edit" | "create" | null>(null);

  const [kelas, setKelas] = useState<ClassroomData[]>([]);
  const [tugas, setTugas] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState("pertemuan");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 500);

  // BEGIN MODAL
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteAction, setDeleteAction] = useState<
    (() => Promise<void>) | null
  >(null);

  const handleOpenDeleteModal = (deleteFunction: () => Promise<void>) => {
    setDeleteAction(() => deleteFunction); // Store the delete function
    setIsDeleteModalOpen(true); // Open the modal
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false); // Close the modal
    setDeleteAction(null); // Clear the delete function
  };

  const handleConfirmDelete = async () => {
    if (deleteAction) {
      await deleteAction(); // Call the stored delete function
      setIsDeleteModalOpen(false);
    }
  };
  // --------------- END MODAL ------------------
  // PASTIKAN DIHAPUS
  const today = new Date().toISOString().split("T")[0];
  // const today = "2024-10-25";

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 650);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup event listener
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const sections = [
    { id: "pertemuan", label: "Pertemuan" },
    { id: "mahasiswa", label: "Mahasiswa" },
    { id: "asisten", label: "Asisten" },
    { id: "tugas", label: "Tugas" },
    { id: "kursus", label: "Kursus" },
    { id: "informasi", label: "Informasi" },
  ];

  const chartOptions: ApexCharts.ApexOptions = {
    series: [
      {
        // ganti kelas
        name: "Kehadiran",
        data: kelas.flatMap((kelasItem) =>
          kelasItem.presences.map((presence) =>
            presence.attendance_count !== 0 ? presence.attendance_count : null
          )
        ),
      },
    ],
    chart: {
      height: 180,
      type: "line",
      zoom: {
        enabled: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
    },
    title: {
      align: "left",
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    xaxis: {
      // ganti kelas
      categories: kelas.flatMap((kelasItem) =>
        kelasItem.presences.map((presence) => `Pertemuan ${presence.week}`)
      ),
    },
  };

  const handleOpenModal = (mode: "edit" | "create", presence?: Presence) => {
    setModalMode(mode);
    if (mode === "edit" && presence) {
      setSelectedMeeting(presence);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedMeeting(null);
    setIsModalOpen(false);
  };

  // Mahasiswa

  const handleScoreConfirmation = async (
    classroomId: number,
    studentId: number,
    savedScore: number | null
  ) => {
    try {
      if (savedScore) {
        // Jika sudah terkonfirmasi, lakukan cancel konfirmasi
        await deleteFinalScore(classroomId, studentId, role_user);
      } else {
        // Jika belum terkonfirmasi, lakukan konfirmasi
        await postFinalScore(classroomId, studentId, role_user, access);
      }

      // Fetch ulang data untuk memperbarui state
      await fetchClassrooms();
      toast.success("Data berhasil diperbarui 😁");
    } catch (error) {
      console.error("Error updating score:", error);
      toast.error("Gagal memperbarui data");
    }
  };

  // Assistant
  const handleOpenModalAssist = (assistant?: Assistant) => {
    if (assistant) {
      // Jika ada parameter, gunakan untuk mengedit
      setSelectedAssistant(assistant);
    } else {
      // Jika tidak ada parameter, buat objek baru
      const newAssistant = { name: "", nim: "" };
      setSelectedAssistant(newAssistant);
    }
    setIsModalOpen(true); // Buka modal
  };

  const handleSaveAssist = async (
    postedUser: Assistant,
    idClassroom: number
  ) => {
    if (!postedUser.id) {
      console.error("Assistant ID tidak ditemukan");
      toast.error("Gagal menyimpan, assistant ID tidak valid");
      return;
    }

    try {
      const response = await postAssistant(
        idClassroom,
        postedUser.id.toString()
      );
      toast.success("Asisten berhasil ditambahkan");
      fetchClassrooms(); // Memuat ulang data kelas setelah menyimpan
    } catch (error) {
      console.error("Gagal menyimpan asisten:", error);
      toast.error("Gagal menambahkan Asisten");
    }
  };

  const handleDeleteAssist = async (
    classroomId: number,
    assistantId: string
  ) => {
    if (!assistantId || !classroomId) {
      console.error("Assistant ID atau Classroom ID tidak ditemukan");
      return;
    }

    try {
      const result = await deleteAssistant(classroomId, assistantId);
      toast.success("Asisten berhasil dihapus");
      fetchClassrooms(); // Memuat ulang data kelas setelah penghapusan
    } catch (error) {
      console.error("Gagal menghapus asisten:", error);
      toast.error("Gagal menghapus Asisten");
    }
  };
  //  ----

  const handleOpenModalInfo = (information?: ClassInformation) => {
    if (information) {
      // Jika ada parameter, gunakan untuk mengedit
      setSelectedInformation(information);
    } else {
      // Jika tidak ada parameter, buat objek baru
      const newInformation = { title: "", description: "", id: null };
      setSelectedInformation(newInformation);
    }
    setIsModalOpen(true); // Buka modal
  };

  const handleCloseModalInfo = () => {
    setIsModalOpen(false);
    setSelectedInformation(null);
  };

  const handleSaveMeeting = async (updatedMeeting: Presence) => {
    let updatedData;
    try {
      const presences = kelas.flatMap((item) => item.presences);

      const duplicatePresence = presences.find(
        (presence) =>
          presence.presence_date === updatedMeeting.presence_date &&
          presence.id !== updatedMeeting.id
      );

      if (duplicatePresence) {
        toast.error(
          `Tanggal pertemuan telah digunakan pada pertemuan week ${duplicatePresence.week}`
        );
        return;
      }

      updatedData = await updatePresence(
        updatedMeeting.id,
        updatedMeeting.presence_date,
        role_user
      );

      handleCloseModal();
      fetchClassrooms();
      toast.success(`Tanggal berhasil dirubah 😁`);
    } catch (error) {
      toast.error(`Tanggal gagal dirubah`, error);
    }
  };

  const handleAddPresence = async (idClassroom: number, date: string) => {
    try {
      const presences = kelas.flatMap((item) => item.presences);

      // Cek apakah tanggal sudah digunakan
      const duplicatePresence = presences.find(
        (presence) => presence.presence_date === date
      );

      if (duplicatePresence) {
        toast.error(
          `Tanggal pertemuan telah digunakan pada pertemuan week ${duplicatePresence.week}`
        );
        return;
      }

      // Panggil fungsi API
      await addPresence(idClassroom, date, role_user);

      handleCloseModal();
      fetchClassrooms(); // Refresh data
      toast.success("Tanggal berhasil ditambah 😁");
    } catch (error) {
      toast.error("Tanggal gagal ditambah 😢");
    }
  };

  const handleDeletePresence = async (presenceId: string) => {
    try {
      const result = await deletePresence(presenceId, role_user);
      toast.success("Pertemuan berhasil dihapus");
      fetchClassrooms(); // Memuat ulang data kelas setelah penghapusan
    } catch (error) {
      console.error("Gagal menghapus pertemuan:", error);
      toast.error("Gagal menghapus pertemuan");
    }
  };

  // ---

  // Info handle
  const handleSaveInfo = async (
    savedInfo: ClassInformation,
    idClassroom: number
  ) => {
    try {
      let response;
      response = await postInformation(
        idClassroom,
        savedInfo.title,
        savedInfo.description,
        role_user
      );

      handleCloseModalInfo();
      fetchClassrooms(); // Memuat ulang data kelas setelah menyimpan
      toast.success(`Informasi berhasil ditambahkan😁`);
    } catch (error) {
      toast.error(`Gagal menambahkan informasi`, error);
    }
  };

  const handleUpdateInfo = async (
    savedInfo: ClassInformation,
    idClassroom: number,
    idInfo: number
  ) => {
    try {
      let response;
      response = await updateInformation(
        idClassroom,
        idInfo,
        savedInfo.title,
        savedInfo.description,
        access,
        role_user
      );

      handleCloseModalInfo();
      fetchClassrooms(); // Memuat ulang data kelas setelah menyimpan
      toast.success(`Informasi berhasil diperbarui 😁`);
    } catch (error) {
      toast.error(`Gagal memperbarui informasi`, error);
    }
  };

  const handleDeleteInfo = async (idClassroom, idInfo) => {
    try {
      await deleteInformation(idClassroom, idInfo, role_user);

      toast.success(`Berhasil menghapus Informasi 😁`);
      fetchClassrooms();
    } catch (error) {
      console.error("Gagal menghapus Informasi:", error);
      toast.error(`Gagal menghapus Informasi`);
    }
  };

  // ----

  // Penugasan

  const handleDeleteAssigment = async (idClassroom, idAssignment) => {
    try {
      await deleteAssignment(idClassroom, idAssignment, role_user);
      toast.success(`Berhasil menghapus tugas 😁`);
      fetchClassrooms();
    } catch (error) {
      console.error("Gagal menghapus tugas:", error);
      toast.error(`Gagal menghapus tugas`);
    }
  };

  // ----

  // end modal --

  const fetchClassrooms = async () => {
    try {
      let getClassroomDetails, getAssignments;

      getClassroomDetails = getDetailClassroom(parts[4], role_user);
      getAssignments = await getAssigment(
        searchTerm,
        currentPage,
        itemsPerPage,
        parts[4],
        role_user
      );

      //     const [response] = await Promise.all([getClassroomDetails]);

      const [response, responseAssigment] = await Promise.all([
        getClassroomDetails,
        getAssignments,
      ]);

      const formatData = (data) => {
        if (Array.isArray(data)) {
          return data;
        } else if (data && typeof data === "object") {
          return [data]; // Convert single object to array
        } else {
          throw new Error("Unexpected response format");
        }
      };

      setKelas(formatData(response.data));
      // KALO UDAH ADA APINYA PERLU GANTI
      setTugas(formatData(responseAssigment.data));
      setTotalPages(responseAssigment.meta.pagination.total_pages);
    } catch (error) {
      setError("Failed to fetch classrooms");
    } finally {
      setLoading(false);
    }
  };

  // pagination info
  let dataInfo = kelas[0]?.class_informations || [];

  const filteredDataInfo = dataInfo.filter((info) =>
    info.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPagesInfo = Math.ceil(filteredDataInfo.length / itemsPerPage);

  const currentDataInfo = filteredDataInfo.slice(
    (currentPageInfo - 1) * itemsPerPage,
    currentPageInfo * itemsPerPage
  );

  useEffect(() => {
    fetchClassrooms();
  }, [searchTerm, currentPage, currentPageInfo]);

  // tambahkan searchTerm sebagai dependency

  Cookies.set("current_classroom_id", kelas[0]?.classroom.id.toString());

  if (loading) return <SkeletonDetailKelas />;

  if (error) return <p>Kelas Tidak ditemukan</p>;

  return (
    <>
      {kelas.map((kelasItem, index) => (
        <div key={index}>
          <h1 className="text-3xl mb-2 sm:mb-4 sm:text-5xl">
            {kelasItem.classroom.name}
          </h1>

          <div className="flex flex-col lg:flex-row gap-6 2xl:gap-10">
            <div className="w-full">
              <div className="grid grid-cols-2 lg:flex items-center gap-x-2 md:gap-5 text-xs text-neutral2">
                <p>
                  Hari:{" "}
                  <strong className="font-semibold text-primary1">
                    {kelasItem.classroom.day}
                  </strong>
                </p>
                <p>
                  Jam:{" "}
                  <strong className="font-semibold text-primary1">
                    {kelasItem.classroom.time_start} -{" "}
                    {kelasItem.classroom.time_end} WIB
                  </strong>
                </p>
                <p>
                  Dosen:{" "}
                  <strong className="font-semibold text-primary1">
                    {kelasItem.classroom.lecture}
                  </strong>
                </p>
                <p>
                  Kuota:{" "}
                  <strong className="font-semibold text-primary1">
                    {kelasItem.classroom.quota}
                  </strong>
                </p>
              </div>
              <p className="mt-4 text-neutral2">
                {kelasItem.classroom.description}
              </p>
            </div>
            <table className="min-w-max text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
              <thead className=" text-neutral2 bg-gray-100">
                <tr>
                  <th scope="col" className="px-6 py-3 w-max">
                    Kontrak Kuliah
                  </th>
                  <th scope="col" className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 w-max">Presentase UTS</td>
                  <td className="px-6 py-4">
                    {kelasItem.classroom.uts_percent}
                  </td>
                </tr>
                <tr className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">Presentase UAS</td>
                  <td className="px-6 py-4">
                    {kelasItem.classroom.uas_percent}
                  </td>
                </tr>
                <tr className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">Presentase Tugas</td>
                  <td className="px-6 py-4">
                    {kelasItem.classroom.task_percent}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <article className="mt-4 mx-auto">
            {/* Navigasi untuk management active section */}

            <nav className="flex border-t py-3">
              {isMobile ? (
                <select
                  value={activeSection}
                  onChange={(e) => setActiveSection(e.target.value)}
                  className="w-max px-4 mt-3 py-2 font-medium rounded-md transition-all ease-in-out duration-200 bg-slate-50 text-primary1"
                >
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-max px-4 py-2 font-medium rounded-t-md transition-all ease-in-out duration-200 ${
                        activeSection === section.id
                          ? "bg-slate-50 text-primary1"
                          : "bg-gray-100 text-black hover:bg-slate-50 hover:text-primary1"
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              )}
            </nav>

            <section
              id="group-content"
              className="px-2 lg:px-4 py-4 w-full bg-slate-50 rounded-b-lg rounded-tr-lg"
            >
              {/* Pertemuan */}
              {activeSection === "pertemuan" && (
                <div id="pertemuan" className="mx-auto">
                  {/*Pertemuan */}
                  <div className="flex flex-col gap-3 Box-Pertemuan">
                    <div className="flex gap-5 flex-col-reverse md:flex-col-reverse lg:flex-row ">
                      {/* list */}
                      <div className="lg:w-[70%]  w-full shadow-md px-2 rounded-md">
                        <div id="chart" className="">
                          <p className="p-2">Statistik Kehadiran</p>
                          {kelas.length > 0 && (
                            <div className="block">
                              <ReactApexChart
                                options={chartOptions}
                                series={chartOptions.series}
                                type="line"
                                height={180}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      {/* kontrak pertemuan */}
                      <div className="lg:w-[30%] gap-5 mb-5 flex flex-col justify-center ">
                        <table className="w-full  shadow-sm text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
                          <thead className="text-sm text-neutral2 bg-gray-100">
                            <tr>
                              <th scope="col" className="px-6 py-3 w-max">
                                Kontrak Pertemuan
                              </th>
                              <th scope="col" className="px-6 py-3"></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4 w-max">Maksimal Izin</td>
                              <td className="px-6 py-4">
                                {kelasItem.classroom.max_absent}
                              </td>
                            </tr>
                            <tr className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4">Jumlah pertemuan</td>
                              <td className="px-6 py-4">
                                {kelasItem.presences.length}
                              </td>
                            </tr>
                            <tr className="bg-white border-b hover:bg-gray-50">
                              <td className="px-6 py-4">Pertemuan dimulai</td>
                              <td className="px-6 py-4">
                                {kelasItem.presences[0].presence_date_formatted}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        {/* button */}
                        {role_user == "assistant" || role_user == "student" ? (
                          <></>
                        ) : (
                          <>
                            <Button
                              text="Buatkan Pertemuan"
                              onClick={() => handleOpenModal("create")} // Untuk mode create
                            />
                          </>
                        )}
                      </div>
                    </div>
                    {/* sesi pertemuan */}
                    <div className="shadow-md">
                      {isMobile ? (
                        <>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {kelasItem.presences.map((presence) => (
                              <div
                                key={presence.id}
                                className="bg-white border border-gray-200 rounded-lg shadow-md p-4 hover:bg-gray-100 transition-all ease-in-out duration-150"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="text-sm font-semibold">
                                    Pertemuan {presence.week}
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold">
                                      {today === presence.presence_date ? (
                                        <span className="ml-2 text-green-500 font-bold">
                                          aktif
                                        </span>
                                      ) : (
                                        <span className="ml-2 text-red-500 font-bold">
                                          Belum waktunya
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs font-semibold">
                                  Tanggal: {presence.presence_date_formatted}
                                </div>
                                <div className="mt-1 text-xs">
                                  Ruang: {kelasItem.classroom.room}
                                </div>
                                <div className=" flex items-center justify-between mt-5">
                                  <Link
                                    className=" flex items-center justify-center w-1/2  h-10 gap-4 text-center text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                                    href={`${kelasItem.classroom.id}/${presence.id}`}
                                  >
                                    <p>Masuk</p>
                                  </Link>
                                  <div className="flex items-center justify-end gap-2">
                                    <Link
                                      href={`#`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleOpenModal("edit", presence);
                                      }}
                                      className="p-2 bg-yellow2 rounded-full hover:bg-yellow1 transition-all ease-in-out duration-150"
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

                                    {role_user == "assistant" ||
                                    role_user == "student" ? (
                                      <></>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() =>
                                            handleOpenDeleteModal(() =>
                                              handleDeletePresence(
                                                String(presence.id)
                                              )
                                            )
                                          }
                                          className="bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="18px"
                                            viewBox="0 0 24 24"
                                            width="18px"
                                          >
                                            <path
                                              d="M0 0h24v24H0V0z"
                                              fill="none"
                                            />
                                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" />
                                          </svg>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
                            <thead className="text-neutral2 bg-gray-100">
                              <tr>
                                <th scope="col" className="p-4">
                                  <div className="flex items-center">No</div>
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  Sesi Pertemuan
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  Tanggal
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  Ruang
                                </th>
                                <th
                                  scope="col"
                                  className="px-6 py-3 text-center "
                                >
                                  Status
                                </th>
                                <th scope="col" className="px-6 py-3">
                                  Aksi
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {kelasItem.presences.map((presence, index) => (
                                <tr
                                  key={presence.id}
                                  className="bg-white border-b hover:bg-gray-100"
                                >
                                  <td className="w-4 p-4">
                                    <div className="flex items-center">
                                      {index + 1}
                                    </div>
                                  </td>

                                  <td className="px-6 py-3 text-sm font-semibold">
                                    Pertemuan {presence.week}
                                  </td>
                                  <td className="px-6 py-3">
                                    <p className="text-xs font-semibold">
                                      {presence.presence_date_formatted}
                                    </p>
                                  </td>
                                  <td className="px-6 py-3 text-xs">
                                    {kelasItem.classroom.room}
                                  </td>
                                  <td className="px-6 py-3 w-36 ">
                                    <span className="flex justify-center items-center text-xs font-medium w-full h-[2rem] rounded-full text-center  text-blue-800 bg-blue-100">
                                      <Link
                                        className="flex items-center justify-center text-center"
                                        href={`${kelasItem.classroom.id}/${presence.id}`}
                                      >
                                        Masuk
                                      </Link>
                                    </span>
                                  </td>
                                  <td className="px-6 py-3 ">
                                    <div className="flex gap-1">
                                      <Link
                                        href={`#`}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleOpenModal("edit", presence);
                                        }}
                                        className="block bg-yellow2 p-1 rounded-md fill-white hover:bg-yellow1 transition-all ease-in-out duration-150"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          height="18px"
                                          viewBox="0 0 24 24"
                                          width="18px"
                                        >
                                          <path
                                            d="M0 0h24v24H0V0z"
                                            fill="none"
                                          />
                                          <path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                        </svg>
                                      </Link>
                                      {role_user == "assistant" ||
                                      role_user == "student" ? (
                                        <></>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() =>
                                              handleOpenDeleteModal(() =>
                                                handleDeletePresence(
                                                  String(presence.id)
                                                )
                                              )
                                            }
                                            className="bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              height="18px"
                                              viewBox="0 0 24 24"
                                              width="18px"
                                            >
                                              <path
                                                d="M0 0h24v24H0V0z"
                                                fill="none"
                                              />
                                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" />
                                            </svg>
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <Modal
                      title={
                        modalMode === "edit"
                          ? "Edit Pertemuan"
                          : "Buat Presensi Baru"
                      }
                      isOpen={isModalOpen}
                      onClose={handleCloseModal}
                    >
                      {modalMode === "edit" && selectedMeeting && (
                        <EditForm
                          user={selectedMeeting}
                          onSave={handleSaveMeeting}
                        />
                      )}
                      {modalMode === "create" && (
                        <PostFormPresence
                          idClassroom={kelasItem.classroom.id} // Kirim ID classroom
                          onSave={(date) =>
                            handleAddPresence(kelasItem.classroom.id, date)
                          }
                        />
                      )}
                    </Modal>
                  </div>
                </div>
              )}

              {/* Mahasiswa */}
              {activeSection === "mahasiswa" && (
                <div id="mahasiswa" className="mx-auto">
                  {isMobile ? (
                    <div className="overflow-auto">
                      <div className="infoHead">
                        <h3>Informasi Mahasiswa</h3>
                        <p>Berikut list Mahasiswa pada kelas</p>
                      </div>
                      <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
                        <thead className="text-sm text-neutral2 bg-gray-100">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-center">
                              Nama
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {kelas.flatMap((kelasItem) =>
                            kelasItem.students.map((student, index) => (
                              <tr
                                key={student.id}
                                className="bg-white border-b hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-xs flex flex-col gap-1 text-center">
                                    <p className="font-medium text-neutral2">
                                      {student.name}
                                    </p>
                                    <p className="font-normal text-neutral2">
                                      {student.identity_code}
                                    </p>

                                    <div className="penilaian mt-2 flex justify-center flex-col items-center">
                                      <p className="font-semibold ">
                                        Penilaian :
                                      </p>
                                      <div className="nilai mt-2 gap-3 flex">
                                        <div className="nTugas w-20 font-medium rounded-md  p-2 text-center bg-green-300">
                                          Tugas : {student.task_score ?? "-"}
                                        </div>
                                        <div className="nUts w-20 font-medium rounded-md  p-2 text-center bg-red-300">
                                          UTS : {student.uts_score ?? "-"}
                                        </div>
                                        <div className="nUa w-20  font-medium rounded-md p-2 text-center bg-blue-300">
                                          UAS : {student.uas_score ?? "-"}
                                        </div>
                                      </div>

                                      <div className="nAkhir flex flex-col  mt-3 gap-3 items-center justify-center">
                                        <p>Nilai Akhir :</p>
                                        <p className="text-xl">
                                          {student.calculated_score ?? "-"}
                                        </p>
                                      </div>

                                      <div
                                        className={`w-full mt-3 flex justify-center ${
                                          role_user == "assistant"
                                            ? "hidden"
                                            : ""
                                        }`}
                                      >
                                        <Button
                                          text={
                                            student.saved_score
                                              ? "Cancel"
                                              : "Konfirmasi"
                                          }
                                          onClick={() =>
                                            handleScoreConfirmation(
                                              kelasItem.classroom.id,
                                              student.id,
                                              student.saved_score
                                            )
                                          }
                                          className={
                                            student.saved_score
                                              ? "bg-red-500"
                                              : ""
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <>
                      <div className="infoHead mb-8">
                        <h3>Informasi Mahasiswa</h3>
                        <p>Berikut list Mahasiswa pada kelas</p>
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
                              Nim
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                              Nilai Tugas
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                              Nilai UTS
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                              Nilai UAS
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                              Nilai Akhir
                            </th>
                            <th
                              scope="col"
                              className={`px-6 py-3 text-center ${
                                role_user == "assistant" ? "hidden" : ""
                              }`}
                            >
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* sini student */}
                          {kelas.flatMap((kelasItem) =>
                            kelasItem.students.map((student, index) => (
                              <tr
                                key={student.id}
                                className="bg-white border-b hover:bg-gray-50"
                              >
                                <td className="w-4 p-4">
                                  <div className="flex items-center">
                                    {index + 1}
                                  </div>
                                </td>
                                <td className="px-2 py-4 whitespace-nowrap">
                                  <div className="text-xs flex flex-col gap-1">
                                    <p className="font-medium text-neutral2">
                                      {student.name}
                                    </p>
                                    <p className="font-normal text-neutral2">
                                      Semester {student.semester}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  {student.identity_code}
                                </td>
                                <td className="p-2 text-center">
                                  <p className="font-normal text-gray-500">
                                    {student.task_score ?? "-"}
                                  </p>
                                </td>

                                <td className="p-2 text-center">
                                  <p className="font-normal text-gray-500">
                                    {student.uts_score ?? "-"}
                                  </p>
                                </td>

                                <td className="p-2 text-center">
                                  <p className="font-normal text-gray-500">
                                    {student.uas_score ?? "-"}
                                  </p>
                                </td>

                                <td className="p-2 text-center">
                                  <p className=" text-neutral2 font-bold">
                                    {student.calculated_score ?? "-"}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <div
                                    className={`w-full mt-3 flex justify-center ${
                                      role_user == "assistant" ? "hidden" : ""
                                    }`}
                                  >
                                    <Button
                                      text={
                                        student.saved_score
                                          ? "Cancel"
                                          : "Konfirmasi"
                                      }
                                      onClick={() =>
                                        handleScoreConfirmation(
                                          kelasItem.classroom.id,
                                          student.id,
                                          student.saved_score
                                        )
                                      }
                                      className={
                                        student.saved_score ? "bg-red-500" : ""
                                      }
                                    />
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </>
                  )}
                </div>
              )}

              {/* Asisten*/}
              {activeSection === "asisten" && (
                <div id="asisten" className="mx-auto w-full">
                  <div className="Info mb-3 flex flex-col  items-center justify-between md:flex-row w-full md:text-start text-center ">
                    <div className="infoHead">
                      <h3>Informasi Asisten</h3>
                      <p>Berikut list asisten pada kelas</p>
                    </div>
                    {/* button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenModalAssist();
                      }}
                      className={` ${
                        role_user === "lecture" || role_user === "assistant"
                          ? "hidden"
                          : ""
                      } flex items-center w-1/2 mb-3 md:w-[20%] justify-center gap-2 bg-primary1 text-white fill-white hover:bg-primary2 focus:ring-primary5 px-4 py-2 lg:px-5 lg:py-2.5 font-medium rounded-lg focus:ring-4 focus:outline-none transition-all ease-in-out duration-300`}
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
                      <p>Tambah Asisten</p>
                    </button>
                  </div>
                  {isMobile ? (
                    <div className="overflow-auto">
                      <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
                        <thead className="text-sm text-neutral2 bg-gray-100">
                          <tr>
                            <th scope="col" className="p-2">
                              No
                            </th>
                            <th scope="col" className="px-4 py-3">
                              Nama
                            </th>

                            <th
                              scope="col"
                              className={`${
                                role_user == "lecture" ||
                                role_user == "assistant"
                                  ? "hidden"
                                  : ""
                              } px-6 py-3 `}
                            >
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {kelas.flatMap((kelasItem) =>
                            kelasItem.assistants.map((asisten, index) => (
                              <tr
                                key={asisten.id}
                                className="bg-white border-b hover:bg-gray-50"
                              >
                                <td className="p-2 text-center">{index + 1}</td>
                                <td className="px-1 py-4 whitespace-nowrap">
                                  <div className="text-xs flex flex-col gap-1">
                                    <p className="font-medium text-neutral2">
                                      {asisten.name}
                                    </p>
                                    <p className="font-normal text-neutral2">
                                      {asisten.nim}
                                    </p>
                                  </div>
                                </td>

                                <td
                                  className={`${
                                    role_user == "lecture" ||
                                    role_user == "assistant"
                                      ? "hidden"
                                      : ""
                                  } px-6 py-3 `}
                                >
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() =>
                                        handleOpenDeleteModal(() =>
                                          handleDeleteAssist(
                                            kelasItem.classroom.id,
                                            asisten.id
                                          )
                                        )
                                      }
                                      className="bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
                                    >
                                      {" "}
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
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
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
                            Nim
                          </th>

                          <th
                            scope="col"
                            className={`${
                              role_user == "lecture" || role_user == "assistant"
                                ? "hidden"
                                : ""
                            } px-6 py-3 `}
                          >
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {kelas.flatMap((kelasItem) =>
                          // sini asisten table
                          kelasItem.assistants.map((asisten, index) => (
                            <tr
                              key={asisten.id}
                              className="bg-white border-b hover:bg-gray-50"
                            >
                              <td className="w-4 p-4">
                                <div className="flex items-center">
                                  {index + 1}
                                </div>
                              </td>

                              <td className="px-2 py-4 whitespace-nowrap">
                                <div className="text-xs flex flex-col gap-1">
                                  <p className="font-medium text-neutral2">
                                    {asisten.name}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4">{asisten.nim}</td>

                              <td
                                className={`${
                                  role_user == "lecture" ||
                                  role_user == "assistant"
                                    ? "hidden"
                                    : ""
                                } px-6 py-3 `}
                              >
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      handleOpenDeleteModal(() =>
                                        handleDeleteAssist(
                                          kelasItem.classroom.id,
                                          asisten.id
                                        )
                                      )
                                    }
                                    className="bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
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
                        )}
                      </tbody>
                    </table>
                  )}

                  {/* Update modal */}
                  <Modal
                    title={
                      selectedAssistant?.id
                        ? "Update Asisten"
                        : "Tambah Asisten"
                    }
                    isOpen={isModalOpen}
                    onClose={handleCloseModalInfo}
                  >
                    <PostFormAsisten
                      idClassroom={kelasItem.classroom.id}
                      user={selectedAssistant}
                      onSave={(postedUser) =>
                        handleSaveAssist(postedUser, kelasItem.classroom.id)
                      } // Mengirim postedUser ke parent
                    />
                  </Modal>
                </div>
              )}

              {/* Tugas */}
              {activeSection === "tugas" && (
                <div id="tugas" className="mx-auto mt-4 w-full">
                  {/* list Tugas */}
                  <h3 className="font-semibold mb-3">Tabel Penugasan</h3>
                  <div className="flex flex-col sm:flex-row sm:row gap-2  w-full justify-between items-center">
                    {/* Search */}
                    <div className=" w-auto flex ">
                      <input
                        type="text"
                        onChange={handleSearchChange}
                        id="table-search"
                        className="block w-[200px] lg:w-[300px] p-2 ps-2 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
                        placeholder="Cari Tugas"

                        // onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <Link
                      href={{
                        pathname: `${kelasItem.classroom.id}/tambah-tugas`,
                        query: {
                          idClassroom: `${kelasItem.classroom.id}`,
                        },
                      }}
                      className="w-max bg-white border border-blue-600 hover:text-white hover:bg-primary2 focus:ring-primary5 px-5 py-2 lg:px-3 lg:py-2.5 font-medium rounded-lg focus:ring-4 focus:outline-none transition-all ease-in-out duration- mb-3"
                    >
                      + Tambah Tugas
                    </Link>
                  </div>
                  {isMobile ? (
                    <>
                      {" "}
                      {tugas.map((tugasItem, index) => (
                        <div
                          key={tugasItem.id}
                          className="bg-white rounded-lg shadow-md p-4 mt-2"
                        >
                          <div className="flex justify-between items-center border-b pb-2 mb-2">
                            <h3 className="text-base font-semibold">
                              {tugasItem.title}
                            </h3>
                            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                              {tugasItem.type}
                            </span>
                          </div>
                          {/* waktu */}
                          <div className="flex justify-between items-center text-xs mb-2">
                            {/* start */}
                            <div className="mulai flex gap-2 items-center text-green-700">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="20px"
                                viewBox="0 -960 960 960"
                                width="20px"
                                className="fill-green-700"
                              >
                                <path d="M320-160h320v-120q0-66-47-113t-113-47q-66 0-113 47t-47 113v120ZM160-80v-80h80v-120q0-61 28.5-114.5T348-480q-51-32-79.5-85.5T240-680v-120h-80v-80h640v80h-80v120q0 61-28.5 114.5T612-480q51 32 79.5 85.5T720-280v120h80v80H160Z" />
                              </svg>
                              <div className="detail-time">
                                <div>
                                  {dayFormated(tugasItem.start_time)} -{" "}
                                  {hourFormated(tugasItem.start_time)}
                                </div>
                                <div className="font-semibold">
                                  {dateFormated(tugasItem.start_time)}
                                </div>
                              </div>
                            </div>
                            <div className="h-5 w-[1px] rounded-full bg-slate-500 mx-4 "></div>
                            {/* end */}
                            <div className="selesai flex gap-2 items-center text-red-700">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="20px"
                                viewBox="0 -960 960 960"
                                width="20px"
                                className="fill-red-700"
                              >
                                <path d="M480-516q65 0 110.5-45.5T636-672v-120H324v120q0 65 45.5 110.5T480-516ZM192-96v-72h60v-120q0-59 28-109.5t78-82.5q-49-32-77.5-82.5T252-672v-120h-60v-72h576v72h-60v120q0 59-28.5 109.5T602-480q50 32 78 82.5T708-288v120h60v72H192Z" />
                              </svg>
                              <div className="detail-time">
                                <div>
                                  {dayFormated(tugasItem.deadline)} -{" "}
                                  {hourFormated(tugasItem.deadline)}
                                </div>
                                <div className="font-semibold">
                                  {dateFormated(tugasItem.deadline)}
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* deskripsi */}
                          <div className="text-xs mb-2">
                            <p className="text-justify my-3">
                              {tugasItem.description}
                            </p>
                          </div>

                          {/* detail terkumpul + file */}
                          <div className="flex gap-2">
                            <div className="flex justify-center items-center text-xs w-full rounded-md bg-neutral-100">
                              <p>
                                {tugasItem.student.total_submitted} /{" "}
                                {tugasItem.student.student_need_to_submit}
                              </p>
                            </div>
                            <div className="w-full flex items-center justify-center py-2 rounded-md bg-blue-100">
                              {tugasItem.file == null ? (
                                <p>Tidak ada file</p>
                              ) : (
                                <a
                                  href={tugasItem.file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    height="24px"
                                    viewBox="0 -960 960 960"
                                    width="24px"
                                    fill="#2014c8"
                                  >
                                    <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520h200L520-800v200Z" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-center items-center gap-4 mt-3">
                            <Link
                              href={{
                                pathname: `${kelasItem.classroom.id}/tambah-tugas`,
                                query: {
                                  idClassroom: kelasItem.classroom.id,
                                  idAssignment: tugasItem.id,
                                },
                              }}
                              className="bg-yellow2 p-1 rounded-md fill-white hover:bg-yellow1 transition-all ease-in-out duration-150"
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
                                handleOpenDeleteModal(() =>
                                  handleDeleteAssigment(
                                    kelasItem.classroom.id,
                                    tugasItem.id
                                  )
                                )
                              }
                              className="bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
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
                            <Link
                              href={{
                                pathname: `${kelasItem.classroom.id}/penilaian`,
                                query: {
                                  idClassroom: kelasItem.classroom.id,
                                  idAssignment: tugasItem.id,
                                },
                              }}
                              className="bg-green-800 p-1 rounded-md fill-white hover:bg-green-700 transition-all ease-in-out duration-150"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="18px"
                                viewBox="0 -960 960 960"
                                width="18px"
                                fill="#F3F3F3"
                              >
                                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm80-160h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm200-190q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790Z" />
                              </svg>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
                      {" "}
                      <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden mt-5 ">
                        <thead className="text-sm text-neutral2 bg-gray-100">
                          <tr className="text-center">
                            <th scope="col" className="p-4">
                              No
                            </th>
                            <th scope="col" className="px-6 py-3">
                              Nama Tugas
                            </th>
                            <th scope="col" className="px-6 py-3 text-left">
                              Deskripsi
                            </th>
                            <th scope="col" className="px-6 py-3 text-center ">
                              Tanggal Mulai
                            </th>
                            <th scope="col" className="px-6 py-3 text-center ">
                              Tanggal Selesai
                            </th>
                            <th scope="col" className="px-6 py-3">
                              File
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                              Jenis
                            </th>
                            <th scope="col" className="px-6 py-3 text-center">
                              Terkumpul
                            </th>

                            <th scope="col" className="px-6 py-3">
                              Aksi
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tugas.length === 0 ? (
                            <tr>
                              <td
                                colSpan={9}
                                className="px-6 py-4 text-center "
                              >
                                Tidak ada tugas diberikan
                              </td>
                            </tr>
                          ) : (
                            tugas.map((tugasItem, index = 0) => {
                              return (
                                <tr
                                  key={tugasItem.id}
                                  className="bg-white border-b hover:bg-gray-50"
                                >
                                  <td className="w-4 p-4">{index + 1}</td>
                                  <td className="px-6 py-4 font-semibold">
                                    {tugasItem.title}
                                  </td>
                                  <td className="px-6 py-4">
                                    {tugasItem.description}
                                  </td>
                                  <td className="px-2 py-4  text-center">
                                    <div>
                                      {dayFormated(tugasItem.start_time)} -{" "}
                                      {hourFormated(tugasItem.start_time)}
                                    </div>
                                    <div className="font-semibold">
                                      {dateFormated(tugasItem.start_time)}
                                    </div>
                                  </td>
                                  <td className="px-2 py-4  text-center">
                                    <div>
                                      {dayFormated(tugasItem.deadline)} -{" "}
                                      {hourFormated(tugasItem.deadline)}
                                    </div>
                                    <div className="font-semibold">
                                      {dateFormated(tugasItem.deadline)}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    {/* "file": null, jika tidak null maka tugasItem.file */}
                                    {tugasItem.file == null ? (
                                      <p>Tidak ada file</p>
                                    ) : (
                                      <a href={tugasItem.file}>
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          height="24px"
                                          viewBox="0 -960 960 960"
                                          width="24px"
                                          fill="#2014c8"
                                        >
                                          <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520h200L520-800v200Z" />
                                        </svg>
                                      </a>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 ">
                                    <span className="bg-blue-100 text-blue-800 text-sm font-medium me-2 px-2.5 py-0.5 rounded   ms-3">
                                      {tugasItem.type}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center font-semibold">
                                    {tugasItem.student.total_submitted} /{" "}
                                    {tugasItem.student.student_need_to_submit}
                                  </td>

                                  <td className="px-6 py-4">
                                    <div className="flex gap-1">
                                      {/* edit */}
                                      <Link
                                        href={{
                                          pathname: `${kelasItem.classroom.id}/tambah-tugas`, // atau halaman yang sesuai jika berbeda
                                          query: {
                                            idClassroom: kelasItem.classroom.id,
                                            idAssignment: tugasItem.id, // Parameter untuk mode edit
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
                                          <path
                                            d="M0 0h24v24H0V0z"
                                            fill="none"
                                          />
                                          <path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                        </svg>
                                      </Link>
                                      {/* delete */}
                                      <button
                                        onClick={() =>
                                          handleOpenDeleteModal(() =>
                                            handleDeleteAssigment(
                                              kelasItem.classroom.id,
                                              tugasItem.id
                                            )
                                          )
                                        }
                                        className="bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          height="18px"
                                          viewBox="0 0 24 24"
                                          width="18px"
                                        >
                                          <path
                                            d="M0 0h24v24H0V0z"
                                            fill="none"
                                          />
                                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" />
                                        </svg>
                                      </button>
                                      <span className="block bg-green-800 p-1 rounded-md fill-white hover:bg-green-700 transition-all ease-in-out duration-150">
                                        <Link
                                          href={{
                                            pathname: `${kelasItem.classroom.id}/penilaian`,
                                            query: {
                                              idClassroom:
                                                kelasItem.classroom.id,
                                              idAssignment: tugasItem.id,
                                              deadlineTask: tugasItem.deadline,
                                            },
                                          }}
                                        >
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            height="18px"
                                            viewBox="0 -960 960 960"
                                            width="18px"
                                            fill="#F3F3F3"
                                          >
                                            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q13-36 43.5-58t68.5-22q38 0 68.5 22t43.5 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm80-160h280v-80H280v80Zm0-160h400v-80H280v80Zm0-160h400v-80H280v80Zm200-190q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790Z" />
                                          </svg>
                                        </Link>
                                      </span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                      <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                      />
                    </>
                  )}
                </div>
              )}

              {/* Kursus */}
              {activeSection === "kursus" && (
                <div id="kursus" className="mx-auto">
                  {/* list kursus */}
                  <section
                    id="kursus"
                    aria-label="Kursus Bengkel Koding"
                    className="grid lg:max-w-screen-lg grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3"
                  >
                    {kelasItem.courses.length > 0 ? (
                      kelasItem.courses.map((k, index) => (
                        <Link
                          href={`/kursus/${k.id}/artikel/${k.first_article_id}`}
                          key={index}
                          target="_blank"
                          className="max-w-[90%] lg:max-w-full mx-auto rounded-xl transition-all duration-200 ease-in-out transform hover:shadow-[rgba(7,_65,_210,_0.1)_0px_9px_30px] hover:scale-105"
                        >
                          <div className="h-full bg-white rounded-lg p-4">
                            <Image
                              src={k.image}
                              alt={k.title}
                              width={800}
                              height={500}
                              className="w-full h-auto rounded-md"
                            />
                            <div className="mt-2 flex flex-col justify-between gap-1">
                              {/* Judul Kursus */}
                              <p className="font-semibold text-base md:text-lg">
                                {k.title}
                              </p>

                              {/* Deskripsi Kursus */}
                              <div>
                                <p className="text-sm text-neutral2">
                                  {k.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="w-full mx-auto col-span-3 text-center">
                        <p className="text-2xl md:text-3xl my-4">😔</p>
                        <h2 className="font-semibold text-lg md:text-xl">
                          Upss, kursus tidak ditemukan
                        </h2>
                      </div>
                    )}
                  </section>
                </div>
              )}

              {/* Informasi Kelas */}
              {activeSection === "informasi" && (
                <div id="informasi" className="mx-auto">
                  <h3 className="font-semibold mb-3">List Informasi</h3>

                  <div className="flex gap-2 flex-column sm:flex-row flex-wrap items-center justify-between pb-4">
                    {/* Search */}
                    <div className=" w-auto flex flex-wrap ">
                      <input
                        type="text"
                        onChange={handleSearchChange}
                        id="table-search"
                        className="block w-[200px] lg:w-[300px] p-2 ps-2 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
                        placeholder="Cari Informasi"
                      />
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenModalInfo();
                      }}
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
                      <p>Tambah Informasi</p>
                    </button>
                  </div>

                  {/* list informasi */}

                  <div className="mt-4">
                    <div className="flex flex-col gap-2">
                      {/* detail informasi */}
                      {currentDataInfo.map((informasi, index) => (
                        <div
                          key={index}
                          className="w-full flex flex-col lg:flex-row justify-between items-center rounded-md border border-gray-200 hover:shadow-lg transition-all ease-out duration-200 cursor-pointer"
                        >
                          <div className="flex flex-col w-full">
                            <div className="iconInfo lg:hidden items-center flex p-2 rounded-full">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="34px"
                                viewBox="0 -960 960 960"
                                width="34px"
                                className="fill-primary2"
                              >
                                <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                              </svg>
                            </div>
                            {/* card */}
                            <div className="detailInformasi h-auto flex w-full gap-2">
                              {/* icon */}
                              <div className="iconInfo lg:flex items-center hidden justify-center p-2 rounded-full">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  height="34px"
                                  viewBox="0 -960 960 960"
                                  width="34px"
                                  className="fill-primary2"
                                >
                                  <path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z" />
                                </svg>
                              </div>
                              {/* info */}
                              <div className="info-content w-full px-4 rounded-md">
                                {/* judul */}
                                <h4 className="text-primary1 font-medium text-sm rounded-md p-1">
                                  {informasi.title}
                                </h4>
                                {/* descrip */}
                                {informasi.description && (
                                  <p className="text-sm mt-2 break-words">
                                    {splitTextByURL(informasi.description)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Aksi buttons */}
                          <div className="aksi w-full justify-end lg:w-auto flex gap-2 p-2 sm:p-4">
                            {/* edit */}
                            <Link
                              href={`/edit/${informasi.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                handleOpenModalInfo(informasi);
                              }}
                              className="bg-yellow-400 p-2 rounded-md hover:bg-yellow-500 transition-all ease-in-out duration-150"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="18px"
                                viewBox="0 0 24 24"
                                width="18px"
                                className="fill-white"
                              >
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M3 17.46v3.04c0 .28.22.5.5.5h3.04c.13 0 .26-.05.35-.15L17.81 9.94l-3.75-3.75L3.15 17.1c-.1.1-.15.22-.15.36zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                              </svg>
                            </Link>

                            {/* delete */}
                            <button
                              onClick={() =>
                                handleOpenDeleteModal(() =>
                                  handleDeleteInfo(
                                    kelasItem.classroom.id,
                                    informasi.id
                                  )
                                )
                              }
                              className="bg-red2 p-1 rounded-md fill-white hover:bg-red1 transition-all ease-in-out duration-150"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                height="18px"
                                viewBox="0 0 24 24"
                                width="18px"
                                className="fill-white"
                              >
                                <path d="M0 0h24v24H0V0z" fill="none" />
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v10zM18 4h-2.5l-.71-.71c-.18-.18-.44-.29-.7-.29H9.91c-.26 0-.52.11-.7.29L8.5 4H6c-.55 0-1 .45-1 1s.45 1 1 1h12c.55 0 1-.45 1-1s-.45-1-1-1z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Modal
                      title={
                        selectedInformation?.id ? "Update Info" : "Tambah Info"
                      }
                      isOpen={isModalOpen}
                      onClose={handleCloseModalInfo}
                    >
                      {selectedInformation && selectedInformation.id ? (
                        <EditFormInfo
                          user={selectedInformation}
                          onSave={(updatedInfo) =>
                            handleUpdateInfo(
                              updatedInfo,
                              kelasItem.classroom.id,
                              selectedInformation.id
                            )
                          }
                        />
                      ) : (
                        <PostFormInfo
                          user={selectedInformation}
                          onSave={(newInfo) =>
                            handleSaveInfo(newInfo, kelasItem.classroom.id)
                          }
                        />
                      )}
                    </Modal>

                    {/* lihat lif */}
                    <Pagination
                      totalPages={totalPagesInfo}
                      currentPage={currentPageInfo}
                      setCurrentPage={setCurrentPageInfo}
                    />
                  </div>
                </div>
              )}
            </section>
          </article>
          {/* Konfirmasi delete modal */}
          <Modal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            title="Konfirmasi Hapus"
          >
            <div className="py-4">
              <p>Apakah kamu ingin menghapus?</p>
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-gray-300 rounded-md"
                >
                  Kembali
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  {/* test */}
                  Hapus
                </button>
              </div>
            </div>
          </Modal>
          {/* ---- */}
          <ToastContainer />
        </div>
      ))}
    </>
  );
};

export default DashboardDetailKelasPage;
