import { cn } from '../lib/utils';

interface AvatarProps {
  src: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  ring?: boolean;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

export default function Avatar({ src, alt, size = 'md', className, ring = false }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        'rounded-full object-cover flex-shrink-0',
        sizeMap[size],
        ring &&
          'ring-2 ring-brand ring-offset-2 ring-offset-white dark:ring-offset-[#111214]',
        className,
      )}
    />
  );
}
