// components/RecipeCard/RecipeCard.tsx - Recipe card component using Ant Design
// 005-page-ui-redesign: 大图沉浸式卡片

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Tag, Typography, Space, Skeleton } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import { colors } from '../../theme';
import type { Recipe } from '../../types';
import { DifficultyNames } from '../../types';

const { Title, Text, Paragraph } = Typography;

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
}

const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  easy: { bg: colors.success + '20', text: '#2E7D32', border: colors.success },
  medium: { bg: colors.warning + '20', text: '#F57C00', border: colors.warning },
  hard: { bg: colors.primary[100], text: colors.primary[600], border: colors.primary[400] },
};

export function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const diffColor = difficultyColors[recipe.difficulty] || difficultyColors.medium;

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      style={{ display: 'block', textDecoration: 'none' }}
      aria-label={`查看${recipe.name}详情，${DifficultyNames[recipe.difficulty]}，需要${recipe.cookingTime}分钟`}
    >
      <Card
        hoverable
        className="hover-lift animate-slideUp"
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          border: 'none',
          boxShadow: `0 4px 20px ${colors.primary[200]}30`,
          animationDelay: `${index * 0.1}s`,
          animationFillMode: 'backwards',
        }}
        cover={
          <div
            style={{
              height: 220,
              background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* 骨架屏 */}
            {recipe.imageBase64 && !imageLoaded && !imageError && (
              <Skeleton.Image
                active
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                }}
              />
            )}

            {/* 图片 */}
            {recipe.imageBase64 && !imageError ? (
              <img
                src={`data:image/png;base64,${recipe.imageBase64}`}
                alt={`${recipe.name}成品图`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease, transform 0.4s ease',
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 56 }}>🍽️</span>
                <Text style={{ color: colors.neutral[400], fontSize: 12 }}>
                  精美图片生成中
                </Text>
              </div>
            )}

            {/* 渐变遮罩 */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 80,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.4))',
                pointerEvents: 'none',
              }}
            />

            {/* 烹饪时间标签 - 悬浮在图片上 */}
            <Tag
              icon={<ClockCircleOutlined />}
              style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                backgroundColor: 'rgba(255,255,255,0.95)',
                color: colors.neutral[700],
                border: 'none',
                borderRadius: 16,
                padding: '4px 12px',
                fontWeight: 500,
                backdropFilter: 'blur(4px)',
              }}
            >
              {recipe.cookingTime}分钟
            </Tag>
          </div>
        }
        styles={{
          body: { padding: 20 }
        }}
      >
        <Title
          level={4}
          style={{
            margin: 0,
            marginBottom: 8,
            color: colors.neutral[800],
            fontWeight: 600,
          }}
        >
          {recipe.name}
        </Title>

        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{
            marginBottom: 16,
            fontSize: 14,
            color: colors.neutral[500],
            lineHeight: 1.6,
          }}
        >
          {recipe.description}
        </Paragraph>

        <Space wrap size={[8, 8]} style={{ marginBottom: 12 }}>
          <Tag
            style={{
              backgroundColor: colors.secondary[50],
              color: colors.secondary[600],
              border: `1px solid ${colors.secondary[200]}`,
              borderRadius: 16,
              padding: '2px 12px',
            }}
          >
            {recipe.cuisine}
          </Tag>
          <Tag
            style={{
              backgroundColor: diffColor.bg,
              color: diffColor.text,
              border: `1px solid ${diffColor.border}`,
              borderRadius: 16,
              padding: '2px 12px',
            }}
          >
            {DifficultyNames[recipe.difficulty]}
          </Tag>
        </Space>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            paddingTop: 12,
            borderTop: `1px solid ${colors.neutral[100]}`,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.neutral[400] }}>
            🥬 应季食材：
          </Text>
          <Text style={{ fontSize: 12, color: colors.primary[500], fontWeight: 500 }}>
            {recipe.seasonalIngredients.slice(0, 3).join('、')}
            {recipe.seasonalIngredients.length > 3 && '...'}
          </Text>
        </div>
      </Card>
    </Link>
  );
}
