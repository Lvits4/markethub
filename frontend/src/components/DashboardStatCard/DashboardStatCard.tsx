import type { ReactNode } from 'react';
import { OverflowTooltip } from '../OverflowTooltip/OverflowTooltip';

type DashboardStatCardProps = {
  label: ReactNode;
  value: string | number;
  icon: ReactNode;
  iconClassName?: string;
};

function labelTooltip(label: ReactNode): string {
  if (typeof label === 'string' || typeof label === 'number') return String(label);
  return '';
}

export function DashboardStatCard({
  label,
  value,
  icon,
  iconClassName = 'text-blue-500 dark:text-market-dark-accent',
}: DashboardStatCardProps) {
  const labelText = labelTooltip(label);
  const valueText = String(value);

  return (
    <div className="pro-stat-card">
      <div className={`pro-stat-card__icon ${iconClassName}`} aria-hidden>
        {icon}
      </div>
      <OverflowTooltip
        as="p"
        tooltip={labelText}
        className="pro-stat-card__label"
      >
        {label}
      </OverflowTooltip>
      <OverflowTooltip
        as="p"
        tooltip={valueText}
        className="pro-stat-card__value"
      >
        {value}
      </OverflowTooltip>
    </div>
  );
}
