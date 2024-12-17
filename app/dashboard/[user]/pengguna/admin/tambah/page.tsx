"use client";

import {
  getDetailUserAdmin,
  postUserAdmin,
  putUserAdmin,
} from "@/app/api/superadmin/userAdmin";
import Button from "@/app/component/general/Button";
import Input from "@/app/component/general/Input";
import InputBasic from "@/app/component/general/InputBasic";
import { UpAdminData } from "@/app/interface/UserManagement";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DashboardEditPenggunaAdminPage = () => {
  const searchParams = useSearchParams();
  const idAdmin = searchParams.get("idAdmin");
  const StatusForm = searchParams.get("status");

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  const [formData, setFormData] = useState<UpAdminData>({
    id: undefined,
    identity_code: "",
    name: "",
    email: "",
    password: "",
    is_active: undefined,
  });

  const [formDataEdit, setFormDataEdit] = useState<UpAdminData>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (StatusForm) {
      setFormDataEdit((prevData) => {
        const updatedData = {
          ...prevData,
          [name]: value,
        };
        return updatedData;
      });

      if (name === "password" || name === "confirmPassword") {
        setPasswordMatch(
          name === "confirmPassword"
            ? value === formDataEdit.password
            : confirmPassword === value
        );
      }
    } else {
      // Mode Tambah Baru
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));

      if (name === "password") {
        setIsPasswordValid(value.length >= 8); // Cek panjang password
      }

      if (name === "password" || name === "confirmPassword") {
        setPasswordMatch(
          name === "confirmPassword"
            ? value === formData.password
            : confirmPassword === value
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Cek apakah password valid
    if (!isPasswordValid) {
      toast.error("Password harus minimal 8 karakter");
      return;
    }

    // Cek apakah password dan konfirmasi password cocok
    if (!passwordMatch) {
      toast.error("Konfirmasi password tidak sesuai");
      return;
    }
    let response;

    if (StatusForm) {
      // Logika untuk mode edit
      const { name, identity_code, email, password, is_active } = formDataEdit;
      if (name && identity_code && email) {
        try {
          // Panggil API untuk menambahkan admin baru
          await putUserAdmin(
            idAdmin,
            identity_code,
            name,
            email,
            password,
            is_active
          );
          toast.success("Berhasil mengedit admin!");
          window.location.href = "./";
        } catch (error) {
          toast.error(`Gagal mengedit admin: ${error.message}`);
        }
      } else {
        toast.error("Form belum lengkap");
      }
    } else {
      // Logika untuk mode tambah baru
      const { name, identity_code, email, password } = formData;
      if (name && identity_code && email && password) {
        try {
          // Panggil API untuk menambahkan admin baru
          await postUserAdmin(identity_code, name, email, password);
          toast.success("Berhasil menambahkan admin!");
          window.location.href = "./";
        } catch (error) {
          toast.error(`Gagal menambahkan admin: ${error.message}`);
        }
      } else {
        toast.error("Form belum lengkap");
      }
    }
  };

  useEffect(() => {
    if (StatusForm && idAdmin) {
      getDetailUserAdmin(idAdmin)
        .then((response) => {
          // Pastikan ini sesuai dengan perubahan tipe response
          if (response) {
            const adminData = response.data; // ambil dari array

            setFormDataEdit({
              id: adminData.id,
              name: adminData.name,
              identity_code: adminData.identity_code,
              email: adminData.email,
              password: adminData.password,
              is_active: adminData.is_active,
            });
          } else {
            toast.error("Data admin tidak ditemukan");
          }
        })
        .catch((error) => {
          console.error("Error fetching admin details:", error);

          // Jika error berasal dari server, tampilkan pesan error dari response
          if (error.response) {
            console.error("Error response data:", error.response.data);
            console.error("Error status:", error.response.status);
            toast.error(
              `Gagal memuat detail admin: ${
                error.response.data.message || "Unknown error"
              }`
            );
          } else if (error.request) {
            // Jika request dibuat tetapi tidak ada respons
            console.error("Error request:", error.request);
            toast.error(
              "Gagal memuat detail admin: Tidak ada respons dari server."
            );
          } else {
            // Kesalahan lain yang mungkin terjadi
            console.error("Error message:", error.message);
            toast.error(`Gagal memuat detail admin: ${error.message}`);
          }
        });
    }
  }, [StatusForm, idAdmin]);

  return (
    <>
      <form className="max-w-5xl flex flex-col gap-4" onSubmit={handleSubmit}>
        <div>
          {StatusForm == "edit" ? (
            <p className="font-semibold text-neutral2 text-base">Ubah Data</p>
          ) : (
            <p className="font-semibold text-neutral2 text-base">Tambah Data</p>
          )}

          <p className="text-neutral3 text-sm">
            Indentitas pengguna role admin
          </p>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <Input
              type="text"
              label="Nama"
              name="name"
              value={StatusForm ? formDataEdit?.name || "" : formData.name}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              label="Kode Identitas"
              name="identity_code"
              value={
                StatusForm
                  ? formDataEdit?.identity_code || ""
                  : formData.identity_code
              }
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              label="Email"
              name="email"
              value={StatusForm ? formDataEdit?.email || "" : formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <p className="font-semibold text-neutral2 text-base">Autentikasi</p>
          <p className="text-neutral3 text-sm">Password untuk pengguna</p>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <Input
              type="password"
              label="Password"
              name="password"
              value={StatusForm ? formDataEdit?.password : formData.password}
              onChange={handleChange}
              required
            />

            <Input
              type="password"
              label="Konfirmasi Password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordMatch(
                  StatusForm
                    ? e.target.value === formDataEdit?.password
                    : e.target.value === formData.password
                );
              }}
              required
            />
            {!isPasswordValid && (
              <p className="text-red-600 text-sm">
                Minimal password 8 karakter
              </p>
            )}
            {/* Pesan validasi di bawah konfirmasi password */}
            {confirmPassword && (
              <p
                className={`text-sm mt-1 ${
                  passwordMatch ? "text-green-600" : "text-red-600"
                }`}
              >
                {passwordMatch
                  ? "Password sesuai"
                  : "Konfirmasi password tidak sesuai"}
              </p>
            )}
          </div>
        </div>

        <div>
          <p className="font-semibold text-neutral2 text-base">Status</p>
          <p className="text-neutral3 text-sm">Setup akun aktif atau tidak</p>
          <div className="mt-2 flex gap-4">
            <div className="flex gap-2">
              <input
                type="radio"
                id="aktif"
                name="is_active"
                value="true"
                checked={
                  StatusForm
                    ? formDataEdit?.is_active === true
                    : formData.is_active === true
                }
                onChange={() => {
                  if (StatusForm) {
                    setFormDataEdit((prevData) => ({
                      ...prevData,
                      is_active: true,
                    }));
                  } else {
                    setFormData((prevData) => ({
                      ...prevData,
                      is_active: true,
                    }));
                  }
                }}
              />
              <label htmlFor="aktif">Aktif</label>
            </div>
            <div className="flex gap-2">
              <input
                type="radio"
                id="tidak-aktif"
                name="is_active"
                value="false"
                checked={
                  StatusForm
                    ? formDataEdit?.is_active === false
                    : formData.is_active === false
                }
                onChange={() => {
                  if (StatusForm) {
                    setFormDataEdit((prevData) => ({
                      ...prevData,
                      is_active: false,
                    }));
                  } else {
                    setFormData((prevData) => ({
                      ...prevData,
                      is_active: false,
                    }));
                  }
                }}
              />
              <label htmlFor="tidak-aktif">Tidak Aktif</label>
            </div>
          </div>
        </div>

        <div className="text-end">
          <Button
            type="submit"
            text={StatusForm ? "Edit Admin" : "Tambah Admin"}
          />
        </div>
      </form>
      <ToastContainer />
    </>
  );
};

export default DashboardEditPenggunaAdminPage;
