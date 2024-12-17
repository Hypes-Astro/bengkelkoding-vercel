import { AxiosResponse } from "axios";
import { createRequest } from "../../request";

// Dropdown Student List
export const getAdminDropdownStudents = async (
  search: string
): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/dropdown/students?search=${search}`);

// Dropdown Course List
export const getAdminDropdownCourses = async (): Promise<AxiosResponse> =>
  createRequest(`/api/v1/admin/dropdown/courses`);
