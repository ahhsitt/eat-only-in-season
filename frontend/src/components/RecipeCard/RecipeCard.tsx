// components/RecipeCard/RecipeCard.tsx - Neubrutalism v2 recipe card
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Typography, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import { colors } from '../../theme';
import type { Recipe } from '../../types';
import { DifficultyNames } from '../../types';

const { Paragraph } = Typography;

interface RecipeCardProps {
  recipe: Recipe;
  index?: number;
}

// Map recipe type to emoji
const recipeEmojis = ['🍲', '🥗', '🥘', '🍳', '🍜', '🥟', '🍖', '🧆'];
// Gradient pairs for card headers
const gradients = [
  ['#FF6B9D', '#FF9F43'],
  ['#7AE582', '#00D9C0'],
  ['#FF9F43', '#FFE566'],
  ['#5DADE2', '#A66CFF'],
  ['#A66CFF', '#FF6B9D'],
  ['#00D9C0', '#5DADE2'],
];

export function RecipeCard({ recipe, index = 0 }: RecipeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { t } = useTranslation();
  const gradient = gradients[index % gradients.length];
  const emoji = recipeEmojis[index % recipeEmojis.length];

  return (
    <Link
      to={`/recipe/${recipe.id}`}
      style={{ display: 'block', textDecoration: 'none' }}
      aria-label={`${recipe.name} - ${DifficultyNames[recipe.difficulty]} - ${recipe.cookingTime}${t('common.minutes')}`}
    >
      <div className="nb-card" style={{ background: '#FFFFFF', overflow: 'hidden', cursor: 'pointer' }}>
        {/* Card header with gradient */}
        <div
          style={{
            height: 192,
            background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {recipe.imageBase64 && !imageLoaded && !imageError && (
            <Skeleton.Image active style={{ position: 'absolute', width: '100%', height: '100%' }} />
          )}

          {recipe.imageBase64 && !imageError ? (
            <img
              src={`data:image/png;base64,${recipe.imageBase64}`}
              alt={recipe.name}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease',
              }}
            />
          ) : (
            <span style={{ fontSize: 72, transition: 'transform 0.3s ease' }}>
              {emoji}
            </span>
          )}

          {/* Category tag */}
          <div style={{ position: 'absolute', top: 16, right: 16 }}>
            <span style={{
              background: colors.ink,
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: 50,
              fontSize: 12,
              fontWeight: 700,
              border: `2px solid ${colors.ink}`,
            }}>
              {recipe.cuisine}
            </span>
          </div>

          {/* Floating decorations */}
          <div className="animate-bounce-slow" style={{ position: 'absolute', top: 16, left: 16, width: 16, height: 16, background: 'white', borderRadius: '50%', opacity: 0.6 }} />
          <div className="animate-float" style={{ position: 'absolute', bottom: 16, left: 32, width: 12, height: 12, background: 'white', borderRadius: '50%', opacity: 0.4 }} />
        </div>

        {/* Card body */}
        <div style={{ padding: 20 }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 800, color: colors.ink }}>
            {recipe.name}
          </h3>
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ marginBottom: 16, fontSize: 14, color: `${colors.ink}99`, lineHeight: 1.6 }}
          >
            {recipe.description}
          </Paragraph>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <span style={{
              background: colors.candy.yellow + '80',
              padding: '2px 12px',
              borderRadius: 50,
              fontSize: 13,
              fontWeight: 700,
              color: colors.ink,
              border: `2px solid ${colors.ink}`,
            }}>
              {recipe.cookingTime}{t('common.minutes')}
            </span>
            <Tag style={{
              background: colors.candy.green + '40',
              color: colors.ink,
              border: `2px solid ${colors.ink}`,
              borderRadius: 50,
              fontWeight: 700,
            }}>
              {DifficultyNames[recipe.difficulty]}
            </Tag>
          </div>

          {/* Seasonal ingredients */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: `2px dashed ${colors.ink}20` }}>
            <span style={{ fontSize: 12, color: `${colors.ink}80` }}>{t('common.seasonalIngredient')}</span>
            <span style={{ fontSize: 13, color: colors.candy.pink, fontWeight: 700 }}>
              {recipe.seasonalIngredients.slice(0, 3).join('、')}
              {recipe.seasonalIngredients.length > 3 && '...'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
