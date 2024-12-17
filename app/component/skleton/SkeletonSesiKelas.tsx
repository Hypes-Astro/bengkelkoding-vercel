import React from "react";

export default function SkeletonSesiKelas() {
  return (
    <>
      <div className="flex flex-col w-full">
        <div className="flex flex-col lg:flex-row gap-4 justify-between w-full">
          {/* kiri */}
          <div className="up-left flex flex-col gap-2 lg:w-2/3">
            <div className="flex justify-between pb-4 mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-lg bg-gray-200 animate-pulse me-3"></div>
                <div>
                  <h5 className="leading-none h-8 w-48 bg-gray-200 animate-pulse mb-2"></h5>
                  <p className="h-4 w-32 bg-gray-200 animate-pulse"></p>
                </div>
              </div>
              <div>
                <span className="h-6 w-24 bg-gray-200 animate-pulse inline-flex items-center px-2.5 py-1 rounded-md"></span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-2">
              <dl className="bg-gray-200 animate-pulse rounded-lg flex flex-col items-center justify-center h-[78px]"></dl>
              <dl className="bg-gray-200 animate-pulse rounded-lg flex flex-col items-center justify-center h-[78px]"></dl>
              <dl className="bg-gray-200 animate-pulse rounded-lg flex flex-col items-center justify-center h-[78px]"></dl>
            </div>
            <button className="w-1/4 mt-5 h-12 bg-gray-200 animate-pulse rounded-lg"></button>
          </div>
          {/* kanan */}
          <div className="up-right lg:w-1/3">
            <div className="canvas-qr">
              <div className="flex items-center justify-center border-2 border-gray-200 border-dashed h-[40vh] rounded-lg dark:border-gray-700">
                <p className="h-12 w-32 bg-gray-200 animate-pulse"></p>
              </div>
            </div>
          </div>
        </div>

        <div className="list-mhs flex flex-col">
          <div className="search-compo flex justify-between py-3">
            <div className="search-key">
              <div className="relative ml-2">
                <div className="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
                  <div className="w-5 h-5 bg-gray-200 animate-pulse"></div>
                </div>
                <input
                  type="text"
                  className="block w-[200px] lg:w-[300px] p-2 ps-10 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
                  placeholder="Cari classRoom"
                  disabled
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">
            <div className="left-belumabsen w-full lg:w-[70%]">
              <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 p-3 border-2 border-gray-200 border-dashed">
                <div className="text-center w-full flex justify-left">
                  <p className="h-4 w-3/12 bg-gray-200 animate-pulse mb-3"></p>
                </div>
                <table className="w-full text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
                  <thead className="text-sm text-neutral2 bg-gray-100">
                    <tr>
                      <th scope="col" className="p-4">
                        <div className="h-4 w-4 bg-gray-200 animate-pulse"></div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="w-4 p-4">
                          <div className="h-4 w-4 bg-gray-200 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-48 bg-gray-200 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* list izin */}
            <div className="right-izin w-full lg:w-[30%]">
              <div className="flex items-center justify-between flex-column md:flex-row flex-wrap space-y-4 md:space-y-0 p-3 border-2 border-gray-200 border-dashed">
                <div className="text-center w-full flex justify-left">
                  <p className="h-4 w-3/12 bg-gray-200 animate-pulse mb-3"></p>
                </div>
                <table className="text-sm text-left rtl:text-right text-neutral3 rounded-lg overflow-hidden">
                  <thead className="text-sm text-neutral2 bg-gray-100">
                    <tr>
                      <th scope="col" className="p-4">
                        <div className="h-4 w-4 bg-gray-200 animate-pulse"></div>
                      </th>
                      <th scope="col" className="px-6 py-3">
                        <div className="h-4 w-24 bg-gray-200 animate-pulse"></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <tr
                        key={index}
                        className="bg-white border-b hover:bg-gray-50"
                      >
                        <td className="w-4 p-4">
                          <div className="h-4 w-4 bg-gray-200 animate-pulse"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 w-48 bg-gray-200 animate-pulse"></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
