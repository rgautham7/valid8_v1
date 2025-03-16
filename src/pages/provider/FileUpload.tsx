import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { read, utils } from 'xlsx';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useFileData } from '../../context/FileDataContext';

const FileUpload: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { setFileData, setFileName } = useFileData();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check file type
      const fileType = file.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls'].includes(fileType || '')) {
        throw new Error('Please upload a CSV or Excel file');
      }

      // Read file
      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error('The file is empty or contains no valid data');
      }

      // Store data in context
      setFileData(jsonData);
      setFileName(file.name);
      
      // Navigate to preview page
      navigate('/provider/preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while processing the file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-2xl">
        <div className="p-8 bg-white rounded-lg shadow-lg">
          <h1 className="mb-6 text-3xl font-bold text-center text-gray-800">
            Upload Your Data File
          </h1>
          
          <p className="mb-8 text-center text-gray-600">
            Upload a CSV or Excel file to import your data. You'll be able to review the data before finalizing the import.
          </p>
          
          <div
            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleButtonClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            
            <div className="flex flex-col items-center justify-center">
              {isLoading ? (
                <div className="w-12 h-12 mb-4 border-b-2 border-blue-700 rounded-full animate-spin"></div>
              ) : (
                <>
                  <div className="p-4 mb-4 bg-blue-100 rounded-full">
                    <FileSpreadsheet className="w-10 h-10 text-blue-600" />
                  </div>
                  <p className="mb-2 text-lg font-medium text-gray-700">
                    {isDragging ? 'Drop your file here' : 'Drag & drop your file here'}
                  </p>
                  <p className="mb-4 text-sm text-gray-500">or</p>
                  <button className="flex items-center btn btn-primary">
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </button>
                  <p className="mt-4 text-xs text-gray-500">
                    Supported formats: CSV, XLSX, XLS
                  </p>
                </>
              )}
            </div>
          </div>
          
          {error && (
            <div className="flex items-start p-3 mt-4 bg-red-100 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;