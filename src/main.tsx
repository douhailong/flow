import React from 'react';
import ReactDOM from 'react-dom/client';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Flow from './flow-chart';

import './global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
      // cacheTime: 1000
    }
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <ConfigProvider locale={zhCN}>
    <QueryClientProvider client={queryClient}>
      <Flow />
    </QueryClientProvider>
  </ConfigProvider>
  // </React.StrictMode>
);
