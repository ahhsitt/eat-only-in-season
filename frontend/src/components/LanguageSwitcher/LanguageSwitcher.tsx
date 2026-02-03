// components/LanguageSwitcher/LanguageSwitcher.tsx - Language toggle button

import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(next);
  };

  return (
    <button
      onClick={toggle}
      className="nb-btn-sm"
      style={{
        background: '#FFFFFF',
        padding: '6px 14px',
        fontSize: 14,
        cursor: 'pointer',
        color: '#1A1A2E',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {i18n.language === 'zh' ? 'EN' : '中'}
    </button>
  );
}

export default LanguageSwitcher;
