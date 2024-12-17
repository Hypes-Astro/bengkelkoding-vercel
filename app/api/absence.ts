import { AxiosResponse } from "axios";
import { createPostRequest, createRequest } from "@/app/api/request";

// get all absence
export const getAllAbsence = async (
  search: string,
  page: number,
  limit: number,
  user: string
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/${user}/presences/absences?search=${search}&page=${page}&limit=${limit}`
  );

// post update status in absence termasuk didalam sesi pertemuan ada izin
export const postUpdateStatusAbsence = async (
  idClassroom: number,
  idAbsence: number,
  status: number,
  approve_note: string,
  user: string
): Promise<AxiosResponse> =>
  createPostRequest(
    `/api/v1/${user}/presences/${idClassroom}/absences/${idAbsence}`,
    { approve_status: status, approve_note: approve_note }
  );
