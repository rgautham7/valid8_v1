import { Power, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { User } from '../../types/index';
import { providers } from '../../data/mockData';

interface UserDetailsTableProps {
  users: User[];
  deviceType: string;
}

export default function UserDetailsTable({ users, deviceType }: UserDetailsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'activity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter users dynamically based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Sort users dynamically based on selected field
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      let valA, valB;

      switch (sortBy) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'date':
          valA = new Date(a.devices[0]?.allocatedOn || '').getTime();
          valB = new Date(b.devices[0]?.allocatedOn || '').getTime();
          break;
        case 'activity':
          valA = a.activity;
          valB = b.activity;
          break;
        default:
          return 0;
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortBy, sortOrder]);

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">User Details</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search User.."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-2 pl-3 pr-10 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'activity')}
              className="px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="activity">Activity</option>
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

      <div className="overflow-hidden bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">User ID</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Allocated on</th>
              <th className="px-6 py-3 text-xs font-medium text-left text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.length > 0 ? (
              sortedUsers.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.devices[0]?.allocatedOn || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.activity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
