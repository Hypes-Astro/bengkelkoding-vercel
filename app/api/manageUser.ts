import axios, { AxiosResponse } from "axios";
import {
  createPostRequest,
  createPutRequest,
  createRequest,
  deleteRequest,
} from "@/app/api/request";
import Cookies from "js-cookie";
import {
  DosenData,
  UpAsistenData,
  UpDosenData,
  UpStudentData,
} from "../interface/UserManagement";

const API_URL: string = process.env.NEXT_PUBLIC_API_URL_BENGKEL_KODING || "";

// Get + Find data User

// - Admin
export const getAllAdminData = async (): Promise<AxiosResponse> =>
  createRequest(`/api/v1/superadmin/admins`);

export const findAdminData = async (id: string): Promise<AxiosResponse> =>
  createRequest(`/api/v1/superadmin/admins/${id}`);

// - Lecture
export const getAllLectureData = async (
  search: string,
  page: number,
  limit: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/admin/lectures?search=${search}&page=${page}&limit=${limit}`
  );

export const findLectureData = async (id: string): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/lectures/${id}`);

// - Assistant
export const getAllAssistantData = async (
  search: string,
  page: number,
  limit: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/admin/assistants?search=${search}&page=${page}&limit=${limit}`
  );

export const findAssistantData = async (id: string): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/assistants/${id}`);

// - Student
export const getAllStudentData = async (
  search: string,
  page: number,
  limit: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/admin/students?search=${search}&page=${page}&limit=${limit}`
  );

export const findStudentData = async (id: string): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/students/${id}`);

// POST

export const createLecture = async (
  data: UpDosenData
): Promise<AxiosResponse> => createPostRequest(`/api/v1/admin/lectures`, data);

export const createAssitant = async (
  data: UpAsistenData
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/admin/assistants`, data);

export const createStudent = async (
  data: UpStudentData
): Promise<AxiosResponse> => createPostRequest(`/api/v1/admin/students`, data);

// Update

export const updateLecture = async (
  data: UpDosenData,
  idLecture: number
): Promise<AxiosResponse> =>
  createPutRequest(`/api/v1/admin/lectures/${idLecture}`, data);

export const updateAssistant = async (
  data: UpAsistenData,
  idAsisten: number
): Promise<AxiosResponse> =>
  createPutRequest(`/api/v1/admin/assistants/${idAsisten}`, data);

export const updateStudent = async (
  data: UpStudentData,
  idStudent: number
): Promise<AxiosResponse> =>
  createPutRequest(`/api/v1/admin/students/${idStudent}`, data);

// Delete

export const deleteLecture = async (
  idLecture: number
): Promise<AxiosResponse> =>
  deleteRequest(`/api/v1/admin/lectures/${idLecture}`);

export const deleteAssistant = async (
  idAsisten: number
): Promise<AxiosResponse> =>
  deleteRequest(`/api/v1/admin/assistants/${idAsisten}`);

export const deleteStudent = async (
  idStudent: number
): Promise<AxiosResponse> =>
  deleteRequest(`/api/v1/admin/students/${idStudent}`);
