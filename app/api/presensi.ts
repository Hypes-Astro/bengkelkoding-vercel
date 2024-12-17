import axios, { AxiosResponse } from "axios";

import { Student } from "@/app/interface/DetailSesi";
import {
  createPostRequest,
  createPutRequest,
  createRequest,
  deleteRequest,
} from "./request";

// Detail

export const getDetailQrSession = async (
  id: number,
  user: string
): Promise<AxiosResponse> =>
  createRequest(`/api/v1/${user}/presences/${id}/detail`);

// Genearate Qr

export const getGenerateQr = async (
  id: string,
  user: string
): Promise<AxiosResponse> =>
  createRequest(`/api/v1/${user}/presences/${id}/generate-qr`);

// Post Manual

export const postManualPresence = async (
  id: number,
  student: Student,
  isAttend: boolean,
  user: string
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/${user}/presences/${id}/attendances/store`, {
    student_id: student.id,
    is_attend: isAttend,
  });

// Update week (Detail Kelas) presence

export const updatePresence = async (
  id: number,
  updatedPresence: string,
  user: string
): Promise<AxiosResponse> =>
  createPutRequest(`/api/v1/${user}/presences/${id}/update`, {
    presence_date: updatedPresence,
  });

export const addPresence = async (
  id: number,
  updatedPresence: string,
  user: string
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/${user}/presences/store`, {
    classroom_id: id,
    presence_date: updatedPresence,
  });

export const deletePresence = async (
  idPresence: string,
  user: string
): Promise<AxiosResponse> =>
  deleteRequest(`/api/v1/${user}/presences/${idPresence}/delete`);
