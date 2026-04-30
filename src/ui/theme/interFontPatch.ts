import React from 'react';
import { Text, TextInput, StyleSheet, TextStyle } from 'react-native';

type AnyWeight = TextStyle['fontWeight'];

function interFamilyForWeight(weight: AnyWeight, italic: boolean): string {
  const w = typeof weight === 'string' ? weight : weight != null ? String(weight) : '400';
  const isBoldWord = w === 'bold';
  const isNormalWord = w === 'normal';
  const n = isBoldWord ? 700 : isNormalWord ? 400 : Number(w) || 400;
  const _ = italic;
  if (n >= 800) return 'Inter_800ExtraBold';
  if (n >= 700) return 'Inter_700Bold';
  if (n >= 600) return 'Inter_600SemiBold';
  if (n >= 500) return 'Inter_500Medium';
  return 'Inter_400Regular';
}

function resolveStyle(style: unknown): TextStyle {
  const flat = StyleSheet.flatten(style as never) as TextStyle | undefined;
  return flat || {};
}

function injectFamily(style: unknown): unknown {
  const flat = resolveStyle(style);
  if (flat.fontFamily) return style;
  const family = interFamilyForWeight(
    flat.fontWeight,
    (flat.fontStyle as string) === 'italic',
  );
  return [{ fontFamily: family }, style];
}

let applied = false;

export function applyInterFontPatch() {
  if (applied) return;
  applied = true;

  const TextAny = Text as unknown as {
    render?: (...args: unknown[]) => React.ReactNode;
  };
  const originalRender = TextAny.render;
  if (typeof originalRender === 'function') {
    TextAny.render = function patchedRender(...args: unknown[]) {
      const rendered = originalRender.apply(this, args) as React.ReactElement<{
        style?: unknown;
      }>;
      if (!rendered) return rendered;
      return React.cloneElement(rendered, {
        style: injectFamily(rendered.props.style),
      });
    };
  }

  const InputAny = TextInput as unknown as {
    defaultProps?: { style?: unknown };
    render?: (...args: unknown[]) => React.ReactNode;
  };
  const originalInputRender = InputAny.render;
  if (typeof originalInputRender === 'function') {
    InputAny.render = function patchedInputRender(...args: unknown[]) {
      const rendered = originalInputRender.apply(this, args) as React.ReactElement<{
        style?: unknown;
      }>;
      if (!rendered) return rendered;
      return React.cloneElement(rendered, {
        style: injectFamily(rendered.props.style),
      });
    };
  } else {
    InputAny.defaultProps = InputAny.defaultProps || {};
    InputAny.defaultProps.style = [
      { fontFamily: 'Inter_400Regular' },
      InputAny.defaultProps.style,
    ];
  }
}
