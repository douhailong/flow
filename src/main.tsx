import React from 'react';
import ReactDOM from 'react-dom/client';
import zhCN from 'antd/es/locale/zh_CN';
import { ConfigProvider } from 'antd';

import Flow from './flow-chart';

import './global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <Flow />
    </ConfigProvider>
  </React.StrictMode>
);
