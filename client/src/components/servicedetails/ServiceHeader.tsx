
interface BreadcrumbItem {
  label: string;
  path?: string;
  onClick?: () => void;
}

interface ServiceHeaderProps {
  breadcrumbItems: BreadcrumbItem[];
}

const ServiceHeader = ({ breadcrumbItems }: ServiceHeaderProps) => {
  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        {breadcrumbItems.map((item, index) => (
          <li key={index}>
            {index === 0 ? (
              // First item (Home)
              item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="text-sm font-medium text-pink-600 hover:text-pink-500"
                >
                  {item.label}
                </button>
              ) : (
                <span className="text-sm font-medium text-gray-500">{item.label}</span>
              )
            ) : (
              // Subsequent items
              <div className="flex items-center">
                <span className="mx-2 text-gray-300">/</span>
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="text-sm font-medium text-pink-600 hover:text-pink-500"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span className="text-sm font-medium text-gray-500">
                    {item.label}
                  </span>
                )}
              </div>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default ServiceHeader;