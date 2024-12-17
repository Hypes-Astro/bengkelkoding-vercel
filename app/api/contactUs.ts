import { AxiosResponse } from "axios";
import { createPostRequestNoAuth } from "./request";

// Post Contact Us
export const postContactUs = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<AxiosResponse> =>
  createPostRequestNoAuth(`/api/v1/public/contact-us`, {
    name: name,
    email: email,
    subject: subject,
    message: message,
  });
