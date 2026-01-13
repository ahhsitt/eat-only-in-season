// components/LoadingSpinner/LoadingSpinner.tsx - Loading state component using Ant Design

import { Spin, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: 'small' | 'default' | 'large';
}

export function LoadingSpinner({
  message = '加载中...',
  subMessage,
  size = 'default'
}: LoadingSpinnerProps) {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 48 : size === 'small' ? 24 : 36 }} spin />;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
      }}
    >
      <Spin indicator={antIcon} size={size} />
      <Text style={{ color: '#2D2D2D', marginTop: 16 }}>{message}</Text>
      {subMessage && (
        <Text type="secondary" style={{ fontSize: 14, marginTop: 8 }}>
          {subMessage}
        </Text>
      )}
    </div>
  );
}

export default LoadingSpinner;
