// pages/Settings/Settings.tsx - Settings page for user preferences (Ant Design)

import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Typography, Card, Input, Button, Space, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Layout } from '../../components/Layout/Layout';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const MAX_PREFERENCE_LENGTH = 200;

export function Settings() {
  const { preference, updatePreferenceText, clearPreferences } = useLocalStorage();
  const [text, setText] = useState(preference.preferenceText || '');

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_PREFERENCE_LENGTH) {
      setText(value);
    }
  }, []);

  const handleSave = useCallback(() => {
    updatePreferenceText(text);
    message.success('设置已保存');
  }, [text, updatePreferenceText]);

  const handleClear = useCallback(() => {
    clearPreferences();
    setText('');
    message.info('已清除所有设置');
  }, [clearPreferences]);

  return (
    <Layout showHeader={false} showFooter={true}>
      {/* Custom Header */}
      <div
        style={{
          background: '#FFFFFF',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          padding: '16px 24px',
        }}
      >
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Link to="/">
            <Button type="text" icon={<ArrowLeftOutlined />} style={{ marginBottom: 12 }}>
              返回首页
            </Button>
          </Link>
          <Title level={3} style={{ margin: 0 }}>偏好设置</Title>
          <Text type="secondary">设置您的口味偏好，获得更个性化的菜谱推荐</Text>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <Card style={{ marginBottom: 24 }}>
          {/* Preference text input */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5}>口味偏好描述</Title>
            <Paragraph type="secondary" style={{ marginBottom: 8 }}>
              用自然语言描述您的口味偏好、饮食限制或喜好，例如：
            </Paragraph>
            <ul style={{ color: '#999', paddingLeft: 20, marginBottom: 16 }}>
              <li>"我喜欢清淡口味，不吃辣"</li>
              <li>"素食主义者，对花生过敏"</li>
              <li>"偏爱川菜，喜欢麻辣口味"</li>
              <li>"想要减肥，需要低热量食谱"</li>
            </ul>
            <TextArea
              value={text}
              onChange={handleTextChange}
              placeholder="请输入您的口味偏好..."
              rows={4}
              showCount
              maxLength={MAX_PREFERENCE_LENGTH}
              style={{ marginBottom: 16 }}
            />
          </div>

          {/* Buttons */}
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={handleSave}
            >
              保存设置
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={handleClear}
            >
              清除所有
            </Button>
          </Space>
        </Card>

        {/* Info card */}
        <Card
          style={{
            backgroundColor: '#F5F0EB',
            borderColor: '#E5E0DB',
            marginBottom: 24,
          }}
        >
          <Title level={5} style={{ marginBottom: 12 }}>关于偏好设置</Title>
          <ul style={{ color: '#666', paddingLeft: 20, margin: 0 }}>
            <li>您的偏好设置会保存在本地浏览器中</li>
            <li>偏好信息会发送给 AI 以生成个性化推荐</li>
            <li>清除偏好后，AI 会给出通用推荐</li>
            <li>您可以随时修改或清除您的偏好</li>
          </ul>
        </Card>

        {/* Current saved city */}
        {preference.cityName && (
          <Card
            style={{
              backgroundColor: '#E8EDE4',
              borderColor: '#D8E3D4',
            }}
          >
            <Space direction="vertical" size={4}>
              <Space>
                <EnvironmentOutlined style={{ color: '#6B7A5D' }} />
                <Text strong style={{ color: '#2D2D2D' }}>当前保存的城市</Text>
              </Space>
              <Text style={{ color: '#6B7A5D', fontSize: 16 }}>
                {preference.cityName}
              </Text>
              <Text type="secondary" style={{ fontSize: 13 }}>
                上次更新: {new Date(preference.updatedAt).toLocaleString('zh-CN')}
              </Text>
            </Space>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default Settings;
