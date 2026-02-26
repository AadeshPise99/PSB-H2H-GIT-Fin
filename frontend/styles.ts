/**
 * Shared styles for PSB H2H AutoFlow application
 * This file contains all reusable style constants
 */

export const styles = {
  // Primary button style - navy blue with purple hover effects
  primaryBtn: "bg-[#303087] hover:bg-[#973795] text-white font-semibold transition-all shadow-md active:transform active:scale-95 flex items-center justify-center",

  // Icon color - navy blue
  iconColor: "text-[#303087]",

  // Input style with white background and subtle border
  input: "bg-white text-gray-800 border-gray-300 focus:border-[#303087] focus:ring-1 focus:ring-[#303087] rounded-lg shadow-sm border p-3 text-sm placeholder-gray-400 transition-all w-full",

  // Label style - uppercase, small
  label: "block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide",

  // Navigation active state
  navActive: "border-[#303087] text-[#303087] bg-white",

  // Navigation inactive state
  navInactive: "border-transparent text-gray-500 hover:text-[#973795] hover:bg-gray-50",

  // Section header style
  sectionHeader: "text-sm font-bold text-gray-800 uppercase tracking-wider border-b border-gray-200 pb-2 mb-4 flex items-center gap-2",

  // Secondary/outline button style
  secondaryBtn: "text-xs border border-[#303087] text-[#303087] hover:bg-[#303087] hover:text-white px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors font-medium",
};

// Color palette for reference
export const colors = {
  primary: '#303087',      // Deep navy blue
  secondary: '#973795',    // Purple
  accent: '#FFFFFF',       // White
  dark: '#0F172A',         // Dark slate
  darkAlt: '#1E293B',      // Darker slate
};

export type AppStyles = typeof styles;

