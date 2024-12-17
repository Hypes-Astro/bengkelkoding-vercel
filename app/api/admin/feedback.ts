import { AxiosResponse } from "axios";
import {
  createPostRequest,
  createPutRequest,
  createRequest,
  deleteRequest,
} from "../request";

// List Feedback
export const getAdminListFeedback = async (
  search: string,
  page: number,
  limit: number
): Promise<AxiosResponse> =>
  createRequest(
    `/api/v1/admin/feedbacks?search=${search}&page=${page}&limit=${limit}`
  );

// Course Detail Feedback
export const getAdminDetailFeedback = async (
  feedback_id: number
): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/feedbacks/${feedback_id}`);

// Create Feedback
export const postAdminFeedback = async (
  course_id: number,
  student_id: number,
  rating: number,
  comment: string
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/admin/feedbacks`, {
    course_id: course_id,
    student_id: student_id,
    rating: rating,
    comment: comment,
  });

// Update Feedback
export const putAdminFeedback = async (
  feedback_id: number,
  course_id: number,
  student_id: number,
  rating: number,
  comment: string
): Promise<AxiosResponse> =>
  createPutRequest(`/api/v1/admin/feedbacks/${feedback_id}`, {
    course_id: course_id,
    student_id: student_id,
    rating: rating,
    comment: comment,
  });

// Delete Feedback
export const deleteAdminFeedback = async (
  feedback_id: number
): Promise<AxiosResponse> =>
  deleteRequest(`/api/v1/admin/feedbacks/${feedback_id}`);
