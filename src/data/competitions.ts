import { Competition, Team } from '../types/game';

export const TEAMS: Record<string, Team> = {
  // === UEFA NATIONAL TEAMS ===
  nat_ger: { id: 'nat_ger', name: 'Germany', shortName: 'GER', country: 'Germany', flagCode: 'DE', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#111827', accentColor: '#DC2626', confederation: 'UEFA', rating: 87, info: 'Four-time World Cup champions' },
  nat_fra: { id: 'nat_fra', name: 'France', shortName: 'FRA', country: 'France', flagCode: 'FR', isNational: true, primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC', accentColor: '#DC2626', confederation: 'UEFA', rating: 91, info: 'Two-time World Cup champions' },
  nat_esp: { id: 'nat_esp', name: 'Spain', shortName: 'ESP', country: 'Spain', flagCode: 'ES', isNational: true, primaryColor: '#DC2626', secondaryColor: '#EAB308', accentColor: '#1E3A8A', confederation: 'UEFA', rating: 90, info: 'UEFA Euro 2024 champions' },
  nat_eng: { id: 'nat_eng', name: 'England', shortName: 'ENG', country: 'England', flagCode: 'GB-ENG', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#1E3A8A', accentColor: '#DC2626', confederation: 'UEFA', rating: 88, info: '1966 World Cup winners' },
  nat_ita: { id: 'nat_ita', name: 'Italy', shortName: 'ITA', country: 'Italy', flagCode: 'IT', isNational: true, primaryColor: '#2563EB', secondaryColor: '#F8FAFC', accentColor: '#16A34A', confederation: 'UEFA', rating: 85, info: 'Four-time World Cup champions' },
  nat_por: { id: 'nat_por', name: 'Portugal', shortName: 'POR', country: 'Portugal', flagCode: 'PT', isNational: true, primaryColor: '#B91C1C', secondaryColor: '#15803D', accentColor: '#EAB308', confederation: 'UEFA', rating: 88, info: 'UEFA Euro 2016 champions' },
  nat_ned: { id: 'nat_ned', name: 'Netherlands', shortName: 'NED', country: 'Netherlands', flagCode: 'NL', isNational: true, primaryColor: '#EA580C', secondaryColor: '#F8FAFC', accentColor: '#1D4ED8', confederation: 'UEFA', rating: 87, info: 'Total Football pioneers' },
  nat_bel: { id: 'nat_bel', name: 'Belgium', shortName: 'BEL', country: 'Belgium', flagCode: 'BE', isNational: true, primaryColor: '#B91C1C', secondaryColor: '#111827', accentColor: '#EAB308', confederation: 'UEFA', rating: 84, info: 'Red Devils' },
  nat_cro: { id: 'nat_cro', name: 'Croatia', shortName: 'CRO', country: 'Croatia', flagCode: 'HR', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', accentColor: '#1D4ED8', confederation: 'UEFA', rating: 84, info: '2018 World Cup finalists' },
  nat_sui: { id: 'nat_sui', name: 'Switzerland', shortName: 'SUI', country: 'Switzerland', flagCode: 'CH', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'UEFA', rating: 82, info: 'Consistent knockout qualifiers' },
  nat_den: { id: 'nat_den', name: 'Denmark', shortName: 'DEN', country: 'Denmark', flagCode: 'DK', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'UEFA', rating: 82, info: 'UEFA Euro 1992 champions' },
  nat_aut: { id: 'nat_aut', name: 'Austria', shortName: 'AUT', country: 'Austria', flagCode: 'AT', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'UEFA', rating: 81, info: 'High-pressing Alpine side' },
  nat_tur: { id: 'nat_tur', name: 'Türkiye', shortName: 'TUR', country: 'Türkiye', flagCode: 'TR', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'UEFA', rating: 80, info: 'Euro 2024 quarter-finalists' },
  nat_pol: { id: 'nat_pol', name: 'Poland', shortName: 'POL', country: 'Poland', flagCode: 'PL', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#DC2626', confederation: 'UEFA', rating: 79, info: 'White and Reds' },
  nat_ukr: { id: 'nat_ukr', name: 'Ukraine', shortName: 'UKR', country: 'Ukraine', flagCode: 'UA', isNational: true, primaryColor: '#EAB308', secondaryColor: '#2563EB', confederation: 'UEFA', rating: 79, info: 'Blue and Yellows' },
  nat_srb: { id: 'nat_srb', name: 'Serbia', shortName: 'SRB', country: 'Serbia', flagCode: 'RS', isNational: true, primaryColor: '#B91C1C', secondaryColor: '#1E3A8A', confederation: 'UEFA', rating: 79, info: 'Eagles' },
  nat_cze: { id: 'nat_cze', name: 'Czechia', shortName: 'CZE', country: 'Czechia', flagCode: 'CZ', isNational: true, primaryColor: '#DC2626', secondaryColor: '#1D4ED8', confederation: 'UEFA', rating: 78, info: 'Euro 1996 finalists' },
  nat_hun: { id: 'nat_hun', name: 'Hungary', shortName: 'HUN', country: 'Hungary', flagCode: 'HU', isNational: true, primaryColor: '#B91C1C', secondaryColor: '#15803D', confederation: 'UEFA', rating: 78, info: 'Historic football powerhouse' },
  nat_sco: { id: 'nat_sco', name: 'Scotland', shortName: 'SCO', country: 'Scotland', flagCode: 'GB-SCT', isNational: true, primaryColor: '#1E3A8A', secondaryColor: '#F8FAFC', confederation: 'UEFA', rating: 77, info: 'Tartan Army' },
  nat_rou: { id: 'nat_rou', name: 'Romania', shortName: 'ROU', country: 'Romania', flagCode: 'RO', isNational: true, primaryColor: '#EAB308', secondaryColor: '#1D4ED8', accentColor: '#DC2626', confederation: 'UEFA', rating: 77, info: 'Tricolorii' },
  nat_svk: { id: 'nat_svk', name: 'Slovakia', shortName: 'SVK', country: 'Slovakia', flagCode: 'SK', isNational: true, primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC', accentColor: '#DC2626', confederation: 'UEFA', rating: 77, info: 'Euro 2024 Round of 16' },
  nat_svn: { id: 'nat_svn', name: 'Slovenia', shortName: 'SVN', country: 'Slovenia', flagCode: 'SI', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#2563EB', accentColor: '#16A34A', confederation: 'UEFA', rating: 76, info: 'Euro 2024 Round of 16' },
  nat_alb: { id: 'nat_alb', name: 'Albania', shortName: 'ALB', country: 'Albania', flagCode: 'AL', isNational: true, primaryColor: '#DC2626', secondaryColor: '#111827', confederation: 'UEFA', rating: 75, info: 'Kuq e Zinjtë' },
  nat_geo: { id: 'nat_geo', name: 'Georgia', shortName: 'GEO', country: 'Georgia', flagCode: 'GE', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#DC2626', confederation: 'UEFA', rating: 76, info: 'Euro 2024 breakout debutants' },
  nat_wal: { id: 'nat_wal', name: 'Wales', shortName: 'WAL', country: 'Wales', flagCode: 'GB-WLS', isNational: true, primaryColor: '#DC2626', secondaryColor: '#15803D', confederation: 'UEFA', rating: 77, info: '2022 World Cup participants' },
  nat_nor: { id: 'nat_nor', name: 'Norway', shortName: 'NOR', country: 'Norway', flagCode: 'NO', isNational: true, primaryColor: '#DC2626', secondaryColor: '#1E3A8A', confederation: 'UEFA', rating: 80, info: 'Nordic attacking side' },
  nat_swe: { id: 'nat_swe', name: 'Sweden', shortName: 'SWE', country: 'Sweden', flagCode: 'SE', isNational: true, primaryColor: '#EAB308', secondaryColor: '#1D4ED8', confederation: 'UEFA', rating: 79, info: 'Blågult' },

  // === CONMEBOL NATIONAL TEAMS ===
  nat_arg: { id: 'nat_arg', name: 'Argentina', shortName: 'ARG', country: 'Argentina', flagCode: 'AR', isNational: true, primaryColor: '#38BDF8', secondaryColor: '#F8FAFC', accentColor: '#EAB308', confederation: 'CONMEBOL', rating: 92, info: 'World Cup & Copa América champions' },
  nat_bra: { id: 'nat_bra', name: 'Brazil', shortName: 'BRA', country: 'Brazil', flagCode: 'BR', isNational: true, primaryColor: '#EAB308', secondaryColor: '#15803D', accentColor: '#1D4ED8', confederation: 'CONMEBOL', rating: 89, info: 'Five-time World Cup champions' },
  nat_uru: { id: 'nat_uru', name: 'Uruguay', shortName: 'URU', country: 'Uruguay', flagCode: 'UY', isNational: true, primaryColor: '#38BDF8', secondaryColor: '#111827', confederation: 'CONMEBOL', rating: 86, info: 'Two-time World Cup winners' },
  nat_col: { id: 'nat_col', name: 'Colombia', shortName: 'COL', country: 'Colombia', flagCode: 'CO', isNational: true, primaryColor: '#EAB308', secondaryColor: '#1D4ED8', accentColor: '#DC2626', confederation: 'CONMEBOL', rating: 85, info: 'Copa América 2024 finalists' },
  nat_ecu: { id: 'nat_ecu', name: 'Ecuador', shortName: 'ECU', country: 'Ecuador', flagCode: 'EC', isNational: true, primaryColor: '#EAB308', secondaryColor: '#1D4ED8', confederation: 'CONMEBOL', rating: 81, info: 'La Tri' },
  nat_chi: { id: 'nat_chi', name: 'Chile', shortName: 'CHI', country: 'Chile', flagCode: 'CL', isNational: true, primaryColor: '#DC2626', secondaryColor: '#1D4ED8', confederation: 'CONMEBOL', rating: 79, info: 'Two-time Copa América winners' },
  nat_per: { id: 'nat_per', name: 'Peru', shortName: 'PER', country: 'Peru', flagCode: 'PE', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#DC2626', confederation: 'CONMEBOL', rating: 77, info: 'La Blanquirroja' },
  nat_par: { id: 'nat_par', name: 'Paraguay', shortName: 'PAR', country: 'Paraguay', flagCode: 'PY', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', accentColor: '#1D4ED8', confederation: 'CONMEBOL', rating: 78, info: 'La Albirroja' },
  nat_ven: { id: 'nat_ven', name: 'Venezuela', shortName: 'VEN', country: 'Venezuela', flagCode: 'VE', isNational: true, primaryColor: '#7F1D1D', secondaryColor: '#EAB308', confederation: 'CONMEBOL', rating: 78, info: 'La Vinotinto' },
  nat_bol: { id: 'nat_bol', name: 'Bolivia', shortName: 'BOL', country: 'Bolivia', flagCode: 'BO', isNational: true, primaryColor: '#15803D', secondaryColor: '#F8FAFC', confederation: 'CONMEBOL', rating: 73, info: 'La Verde' },

  // === CONCACAF NATIONAL TEAMS ===
  nat_usa: { id: 'nat_usa', name: 'United States', shortName: 'USA', country: 'United States', flagCode: 'US', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#1E3A8A', accentColor: '#DC2626', confederation: 'CONCACAF', rating: 82, info: '2026 World Cup co-hosts' },
  nat_mex: { id: 'nat_mex', name: 'Mexico', shortName: 'MEX', country: 'Mexico', flagCode: 'MX', isNational: true, primaryColor: '#15803D', secondaryColor: '#F8FAFC', accentColor: '#DC2626', confederation: 'CONCACAF', rating: 81, info: '2026 World Cup co-hosts' },
  nat_can: { id: 'nat_can', name: 'Canada', shortName: 'CAN', country: 'Canada', flagCode: 'CA', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'CONCACAF', rating: 80, info: '2026 World Cup co-hosts' },
  nat_crc: { id: 'nat_crc', name: 'Costa Rica', shortName: 'CRC', country: 'Costa Rica', flagCode: 'CR', isNational: true, primaryColor: '#DC2626', secondaryColor: '#1D4ED8', confederation: 'CONCACAF', rating: 76, info: 'Los Ticos' },
  nat_pan: { id: 'nat_pan', name: 'Panama', shortName: 'PAN', country: 'Panama', flagCode: 'PA', isNational: true, primaryColor: '#DC2626', secondaryColor: '#1D4ED8', confederation: 'CONCACAF', rating: 76, info: 'Copa América 2024 quarter-finalists' },
  nat_jam: { id: 'nat_jam', name: 'Jamaica', shortName: 'JAM', country: 'Jamaica', flagCode: 'JM', isNational: true, primaryColor: '#EAB308', secondaryColor: '#111827', accentColor: '#15803D', confederation: 'CONCACAF', rating: 75, info: 'Reggae Boyz' },

  // === AFC NATIONAL TEAMS (All 24 AFC Asian Cup 2023 Participants) ===
  nat_jpn: { id: 'nat_jpn', name: 'Japan', shortName: 'JPN', country: 'Japan', flagCode: 'JP', isNational: true, primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC', accentColor: '#DC2626', confederation: 'AFC', rating: 84, info: 'Four-time AFC Asian Cup champions' },
  nat_kor: { id: 'nat_kor', name: 'South Korea', shortName: 'KOR', country: 'South Korea', flagCode: 'KR', isNational: true, primaryColor: '#DC2626', secondaryColor: '#1E3A8A', confederation: 'AFC', rating: 83, info: 'Taegeuk Warriors' },
  nat_irn: { id: 'nat_irn', name: 'Iran', shortName: 'IRN', country: 'Iran', flagCode: 'IR', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#16A34A', accentColor: '#DC2626', confederation: 'AFC', rating: 81, info: 'Three-time Asian Cup winners' },
  nat_aus: { id: 'nat_aus', name: 'Australia', shortName: 'AUS', country: 'Australia', flagCode: 'AU', isNational: true, primaryColor: '#EAB308', secondaryColor: '#15803D', confederation: 'AFC', rating: 80, info: '2015 Asian Cup champions' },
  nat_qat: { id: 'nat_qat', name: 'Qatar', shortName: 'QAT', country: 'Qatar', flagCode: 'QA', isNational: true, primaryColor: '#7F1D1D', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 79, info: 'Back-to-back Asian Cup champions' },
  nat_ksa: { id: 'nat_ksa', name: 'Saudi Arabia', shortName: 'KSA', country: 'Saudi Arabia', flagCode: 'SA', isNational: true, primaryColor: '#15803D', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 78, info: 'Three-time Asian Cup champions' },
  nat_irq: { id: 'nat_irq', name: 'Iraq', shortName: 'IRQ', country: 'Iraq', flagCode: 'IQ', isNational: true, primaryColor: '#15803D', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 77, info: '2007 Asian Cup winners' },
  nat_uzb: { id: 'nat_uzb', name: 'Uzbekistan', shortName: 'UZB', country: 'Uzbekistan', flagCode: 'UZ', isNational: true, primaryColor: '#2563EB', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 78, info: 'White Wolves' },
  nat_jor: { id: 'nat_jor', name: 'Jordan', shortName: 'JOR', country: 'Jordan', flagCode: 'JO', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 77, info: '2023 Asian Cup finalists' },
  nat_uae: { id: 'nat_uae', name: 'United Arab Emirates', shortName: 'UAE', country: 'UAE', flagCode: 'AE', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#DC2626', confederation: 'AFC', rating: 76, info: 'Al Abyad' },
  nat_oma: { id: 'nat_oma', name: 'Oman', shortName: 'OMA', country: 'Oman', flagCode: 'OM', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 74, info: 'Al-Ahmar' },
  nat_bhr: { id: 'nat_bhr', name: 'Bahrain', shortName: 'BHR', country: 'Bahrain', flagCode: 'BH', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 74, info: 'Asian Cup 2023 Round of 16' },
  nat_chn: { id: 'nat_chn', name: 'China PR', shortName: 'CHN', country: 'China', flagCode: 'CN', isNational: true, primaryColor: '#DC2626', secondaryColor: '#EAB308', confederation: 'AFC', rating: 74, info: 'Team Dragon' },
  nat_syr: { id: 'nat_syr', name: 'Syria', shortName: 'SYR', country: 'Syria', flagCode: 'SY', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 73, info: 'Qasioun Eagles' },
  nat_ple: { id: 'nat_ple', name: 'Palestine', shortName: 'PLE', country: 'Palestine', flagCode: 'PS', isNational: true, primaryColor: '#DC2626', secondaryColor: '#15803D', confederation: 'AFC', rating: 73, info: 'Asian Cup 2023 Round of 16' },
  nat_tjk: { id: 'nat_tjk', name: 'Tajikistan', shortName: 'TJK', country: 'Tajikistan', flagCode: 'TJ', isNational: true, primaryColor: '#DC2626', secondaryColor: '#15803D', confederation: 'AFC', rating: 74, info: '2023 Asian Cup quarter-finalists' },
  nat_tha: { id: 'nat_tha', name: 'Thailand', shortName: 'THA', country: 'Thailand', flagCode: 'TH', isNational: true, primaryColor: '#1D4ED8', secondaryColor: '#DC2626', confederation: 'AFC', rating: 74, info: 'War Elephants' },
  nat_vie: { id: 'nat_vie', name: 'Vietnam', shortName: 'VIE', country: 'Vietnam', flagCode: 'VN', isNational: true, primaryColor: '#DC2626', secondaryColor: '#EAB308', confederation: 'AFC', rating: 74, info: 'Golden Star Warriors' },
  nat_idn: { id: 'nat_idn', name: 'Indonesia', shortName: 'IDN', country: 'Indonesia', flagCode: 'ID', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 73, info: 'Tim Garuda' },
  nat_mas: { id: 'nat_mas', name: 'Malaysia', shortName: 'MAS', country: 'Malaysia', flagCode: 'MY', isNational: true, primaryColor: '#EAB308', secondaryColor: '#111827', confederation: 'AFC', rating: 71, info: 'Harimau Malaya' },
  nat_ind: { id: 'nat_ind', name: 'India', shortName: 'IND', country: 'India', flagCode: 'IN', isNational: true, primaryColor: '#2563EB', secondaryColor: '#F97316', confederation: 'AFC', rating: 71, info: 'Blue Tigers' },
  nat_lbn: { id: 'nat_lbn', name: 'Lebanon', shortName: 'LBN', country: 'Lebanon', flagCode: 'LB', isNational: true, primaryColor: '#DC2626', secondaryColor: '#15803D', confederation: 'AFC', rating: 71, info: 'The Cedars' },
  nat_kgz: { id: 'nat_kgz', name: 'Kyrgyz Republic', shortName: 'KGZ', country: 'Kyrgyzstan', flagCode: 'KG', isNational: true, primaryColor: '#DC2626', secondaryColor: '#EAB308', confederation: 'AFC', rating: 71, info: 'White Falcons' },
  nat_hkg: { id: 'nat_hkg', name: 'Hong Kong, China', shortName: 'HKG', country: 'Hong Kong', flagCode: 'HK', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'AFC', rating: 69, info: 'Asian Cup 2023 returnees' },

  // === CAF & OFC NATIONAL TEAMS ===
  nat_mar: { id: 'nat_mar', name: 'Morocco', shortName: 'MAR', country: 'Morocco', flagCode: 'MA', isNational: true, primaryColor: '#B91C1C', secondaryColor: '#15803D', confederation: 'CAF', rating: 85, info: '2022 World Cup semi-finalists' },
  nat_sen: { id: 'nat_sen', name: 'Senegal', shortName: 'SEN', country: 'Senegal', flagCode: 'SN', isNational: true, primaryColor: '#15803D', secondaryColor: '#EAB308', accentColor: '#DC2626', confederation: 'CAF', rating: 82, info: 'Lions of Teranga' },
  nat_egy: { id: 'nat_egy', name: 'Egypt', shortName: 'EGY', country: 'Egypt', flagCode: 'EG', isNational: true, primaryColor: '#DC2626', secondaryColor: '#111827', confederation: 'CAF', rating: 81, info: 'Seven-time AFCON champions' },
  nat_nga: { id: 'nat_nga', name: 'Nigeria', shortName: 'NGA', country: 'Nigeria', flagCode: 'NG', isNational: true, primaryColor: '#15803D', secondaryColor: '#F8FAFC', confederation: 'CAF', rating: 81, info: 'Super Eagles' },
  nat_civ: { id: 'nat_civ', name: "Côte d'Ivoire", shortName: 'CIV', country: "Côte d'Ivoire", flagCode: 'CI', isNational: true, primaryColor: '#F97316', secondaryColor: '#15803D', confederation: 'CAF', rating: 81, info: 'AFCON 2023 champions' },
  nat_cmr: { id: 'nat_cmr', name: 'Cameroon', shortName: 'CMR', country: 'Cameroon', flagCode: 'CM', isNational: true, primaryColor: '#15803D', secondaryColor: '#DC2626', accentColor: '#EAB308', confederation: 'CAF', rating: 79, info: 'Indomitable Lions' },
  nat_tun: { id: 'nat_tun', name: 'Tunisia', shortName: 'TUN', country: 'Tunisia', flagCode: 'TN', isNational: true, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', confederation: 'CAF', rating: 78, info: 'Eagles of Carthage' },
  nat_gha: { id: 'nat_gha', name: 'Ghana', shortName: 'GHA', country: 'Ghana', flagCode: 'GH', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#111827', accentColor: '#EAB308', confederation: 'CAF', rating: 78, info: 'Black Stars' },
  nat_alg: { id: 'nat_alg', name: 'Algeria', shortName: 'ALG', country: 'Algeria', flagCode: 'DZ', isNational: true, primaryColor: '#15803D', secondaryColor: '#F8FAFC', confederation: 'CAF', rating: 80, info: 'Les Fennecs' },
  nat_rsa: { id: 'nat_rsa', name: 'South Africa', shortName: 'RSA', country: 'South Africa', flagCode: 'ZA', isNational: true, primaryColor: '#EAB308', secondaryColor: '#15803D', confederation: 'CAF', rating: 77, info: 'Bafana Bafana' },
  nat_nzl: { id: 'nat_nzl', name: 'New Zealand', shortName: 'NZL', country: 'New Zealand', flagCode: 'NZ', isNational: true, primaryColor: '#F8FAFC', secondaryColor: '#111827', confederation: 'OFC', rating: 75, info: 'All Whites' },

  // === ENGLISH PREMIER LEAGUE (2024/25 — 20 Clubs) ===
  epl_ars: { id: 'epl_ars', name: 'Arsenal', shortName: 'ARS', country: 'England', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', rating: 88, stadium: 'Emirates Stadium' },
  epl_avl: { id: 'epl_avl', name: 'Aston Villa', shortName: 'AVL', country: 'England', isNational: false, primaryColor: '#7C2D12', secondaryColor: '#38BDF8', rating: 83, stadium: 'Villa Park' },
  epl_bou: { id: 'epl_bou', name: 'AFC Bournemouth', shortName: 'BOU', country: 'England', isNational: false, primaryColor: '#DC2626', secondaryColor: '#111827', rating: 78, stadium: 'Vitality Stadium' },
  epl_bre: { id: 'epl_bre', name: 'Brentford', shortName: 'BRE', country: 'England', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', rating: 78, stadium: 'Gtech Community Stadium' },
  epl_bha: { id: 'epl_bha', name: 'Brighton & Hove Albion', shortName: 'BHA', country: 'England', isNational: false, primaryColor: '#2563EB', secondaryColor: '#F8FAFC', rating: 80, stadium: 'Amex Stadium' },
  epl_che: { id: 'epl_che', name: 'Chelsea', shortName: 'CHE', country: 'England', isNational: false, primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC', rating: 84, stadium: 'Stamford Bridge' },
  epl_cry: { id: 'epl_cry', name: 'Crystal Palace', shortName: 'CRY', country: 'England', isNational: false, primaryColor: '#1D4ED8', secondaryColor: '#DC2626', rating: 78, stadium: 'Selhurst Park' },
  epl_eve: { id: 'epl_eve', name: 'Everton', shortName: 'EVE', country: 'England', isNational: false, primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC', rating: 76, stadium: 'Goodison Park' },
  epl_ful: { id: 'epl_ful', name: 'Fulham', shortName: 'FUL', country: 'England', isNational: false, primaryColor: '#F8FAFC', secondaryColor: '#111827', rating: 78, stadium: 'Craven Cottage' },
  epl_ips: { id: 'epl_ips', name: 'Ipswich Town', shortName: 'IPS', country: 'England', isNational: false, primaryColor: '#2563EB', secondaryColor: '#F8FAFC', rating: 73, stadium: 'Portman Road' },
  epl_lei: { id: 'epl_lei', name: 'Leicester City', shortName: 'LEI', country: 'England', isNational: false, primaryColor: '#1D4ED8', secondaryColor: '#EAB308', rating: 74, stadium: 'King Power Stadium' },
  epl_liv: { id: 'epl_liv', name: 'Liverpool', shortName: 'LIV', country: 'England', isNational: false, primaryColor: '#B91C1C', secondaryColor: '#F8FAFC', rating: 90, stadium: 'Anfield' },
  epl_mci: { id: 'epl_mci', name: 'Manchester City', shortName: 'MCI', country: 'England', isNational: false, primaryColor: '#38BDF8', secondaryColor: '#F8FAFC', rating: 89, stadium: 'Etihad Stadium' },
  epl_mun: { id: 'epl_mun', name: 'Manchester United', shortName: 'MUN', country: 'England', isNational: false, primaryColor: '#DC2626', secondaryColor: '#111827', rating: 82, stadium: 'Old Trafford' },
  epl_new: { id: 'epl_new', name: 'Newcastle United', shortName: 'NEW', country: 'England', isNational: false, primaryColor: '#111827', secondaryColor: '#F8FAFC', rating: 83, stadium: "St James' Park" },
  epl_nfo: { id: 'epl_nfo', name: 'Nottingham Forest', shortName: 'NFO', country: 'England', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', rating: 79, stadium: 'City Ground' },
  epl_sou: { id: 'epl_sou', name: 'Southampton', shortName: 'SOU', country: 'England', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', rating: 73, stadium: "St Mary's Stadium" },
  epl_tot: { id: 'epl_tot', name: 'Tottenham Hotspur', shortName: 'TOT', country: 'England', isNational: false, primaryColor: '#F8FAFC', secondaryColor: '#1E3A8A', rating: 83, stadium: 'Tottenham Hotspur Stadium' },
  epl_whu: { id: 'epl_whu', name: 'West Ham United', shortName: 'WHU', country: 'England', isNational: false, primaryColor: '#7C2D12', secondaryColor: '#38BDF8', rating: 78, stadium: 'London Stadium' },
  epl_wol: { id: 'epl_wol', name: 'Wolverhampton Wanderers', shortName: 'WOL', country: 'England', isNational: false, primaryColor: '#F59E0B', secondaryColor: '#111827', rating: 76, stadium: 'Molineux Stadium' },

  // === GERMAN BUNDESLIGA (2024/25 — 18 Clubs) ===
  bun_fcb: { id: 'bun_fcb', name: 'Bayern Munich', shortName: 'FCB', country: 'Germany', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', rating: 89, stadium: 'Allianz Arena' },
  bun_b04: { id: 'bun_b04', name: 'Bayer Leverkusen', shortName: 'B04', country: 'Germany', isNational: false, primaryColor: '#111827', secondaryColor: '#DC2626', rating: 87, stadium: 'BayArena' },
  bun_bvb: { id: 'bun_bvb', name: 'Borussia Dortmund', shortName: 'BVB', country: 'Germany', isNational: false, primaryColor: '#EAB308', secondaryColor: '#111827', rating: 85, stadium: 'Signal Iduna Park' },
  bun_rbl: { id: 'bun_rbl', name: 'RB Leipzig', shortName: 'RBL', country: 'Germany', isNational: false, primaryColor: '#F8FAFC', secondaryColor: '#DC2626', rating: 84, stadium: 'Red Bull Arena' },
  bun_vfb: { id: 'bun_vfb', name: 'VfB Stuttgart', shortName: 'VFB', country: 'Germany', isNational: false, primaryColor: '#F8FAFC', secondaryColor: '#DC2626', rating: 82, stadium: 'MHPArena' },
  bun_sge: { id: 'bun_sge', name: 'Eintracht Frankfurt', shortName: 'SGE', country: 'Germany', isNational: false, primaryColor: '#111827', secondaryColor: '#DC2626', rating: 82, stadium: 'Deutsche Bank Park' },
  bun_scf: { id: 'bun_scf', name: 'SC Freiburg', shortName: 'SCF', country: 'Germany', isNational: false, primaryColor: '#DC2626', secondaryColor: '#111827', rating: 79, stadium: 'Europa-Park Stadion' },
  bun_tsg: { id: 'bun_tsg', name: 'TSG Hoffenheim', shortName: 'TSG', country: 'Germany', isNational: false, primaryColor: '#2563EB', secondaryColor: '#F8FAFC', rating: 77, stadium: 'PreZero Arena' },
  bun_svw: { id: 'bun_svw', name: 'Werder Bremen', shortName: 'SVW', country: 'Germany', isNational: false, primaryColor: '#15803D', secondaryColor: '#F8FAFC', rating: 78, stadium: 'Weserstadion' },
  bun_fch: { id: 'bun_fch', name: '1. FC Heidenheim', shortName: 'FCH', country: 'Germany', isNational: false, primaryColor: '#DC2626', secondaryColor: '#1D4ED8', rating: 76, stadium: 'Voith-Arena' },
  bun_fca: { id: 'bun_fca', name: 'FC Augsburg', shortName: 'FCA', country: 'Germany', isNational: false, primaryColor: '#F8FAFC', secondaryColor: '#15803D', accentColor: '#DC2626', rating: 76, stadium: 'WWK Arena' },
  bun_wob: { id: 'bun_wob', name: 'VfL Wolfsburg', shortName: 'WOB', country: 'Germany', isNational: false, primaryColor: '#16A34A', secondaryColor: '#F8FAFC', rating: 78, stadium: 'Volkswagen Arena' },
  bun_m05: { id: 'bun_m05', name: '1. FSV Mainz 05', shortName: 'M05', country: 'Germany', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', rating: 78, stadium: 'Mewa Arena' },
  bun_bmg: { id: 'bun_bmg', name: "Borussia M'gladbach", shortName: 'BMG', country: 'Germany', isNational: false, primaryColor: '#111827', secondaryColor: '#F8FAFC', accentColor: '#15803D', rating: 78, stadium: 'Borussia-Park' },
  bun_fcu: { id: 'bun_fcu', name: '1. FC Union Berlin', shortName: 'FCU', country: 'Germany', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', rating: 77, stadium: 'Stadion An der Alten Försterei' },
  bun_boc: { id: 'bun_boc', name: 'VfL Bochum', shortName: 'BOC', country: 'Germany', isNational: false, primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC', rating: 73, stadium: 'Vonovia Ruhrstadion' },
  bun_stp: { id: 'bun_stp', name: 'FC St. Pauli', shortName: 'STP', country: 'Germany', isNational: false, primaryColor: '#78350F', secondaryColor: '#F8FAFC', rating: 74, stadium: 'Millerntor-Stadion' },
  bun_ksv: { id: 'bun_ksv', name: 'Holstein Kiel', shortName: 'KSV', country: 'Germany', isNational: false, primaryColor: '#1D4ED8', secondaryColor: '#DC2626', rating: 72, stadium: 'Holstein-Stadion' },

  // === SPANISH LA LIGA (2024/25 — 20 Clubs) ===
  lal_rma: { id: 'lal_rma', name: 'Real Madrid', shortName: 'RMA', country: 'Spain', isNational: false, primaryColor: '#F8FAFC', secondaryColor: '#EAB308', rating: 91, stadium: 'Santiago Bernabéu' },
  lal_bar: { id: 'lal_bar', name: 'FC Barcelona', shortName: 'BAR', country: 'Spain', isNational: false, primaryColor: '#1D4ED8', secondaryColor: '#B91C1C', rating: 89, stadium: 'Estadi Olímpic' },
  lal_atm: { id: 'lal_atm', name: 'Atlético Madrid', shortName: 'ATM', country: 'Spain', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', accentColor: '#1D4ED8', rating: 86, stadium: 'Riyadh Air Metropolitano' },
  lal_ath: { id: 'lal_ath', name: 'Athletic Club', shortName: 'ATH', country: 'Spain', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', rating: 83, stadium: 'San Mamés' },
  lal_rso: { id: 'lal_rso', name: 'Real Sociedad', shortName: 'RSO', country: 'Spain', isNational: false, primaryColor: '#2563EB', secondaryColor: '#F8FAFC', rating: 81, stadium: 'Reale Arena' },
  lal_vil: { id: 'lal_vil', name: 'Villarreal CF', shortName: 'VIL', country: 'Spain', isNational: false, primaryColor: '#EAB308', secondaryColor: '#1D4ED8', rating: 82, stadium: 'Estadio de la Cerámica' },
  lal_bet: { id: 'lal_bet', name: 'Real Betis', shortName: 'BET', country: 'Spain', isNational: false, primaryColor: '#15803D', secondaryColor: '#F8FAFC', rating: 81, stadium: 'Benito Villamarín' },
  lal_gir: { id: 'lal_gir', name: 'Girona FC', shortName: 'GIR', country: 'Spain', isNational: false, primaryColor: '#DC2626', secondaryColor: '#F8FAFC', rating: 80, stadium: 'Estadi Montilivi' },
  lal_sev: { id: 'lal_sev', name: 'Sevilla FC', shortName: 'SEV', country: 'Spain', isNational: false, primaryColor: '#F8FAFC', secondaryColor: '#DC2626', rating: 79, stadium: 'Ramón Sánchez Pizjuán' },
  lal_val: { id: 'lal_val', name: 'Valencia CF', shortName: 'VAL', country: 'Spain', isNational: false, primaryColor: '#F8FAFC', secondaryColor: '#111827', accentColor: '#EA580C', rating: 78, stadium: 'Mestalla' },
  lal_osa: { id: 'lal_osa', name: 'CA Osasuna', shortName: 'OSA', country: 'Spain', isNational: false, primaryColor: '#B91C1C', secondaryColor: '#1E3A8A', rating: 78, stadium: 'El Sadar' },
  lal_cel: { id: 'lal_cel', name: 'RC Celta de Vigo', shortName: 'CEL', country: 'Spain', isNational: false, primaryColor: '#38BDF8', secondaryColor: '#F8FAFC', rating: 78, stadium: 'Balaídos' },
  lal_mll: { id: 'lal_mll', name: 'RCD Mallorca', shortName: 'MLL', country: 'Spain', isNational: false, primaryColor: '#DC2626', secondaryColor: '#111827', rating: 78, stadium: 'Son Moix' },
  lal_ray: { id: 'lal_ray', name: 'Rayo Vallecano', shortName: 'RAY', country: 'Spain', isNational: false, primaryColor: '#F8FAFC', secondaryColor: '#DC2626', rating: 77, stadium: 'Campo de Fútbol de Vallecas' },
  lal_get: { id: 'lal_get', name: 'Getafe CF', shortName: 'GET', country: 'Spain', isNational: false, primaryColor: '#1D4ED8', secondaryColor: '#F8FAFC', rating: 76, stadium: 'Coliseum' },
  lal_ala: { id: 'lal_ala', name: 'Deportivo Alavés', shortName: 'ALA', country: 'Spain', isNational: false, primaryColor: '#2563EB', secondaryColor: '#F8FAFC', rating: 76, stadium: 'Mendizorrotza' },
  lal_lpa: { id: 'lal_lpa', name: 'UD Las Palmas', shortName: 'LPA', country: 'Spain', isNational: false, primaryColor: '#EAB308', secondaryColor: '#2563EB', rating: 75, stadium: 'Estadio Gran Canaria' },
  lal_leg: { id: 'lal_leg', name: 'CD Leganés', shortName: 'LEG', country: 'Spain', isNational: false, primaryColor: '#2563EB', secondaryColor: '#F8FAFC', rating: 74, stadium: 'Butarque' },
  lal_esp: { id: 'lal_esp', name: 'RCD Espanyol', shortName: 'ESP', country: 'Spain', isNational: false, primaryColor: '#2563EB', secondaryColor: '#F8FAFC', rating: 75, stadium: 'RCDE Stadium' },
  lal_vll: { id: 'lal_vll', name: 'Real Valladolid', shortName: 'VLL', country: 'Spain', isNational: false, primaryColor: '#6D28D9', secondaryColor: '#F8FAFC', rating: 73, stadium: 'José Zorrilla' },
};

// Verified 32 real teams from FIFA World Cup 2022
export const WORLD_CUP_32_TEAMS: string[] = [
  'nat_qat', 'nat_ecu', 'nat_sen', 'nat_ned',
  'nat_eng', 'nat_irn', 'nat_usa', 'nat_wal',
  'nat_arg', 'nat_ksa', 'nat_mex', 'nat_pol',
  'nat_fra', 'nat_aus', 'nat_den', 'nat_tun',
  'nat_esp', 'nat_crc', 'nat_ger', 'nat_jpn',
  'nat_bel', 'nat_can', 'nat_mar', 'nat_cro',
  'nat_bra', 'nat_srb', 'nat_sui', 'nat_cmr',
  'nat_por', 'nat_gha', 'nat_uru', 'nat_kor',
];

// Curated 48 real national teams for FIFA World Cup Modern 48-team format (editable in Settings)
export const WORLD_CUP_48_TEAMS: string[] = [
  ...WORLD_CUP_32_TEAMS,
  'nat_ita', 'nat_col', 'nat_chi', 'nat_per',
  'nat_par', 'nat_ven', 'nat_aut', 'nat_tur',
  'nat_ukr', 'nat_cze', 'nat_nor', 'nat_swe',
  'nat_egy', 'nat_nga', 'nat_civ', 'nat_nzl',
];

// Verified 24 real participants of AFC Asian Cup 2023
export const AFC_ASIAN_CUP_2023_TEAMS: string[] = [
  'nat_qat', 'nat_chn', 'nat_tjk', 'nat_lbn',
  'nat_aus', 'nat_uzb', 'nat_syr', 'nat_ind',
  'nat_irn', 'nat_uae', 'nat_hkg', 'nat_ple',
  'nat_jpn', 'nat_idn', 'nat_irq', 'nat_vie',
  'nat_kor', 'nat_mas', 'nat_jor', 'nat_bhr',
  'nat_ksa', 'nat_tha', 'nat_kgz', 'nat_oma',
];

// Verified 24 real participants of UEFA Euro 2024
export const UEFA_EURO_2024_TEAMS: string[] = [
  'nat_ger', 'nat_sco', 'nat_hun', 'nat_sui',
  'nat_esp', 'nat_cro', 'nat_ita', 'nat_alb',
  'nat_svn', 'nat_den', 'nat_srb', 'nat_eng',
  'nat_pol', 'nat_ned', 'nat_aut', 'nat_fra',
  'nat_bel', 'nat_svk', 'nat_rou', 'nat_ukr',
  'nat_tur', 'nat_geo', 'nat_por', 'nat_cze',
];

// Verified 16 real participants of Copa América 2024
export const COPA_AMERICA_2024_TEAMS: string[] = [
  'nat_arg', 'nat_per', 'nat_chi', 'nat_can',
  'nat_mex', 'nat_ecu', 'nat_ven', 'nat_jam',
  'nat_usa', 'nat_uru', 'nat_pan', 'nat_bol',
  'nat_bra', 'nat_col', 'nat_par', 'nat_crc',
];

export const EPL_2024_25_TEAMS: string[] = [
  'epl_ars', 'epl_avl', 'epl_bou', 'epl_bre', 'epl_bha',
  'epl_che', 'epl_cry', 'epl_eve', 'epl_ful', 'epl_ips',
  'epl_lei', 'epl_liv', 'epl_mci', 'epl_mun', 'epl_new',
  'epl_nfo', 'epl_sou', 'epl_tot', 'epl_whu', 'epl_wol',
];

export const BUNDESLIGA_2024_25_TEAMS: string[] = [
  'bun_fcb', 'bun_b04', 'bun_bvb', 'bun_rbl', 'bun_vfb',
  'bun_sge', 'bun_scf', 'bun_tsg', 'bun_svw', 'bun_fch',
  'bun_fca', 'bun_wob', 'bun_m05', 'bun_bmg', 'bun_fcu',
  'bun_boc', 'bun_stp', 'bun_ksv',
];

export const LA_LIGA_2024_25_TEAMS: string[] = [
  'lal_rma', 'lal_bar', 'lal_atm', 'lal_ath', 'lal_rso',
  'lal_vil', 'lal_bet', 'lal_gir', 'lal_sev', 'lal_val',
  'lal_osa', 'lal_cel', 'lal_mll', 'lal_ray', 'lal_get',
  'lal_ala', 'lal_lpa', 'lal_leg', 'lal_esp', 'lal_vll',
];

// All real national teams available for FIFA World Cup Qualifiers (includes Vietnam and all AFC/UEFA/CONMEBOL/CONCACAF/CAF/OFC nations)
export const ALL_NATIONAL_TEAMS: string[] = Object.values(TEAMS)
  .filter((t) => t.isNational)
  .map((t) => t.id);

export const COMPETITIONS: Competition[] = [
  {
    id: 'fifa_world_cup',
    name: 'FIFA World Cup',
    shortName: 'World Cup',
    category: 'international',
    season: 'Qualifiers & Finals Edition',
    identity: 'Global International Championship',
    accentColor: '#EAB308',
    trophyName: 'FIFA World Cup Trophy',
    defaultFormatId: 'wc_qualifiers',
    participantTeamIds: WORLD_CUP_48_TEAMS,
    customizable: true,
    formats: [
      {
        id: 'wc_qualifiers',
        label: `Road to World Cup (Qualifiers → Finals · ${ALL_NATIONAL_TEAMS.length} Nations)`,
        formatType: 'world_cup_qualifiers',
        teamCount: ALL_NATIONAL_TEAMS.length,
        teamsPerGroup: 4,
        advancersPerGroup: 2,
        bestThirdCount: 0,
        description:
          'Start in Continental Qualifiers (incl. Vietnam & all nations): Top 2 reach World Cup Finals, 3rd enters Intercontinental Play-off',
      },
      {
        id: 'wc_32',
        label: 'Classic 32 Teams (2022 Finals)',
        formatType: 'group_knockout_32',
        teamCount: 32,
        groupCount: 8,
        teamsPerGroup: 4,
        advancersPerGroup: 2,
        bestThirdCount: 0,
        description: '8 groups of 4 · Top 2 advance to Round of 16',
      },
      {
        id: 'wc_48',
        label: 'Modern 48 Teams (2026 Finals)',
        formatType: 'group_knockout_48',
        teamCount: 48,
        groupCount: 12,
        teamsPerGroup: 4,
        advancersPerGroup: 2,
        bestThirdCount: 8,
        description: '12 groups of 4 · Top 2 + 8 best 3rd advance to Round of 32',
      },
    ],
  },
  {
    id: 'afc_asian_cup',
    name: 'AFC Asian Cup',
    shortName: 'Asian Cup',
    category: 'international',
    season: '2023 Edition',
    identity: 'Asian Football Confederation Finals',
    accentColor: '#10B981',
    trophyName: 'AFC Asian Cup Trophy',
    defaultFormatId: 'afc_24',
    participantTeamIds: AFC_ASIAN_CUP_2023_TEAMS,
    customizable: true,
    formats: [
      {
        id: 'afc_24',
        label: '24 Teams (2023 Verified)',
        formatType: 'group_knockout_24',
        teamCount: 24,
        groupCount: 6,
        teamsPerGroup: 4,
        advancersPerGroup: 2,
        bestThirdCount: 4,
        description: '6 groups of 4 · Top 2 + 4 best 3rd advance to Round of 16',
      },
    ],
  },
  {
    id: 'uefa_euro',
    name: 'UEFA European Championship',
    shortName: 'UEFA Euro',
    category: 'international',
    season: '2024 Edition',
    identity: 'European National Championship',
    accentColor: '#3B82F6',
    trophyName: 'Henri Delaunay Cup',
    defaultFormatId: 'euro_24',
    participantTeamIds: UEFA_EURO_2024_TEAMS,
    customizable: true,
    formats: [
      {
        id: 'euro_24',
        label: '24 Teams (2024 Verified)',
        formatType: 'group_knockout_24',
        teamCount: 24,
        groupCount: 6,
        teamsPerGroup: 4,
        advancersPerGroup: 2,
        bestThirdCount: 4,
        description: '6 groups of 4 · Top 2 + 4 best 3rd advance to Round of 16',
      },
    ],
  },
  {
    id: 'copa_america',
    name: 'Copa América',
    shortName: 'Copa América',
    category: 'international',
    season: '2024 Edition',
    identity: 'CONMEBOL Continental Championship',
    accentColor: '#38BDF8',
    trophyName: 'Copa América Trophy',
    defaultFormatId: 'copa_16',
    participantTeamIds: COPA_AMERICA_2024_TEAMS,
    customizable: true,
    formats: [
      {
        id: 'copa_16',
        label: '16 Teams (2024 Verified)',
        formatType: 'group_knockout_16',
        teamCount: 16,
        groupCount: 4,
        teamsPerGroup: 4,
        advancersPerGroup: 2,
        bestThirdCount: 0,
        description: '4 groups of 4 · Top 2 advance to Quarter-finals',
      },
    ],
  },
  {
    id: 'epl',
    name: 'English Premier League',
    shortName: 'Premier League',
    category: 'league',
    season: '2024/25 Season',
    identity: 'England Top-Flight League',
    accentColor: '#A855F7',
    trophyName: 'Premier League Trophy',
    defaultFormatId: 'epl_20',
    participantTeamIds: EPL_2024_25_TEAMS,
    customizable: true,
    formats: [
      {
        id: 'epl_20',
        label: '20 Clubs · Double Round-Robin',
        formatType: 'double_round_robin',
        teamCount: 20,
        description: '38 matches per club · 3 pts Win, 1 pt Draw, 0 pts Loss',
      },
    ],
  },
  {
    id: 'bundesliga',
    name: 'German Bundesliga',
    shortName: 'Bundesliga',
    category: 'league',
    season: '2024/25 Season',
    identity: 'Germany Top-Flight League',
    accentColor: '#EF4444',
    trophyName: 'Meisterschale',
    defaultFormatId: 'bun_18',
    participantTeamIds: BUNDESLIGA_2024_25_TEAMS,
    customizable: true,
    formats: [
      {
        id: 'bun_18',
        label: '18 Clubs · Double Round-Robin',
        formatType: 'double_round_robin',
        teamCount: 18,
        description: '34 matches per club · 3 pts Win, 1 pt Draw, 0 pts Loss',
      },
    ],
  },
  {
    id: 'la_liga',
    name: 'Spanish La Liga',
    shortName: 'La Liga',
    category: 'league',
    season: '2024/25 Season',
    identity: 'Spain Top-Flight League',
    accentColor: '#F97316',
    trophyName: 'La Liga Trophy',
    defaultFormatId: 'lal_20',
    participantTeamIds: LA_LIGA_2024_25_TEAMS,
    customizable: true,
    formats: [
      {
        id: 'lal_20',
        label: '20 Clubs · Double Round-Robin',
        formatType: 'double_round_robin',
        teamCount: 20,
        description: '38 matches per club · 3 pts Win, 1 pt Draw, 0 pts Loss',
      },
    ],
  },
];

export function getCompetitionById(id: string): Competition | undefined {
  return COMPETITIONS.find((c) => c.id === id);
}

export function getTeamById(id: string): Team {
  return (
    TEAMS[id] ?? {
      id,
      name: id,
      shortName: id.slice(0, 3).toUpperCase(),
      country: 'Unknown',
      isNational: false,
      primaryColor: '#334155',
      secondaryColor: '#F8FAFC',
      rating: 75,
    }
  );
}

export function getParticipantsForCompetitionFormat(
  competitionId: string,
  formatId: string,
  customOverrides?: Record<string, string[]>
): string[] {
  const overrideKey = `${competitionId}:${formatId}`;
  if (customOverrides?.[overrideKey]?.length) {
    return customOverrides[overrideKey];
  }
  if (competitionId === 'fifa_world_cup') {
    if (formatId === 'wc_qualifiers') return ALL_NATIONAL_TEAMS;
    return formatId === 'wc_48' ? WORLD_CUP_48_TEAMS : WORLD_CUP_32_TEAMS;
  }
  const comp = getCompetitionById(competitionId);
  return comp ? comp.participantTeamIds : [];
}
