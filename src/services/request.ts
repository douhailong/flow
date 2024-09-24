import axios, { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { apiBaseUrl } from '@config';
import { message } from 'antd';

export const instance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000
});

instance.interceptors.request.use(
  (config) => {
    if (config?.headers?.Authorization) {
      return config;
    }

    const token = sessionStorage.getItem('token');

    return {
      ...config,
      headers: {
        ...config.headers,
        Authorization:
          token ||
          'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsInJvbGUiOlt7ImF1dGhvcml0eSI6IlJPTEVfMSJ9XSwiZXhwIjoxNzI3Nzc2Mjg1LCJpYXQiOjE3MjcxNzE0ODUsInRlbmFudCI6ImNmc24yIiwianRpIjoiMjYifQ.lzVou0kiD9sD1UBHOYFv_kEHrmChPRRhx66599XeXnWSnADg9GNq0DH98uQo3FkdW_-bPkQpRAy5hHs2imG5QQ'
      }
    } as InternalAxiosRequestConfig<any>;
  },
  (err) => {
    return Promise.reject(err);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse<any, any>) => {
    return new Promise((resolve, reject) => {
      response?.data?.resultCode === '20000' || response?.data?.errorMsg
        ? reject(response)
        : resolve(response);
    });
  },
  (err) => {
    return Promise.reject(err);
  }
);

export default instance.request;
