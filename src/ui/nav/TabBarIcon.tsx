import React from 'react';

export type TabIconComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

type Props = {
  Icon: TabIconComponent;
  focused: boolean;
  color: string;
  size?: number;
};

export function TabBarIcon({ Icon, focused, color, size = 24 }: Props) {
  return <Icon size={size} color={color} strokeWidth={focused ? 2.5 : 1.75} />;
}
