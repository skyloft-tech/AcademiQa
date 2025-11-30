
import React from 'react';

interface NotusCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const NotusCard: React.FC<NotusCardProps> = ({ title, subtitle, children, className }) => {
  return (
    <div className={`bg-white shadow-md rounded-lg p-6 border border-gray-200 ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-primary">{title}</h3>
          {subtitle && <p className="text-secondary text-sm">{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
