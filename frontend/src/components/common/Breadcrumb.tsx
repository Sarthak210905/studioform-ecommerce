import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const getBreadcrumbsFromPath = (pathname: string): BreadcrumbItem[] => {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: 'Home',
      path: '/',
    },
  ];

  let currentPath = '';

  segments.forEach((segment) => {
    currentPath += `/${segment}`;

    // Convert segment to readable label
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Skip adding if it looks like an ID
    if (!/^[a-f0-9]{24}$/.test(segment)) {
      breadcrumbs.push({
        label,
        path: currentPath,
      });
    }
  });

  return breadcrumbs;
};

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const location = useLocation();
  const breadcrumbs = items || getBreadcrumbsFromPath(location.pathname);

  // Don't show breadcrumb on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <nav className={`flex items-center gap-1 text-sm mb-6 ${className}`} aria-label="Breadcrumb">
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={item.path} className="flex items-center gap-1">
            {index === 0 ? (
              <Link
                to={item.path}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Link
                  to={item.path}
                  className={`${
                    isLast
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground transition-colors'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              </>
            )}
          </div>
        );
      })}
    </nav>
  );
}
