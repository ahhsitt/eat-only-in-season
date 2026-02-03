// pages/NewHome/NewHome.tsx - Neubrutalism v2 Home Page
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Alert, Empty } from 'antd';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout/Layout';
import { CityInput } from '../../components/CityInput/CityInput';
import { IngredientList } from '../../components/IngredientList/IngredientList';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { getSeasonalIngredients } from '../../services/api';
import { colors } from '../../theme';
import type { Location, IngredientCategoryGroup, NewUserPreference } from '../../types';
import { PREFERENCES_STORAGE_KEY } from '../../types';

export function NewHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [preference, setPreference] = useState<NewUserPreference>(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) { console.error('Error reading preferences:', e); }
    return { preferenceText: '', updatedAt: Date.now() };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [categories, setCategories] = useState<IngredientCategoryGroup[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [currentCity, setCurrentCity] = useState(preference.lastCity || '');

  const savePreference = useCallback((updates: Partial<NewUserPreference>) => {
    setPreference(prev => {
      const updated = { ...prev, ...updates, updatedAt: Date.now() };
      try { localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(updated)); }
      catch (e) { console.error('Error saving preferences:', e); }
      return updated;
    });
  }, []);

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
      setError(err instanceof Error ? err.message : t('common.fetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [savePreference, t]);

  const handleGetRecipes = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedIngredients.length > 0) params.set('ingredients', selectedIngredients.join(','));
    if (preference.preferenceText) params.set('preference', preference.preferenceText);
    if (currentCity) params.set('location', currentCity);
    navigate(`/recipes?${params.toString()}`);
  }, [selectedIngredients, preference.preferenceText, currentCity, navigate]);

  // Quick city tags
  const quickCities = [
    { emoji: '🏙️', key: 'beijing', name: t('cities.beijing') },
    { emoji: '🌆', key: 'shanghai', name: t('cities.shanghai') },
    { emoji: '🌴', key: 'guangzhou', name: t('cities.guangzhou') },
    { emoji: '🐼', key: 'chengdu', name: t('cities.chengdu') },
  ];

  return (
    <Layout showHeader={true} showFooter={true}>
      {/* Hero Section - No Results */}
      {!location && !isLoading && (
        <section
          style={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            background: `linear-gradient(180deg, ${colors.paper} 0%, ${colors.candy.yellow}30 50%, ${colors.candy.pink}15 100%)`,
            position: 'relative',
          }}
        >
          {/* Badge */}
          <div className="nb-badge" style={{ background: colors.candy.cyan, color: colors.ink, marginBottom: 24 }}>
            <span style={{ fontSize: 20 }}>✨</span>
            <span>{t('home.badge')}</span>
          </div>

          {/* Headline */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ margin: 0 }}>
              <span className="font-display" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', color: colors.ink, display: 'block', lineHeight: 1.1 }}>
                {t('home.headline1')}
              </span>
              <span className="font-display" style={{ fontSize: 'clamp(3rem, 8vw, 5rem)', display: 'block', lineHeight: 1.1, marginTop: 8 }}>
                <span className="squiggle" style={{ color: colors.candy.pink }}>{t('home.headline2')}</span>
                <span className="animate-bounce-slow" style={{ display: 'inline-block', marginLeft: 12 }}>🍅</span>
              </span>
            </h1>
            <p style={{ fontSize: 20, color: `${colors.ink}CC`, fontWeight: 500, maxWidth: 480, margin: '20px auto 0', lineHeight: 1.6 }}>
              {t('home.subtitle')}
            </p>
          </div>

          {/* Search */}
          <div style={{ width: '100%', maxWidth: 560, marginBottom: 16 }}>
            <CityInput
              initialValue={preference.lastCity}
              onSearch={handleCitySearch}
              isLoading={isLoading}
              suggestions={[]}
            />
          </div>

          {/* Quick city tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <span style={{ color: `${colors.ink}99`, fontWeight: 700, fontSize: 14 }}>{t('home.popular')}</span>
            {quickCities.map(city => (
              <button
                key={city.key}
                className="nb-tag"
                onClick={() => handleCitySearch(city.name)}
                style={{ fontSize: 14 }}
              >
                {city.emoji} {city.name}
              </button>
            ))}
          </div>

          {/* Preference card */}
          <div
            className="nb-card"
            style={{ width: '100%', maxWidth: 560, background: 'rgba(255,255,255,0.9)', padding: 20 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>❤️</span>
              <span style={{ fontWeight: 800, color: colors.ink }}>{t('home.preferenceLabel')}</span>
            </div>
            <Input
              value={preference.preferenceText}
              onChange={(e) => savePreference({ preferenceText: e.target.value })}
              placeholder={t('home.preferencePlaceholder')}
              maxLength={500}
              className="nb-input"
              style={{ fontSize: 16, padding: '10px 16px' }}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{ width: '100%', maxWidth: 560, marginTop: 24 }}>
              <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} style={{ borderRadius: 16, border: `3px solid ${colors.ink}` }} />
            </div>
          )}
        </section>
      )}

      {/* Loading */}
      {isLoading && (
        <section
          style={{
            minHeight: 'calc(100vh - 200px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(180deg, ${colors.paper} 0%, ${colors.candy.yellow}20 100%)`,
          }}
        >
          <LoadingSpinner
            message={t('ingredients.loading')}
            subMessage={t('ingredients.loadingHint')}
            size="large"
          />
        </section>
      )}

      {/* Results */}
      {!isLoading && location && categories.length > 0 && (
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '32px 24px' }}>
          {/* Zigzag divider */}
          <div className="deco-zigzag" style={{ marginBottom: 32 }} />

          {/* Location header */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
            <div>
              <div className="nb-badge" style={{ background: colors.candy.green, color: colors.ink, marginBottom: 12 }}>
                <span>🌿</span>
                <span>{t('ingredients.badge')}</span>
              </div>
              <h2 className="font-display" style={{ margin: 0, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: colors.ink }}>
                {location.matchedName} · {location.season}
              </h2>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <span className="nb-tag" style={{ background: colors.ink, color: '#fff', cursor: 'default' }}>
                📅 {t('common.month', { num: location.month })}
              </span>
              <button
                className="nb-btn-sm"
                onClick={() => { setLocation(null); setCategories([]); }}
                style={{ background: '#fff', color: colors.ink, cursor: 'pointer', padding: '6px 16px' }}
              >
                {t('home.backToSearch')}
              </button>
            </div>
          </div>

          {/* Ingredients */}
          <section style={{ marginBottom: 32 }}>
            <IngredientList
              categories={categories}
              selectedIngredients={selectedIngredients}
              onSelectionChange={setSelectedIngredients}
            />
          </section>

          {/* CTA button */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button
              className="nb-btn"
              onClick={handleGetRecipes}
              style={{
                background: colors.candy.pink,
                color: '#FFFFFF',
                padding: '16px 48px',
                fontSize: 20,
                cursor: 'pointer',
              }}
            >
              {selectedIngredients.length > 0
                ? `${t('home.getRecipesCount', { count: selectedIngredients.length })} 🎉`
                : `${t('home.getRandomRecipes')} 🎲`
              }
            </button>
            {selectedIngredients.length === 0 && (
              <p style={{ color: `${colors.ink}80`, marginTop: 12, fontWeight: 700 }}>
                {t('home.noSelectionHint')} ✨
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error empty state */}
      {!isLoading && error && !location && (
        <section style={{ minHeight: 'calc(100vh - 300px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
          <Empty
            image={<span style={{ fontSize: 72 }}>🌍</span>}
            imageStyle={{ height: 100 }}
            description={<span style={{ color: `${colors.ink}80` }}>{t('home.emptyHint')}</span>}
          />
        </section>
      )}
    </Layout>
  );
}

export default NewHome;
