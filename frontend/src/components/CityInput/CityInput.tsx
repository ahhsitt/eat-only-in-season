// components/CityInput/CityInput.tsx - City input component using Ant Design
// 005-page-ui-redesign: 增强搜索动画效果

import { useState, useCallback } from 'react';
import { Input, AutoComplete, Button, Space } from 'antd';
import { SearchOutlined, LoadingOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { colors } from '../../theme';

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
  const [isFocused, setIsFocused] = useState(false);

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
    <div
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        transform: isFocused ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      }}
      role="search"
    >
      <Space.Compact
        style={{
          width: '100%',
          boxShadow: isFocused
            ? `0 8px 32px ${colors.primary[300]}40`
            : `0 4px 16px ${colors.primary[200]}20`,
          borderRadius: 28,
          transition: 'box-shadow 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <AutoComplete
          value={value}
          onChange={setValue}
          onSelect={handleSelect}
          options={options.length > 0 ? [
            { label: '热门城市', options }
          ] : []}
          style={{ flex: 1 }}
          disabled={isLoading}
        >
          <Input
            placeholder="输入城市名称（如：东京、Paris、成都）"
            size="large"
            prefix={
              <EnvironmentOutlined
                style={{
                  color: isFocused ? colors.primary[400] : colors.neutral[400],
                  transition: 'color 0.2s ease',
                }}
              />
            }
            onPressEnter={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            aria-label="城市名称"
            style={{
              height: 56,
              fontSize: 16,
              borderRadius: '28px 0 0 28px',
              borderColor: isFocused ? colors.primary[300] : colors.neutral[200],
              paddingLeft: 20,
            }}
          />
        </AutoComplete>
        <Button
          type="primary"
          size="large"
          onClick={handleSearch}
          disabled={isLoading || !value.trim()}
          icon={isLoading ? <LoadingOutlined /> : <SearchOutlined />}
          className="click-scale"
          style={{
            height: 56,
            minWidth: 140,
            borderRadius: '0 28px 28px 0',
            fontSize: 16,
            fontWeight: 500,
            background: isLoading
              ? colors.neutral[300]
              : `linear-gradient(135deg, ${colors.primary[400]} 0%, ${colors.secondary[400]} 100%)`,
            border: 'none',
          }}
        >
          {isLoading ? '搜索中...' : '开始探索'}
        </Button>
      </Space.Compact>
    </div>
  );
}

export default CityInput;
