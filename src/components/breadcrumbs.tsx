import { Link, useLocation } from "react-router-dom";

type BreadcrumbItem = {
  name: string;
  path: string;
};

type Props = {
  dynamicLabels?: Record<string, string>;
};

export default function Breadcrumbs({ dynamicLabels = {} }: Props) {
  const location = useLocation();

  const pathnames = location.pathname.split("/").filter(Boolean);

  const crumbs: BreadcrumbItem[] = pathnames.map((segment, index) => {
    const path = "/" + pathnames.slice(0, index + 1).join("/");

    const name =
      dynamicLabels[segment] ??
      segment.charAt(0).toUpperCase() + segment.slice(1);

    return { name, path };
  });

  return (
    <div className="border-b border-gray-100 px-8 py-4 flex items-center gap-2 text-sm text-gray-400">
      <Link to="/" className="hover:text-black transition">
        Home
      </Link>

      {crumbs.map((crumb, i) => (
        <span key={crumb.path} className="flex items-center gap-2">
          <span>/</span>
          {i === crumbs.length - 1 ? (
            <span className="text-black font-medium truncate">
              {crumb.name}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="hover:text-black transition"
            >
              {crumb.name}
            </Link>
          )}
        </span>
      ))}
    </div>
  );
}
