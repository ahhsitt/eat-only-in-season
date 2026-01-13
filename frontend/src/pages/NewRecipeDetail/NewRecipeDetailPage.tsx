// pages/NewRecipeDetail/NewRecipeDetailPage.tsx - 新版菜谱详情页 (Ant Design)
// 005-page-ui-redesign: 活力杂志风格菜谱详情
// 006-ux-fixes-optimization: 前端 PDF 导出 + 返回导航参数保持

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Typography, Card, Tag, Space, Button, Alert, Row, Col, List, message,
} from 'antd';
import {
  ArrowLeftOutlined, FilePdfOutlined, LoadingOutlined,
  ClockCircleOutlined, TeamOutlined, ShareAltOutlined,
} from '@ant-design/icons';
import { Layout } from '../../components/Layout/Layout';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { getNewRecipeDetail, getRecipeImageUrl, getRecipeImageProxyUrl } from '../../services/api';
import { exportElementToPDF } from '../../utils/pdfExport';
import { colors } from '../../theme';
import type { NewRecipeDetail } from '../../types';

const { Title, Text, Paragraph } = Typography;

// 难度颜色 - 活力配色
const difficultyColors: Record<string, { bg: string; text: string; border: string }> = {
  '简单': { bg: colors.success + '20', text: '#2E7D32', border: colors.success },
  '中等': { bg: colors.warning + '20', text: '#F57C00', border: colors.warning },
  '复杂': { bg: colors.primary[100], text: colors.primary[600], border: colors.primary[400] },
};

// 导航状态类型
interface NavigationState {
  from?: string;
}

