import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export const VazadoIcon = ({ size = 24, color = '#6B7280' }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Head */}
      <Circle cx="70" cy="30" r="18" stroke={color} strokeWidth="12" />
      
      {/* Walking Stick */}
      <Path d="M112 52V160" stroke={color} strokeWidth="12" strokeLinecap="round" />
      
      {/* Backpack */}
      <Path 
        d="M48 40L18 80C14 88 22 100 32 96L50 70" 
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Torso & Arms */}
      <Path 
        d="M68 50C85 60 100 75 112 85" 
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round" 
      />
      <Path 
        d="M60 52C40 70 50 110 85 120" 
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Back Leg */}
      <Path 
        d="M40 116L20 152L10 188" 
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Front Leg (climbing step) */}
      <Path 
        d="M72 114L74 148L96 168" 
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      
      {/* Mountain Slope & Wall */}
      <Path 
        d="M190 188H48L96 172L132 156L132 106L144 65L176 25V188" 
        stroke={color} 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </Svg>
  );
};

export default VazadoIcon;
