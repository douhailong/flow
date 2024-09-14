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
          'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsInJvbGUiOlt7ImF1dGhvcml0eSI6IlJPTEVfMSJ9XSwiZXhwIjoxNzI2NTUxOTM5LCJpYXQiOjE3MjU5NDcxMzksInRlbmFudCI6ImNmc24yIiwianRpIjoiMjYifQ.rkDVzFxdnASFDWHSdIiZFhIn7_-z0eueKVntec94NpexZxYxgVVCBgrRqlfzDnheHc4VhFAixoSV0wLSvB0TOA'
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
