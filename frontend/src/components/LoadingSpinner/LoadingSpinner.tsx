// components/LoadingSpinner/LoadingSpinner.tsx - Neubrutalism v2 loading
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
  size?: 'small' | 'default' | 'large';
}

export function LoadingSpinner({
  message,
  subMessage,
  size = 'default'
}: LoadingSpinnerProps) {
  const { t } = useTranslation();
  const displayMessage = message || t('common.loading');
  const dotSize = size === 'large' ? 20 : size === 'small' ? 10 : 14;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 0',
      }}
    >
      {/* Bouncing dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="animate-bounce-slow"
            style={{
              width: dotSize,
              height: dotSize,
              borderRadius: '50%',
              border: '3px solid #1A1A2E',
              background: ['#FF9F43', '#FF6B9D', '#5DADE2'][i],
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
      <p style={{ color: '#1A1A2E', fontWeight: 700, fontSize: 16, margin: 0 }}>{displayMessage}</p>
      {subMessage && (
        <p style={{ fontSize: 14, color: '#6C757D', marginTop: 8, margin: '8px 0 0 0' }}>
          {subMessage}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner;
