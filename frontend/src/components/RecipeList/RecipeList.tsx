// components/RecipeList/RecipeList.tsx - Neubrutalism v2 recipe list
import { useNavigate, useLocation } from 'react-router-dom';
import { Empty, Tag } from 'antd';
import { ClockCircleOutlined, RightOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import type { RecipeWithMatch } from '../../types';
import { colors } from '../../theme';

interface RecipeListProps {
  recipes: RecipeWithMatch[];
}

const difficultyColors: Record<string, string> = {
  '简单': '#7AE582',
  '中等': '#FFE566',
  '复杂': '#FF6B9D',
};

export function RecipeList({ recipes }: RecipeListProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleRecipeClick = (recipeId: string, recipeTitle: string) => {
    navigate(`/recipe/${recipeId}?title=${encodeURIComponent(recipeTitle)}`, {
      state: { from: location.pathname + location.search }
    });
  };

  if (recipes.length === 0) {
    return <Empty description={t('recipes.noRecommend')} style={{ padding: '48px 0' }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {recipes.map((recipe, index) => (
        <div
          key={recipe.id}
          className="nb-card"
          onClick={() => handleRecipeClick(recipe.id, recipe.title)}
          style={{ background: '#FFFFFF', padding: 24, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Number badge */}
            <div
              className="nb-step-badge"
              style={{
                background: [colors.candy.orange, colors.candy.pink, colors.candy.blue, colors.candy.green, colors.candy.purple][index % 5],
              }}
            >
              {index + 1}
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{ margin: 0, marginBottom: 8, fontSize: 18, fontWeight: 800, color: colors.ink }}>
                {recipe.title}
              </h4>
              <p style={{
                margin: 0,
                marginBottom: 12,
                fontSize: 14,
                color: `${colors.ink}80`,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {recipe.description}
              </p>

              {/* Matched ingredients */}
              {recipe.matchedIngredients.length > 0 && (
                <div style={{ marginBottom: 12, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 13, color: `${colors.ink}80`, marginRight: 4 }}>{t('recipes.matchedIngredients')}</span>
                  {recipe.matchedIngredients.map(ing => (
                    <Tag key={ing} style={{
                      background: colors.candy.green + '40',
                      color: colors.ink,
                      border: `2px solid ${colors.ink}`,
                      borderRadius: 50,
                      fontWeight: 700,
                      fontSize: 12,
                    }}>
                      {ing}
                    </Tag>
                  ))}
                </div>
              )}

              {/* Meta tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span style={{
                  background: difficultyColors[recipe.difficulty] || colors.candy.yellow,
                  color: colors.ink,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: 50,
                  padding: '2px 12px',
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  {recipe.difficulty}
                </span>
                <Tag icon={<ClockCircleOutlined />} style={{
                  background: colors.candy.blue + '30',
                  color: colors.ink,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: 50,
                  fontWeight: 700,
                  fontSize: 12,
                }}>
                  {recipe.cookingTime}
                </Tag>
                {recipe.tags?.slice(0, 2).map(tag => (
                  <span key={tag} style={{ fontSize: 12, color: `${colors.ink}80`, fontWeight: 600 }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Arrow */}
            <RightOutlined style={{ color: colors.ink, fontSize: 20, flexShrink: 0 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default RecipeList;
