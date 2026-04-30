import React from 'react';
import { Text, View } from 'react-native';
import {
  AlertTriangle,
  Ban,
  BarChart3,
  Brain,
  CheckCircle,
  ChevronDown,
  ShieldCheck,
  Swords,
  TrendingUp,
  Users,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { useTranslations } from '../../../i18n';
import type { AnyMatch } from '../../../api/useMatchById';

type Match = Record<string, unknown> & AnyMatch;

export function DecisionSummary({ match }: { match: Match }) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  const cp = (match.consolidatedPredictions ?? {}) as Record<string, any>;
  const mw = (cp.matchWinner ?? {}) as Record<string, any>;
  const hb = (mw.home_benchmarks ?? {}) as Record<string, any>;
  const ab = (mw.away_benchmarks ?? {}) as Record<string, any>;
  const weights = (mw.weights_used ?? {}) as Record<string, any>;
  const mwOdds = ((match.odds as Record<string, any> | undefined)?.matchWinner ?? {}) as Record<string, any>;
  const ta = (match.tipster_analysis ?? {}) as Record<string, any>;

  const homeName = (match.home as { name?: string } | undefined)?.name ?? 'Home';
  const awayName = (match.away as { name?: string } | undefined)?.name ?? 'Away';
  const shortHome = shortName(homeName);
  const shortAway = shortName(awayName);

  const mlHome = toNum(hb.ml_home);
  const mlWeight = toNum(weights.ml);
  const usedFormWr = hb.used_form_wr === true;
  const guardReason = typeof hb.guard_reason === 'string' ? (hb.guard_reason as string) : undefined;
  const tipsterWeight = toNum(weights.tipster_points) ?? 0;
  const tipsterHomeProb = toNum(hb.tipster_home_prob);
  const homeFormWr = toNum(hb.home_form_win_rate);
  const awayFormWr = toNum(ab.away_form_win_rate);
  const finalHome = toNum(mw.home_probability);
  const finalAway = toNum(mw.away_probability);
  const homeOd = toNum(mwOdds.home_od) ?? toNum(mw.home_od_float);
  const awayOd = toNum(mwOdds.away_od) ?? toNum(mw.away_od_float);
  const impliedHome = homeOd ? (1 / homeOd) * 100 : null;
  const impliedAway = awayOd ? (1 / awayOd) * 100 : null;

  const tpSummary =
    ((ta.comparative_analysis as Record<string, any> | undefined)?.summary as
      | Record<string, any>
      | undefined) ?? {};
  const tpHomePoints = toNum(tpSummary.home_total_points) ?? 0;
  const tpAwayPoints = toNum(tpSummary.away_total_points) ?? 0;

  const favHome = (finalHome ?? 50) >= 50;
  const favName = favHome ? shortHome : shortAway;
  const favProb = favHome ? finalHome : finalAway;

  const factors = buildFactors(
    {
      mlHome, usedFormWr, homeFormWr, awayFormWr,
      guardReason, tipsterWeight, tipsterHomeProb,
      tpHomePoints, tpAwayPoints, shortHome, shortAway,
      match, favHome,
    },
    t,
    colors,
  );

  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        padding: 14,
        gap: 14,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingBottom: 10,
        }}
      >
        <ShieldCheck size={16} color={colors.primary} strokeWidth={2.5} />
        <Text
          allowFontScaling={false}
          style={{ color: colors.textPrimary, fontSize: 14, fontWeight: '800' }}
        >
          {t('decisionSummary.title')}
        </Text>
      </View>

      <View style={{ gap: 8 }}>
        <SectionLabel>{t('decisionSummary.howWeGotHere')}</SectionLabel>
        <PipelineStep
          icon={Brain}
          label={t('decisionSummary.aiModel')}
          value={mlHome != null ? formatMl(mlHome, shortHome, shortAway) : '—'}
          subtitle={
            mlWeight != null
              ? mlWeight >= 0.7
                ? t('decisionSummary.primarySignal')
                : t('decisionSummary.supportingSignal')
              : undefined
          }
          variant="default"
        />
        <PipelineArrow />
        <PipelineStep
          icon={TrendingUp}
          label={t('decisionSummary.recentForm')}
          value={
            usedFormWr
              ? formatForm(homeFormWr, awayFormWr, shortHome, shortAway)
              : t('decisionSummary.skipped')
          }
          subtitle={
            usedFormWr
              ? t('decisionSummary.active')
              : guardReason
                ? t('decisionSummary.leagueVolatile')
                : t('decisionSummary.tooSimilar')
          }
          variant={usedFormWr ? 'default' : 'disabled'}
        />
        <PipelineArrow />
        <PipelineStep
          icon={Users}
          label={t('decisionSummary.statsAnalysis')}
          value={
            tipsterWeight > 0
              ? formatTipster(tipsterHomeProb, shortHome, shortAway)
              : formatTipsterPoints(tpHomePoints, tpAwayPoints, shortHome, shortAway)
          }
          subtitle={
            tipsterWeight > 0
              ? t('decisionSummary.active')
              : t('decisionSummary.notEnoughEdge')
          }
          variant={tipsterWeight > 0 ? 'default' : 'disabled'}
        />
        <PipelineArrow />
        <PipelineStep
          icon={ShieldCheck}
          label={t('decisionSummary.final')}
          value={finalHome != null ? `${Math.round(favProb ?? 0)}% ${favName}` : '—'}
          variant="result"
        />
      </View>

      <View style={{ gap: 8 }}>
        <SectionLabel>{t('decisionSummary.whyThisPrediction')}</SectionLabel>
        {factors.length > 0 ? (
          factors.map((f, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <View style={{ marginTop: 2 }}>{f.icon}</View>
              <Text
                allowFontScaling={false}
                style={{
                  flex: 1,
                  color: colors.textSecondary,
                  fontSize: 12,
                  lineHeight: 17,
                }}
              >
                {f.text}
              </Text>
            </View>
          ))
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {t('decisionSummary.noAnalysisData')}
          </Text>
        )}
      </View>

      <View
        style={{
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          backgroundColor: colors.surfaceMuted,
          padding: 12,
          gap: 8,
        }}
      >
        <SectionLabel>{t('decisionSummary.marketVsModel')}</SectionLabel>
        {homeOd != null && awayOd != null ? (
          <View style={{ gap: 6 }}>
            <KVRow
              label={t('decisionSummary.marketOdds')}
              value={`${homeOd.toFixed(2)} / ${awayOd.toFixed(2)}`}
              mono
            />
            <KVRow
              label={t('decisionSummary.impliedProb')}
              value={`${Math.round(impliedHome ?? 0)}% / ${Math.round(impliedAway ?? 0)}%`}
              mono
              muted
            />
            <KVRow
              label={t('decisionSummary.modelProb')}
              value={`${Math.round(finalHome ?? 0)}% / ${Math.round(finalAway ?? 0)}%`}
              mono
            />
            {impliedHome != null && finalHome != null && (
              <ModelEdge
                impliedHome={impliedHome}
                finalHome={finalHome}
                shortHome={shortHome}
                shortAway={shortAway}
              />
            )}
          </View>
        ) : (
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {t('decisionSummary.noOddsData')}
          </Text>
        )}
      </View>
    </View>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text
      allowFontScaling={false}
      style={{
        color: colors.textMuted,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  );
}

