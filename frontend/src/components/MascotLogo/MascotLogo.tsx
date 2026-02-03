// components/MascotLogo/MascotLogo.tsx - Cute orange mascot SVG logo

interface MascotLogoProps {
  size?: number;
}

export function MascotLogo({ size = 50 }: MascotLogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 50 50" className="group-hover:animate-wiggle" style={{ display: 'block' }}>
      {/* Face */}
      <circle cx="25" cy="25" r="22" fill="#FF9F43" stroke="#1A1A2E" strokeWidth="3"/>
      {/* Blush */}
      <circle cx="12" cy="28" r="4" fill="#FF6B9D" opacity="0.6"/>
      <circle cx="38" cy="28" r="4" fill="#FF6B9D" opacity="0.6"/>
      {/* Eyes */}
      <g>
        <circle cx="17" cy="22" r="6" fill="white" stroke="#1A1A2E" strokeWidth="2"/>
        <circle cx="18" cy="22" r="3" fill="#1A1A2E"/>
        <circle cx="19" cy="20" r="1" fill="white"/>
      </g>
      <g>
        <circle cx="33" cy="22" r="6" fill="white" stroke="#1A1A2E" strokeWidth="2"/>
        <circle cx="34" cy="22" r="3" fill="#1A1A2E"/>
        <circle cx="35" cy="20" r="1" fill="white"/>
      </g>
      {/* Smile */}
      <path d="M18 32 Q25 38 32 32" stroke="#1A1A2E" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Leaf on top */}
      <ellipse cx="25" cy="5" rx="6" ry="4" fill="#7AE582" stroke="#1A1A2E" strokeWidth="2" transform="rotate(-20 25 5)"/>
    </svg>
  );
}

export default MascotLogo;
