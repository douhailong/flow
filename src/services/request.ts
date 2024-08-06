import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

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

    return {
      ...config,
      headers: {
        ...config?.headers,
        Authorization:
          'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1ZCI6IndlYiIsInJvbGUiOlt7ImF1dGhvcml0eSI6IlJPTEVfMSJ9XSwiZXhwIjoxNzIzNTMzNjQzLCJpYXQiOjE3MjI5Mjg4NDMsInRlbmFudCI6ImNmc24yIiwianRpIjoiMjYifQ.LQpfppv7RWLEUONQYkmAJnOWER1W5w_GEnkvdHMTS3nnQhbsgxX0ilUD1LTO1ORj29__I08ge_szeS3qWbXROg'
      }
    };
  },
  (err) => {
    return Promise.reject(err);
  }
);

instance.interceptors.response.use(
  (response: AxiosResponse<any, any>) => {
    return new Promise((resolve, reject) => {
      response?.data?.code === 200 ? resolve(response) : reject(response);
    });
  },
  (err) => {
    return Promise.reject(err);
  }
);

export default instance.request;
