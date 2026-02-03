// pages/NewRecipeDetail/NewRecipeDetailPage.tsx - Neubrutalism v2 Recipe Detail
import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { Alert, Tag, List, message } from 'antd';
import {
  ArrowLeftOutlined, FilePdfOutlined, LoadingOutlined,
  ClockCircleOutlined, TeamOutlined, ShareAltOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { getNewRecipeDetail, getRecipeImageUrl, getRecipeImageProxyUrl } from '../../services/api';
import { exportElementToPDF } from '../../utils/pdfExport';
import { colors } from '../../theme';
import type { NewRecipeDetail } from '../../types';

const difficultyColors: Record<string, string> = {
  '简单': '#7AE582',
  '中等': '#FFE566',
  '复杂': '#FF6B9D',
};

interface NavigationState { from?: string; }

export function NewRecipeDetailPage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const loc = useLocation();
  const recipeTitle = searchParams.get('title') || '';
  const contentRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [detail, setDetail] = useState<NewRecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!recipeId || !recipeTitle) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await getNewRecipeDetail(recipeId, recipeTitle);
      setDetail(response.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.detailFetchFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [recipeId, recipeTitle, t]);

  const fetchImage = useCallback(async () => {
    if (!recipeId) return;
    setImageLoading(true);
    setImageError(null);
    try {
      await getRecipeImageUrl(recipeId);
      setImageUrl(getRecipeImageProxyUrl(recipeId));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : t('common.imageFailed'));
    } finally {
      setImageLoading(false);
    }
  }, [recipeId, t]);

  const handleExportPdf = useCallback(async () => {
    if (!contentRef.current || !detail) return;
    setPdfLoading(true);
    try {
      await exportElementToPDF(contentRef.current, detail.title);
      message.success(t('recipeDetail.pdfSuccess'));
    } catch (err) {
      message.error(err instanceof Error ? err.message : t('recipeDetail.pdfFailed'));
    } finally {
      setPdfLoading(false);
    }
  }, [detail, t]);

  const handleBack = useCallback(() => {
    const state = loc.state as NavigationState | undefined;
    navigate(state?.from || '/recipes');
  }, [loc.state, navigate]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);
  useEffect(() => {
    if (detail && !imageUrl && !imageLoading && !imageError) fetchImage();
  }, [detail, imageUrl, imageLoading, imageError, fetchImage]);

  if (isLoading) {
    return (
      <Layout showHeader={false} showFooter={true}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          <button className="nb-btn-sm" onClick={handleBack} style={{ background: '#fff', padding: '6px 16px', cursor: 'pointer', marginBottom: 24, color: colors.ink }}>
            <ArrowLeftOutlined /> {t('recipes.backToList')}
          </button>
          <LoadingSpinner message={t('recipeDetail.loadingDetail')} subMessage={t('recipeDetail.loadingDetailHint')} size="large" />
        </div>
      </Layout>
    );
  }

  if (error || !detail) {
    return (
      <Layout showHeader={false} showFooter={true}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          <button className="nb-btn-sm" onClick={handleBack} style={{ background: '#fff', padding: '6px 16px', cursor: 'pointer', marginBottom: 24, color: colors.ink }}>
            <ArrowLeftOutlined /> {t('recipes.backToList')}
          </button>
          <Alert message={error || t('recipeDetail.recipeNotFound')} type="error" showIcon style={{ borderRadius: 16, border: `3px solid ${colors.ink}` }} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false} showFooter={true}>
      <div ref={contentRef} style={{ backgroundColor: colors.paper }}>
        {/* Hero image */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%',
            background: `linear-gradient(135deg, ${colors.candy.pink} 0%, ${colors.candy.orange} 100%)`,
            overflow: 'hidden',
          }}
        >
          {imageUrl && !imageError && (
            <img src={imageUrl} alt={detail.title} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: imageUrl ? 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)' : 'transparent' }} />

          {imageLoading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingOutlined style={{ fontSize: 40, color: '#fff', marginBottom: 12 }} />
              <span style={{ color: '#fff', fontWeight: 700 }}>{t('recipeDetail.loadingImage')}</span>
            </div>
          )}

          {!imageUrl && !imageLoading && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 100, opacity: 0.4 }}>🍽️</span>
            </div>
          )}

          {/* Back button */}
          <div data-html2canvas-ignore="true" style={{ position: 'absolute', top: 16, left: 16 }}>
            <button className="nb-btn-sm" onClick={handleBack} style={{ background: 'rgba(255,255,255,0.95)', padding: '6px 16px', cursor: 'pointer', color: colors.ink }}>
              <ArrowLeftOutlined /> {t('recipes.backToList')}
            </button>
          </div>

          {/* Title overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 24px' }}>
            <div style={{ maxWidth: 960, margin: '0 auto' }}>
              <h1 className="font-display" style={{ margin: 0, marginBottom: 12, color: imageUrl ? '#fff' : colors.ink, fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', textShadow: imageUrl ? '0 2px 8px rgba(0,0,0,0.3)' : 'none' }}>
                {detail.title}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <span className="nb-badge" style={{ background: difficultyColors[detail.difficulty] || colors.candy.yellow, color: colors.ink, padding: '4px 16px' }}>
                  {detail.difficulty}
                </span>
                <span className="nb-badge" style={{ background: 'rgba(255,255,255,0.9)', color: colors.ink, padding: '4px 16px' }}>
                  <ClockCircleOutlined /> {detail.cookingTime}
                </span>
                <span className="nb-badge" style={{ background: 'rgba(255,255,255,0.9)', color: colors.ink, padding: '4px 16px' }}>
                  <TeamOutlined /> {detail.servings}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          <article>
            {/* Description */}
            <p style={{ fontSize: 16, color: `${colors.ink}CC`, lineHeight: 1.8, marginBottom: 32 }}>
              {detail.description}
            </p>

            {/* Action buttons */}
            <div data-html2canvas-ignore="true" style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
              <button
                className="nb-btn"
                onClick={handleExportPdf}
                disabled={pdfLoading}
                style={{ background: colors.candy.orange, color: colors.ink, padding: '10px 24px', cursor: 'pointer', fontSize: 16 }}
              >
                {pdfLoading ? <LoadingOutlined /> : <FilePdfOutlined />}
                {' '}{pdfLoading ? t('recipeDetail.exporting') : t('recipeDetail.exportPdf')}
              </button>
              <button
                className="nb-btn"
                onClick={() => { navigator.clipboard.writeText(window.location.href); message.success(t('recipeDetail.linkCopied')); }}
                style={{ background: '#fff', color: colors.ink, padding: '10px 24px', cursor: 'pointer', fontSize: 16 }}
              >
                <ShareAltOutlined /> {t('recipeDetail.shareRecipe')}
              </button>
            </div>

            {/* Ingredients card */}
            <div className="nb-card" style={{ background: '#fff', padding: 24, marginBottom: 24 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, marginBottom: 20, fontSize: 22, fontWeight: 800, color: colors.ink }}>
                <span style={{ fontSize: 24 }}>🥬</span> {t('recipeDetail.ingredientList')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {detail.ingredients.map((ing, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 18px',
                      background: colors.candy.green + '20',
                      borderRadius: 14,
                      border: `2px solid ${colors.ink}`,
                    }}
                  >
                    <span style={{ color: colors.ink, fontWeight: 600 }}>
                      {ing.name}
                      {ing.note && <span style={{ marginLeft: 6, fontSize: 12, color: `${colors.ink}80` }}>({ing.note})</span>}
                    </span>
                    <Tag style={{
                      background: colors.candy.yellow,
                      color: colors.ink,
                      border: `2px solid ${colors.ink}`,
                      borderRadius: 50,
                      fontWeight: 700,
                      margin: 0,
                    }}>
                      {ing.amount}
                    </Tag>
                  </div>
                ))}
              </div>
            </div>

            {/* Cooking steps */}
            <div className="nb-card" style={{ background: '#fff', padding: 24, marginBottom: 24 }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, marginBottom: 20, fontSize: 22, fontWeight: 800, color: colors.ink }}>
                <span style={{ fontSize: 24 }}>👨‍🍳</span> {t('recipeDetail.cookingSteps')}
              </h3>
              <List
                dataSource={detail.steps}
                renderItem={(step, index) => (
                  <List.Item style={{ padding: '20px 0', borderBottom: index < detail.steps.length - 1 ? `2px dashed ${colors.ink}20` : 'none' }}>
                    <div style={{ display: 'flex', gap: 20, width: '100%' }}>
                      <div
                        className="nb-step-badge"
                        style={{ background: [colors.candy.orange, colors.candy.pink, colors.candy.blue, colors.candy.green, colors.candy.purple, colors.candy.cyan][index % 6] }}
                      >
                        {step.stepNumber}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 15, color: colors.ink, lineHeight: 1.7, margin: 0 }}>
                          {step.instruction}
                        </p>
                        {step.duration && (
                          <span className="nb-badge" style={{ background: colors.candy.blue + '30', color: colors.ink, marginTop: 10, display: 'inline-flex', padding: '2px 12px', fontSize: 13 }}>
                            <ClockCircleOutlined /> {t('recipeDetail.about', { duration: step.duration })}
                          </span>
                        )}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </div>

            {/* Tips */}
            {detail.tips && (
              <div className="nb-card" style={{ background: colors.candy.yellow + '40', padding: 24, marginBottom: 24 }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, marginBottom: 16, fontSize: 22, fontWeight: 800, color: colors.ink }}>
                  <span style={{ fontSize: 24 }}>💡</span> {t('recipeDetail.tips')}
                </h3>
                <p style={{ whiteSpace: 'pre-wrap', margin: 0, color: `${colors.ink}CC`, fontSize: 14, lineHeight: 1.8 }}>
                  {detail.tips}
                </p>
              </div>
            )}

            {/* Tags */}
            {detail.tags && detail.tags.length > 0 && (
              <div style={{ marginTop: 32, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {detail.tags.map(tag => (
                  <span key={tag} className="nb-tag" style={{ cursor: 'default', fontSize: 13, background: colors.candy.purple + '20' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        </div>
      </div>
    </Layout>
  );
}

export default NewRecipeDetailPage;
