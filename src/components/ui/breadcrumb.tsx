import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  title: string;
  path: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center text-sm ${className}`}>
      <ol className="flex items-center space-x-1">
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
            )}
            {index === items.length - 1 ? (
              <span className="font-medium text-foreground">{item.title}</span>
            ) : (
              <Link
                to={item.path}
                className="transition-colors text-muted-foreground hover:text-foreground"
              >
                {item.title}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb; 