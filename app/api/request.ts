import Axios, { AxiosResponse, AxiosRequestConfig, ResponseType } from "axios";
import Cookies from "js-cookie";

const API_URL: string = process.env.NEXT_PUBLIC_API_URL_BENGKEL_KODING || "";

// Request
// Access Token + URL
export const createRequest = async (url: string): Promise<AxiosResponse> => {
  const access_token = Cookies.get("access_token");

  if (!access_token) {
    throw new Error("Access token not found");
  }
  try {
    const config = { headers: { Authorization: `Bearer ${access_token}` } };
    const response: AxiosResponse = await Axios.get(`${API_URL}${url}`, config);
    return response.data;
  } catch (error) {
    throw new Error(`API Request for ${url} failed`);
  }
};

export const createRequestDownload = async (
  url: string,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse> => {
  const access_token = Cookies.get("access_token");

  if (!access_token) {
    throw new Error("Access token not found");
  }

  try {
    const defaultConfig: AxiosRequestConfig = {
      headers: { Authorization: `Bearer ${access_token}` },
      responseType: "arraybuffer" as ResponseType, // Cast responseType ke ResponseType
      ...config,
    };

    const response: AxiosResponse = await Axios.get(
      `${API_URL}${url}`,
      defaultConfig
    );
    return response; // Jangan return `response.data` langsung
  } catch (error) {
    throw new Error(`API Request for ${url} failed`);
  }
};

// post request
export const createPostRequest = async (
  url: string,
  data?: Record<string, any> | FormData
): Promise<AxiosResponse> => {
  try {
    const access_token = Cookies.get("access_token");

    if (!access_token) {
      throw new Error("Access token not found");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${access_token}`,
        ...(data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : {}),
      },
    };
    const response: AxiosResponse = await Axios.post(
      `${API_URL}${url}`,
      data,
      config
    );
    return response.data;
  } catch (error) {
    throw new Error(`API POST Request for ${url} failed: ${error.message}`);
  }
};

// Update - put
export const createPutRequest = async (
  url: string,
  data: any,
  access_token?: string
): Promise<AxiosResponse> => {
  try {
    const access_token = Cookies.get("access_token");
    const config = { headers: { Authorization: `Bearer ${access_token}` } };
    const response: AxiosResponse = await Axios.put(
      `${API_URL}${url}`,
      data,
      config
    );
    return response.data;
  } catch (error) {
    throw new Error(`API POST Request for ${url} failed: ${error.message}`);
  }
};

// Update - patch
export const createPatchRequest = async (
  url: string,
  data: any,
  access_token?: string
): Promise<AxiosResponse> => {
  try {
    const access_token = Cookies.get("access_token");
    const config = { headers: { Authorization: `Bearer ${access_token}` } };
    const response: AxiosResponse = await Axios.patch(
      `${API_URL}${url}`,
      data,
      config
    );
    return response.data;
  } catch (error) {
    throw new Error(`API POST Request for ${url} failed: ${error.message}`);
  }
};

// Delete
export const deleteRequest = async (url: string): Promise<AxiosResponse> => {
  try {
    const access_token = Cookies.get("access_token");
    const config = {
      headers: { Authorization: `Bearer ${access_token}` },
    };
    const response: AxiosResponse = await Axios.delete(
      `${API_URL}${url}`,
      config
    );
    return response.data;
  } catch (error) {
    throw new Error(`API POST Request for ${url} failed: ${error.message}`);
  }
};

// No Auth
export const createRequestNoAuth = async (
  url: string
): Promise<AxiosResponse> => {
  try {
    const response: AxiosResponse = await Axios.get(`${API_URL}${url}`);
    return response.data;
  } catch (error) {
    throw new Error(`API Request for ${url} failed`);
  }
};

// Post No Auth
export const createPostRequestNoAuth = async (
  url: string,
  data?: Record<string, any> | FormData
): Promise<AxiosResponse> => {
  try {
    const response: AxiosResponse = await Axios.post(`${API_URL}${url}`, data);
    return response.data;
  } catch (error) {
    throw new Error(`API Request for ${url} failed`);
  }
};
