"use client";
import { getDataDashboard } from "@/app/api/dashboardDosenAsisten";
import { getProfile } from "@/app/api/general";
import Pagination from "@/app/component/general/PaginationCustom";
import { DashboardData } from "@/app/interface/DashBoardDosenAsisten";
import { formatDateTime, formatTimeRange } from "@/app/lib/formatDate";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const HomeDosenAsisten = () => {
  // State untuk pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageTask, setCurrentPageTask] = useState(1);
  const [profile, setProfile] = useState({
    id: 0,
    identity_code: "",
    name: "",
    email: "",
    role: "",
    image: "",
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  const itemsPerPage = 5;
  const itemsPerPageTask = 4;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responseProfile = await getProfile();
        setProfile(responseProfile.data);

        const responseData = await getDataDashboard(responseProfile.data.role);
        setDashboardData(responseData.data); // Pastikan responseData.data sesuai
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  let dataPertemuan = dashboardData?.presence_this_week || [];
  const totalPages = Math.ceil(dataPertemuan.length / itemsPerPage);
  let dataPenugasan = dashboardData?.upcoming_assignment || [];
  const totalPagesTask = Math.ceil(dataPenugasan.length / itemsPerPageTask);

  // Data per halaman
  const currentData = dataPertemuan.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const currentDataTask = dataPenugasan.slice(
    (currentPageTask - 1) * itemsPerPageTask,
    currentPageTask * itemsPerPageTask
  );

  const getRolePath = (role: string) => {
    switch (role) {
      case "assistant":
        return "asisten";
      case "lecture":
        return "dosen";
      default:
        return "user"; // Nilai default jika tidak cocok
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 2xl:gap-4 mt-2 lg:mt-3 2xl:mt-4  ">
        <div className="grid grid-cols-1 md:grid-cols-4 w-full items-center justify-center gap-2 ">
          {/* Foto */}
          <div className="col-span-1 md:w-full mx-auto flex items-center justify-center ">
            {profile.image !== null ? (
              <Image
                src={profile.image}
                alt="Image Profile"
                className="w-full rounded-md "
                width={150}
                height={150}
              />
            ) : (
              <Image
                src="/img/user.png"
                alt="Image Profile"
                className="w-full"
                width={100}
                height={100}
              />
            )}
          </div>

          {/* Background kuning dengan informasi */}
          <div className="col-span-3 text-center md:text-start bg-neutral-100 rounded-md p-2  flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold">{profile.name}</h2>
              <p className="text-sm font-semibold">{profile.identity_code}</p>
              <p className="mt-2 text-sm">
                Selamat datang kembali ke manajemen kelas, {profile.name}. Mulai
                hari dengan penuh semangat.
              </p>
            </div>

            {/* Info Card */}
            <div className="mt-4 grid grid-cols-2 text-start gap-2">
              <div className="box1 rounded-lg flex items-center  justify-center bg-blue-700 gap-3 w-full p-4 sm:p-3 min-w-0">
                <div className="icon w-10 h-10 md:w-8 md:h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-400 opacity-85">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                    // height="24px"
                    // width="24px"

                    className=" w-6 h-6 md:w-4 md:h-4"
                    fill="#ffffff"
                  >
                    <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z" />
                  </svg>
                </div>
                <div className="infoCardJmlMhs text-white font font-semibold flex-grow min-w-0">
                  <p className="font-semibold text-2xl sm:text-3xl">
                    {dashboardData?.statistics.students_count}
                  </p>
                  <p className="text-sm">Jumlah Mahasiswa</p>
                </div>
              </div>
              <div className="box2 rounded-lg flex items-center  justify-center  bg-green-700 gap-3 w-full p-4 sm:p-3 min-w-0">
                <div className="icon w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-green-400 opacity-85">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24px"
                    viewBox="0 -960 960 960"
                    width="24px"
                    fill="#ffffff"
                  >
                    <path d="M840-288v-276L480-384 48-600l432-216 432 216v312h-72ZM480-144 216-276v-159l264 132 264-132v159L480-144Z" />
                  </svg>
                </div>
                <div className="infoCardJmlMhs text-white font font-semibold flex-grow min-w-0">
                  <p className="font-semibold text-2xl sm:text-3xl">
                    {dashboardData?.statistics.classrooms_count}
                  </p>
                  <p className="text-sm">Kelas Aktif</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information card */}
        <div className="informationCard bg-neutral-100 rounded-md p-2 flex gap-4">
          <div className="information w-full h-full flex flex-col ">
            <h3 className="font-semibold">Informasi kelas</h3>
            <p>Lihat Informasi Kelas yang berada di Bengkel Koding</p>

            <div className="infoCard mt-5 items-start flex flex-col gap-4 w-full ">
              <div className="box1 py-2 rounded-lg flex items-center justify-between bg-white gap-3 w-full p-2 pr-6">
                <div className="box-izin flex items-start justify-between gap-3 w-full">
                  <div className="container flex gap-3 items-center">
                    <div className="icon w-12 h-12 rounded-md  flex items-center justify-center bg-red-600 ">
                      <div className="icon-detail  rounded-full w-8 h-8 flex items-center justify-center bg-white bg-opacity-20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20px"
                          viewBox="0 -960 960 960"
                          width="20px"
                          fill="white"
                        >
                          <path d="M840-120v-640H120v320H40v-320q0-33 23.5-56.5T120-840h720q33 0 56.5 23.5T920-760v560q0 33-23.5 56.5T840-120ZM360-400q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM40-80v-112q0-34 17.5-62.5T104-298q62-31 126-46.5T360-360q66 0 130 15.5T616-298q29 15 46.5 43.5T680-192v112H40Z" />
                        </svg>
                      </div>
                    </div>
                    <div className="infoCardJmlMhs w-full">
                      <p className="text-sm font-semibold text-red-600">
                        Menunggu Konfirmasi izin
                      </p>
                      <p className=" font-semibold">
                        {
                          dashboardData?.class_information
                            ?.permission_waiting_count
                        }{" "}
                        Mahasiswa
                      </p>
                    </div>
                  </div>
                </div>
                <Link
                  href={`./${getRolePath(profile.role)}/absensi`}
                  className="px-5 py-1 font-medium rounded-lg focus:ring-4 focus:outline-none transition-all ease-in-out duration-300 bg-primary1 text-white hover:bg-primary2 focus:ring-primary5"
                >
                  <p>Lihat</p>
                </Link>
              </div>

              <div className="box1 py-2 rounded-lg flex items-center justify-between bg-white gap-3 w-full p-2 pr-6">
                <div className="box-izin flex items-start justify-between gap-3 w-full ">
                  <div className="container flex gap-3 items-center w-full ">
                    <div className="icon w-12 h-12 rounded-md  flex items-center justify-center bg-[#F79132] ">
                      <div className="icon-detail  rounded-full w-8 h-8 flex items-center justify-center bg-white bg-opacity-20">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          height="20px"
                          viewBox="0 -960 960 960"
                          width="20px"
                          fill="white"
                        >
                          <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h168q14-36 44-58t68-22q38 0 68 22t44 58h168q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm280-670q13 0 21.5-8.5T510-820q0-13-8.5-21.5T480-850q-13 0-21.5 8.5T450-820q0 13 8.5 21.5T480-790Zm0 350q58 0 99-41t41-99q0-58-41-99t-99-41q-58 0-99 41t-41 99q0 58 41 99t99 41ZM200-200h560v-46q-54-53-125.5-83.5T480-360q-83 0-154.5 30.5T200-246v46Z" />
                        </svg>
                      </div>
                    </div>
                    <div className="infoCardJmlMhs  w-full">
                      <p className="text-sm font-semibold text-red-600">
                        Menunggu Penilaian
                      </p>
                      <p className=" font-semibold">
                        {
                          dashboardData?.class_information
                            ?.assignment_waiting_count
                        }{" "}
                        tugas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 2xl:gap-4 mt-2 lg:mt-3 2xl:mt-4">
        <div className="h-max border-2 border-gray-200 rounded-lg p-5 flex flex-col gap-4">
          {/* Title + Description */}
          <div>
            <strong className="text-lg lg:text-xl">Pertemuan Minggu ini</strong>
            <p className="text-neutral3">Lihat pertemuan minggu ini</p>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-md overflow-hidden">
              <thead className="text-sm text-neutral2 bg-gray-100">
                <tr className="text-center">
                  <th scope="col" className="px-3 py-3 text-start ">
                    Kelas
                  </th>

                  <th scope="col" className="px-3 py-3">
                    Ruang
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Pertemuan
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* pertemuan terdekat */}
                {currentData.map((pertemuanItem, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50 text-center"
                  >
                    <th
                      scope="row"
                      className="px-3 py-4 whitespace-nowrap w-max"
                    >
                      <div className="text-xs text-start font-normal">
                        <p className="font-normal">{pertemuanItem.classroom}</p>
                        <p className="text-xs">
                          {pertemuanItem.day},{" "}
                          {formatTimeRange(pertemuanItem.time)}
                        </p>
                      </div>
                    </th>

                    <td className="px-2 py-4">{pertemuanItem.room}</td>
                    <td className="px-6 py-4">{pertemuanItem.meet}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`./${getRolePath(profile.role)}/kelas/${
                          pertemuanItem.classroom_id
                        }/${pertemuanItem.id}`}
                      >
                        <button className="px-5 py-1 font-medium rounded-lg focus:ring-4 focus:outline-none transition-all ease-in-out duration-300 bg-primary1 text-white hover:bg-primary2 focus:ring-primary5">
                          <svg
                            className="focus:ring-4 focus:outline-none transition-all ease-in-out duration-300  hover:fill-[#B7B7B7] focus:ring-primary5"
                            xmlns="http://www.w3.org/2000/svg"
                            height="20px"
                            viewBox="0 -960 960 960"
                            width="20px"
                            fill="#e8eaed"
                          >
                            <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                          </svg>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}

                {/* control */}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
          />
        </div>
        <div className="h-max border-2 border-gray-200 rounded-lg p-4 flex flex-col gap-4">
          {/* Title + Description */}
          <div>
            <strong className="text-xl">List Penugasan Terdekat</strong>
            <p className="text-neutral3">Lihat penugasan terdekat</p>
          </div>
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-md overflow-hidden">
              <thead className="text-sm text-neutral2 bg-gray-100">
                <tr>
                  <th scope="col" className="px-3 py-3">
                    Kelas
                  </th>

                  <th scope="col" className="px-3 py-3">
                    Deadline
                  </th>
                  <th scope="col" className="px-3 py-3">
                    Terkumpul
                  </th>

                  <th scope="col" className="px-6 py-3">
                    Lihat
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentDataTask.map((taskItem, index) => (
                  <tr
                    key={index}
                    className="bg-white border-b hover:bg-gray-50"
                  >
                    <th scope="row" className="px-3 py-4 whitespace-nowrap">
                      <p className="font-normal">{taskItem.classroom}</p>
                      <p className="font-medium text-sm text-neutral2 max-w-40 truncate">
                        {taskItem.title}
                      </p>
                    </th>
                    <td className="px-3 py-4 max-w-40">
                      {formatDateTime(taskItem.deadline)}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <div className=" flex items-center justify-center gap-0.5 ">
                        <p className="text-center ">
                          {taskItem.student.total_submitted} /{" "}
                          {taskItem.student.student_need_to_submit}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-4 max-w-40">
                      <Link
                        // href={`/dashboard/asisten/kelas/${taskItem.id}/penilaian?idClassroom=${taskItem.classroom_id}&idAssignment=${taskItem.id}`}
                        // href={{
                        //   pathname: `/dashboard/asisten/kelas/${taskItem.id}/penilaian?idClassroom=${taskItem.classroom_id}&idAssignment=${taskItem.id}`, // atau halaman yang sesuai jika berbeda
                        //   query: {
                        //     deadlineTask: taskItem.deadline,
                        //   },
                        // }}
                        href={{
                          pathname: `/dashboard/${getRolePath(
                            profile.role
                          )}/kelas/${taskItem.id}/penilaian`,
                          query: {
                            idClassroom: taskItem.classroom_id,
                            idAssignment: taskItem.id,
                            deadlineTask: taskItem.deadline, // tambahkan deadline jika diperlukan
                          },
                        }}
                      >
                        <button className="px-5 py-1 font-medium rounded-lg focus:ring-4 focus:outline-none transition-all ease-in-out duration-300 bg-primary1 text-white hover:bg-primary2 focus:ring-primary5">
                          <svg
                            className="focus:ring-4 focus:outline-none transition-all ease-in-out duration-300  hover:fill-[#B7B7B7] focus:ring-primary5"
                            xmlns="http://www.w3.org/2000/svg"
                            height="20px"
                            viewBox="0 -960 960 960"
                            width="20px"
                            fill="#e8eaed"
                          >
                            <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                          </svg>
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            totalPages={totalPagesTask}
            currentPage={currentPageTask}
            setCurrentPage={setCurrentPageTask}
          />
        </div>
      </div>
    </>
  );
};

export default HomeDosenAsisten;
