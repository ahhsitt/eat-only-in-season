// pages/NewHome/NewHome.tsx - 新版首页：城市 → 食材 → 菜谱流程 (Ant Design)
// 005-page-ui-redesign: 沉浸式首页搜索体验

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Card, Input, Button, Alert, Space, Row, Col, Empty, Divider } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, SearchOutlined, HeartOutlined } from '@ant-design/icons';
import { Layout } from '../../components/Layout/Layout';
import { CityInput } from '../../components/CityInput/CityInput';
import { IngredientList } from '../../components/IngredientList/IngredientList';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { getSeasonalIngredients } from '../../services/api';
import { colors } from '../../theme';
import type { Location, IngredientCategoryGroup, NewUserPreference } from '../../types';
import { PREFERENCES_STORAGE_KEY } from '../../types';

const { Title, Text } = Typography;

export function NewHome() {
  const navigate = useNavigate();

  // localStorage 偏好
  const [preference, setPreference] = useState<NewUserPreference>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error reading preferences:', e);
    }
    return { preferenceText: '', updatedAt: Date.now() };
  });

  // 状态管理
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [categories, setCategories] = useState<IngredientCategoryGroup[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [currentCity, setCurrentCity] = useState(preference.lastCity || '');

  // 保存偏好到 localStorage
  const savePreference = useCallback((updates: Partial<NewUserPreference>) => {
    setPreference(prev => {
      const updated = { ...prev, ...updates, updatedAt: Date.now() };
      try {
        localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving preferences:', e);
      }
      return updated;
    });
  }, []);

  // 搜索城市食材
  const handleCitySearch = useCallback(async (cityName: string) => {
    setIsLoading(true);
    setError(null);
    setCategories([]);
    setSelectedIngredients([]);
    setCurrentCity(cityName);

    try {
      const response = await getSeasonalIngredients(cityName);
      setLocation(response.location);
      setCategories(response.categories);
      savePreference({ lastCity: cityName });
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取应季食材失败');
    } finally {
      setIsLoading(false);
    }
  }, [savePreference]);

  // 跳转到菜谱列表
  const handleGetRecipes = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedIngredients.length > 0) {
      params.set('ingredients', selectedIngredients.join(','));
    }
    if (preference.preferenceText) {
      params.set('preference', preference.preferenceText);
    }
    if (currentCity) {
      params.set('location', currentCity);
    }
    navigate(`/recipes?${params.toString()}`);
  }, [selectedIngredients, preference.preferenceText, currentCity, navigate]);

  return (
    <Layout showHeader={true} showFooter={true}>
      {/* 沉浸式 HeroSection 欢迎区 */}
      {!location && !isLoading && (
        <section
          className="animate-fadeIn"
          style={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            background: `linear-gradient(180deg, ${colors.neutral[50]} 0%, ${colors.primary[50]} 50%, ${colors.secondary[50]} 100%)`,
          }}
        >
          {/* 品牌标语 */}
          <div className="animate-slideUp" style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title
              level={1}
              style={{
                fontSize: 'clamp(2rem, 6vw, 3.5rem)',
                fontWeight: 800,
                marginBottom: 16,
                background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.secondary[400]} 50%, ${colors.accent[400]} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              🍳 不时不食
            </Title>
            <Text
              style={{
                fontSize: 'clamp(1rem, 3vw, 1.25rem)',
                color: colors.neutral[600],
                display: 'block',
              }}
            >
              吃当季，最新鲜 ✨
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.neutral[500],
                display: 'block',
                marginTop: 8,
              }}
            >
              输入城市，发现应季美味，享受健康生活
            </Text>
          </div>

          {/* 搜索框 - 视觉中心 */}
          <div className="animate-slideUp stagger-2" style={{ width: '100%', maxWidth: 560 }}>
            <CityInput
              initialValue={preference.lastCity}
              onSearch={handleCitySearch}
              isLoading={isLoading}
              suggestions={[]}
            />
          </div>

          {/* 偏好设置卡片 */}
          <div className="animate-slideUp stagger-3" style={{ width: '100%', maxWidth: 560, marginTop: 24 }}>
            <Card
              size="small"
              className="hover-lift"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                borderColor: colors.primary[100],
                borderRadius: 16,
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={8}>
                <Space>
                  <HeartOutlined style={{ color: colors.primary[400] }} />
                  <Text strong style={{ color: colors.neutral[700] }}>
                    口味偏好（可选）
                  </Text>
                </Space>
                <Input
                  value={preference.preferenceText}
                  onChange={(e) => savePreference({ preferenceText: e.target.value })}
                  placeholder="如：不吃辣、清淡口味、素食..."
                  maxLength={500}
                  style={{
                    borderColor: colors.primary[200],
                    borderRadius: 12,
                  }}
                />
              </Space>
            </Card>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="animate-slideUp" style={{ width: '100%', maxWidth: 560, marginTop: 24 }}>
              <Alert
                message={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ borderRadius: 12 }}
              />
            </div>
          )}
        </section>
      )}

      {/* 加载状态 - 带动画 */}
      {isLoading && (
        <section
          className="animate-fadeIn"
          style={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(180deg, ${colors.neutral[50]} 0%, ${colors.primary[50]} 100%)`,
          }}
        >
          <LoadingSpinner
            message="正在获取应季食材..."
            subMessage="这可能需要30-60秒"
            size="large"
          />
        </section>
      )}

      {/* 搜索结果区域 - 带过渡动画 */}
      {!isLoading && location && categories.length > 0 && (
        <div
          className="animate-fadeIn"
          style={{
            maxWidth: 1152,
            margin: '0 auto',
            padding: '32px 24px',
          }}
        >
          {/* 位置信息徽章 - 珊瑚橙粉配色 */}
          <Row justify="center" style={{ marginBottom: 32 }}>
            <Col>
              <Card
                size="small"
                className="animate-slideDown hover-lift"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`,
                  borderColor: colors.primary[200],
                  borderRadius: 24,
                }}
                styles={{ body: { padding: '10px 24px' } }}
              >
                <Space split={<Divider type="vertical" style={{ borderColor: colors.primary[200] }} />}>
                  <Space>
                    <EnvironmentOutlined style={{ color: colors.primary[500] }} />
                    <Text style={{ color: colors.primary[600], fontWeight: 600 }}>
                      {location.matchedName}
                    </Text>
                  </Space>
                  <Space>
                    <CalendarOutlined style={{ color: colors.secondary[500]} } />
                    <Text style={{ color: colors.secondary[600] }}>
                      {location.season} · {location.month}月
                    </Text>
                  </Space>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* 返回搜索按钮 */}
          <Row justify="center" style={{ marginBottom: 24 }}>
            <Button
              type="text"
              onClick={() => {
                setLocation(null);
                setCategories([]);
              }}
              style={{ color: colors.neutral[500] }}
            >
              ← 重新搜索其他城市
            </Button>
          </Row>

          {/* 食材列表组件 */}
          <section style={{ marginBottom: 32 }}>
            <Title
              level={4}
              className="animate-slideUp"
              style={{ color: colors.neutral[800], marginBottom: 16 }}
            >
              🥬 当季应季食材
            </Title>
            <IngredientList
              categories={categories}
              selectedIngredients={selectedIngredients}
              onSelectionChange={setSelectedIngredients}
            />
          </section>

          {/* 获取菜谱按钮 - 活力风格 */}
          <div className="animate-slideUp stagger-4" style={{ textAlign: 'center', marginTop: 40 }}>
            <Button
              type="primary"
              size="large"
              onClick={handleGetRecipes}
              icon={<SearchOutlined />}
              className="click-scale"
              style={{
                height: 56,
                paddingLeft: 40,
                paddingRight: 40,
                borderRadius: 28,
                fontSize: 18,
                fontWeight: 600,
                background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.secondary[400]} 100%)`,
                border: 'none',
                boxShadow: `0 8px 24px ${colors.primary[300]}40`,
              }}
            >
              {selectedIngredients.length > 0
                ? `🍴 根据 ${selectedIngredients.length} 种食材获取菜谱`
                : '🎲 获取随机菜谱推荐'
              }
            </Button>
            {selectedIngredients.length === 0 && (
              <div style={{ marginTop: 12 }}>
                <Text style={{ color: colors.neutral[500] }}>
                  未选择食材，将为您随机推荐应季菜谱 ✨
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 空状态 - 仅在有错误且无位置时显示 */}
      {!isLoading && error && !location && (
        <section
          style={{
            minHeight: 'calc(100vh - 300px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
          }}
        >
          <Empty
            image={<span style={{ fontSize: 72 }}>🌍</span>}
            imageStyle={{ height: 100 }}
            description={
              <Text style={{ color: colors.neutral[500] }}>
                输入城市名称，探索当季应季食材
              </Text>
            }
          />
        </section>
      )}
    </Layout>
  );
}

export default NewHome;
