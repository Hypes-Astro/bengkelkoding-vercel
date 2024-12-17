import axios, { AxiosResponse } from "axios";
import {
  createPostRequest,
  createPutRequest,
  createRequest,
  deleteRequest,
} from "@/app/api/request";
import Cookies from "js-cookie";
import { ImageSimple } from "../interface/Image";

const API_URL: string = process.env.NEXT_PUBLIC_API_URL_BENGKEL_KODING || "";

export const getAllImage = async (
  search: string,
  page: number,
  limit: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/admin/image-assets?search=${search}&page=${page}&limit=${limit}`
  );

export const findImageData = async (
  idImg: string
): Promise<AxiosResponse<ImageSimple>> =>
  createRequest(`/api/v1/admin/image-assets/${idImg}`);

// Add image post

export const addImage = async (data: FormData): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/admin/image-assets`, data);

// update

export const updateImage = async (
  data: FormData,
  imageId: string
): Promise<AxiosResponse> =>
  createPutRequest(`/api/v1/admin/image-assets/${imageId}?_method=PUT`, data);

// Delete
export const deleteImage = async (idImage: number): Promise<AxiosResponse> =>
  deleteRequest(`/api/v1/admin/image-assets/${idImage}`);
