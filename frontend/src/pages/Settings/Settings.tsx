// pages/Settings/Settings.tsx - Neubrutalism v2 Settings
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Input, message } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../components/Layout/Layout';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { colors } from '../../theme';

const { TextArea } = Input;
const MAX_PREFERENCE_LENGTH = 200;

export function Settings() {
  const { preference, updatePreferenceText, clearPreferences } = useLocalStorage();
  const [text, setText] = useState(preference.preferenceText || '');
  const { t, i18n } = useTranslation();

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length <= MAX_PREFERENCE_LENGTH) setText(e.target.value);
  }, []);

  const handleSave = useCallback(() => {
    updatePreferenceText(text);
    message.success(t('settings.saved'));
  }, [text, updatePreferenceText, t]);

  const handleClear = useCallback(() => {
    clearPreferences();
    setText('');
    message.info(t('settings.cleared'));
  }, [clearPreferences, t]);

  return (
    <Layout showHeader={false} showFooter={true}>
      {/* Header */}
      <div style={{ background: colors.candy.yellow, borderBottom: `4px solid ${colors.ink}`, padding: '16px 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <Link to="/">
            <button className="nb-btn-sm" style={{ background: '#fff', padding: '6px 16px', cursor: 'pointer', marginBottom: 12, color: colors.ink }}>
              <ArrowLeftOutlined /> {t('recipes.backToHome')}
            </button>
          </Link>
          <h2 className="font-display" style={{ margin: 0, fontSize: 28, color: colors.ink }}>{t('settings.title')}</h2>
          <p style={{ color: `${colors.ink}80`, fontWeight: 600, margin: '4px 0 0 0' }}>{t('settings.subtitle')}</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
        {/* Preference card */}
        <div className="nb-card" style={{ background: '#fff', padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 800, color: colors.ink }}>
            {t('settings.preferenceTitle')}
          </h3>
          <p style={{ color: `${colors.ink}80`, marginBottom: 12 }}>{t('settings.preferenceDesc')}</p>
          <ul style={{ color: `${colors.ink}80`, paddingLeft: 20, marginBottom: 16 }}>
            <li>{t('settings.example1')}</li>
            <li>{t('settings.example2')}</li>
            <li>{t('settings.example3')}</li>
            <li>{t('settings.example4')}</li>
          </ul>
          <TextArea
            value={text}
            onChange={handleTextChange}
            placeholder={t('settings.placeholder')}
            rows={4}
            showCount
            maxLength={MAX_PREFERENCE_LENGTH}
            className="nb-input"
            style={{ marginBottom: 16 }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="nb-btn" onClick={handleSave} style={{ background: colors.candy.green, color: colors.ink, padding: '10px 24px', cursor: 'pointer', fontSize: 16 }}>
              <SaveOutlined /> {t('settings.save')}
            </button>
            <button className="nb-btn" onClick={handleClear} style={{ background: '#fff', color: colors.ink, padding: '10px 24px', cursor: 'pointer', fontSize: 16 }}>
              <DeleteOutlined /> {t('settings.clear')}
            </button>
          </div>
        </div>

        {/* Language setting */}
        <div className="nb-card" style={{ background: colors.candy.cyan + '20', padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 800, color: colors.ink }}>
            🌐 {t('settings.language')}
          </h3>
          <p style={{ color: `${colors.ink}80`, marginBottom: 16 }}>{t('settings.languageDesc')}</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className={`nb-tag ${i18n.language === 'zh' ? 'selected' : ''}`}
              onClick={() => i18n.changeLanguage('zh')}
              style={{ fontSize: 16, padding: '8px 24px' }}
            >
              🇨🇳 中文
            </button>
            <button
              className={`nb-tag ${i18n.language === 'en' ? 'selected' : ''}`}
              onClick={() => i18n.changeLanguage('en')}
              style={{ fontSize: 16, padding: '8px 24px' }}
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        {/* About card */}
        <div className="nb-card" style={{ background: colors.candy.purple + '15', padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: 0, marginBottom: 12, fontSize: 20, fontWeight: 800, color: colors.ink }}>
            {t('settings.aboutTitle')}
          </h3>
          <ul style={{ color: `${colors.ink}CC`, paddingLeft: 20, margin: 0, lineHeight: 2 }}>
            <li>{t('settings.aboutDesc1')}</li>
            <li>{t('settings.aboutDesc2')}</li>
            <li>{t('settings.aboutDesc3')}</li>
            <li>{t('settings.aboutDesc4')}</li>
          </ul>
        </div>

        {/* Saved city */}
        {preference.cityName && (
          <div className="nb-card" style={{ background: colors.candy.green + '20', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <EnvironmentOutlined style={{ color: colors.ink, fontSize: 18 }} />
              <span style={{ fontWeight: 800, color: colors.ink }}>{t('settings.savedCity')}</span>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: colors.ink, margin: '0 0 4px 0' }}>
              {preference.cityName}
            </p>
            <span style={{ fontSize: 13, color: `${colors.ink}80` }}>
              {t('settings.lastUpdated', { date: new Date(preference.updatedAt).toLocaleString(i18n.language === 'zh' ? 'zh-CN' : 'en-US') })}
            </span>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Settings;
