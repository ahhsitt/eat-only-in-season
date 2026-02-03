import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import enUS from 'antd/locale/en_US';
import { useTranslation } from 'react-i18next';
import ErrorBoundary from './components/ErrorBoundary';
import { theme, colors } from './theme';

// i18n configuration
import './i18n';

// Styles
import './styles/animations.css';
import './styles/neubrutalism.css';

// Lazy load pages
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Setup = lazy(() => import('./pages/Setup/Setup'));
const NewHome = lazy(() => import('./pages/NewHome/NewHome'));
const RecipeListPage = lazy(() => import('./pages/RecipeListPage/RecipeListPage'));
const NewRecipeDetailPage = lazy(() => import('./pages/NewRecipeDetail/NewRecipeDetailPage'));

function PageLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.paper,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }} role="status" aria-live="polite">
        <div style={{ display: 'flex', gap: 8 }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="animate-bounce-slow"
              style={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: `3px solid ${colors.ink}`,
                background: [colors.candy.orange, colors.candy.pink, colors.candy.blue][i],
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        <p style={{ color: colors.ink, fontWeight: 700 }}>Loading...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { i18n } = useTranslation();
  const antLocale = i18n.language === 'en' ? enUS : zhCN;

  return (
    <ConfigProvider theme={theme} locale={antLocale}>
      <ErrorBoundary>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', backgroundColor: colors.paper }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<NewHome />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/setup" element={<Setup />} />
                <Route path="/recipes" element={<RecipeListPage />} />
                <Route path="/recipe/:recipeId" element={<NewRecipeDetailPage />} />
              </Routes>
            </Suspense>
          </div>
        </BrowserRouter>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

function App() {
  return <AppContent />;
}

export default App;
