// components/SeasonBadge/SeasonBadge.tsx - Season display badge using Ant Design Tag

import { Tag } from 'antd';
import type { SeasonId } from '../../types';
import { SeasonNames } from '../../types';

interface SeasonBadgeProps {
  seasonId: SeasonId;
  size?: 'small' | 'default' | 'large';
  showIcon?: boolean;
}

const seasonIcons: Record<SeasonId, string> = {
  spring: '🌸',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
};

const seasonColors: Record<SeasonId, { bg: string; text: string; border: string }> = {
  spring: { bg: '#F5E6E8', text: '#8B6B6B', border: '#E8C6CA' },
  summer: { bg: '#F5F0E6', text: '#8B7B5B', border: '#E8DCC6' },
  autumn: { bg: '#F5EBE6', text: '#8B6B5B', border: '#E8D6C6' },
  winter: { bg: '#E6EBF0', text: '#5B6B8B', border: '#C6D1E8' },
};

export function SeasonBadge({ seasonId, size = 'default', showIcon = true }: SeasonBadgeProps) {
  const colors = seasonColors[seasonId];

  const fontSize = size === 'large' ? 16 : size === 'small' ? 12 : 14;
  const padding = size === 'large' ? '4px 12px' : size === 'small' ? '0 6px' : '2px 8px';

  return (
    <Tag
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
        fontSize,
        padding,
        borderRadius: 999,
        margin: 0,
      }}
    >
      {showIcon && <span style={{ marginRight: 4 }}>{seasonIcons[seasonId]}</span>}
      {SeasonNames[seasonId]}
    </Tag>
  );
}

export default SeasonBadge;
