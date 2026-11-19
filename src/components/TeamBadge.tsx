import React from 'react';
import { Team } from '../types/game';
import { NationalFlagSvg } from './NationalFlagSvg';

interface TeamBadgeProps {
  team: Team;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', text: 'text-[8px]' },
  sm: { box: 'w-8 h-8', text: 'text-[9px]' },
  md: { box: 'w-11 h-11', text: 'text-[11px]' },
  lg: { box: 'w-16 h-16', text: 'text-sm' },
  xl: { box: 'w-20 h-20', text: 'text-base' },
};

export const TeamBadge: React.FC<TeamBadgeProps> = ({ team, size = 'md', className = '' }) => {
  const { box, text } = SIZE_MAP[size];
  const uid = `${team.id}_${size}`;
  const isLightPrimary =
    team.primaryColor.toUpperCase() === '#F8FAFC' ||
    team.primaryColor.toUpperCase() === '#EAB308' ||
    team.primaryColor.toUpperCase() === '#F59E0B' ||
    team.primaryColor.toUpperCase() === '#38BDF8';
  const labelColor = isLightPrimary ? '#0F172A' : '#F8FAFC';

  if (team.isNational) {
    // Crisp circular authentic national flag icon
    return (
      <div
        className={`relative inline-flex shrink-0 items-center justify-center ${box} ${className}`}
        aria-hidden="true"
      >
        <NationalFlagSvg
          flagCode={team.flagCode}
          primaryColor={team.primaryColor}
          secondaryColor={team.secondaryColor}
          accentColor={team.accentColor}
          uid={uid}
        />
      </div>
    );
  }

  // Club crest shield with vertical / diagonal kit identity
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center ${box} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 48 52" className="w-full h-full drop-shadow-sm">
        <defs>
          <clipPath id={`club_${uid}`}>
            <path d="M24 3 L43 9 V25 C43 37 34 45 24 49 C14 45 5 37 5 25 V9 Z" />
          </clipPath>
        </defs>
        <g clipPath={`url(#club_${uid})`}>
          <rect x="4" y="2" width="40" height="48" fill={team.primaryColor} />
          <rect x="24" y="2" width="20" height="48" fill={team.secondaryColor} opacity="0.85" />
          {team.accentColor && (
            <polygon points="4,40 44,18 44,26 4,48" fill={team.accentColor} opacity="0.8" />
          )}
          <rect x="4" y="16" width="40" height="17" fill="rgba(8,14,26,0.72)" />
        </g>
        <path
          d="M24 3 L43 9 V25 C43 37 34 45 24 49 C14 45 5 37 5 25 V9 Z"
          fill="none"
          stroke={labelColor === '#0F172A' ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.32)'}
          strokeWidth="2"
        />
        <text
          x="24"
          y="28.5"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="Barlow Condensed, sans-serif"
          fontWeight="800"
          className={text}
          fontSize="13"
          letterSpacing="0.8"
        >
          {team.shortName}
        </text>
      </svg>
    </div>
  );
};
