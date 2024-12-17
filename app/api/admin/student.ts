import { AxiosResponse } from "axios";
import { createPostRequest } from "../request";

// Post Import Student
export const postImportStudent = async (
  student_data: File
): Promise<AxiosResponse> => {
  const formData = new FormData();
  formData.append("student_data", student_data);

  return await createPostRequest(`/api/v1/admin/students/import`, formData);
};
