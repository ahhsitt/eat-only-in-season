// components/IngredientList/IngredientList.tsx - 按分类展示应季食材的组件 (Ant Design)
// 005-page-ui-redesign: 活力食材选择体验

import { useState } from 'react';
import { Card, Checkbox, Collapse, Tag, Empty, Row, Col, Typography, Skeleton, Space } from 'antd';
import { CheckOutlined, DownOutlined } from '@ant-design/icons';
import { colors, categoryColors } from '../../theme';
import type { IngredientCategoryGroup } from '../../types';

const { Text } = Typography;

interface IngredientListProps {
  categories: IngredientCategoryGroup[];
  selectedIngredients: string[];
  onSelectionChange: (selected: string[]) => void;
  loading?: boolean;
}

// 分类图标映射
const categoryIcons: Record<string, string> = {
  '肉类': '🥩',
  '蔬菜': '🥬',
  '水果': '🍎',
  '海鲜': '🦐',
  '蛋奶': '🥚',
  '其他': '🍚',
};

export function IngredientList({
  categories,
  selectedIngredients,
  onSelectionChange,
  loading = false,
}: IngredientListProps) {
  const [activeKeys, setActiveKeys] = useState<string[]>(
    categories.map(c => c.category)
  );

  const toggleIngredient = (ingredientName: string) => {
    if (selectedIngredients.includes(ingredientName)) {
      onSelectionChange(selectedIngredients.filter(name => name !== ingredientName));
    } else {
      onSelectionChange([...selectedIngredients, ingredientName]);
    }
  };

  const isSelected = (ingredientName: string) => selectedIngredients.includes(ingredientName);

  // 获取分类颜色
  const getCategoryColor = (category: string) => {
    return categoryColors[category] || {
      bg: colors.neutral[100],
      text: colors.neutral[700],
      border: colors.neutral[300],
    };
  };

  // 加载状态
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </Card>
        ))}
      </div>
    );
  }

  // 空状态
  if (categories.length === 0) {
    return (
      <Empty
        description="暂无应季食材数据"
        style={{ padding: '48px 0' }}
      />
    );
  }

  const collapseItems = categories.map((categoryGroup, categoryIndex) => {
    const catColor = getCategoryColor(categoryGroup.category);

    return {
      key: categoryGroup.category,
      label: (
        <Space
          className="animate-slideUp"
          style={{ animationDelay: `${categoryIndex * 0.05}s` }}
        >
          <span
            style={{
              fontSize: 24,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: catColor.bg,
            }}
          >
            {categoryIcons[categoryGroup.category] || '📦'}
          </span>
          <Text strong style={{ fontSize: 16, color: catColor.text }}>
            {categoryGroup.category}
          </Text>
          <Tag
            style={{
              backgroundColor: catColor.bg,
              color: catColor.text,
              borderColor: catColor.border,
              borderRadius: 12,
            }}
          >
            {categoryGroup.ingredients.length}种
          </Tag>
        </Space>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {categoryGroup.ingredients.map((ingredient, index) => {
            const selected = isSelected(ingredient.name);

            return (
              <Col
                key={ingredient.id}
                xs={12}
                sm={8}
                md={6}
                className="animate-fadeIn"
                style={{
                  animationDelay: `${index * 0.03}s`,
                  opacity: 0,
                  animationFillMode: 'forwards',
                }}
              >
                <Card
                  size="small"
                  hoverable
                  onClick={() => toggleIngredient(ingredient.name)}
                  className={`hover-lift ${selected ? 'select-bounce selected' : 'select-bounce'}`}
                  style={{
                    borderColor: selected ? colors.primary[400] : catColor.border,
                    backgroundColor: selected ? colors.primary[50] : '#FFFFFF',
                    cursor: 'pointer',
                    height: '100%',
                    borderRadius: 16,
                    borderWidth: selected ? 2 : 1,
                    transition: 'all 0.2s ease',
                  }}
                  styles={{
                    body: { padding: 16 }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text
                      strong
                      style={{
                        flex: 1,
                        paddingRight: 8,
                        color: selected ? colors.primary[600] : colors.neutral[800],
                        fontSize: 15,
                      }}
                    >
                      {ingredient.name}
                    </Text>
                    <Checkbox
                      checked={selected}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleIngredient(ingredient.name)}
                      style={{
                        transform: selected ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.neutral[500],
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      marginTop: 8,
                    }}
                  >
                    {ingredient.briefIntro}
                  </Text>
                </Card>
              </Col>
            );
          })}
        </Row>
      ),
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Collapse
        activeKey={activeKeys}
        onChange={(keys) => setActiveKeys(keys as string[])}
        expandIcon={({ isActive }) => (
          <DownOutlined
            rotate={isActive ? 180 : 0}
            style={{
              color: colors.primary[400],
              transition: 'transform 0.3s ease',
            }}
          />
        )}
        items={collapseItems}
        style={{
          background: 'transparent',
          border: 'none',
        }}
        expandIconPosition="end"
      />

      {/* 已选食材展示 - 活力风格 */}
      {selectedIngredients.length > 0 && (
        <Card
          size="small"
          className="animate-slideUp"
          style={{
            background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`,
            borderColor: colors.primary[200],
            borderRadius: 16,
          }}
        >
          <Space wrap size={[8, 8]}>
            <Text style={{ color: colors.primary[600], fontWeight: 500 }}>
              <CheckOutlined style={{ marginRight: 6 }} />
              已选择 {selectedIngredients.length} 种食材：
            </Text>
            {selectedIngredients.map((name, index) => (
              <Tag
                key={name}
                closable
                onClose={() => toggleIngredient(name)}
                className="animate-bounceIn"
                style={{
                  animationDelay: `${index * 0.05}s`,
                  backgroundColor: colors.primary[100],
                  color: colors.primary[600],
                  borderColor: colors.primary[300],
                  borderRadius: 12,
                  padding: '4px 12px',
                  fontSize: 13,
                }}
              >
                {name}
              </Tag>
            ))}
          </Space>
        </Card>
      )}
    </div>
  );
}

export default IngredientList;
