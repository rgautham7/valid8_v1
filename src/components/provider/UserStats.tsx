// import React from 'react';
// import { Users, Activity, Smartphone } from 'lucide-react';
// import { User, DeviceType } from '../../types';

// interface UserStatsProps {
//   users: User[];
//   deviceTypes: DeviceType[];
// }

// const UserStats: React.FC<UserStatsProps> = ({ users, deviceTypes }) => {
//   // Calculate statistics
//   const totalUsers = users.length;
//   const activeUsers = users.filter(user => user.activity === 'Active').length;
//   const inactiveUsers = totalUsers - activeUsers;
  
//   // Count devices by type
//   const devicesByType: Record<string, number> = {};
//   deviceTypes.forEach(type => {
//     devicesByType[type.code] = 0;
//   });
  
//   users.forEach(user => {
//     user.devices.forEach(device => {
//       if (devicesByType[device.deviceType] !== undefined) {
//         devicesByType[device.deviceType]++;
//       }
//     });
//   });
  
//   // Total devices assigned
//   const totalDevices = Object.values(devicesByType).reduce((sum, count) => sum + count, 0);
  
//   return (
//     <div className="grid grid-cols-1 gap-4 mb-6 sm:grid-cols-3">
//       <div className="p-4 bg-white rounded-lg shadow-md">
//         <div className="flex items-center">
//           <div className="p-3 mr-4 bg-blue-100 rounded-full">
//             <Users className="w-6 h-6 text-blue-600" />
//           </div>
//           <div>
//             <p className="text-sm font-medium text-gray-500">Total Users</p>
//             <p className="text-2xl font-bold">{totalUsers}</p>
//           </div>
//         </div>
//         <div className="flex items-center mt-3 space-x-2">
//           <div className="flex items-center">
//             <div className="w-2 h-2 mr-1 bg-green-500 rounded-full"></div>
//             <span className="text-xs text-gray-600">{activeUsers} active</span>
//           </div>
//           <div className="flex items-center">
//             <div className="w-2 h-2 mr-1 bg-red-500 rounded-full"></div>
//             <span className="text-xs text-gray-600">{inactiveUsers} inactive</span>
//           </div>
//         </div>
//       </div>
      
//       <div className="p-4 bg-white rounded-lg shadow-md">
//         <div className="flex items-center">
//           <div className="p-3 mr-4 bg-green-100 rounded-full">
//             <Activity className="w-6 h-6 text-green-600" />
//           </div>
//           <div>
//             <p className="text-sm font-medium text-gray-500">Active Rate</p>
//             <p className="text-2xl font-bold">
//               {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}%
//             </p>
//           </div>
//         </div>
//         <div className="w-full h-2 mt-3 overflow-hidden bg-gray-200 rounded-full">
//           <div 
//             className="h-full bg-green-500" 
//             style={{ width: `${totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0}%` }}
//           ></div>
//         </div>
//       </div>
      
//       <div className="p-4 bg-white rounded-lg shadow-md">
//         <div className="flex items-center">
//           <div className="p-3 mr-4 bg-purple-100 rounded-full">
//             <Smartphone className="w-6 h-6 text-purple-600" />
//           </div>
//           <div>
//             <p className="text-sm font-medium text-gray-500">Assigned Devices</p>
//             <p className="text-2xl font-bold">{totalDevices}</p>
//           </div>
//         </div>
//         <div className="flex flex-wrap gap-1 mt-3">
//           {deviceTypes.map(type => (
//             <div 
//               key={type.id} 
//               className="px-2 py-1 text-xs bg-gray-100 rounded-full"
//               title={type.name}
//             >
//               {type.name.substring(0, 10)}{type.name.length > 10 ? '...' : ''}: {devicesByType[type.code] || 0}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserStats;
