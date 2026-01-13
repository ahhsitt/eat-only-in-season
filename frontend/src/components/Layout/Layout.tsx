// components/Layout/Layout.tsx - Base layout component using Ant Design
// 005-page-ui-redesign: 活泼年轻风沉浸式布局

import type { ReactNode, CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Typography } from 'antd';
import { HomeOutlined, SettingOutlined } from '@ant-design/icons';
import { colors } from '../../theme';

const { Header, Content, Footer } = AntLayout;
const { Title, Text } = Typography;

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

// 导航项悬停动画样式
const navLinkStyle: CSSProperties = {
  transition: 'color 0.2s ease, transform 0.2s ease',
};

export function Layout({ children, showHeader = true, showFooter = true }: LayoutProps) {
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <Link to="/" style={navLinkStyle}>首页</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings" style={navLinkStyle}>偏好设置</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh', background: colors.neutral[50] }}>
      {showHeader && (
        <Header
          style={{
            background: '#FFFFFF',
            boxShadow: `0 2px 8px rgba(255, 107, 107, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)`,
            padding: '0 24px',
            height: 'auto',
            lineHeight: 'normal',
            position: 'sticky',
            top: 0,
            zIndex: 100,
          }}
        >
          <div
            style={{
              maxWidth: 1152,
              margin: '0 auto',
              padding: '16px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                transition: 'transform 0.2s ease',
              }}
              className="hover-lift"
            >
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: colors.primary[500],
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                  background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.secondary[400]} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                🍳 不时不食
              </Title>
              <Text
                style={{
                  color: colors.neutral[500],
                  display: 'block',
                  marginTop: 4,
                  fontSize: 13,
                }}
              >
                发现应季美味，享受健康生活 ✨
              </Text>
            </Link>
            <Menu
              mode="horizontal"
              selectedKeys={[location.pathname]}
              items={menuItems}
              style={{
                border: 'none',
                background: 'transparent',
                minWidth: 200,
                justifyContent: 'flex-end',
              }}
            />
          </div>
        </Header>
      )}

      <Content style={{ flex: 1 }}>
        {children}
      </Content>

      {showFooter && (
        <Footer
          style={{
            textAlign: 'center',
            background: `linear-gradient(180deg, transparent 0%, ${colors.primary[50]} 100%)`,
            color: colors.neutral[500],
            fontSize: 14,
            padding: '32px 24px',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <span style={{ color: colors.primary[400], fontWeight: 500 }}>
              🍳 不时不食
            </span>
            <span style={{ margin: '0 8px', color: colors.neutral[300] }}>|</span>
            <span>应季食谱推荐 AI Agent</span>
          </div>
          <Text style={{ fontSize: 12, color: colors.neutral[400] }}>
            吃得健康，活得精彩 💪
          </Text>
        </Footer>
      )}
    </AntLayout>
  );
}

export default Layout;
