interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div 
      className={`animate-pulse bg-gray-100 border border-gray-50 rounded-xl ${className}`} 
      aria-hidden="true"
    />
  );
}