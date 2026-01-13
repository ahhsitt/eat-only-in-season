import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import ErrorBoundary from './components/ErrorBoundary';
import { theme, colors } from './theme';

// 全局动画样式
import './styles/animations.css';

// Lazy load non-critical pages for better initial load performance
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Setup = lazy(() => import('./pages/Setup/Setup'));

// 003-flow-redesign: 新流程页面
const NewHome = lazy(() => import('./pages/NewHome/NewHome'));
const RecipeListPage = lazy(() => import('./pages/RecipeListPage/RecipeListPage'));
const NewRecipeDetailPage = lazy(() => import('./pages/NewRecipeDetail/NewRecipeDetailPage'));

// Loading fallback component using Ant Design
function PageLoader() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: colors.neutral[50],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center' }} role="status" aria-live="polite">
        <Spin size="large" />
        <p style={{ color: colors.neutral[600], marginTop: 16 }}>加载中...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <ConfigProvider theme={theme} locale={zhCN}>
      <ErrorBoundary>
        <BrowserRouter>
          <div style={{ minHeight: '100vh', backgroundColor: colors.neutral[50] }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* 003-flow-redesign: 新流程作为默认首页 */}
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

export default App;
