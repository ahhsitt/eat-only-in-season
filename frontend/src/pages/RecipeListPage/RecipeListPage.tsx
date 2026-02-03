// pages/RecipeListPage/RecipeListPage.tsx - Neubrutalism v2 Recipe List
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Tag, Alert, Empty } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined, FireOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout/Layout';
import { RecipeList } from '../../components/RecipeList/RecipeList';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { getRecipesByIngredients } from '../../services/api';
import { colors } from '../../theme';
import type { RecipeWithMatch } from '../../types';

export function RecipeListPage() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<RecipeWithMatch[]>([]);
  const { t } = useTranslation();

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
      setError(err instanceof Error ? err.message : t('common.recipeFetchFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Layout showHeader={false} showFooter={true}>
      {/* Custom Header */}
      <div
        style={{
          background: colors.candy.yellow,
          borderBottom: `4px solid ${colors.ink}`,
          padding: '12px 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/">
            <button
              className="nb-btn-sm"
              style={{ background: '#fff', padding: '6px 16px', cursor: 'pointer', color: colors.ink }}
            >
              <ArrowLeftOutlined /> {t('recipes.backToHome')}
            </button>
          </Link>
          <h3 className="font-display" style={{ margin: 0, fontSize: 22, color: colors.ink }}>
            🍴 {t('recipes.title')}
          </h3>
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 24px', minHeight: 'calc(100vh - 200px)' }}>
        {/* Selected ingredients */}
        {ingredients.length > 0 && (
          <div className="nb-card" style={{ background: colors.candy.orange + '20', padding: 20, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <FireOutlined style={{ color: colors.ink, fontSize: 18 }} />
              <span style={{ color: colors.ink, fontWeight: 700 }}>{t('recipes.ingredientBased')}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ingredients.map(ing => (
                <Tag key={ing} style={{
                  background: colors.candy.yellow,
                  color: colors.ink,
                  border: `2px solid ${colors.ink}`,
                  borderRadius: 50,
                  padding: '4px 14px',
                  fontSize: 14,
                  fontWeight: 700,
                }}>
                  {ing}
                </Tag>
              ))}
            </div>
            {preference && (
              <p style={{ color: `${colors.ink}80`, fontSize: 13, marginTop: 12, marginBottom: 0 }}>
                💡 {t('recipes.preference', { text: preference })}
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: 24, borderRadius: 16, border: `3px solid ${colors.ink}` }}
            action={
              <button className="nb-btn-sm" onClick={fetchRecipes} style={{ background: '#fff', padding: '4px 12px', cursor: 'pointer', color: colors.ink }}>
                <ReloadOutlined /> {t('recipes.retry')}
              </button>
            }
          />
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <LoadingSpinner
              message={t('recipes.generating')}
              subMessage={t('recipes.generatingHint')}
              size="large"
            />
          </div>
        )}

        {/* Recipe list */}
        {!isLoading && !error && recipes.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <span style={{ color: colors.ink, fontSize: 16, fontWeight: 700 }}>
                ✨ {t('recipes.recommended', { count: recipes.length })}
              </span>
            </div>
            <RecipeList recipes={recipes} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && recipes.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
            <Empty
              image={<span style={{ fontSize: 80 }}>🍳</span>}
              imageStyle={{ height: 100 }}
              description={<span style={{ color: `${colors.ink}80`, fontSize: 16 }}>{t('recipes.noRecipes')}</span>}
            >
              <Link to="/">
                <button className="nb-btn" style={{ background: colors.candy.orange, color: colors.ink, padding: '12px 32px', cursor: 'pointer' }}>
                  {t('recipes.backHome')}
                </button>
              </Link>
            </Empty>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default RecipeListPage;
