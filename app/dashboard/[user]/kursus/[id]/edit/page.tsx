"use client";
import React, { useEffect, useState } from "react";
import Input from "@/app/component/general/Input";
import Button from "@/app/component/general/Button";
import MarkdownEditor from "@uiw/react-markdown-editor";
import { getAdminCourse, putAdminCourses } from "@/app/api/admin/course";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { usePathname } from "next/navigation";
import Image from "next/image";

const EditKursusPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const url = usePathname();
  const segments = url.split("/"); // Split the URL by '/'
  const courseId = segments[segments.indexOf("kursus") + 1];

  const [course, setCourse] = useState({
    id: 0,
    title: "",
    image: "",
    background_image: "",
    author: "",
    url_trailer: "",
    description: "",
    brief_description: "",
    tools: "",
    teaching_method: "",
    level: "",
    category: "",
  });
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
    setCourse({ ...course, image: url });
    setIsValidDomainImage(validateDomain(url));
    setErrorLoadingImage(false);
  };

  const handleBackgroundImageChange = (e) => {
    const url = e.target.value;
    setCourse({ ...course, background_image: url });
    setIsValidDomainBackground(validateDomain(url));
    setErrorLoadingBackground(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Response courses
        const responseCourse = await getAdminCourse(courseId);
        setCourse(responseCourse.data);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to load data. Please try again.");
        setIsLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handlePutKursus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await putAdminCourses(
        courseId,
        course.image,
        course.background_image,
        course.title,
        course.author,
        course.url_trailer,
        course.description,
        course.brief_description,
        course.tools,
        course.teaching_method,
        course.level,
        course.category
      );
      toast.success("Successfully changed the course 😁");
      window.location.href = "./";
    } catch (error: any) {
      toast.error(`Failed to change the course 😔: ${error.message}`);
    }
  };

  return (
    <>
      <form onSubmit={handlePutKursus} className="max-w-7xl">
        <div className="grid grid-cols-3 gap-x-4">
          <Input
            label="Title"
            type="text"
            name="title"
            value={course.title}
            onChange={(e) => setCourse({ ...course, title: e.target.value })}
            required
          />
          <Input
            label="Author"
            type="text"
            name="author"
            value={course.author}
            onChange={(e) => setCourse({ ...course, author: e.target.value })}
            required
          />
          <Input
            label="Trailer URL"
            type="text"
            name="url_trailer"
            value={course.url_trailer}
            onChange={(e) =>
              setCourse({ ...course, url_trailer: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-4 gap-x-4">
          <Input
            label="Tools (comma-separated)"
            type="text"
            name="tools"
            value={course.tools}
            onChange={(e) => setCourse({ ...course, tools: e.target.value })}
          />
          <div className="mb-4">
            <label htmlFor="level" className="block text-neutral2">
              Level
            </label>
            <select
              name="level"
              id="level"
              className="mt-0.5 bg-white h-max block w-full px-3 py-2 border rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm border-neutral4"
              value={course.level}
              onChange={(e) => setCourse({ ...course, level: e.target.value })}
            >
              <option value="Pemula">Pemula</option>
              <option value="Menegah">Menegah</option>
              <option value="Mahir">Mahir</option>
            </select>
          </div>
          <Input
            label="Category"
            type="text"
            name="category"
            value={course.category}
            onChange={(e) => setCourse({ ...course, category: e.target.value })}
          />
          <Input
            label="Teaching Method"
            type="text"
            name="teaching_method"
            value={course.teaching_method}
            onChange={(e) =>
              setCourse({ ...course, teaching_method: e.target.value })
            }
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-x-4 mb-4">
          <div>
            <Input
              label="Image URL"
              type="text"
              name="image"
              value={course.image}
              onChange={handleImageChange}
              required
            />
            <div className="border p-4 rounded-md">
              {course.image === "" ? (
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
                  src={course.image}
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
              label="Background Image URL"
              type="text"
              name="background_image"
              value={course.background_image}
              onChange={handleBackgroundImageChange}
              required
            />
            <div className="border p-4 rounded-md">
              {course.background_image === "" ? (
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
                  src={course.background_image}
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
            value={course.brief_description}
            onChange={(e) => {
              const briefDescription = e.target.value.slice(0, 255);
              setCourse((course) => ({
                ...course,
                brief_description: briefDescription,
              }));
            }}
            maxLength={255}
            required
            className="block w-full px-3 py-2 border rounded-md text-neutral1 focus:outline-none focus:ring-4 focus:ring-primary5 focus:border-primary1 sm:text-sm border-neutral4"
          />
          <div className="text-sm text-gray-500 mt-1 text-end">
            {255 - (course?.brief_description?.length || 0)} characters
            remaining
          </div>
        </label>

        <div className="mb-4">
          <span className="text-gray-700">Description</span>
          <div className="h-60 w-full">
            <MarkdownEditor
              value={course.description}
              onChange={(value) =>
                setCourse((prev) => ({ ...prev, description: value }))
              }
              className="h-full mt-1"
            />
          </div>
        </div>

        <div className="text-end">
          <Button text="Edit Kursus" type="submit" />
        </div>
      </form>
      <ToastContainer />
    </>
  );
};

export default EditKursusPage;
