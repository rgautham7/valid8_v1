import React, { createContext, useState, useContext, ReactNode } from 'react';

interface FileDataContextType {
  fileData: any[] | null;
  fileName: string | null;
  setFileData: (data: any[] | null) => void;
  setFileName: (name: string | null) => void;
  clearFileData: () => void;
}

const FileDataContext = createContext<FileDataContextType | undefined>(undefined);

export const useFileData = () => {
  const context = useContext(FileDataContext);
  if (!context) {
    throw new Error('useFileData must be used within a FileDataProvider');
  }
  return context;
};

interface FileDataProviderProps {
  children: ReactNode;
}

export const FileDataProvider: React.FC<FileDataProviderProps> = ({ children }) => {
  const [fileData, setFileData] = useState<any[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const clearFileData = () => {
    setFileData(null);
    setFileName(null);
  };

  return (
    <FileDataContext.Provider value={{ fileData, fileName, setFileData, setFileName, clearFileData }}>
      {children}
    </FileDataContext.Provider>
  );
};