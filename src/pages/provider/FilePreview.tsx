import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { useFileData } from '../../context/FileDataContext';
import { Button } from '../../components/ui/button';
const DataPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { fileData, fileName, clearFileData } = useFileData();

  useEffect(() => {
    if (!fileData || fileData.length === 0) {
      navigate('/upload');
    }
  }, [fileData, navigate]);

  if (!fileData || fileData.length === 0) {
    return null;
  }

  const headers = Object.keys(fileData[0]);
  const previewData = fileData.slice(0, 7);
  const totalRows = fileData.length;

  const handleApprove = () => {
    navigate('/provider/add-user');
  };

  const handleCancel = () => {
    clearFileData();
    navigate('/upload');
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="w-full max-w-6xl mx-auto">
        <div className="p-6 mb-6 bg-white rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button 
                onClick={handleCancel}
                className="p-2 mr-4 rounded-full hover:bg-gray-100"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Review Data</h1>
            </div>
            
            <div className="flex items-center px-4 py-2 rounded-md bg-blue-50">
              <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">{fileName}</span>
            </div>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600">
              Please review the data below before proceeding. Showing {previewData.length} of {totalRows} rows.
            </p>
          </div>
          
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {headers.map((header, index) => (
                    <th 
                      key={index}
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {previewData.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {headers.map((header, colIndex) => (
                      <td 
                        key={`${rowIndex}-${colIndex}`}
                        className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap"
                      >
                        {String(row[header] !== undefined ? row[header] : '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalRows > previewData.length && (
            <div className="mt-3 text-sm text-center text-gray-500">
              <span>+ {totalRows - previewData.length} more rows</span>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-8">
          <Button 
            onClick={handleCancel}
            className="px-8 py-6 text-lg font-semibold text-white transition-all duration-300 bg-red-500 shadow-lg hover:bg-red-600 hover:shadow-xl hover:scale-105"
          >
            <X className="w-8 h-8 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleApprove}
            className="px-8 py-6 text-lg font-semibold text-white transition-all duration-300 bg-green-500 shadow-lg hover:bg-green-600 hover:shadow-xl hover:scale-105"
          >
            <Check className="w-8 h-8 mr-2" />
            Approve & Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataPreviewPage;