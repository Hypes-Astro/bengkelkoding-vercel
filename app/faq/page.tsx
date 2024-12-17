"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Header from "../component/general/Header";
import Footer from "../component/general/Footer";
import Modal from "../component/general/Modal";
import Input from "../component/general/Input";
import Button from "../component/general/Button";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import { postCreateQuestion } from "../api/student/faq";
import { getAllFaqs } from "../api/faq";

const FAQPage = () => {
  const role_user = Cookies.get("user_role");

  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // FAQ Open and Close
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const [faqs, setFaqs] = useState([
    {
      id: 0,
      question: "",
      answer: "",
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      // Response FAQs
      const responseFaqs = await getAllFaqs();
      setFaqs(responseFaqs.data);
    };
    fetchData();
  }, []);

  // Add FAQ
  const [FAQQuestion, setFAQQuestion] = useState("");
  const [isModalAddOpen, setIsModalAddOpen] = useState(false);
  const handleOpenModalAdd = () => {
    setIsModalAddOpen(true);
  };
  const handleCloseModalAdd = () => {
    setIsModalAddOpen(false);
  };

  const handleAdd = async () => {
    try {
      await postCreateQuestion(FAQQuestion);
      toast.success(`Berhasil mengirimkan pertanyaan ${FAQQuestion}`);
      handleCloseModalAdd();
    } catch (error) {
      console.error("Failed to delete classroom", error);
      toast.error(`Gagal mengirimkan pertanyaan: ${error.message}`);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      }
    }
  };

  return (
    <div className="bg-[#f7f9fa] z-50">
      <Header />

      <section
        id="FAQ"
        className="max-w-5xl min-h-screen mx-auto px-2 lg:px-4 py-4"
      >
        {/* Title */}
        <div className="w-full mx-auto pt-6 pb-5 lg:pt-10 lg:pb-10 flex justify-between items-center">
          <div>
            <h2 className="font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
              FAQ
            </h2>
            <p className="text-neutral2">Apa yang Anda pertanyakan?</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="flex items-center flex-col lg:flex-row gap-4 lg:gap-0">
              <div className="w-max mx-auto">
                <label className="sr-only">Search</label>
                <div className="relative ml-2">
                  <div className="absolute inset-y-0 left-0 rtl:inset-r-0 rtl:right-0 flex items-center ps-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 fill-primary3"
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
                    className="block w-[240px] lg:w-[300px] p-3 ps-10 rounded-lg text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm shadow-[rgba(7,_65,_210,_0.1)_0px_4px_10px]"
                    placeholder="Cari faq"
                  />
                </div>
              </div>
            </div>
            {/* Button buat pertanyaan */}
            {role_user === "student" && (
              <div
                onClick={handleOpenModalAdd}
                className="bg-primary1 fill-white block p-2 rounded-lg text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm shadow-[rgba(7,_65,_210,_0.1)_0px_4px_10px] cursor-pointer hover:bg-primary2 transition-all duration-150 ease-in-out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  className="w-6"
                >
                  <path d="M470-200h-10q-142 0-241-99t-99-241q0-142 99-241t241-99q71 0 132.5 26.5t108 73q46.5 46.5 73 108T800-540q0 134-75.5 249T534-111q-10 5-20 5.5t-18-4.5q-8-5-14-13t-7-19l-5-58Zm90-26q71-60 115.5-140.5T720-540q0-109-75.5-184.5T460-800q-109 0-184.5 75.5T200-540q0 109 75.5 184.5T460-280h100v54Zm-101-95q17 0 29-12t12-29q0-17-12-29t-29-12q-17 0-29 12t-12 29q0 17 12 29t29 12Zm-87-304q11 5 22 .5t18-14.5q9-12 21-18.5t27-6.5q24 0 39 13.5t15 34.5q0 13-7.5 26T480-558q-25 22-37 41.5T431-477q0 12 8.5 20.5T460-448q12 0 20-9t12-21q5-17 18-31t24-25q21-21 31.5-42t10.5-42q0-46-31.5-74T460-720q-32 0-59 15.5T357-662q-6 11-1.5 21.5T372-625Zm88 112Z" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="grid grid-cols-1 gap-2">
          {faqs.map((f, index) => (
            <button
              key={index}
              onClick={() => toggleFAQ(index)}
              className="h-max w-full text-left py-4 px-6 bg-white rounded-lg cursor-pointer focus:shadow-[rgba(7,_65,_210,_0.1)_0px_4px_10px] hover:shadow-[rgba(7,_65,_210,_0.1)_0px_4px_10px] transition-all ease-in-out duration-200"
            >
              {/* pertanyaan */}
              <div className="flex justify-between items-center gap-2">
                <strong className="font-semibold text-neutral1 text-sm md:text-base">
                  {f.question}
                </strong>
                <div className="w-8 h-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="30px"
                    viewBox="0 0 24 24"
                    width="30px"
                    className={`fill-neutral1 w-8 h-8 transform transition-transform duration-200 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  >
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M8.71 11.71l2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71z" />
                  </svg>
                </div>
              </div>
              {/* jawaban */}
              <div
                className={`overflow-hidden transition-max-height duration-300 ease-in-out ${
                  openIndex === index ? "max-h-screen" : "max-h-0"
                }`}
              >
                <p className="text-neutral2 pt-4 text-xs md:text-sm">
                  {f.answer}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Footer />

      {/* Modal Tanyakan Sesuatu */}
      <Modal
        title="Tanyakan Sesuatu"
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
          <Button text="Tanyakan" className="w-full" onClick={handleAdd} />
        </div>
      </Modal>
      <ToastContainer />
    </div>
  );
};

export default FAQPage;
