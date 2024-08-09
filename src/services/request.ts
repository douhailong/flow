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
          'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsInJvbGUiOlt7ImF1dGhvcml0eSI6IlJPTEVfMSJ9XSwiZXhwIjoxNzIzNjE4OTQxLCJpYXQiOjE3MjMwMTQxNDEsInRlbmFudCI6ImNmc24yIiwianRpIjoiMjYifQ.omgXuSLe9NmFzVeHbcurV7G_iuYvjkt0kCuUFX4rR7JGv_meeZAG2ipmHPl8L1DKG44L0DroSdhdFd4p8miGww'
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
      !response?.data?.errorMsg ? resolve(response) : reject(response);
    });
  },
  (err) => {
    return Promise.reject(err);
  }
);

export default instance.request;
