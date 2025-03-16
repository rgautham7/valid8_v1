{/* User Table */}
<div className="overflow-hidden bg-white rounded-lg shadow-md">
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-blue-100">
    <tr>
      {['User ID', 'Name', 'Device ID', 'Allocated On', 'Last Used On', 'Status'].map(header => (
        <th key={header} className="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-700 uppercase">
          {header}
        </th>
      ))}
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    {filteredUsers.length > 0 ? (
      filteredUsers.map(user => {
        const deviceInfo = user.devices.find(d => d.deviceType === deviceType);
        return (
          <tr key={user.id} className="transition hover:bg-gray-100">
            <td className="px-6 py-4 text-sm text-gray-700">{user.id}</td>
            <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{deviceInfo?.deviceId || 'N/A'}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{deviceInfo?.allocatedOn || 'N/A'}</td>
            <td className="px-6 py-4 text-sm text-gray-700">{deviceInfo?.lastUsedOn || 'N/A'}</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                ${user.activity === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {user.activity}
              </span>
            </td>
          </tr>
        );
      })
    ) : (
      <tr>
        <td colSpan={6} className="px-6 py-4 text-sm text-center text-gray-500">
          No users found for this provider and device type
        </td>
      </tr>
    )}
  </tbody>
</table>
</div>  