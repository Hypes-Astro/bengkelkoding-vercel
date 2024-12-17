import { AxiosResponse } from "axios";
import {
  createPostRequest,
  createPutRequest,
  createRequest,
  deleteRequest,
} from "../request";

// List Answered FAQ
export const getAdminAnsweredFAQ = async (
  search: string,
  page: number,
  limit: number,
  status: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/admin/faqs?search=${search}&page=${page}&limit=${limit}&status=${status}`
  );

// List Not Answered FAQ
export const getAdminNotAnsweredFAQ = async (
  search: string,
  page: number,
  limit: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/admin/faqs?search=${search}&page=${page}&limit=${limit}&status=0`
  );

// Detail FAQ
export const getAdminDetailFAQ = async (
  faq_id: number
): Promise<AxiosResponse> => createRequest(`/api/v1/admin/faqs/${faq_id}`);

// Create FAQ
export const postAdminFAQ = async (
  question: string,
  answer: string,
  status: number
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/admin/faqs`, {
    question: question,
    answer: answer,
    status: status,
  });

// Update FAQ
export const putAdminFAQ = async (
  faq_id: number,
  question: string,
  answer: string,
  status: number
): Promise<AxiosResponse> =>
  createPutRequest(`/api/v1/admin/faqs/${faq_id}`, {
    question: question,
    answer: answer,
    status: status,
  });

// Delete FAQ
export const deleteAdminFAQ = async (faq_id: number): Promise<AxiosResponse> =>
  deleteRequest(`/api/v1/admin/faqs/${faq_id}`);