export function NewRecipeDetailPage() {
  const { recipeId } = useParams<{ recipeId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const recipeTitle = searchParams.get('title') || '';

  // 用于 PDF 导出的内容区域 ref
  const contentRef = useRef<HTMLDivElement>(null);

  const [detail, setDetail] = useState<NewRecipeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 图片状态
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // PDF 导出状态
  const [pdfLoading, setPdfLoading] = useState(false);

  // 获取菜谱详情
  const fetchDetail = useCallback(async () => {
    if (!recipeId || !recipeTitle) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getNewRecipeDetail(recipeId, recipeTitle);
      setDetail(response.recipe);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取菜谱详情失败');
    } finally {
      setIsLoading(false);
    }
  }, [recipeId, recipeTitle]);

  // 自动加载图片 - 先触发生成，然后使用代理 URL
  const fetchImage = useCallback(async () => {
    if (!recipeId) return;

    setImageLoading(true);
    setImageError(null);

    try {
      // 触发图片生成（如果还没生成的话）
      await getRecipeImageUrl(recipeId);
      // 使用代理 URL 显示图片（解决跨域问题，支持 PDF 导出）
      setImageUrl(getRecipeImageProxyUrl(recipeId));
    } catch (err) {
      setImageError(err instanceof Error ? err.message : '加载图片失败');
    } finally {
      setImageLoading(false);
    }
  }, [recipeId]);

  // 导出 PDF - 使用前端 html2canvas + jsPDF 方案
  const handleExportPdf = useCallback(async () => {
    if (!contentRef.current || !detail) return;

    setPdfLoading(true);

    try {
      await exportElementToPDF(contentRef.current, detail.title);
      message.success('PDF 导出成功');
    } catch (err) {
      message.error(err instanceof Error ? err.message : 'PDF 导出失败');
      console.error('PDF export error:', err);
    } finally {
      setPdfLoading(false);
    }
  }, [detail]);

  // 返回列表 - 保持导航参数
  const handleBack = useCallback(() => {
    const state = location.state as NavigationState | undefined;
    const from = state?.from || '/recipes';
    navigate(from);
  }, [location.state, navigate]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // 详情加载完成后自动加载图片
  useEffect(() => {
    if (detail && !imageUrl && !imageLoading && !imageError) {
      fetchImage();
    }
  }, [detail, imageUrl, imageLoading, imageError, fetchImage]);

  // 加载中
  if (isLoading) {
    return (
      <Layout showHeader={false} showFooter={true}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 24 }}>
            返回菜谱列表
          </Button>
          <LoadingSpinner
            message="正在生成菜谱详情..."
            subMessage="AI 正在为您准备详细的烹饪教程"
            size="large"
          />
        </div>
      </Layout>
    );
  }

  // 错误状态
  if (error || !detail) {
    return (
      <Layout showHeader={false} showFooter={true}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={handleBack} style={{ marginBottom: 24 }}>
            返回菜谱列表
          </Button>
          <Alert
            message={error || '菜谱不存在'}
            type="error"
            showIcon
          />
        </div>
      </Layout>
    );
  }

  const diffColor = difficultyColors[detail.difficulty] || difficultyColors['中等'];

  return (
    <Layout showHeader={false} showFooter={true}>
      {/* PDF 导出内容区域 */}
      <div ref={contentRef} style={{ backgroundColor: '#FFFFFF' }}>
        {/* Hero 区域 - 图片展示（16:9 比例） */}
        <div
          className="animate-fadeIn"
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '56.25%', // 16:9 比例
            background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`,
            overflow: 'hidden',
          }}
        >
        {/* 背景图片 - 使用后端代理 URL，避免跨域问题 */}
        {imageUrl && !imageError && (
          <img
            src={imageUrl}
            alt={detail.title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        )}

        {/* 渐变遮罩 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: imageUrl
              ? 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)'
              : 'transparent',
          }}
        />

        {/* 图片加载状态 */}
        {imageLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LoadingOutlined style={{ fontSize: 40, color: colors.primary[400], marginBottom: 12 }} />
            <Text style={{ color: colors.neutral[500] }}>正在生成精美图片...</Text>
          </div>
        )}

        {/* 无图片占位 */}
        {!imageUrl && !imageLoading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 100, opacity: 0.3 }}>🍽️</span>
          </div>
        )}

        {/* 返回按钮 - PDF 导出时隐藏 */}
        <div data-html2canvas-ignore="true" style={{ position: 'absolute', top: 16, left: 16 }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            className="click-scale"
            style={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
              borderRadius: 20,
              color: colors.neutral[700],
            }}
          >
            返回列表
          </Button>
        </div>

        {/* 底部标题区 */}
        <div
          className="animate-slideUp"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '32px 24px',
          }}
        >
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <Title
              level={1}
              style={{
                margin: 0,
                marginBottom: 8,
                color: imageUrl ? '#FFFFFF' : colors.neutral[800],
                fontWeight: 700,
                textShadow: imageUrl ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {detail.title}
            </Title>
            <Space wrap size={8}>
              <Tag
                style={{
                  backgroundColor: diffColor.bg,
                  color: diffColor.text,
                  border: `1px solid ${diffColor.border}`,
                  borderRadius: 16,
                  padding: '4px 16px',
                  fontSize: 14,
                }}
              >
                {detail.difficulty}
              </Tag>
              <Tag
                icon={<ClockCircleOutlined />}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: colors.neutral[700],
                  border: 'none',
                  borderRadius: 16,
                  padding: '4px 16px',
                  fontSize: 14,
                }}
              >
                {detail.cookingTime}
              </Tag>
              <Tag
                icon={<TeamOutlined />}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: colors.neutral[700],
                  border: 'none',
                  borderRadius: 16,
                  padding: '4px 16px',
                  fontSize: 14,
                }}
              >
                {detail.servings}
              </Tag>
            </Space>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        <article>
          {/* 描述 */}
          <div
            className="animate-slideUp stagger-1"
            style={{ marginBottom: 32 }}
          >
            <Paragraph
              style={{
                fontSize: 16,
                color: colors.neutral[600],
                lineHeight: 1.8,
                margin: 0,
              }}
            >
              {detail.description}
            </Paragraph>
          </div>

          {/* 操作按钮 - 活力风格 */}
          <div
            className="animate-slideUp stagger-2"
            style={{
              display: 'flex',
              gap: 12,
              marginBottom: 32,
            }}
          >
            <Button
              type="primary"
              icon={pdfLoading ? <LoadingOutlined /> : <FilePdfOutlined />}
              onClick={handleExportPdf}
              loading={pdfLoading}
              className="click-scale"
              style={{
                background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.secondary[400]} 100%)`,
                border: 'none',
                borderRadius: 20,
                height: 44,
                paddingLeft: 24,
                paddingRight: 24,
              }}
            >
              {pdfLoading ? '导出中...' : '导出 PDF'}
            </Button>
            <Button
              icon={<ShareAltOutlined />}
              className="click-scale"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                message.success('链接已复制到剪贴板');
              }}
              style={{
                borderColor: colors.primary[300],
                color: colors.primary[500],
                borderRadius: 20,
                height: 44,
              }}
            >
              分享菜谱
            </Button>
          </div>

          {/* 食材清单 - 彩色标签设计 */}
          <Card
            className="animate-slideUp stagger-3"
            title={
              <Space>
                <span style={{ fontSize: 20 }}>🥬</span>
                <span style={{ fontWeight: 600, color: colors.neutral[800] }}>食材清单</span>
              </Space>
            }
            style={{
              marginBottom: 24,
              borderRadius: 20,
              border: `1px solid ${colors.neutral[200]}`,
            }}
            styles={{ header: { borderBottom: `1px solid ${colors.neutral[100]}` } }}
          >
            <Row gutter={[12, 12]}>
              {detail.ingredients.map((ing, index) => (
                <Col
                  key={index}
                  xs={24}
                  sm={12}
                  className="animate-fadeIn"
                  style={{
                    animationDelay: `${index * 0.03}s`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div
                    className="hover-lift"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '14px 18px',
                      background: `linear-gradient(135deg, ${colors.primary[50]} 0%, ${colors.secondary[50]} 100%)`,
                      borderRadius: 14,
                      border: `1px solid ${colors.primary[100]}`,
                    }}
                  >
                    <Text style={{ color: colors.neutral[700], fontWeight: 500 }}>
                      {ing.name}
                      {ing.note && (
                        <Text style={{ marginLeft: 6, fontSize: 12, color: colors.neutral[400] }}>
                          ({ing.note})
                        </Text>
                      )}
                    </Text>
                    <Tag
                      style={{
                        backgroundColor: colors.primary[100],
                        color: colors.primary[600],
                        borderColor: colors.primary[200],
                        borderRadius: 12,
                        margin: 0,
                      }}
                    >
                      {ing.amount}
                    </Tag>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>

          {/* 烹饪步骤 - 设计感步骤编号 */}
          <Card
            className="animate-slideUp stagger-4"
            title={
              <Space>
                <span style={{ fontSize: 20 }}>👨‍🍳</span>
                <span style={{ fontWeight: 600, color: colors.neutral[800] }}>烹饪步骤</span>
              </Space>
            }
            style={{
              marginBottom: 24,
              borderRadius: 20,
              border: `1px solid ${colors.neutral[200]}`,
            }}
            styles={{ header: { borderBottom: `1px solid ${colors.neutral[100]}` } }}
          >
            <List
              dataSource={detail.steps}
              renderItem={(step, index) => (
                <List.Item
                  className="animate-slideUp"
                  style={{
                    padding: '20px 0',
                    borderBottom: index < detail.steps.length - 1 ? `1px solid ${colors.neutral[100]}` : 'none',
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: 'backwards',
                  }}
                >
                  <div style={{ display: 'flex', gap: 20, width: '100%' }}>
                    {/* 步骤编号 - 设计感 */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        background: `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.secondary[400]} 100%)`,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        fontWeight: 700,
                        boxShadow: `0 4px 12px ${colors.primary[300]}40`,
                      }}
                    >
                      {step.stepNumber}
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, color: colors.neutral[700], lineHeight: 1.7 }}>
                        {step.instruction}
                      </Text>
                      {step.duration && (
                        <Tag
                          icon={<ClockCircleOutlined />}
                          style={{
                            marginTop: 10,
                            backgroundColor: colors.neutral[100],
                            color: colors.neutral[500],
                            border: 'none',
                            borderRadius: 12,
                          }}
                        >
                          约 {step.duration}
                        </Tag>
                      )}
                    </div>
                  </div>
                </List.Item>
              )}
            />
          </Card>

          {/* 小贴士 - 卡片式展示 */}
          {detail.tips && (
            <Card
              className="animate-slideUp stagger-5"
              title={
                <Space>
                  <span style={{ fontSize: 20 }}>💡</span>
                  <span style={{ fontWeight: 600, color: colors.neutral[800] }}>小贴士</span>
                </Space>
              }
              style={{
                borderRadius: 20,
                background: `linear-gradient(135deg, ${colors.accent[50]} 0%, ${colors.primary[50]} 100%)`,
                border: `1px solid ${colors.accent[200]}`,
              }}
              styles={{
                header: { borderBottom: `1px solid ${colors.accent[100]}` },
                body: { padding: 24 },
              }}
            >
              <Paragraph
                style={{
                  whiteSpace: 'pre-wrap',
                  margin: 0,
                  color: colors.neutral[600],
                  fontSize: 14,
                  lineHeight: 1.8,
                }}
              >
                {detail.tips}
              </Paragraph>
            </Card>
          )}

          {/* 标签区 */}
          {detail.tags && detail.tags.length > 0 && (
            <div className="animate-slideUp stagger-6" style={{ marginTop: 32 }}>
              <Space wrap size={[8, 8]}>
                {detail.tags.map((tag, index) => (
                  <Tag
                    key={tag}
                    className="animate-bounceIn"
                    style={{
                      animationDelay: `${index * 0.05}s`,
                      backgroundColor: colors.neutral[100],
                      color: colors.neutral[600],
                      borderRadius: 16,
                      padding: '4px 14px',
                      border: 'none',
                    }}
                  >
                    #{tag}
                  </Tag>
                ))}
              </Space>
            </div>
          )}
        </article>
      </div>
      </div>
    </Layout>
  );
}

export default NewRecipeDetailPage;
