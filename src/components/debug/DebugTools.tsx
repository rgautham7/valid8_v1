import React from 'react';
import { resetLocalStorage, verifyLocalStorageData } from '../../utils/initLocalStorage';

const DebugTools: React.FC = () => {
  const handleResetData = () => {
    resetLocalStorage();
    alert('Data reset complete. Refreshing page...');
    window.location.reload();
  };
  
  const handleVerifyData = () => {
    const stats = verifyLocalStorageData();
    alert(`Data verification:\n- Device Types: ${stats.deviceTypes}\n- Providers: ${stats.providers}\n- Users: ${stats.users}\n- Devices: ${stats.devices}`);
  };
  
  return (
    <div style={{ position: 'fixed', bottom: 10, right: 10, zIndex: 9999 }}>
      <button 
        onClick={handleResetData}
        style={{ 
          padding: '5px 10px', 
          backgroundColor: '#ff4d4f', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '5px'
        }}
      >
        Reset Data
      </button>
      <button 
        onClick={handleVerifyData}
        style={{ 
          padding: '5px 10px', 
          backgroundColor: '#1890ff', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Verify Data
      </button>
    </div>
  );
};

export default DebugTools; 