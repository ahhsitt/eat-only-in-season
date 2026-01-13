// pages/RecipeListPage/RecipeListPage.tsx - 菜谱列表页 (Ant Design)
// 005-page-ui-redesign: 沉浸式菜谱列表浏览

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Typography, Card, Tag, Space, Alert, Button, Empty } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, FireOutlined } from '@ant-design/icons';
import { Layout } from '../../components/Layout/Layout';
import { RecipeList } from '../../components/RecipeList/RecipeList';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { getRecipesByIngredients } from '../../services/api';
import { colors } from '../../theme';
import type { RecipeWithMatch } from '../../types';

const { Title, Text } = Typography;

export function RecipeListPage() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeWithMatch[]>([]);

  // 从 URL 获取参数
  const ingredients = searchParams.get('ingredients')?.split(',').filter(Boolean) || [];
  const preference = searchParams.get('preference') || '';
  const location = searchParams.get('location') || '';

  const fetchRecipes = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await getRecipesByIngredients({
        ingredients,
        preference: preference || undefined,
        location: location || undefined,
      });
      setRecipes(response.recipes);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取菜谱推荐失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout showHeader={false} showFooter={true}>
      {/* Custom Header - 活力风格 */}
      <div
        className="animate-slideDown"
        style={{
          background: `linear-gradient(135deg, #FFFFFF 0%, ${colors.primary[50]} 100%)`,
          boxShadow: `0 2px 12px ${colors.primary[200]}30`,
          padding: '16px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1152,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Link to="/">
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              className="click-scale"
              style={{ color: colors.neutral[600] }}
            >
              返回首页
            </Button>
          </Link>
          <Title
            level={4}
            style={{
              margin: 0,
              background: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.secondary[500]} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            🍴 菜谱推荐
          </Title>
        </div>
      </div>

      {/* Main content - 沉浸式布局 */}
      <div
        style={{
          maxWidth: 1152,
          margin: '0 auto',
          padding: '32px 24px',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        {/* 选中的食材信息 - 活力卡片 */}
        {ingredients.length > 0 && (
          <Card
            size="small"
            className="animate-slideUp"
            style={{
              marginBottom: 32,
              background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`,
              borderColor: colors.primary[200],
              borderRadius: 16,
            }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <Space>
                <FireOutlined style={{ color: colors.primary[500] }} />
                <Text style={{ color: colors.neutral[600] }}>
                  根据以下食材为您推荐：
                </Text>
              </Space>
              <Space wrap size={[8, 8]}>
                {ingredients.map((ing, index) => (
                  <Tag
                    key={ing}
                    className="animate-bounceIn"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      backgroundColor: colors.primary[100],
                      color: colors.primary[600],
                      borderColor: colors.primary[300],
                      borderRadius: 16,
                      padding: '4px 14px',
                      fontSize: 14,
                    }}
                  >
                    {ing}
                  </Tag>
                ))}
              </Space>
              {preference && (
                <Text style={{ color: colors.neutral[500], fontSize: 13 }}>
                  💡 偏好：{preference}
                </Text>
              )}
            </Space>
          </Card>
        )}

        {/* 错误提示 */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="animate-slideUp"
            style={{ marginBottom: 24, borderRadius: 12 }}
            action={
              <Button
                size="small"
                type="link"
                icon={<ReloadOutlined />}
                onClick={fetchRecipes}
                style={{ color: colors.primary[500] }}
              >
                重试
              </Button>
            }
          />
        )}

        {/* 加载中 - 居中显示 */}
        {isLoading && (
          <div
            className="animate-fadeIn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
            }}
          >
            <LoadingSpinner
              message="正在为您生成菜谱推荐..."
              subMessage="AI 正在根据您选择的食材搭配美味菜谱"
              size="large"
            />
          </div>
        )}

        {/* 菜谱列表 - staggered 动画 */}
        {!isLoading && !error && recipes.length > 0 && (
          <div className="animate-fadeIn">
            <div
              className="animate-slideUp"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <Text style={{ color: colors.neutral[600], fontSize: 15 }}>
                ✨ 为您推荐 <span style={{ color: colors.primary[500], fontWeight: 600 }}>{recipes.length}</span> 道精选菜谱
              </Text>
            </div>
            <RecipeList recipes={recipes} />
          </div>
        )}

        {/* 空状态 - 活力风格 */}
        {!isLoading && !error && recipes.length === 0 && (
          <div
            className="animate-fadeIn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
            }}
          >
            <Empty
              image={<span style={{ fontSize: 80 }}>🍳</span>}
              imageStyle={{ height: 100 }}
              description={
                <Text style={{ color: colors.neutral[500], fontSize: 16 }}>
                  暂无推荐菜谱，换些食材试试？
                </Text>
              }
            >
              <Link to="/">
                <Button
                  type="primary"
                  size="large"
                  className="click-scale"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.secondary[400]} 100%)`,
                    border: 'none',
                    borderRadius: 24,
                    paddingLeft: 32,
                    paddingRight: 32,
                  }}
                >
                  返回首页重新选择
                </Button>
              </Link>
            </Empty>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default RecipeListPage;
