import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Screen } from '../types';
import { styles } from '../styles';

interface NavButtonProps {
  screen: Screen;
  label: string;
  icon: LucideIcon;
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
}

export const NavButton: React.FC<NavButtonProps> = ({
  screen,
  label,
  icon: Icon,
  activeScreen,
  onNavigate,
}) => (
  <button
    onClick={() => onNavigate(screen)}
    className={`flex flex-col items-center justify-center p-4 border-b-2 transition-all w-full ${
      activeScreen === screen ? styles.navActive : styles.navInactive
    }`}
  >
    <Icon className={`w-6 h-6 mb-2 ${styles.iconColor}`} />
    <span className="text-sm font-medium whitespace-nowrap">{label}</span>
  </button>
);

