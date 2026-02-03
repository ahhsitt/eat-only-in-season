// components/CityInput/CityInput.tsx - Neubrutalism v2 city search input
import { useState, useCallback } from 'react';
import { AutoComplete, Input } from 'antd';
import { useTranslation } from 'react-i18next';

interface CityInputProps {
  initialValue?: string;
  onSearch: (cityName: string) => void;
  isLoading?: boolean;
  suggestions?: string[];
}

export function CityInput({
  initialValue = '',
  onSearch,
  isLoading = false,
  suggestions = [],
}: CityInputProps) {
  const [value, setValue] = useState(initialValue);
  const { t } = useTranslation();

  const handleSearch = useCallback(() => {
    if (value.trim()) {
      onSearch(value.trim());
    }
  }, [value, onSearch]);

  const handleSelect = useCallback((selected: string) => {
    setValue(selected);
    onSearch(selected);
  }, [onSearch]);

  const options = suggestions.map(suggestion => ({
    value: suggestion,
    label: suggestion,
  }));

  return (
    <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }} role="search">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', fontSize: 24, zIndex: 1 }}>📍</span>
          <AutoComplete
            value={value}
            onChange={setValue}
            onSelect={handleSelect}
            options={options.length > 0 ? [{ label: t('home.popular'), options }] : []}
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            <Input
              placeholder={t('home.searchPlaceholder')}
              size="large"
              onPressEnter={handleSearch}
              className="nb-input"
              aria-label={t('home.searchPlaceholder')}
              style={{
                height: 56,
                fontSize: 18,
                paddingLeft: 56,
                paddingRight: 20,
                fontWeight: 600,
                background: 'white',
              }}
            />
          </AutoComplete>
        </div>
        <button
          className="nb-btn"
          onClick={handleSearch}
          disabled={isLoading || !value.trim()}
          style={{
            background: '#FF9F43',
            color: '#1A1A2E',
            padding: '14px 32px',
            fontSize: 18,
            cursor: isLoading || !value.trim() ? 'not-allowed' : 'pointer',
            opacity: isLoading || !value.trim() ? 0.6 : 1,
            width: '100%',
          }}
        >
          {isLoading ? t('home.searching') : `${t('home.searchButton')} 🚀`}
        </button>
      </div>
    </div>
  );
}

export default CityInput;
