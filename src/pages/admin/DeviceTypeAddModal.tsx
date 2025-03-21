import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import ParameterSelector from '../../components/ui/parameter-selector';

interface DeviceTypeModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (deviceData: DeviceTypeFormData) => void;
	initialData?: Partial<DeviceTypeFormData>;
	isEditMode?: boolean;
}

export interface DeviceTypeFormData {
	image: File | null;
	name: string;
	deviceType: string;
	deviceParameters: string[];
	manufacturer: string;
	countryOfOrigin: string;
	yearOfManufacturing: string;
	validity: string;
	remarks: string;
	video: File | null;
	manual: File | null;
}

const DeviceTypeAddModal: React.FC<DeviceTypeModalProps> = ({ 
	isOpen, 
	onClose, 
	onSubmit, 
	initialData,
	isEditMode = false
}) => {
	const [formData, setFormData] = useState<DeviceTypeFormData>({
		image: null,
		name: '',
		deviceType: '',
		deviceParameters: [],
		manufacturer: '',
		countryOfOrigin: '',
		yearOfManufacturing: '',
		validity: '',
		remarks: '',
		video: null,
		manual: null,
	});

	const [errors, setErrors] = useState<Partial<Record<keyof DeviceTypeFormData, string>>>({});
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [nameError, setNameError] = useState<string>('');

	// Initialize form with initial data if provided
	useEffect(() => {
		if (initialData) {
			let parameters = initialData.deviceParameters || [];
			if (typeof parameters === 'string') {
				parameters = parameters.split(',').map(p => p.trim());
			}
			
			setFormData(prev => ({
				...prev,
				...initialData,
				deviceParameters: parameters
			}));
		}
	}, [initialData]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		
		// Clear error when field is edited
		if (errors[name as keyof DeviceTypeFormData]) {
			setErrors(prev => ({ ...prev, [name]: undefined }));
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'image' | 'video' | 'manual') => {
		const file = e.target.files?.[0] || null;
		setFormData(prev => ({ ...prev, [field]: file }));
		
		// Clear error when field is edited
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: undefined }));
		}

		// Create preview for image
		if (field === 'image' && file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Partial<Record<keyof DeviceTypeFormData, string>> = {};
		
		// In edit mode, image is not required if not changing it
		if (!isEditMode && !formData.image) {
			newErrors.image = 'Device image is required';
		}
		
		if (!formData.name.trim()) {
			newErrors.name = 'Device type name is required';
		}
		
		if (!formData.deviceType.trim()) {
			newErrors.deviceType = 'Device type is required';
		}
		
		if (!formData.deviceParameters || formData.deviceParameters.length === 0) {
			newErrors.deviceParameters = 'At least one parameter is required';
		}
		
		if (!formData.manufacturer.trim()) {
			newErrors.manufacturer = 'Manufacturer is required';
		}
		
		if (!formData.countryOfOrigin.trim()) {
			newErrors.countryOfOrigin = 'Country of origin is required';
		}
		
		if (!formData.yearOfManufacturing) {
			newErrors.yearOfManufacturing = 'Year of manufacturing is required';
		}
		
		if (!formData.validity) {
			newErrors.validity = 'Validity is required';
		}
		
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		
		if (validateForm()) {
			onSubmit(formData);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
			<div className="w-full max-w-3xl p-6 bg-white rounded-lg max-h-[90vh] overflow-y-auto">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl font-bold">{isEditMode ? 'Edit Device Type' : 'Add New Device Type'}</h2>
					<button
						onClick={onClose}
						className="p-1 text-gray-500 rounded-full hover:bg-gray-100"
					>
						<X className="w-6 h-6" />
					</button>
				</div>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Device Image */}
					<div>
						<Label htmlFor="device-image">
							Device Image {!isEditMode && <span className="text-red-500">*</span>}
						</Label>
						<div className="flex justify-center px-6 pt-5 pb-6 mt-1 border-2 border-gray-300 border-dashed rounded-md">
							<div className="space-y-1 text-center">
								{imagePreview ? (
									<div className="mb-4">
										<img src={imagePreview} alt="Device preview" className="w-auto h-32 mx-auto" />
									</div>
								) : (
									<Upload className="w-12 h-12 mx-auto text-gray-400" />
								)}
								<div className="flex text-sm text-gray-600">
									<label
										htmlFor="device-image"
										className="relative font-medium text-blue-600 bg-white rounded-md cursor-pointer hover:text-blue-500"
									>
										<span>{isEditMode ? 'Change image' : 'Upload a file'}</span>
										<input
											id="device-image"
											name="image"
											type="file"
											accept="image/*"
											className="sr-only"
											onChange={(e) => handleFileChange(e, 'image')}
										/>
									</label>
									<p className="pl-1">or drag and drop</p>
								</div>
								<p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
								{isEditMode && (
									<p className="mt-2 text-xs text-blue-600">Leave empty to keep the current image</p>
								)}
							</div>
						</div>
						{errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
					</div>

					{/* Device Type Name */}
					<div>
						<Label htmlFor="name">Device Type Name <span className="text-red-500">*</span></Label>
						<Input
							id="name"
							name="name"
							value={formData.name}
							onChange={(e) => {
								const newName = e.target.value;
								setFormData(prev => ({ 
									...prev, 
									name: newName,
									deviceType: newName.toLowerCase().replace(/\s+/g, '-') 
								}));
								
								// Check for duplicates in localStorage
								const deviceTypes = JSON.parse(localStorage.getItem('deviceTypes') || '[]');
								const isDuplicate = deviceTypes.some((dt: any) => 
									dt.name.toLowerCase() === newName.toLowerCase()
								);
								
								if (isDuplicate) {
									setNameError('This device type name already exists');
								} else {
									setNameError('');
								}
							}}
							onBlur={(e) => {
								// Auto-generate deviceType when focus leaves name input
								const name = e.target.value;
								setFormData(prev => ({
									...prev,
									deviceType: name.toLowerCase().replace(/\s+/g, '-')
								}));
							}}
							className={nameError ? 'border-red-500' : ''}
						/>
						{nameError && <p className="mt-1 text-sm text-red-600">{nameError}</p>}
					</div>

					{/* Device Type Code */}
					<div>
						<Label htmlFor="deviceType">Device Type Code</Label>
						<Input
							id="deviceType"
							name="deviceType"
							value={formData.deviceType}
							readOnly
							className="bg-gray-100"
						/>
					</div>

					{/* Device Parameters */}
					<div>
						<Label htmlFor="deviceParameters">
							Device Parameters <span className="text-red-500">*</span>
						</Label>
						<div className="mt-1">
							<ParameterSelector
								selectedParameters={formData.deviceParameters}
								onChange={(parameters) => {
									setFormData(prev => ({ ...prev, deviceParameters: parameters }));
									if (errors.deviceParameters) {
										setErrors(prev => ({ ...prev, deviceParameters: undefined }));
									}
								}}
							/>
						</div>
						{errors.deviceParameters && (
							<p className="mt-1 text-sm text-red-600">{errors.deviceParameters}</p>
						)}
					</div>

					{/* Manufacturer */}
					<div>
						<Label htmlFor="manufacturer">Manufacturer <span className="text-red-500">*</span></Label>
						<Input
							id="manufacturer"
							name="manufacturer"
							value={formData.manufacturer}
							onChange={handleInputChange}
							className={errors.manufacturer ? 'border-red-500' : ''}
						/>
						{errors.manufacturer && <p className="mt-1 text-sm text-red-600">{errors.manufacturer}</p>}
					</div>

					{/* Country of Origin */}
					<div>
						<Label htmlFor="countryOfOrigin">Country of Origin <span className="text-red-500">*</span></Label>
						<Input
							id="countryOfOrigin"
							name="countryOfOrigin"
							value={formData.countryOfOrigin}
							onChange={handleInputChange}
							className={errors.countryOfOrigin ? 'border-red-500' : ''}
						/>
						{errors.countryOfOrigin && <p className="mt-1 text-sm text-red-600">{errors.countryOfOrigin}</p>}
					</div>

					{/* Year of Manufacturing */}
					<div>
						<Label htmlFor="yearOfManufacturing">Year of Manufacturing <span className="text-red-500">*</span></Label>
						<Input
							id="yearOfManufacturing"
							name="yearOfManufacturing"
							type="date"
							value={formData.yearOfManufacturing}
							onChange={handleInputChange}
							className={errors.yearOfManufacturing ? 'border-red-500' : ''}
						/>
						{errors.yearOfManufacturing && <p className="mt-1 text-sm text-red-600">{errors.yearOfManufacturing}</p>}
					</div>

					{/* Validity */}
					<div>
						<Label htmlFor="validity">Validity <span className="text-red-500">*</span></Label>
						<Input
							id="validity"
							name="validity"
							type="date"
							value={formData.validity}
							onChange={handleInputChange}
							className={errors.validity ? 'border-red-500' : ''}
						/>
						{errors.validity && <p className="mt-1 text-sm text-red-600">{errors.validity}</p>}
					</div>

					{/* Remarks */}
					<div>
						<Label htmlFor="remarks">Remarks</Label>
						<Textarea
							id="remarks"
							name="remarks"
							value={formData.remarks}
							onChange={handleInputChange}
							rows={3}
						/>
					</div>

					{/* Video Upload (Optional) */}
					<div>
						<Label htmlFor="video">How to Use Video (Optional)</Label>
						<div className="flex items-center mt-1">
							<Input
								id="video"
								name="video"
								type="file"
								accept="video/mp4,video/x-m4v,video/*"
								onChange={(e) => handleFileChange(e, 'video')}
							/>
						</div>
						<p className="mt-1 text-xs text-gray-500">Upload an MP4 video showing how to use the device</p>
						{isEditMode && (
							<p className="mt-1 text-xs text-blue-600">Leave empty to keep the current video</p>
						)}
					</div>

					{/* Manual Upload (Optional) */}
					<div>
						<Label htmlFor="manual">User Manual (Optional)</Label>
						<div className="flex items-center mt-1">
							<Input
								id="manual"
								name="manual"
								type="file"
								accept=".pdf,.doc,.docx"
								onChange={(e) => handleFileChange(e, 'manual')}
							/>
						</div>
						<p className="mt-1 text-xs text-gray-500">Upload a PDF or document with usage instructions</p>
						{isEditMode && (
							<p className="mt-1 text-xs text-blue-600">Leave empty to keep the current manual</p>
						)}
					</div>

					{/* Form Actions */}
					<div className="flex justify-end space-x-3">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit">
							{isEditMode ? 'Update Device Type' : 'Add Device Type'}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default DeviceTypeAddModal;
