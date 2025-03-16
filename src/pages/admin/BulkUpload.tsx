import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileUp, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';

const BulkUpload: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    const fileType = file.name.split('.').pop()?.toLowerCase();
    
    if (fileType !== 'csv' && fileType !== 'xlsx' && fileType !== 'xls') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a CSV or Excel file',
        variant: 'destructive',
      });
      return;
    }
    
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem('bulkUploadFile', file.name);
      
      toast({
        title: 'File uploaded',
        description: 'Your file has been uploaded successfully',
      });
      
      navigate('/admin/device-preview');
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="container py-6 mx-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Bulk Upload Devices</CardTitle>
            <CardDescription>
              Upload a CSV or Excel file containing multiple devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-10 text-center ${
                dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <FileUp className="w-12 h-12 text-gray-400" />
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">
                    Drag and drop your file here
                  </h3>
                  <p className="text-sm text-gray-500">
                    or click to browse files (CSV, Excel)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select File
                </Button>
              </div>
            </div>
            
            {file && (
              <div className="p-4 mt-4 rounded-lg bg-gray-50">
                <p className="text-sm font-medium">Selected file:</p>
                <p className="text-sm">{file.name}</p>
              </div>
            )}
            
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-medium">File Format Requirements:</h4>
              <ul className="space-y-1 text-sm text-gray-500 list-disc list-inside">
                <li>File must be in CSV or Excel format</li>
                <li>First row must contain column headers</li>
                <li>Required columns: Device Type ID, Device ID, Year of Manufacturing, Validity</li>
                <li>Optional columns: Status</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/admin/device-management')}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={!file || isUploading} 
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default BulkUpload;
