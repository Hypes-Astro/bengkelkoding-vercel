import axios, { AxiosResponse } from "axios";

import { createPostRequest, createRequest, deleteRequest } from "./request";

export const getDownloadAllFile = async (
  classroomId: string,
  assignmentId: string,
  user: string
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/${user}/classrooms/${classroomId}/assignments/${assignmentId}/tasks/download-zip`
  );

export const createAssigment = async (
  data: FormData,
  id: string,
  user: string
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/${user}/classrooms/${id}/assignments`, data);

export const getDetailAssignment = async (
  classroomId: string,
  assignmentId: string,
  user: string
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/${user}/classrooms/${classroomId}/assignments/${assignmentId}/detail`
  );

export const updateAssignment = async (
  data: FormData,
  classroomId: string,
  assignmentId: string,
  user: string
): Promise<AxiosResponse> =>
  createPostRequest(
    `/api/v1/${user}/classrooms/${classroomId}/assignments/${assignmentId}?_method=PUT`,
    data
  );

export const deleteAssignment = async (
  idClassroom: string,
  idAssigment: string,
  user: string
): Promise<AxiosResponse> =>
  deleteRequest(
    `/api/v1/${user}/classrooms/${idClassroom}/assignments/${idAssigment}`
  );

export const getSubmissionAdmin = async (
  idClassroom: number,
  idAssignment: number,
  search: string,
  page: number,
  limit: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/admin/classrooms/${idClassroom}/assignments/${idAssignment}/tasks?search=${search}&per_page=${limit}&page=${page}`
  );

export const postGradeAdmin = async (
  idClassroom: string,
  idAssignment: string,
  idTask: number,
  inpuScore: number
): Promise<AxiosResponse> =>
  createPostRequest(
    `/api/v1/admin/classrooms/${idClassroom}/assignments/${idAssignment}/tasks/${idTask}/grade`,
    {
      score: inpuScore,
    }
  );

// lecture

export const getAssigment = async (
  search: string,
  page: number,
  limit: number,
  id: string,
  user: string
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/${user}/classrooms/${id}/assignments?search=${search}&page=${page}&limit=${limit}`
  );

export const getSubmissionLecture = async (
  idClassroom: number,
  idAssignment: number,
  search: string,
  page: number,
  limit: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/lecture/classrooms/${idClassroom}/assignments/${idAssignment}/tasks?search=${search}&per_page=${limit}&page=${page}`
  );

export const postGradeLecture = async (
  idClassroom: string,
  idAssignment: string,
  idTask: number,
  inpuScore: number
): Promise<AxiosResponse> =>
  createPostRequest(
    `/api/v1/lecture/classrooms/${idClassroom}/assignments/${idAssignment}/tasks/${idTask}/grade`,
    {
      score: inpuScore,
    }
  );

export const postForceSubmitLecture = async (
  idClassroom: string,
  idAssignment: string,
  idStudent: string
): Promise<AxiosResponse> =>
  createPostRequest(
    `/api/v1/lecture/classrooms/${idClassroom}/assignments/${idAssignment}/tasks/force-submit/${idStudent}`
  );

// assistant

export const getAssigmentAssistant = async (
  search: string,
  page: number,
  limit: number,
  id: string
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/assistant/classrooms/${id}/assignments?search=${search}&page=${page}&limit=${limit}`
  );

export const getSubmissionAssistant = async (
  idClassroom: number,
  idAssignment: number,
  search: string,
  page: number,
  limit: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/assistant/classrooms/${idClassroom}/assignments/${idAssignment}/tasks?search=${search}&per_page=${limit}&page=${page}`
  );

export const postGradeAssistant = async (
  idClassroom: string,
  idAssignment: string,
  idTask: number,
  inpuScore: number
): Promise<AxiosResponse> =>
  createPostRequest(
    `/api/v1/assistant/classrooms/${idClassroom}/assignments/${idAssignment}/tasks/${idTask}/grade`,
    {
      score: inpuScore,
    }
  );

// try general
export const postForceSubmit = async (
  idClassroom: string,
  idAssignment: string,
  idStudent: string,
  user: string
): Promise<AxiosResponse> =>
  createPostRequest(
    `/api/v1/${user}/classrooms/${idClassroom}/assignments/${idAssignment}/tasks/force-submit/${idStudent}`
  );
