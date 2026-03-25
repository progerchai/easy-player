import React from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppContent from './AppContent';
import './styles/global.scss';

const App: React.FC = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#5980ff',
          borderRadius: 8,
        },
      }}
    >
      <AppContent />
    </ConfigProvider>
  );
};

export default App;
