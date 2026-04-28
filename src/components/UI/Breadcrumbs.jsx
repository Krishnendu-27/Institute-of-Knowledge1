import {
  Home,
  Users,
  GraduationCap,
  UserPlus,
  User,
  LogOut,
  ChevronRight,
  BadgePlus,
  IdCard,
  Newspaper,
  BookCheck,
  Form,
  Menu,
  X,
} from "lucide-react";
import { Outlet, Link, useLocation } from "react-router-dom";

export const Breadcrumbs = () => {
  // Remove empty segments (like trailing slashes)
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav
      className="flex items-center text-sm text-foreground/60 mb-4"
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="hover:text-primary transition-colors flex items-center"
      >
        <Home size={16} className="mr-1.5" />
        Dashboard
      </Link>
      {pathnames.map((value, index) => {
        // Build up the path up to this point
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const title = value.replaceAll("-", " ");

        return (
          <div key={to} className="flex items-center capitalize">
            <ChevronRight size={16} className="mx-1" />
            {isLast ? (
              <span className="text-foreground font-medium">{title}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition-colors">
                {title}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
