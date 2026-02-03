// components/IngredientList/IngredientList.tsx - Neubrutalism v2 ingredient cards
import { useTranslation } from 'react-i18next';
import { Empty, Skeleton } from 'antd';
import { colors, categoryColors } from '../../theme';
import type { IngredientCategoryGroup, IngredientCategory } from '../../types';

interface IngredientListProps {
  categories: IngredientCategoryGroup[];
  selectedIngredients: string[];
  onSelectionChange: (selected: string[]) => void;
  loading?: boolean;
}

// Map category code to emoji
const categoryIcons: Record<IngredientCategory, string> = {
  meat: '🥩',
  vegetable: '🥬',
  fruit: '🍎',
  seafood: '🐟',
  dairy: '🥚',
  other: '🍚',
};

export function IngredientList({
  categories,
  selectedIngredients,
  onSelectionChange,
  loading = false,
}: IngredientListProps) {
  const { t } = useTranslation();

  const toggleIngredient = (ingredientName: string) => {
    if (selectedIngredients.includes(ingredientName)) {
      onSelectionChange(selectedIngredients.filter(name => name !== ingredientName));
    } else {
      onSelectionChange([...selectedIngredients, ingredientName]);
    }
  };

  const isSelected = (name: string) => selectedIngredients.includes(name);

  const getCatColor = (category: IngredientCategory) => {
    return categoryColors[category] || categoryColors.default;
  };

  // Get translated category name
  const getCategoryName = (category: IngredientCategory): string => {
    return t(`categories.${category}`);
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="nb-card" style={{ padding: 24, background: '#fff' }}>
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
        ))}
      </div>
    );
  }

  if (categories.length === 0) {
    return <Empty description={t('ingredients.noData')} style={{ padding: '48px 0' }} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Category cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {categories.map((categoryGroup) => {
          const catColor = getCatColor(categoryGroup.category);
          return (
            <div
              key={categoryGroup.category}
              className="nb-card"
              style={{
                background: catColor.bg,
                padding: 24,
              }}
            >
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    background: catColor.candy,
                    borderRadius: 16,
                    border: `3px solid ${colors.ink}`,
                    boxShadow: `3px 3px 0px ${colors.ink}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                  }}
                >
                  {categoryIcons[categoryGroup.category] || '📦'}
                </div>
                <div>
                  <h4 className="font-display" style={{ margin: 0, fontSize: 20, color: colors.ink }}>
                    {getCategoryName(categoryGroup.category)}
                  </h4>
                  <span style={{ fontSize: 14, color: `${colors.ink}99`, fontWeight: 700 }}>
                    {categoryGroup.ingredients.length} {t('ingredients.seasonal')}
                  </span>
                </div>
              </div>

              {/* Ingredient tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {categoryGroup.ingredients.map((ingredient) => (
                  <button
                    key={ingredient.id}
                    className={`nb-tag ${isSelected(ingredient.name) ? 'selected' : ''}`}
                    onClick={() => toggleIngredient(ingredient.name)}
                    style={{
                      background: isSelected(ingredient.name) ? colors.candy.yellow : '#FFFFFF',
                    }}
                  >
                    {ingredient.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected summary */}
      {selectedIngredients.length > 0 && (
        <div
          className="nb-card"
          style={{
            background: colors.candy.yellow + '40',
            padding: 20,
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
            <span style={{ fontWeight: 800, color: colors.ink, marginRight: 4 }}>
              ✅ {t('ingredients.selected', { count: selectedIngredients.length })}
            </span>
            {selectedIngredients.map((name) => (
              <button
                key={name}
                className="nb-tag selected"
                onClick={() => toggleIngredient(name)}
                style={{ fontSize: 13 }}
              >
                {name} ✕
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default IngredientList;
