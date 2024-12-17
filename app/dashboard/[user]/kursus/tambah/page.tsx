"use client";
import React, { useState } from "react";
import Input from "@/app/component/general/Input";
import Button from "@/app/component/general/Button";
import MarkdownEditor from "@uiw/react-markdown-editor";
import { postAdminCourses } from "@/app/api/admin/course";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

const TambahKursusPage = () => {
  const [image, setImage] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [urlTrailer, setUrlTrailer] = useState("");
  const [description, setDescription] = useState("");
  const [briefDescription, setBriefDescription] = useState("");
  const [tools, setTools] = useState("");
  const [teachingMethod, setTeachingMethod] = useState("");
  const [level, setLevel] = useState("Pemula");
  const [category, setCategory] = useState("");
  const [isValidDomainImage, setIsValidDomainImage] = useState(true);
  const [errorLoadingImage, setErrorLoadingImage] = useState(false);
  const [isValidDomainBackground, setIsValidDomainBackground] = useState(true);
  const [errorLoadingBackground, setErrorLoadingBackground] = useState(false);

  const defaultImage = "/img/default-kursus/gambar-kosong.png";
  const errorImage = "/img/default-kursus/gambar-rusak.png";
  const urlNotValidImage = "/img/default-kursus/gambar-url-tidak-valid.png";

  // Allowed domains from environment variable
  const allowedDomains = process.env.NEXT_PUBLIC_IMAGE_DOMAINS.split(",");

  const validateDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return allowedDomains.includes(domain);
    } catch {
      return false;
    }
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setImage(url);
    setIsValidDomainImage(validateDomain(url));
    setErrorLoadingImage(false);
  };

  const handleBackgroundImageChange = (e) => {
    const url = e.target.value;
    setBackgroundImage(url);
    setIsValidDomainBackground(validateDomain(url));
    setErrorLoadingBackground(false);
  };

  const handlePostKursus = async (e) => {
    e.preventDefault();

    // Validation: check that both images are from allowed domains
    if (!isValidDomainImage || !isValidDomainBackground) {
      toast.error(
        "Invalid image URL or background URL. Please use allowed domains."
      );
      return;
    }

    try {
      await postAdminCourses(
        image,
        backgroundImage,
        title,
        author,
        urlTrailer,
        description,
        briefDescription,
        tools,
        teachingMethod,
        level,
        category
      );
      toast.success("Berhasil tambah kursus");
      window.location.href = "./";
    } catch (error) {
      toast.error(`Gagal tambah kursus: ${error.message}`);
    }
  };

  return (
    <>
      <form onSubmit={handlePostKursus} className="max-w-7xl">
        <div className="grid grid-cols-3 gap-x-4">
          <Input
            name="title"
            label="Title"
            type="text"
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            name="author"
            label="Author"
            type="text"
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <Input
            name="url-trailer"
            label="Trailer URL"
            type="text"
            onChange={(e) => setUrlTrailer(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-4 gap-x-4">
          <Input
            name="tools"
            label="Tools (comma-separated)"
            type="text"
            onChange={(e) => setTools(e.target.value)}
          />
          <div>
            <label htmlFor="level" className="block text-neutral2">
              Level
            </label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="bg-white px-3 py-2 border rounded-md w-full"
            >
              <option value="Pemula">Pemula</option>
              <option value="Menengah">Menengah</option>
              <option value="Mahir">Mahir</option>
            </select>
          </div>
          <Input
            name="category"
            label="Category"
            type="text"
            onChange={(e) => setCategory(e.target.value)}
          />
          <Input
            name="teaching-method"
            label="Teaching Method"
            type="text"
            onChange={(e) => setTeachingMethod(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-x-4 mb-4">
          <div>
            <Input
              name="image"
              label="Image URL"
              type="text"
              onChange={handleImageChange}
              required
            />
            <div className="border p-4 rounded-md">
              {image === "" ? (
                <Image
                  src={defaultImage}
                  alt="Default preview"
                  width={800}
                  height={500}
                />
              ) : !isValidDomainImage ? (
                <Image
                  src={urlNotValidImage}
                  alt="URL Not Valid"
                  width={800}
                  height={500}
                />
              ) : errorLoadingImage ? (
                <Image
                  src={errorImage}
                  alt="Error preview"
                  width={800}
                  height={500}
                />
              ) : (
                <Image
                  src={image}
                  alt="Preview"
                  width={800}
                  height={500}
                  onError={() => setErrorLoadingImage(true)}
                />
              )}
            </div>
          </div>

          <div>
            <Input
              name="background-image"
              label="Background Image URL"
              type="text"
              onChange={handleBackgroundImageChange}
              required
            />
            <div className="border p-4 rounded-md">
              {backgroundImage === "" ? (
                <Image
                  src={defaultImage}
                  alt="Default preview"
                  width={800}
                  height={500}
                />
              ) : !isValidDomainBackground ? (
                <Image
                  src={urlNotValidImage}
                  alt="URL Not Valid"
                  width={800}
                  height={500}
                />
              ) : errorLoadingBackground ? (
                <Image
                  src={errorImage}
                  alt="Error preview"
                  width={800}
                  height={500}
                />
              ) : (
                <Image
                  src={backgroundImage}
                  alt="Preview"
                  width={800}
                  height={500}
                  onError={() => setErrorLoadingBackground(true)}
                />
              )}
            </div>
          </div>
        </div>

        <label className="block mb-4">
          <span className="text-gray-700">Brief Description</span>
          <textarea
            onChange={(e) => {
              const value = e.target.value.slice(0, 255);
              setBriefDescription(value);
            }}
            maxLength={255}
            required
            className="block w-full px-3 py-2 border rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm border-neutral4"
          />
          <div className="text-sm text-gray-500 mt-1 text-end">
            {255 - briefDescription.length} characters remaining
          </div>
        </label>

        <div className="mb-4">
          <span className="text-gray-700">Description</span>
          <MarkdownEditor
            onChange={(content) => setDescription(content)}
            className="h-60 w-full mt-1"
          />
        </div>

        <div className="text-end">
          <Button text="Tambah Kursus" type="submit" />
        </div>
      </form>
      <ToastContainer />
    </>
  );
};

export default TambahKursusPage;
