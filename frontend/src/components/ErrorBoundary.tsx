import { Component, type ReactNode } from 'react';
import { Result, Button } from 'antd';
import { FrownOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FAF7F4',
          }}
        >
          <Result
            icon={<FrownOutlined style={{ color: '#C45C5C' }} />}
            title="出错了"
            subTitle="很抱歉，页面出现了问题。请尝试刷新页面。"
            extra={
              <Button type="primary" onClick={this.handleRetry}>
                重试
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}
