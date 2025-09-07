import React from 'react';
import { ChefHat, Utensils } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const colors = variant === 'light' 
    ? 'text-white' 
    : 'text-gray-900';

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg relative`}>
        <ChefHat className={`${iconSizes[size]} text-white z-10`} />
        <Utensils className="w-3 h-3 text-white/80 absolute bottom-1 right-1" />
      </div>
      <div>
        <h1 className={`${textSizes[size]} font-bold ${colors}`}>
          Chef Cardápio
        </h1>
        {size !== 'sm' && (
          <p className={`text-xs ${variant === 'light' ? 'text-white/80' : 'text-gray-500'}`}>
            Cardápio Digital Inteligente
          </p>
        )}
      </div>
    </div>
  );
}