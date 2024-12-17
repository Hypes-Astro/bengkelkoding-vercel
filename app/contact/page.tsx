"use client";
import React, { useRef, useState } from "react";
import Header from "../component/general/Header";
import Footer from "../component/general/Footer";
import Input from "../component/general/Input";
import Button from "../component/general/Button";
import Image from "next/image";
import ReCAPTCHA from "react-google-recaptcha";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { postContactUs } from "../api/contactUs";

const ContactPage = () => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [email, setEmail] = useState("");

  // recaptcha
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isVerified, setIsVerified] = useState(false);
  async function handleCaptchaSubmission(token: string | null) {
    try {
      if (token) {
        setIsVerified(true);
      }
    } catch (e) {
      setIsVerified(false);
    }
  }
  const handleChange = (token: string | null) => {
    handleCaptchaSubmission(token);
  };
  function handleExpired() {
    setIsVerified(false);
  }

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isVerified) {
      try {
        await postContactUs(name, email, subject, message);
        toast.success("Berhasil kirim pesan");
      } catch (error: any) {
        toast.error(`Gagal kirim pesan: ${error.message}`);
      }
    }
  };

  return (
    <div className="z-50">
      <Header />

      <section
        id="Contact"
        className="max-w-5xl min-h-screen mx-auto px-2 lg:px-4 py-4"
      >
        <div className="w-full mx-auto pt-6 pb-10 lg:pt-10 lg:pb-20 text-center">
          <h2 className="font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
            Hubungi Kami
          </h2>
          <p className="text-neutral2">Bantuan & Dukungan</p>
        </div>
        <div className="lg:flex gap-10">
          <form
            onSubmit={handlePost}
            className="max-w-96 mx-auto lg:max-w-full lg:min-w-[50%]"
          >
            <Input
              label="Nama"
              type="text"
              name="name"
              placeholder="Nama Anda"
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="Email Anda"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Subject"
              type="text"
              name="subject"
              placeholder="Judul"
              onChange={(e) => setSubject(e.target.value)}
              required
            />
            <textarea
              name="message"
              rows={5}
              className="w-full px-3 py-2 border border-neutral4 rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm"
              placeholder="Pesan"
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>

            <ReCAPTCHA
              sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
              ref={recaptchaRef}
              onChange={handleChange}
              onExpired={handleExpired}
              className="mt-4"
            />

            {isVerified ? (
              <Button text="Kirim" className="mt-6 w-full" type="submit" />
            ) : (
              <Button
                text="Kirim"
                className="mt-6 w-full hover:bg-white"
                theme="tertiary"
                disabled
              />
            )}
          </form>
          <div className="h-max w-full overflow-hidden rounded-xl hidden lg:block">
            <Image
              src={"/img/h6-3.png"}
              alt="Contact Us"
              width={400}
              height={400}
              className="w-full"
            />
          </div>
        </div>
      </section>

      <Footer />
      <ToastContainer />
    </div>
  );
};

export default ContactPage;
