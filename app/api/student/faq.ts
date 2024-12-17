import { AxiosResponse } from "axios";
import { createPostRequest } from "../request";

// Post Create Question
export const postCreateQuestion = async (
  question: string
): Promise<AxiosResponse> =>
  createPostRequest(`/api/v1/student/faqs/create-question`, {
    question: question,
  });
