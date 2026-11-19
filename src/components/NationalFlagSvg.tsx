import React from 'react';

interface NationalFlagSvgProps {
  flagCode?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  uid: string;
}

/**
 * Crisp 100% offline circular SVG national flag renderer covering all national teams
 * in the championship dataset. Rendered inside a 48x48 viewBox clipped to a circle.
 */
export const NationalFlagSvg: React.FC<NationalFlagSvgProps> = ({
  flagCode,
  primaryColor,
  secondaryColor,
  accentColor,
  uid,
}) => {
  const code = (flagCode ?? '').toUpperCase();

  const renderFlagArtwork = () => {
    switch (code) {
      // === AFC ===
      case 'VN': // Vietnam: Red field + iconic golden 5-pointed star
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#DA251D" />
            <polygon
              points="24,11 27.3,20.5 37.3,20.7 29.3,26.8 32.2,36.5 24,30.7 15.8,36.5 18.7,26.8 10.7,20.7 20.7,20.5"
              fill="#FFCD00"
            />
          </>
        );
      case 'JP': // Japan: White + crimson sun disc
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#FFFFFF" />
            <circle cx="24" cy="24" r="11.5" fill="#BC002D" />
          </>
        );
      case 'KR': // South Korea: White + red/blue Taegeuk + 4 trigrams
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#FFFFFF" />
            <circle cx="24" cy="24" r="9.5" fill="#CD2E3A" />
            <path d="M14.5,24 A9.5,9.5 0 0,0 33.5,24 A4.75,4.75 0 0,1 24,24 A4.75,4.75 0 0,0 14.5,24 Z" fill="#0047A0" />
            <g stroke="#111827" strokeWidth="1.8">
              <line x1="9" y1="13" x2="14" y2="8" />
              <line x1="11.5" y1="15.5" x2="16.5" y2="10.5" />
              <line x1="34" y1="8" x2="39" y2="13" />
              <line x1="31.5" y1="10.5" x2="36.5" y2="15.5" />
              <line x1="9" y1="35" x2="14" y2="40" />
              <line x1="11.5" y1="32.5" x2="16.5" y2="37.5" />
              <line x1="34" y1="40" x2="39" y2="35" />
              <line x1="31.5" y1="37.5" x2="36.5" y2="32.5" />
            </g>
          </>
        );
      case 'ID': // Indonesia: Red over White
        return (
          <>
            <rect x="0" y="0" width="48" height="24" fill="#CE1126" />
            <rect x="0" y="24" width="48" height="24" fill="#FFFFFF" />
          </>
        );
      case 'TH': // Thailand: Red-White-Blue-White-Red
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#A51931" />
            <rect x="0" y="8" width="48" height="32" fill="#F4F5F8" />
            <rect x="0" y="15.5" width="48" height="17" fill="#2D2A4A" />
          </>
        );
      case 'MY': // Malaysia: Stripes + blue canton with yellow crescent & star
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#FFFFFF" />
            {[0, 8, 16, 24, 32, 40].map((y) => (
              <rect key={y} x="0" y={y} width="48" height="4" fill="#CC0001" />
            ))}
            <rect x="0" y="0" width="26" height="24" fill="#010066" />
            <circle cx="12" cy="12" r="6" fill="#FFCC00" />
            <circle cx="14.2" cy="12" r="4.8" fill="#010066" />
            <circle cx="18.5" cy="12" r="2.2" fill="#FFCC00" />
          </>
        );
      case 'CN': // China: Red + large & small yellow stars
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#DE2910" />
            <polygon
              points="14,11 15.8,16.5 21.5,16.5 16.9,19.8 18.6,25.2 14,21.9 9.4,25.2 11.1,19.8 6.5,16.5 12.2,16.5"
              fill="#FFDE00"
            />
            <circle cx="24" cy="10" r="1.6" fill="#FFDE00" />
            <circle cx="27" cy="14" r="1.6" fill="#FFDE00" />
            <circle cx="27" cy="19.5" r="1.6" fill="#FFDE00" />
            <circle cx="24" cy="23.5" r="1.6" fill="#FFDE00" />
          </>
        );
      case 'AU': // Australia: Deep blue + Union canton + stars
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#00008B" />
            <rect x="0" y="0" width="24" height="24" fill="#012169" />
            <path d="M0,0 L24,24 M24,0 L0,24" stroke="#FFFFFF" strokeWidth="4" />
            <path d="M0,0 L24,24 M24,0 L0,24" stroke="#C8102E" strokeWidth="2" />
            <path d="M12,0 V24 M0,12 H24" stroke="#FFFFFF" strokeWidth="6" />
            <path d="M12,0 V24 M0,12 H24" stroke="#C8102E" strokeWidth="3.5" />
            <circle cx="13" cy="35" r="3.2" fill="#FFFFFF" />
            <circle cx="35" cy="14" r="1.8" fill="#FFFFFF" />
            <circle cx="40" cy="22" r="1.8" fill="#FFFFFF" />
            <circle cx="32" cy="24" r="1.8" fill="#FFFFFF" />
            <circle cx="36" cy="35" r="2.2" fill="#FFFFFF" />
          </>
        );
      case 'IR': // Iran: Green-White-Red + red emblem
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#239F40" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#DA0000" />
            <circle cx="24" cy="24" r="4.5" fill="none" stroke="#DA0000" strokeWidth="2" />
            <line x1="24" y1="19" x2="24" y2="29" stroke="#DA0000" strokeWidth="1.8" />
          </>
        );
      case 'IQ': // Iraq: Red-White-Black + green emblem
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#CE1126" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#111827" />
            <rect x="14" y="22" width="20" height="4" rx="1" fill="#007A3D" />
          </>
        );
      case 'SA': // Saudi Arabia: Green + white sword & calligraphy bar
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#006C35" />
            <rect x="11" y="18" width="26" height="4.5" rx="1.5" fill="#FFFFFF" />
            <rect x="13" y="27" width="22" height="2.4" rx="1" fill="#FFFFFF" />
          </>
        );
      case 'QA': // Qatar: White hoist + maroon serrated field
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#8A1538" />
            <polygon
              points="0,0 15,0 19,4 15,8 19,12 15,16 19,20 15,24 19,28 15,32 19,36 15,40 19,44 15,48 0,48"
              fill="#FFFFFF"
            />
          </>
        );
      case 'BH': // Bahrain: White hoist + crimson serrated field
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#CE1126" />
            <polygon
              points="0,0 14,0 20,6 14,12 20,18 14,24 20,30 14,36 20,42 14,48 0,48"
              fill="#FFFFFF"
            />
          </>
        );
      case 'UZ': // Uzbekistan: Blue-White-Green with thin red fimbriations
        return (
          <>
            <rect x="0" y="0" width="48" height="15" fill="#0099B5" />
            <rect x="0" y="15" width="48" height="2" fill="#CE1126" />
            <rect x="0" y="17" width="48" height="14" fill="#FFFFFF" />
            <rect x="0" y="31" width="48" height="2" fill="#CE1126" />
            <rect x="0" y="33" width="48" height="15" fill="#1EB53A" />
            <circle cx="13" cy="8.5" r="3.8" fill="#FFFFFF" />
            <circle cx="14.5" cy="8.5" r="3" fill="#0099B5" />
          </>
        );
      case 'AE': // UAE: Vertical red bar + Green-White-Black
        return (
          <>
            <rect x="14" y="0" width="34" height="16" fill="#00732F" />
            <rect x="14" y="16" width="34" height="16" fill="#FFFFFF" />
            <rect x="14" y="32" width="34" height="16" fill="#111827" />
            <rect x="0" y="0" width="15" height="48" fill="#FF0000" />
          </>
        );
      case 'JO': // Jordan: Black-White-Green + red triangle + white star
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#111827" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#007A3D" />
            <polygon points="0,0 24,24 0,48" fill="#CE1126" />
            <circle cx="9" cy="24" r="2.6" fill="#FFFFFF" />
          </>
        );
      case 'PS': // Palestine: Black-White-Green + red triangle
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#111827" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#007A3D" />
            <polygon points="0,0 22,24 0,48" fill="#CE1126" />
          </>
        );
      case 'OM': // Oman: Red vertical + White-Red-Green
        return (
          <>
            <rect x="14" y="0" width="34" height="16" fill="#FFFFFF" />
            <rect x="14" y="16" width="34" height="16" fill="#DB161B" />
            <rect x="14" y="32" width="34" height="16" fill="#008000" />
            <rect x="0" y="0" width="15" height="48" fill="#DB161B" />
          </>
        );
      case 'SY': // Syria: Red-White-Black + 2 green stars
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#CE1126" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#111827" />
            <circle cx="18" cy="24" r="2.6" fill="#007A3D" />
            <circle cx="30" cy="24" r="2.6" fill="#007A3D" />
          </>
        );
      case 'TJ': // Tajikistan: Red-White-Green + gold crown
        return (
          <>
            <rect x="0" y="0" width="48" height="14" fill="#CC0000" />
            <rect x="0" y="14" width="48" height="20" fill="#FFFFFF" />
            <rect x="0" y="34" width="48" height="14" fill="#006600" />
            <path d="M18,27 Q24,20 30,27" fill="none" stroke="#F8C300" strokeWidth="2.4" />
            <circle cx="24" cy="21" r="1.6" fill="#F8C300" />
          </>
        );
      case 'IN': // India: Saffron-White-Green + navy wheel
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#FF9933" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#138808" />
            <circle cx="24" cy="24" r="5" fill="none" stroke="#000080" strokeWidth="1.7" />
            <circle cx="24" cy="24" r="1.2" fill="#000080" />
          </>
        );
      case 'LB': // Lebanon: Red-White-Red + green cedar
        return (
          <>
            <rect x="0" y="0" width="48" height="12" fill="#ED1C24" />
            <rect x="0" y="12" width="48" height="24" fill="#FFFFFF" />
            <rect x="0" y="36" width="48" height="12" fill="#ED1C24" />
            <polygon points="24,15 31,29 17,29" fill="#00A651" />
            <rect x="22.5" y="29" width="3" height="4" fill="#00A651" />
          </>
        );
      case 'KG': // Kyrgyzstan: Red + golden sun
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#E8112D" />
            <circle cx="24" cy="24" r="9" fill="#FFEF00" />
            <circle cx="24" cy="24" r="6" fill="none" stroke="#E8112D" strokeWidth="1.5" />
          </>
        );
      case 'HK': // Hong Kong: Red + white Bauhinia petals
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#DE2910" />
            <circle cx="24" cy="17" r="3.4" fill="#FFFFFF" />
            <circle cx="30.5" cy="21.5" r="3.4" fill="#FFFFFF" />
            <circle cx="28" cy="29.5" r="3.4" fill="#FFFFFF" />
            <circle cx="20" cy="29.5" r="3.4" fill="#FFFFFF" />
            <circle cx="17.5" cy="21.5" r="3.4" fill="#FFFFFF" />
          </>
        );

      // === UEFA ===
      case 'DE': // Germany: Black-Red-Gold
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#111827" />
            <rect x="0" y="16" width="48" height="16" fill="#DD0000" />
            <rect x="0" y="32" width="48" height="16" fill="#FFCE00" />
          </>
        );
      case 'FR': // France: Vertical Blue-White-Red
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#002395" />
            <rect x="16" y="0" width="16" height="48" fill="#FFFFFF" />
            <rect x="32" y="0" width="16" height="48" fill="#ED2939" />
          </>
        );
      case 'ES': // Spain: Red-Yellow-Red + coat accent
        return (
          <>
            <rect x="0" y="0" width="48" height="12" fill="#AA151B" />
            <rect x="0" y="12" width="48" height="24" fill="#F1BF00" />
            <rect x="0" y="36" width="48" height="12" fill="#AA151B" />
            <rect x="12" y="19" width="7" height="10" rx="1.5" fill="#AA151B" />
            <circle cx="15.5" cy="24" r="1.8" fill="#F1BF00" />
          </>
        );
      case 'GB-ENG': // England: White + St George's Red Cross
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#FFFFFF" />
            <rect x="20" y="0" width="8" height="48" fill="#CE1124" />
            <rect x="0" y="20" width="48" height="8" fill="#CE1124" />
          </>
        );
      case 'GB-SCT': // Scotland: Blue + white St Andrew's Saltire
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#005EB8" />
            <path d="M0,0 L48,48 M48,0 L0,48" stroke="#FFFFFF" strokeWidth="8.5" />
          </>
        );
      case 'GB-WLS': // Wales: White over Green + red dragon emblem
        return (
          <>
            <rect x="0" y="0" width="48" height="24" fill="#FFFFFF" />
            <rect x="0" y="24" width="48" height="24" fill="#00AD36" />
            <path d="M13,28 Q20,16 33,19 Q29,26 35,31 Q24,33 13,28 Z" fill="#D30731" />
          </>
        );
      case 'IT': // Italy: Vertical Green-White-Red
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#009246" />
            <rect x="16" y="0" width="16" height="48" fill="#FFFFFF" />
            <rect x="32" y="0" width="16" height="48" fill="#CE2B37" />
          </>
        );
      case 'PT': // Portugal: Green/Red split + gold armillary emblem
        return (
          <>
            <rect x="0" y="0" width="19" height="48" fill="#006600" />
            <rect x="19" y="0" width="29" height="48" fill="#FF0000" />
            <circle cx="19" cy="24" r="6.5" fill="#FFCC00" />
            <rect x="16" y="20.5" width="6" height="7" rx="1.5" fill="#FF0000" />
            <rect x="17.5" y="22" width="3" height="4" fill="#FFFFFF" />
          </>
        );
      case 'NL': // Netherlands: Red-White-Blue
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#AE1C28" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#21468B" />
          </>
        );
      case 'BE': // Belgium: Vertical Black-Yellow-Red
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#111827" />
            <rect x="16" y="0" width="16" height="48" fill="#FDDA24" />
            <rect x="32" y="0" width="16" height="48" fill="#EF3340" />
          </>
        );
      case 'HR': // Croatia: Red-White-Blue + checkerboard shield
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#FF0000" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#171796" />
            <rect x="19" y="18" width="10" height="12" rx="2" fill="#FFFFFF" stroke="#FF0000" strokeWidth="1.2" />
            <rect x="19" y="18" width="5" height="6" fill="#FF0000" />
            <rect x="24" y="24" width="5" height="6" fill="#FF0000" />
          </>
        );
      case 'CH': // Switzerland: Red + bold white cross
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#DA291C" />
            <rect x="20" y="10" width="8" height="28" fill="#FFFFFF" />
            <rect x="10" y="20" width="28" height="8" fill="#FFFFFF" />
          </>
        );
      case 'DK': // Denmark: Red + Nordic white cross
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#C60C30" />
            <rect x="15" y="0" width="6.5" height="48" fill="#FFFFFF" />
            <rect x="0" y="20.75" width="48" height="6.5" fill="#FFFFFF" />
          </>
        );
      case 'NO': // Norway: Red + white-bordered navy Nordic cross
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#BA0C2F" />
            <rect x="14" y="0" width="9" height="48" fill="#FFFFFF" />
            <rect x="0" y="19.5" width="48" height="9" fill="#FFFFFF" />
            <rect x="16" y="0" width="5" height="48" fill="#00205B" />
            <rect x="0" y="21.5" width="48" height="5" fill="#00205B" />
          </>
        );
      case 'SE': // Sweden: Blue + yellow Nordic cross
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#006AA7" />
            <rect x="15" y="0" width="7" height="48" fill="#FECC00" />
            <rect x="0" y="20.5" width="48" height="7" fill="#FECC00" />
          </>
        );
      case 'AT': // Austria: Red-White-Red
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#ED2939" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#ED2939" />
          </>
        );
      case 'TR': // Türkiye: Red + white crescent & star
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#E30A17" />
            <circle cx="21" cy="24" r="9" fill="#FFFFFF" />
            <circle cx="23.5" cy="24" r="7.2" fill="#E30A17" />
            <polygon
              points="31,20 32.3,23 35.5,23.2 33,25.2 33.8,28.3 31,26.6 28.2,28.3 29,25.2 26.5,23.2 29.7,23"
              fill="#FFFFFF"
            />
          </>
        );
      case 'PL': // Poland: White over Red
        return (
          <>
            <rect x="0" y="0" width="48" height="24" fill="#FFFFFF" />
            <rect x="0" y="24" width="48" height="24" fill="#DC143C" />
          </>
        );
      case 'UA': // Ukraine: Blue over Yellow
        return (
          <>
            <rect x="0" y="0" width="48" height="24" fill="#005BBB" />
            <rect x="0" y="24" width="48" height="24" fill="#FFD500" />
          </>
        );
      case 'RS': // Serbia: Red-Blue-White + emblem
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#C6363C" />
            <rect x="0" y="16" width="48" height="16" fill="#0C4076" />
            <rect x="0" y="32" width="48" height="16" fill="#FFFFFF" />
            <rect x="14" y="17" width="7" height="11" rx="2" fill="#C6363C" stroke="#FFD500" strokeWidth="1.2" />
          </>
        );
      case 'CZ': // Czechia: White over Red + blue hoist triangle
        return (
          <>
            <rect x="0" y="0" width="48" height="24" fill="#FFFFFF" />
            <rect x="0" y="24" width="48" height="24" fill="#D7141A" />
            <polygon points="0,0 24,24 0,48" fill="#11457E" />
          </>
        );
      case 'HU': // Hungary: Red-White-Green
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#CD2A3E" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#436F4D" />
          </>
        );
      case 'RO': // Romania: Vertical Blue-Yellow-Red
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#002B7F" />
            <rect x="16" y="0" width="16" height="48" fill="#FCD116" />
            <rect x="32" y="0" width="16" height="48" fill="#CE1126" />
          </>
        );
      case 'SK': // Slovakia: White-Blue-Red + shield
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="16" width="48" height="16" fill="#0B4EA2" />
            <rect x="0" y="32" width="48" height="16" fill="#EE1C25" />
            <rect x="12" y="17" width="8" height="12" rx="2.5" fill="#EE1C25" stroke="#FFFFFF" strokeWidth="1.2" />
          </>
        );
      case 'SI': // Slovenia: White-Blue-Red + Triglav crest
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="16" width="48" height="16" fill="#005DA4" />
            <rect x="0" y="32" width="48" height="16" fill="#ED1C24" />
            <rect x="11" y="11" width="7" height="9" rx="2" fill="#005DA4" stroke="#ED1C24" strokeWidth="1" />
          </>
        );
      case 'AL': // Albania: Red + black double-headed eagle silhouette
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#E41E20" />
            <path d="M24,14 L33,22 L28,26 L31,34 L24,30 L17,34 L20,26 L15,22 Z" fill="#111827" />
          </>
        );
      case 'GE': // Georgia: White + red St George cross & 4 crosslets
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#FFFFFF" />
            <rect x="20" y="0" width="8" height="48" fill="#FF0000" />
            <rect x="0" y="20" width="48" height="8" fill="#FF0000" />
            <rect x="10" y="9" width="4" height="4" fill="#FF0000" />
            <rect x="34" y="9" width="4" height="4" fill="#FF0000" />
            <rect x="10" y="35" width="4" height="4" fill="#FF0000" />
            <rect x="34" y="35" width="4" height="4" fill="#FF0000" />
          </>
        );

      // === CONMEBOL ===
      case 'AR': // Argentina: Sky Blue-White-Sky Blue + Sun of May
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#74ACDF" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#74ACDF" />
            <circle cx="24" cy="24" r="4.5" fill="#F6B40E" />
          </>
        );
      case 'BR': // Brazil: Green + Yellow diamond + Blue globe & white band
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#009C3B" />
            <polygon points="24,7 43,24 24,41 5,24" fill="#FFDF00" />
            <circle cx="24" cy="24" r="8.2" fill="#002776" />
            <path d="M16.5,22 Q24,20 31.5,26" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
          </>
        );
      case 'UY': // Uruguay: Blue & white stripes + white canton & sun
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#FFFFFF" />
            {[6, 18, 30, 42].map((y) => (
              <rect key={y} x="0" y={y} width="48" height="6" fill="#0038A8" />
            ))}
            <rect x="0" y="0" width="22" height="22" fill="#FFFFFF" />
            <circle cx="12" cy="12" r="5" fill="#FCD116" />
          </>
        );
      case 'CO': // Colombia: Wide Yellow + Blue + Red
        return (
          <>
            <rect x="0" y="0" width="48" height="24" fill="#FCD116" />
            <rect x="0" y="24" width="48" height="12" fill="#003893" />
            <rect x="0" y="36" width="48" height="12" fill="#CE1126" />
          </>
        );
      case 'EC': // Ecuador: Wide Yellow + Blue + Red + emblem
        return (
          <>
            <rect x="0" y="0" width="48" height="24" fill="#FFD100" />
            <rect x="0" y="24" width="48" height="12" fill="#0072CE" />
            <rect x="0" y="36" width="48" height="12" fill="#EF3340" />
            <circle cx="24" cy="24" r="4" fill="#8B5A2B" stroke="#FFD100" strokeWidth="1.2" />
          </>
        );
      case 'CL': // Chile: White/Red + blue canton with white star
        return (
          <>
            <rect x="0" y="0" width="48" height="24" fill="#FFFFFF" />
            <rect x="0" y="24" width="48" height="24" fill="#D52B1E" />
            <rect x="0" y="0" width="24" height="24" fill="#0039A6" />
            <polygon
              points="13,7 14.5,11.5 19.2,11.5 15.4,14.2 16.8,18.7 13,16 9.2,18.7 10.6,14.2 6.8,11.5 11.5,11.5"
              fill="#FFFFFF"
            />
          </>
        );
      case 'PE': // Peru: Vertical Red-White-Red
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#D91023" />
            <rect x="16" y="0" width="16" height="48" fill="#FFFFFF" />
            <rect x="32" y="0" width="16" height="48" fill="#D91023" />
          </>
        );
      case 'PY': // Paraguay: Red-White-Blue + emblem
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#D52B1E" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#0038A8" />
            <circle cx="24" cy="24" r="3.5" fill="#FCD116" />
          </>
        );
      case 'VE': // Venezuela: Yellow-Blue-Red + white stars arc
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#FFCC00" />
            <rect x="0" y="16" width="48" height="16" fill="#00247D" />
            <rect x="0" y="32" width="48" height="16" fill="#CF142B" />
            <path d="M15,26 Q24,18 33,26" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="2 2.2" />
          </>
        );
      case 'BO': // Bolivia: Red-Yellow-Green
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#D52B1E" />
            <rect x="0" y="16" width="48" height="16" fill="#F9E300" />
            <rect x="0" y="32" width="48" height="16" fill="#007934" />
          </>
        );

      // === CONCACAF ===
      case 'US': // United States: Red & white stripes + blue canton with stars
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#FFFFFF" />
            {[0, 8, 16, 24, 32, 40].map((y) => (
              <rect key={y} x="0" y={y} width="48" height="4" fill="#B22234" />
            ))}
            <rect x="0" y="0" width="24" height="24" fill="#3C3B6E" />
            <circle cx="7" cy="7" r="1.3" fill="#FFFFFF" />
            <circle cx="13" cy="7" r="1.3" fill="#FFFFFF" />
            <circle cx="19" cy="7" r="1.3" fill="#FFFFFF" />
            <circle cx="10" cy="12" r="1.3" fill="#FFFFFF" />
            <circle cx="16" cy="12" r="1.3" fill="#FFFFFF" />
            <circle cx="7" cy="17" r="1.3" fill="#FFFFFF" />
            <circle cx="13" cy="17" r="1.3" fill="#FFFFFF" />
            <circle cx="19" cy="17" r="1.3" fill="#FFFFFF" />
          </>
        );
      case 'MX': // Mexico: Green-White-Red + eagle crest
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#006847" />
            <rect x="16" y="0" width="16" height="48" fill="#FFFFFF" />
            <rect x="32" y="0" width="16" height="48" fill="#CE1126" />
            <circle cx="24" cy="24" r="4" fill="#8B5A2B" />
          </>
        );
      case 'CA': // Canada: Red-White-Red + maple leaf
        return (
          <>
            <rect x="0" y="0" width="12" height="48" fill="#FF0000" />
            <rect x="12" y="0" width="24" height="48" fill="#FFFFFF" />
            <rect x="36" y="0" width="12" height="48" fill="#FF0000" />
            <polygon points="24,13 27,21 32,20 28,26 29,30 25,29 25,35 23,35 23,29 19,30 20,26 16,20 21,21" fill="#FF0000" />
          </>
        );
      case 'CR': // Costa Rica: Blue-White-Red-White-Blue
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#002B7F" />
            <rect x="0" y="8" width="48" height="32" fill="#FFFFFF" />
            <rect x="0" y="15.5" width="48" height="17" fill="#CE1126" />
          </>
        );
      case 'PA': // Panama: 4 quadrants + stars
        return (
          <>
            <rect x="0" y="0" width="24" height="24" fill="#FFFFFF" />
            <rect x="24" y="0" width="24" height="24" fill="#DA121A" />
            <rect x="0" y="24" width="24" height="24" fill="#072357" />
            <rect x="24" y="24" width="24" height="24" fill="#FFFFFF" />
            <circle cx="13" cy="13" r="3" fill="#072357" />
            <circle cx="35" cy="35" r="3" fill="#DA121A" />
          </>
        );
      case 'JM': // Jamaica: Green & Black triangles + gold saltire
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#009B3A" />
            <polygon points="0,4 20,24 0,44" fill="#111827" />
            <polygon points="48,4 28,24 48,44" fill="#111827" />
            <path d="M0,0 L48,48 M48,0 L0,48" stroke="#FED100" strokeWidth="6" />
          </>
        );

      // === CAF & OFC ===
      case 'MA': // Morocco: Red + green pentagram star
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#C1272D" />
            <polygon
              points="24,13 27,21 35,21 28.5,26 31,34 24,29 17,34 19.5,26 13,21 21,21"
              fill="none"
              stroke="#006233"
              strokeWidth="2.4"
            />
          </>
        );
      case 'SN': // Senegal: Green-Yellow-Red + green star
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#00853F" />
            <rect x="16" y="0" width="16" height="48" fill="#FDEF42" />
            <rect x="32" y="0" width="16" height="48" fill="#E31B23" />
            <polygon
              points="24,18 25.5,22.5 30,22.5 26.3,25.2 27.7,29.5 24,26.8 20.3,29.5 21.7,25.2 18,22.5 22.5,22.5"
              fill="#00853F"
            />
          </>
        );
      case 'EG': // Egypt: Red-White-Black + gold eagle
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#CE1126" />
            <rect x="0" y="16" width="48" height="16" fill="#FFFFFF" />
            <rect x="0" y="32" width="48" height="16" fill="#111827" />
            <circle cx="24" cy="24" r="3.8" fill="#C09300" />
          </>
        );
      case 'NG': // Nigeria: Vertical Green-White-Green
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#008751" />
            <rect x="16" y="0" width="16" height="48" fill="#FFFFFF" />
            <rect x="32" y="0" width="16" height="48" fill="#008751" />
          </>
        );
      case 'CI': // Côte d'Ivoire: Vertical Orange-White-Green
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#F77F00" />
            <rect x="16" y="0" width="16" height="48" fill="#FFFFFF" />
            <rect x="32" y="0" width="16" height="48" fill="#009E60" />
          </>
        );
      case 'CM': // Cameroon: Vertical Green-Red-Yellow + yellow star
        return (
          <>
            <rect x="0" y="0" width="16" height="48" fill="#007A5E" />
            <rect x="16" y="0" width="16" height="48" fill="#CE1126" />
            <rect x="32" y="0" width="16" height="48" fill="#FCD116" />
            <polygon
              points="24,18 25.5,22.5 30,22.5 26.3,25.2 27.7,29.5 24,26.8 20.3,29.5 21.7,25.2 18,22.5 22.5,22.5"
              fill="#FCD116"
            />
          </>
        );
      case 'TN': // Tunisia: Red + white disc + red crescent & star
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#E70013" />
            <circle cx="24" cy="24" r="10.5" fill="#FFFFFF" />
            <circle cx="23.5" cy="24" r="6.2" fill="#E70013" />
            <circle cx="25.5" cy="24" r="4.8" fill="#FFFFFF" />
            <circle cx="27.2" cy="24" r="2" fill="#E70013" />
          </>
        );
      case 'GH': // Ghana: Red-Yellow-Green + black star
        return (
          <>
            <rect x="0" y="0" width="48" height="16" fill="#CF0921" />
            <rect x="0" y="16" width="48" height="16" fill="#FCD20F" />
            <rect x="0" y="32" width="48" height="16" fill="#006B3F" />
            <polygon
              points="24,18 25.6,22.5 30.2,22.5 26.4,25.2 27.8,29.5 24,26.8 20.2,29.5 21.6,25.2 17.8,22.5 22.4,22.5"
              fill="#111827"
            />
          </>
        );
      case 'DZ': // Algeria: Green/White vertical split + red crescent & star
        return (
          <>
            <rect x="0" y="0" width="24" height="48" fill="#006233" />
            <rect x="24" y="0" width="24" height="48" fill="#FFFFFF" />
            <circle cx="24" cy="24" r="7.5" fill="#D21034" />
            <circle cx="26.5" cy="24" r="6" fill="#FFFFFF" />
            <circle cx="28" cy="24" r="2" fill="#D21034" />
          </>
        );
      case 'ZA': // South Africa: Y-shaped green band with red/blue/black/gold
        return (
          <>
            <rect x="0" y="0" width="48" height="24" fill="#E03C31" />
            <rect x="0" y="24" width="48" height="24" fill="#001489" />
            <path d="M0,4 L22,24 L0,44" fill="#111827" stroke="#FFB81C" strokeWidth="3.5" />
            <path d="M0,0 L24,24 L48,24 M0,48 L24,24" fill="none" stroke="#FFFFFF" strokeWidth="10" />
            <path d="M0,0 L24,24 L48,24 M0,48 L24,24" fill="none" stroke="#007749" strokeWidth="6.5" />
          </>
        );
      case 'NZ': // New Zealand: Deep blue + Union canton + 4 red white-rimmed stars
        return (
          <>
            <rect x="0" y="0" width="48" height="48" fill="#00247D" />
            <rect x="0" y="0" width="24" height="24" fill="#012169" />
            <path d="M0,0 L24,24 M24,0 L0,24" stroke="#FFFFFF" strokeWidth="3.5" />
            <path d="M12,0 V24 M0,12 H24" stroke="#FFFFFF" strokeWidth="5.5" />
            <path d="M12,0 V24 M0,12 H24" stroke="#CC142B" strokeWidth="3" />
            <circle cx="35" cy="14" r="2.2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.9" />
            <circle cx="40" cy="23" r="2.2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.9" />
            <circle cx="31" cy="24" r="2.2" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.9" />
            <circle cx="35" cy="36" r="2.5" fill="#CC142B" stroke="#FFFFFF" strokeWidth="0.9" />
          </>
        );
      default:
        return (
          <>
            <rect x="0" y="0" width="48" height="18" fill={primaryColor} />
            <rect x="0" y="18" width="48" height="14" fill={secondaryColor} />
            <rect x="0" y="32" width="48" height="16" fill={accentColor ?? primaryColor} />
          </>
        );
    }
  };

  return (
    <svg viewBox="0 0 48 48" className="h-full w-full drop-shadow-sm">
      <defs>
        <clipPath id={`flag_clip_${uid}`}>
          <circle cx="24" cy="24" r="21" />
        </clipPath>
        <radialGradient id={`flag_sheen_${uid}`} cx="35%" cy="28%" r="72%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.24)" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#flag_clip_${uid})`}>
        {renderFlagArtwork()}
        <circle cx="24" cy="24" r="21" fill={`url(#flag_sheen_${uid})`} />
      </g>
      <circle
        cx="24"
        cy="24"
        r="21.25"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="1.5"
      />
    </svg>
  );
};
