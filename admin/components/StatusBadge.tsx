import React from 'react';

interface StatusBadgeProps {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  active,
  activeLabel = 'פעיל',
  inactiveLabel = 'לא פעיל',
}) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
    }`}
  >
    {active ? activeLabel : inactiveLabel}
  </span>
);

export default StatusBadge;
