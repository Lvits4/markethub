import type { CSSProperties } from 'react';

/** Estilos de Tooltip de Recharts alineados con el panel admin (claro / oscuro). */
export function getRechartsTooltipStyles(isDark: boolean): {
  contentStyle: CSSProperties;
  labelStyle: CSSProperties;
} {
  if (isDark) {
    return {
      contentStyle: {
        borderRadius: 6,
        border: '1px solid rgb(255 255 255 / 0.08)',
        fontSize: 12,
        backgroundColor: '#141516',
        boxShadow: 'none',
      },
      labelStyle: {
        color: '#a1a1aa',
        marginBottom: 4,
      },
    };
  }
  return {
    contentStyle: {
      borderRadius: 6,
      border: '1px solid rgb(0 0 0 / 0.08)',
      fontSize: 12,
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 8px rgb(0 0 0 / 0.06)',
    },
    labelStyle: {
      color: '#71717a',
      marginBottom: 4,
    },
  };
}
