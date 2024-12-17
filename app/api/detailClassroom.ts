import axios, { AxiosResponse } from "axios";

import { createRequest } from "./request";

export const getDetailClassroom = async (
  id: string,
  user: string
): Promise<AxiosResponse> =>
  createRequest(`/api/v1/${user}/classrooms/${id}/detail`);

// find detail for edit - Only superadmin and admin.
export const findDetailClassroom = async (
  id: string,
  user: string
): Promise<AxiosResponse> => createRequest(`/api/v1/${user}/classrooms/${id}`);
