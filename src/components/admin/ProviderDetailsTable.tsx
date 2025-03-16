import { Link } from 'react-router-dom';
import { Provider } from '../../types/index';
import { ArrowRight, Search } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ProviderDetailsTableProps {
  providers: Provider[];
  deviceType: string;
}

export default function ProviderDetailsTable({ providers, deviceType }: ProviderDetailsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'users' | 'devices'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter providers based on search input
  const filteredProviders = useMemo(() => {
    return providers.filter(provider =>
      provider.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [providers, searchTerm]);

  // Sort providers based on the selected field
  const sortedProviders = useMemo(() => {
    return [...filteredProviders].sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'users':
          valA = a.usersCount;
          valB = b.usersCount;
          break;
        case 'devices':
          valA = a.devicesCount || 0;
          valB = b.devicesCount || 0;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredProviders, sortBy, sortOrder]);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Provider Details</h2>
        <div className="flex items-center space-x-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search Provider.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Sorting Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'users' | 'devices')}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value="name">Name</option>
              <option value="users">Users Count</option>
              <option value="devices">Devices Count</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              {sortOrder === 'asc' ? '🔼' : '🔽'}
            </button>
          </div>
        </div>
      </div>

      {/* Provider Table */}
      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Provider ID</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Users Count</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Devices Count</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProviders.length > 0 ? (
              sortedProviders.map((provider) => (
                <tr key={provider.id}>
                  <td className="px-6 py-4 text-sm text-gray-500">{provider.id}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{provider.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{provider.usersCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{provider.devicesCount || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <Link
                      to={`/admin/device-type/${deviceType}/provider-id/${provider.id}/users`}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                    >
                      View Users <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No providers found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
