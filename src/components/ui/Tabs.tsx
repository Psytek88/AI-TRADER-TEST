import React from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onValueChange, children }: TabsProps) {
  return (
    <div className="w-full" data-value={value}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { value });
        }
        return child;
      })}
    </div>
  );
}

export function TabsList({ children, className = '' }: TabsListProps) {
  return (
    <div className={`flex ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children }: TabsTriggerProps) {
  return (
    <button
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors
        data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800
        dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200
        hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-center`}
      data-state={value === value ? 'active' : 'inactive'}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }: TabsContentProps) {
  return (
    <div className={`${className}`} hidden={value !== value}>
      {children}
    </div>
  );
}