function PipelineArrow() {
  const { colors } = useTheme();
  return (
    <View style={{ alignSelf: 'center' }}>
      <ChevronDown size={16} color={colors.textMuted} strokeWidth={2.5} />
    </View>
  );
}

function PipelineStep({
  icon: Icon,
  label,
  value,
  subtitle,
  variant,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  variant: 'default' | 'disabled' | 'result';
}) {
  const { colors } = useTheme();
  const isResult = variant === 'result';
  const isDisabled = variant === 'disabled';
  const bg = isResult
    ? hexWithAlpha(colors.primary, 0.1)
    : isDisabled
      ? colors.surfaceMuted
      : colors.surfaceMuted;
  const border = isResult
    ? hexWithAlpha(colors.primary, 0.3)
    : colors.border;
  const labelColor = isResult ? colors.primary : colors.textMuted;
  const valueColor = isDisabled ? colors.textMuted : colors.textPrimary;

  return (
    <View
      style={{
        borderRadius: 10,
        borderWidth: 1,
        borderColor: border,
        backgroundColor: bg,
        padding: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon size={14} color={labelColor} strokeWidth={2.5} />
        <Text
          allowFontScaling={false}
          style={{
            color: labelColor,
            fontSize: 10,
            fontWeight: '700',
            letterSpacing: 0.4,
            textTransform: 'uppercase',
            flex: 1,
          }}
        >
          {label}
        </Text>
        {subtitle && (
          <Text
            allowFontScaling={false}
            style={{ color: colors.textMuted, fontSize: 10, fontWeight: '600' }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      <Text
        allowFontScaling={false}
        numberOfLines={1}
        style={{
          marginTop: 4,
          color: valueColor,
          fontSize: isResult ? 14 : 13,
          fontWeight: '800',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function KVRow({
  label,
  value,
  mono,
  muted,
}: {
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text
        allowFontScaling={false}
        style={{ color: colors.textMuted, fontSize: 12 }}
      >
        {label}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          color: muted ? colors.textMuted : colors.textPrimary,
          fontSize: 12,
          fontWeight: '700',
          fontVariant: mono ? ['tabular-nums'] : undefined,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function ModelEdge({
  impliedHome,
  finalHome,
  shortHome,
  shortAway,
}: {
  impliedHome: number;
  finalHome: number;
  shortHome: string;
  shortAway: string;
}) {
  const { colors } = useTheme();
  const { t } = useTranslations('analysis');
  const homeEdge = finalHome - impliedHome;
  const hasEdge = Math.abs(homeEdge) >= 1;
  const edgeSide = homeEdge > 0 ? shortHome : shortAway;
  const edgeVal = Math.abs(homeEdge);
  const strong = edgeVal >= 5;

  if (!hasEdge) {
    return (
      <Text
        allowFontScaling={false}
        style={{
          color: colors.textMuted,
          fontSize: 12,
          paddingTop: 6,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        {t('decisionSummary.noSignificantEdge')}
      </Text>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 6,
        borderTopWidth: 1,
        borderTopColor: colors.border,
      }}
    >
      <Text
        allowFontScaling={false}
        style={{ color: colors.textMuted, fontSize: 12 }}
      >
        {t('decisionSummary.edge')}
      </Text>
      <Text
        allowFontScaling={false}
        style={{
          color: strong ? colors.success : colors.primary,
          fontSize: 13,
          fontWeight: '800',
          fontVariant: ['tabular-nums'],
        }}
      >
        +{edgeVal.toFixed(1)}% {edgeSide}
      </Text>
    </View>
  );
}

type Factor = { icon: React.ReactNode; text: string };

type FactorInput = {
  mlHome: number | null;
  usedFormWr: boolean;
  homeFormWr: number | null;
  awayFormWr: number | null;
  guardReason: string | undefined;
  tipsterWeight: number;
  tipsterHomeProb: number | null;
  tpHomePoints: number;
  tpAwayPoints: number;
  shortHome: string;
  shortAway: string;
  match: Match;
  favHome: boolean;
};

function buildFactors(
  input: FactorInput,
  t: (key: string, values?: Record<string, string | number>) => string,
  colors: ReturnType<typeof useTheme>['colors'],
): Factor[] {
  const factors: Factor[] = [];

  if (input.mlHome != null) {
    const diff = Math.abs(input.mlHome - 50);
    if (diff < 2) {
      factors.push({
        icon: <Brain size={14} color={colors.primary} strokeWidth={2.5} />,
        text: t('decisionSummary.why.coinFlip'),
      });
    } else {
      const mlFav = input.mlHome >= 50 ? input.shortHome : input.shortAway;
      const key = diff >= 20 ? 'stronglyFavors' : diff >= 10 ? 'favors' : 'slightlyFavors';
      factors.push({
        icon: <Brain size={14} color={colors.primary} strokeWidth={2.5} />,
        text: t(`decisionSummary.why.${key}`, { player: mlFav }),
      });
    }
  }

  if (input.usedFormWr && input.homeFormWr != null && input.awayFormWr != null) {
    const formFav = input.homeFormWr > input.awayFormWr ? input.shortHome : input.shortAway;
    const formDiff = Math.abs(input.homeFormWr - input.awayFormWr);
    const desc =
      formDiff >= 20
        ? t('decisionSummary.why.significantlyBetter')
        : t('decisionSummary.why.better');
    factors.push({
      icon: <TrendingUp size={14} color={colors.success} strokeWidth={2.5} />,
      text: t('decisionSummary.why.betterForm', {
        player: formFav,
        desc,
        homeWr: Math.round(input.homeFormWr),
        awayWr: Math.round(input.awayFormWr),
      }),
    });
  } else if (input.guardReason) {
    factors.push({
      icon: <AlertTriangle size={14} color={colors.warning} strokeWidth={2.5} />,
      text: t('decisionSummary.why.formSkipped'),
    });
  } else {
    factors.push({
      icon: <Ban size={14} color={colors.textMuted} strokeWidth={2.5} />,
      text: t('decisionSummary.why.formSimilar'),
    });
  }

  if (input.tipsterWeight > 0 && input.tipsterHomeProb != null) {
    const tpFav = input.tipsterHomeProb >= 50 ? input.shortHome : input.shortAway;
    const diff = Math.abs(input.tpHomePoints - input.tpAwayPoints);
    const strength =
      diff >= 20
        ? t('decisionSummary.why.strong')
        : diff >= 10
          ? t('decisionSummary.why.clear')
          : t('decisionSummary.why.slight');
    factors.push({
      icon: <Users size={14} color={colors.primary} strokeWidth={2.5} />,
      text: t('decisionSummary.why.strongEdge', { strength, player: tpFav }),
    });
  } else if (input.tpHomePoints > 0 || input.tpAwayPoints > 0) {
    const tpFav = input.tpHomePoints > input.tpAwayPoints ? input.shortHome : input.shortAway;
    factors.push({
      icon: <Users size={14} color={colors.textMuted} strokeWidth={2.5} />,
      text: t('decisionSummary.why.statsLean', { player: tpFav }),
    });
  }

  const h2h = getH2HFactor(input.match, input.favHome, input.shortHome, input.shortAway, t, colors);
  if (h2h) factors.push(h2h);

  const role = getRoleFactor(input.match, input.shortHome, input.shortAway, t, colors);
  if (role) factors.push(role);

  return factors;
}

function getH2HFactor(
  match: Match,
  favHome: boolean,
  shortHome: string,
  shortAway: string,
  t: (key: string, values?: Record<string, string | number>) => string,
  colors: ReturnType<typeof useTheme>['colors'],
): Factor | null {
  const ta = (match.tipster_analysis ?? {}) as Record<string, any>;
  const tc = (ta.temporal_comparison as Record<string, any> | undefined) ?? {};
  const h2hSummary = (ta.h2h_summary as Record<string, any> | undefined) ?? {};
  const tcWindows = (tc.windows as Record<string, any> | undefined) ?? {};
  const homeIsPlayerA = h2hSummary.home_is_player_a ?? true;

  const priority = ['last10', 'last20', 'last5', 'last50'];
  let homeWins = 0;
  let awayWins = 0;
  let totalMatches = 0;
  let bestWindow: string | null = null;

  for (const w of priority) {
    const wd = tcWindows[w] as Record<string, any> | undefined;
    const r = wd?.results as Record<string, any> | undefined;
    if (!r) continue;
    const total = (r.player_a_won ?? 0) + (r.player_b_won ?? 0);
    if (total >= 3) {
      homeWins = homeIsPlayerA ? (r.player_a_won ?? 0) : (r.player_b_won ?? 0);
      awayWins = homeIsPlayerA ? (r.player_b_won ?? 0) : (r.player_a_won ?? 0);
      totalMatches = total;
      bestWindow = w;
      break;
    }
  }

  if (!bestWindow || totalMatches < 3) return null;

  const h2hHomeRate = homeWins / totalMatches;
  const favorsHome = h2hHomeRate > 0.5;
  const isEven = Math.abs(h2hHomeRate - 0.5) < 0.1;
  const windowLabel = WINDOW_LABELS[bestWindow] ?? bestWindow;

  if (isEven) {
    return {
      icon: <Swords size={14} color={colors.textMuted} strokeWidth={2.5} />,
      text: t('decisionSummary.why.h2hEven', {
        home: homeWins,
        away: awayWins,
        window: windowLabel,
      }),
    };
  }

  const h2hFavName = favorsHome ? shortHome : shortAway;
  const h2hRate = Math.round((favorsHome ? h2hHomeRate : 1 - h2hHomeRate) * 100);
  const confirms = favorsHome === favHome;

  if (confirms) {
    return {
      icon: <CheckCircle size={14} color={colors.success} strokeWidth={2.5} />,
      text: t('decisionSummary.why.h2hSupports', {
        player: h2hFavName,
        rate: h2hRate,
        total: totalMatches,
      }),
    };
  }

  return {
    icon: <AlertTriangle size={14} color={colors.warning} strokeWidth={2.5} />,
    text: t('decisionSummary.why.h2hCaution', {
      player: h2hFavName,
      home: homeWins,
      away: awayWins,
      total: totalMatches,
    }),
  };
}

function getRoleFactor(
  match: Match,
  shortHome: string,
  shortAway: string,
  t: (key: string, values?: Record<string, string | number>) => string,
  colors: ReturnType<typeof useTheme>['colors'],
): Factor | null {
  const ta = (match.tipster_analysis ?? {}) as Record<string, any>;
  const ob = (ta.odds_buckets_analysis as Record<string, any> | undefined) ?? {};
  const coa = (ob.current_odds_analysis as Record<string, any> | undefined) ?? {};
  const home = coa.home as Record<string, any> | undefined;
  const away = coa.away as Record<string, any> | undefined;
  if (!home && !away) return null;

  const homeWR = toNum(home?.historical_win_rate) ?? 0;
  const awayWR = toNum(away?.historical_win_rate) ?? 0;
  const homeImp = toNum(home?.implied_probability) ?? 0;
  const awayImp = toNum(away?.implied_probability) ?? 0;
  const homeDiff = homeWR - homeImp;
  const awayDiff = awayWR - awayImp;

  if (Math.abs(homeDiff) < 5 && Math.abs(awayDiff) < 5) return null;

  const bigger = Math.abs(homeDiff) >= Math.abs(awayDiff);
  const who = bigger ? shortHome : shortAway;
  const diff = bigger ? homeDiff : awayDiff;
  const odds = String((bigger ? home?.odds_bucket : away?.odds_bucket) ?? '');

  if (diff > 0) {
    return {
      icon: <BarChart3 size={14} color={colors.success} strokeWidth={2.5} />,
      text: t('decisionSummary.why.outperforms', {
        player: who,
        odds,
        diff: diff.toFixed(0),
      }),
    };
  }

  return {
    icon: <BarChart3 size={14} color={colors.warning} strokeWidth={2.5} />,
    text: t('decisionSummary.why.underperforms', {
      player: who,
      odds,
      diff: Math.abs(diff).toFixed(0),
    }),
  };
}

const WINDOW_LABELS: Record<string, string> = {
  last5: 'last 5',
  last10: 'last 10',
  last20: 'last 20',
  last50: 'last 50',
};

function formatMl(mlHome: number, shortHome: string, shortAway: string): string {
  const diff = Math.abs(mlHome - 50);
  if (diff < 2) return 'Coin flip';
  const fav = mlHome >= 50 ? shortHome : shortAway;
  const pct = mlHome >= 50 ? mlHome : 100 - mlHome;
  return `${Math.round(pct)}% ${fav}`;
}

function formatForm(
  homeWr: number | null,
  awayWr: number | null,
  shortHome: string,
  shortAway: string,
): string {
  if (homeWr == null || awayWr == null) return '—';
  const fav = homeWr > awayWr ? shortHome : shortAway;
  return `${fav} in better form`;
}

function formatTipster(
  tipsterHomeProb: number | null,
  shortHome: string,
  shortAway: string,
): string {
  if (tipsterHomeProb == null) return '—';
  const fav = tipsterHomeProb >= 50 ? shortHome : shortAway;
  const pct = tipsterHomeProb >= 50 ? tipsterHomeProb : 100 - tipsterHomeProb;
  return `${Math.round(pct)}% ${fav}`;
}

function formatTipsterPoints(
  homeP: number,
  awayP: number,
  shortHome: string,
  shortAway: string,
): string {
  if (homeP === 0 && awayP === 0) return 'No data';
  const fav = homeP > awayP ? shortHome : shortAway;
  return `Leans ${fav}`;
}

function shortName(fullName: string): string {
  const parts = (fullName || '').split(/\s+/).filter(Boolean);
  for (let i = parts.length - 1; i >= 0; i--) {
    if (!/^\d+$/.test(parts[i])) return parts[i];
  }
  return parts[parts.length - 1] || fullName;
}

function toNum(v: unknown): number | null {
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(1, alpha));
  const aHex = Math.round(a * 255).toString(16).padStart(2, '0');
  const normalized =
    hex.length === 4
      ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
      : hex;
  return `${normalized}${aHex}`;
}
