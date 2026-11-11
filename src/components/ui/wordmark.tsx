// ===================================================================
// MOONKY BRAND WORDMARK
// Clean text-based wordmark with minimal green accent dot
// ===================================================================

import React from 'react';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function MoonkyWordmark({ size = 'md', className = '' }: WordmarkProps) {
  const sizeClasses = {
    sm: 'text-base font-semibold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5 ml-0.5 mb-1',
    md: 'w-2 h-2 ml-0.5 mb-1.5',
    lg: 'w-2.5 h-2.5 ml-1 mb-2'
  };

  return (
    <div className={`inline-flex items-baseline select-none ${className}`}>
      <span className={`text-[#252B28] font-sans ${sizeClasses[size]}`}>
        Moonky
      </span>
      <span
        className={`inline-block rounded-full bg-[#45D483] ${dotSizes[size]}`}
        title="Moonky Intelligent Omnichannel"
      />
    </div>
  );
}
