import axios, { AxiosResponse } from "axios";
import { EditFormClassroom } from "@/app/interface/Kelas";
import { ClassFormData } from "@/app/interface/Kelas";

import {
  createPostRequest,
  createPutRequest,
  createRequest,
  deleteRequest,
} from "./request";

// Get List Kelas
export const getAllClassroom = async (
  search: string,
  page: number,
  limit: number,
  user: string
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/${user}/classrooms?search=${search}&page=${page}&limit=${limit}`
  );

// Create Kelas
export const createClassroom = async (
  data: ClassFormData
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/admin/classrooms/store`, data);

// Update Classoom
export const updateClassroom = async (
  data: EditFormClassroom,
  idClassroom: number
): Promise<AxiosResponse> =>
  createPutRequest(`/api/v1/admin/classrooms/${idClassroom}/update`, data);

// Select Lecture
export const getSelectLecture = async (): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/dropdown/lectures`);

// Select Assistant
export const getSelectAssistant = async (
  idClassroom: number
): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/classrooms/${idClassroom}/assistants`);

// Select Path
export const getSelectPaths = async (): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/dropdown/paths`);

// Select Periods
export const getSelectPeriods = async (): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/dropdown/periods`);

// Post Assistant
export const postAssistant = async (
  classroomId: number,
  assistantId: string
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/admin/classrooms/${classroomId}/assistants`, {
    assistant_id: assistantId.toString(),
  });

// Konfirmasi nilai
export const postFinalScore = async (
  classroomId: number,
  studentId: number,
  user: string,
  access_token: string
): Promise<AxiosResponse> =>
  createPutRequest(
    `/api/v1/${user}/classrooms/${classroomId}/students/${studentId}/save-score`,
    {},
    access_token
  );

// Cancel Konfirmasi nilai
export const deleteFinalScore = async (
  classroomId: number,
  studentId: number,
  user: string
): Promise<AxiosResponse> =>
  deleteRequest(
    `/api/v1/${user}/classrooms/${classroomId}/students/${studentId}/clear-score`
  );

// Delete Assistant
export const deleteAssistant = async (
  classroomId: number,
  assistantId: string
): Promise<AxiosResponse> =>
  deleteRequest(
    `/api/v1/admin/classrooms/${classroomId}/assistants/${assistantId}`
  );

// destroy classroom (Only Superadmin)
export const deleteClassroom = async (
  idClass: number
): Promise<AxiosResponse> =>
  deleteRequest(`/api/v1/superadmin/classrooms/${idClass}/destroy`);
