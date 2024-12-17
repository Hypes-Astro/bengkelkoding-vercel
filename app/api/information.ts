import { AxiosResponse } from "axios";
import {
  createPostRequest,
  createPutRequest,
  createRequest,
  deleteRequest,
} from "@/app/api/request";

// Post Information

export const postInformation = async (
  idClassroom: number,
  titleInformation: string,
  descInformation: string,
  user: string
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/${user}/classrooms/${idClassroom}/informations`, {
    title: titleInformation,
    description: descInformation,
  });

// Delete Information
export const deleteInformation = async (
  idClassroom: number,
  idInfo: number,
  user: string
): Promise<AxiosResponse> =>
  deleteRequest(
    `/api/v1/${user}/classrooms/${idClassroom}/informations/${idInfo}`
  );

// Update Information
export const updateInformation = async (
  idClassroom: number,
  idInfo: number,
  titleInformation: string,
  descInformation: string,
  access_token: string,
  user: string
): Promise<AxiosResponse> =>
  createPutRequest(
    `/api/v1/${user}/classrooms/${idClassroom}/informations/${idInfo}`,
    {
      title: titleInformation,
      description: descInformation,
    },
    access_token
  );
