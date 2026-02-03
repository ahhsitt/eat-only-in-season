// components/Layout/Layout.tsx - Neubrutalism v2 layout
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout as AntLayout } from 'antd';
import { MascotLogo } from '../MascotLogo/MascotLogo';
import { LanguageSwitcher } from '../LanguageSwitcher/LanguageSwitcher';
import { colors } from '../../theme';

const { Content } = AntLayout;

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function Layout({ children, showHeader = true, showFooter = true }: LayoutProps) {
  const location = useLocation();
  const { t } = useTranslation();

  return (
    <AntLayout style={{ minHeight: '100vh', background: colors.paper }}>
      {showHeader && (
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            background: colors.candy.yellow,
            borderBottom: `4px solid ${colors.ink}`,
          }}
        >
          <div
            style={{
              maxWidth: 1152,
              margin: '0 auto',
              padding: '12px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }} className="group">
              <MascotLogo size={44} />
              <span className="font-display" style={{ fontSize: 22, color: colors.ink }}>
                {t('common.appName')}
              </span>
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div className="deco-hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <Link
                  to="/"
                  style={{
                    color: colors.ink,
                    fontWeight: 700,
                    textDecoration: 'none',
                    borderBottom: location.pathname === '/' ? `3px solid ${colors.candy.pink}` : '3px solid transparent',
                    paddingBottom: 2,
                  }}
                >
                  {t('nav.discover')}
                </Link>
                <Link
                  to="/settings"
                  style={{
                    color: colors.ink,
                    fontWeight: 700,
                    textDecoration: 'none',
                    borderBottom: location.pathname === '/settings' ? `3px solid ${colors.candy.pink}` : '3px solid transparent',
                    paddingBottom: 2,
                  }}
                >
                  {t('nav.settings')}
                </Link>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>
      )}

      <Content style={{ flex: 1 }}>
        {children}
      </Content>

      {showFooter && (
        <footer style={{ background: colors.candy.purple, padding: '36px 24px' }}>
          <div
            style={{
              maxWidth: 1152,
              margin: '0 auto',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <MascotLogo size={36} />
              <span className="font-display" style={{ fontSize: 20, color: '#FFFFFF' }}>
                {t('common.appName')}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{t('common.about')}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>{t('common.features')}</span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 14, margin: 0 }}>
              © 2025 {t('common.footer')} 💛
            </p>
          </div>
        </footer>
      )}

      {/* Decorative background elements */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }} className="deco-hidden-mobile">
        <div className="deco-star animate-spin-slow" style={{ position: 'absolute', top: 80, left: 40, width: 32, height: 32, background: colors.candy.pink, opacity: 0.5 }} />
        <div className="animate-bounce-slow" style={{ position: 'absolute', top: 160, right: 80, width: 24, height: 24, background: colors.candy.cyan, borderRadius: '50%', opacity: 0.5 }} />
        <div className="deco-star animate-wiggle" style={{ position: 'absolute', top: 240, left: '25%', width: 40, height: 40, background: colors.candy.yellow, opacity: 0.4 }} />
        <div className="animate-float" style={{ position: 'absolute', bottom: 160, right: '33%', width: 32, height: 32, background: colors.candy.purple, borderRadius: '50%', opacity: 0.4 }} />
      </div>
    </AntLayout>
  );
}

export default Layout;
