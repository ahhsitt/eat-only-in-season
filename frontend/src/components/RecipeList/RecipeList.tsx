// components/RecipeList/RecipeList.tsx - 菜谱列表组件 (Ant Design)
// 006-ux-fixes-optimization: 添加导航参数保持

import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Tag, Typography, Space, Row, Col, Empty, Badge } from 'antd';
import { ClockCircleOutlined, RightOutlined } from '@ant-design/icons';
import type { RecipeWithMatch } from '../../types';

const { Title, Text, Paragraph } = Typography;

interface RecipeListProps {
  recipes: RecipeWithMatch[];
}

// 难度颜色映射
const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  '简单': { bg: '#E8EDE4', text: '#6B7A5D', border: '#C5D4BC' },
  '中等': { bg: '#F5F0E6', text: '#8B7B5B', border: '#E8DCC6' },
  '复杂': { bg: '#F5EBE6', text: '#8B6B5B', border: '#E8D6C6' },
};

export function RecipeList({ recipes }: RecipeListProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // 点击菜谱卡片时，携带来源信息导航到详情页
  const handleRecipeClick = (recipeId: string, recipeTitle: string) => {
    navigate(`/recipe/${recipeId}?title=${encodeURIComponent(recipeTitle)}`, {
      state: { from: location.pathname + location.search }
    });
  };

  if (recipes.length === 0) {
    return (
      <Empty
        description="暂无推荐菜谱"
        style={{ padding: '48px 0' }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {recipes.map((recipe, index) => (
        <Card
          key={recipe.id}
          hoverable
          onClick={() => handleRecipeClick(recipe.id, recipe.title)}
          style={{ cursor: 'pointer' }}
          styles={{ body: { padding: 20 } }}
        >
            <Row align="middle" gutter={16}>
              <Col flex="none">
                <Badge
                  count={index + 1}
                  style={{
                    backgroundColor: '#E8EDE4',
                    color: '#6B7A5D',
                    fontWeight: 600,
                    width: 32,
                    height: 32,
                    lineHeight: '32px',
                    borderRadius: '50%',
                    fontSize: 14,
                  }}
                />
              </Col>
              <Col flex="auto">
                <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
                  {recipe.title}
                </Title>

                <Paragraph
                  type="secondary"
                  ellipsis={{ rows: 2 }}
                  style={{ marginBottom: 12, fontSize: 14 }}
                >
                  {recipe.description}
                </Paragraph>

                {/* 匹配的食材 */}
                {recipe.matchedIngredients.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: 13, marginRight: 8 }}>
                      匹配食材：
                    </Text>
                    <Space wrap size={4}>
                      {recipe.matchedIngredients.map(ing => (
                        <Tag key={ing} color="#8B9A7D">
                          {ing}
                        </Tag>
                      ))}
                    </Space>
                  </div>
                )}

                {/* 标签和元信息 */}
                <Space wrap size={8}>
                  <Tag
                    style={{
                      backgroundColor: difficultyColors[recipe.difficulty]?.bg || '#f0f0f0',
                      color: difficultyColors[recipe.difficulty]?.text || '#666',
                      border: `1px solid ${difficultyColors[recipe.difficulty]?.border || '#d9d9d9'}`,
                      borderRadius: 12,
                    }}
                  >
                    {recipe.difficulty}
                  </Tag>
                  <Tag
                    icon={<ClockCircleOutlined />}
                    style={{
                      backgroundColor: '#E6EBF0',
                      color: '#5B6B8B',
                      border: '1px solid #C6D1E8',
                      borderRadius: 12,
                    }}
                  >
                    {recipe.cookingTime}
                  </Tag>
                  {recipe.tags && recipe.tags.length > 0 && (
                    <>
                      {recipe.tags.slice(0, 3).map(tag => (
                        <Text key={tag} type="secondary" style={{ fontSize: 12 }}>
                          #{tag}
                        </Text>
                      ))}
                    </>
                  )}
                </Space>
              </Col>
              <Col flex="none">
                <RightOutlined style={{ color: '#999', fontSize: 18 }} />
              </Col>
            </Row>
          </Card>
      ))}
    </div>
  );
}

export default RecipeList;
