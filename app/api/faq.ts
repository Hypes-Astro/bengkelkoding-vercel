import { AxiosResponse } from "axios";
import { createRequestNoAuth } from "./request";

// FAQs
export const getAllFaqs = async (): Promise<AxiosResponse> =>
  createRequestNoAuth("/api/v1/public/faqs");
