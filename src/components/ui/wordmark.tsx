// ===================================================================
// MOONKY BRAND WORDMARK
// Clean text-based wordmark with minimal green accent dot
// ===================================================================

import React from 'react';

interface WordmarkProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showIcon?: boolean;
}

export function MoonkyWordmark({ size = 'md', className = '', showIcon = true }: WordmarkProps) {
  const sizeClasses = {
    sm: 'text-base font-semibold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-bold tracking-tight'
  };

  const iconSizes = {
    sm: 'w-5 h-5 rounded-md',
    md: 'w-6 h-6 rounded-lg',
    lg: 'w-8 h-8 rounded-xl'
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5 ml-0.5 mb-1',
    md: 'w-2 h-2 ml-0.5 mb-1.5',
    lg: 'w-2.5 h-2.5 ml-1 mb-2'
  };

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {showIcon && (
        <div className={`${iconSizes[size]} overflow-hidden bg-[#151917] p-0.5 shrink-0 flex items-center justify-center border border-[#262E2A]/50 shadow-xs rounded-xl`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-m.png" alt="Moonky Logo" className="w-full h-full object-contain rounded-lg" />
        </div>
      )}
      <div className="inline-flex items-baseline">
        <span className={`text-[#252B28] dark:text-[#F3F6F4] font-sans ${sizeClasses[size]}`}>
          Moonky
        </span>
        <span
          className={`inline-block rounded-full bg-[#45D483] ${dotSizes[size]}`}
          title="Moonky Intelligent Omnichannel"
        />
      </div>
    </div>
  );
}
