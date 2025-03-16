// import React, { useState } from 'react';
// import { Filter, X, Search, Check } from 'lucide-react';

// interface UserFiltersProps {
//   deviceTypes: string[];
//   onFilterChange: (filters: {
//     deviceType: string;
//     status: 'all' | 'active' | 'inactive';
//     searchTerm: string;
//   }) => void;
//   deviceTypeNames: Record<string, string>;
// }

// const UserFilters: React.FC<UserFiltersProps> = ({
//   deviceTypes,
//   onFilterChange,
//   deviceTypeNames
// }) => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [deviceType, setDeviceType] = useState<string>('all');
//   const [status, setStatus] = useState<'all' | 'active' | 'inactive'>('all');
//   const [searchTerm, setSearchTerm] = useState('');

//   const handleApplyFilters = () => {
//     onFilterChange({
//       deviceType,
//       status,
//       searchTerm
//     });
//   };

//   const handleClearFilters = () => {
//     setDeviceType('all');
//     setStatus('all');
//     setSearchTerm('');
//     onFilterChange({
//       deviceType: 'all',
//       status: 'all',
//       searchTerm: ''
//     });
//   };

//   return (
//     <div className="mb-6 bg-white rounded-lg shadow-md">
//       <div className="flex items-center justify-between p-4 border-b">
//         <button
//           onClick={() => setIsExpanded(!isExpanded)}
//           className="flex items-center text-gray-700 hover:text-gray-900"
//         >
//           <Filter className="w-5 h-5 mr-2" />
//           <span className="font-medium">Filters</span>
//           {isExpanded ? (
//             <X className="w-4 h-4 ml-2" />
//           ) : (
//             <span className="ml-2 text-xs text-gray-500">
//               {deviceType !== 'all' || status !== 'all' || searchTerm ? 'Active' : 'None'}
//             </span>
//           )}
//         </button>
        
//         <div className="relative w-64">
//           <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//             <Search className="w-4 h-4 text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder="Search users..."
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               // Apply filters immediately for search
//               onFilterChange({
//                 deviceType,
//                 status,
//                 searchTerm: e.target.value
//               });
//             }}
//             className="block w-full py-2 pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//           />
//         </div>
//       </div>
      
//       {isExpanded && (
//         <div className="p-4">
//           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//             <div>
//               <label htmlFor="deviceType" className="block mb-2 text-sm font-medium text-gray-700">
//                 Device Type
//               </label>
//               <select
//                 id="deviceType"
//                 value={deviceType}
//                 onChange={(e) => setDeviceType(e.target.value)}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               >
//                 <option value="all">All Device Types</option>
//                 {deviceTypes.map((type) => (
//                   <option key={type} value={type}>
//                     {deviceTypeNames[type] || type}
//                   </option>
//                 ))}
//               </select>
//             </div>
            
//             <div>
//               <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-700">
//                 User Status
//               </label>
//               <select
//                 id="status"
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value as 'all' | 'active' | 'inactive')}
//                 className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//               >
//                 <option value="all">All Statuses</option>
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             </div>
//           </div>
          
//           <div className="flex justify-end mt-4 space-x-2">
//             <button
//               onClick={handleClearFilters}
//               className="px-3 py-2 text-sm text-gray-700 transition-colors bg-gray-100 rounded-md hover:bg-gray-200"
//             >
//               Clear Filters
//             </button>
//             <button
//               onClick={handleApplyFilters}
//               className="flex items-center px-3 py-2 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
//             >
//               <Check className="w-4 h-4 mr-1" />
//               Apply Filters
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserFilters;
