// import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Label } from '@/components/ui/extension/field';
// import { InputText } from '@/components/ui/extension/input-text';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { getFineslabDetails } from '@/server/fees/trasactions/feeAmountEntry';
// import type { IAmountEntryFineSlabDetails } from '@/types/fees/transactions/transactions';
// import { AlertCircle, Plus } from 'lucide-react';
// // components/fees/FineSlabModal.tsx
// import { useEffect, useState } from 'react';

// interface FineSlab {
//     fmfS_Id: number;
//     fmfS_FineType: string;
//     fmfS_FromDay: number;
//     fmfS_ToDay: number;
//     fmfS_ECSFlag: string;
//     ftfS_Id?: number;
//     ftfS_Amount?: string;
//     FTFS_FineType?: string;
//     FTFSE_FineType?: string;
//     ftfsE_Id?: number;
//     ftfsE_Amount?: string;
//     isSelected: boolean;
//     fmH_Id?: number;
//     ftI_Id?: number;
// }

// interface FineSlabModalProps {
//     isOpen: boolean;
//     onClose: () => void;
//     headId: number;
//     installmentId: number;
//     feeGroupId: number;
//     categoryId: number;
//     academicYearId: number;
//     selectionType: string; // 'stud', 'stfoth', 'stfothamt'
//     onSave: (regularSlabs: FineSlab[], ecsSlabs: FineSlab[]) => void;
//     // You might also want to pass existing selected slabs to pre-select them
//     existingRegularSlabs?: FineSlab[];
//     existingEcsSlabs?: FineSlab[];
// }

// export default function FineSlabModal({
//     isOpen,
//     onClose,
//     headId,
//     installmentId,
//     feeGroupId,
//     categoryId,
//     academicYearId,
//     selectionType,
//     onSave,
//     existingRegularSlabs = [],
//     existingEcsSlabs = []
// }: FineSlabModalProps) {
//     const [showRegularSlab, setShowRegularSlab] = useState(false);
//     const [showEcsSlab, setShowEcsSlab] = useState(false);
//     const [regularSlabs, setRegularSlabs] = useState<FineSlab[]>([]);
//     const [ecsSlabs, setEcsSlabs] = useState<FineSlab[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [selectedRegular, setSelectedRegular] = useState<number[]>([]);
//     const [selectedEcs, setSelectedEcs] = useState<number[]>([]);
//     const [validationError, setValidationError] = useState<string>('');

//     const fineTypeOptions = [
//         { value: 'Per Day', label: 'Per Day' },
//         { value: 'Day Slab', label: 'Day Slab' }
//     ];

//     // Fetch fine slabs when modal opens
//     useEffect(() => {
//         if (isOpen && headId && installmentId) {
//             fetchFineSlabs();
//         }
//     }, [isOpen, headId, installmentId]);

//     // Initialize with existing selected slabs - DON'T auto-check checkboxes
//     useEffect(() => {
//         if (existingRegularSlabs.length > 0) {
//             const regularIds = existingRegularSlabs.map((slab) => slab.fmfS_Id);
//             setSelectedRegular(regularIds);
//         }

//         if (existingEcsSlabs.length > 0) {
//             const ecsIds = existingEcsSlabs.map((slab) => slab.fmfS_Id);
//             setSelectedEcs(ecsIds);
//         }
//     }, [existingRegularSlabs, existingEcsSlabs]);

//     const fetchFineSlabs = async () => {
//         setLoading(true);
//         try {
//             // Call API based on selection type
//             let response: IAmountEntryFineSlabDetails;
//             if (selectionType === 'stud') {
//                 // For students, fetch both regular and ECS slabs
//                 response = (await getFineslabDetails('R', 'E')) as unknown as IAmountEntryFineSlabDetails;
//             } else {
//                 // For non-students (stfoth, stfothamt), fetch only regular slabs
//                 response = (await getFineslabDetails('R')) as unknown as IAmountEntryFineSlabDetails;
//             }

//             if (response?.data) {
//                 // Transform API response to match your interface
//                 const regularData: FineSlab[] = response.data.fillslab.map((slab) => ({
//                     fmfS_Id: slab.fmfS_Id,
//                     fmfS_FineType: slab.fmfS_FineType,
//                     fmfS_FromDay: slab.fmfS_FromDay,
//                     fmfS_ToDay: slab.fmfS_ToDay,
//                     fmfS_ECSFlag: slab.fmfS_ECSFlag,
//                     isSelected: false, // Don't auto-select
//                     FTFS_FineType: '',
//                     ftfS_Amount: ''
//                 }));

//                 const ecsData: FineSlab[] = response.data.fillslabecs.map((slab) => ({
//                     fmfS_Id: slab.fmfS_Id,
//                     fmfS_FineType: slab.fmfS_FineType,
//                     fmfS_FromDay: slab.fmfS_FromDay,
//                     fmfS_ToDay: slab.fmfS_ToDay,
//                     fmfS_ECSFlag: slab.fmfS_ECSFlag,
//                     isSelected: false, // Don't auto-select
//                     FTFSE_FineType: '',
//                     ftfsE_Amount: ''
//                 }));

//                 setRegularSlabs(regularData);
//                 setEcsSlabs(ecsData);

//                 // DON'T auto-show sections - let user decide
//                 setShowRegularSlab(false);
//                 setShowEcsSlab(false);

//                 // Only pre-fill data if we have existing slabs
//                 if (existingRegularSlabs.length > 0) {
//                     const updatedRegular = regularData.map((slab) => {
//                         const existing = existingRegularSlabs.find((existing) => existing.fmfS_Id === slab.fmfS_Id);
//                         if (existing) {
//                             return {
//                                 ...slab,
//                                 FTFS_FineType: existing.FTFS_FineType || '',
//                                 ftfS_Amount: existing.ftfS_Amount || '',
//                                 isSelected: true
//                             };
//                         }
//                         return slab;
//                     });
//                     setRegularSlabs(updatedRegular);
//                     setShowRegularSlab(true);
//                 }

//                 if (existingEcsSlabs.length > 0 && selectionType === 'stud') {
//                     const updatedEcs = ecsData.map((slab) => {
//                         const existing = existingEcsSlabs.find((existing) => existing.fmfS_Id === slab.fmfS_Id);
//                         if (existing) {
//                             return {
//                                 ...slab,
//                                 FTFSE_FineType: existing.FTFSE_FineType || '',
//                                 ftfsE_Amount: existing.ftfsE_Amount || '',
//                                 isSelected: true
//                             };
//                         }
//                         return slab;
//                     });
//                     setEcsSlabs(updatedEcs);
//                     setShowEcsSlab(true);
//                 }

//                 // Update selected arrays only if we have existing data
//                 setSelectedRegular(existingRegularSlabs.map((slab) => slab.fmfS_Id));
//                 setSelectedEcs(existingEcsSlabs.map((slab) => slab.fmfS_Id));
//             }
//         } catch (error) {
//             console.error('Error fetching fine slabs:', error);
//             // Handle error state if needed
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handleRegularCheckboxChange = (slabId: number) => {
//         setSelectedRegular((prev) => {
//             if (prev.includes(slabId)) {
//                 return prev.filter((id) => id !== slabId);
//             }
//             return [...prev, slabId];
//         });
//     };

//     const handleEcsCheckboxChange = (slabId: number) => {
//         setSelectedEcs((prev) => {
//             if (prev.includes(slabId)) {
//                 return prev.filter((id) => id !== slabId);
//             }
//             return [...prev, slabId];
//         });
//     };

//     const handleFineTypeChange = (index: number, value: string, isEcs = false) => {
//         setValidationError('');
//         if (isEcs) {
//             const updated = [...ecsSlabs];
//             updated[index].FTFSE_FineType = value;
//             setEcsSlabs(updated);
//         } else {
//             const updated = [...regularSlabs];
//             updated[index].FTFS_FineType = value;
//             setRegularSlabs(updated);
//         }
//     };

//     const handleAmountChange = (index: number, value: string, isEcs = false) => {
//         setValidationError('');
//         if (isEcs) {
//             const updated = [...ecsSlabs];
//             updated[index].ftfsE_Amount = value;
//             setEcsSlabs(updated);
//         } else {
//             const updated = [...regularSlabs];
//             updated[index].ftfS_Amount = value;
//             setRegularSlabs(updated);
//         }
//     };

//     const validateSelectedSlabs = () => {
//         // Check regular slabs
//         for (const slab of regularSlabs) {
//             if (selectedRegular.includes(slab.fmfS_Id)) {
//                 if (!slab.FTFS_FineType || slab.FTFS_FineType.trim() === '') {
//                     return `Please select Type for "${slab.fmfS_FineType}" in Regular Slab`;
//                 }
//                 if (!slab.ftfS_Amount || slab.ftfS_Amount.trim() === '' || Number.parseFloat(slab.ftfS_Amount) <= 0) {
//                     return `Please enter valid Amount (> 0) for "${slab.fmfS_FineType}" in Regular Slab`;
//                 }
//             }
//         }

//         // Check ECS slabs
//         for (const slab of ecsSlabs) {
//             if (selectedEcs.includes(slab.fmfS_Id)) {
//                 if (!slab.FTFSE_FineType || slab.FTFSE_FineType.trim() === '') {
//                     return `Please select Type for "${slab.fmfS_FineType}" in ECS Slab`;
//                 }
//                 if (!slab.ftfsE_Amount || slab.ftfsE_Amount.trim() === '' || Number.parseFloat(slab.ftfsE_Amount) <= 0) {
//                     return `Please enter valid Amount (> 0) for "${slab.fmfS_FineType}" in ECS Slab`;
//                 }
//             }
//         }

//         return '';
//     };

//     const handleAddToCart = () => {
//         // Validate that all selected rows have Type and Amount
//         const error = validateSelectedSlabs();
//         if (error) {
//             setValidationError(error);
//             return;
//         }

//         // Prepare selected slabs with additional info
//         const selectedRegularSlabs = regularSlabs
//             .filter((slab) => selectedRegular.includes(slab.fmfS_Id))
//             .map((slab) => ({
//                 ...slab,
//                 isSelected: true,
//                 fmH_Id: headId,
//                 ftI_Id: installmentId,
//                 fmG_Id: feeGroupId,
//                 fmcC_Id: categoryId,
//                 asmaY_Id: academicYearId
//             }));

//         const selectedEcsSlabs = ecsSlabs
//             .filter((slab) => selectedEcs.includes(slab.fmfS_Id))
//             .map((slab) => ({
//                 ...slab,
//                 isSelected: true,
//                 fmH_Id: headId,
//                 ftI_Id: installmentId,
//                 fmG_Id: feeGroupId,
//                 fmcC_Id: categoryId,
//                 asmaY_Id: academicYearId
//             }));

//         // Call parent save function
//         onSave(selectedRegularSlabs, selectedEcsSlabs);
//         setValidationError('');
//         onClose();
//     };

//     const handleCheckboxTypeChange = (type: 'regular' | 'ecs', checked: boolean) => {
//         setValidationError('');
//         if (type === 'regular') {
//             setShowRegularSlab(checked);
//             if (!checked) {
//                 setSelectedRegular([]);
//             }
//         } else {
//             setShowEcsSlab(checked);
//             if (!checked) {
//                 setSelectedEcs([]);
//             }
//         }
//     };

//     // Reset state when modal closes
//     const handleClose = () => {
//         setRegularSlabs([]);
//         setEcsSlabs([]);
//         setSelectedRegular([]);
//         setSelectedEcs([]);
//         setShowRegularSlab(false);
//         setShowEcsSlab(false);
//         setValidationError('');
//         onClose();
//     };

//     return (
//         <Dialog open={isOpen} onOpenChange={handleClose}>
//             <DialogContent className='max-h-[90vh] max-w-[95vw] overflow-y-auto'>
//                 <DialogHeader>
//                     <DialogTitle className='rounded-t-lg bg-primary p-4 text-white'>Fine Slab Details</DialogTitle>
//                 </DialogHeader>

//                 <div className='p-6'>
//                     {/* Type Selection */}
//                     <div className='mb-8 rounded-lg bg-gray-50 p-4 text-center'>
//                         <div className='flex justify-center gap-6'>
//                             <Label className='flex items-center space-x-2'>
//                                 <Checkbox
//                                     checked={showRegularSlab}
//                                     onCheckedChange={(checked) => handleCheckboxTypeChange('regular', checked as boolean)}
//                                 />
//                                 <span className='lbl padding-8'>Regular</span>
//                             </Label>
//                             {selectionType === 'stud' && (
//                                 <Label className='flex items-center space-x-2'>
//                                     <Checkbox
//                                         checked={showEcsSlab}
//                                         onCheckedChange={(checked) => handleCheckboxTypeChange('ecs', checked as boolean)}
//                                     />
//                                     <span className='lbl padding-8'>ECS</span>
//                                 </Label>
//                             )}
//                         </div>
//                     </div>

//                     {/* Validation Error */}
//                     {validationError && (
//                         <div className='mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700'>
//                             <AlertCircle className='h-5 w-5 flex-shrink-0' />
//                             <span className='font-medium text-sm'>{validationError}</span>
//                         </div>
//                     )}

//                     {/* Regular Slab */}
//                     {showRegularSlab && (
//                         <div className='mb-8 overflow-hidden rounded-lg border'>
//                             <div className='flex items-center justify-between bg-primary p-4 text-white'>
//                                 <h3 className='font-semibold text-lg'>Regular Slab</h3>
//                                 <span className='text-sm'>{selectedRegular.length} selected</span>
//                             </div>
//                             <div className='p-6'>
//                                 <Table>
//                                     <TableHeader>
//                                         <TableRow>
//                                             <TableHead className='w-[80px] text-center'>SLNO</TableHead>
//                                             <TableHead className='w-[100px] text-center'>Select</TableHead>
//                                             <TableHead className='min-w-[200px] px-8'>Slab Name</TableHead>
//                                             <TableHead className='w-[150px] text-center'>From Day</TableHead>
//                                             <TableHead className='w-[150px] text-center'>To Day</TableHead>
//                                             <TableHead className='min-w-[250px] px-8'>Type</TableHead>
//                                             <TableHead className='min-w-[250px] px-8'>Amount</TableHead>
//                                         </TableRow>
//                                     </TableHeader>
//                                     <TableBody>
//                                         {loading ? (
//                                             <TableRow>
//                                                 <TableCell colSpan={7} className='py-8 text-center'>
//                                                     <div className='flex justify-center'>
//                                                         <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
//                                                     </div>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ) : regularSlabs.length === 0 ? (
//                                             <TableRow>
//                                                 <TableCell colSpan={7} className='py-4 text-center text-gray-500'>
//                                                     No regular slabs available
//                                                 </TableCell>
//                                             </TableRow>
//                                         ) : (
//                                             regularSlabs.map((slab, index) => (
//                                                 <TableRow
//                                                     key={slab.fmfS_Id}
//                                                     className={selectedRegular.includes(slab.fmfS_Id) ? 'bg-blue-50' : ''}>
//                                                     <TableCell className='p-3 text-center align-middle'>{index + 1}</TableCell>
//                                                     <TableCell className='p-3 text-center align-middle'>
//                                                         <Checkbox
//                                                             checked={selectedRegular.includes(slab.fmfS_Id)}
//                                                             onCheckedChange={() => handleRegularCheckboxChange(slab.fmfS_Id)}
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell className='px-8 py-3 align-middle font-medium'>
//                                                         {slab.fmfS_FineType}
//                                                     </TableCell>
//                                                     <TableCell className='p-3 text-center align-middle'>{slab.fmfS_FromDay}</TableCell>
//                                                     <TableCell className='p-3 text-center align-middle'>{slab.fmfS_ToDay}</TableCell>
//                                                     <TableCell className='px-8 py-3 align-middle'>
//                                                         <Select
//                                                             value={slab.FTFS_FineType || ''}
//                                                             onValueChange={(value) => handleFineTypeChange(index, value)}>
//                                                             <SelectTrigger
//                                                                 className={`w-full ${selectedRegular.includes(slab.fmfS_Id) && (!slab.FTFS_FineType || slab.FTFS_FineType.trim() === '') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}>
//                                                                 <SelectValue placeholder='Select Type' />
//                                                             </SelectTrigger>
//                                                             <SelectContent>
//                                                                 {fineTypeOptions.map((option) => (
//                                                                     <SelectItem key={option.value} value={option.value}>
//                                                                         {option.label}
//                                                                     </SelectItem>
//                                                                 ))}
//                                                             </SelectContent>
//                                                         </Select>
//                                                     </TableCell>
//                                                     <TableCell className='px-8 py-3 align-middle'>
//                                                         <InputText
//                                                             type='number'
//                                                             value={slab.ftfS_Amount || ''}
//                                                             onChange={(e) => handleAmountChange(index, e.target.value)}
//                                                             placeholder='0.00'
//                                                             className={`w-full text-right ${selectedRegular.includes(slab.fmfS_Id) && (!slab.ftfS_Amount || Number.parseFloat(slab.ftfS_Amount) <= 0) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
//                                                         />
//                                                     </TableCell>
//                                                 </TableRow>
//                                             ))
//                                         )}
//                                     </TableBody>
//                                 </Table>
//                             </div>
//                         </div>
//                     )}

//                     {/* ECS Slab */}
//                     {showEcsSlab && selectionType === 'stud' && (
//                         <div className='overflow-hidden rounded-lg border'>
//                             <div className='flex items-center justify-between bg-primary p-4 text-white'>
//                                 <h3 className='font-semibold text-lg'>ECS Slab</h3>
//                                 <span className='text-sm'>{selectedEcs.length} selected</span>
//                             </div>
//                             <div className='p-6'>
//                                 <Table>
//                                     <TableHeader>
//                                         <TableRow>
//                                             <TableHead className='w-[80px] text-center'>SLNO</TableHead>
//                                             <TableHead className='w-[100px] text-center'>Select</TableHead>
//                                             <TableHead className='min-w-[200px] px-8'>Slab Name</TableHead>
//                                             <TableHead className='w-[150px] text-center'>From Day</TableHead>
//                                             <TableHead className='w-[150px] text-center'>To Day</TableHead>
//                                             <TableHead className='min-w-[250px] px-8'>Type</TableHead>
//                                             <TableHead className='min-w-[250px] px-8'>Amount</TableHead>
//                                         </TableRow>
//                                     </TableHeader>
//                                     <TableBody>
//                                         {loading ? (
//                                             <TableRow>
//                                                 <TableCell colSpan={7} className='py-8 text-center'>
//                                                     <div className='flex justify-center'>
//                                                         <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
//                                                     </div>
//                                                 </TableCell>
//                                             </TableRow>
//                                         ) : ecsSlabs.length === 0 ? (
//                                             <TableRow>
//                                                 <TableCell colSpan={7} className='py-4 text-center text-gray-500'>
//                                                     No ECS slabs available
//                                                 </TableCell>
//                                             </TableRow>
//                                         ) : (
//                                             ecsSlabs.map((slab, index) => (
//                                                 <TableRow
//                                                     key={slab.fmfS_Id}
//                                                     className={selectedEcs.includes(slab.fmfS_Id) ? 'bg-blue-50' : ''}>
//                                                     <TableCell className='p-3 text-center align-middle'>{index + 1}</TableCell>
//                                                     <TableCell className='p-3 text-center align-middle'>
//                                                         <Checkbox
//                                                             checked={selectedEcs.includes(slab.fmfS_Id)}
//                                                             onCheckedChange={() => handleEcsCheckboxChange(slab.fmfS_Id)}
//                                                         />
//                                                     </TableCell>
//                                                     <TableCell className='px-8 py-3 align-middle font-medium'>
//                                                         {slab.fmfS_FineType}
//                                                     </TableCell>
//                                                     <TableCell className='p-3 text-center align-middle'>{slab.fmfS_FromDay}</TableCell>
//                                                     <TableCell className='p-3 text-center align-middle'>{slab.fmfS_ToDay}</TableCell>
//                                                     <TableCell className='px-8 py-3 align-middle'>
//                                                         <Select
//                                                             value={slab.FTFSE_FineType || ''}
//                                                             onValueChange={(value) => handleFineTypeChange(index, value, true)}>
//                                                             <SelectTrigger
//                                                                 className={`w-full ${selectedEcs.includes(slab.fmfS_Id) && (!slab.FTFSE_FineType || slab.FTFSE_FineType.trim() === '') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}>
//                                                                 <SelectValue placeholder='Select Type' />
//                                                             </SelectTrigger>
//                                                             <SelectContent>
//                                                                 {fineTypeOptions.map((option) => (
//                                                                     <SelectItem key={option.value} value={option.value}>
//                                                                         {option.label}
//                                                                     </SelectItem>
//                                                                 ))}
//                                                             </SelectContent>
//                                                         </Select>
//                                                     </TableCell>
//                                                     <TableCell className='px-8 py-3 align-middle'>
//                                                         <InputText
//                                                             type='number'
//                                                             value={slab.ftfsE_Amount || ''}
//                                                             onChange={(e) => handleAmountChange(index, e.target.value, true)}
//                                                             placeholder='0.00'
//                                                             className={`w-full text-right ${selectedEcs.includes(slab.fmfS_Id) && (!slab.ftfsE_Amount || Number.parseFloat(slab.ftfsE_Amount) <= 0) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
//                                                         />
//                                                     </TableCell>
//                                                 </TableRow>
//                                             ))
//                                         )}
//                                     </TableBody>
//                                 </Table>
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 <DialogFooter className='px-6 pb-6'>
//                     <Button variant='outline' onClick={handleClose}>
//                         Cancel
//                     </Button>
//                     <Button onClick={handleAddToCart} className='gap-2' disabled={selectedRegular.length === 0 && selectedEcs.length === 0}>
//                         <Plus className='h-4 w-4' />
//                         Add to Cart ({selectedRegular.length + selectedEcs.length})
//                     </Button>
//                 </DialogFooter>
//             </DialogContent>
//         </Dialog>
//     );
// }

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/extension/field';
import { InputText } from '@/components/ui/extension/input-text';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getFineslabDetails, getSavedFineSlabs } from '@/server/fees/trasactions/feeAmountEntry';
import type { IAmountEntryFineSlabDetails } from '@/types/fees/transactions/transactions';
import { AlertCircle, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FineSlab {
    fmfS_Id: number;
    fmfS_FineType: string;
    fmfS_FromDay: number;
    fmfS_ToDay: number;
    fmfS_ECSFlag: string;
    ftfS_Id?: number;
    ftfS_Amount?: string;
    FTFS_FineType?: string;
    FTFSE_FineType?: string;
    ftfsE_Id?: number;
    ftfsE_Amount?: string;
    isSelected: boolean;
    fmH_Id?: number;
    ftI_Id?: number;
}

interface FineSlabModalProps {
    isOpen: boolean;
    onClose: () => void;
    headId: number;
    installmentId: number;
    feeGroupId: number;
    categoryId: number;
    academicYearId: number;
    selectionType: string; // 'stud', 'stfoth', 'stfothamt'
    onSave: (regularSlabs: FineSlab[], ecsSlabs: FineSlab[]) => void;
    existingRegularSlabs?: FineSlab[];
    existingEcsSlabs?: FineSlab[];
    mode?: 'edit' | 'view'; // Add mode prop
}

export default function FineSlabModal({
    isOpen,
    onClose,
    headId,
    installmentId,
    feeGroupId,
    categoryId,
    academicYearId,
    selectionType,
    onSave,
    existingRegularSlabs = [],
    existingEcsSlabs = [],
    mode = 'edit' // Default to edit mode
}: FineSlabModalProps) {
    const [showRegularSlab, setShowRegularSlab] = useState(false);
    const [showEcsSlab, setShowEcsSlab] = useState(false);
    const [regularSlabs, setRegularSlabs] = useState<FineSlab[]>([]);
    const [ecsSlabs, setEcsSlabs] = useState<FineSlab[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRegular, setSelectedRegular] = useState<number[]>([]);
    const [selectedEcs, setSelectedEcs] = useState<number[]>([]);
    const [validationError, setValidationError] = useState<string>('');

    const fineTypeOptions = [
        { value: 'Per Day', label: 'Per Day' },
        { value: 'Day Slab', label: 'Day Slab' }
    ];

    // Fetch fine slabs when modal opens
    // Update the useEffect
    useEffect(() => {
        console.log('FineSlabModal useEffect triggered', {
            isOpen,
            headId,
            installmentId,
            mode,
            existingRegularSlabsCount: existingRegularSlabs.length,
            existingEcsSlabsCount: existingEcsSlabs.length
        });

        if (isOpen && headId && installmentId) {
            if (mode === 'view' || (existingRegularSlabs.length === 0 && existingEcsSlabs.length === 0)) {
                console.log('Calling fetchSavedFineSlabs()');
                fetchSavedFineSlabs();
            } else {
                console.log('Calling fetchFineSlabs()');
                fetchFineSlabs();
            }
        }
    }, [isOpen, headId, installmentId, mode, existingRegularSlabs.length, existingEcsSlabs.length]);

    // Initialize with existing selected slabs
    useEffect(() => {
        if (existingRegularSlabs.length > 0) {
            const regularIds = existingRegularSlabs.map((slab) => slab.fmfS_Id);
            setSelectedRegular(regularIds);
        }

        if (existingEcsSlabs.length > 0) {
            const ecsIds = existingEcsSlabs.map((slab) => slab.fmfS_Id);
            setSelectedEcs(ecsIds);
        }
    }, [existingRegularSlabs, existingEcsSlabs]);

    // New function to fetch saved fine slabs
    // New function to fetch saved fine slabs
    // Function to fetch saved fine slabs
    // Function to fetch saved fine slabs
    // Function to fetch saved fine slabs
    // Function to fetch saved fine slabs
    const fetchSavedFineSlabs = async () => {
        setLoading(true);
        try {
            console.log('Fetching saved fine slabs with params:', {
                feeGroupId,
                categoryId,
                selectionType,
                academicYearId,
                headId,
                installmentId
            });

            const payload = {
                FMG_Id: feeGroupId,
                FMCC_Id: categoryId,
                selectiontype: selectionType,
                ASMAY_Id: academicYearId
            };

            console.log('Payload being sent:', payload);

            const response = await getSavedFineSlabs(payload);

            console.log('Raw API Response:', response);

            const responseData = response?.data;

            console.log('Response data:', responseData);

            // Initialize arrays
            const savedRegularSlabs: FineSlab[] = [];
            const savedEcsSlabs: FineSlab[] = [];

            if (responseData?.fineslabdetails && Array.isArray(responseData.fineslabdetails)) {
                console.log('Processing fineslabdetails...');
                console.log('All fineslabdetails:', responseData.fineslabdetails);

                // Filter for current head and installment
                responseData.fineslabdetails.forEach((item: any) => {
                    const itemHeadId = Number(item.fmH_Id);
                    const itemInstallmentId = Number(item.ftI_Id);
                    const currentHeadId = Number(headId);
                    const currentInstallmentId = Number(installmentId);

                    console.log('Checking item:', {
                        itemHeadId,
                        currentHeadId,
                        itemInstallmentId,
                        currentInstallmentId,
                        ecsFlag: item.fmfS_ECSFlag,
                        match: itemHeadId === currentHeadId && itemInstallmentId === currentInstallmentId
                    });

                    if (itemHeadId === currentHeadId && itemInstallmentId === currentInstallmentId) {
                        console.log('✅ Found matching item:', item);

                        savedRegularSlabs.push({
                            fmfS_Id: Number(item.fmfS_Id),
                            fmfS_FineType: item.fmfS_FineType || '',
                            fmfS_FromDay: Number(item.fmfS_FromDay) || 0,
                            fmfS_ToDay: Number(item.fmfS_ToDay) || 0,
                            fmfS_ECSFlag: item.fmfS_ECSFlag || 'R',
                            ftfS_Id: item.ftfS_Id ? Number(item.ftfS_Id) : undefined,
                            ftfS_Amount: item.ftfS_Amount?.toString() || '',
                            FTFS_FineType: item.ftfS_FineType || '', // Map ftfS_FineType to FTFS_FineType
                            isSelected: true,
                            fmH_Id: Number(item.fmH_Id),
                            ftI_Id: Number(item.ftI_Id)
                        });
                    }
                });
            }

            if (responseData?.fineslabdetailsecs && Array.isArray(responseData.fineslabdetailsecs)) {
                console.log('Processing fineslabdetailsecs...');
                console.log('All fineslabdetailsecs:', responseData.fineslabdetailsecs);

                responseData.fineslabdetailsecs.forEach((item: any) => {
                    const itemHeadId = Number(item.fmH_Id);
                    const itemInstallmentId = Number(item.ftI_Id);
                    const currentHeadId = Number(headId);
                    const currentInstallmentId = Number(installmentId);

                    if (itemHeadId === currentHeadId && itemInstallmentId === currentInstallmentId) {
                        console.log('✅ Found matching ECS item:', item);

                        savedEcsSlabs.push({
                            fmfS_Id: Number(item.fmfS_Id),
                            fmfS_FineType: item.fmfS_FineType || '',
                            fmfS_FromDay: Number(item.fmfS_FromDay) || 0,
                            fmfS_ToDay: Number(item.fmfS_ToDay) || 0,
                            fmfS_ECSFlag: item.fmfS_ECSFlag || 'E',
                            ftfsE_Id: item.ftfsE_Id ? Number(item.ftfsE_Id) : undefined,
                            ftfsE_Amount: item.ftfsE_Amount?.toString() || '',
                            FTFSE_FineType: item.FTFSE_FineType || '',
                            isSelected: true,
                            fmH_Id: Number(item.fmH_Id),
                            ftI_Id: Number(item.ftI_Id)
                        });
                    }
                });
            }

            console.log(' FINAL - Regular slabs:', savedRegularSlabs);
            console.log(' FINAL - ECS slabs:', savedEcsSlabs);

            // Set the slabs data
            setRegularSlabs(savedRegularSlabs);
            setEcsSlabs(savedEcsSlabs);

            const hasRegularData = savedRegularSlabs.length > 0;
            const hasEcsData = savedEcsSlabs.length > 0;

            console.log('🔘 Setting showRegularSlab to:', hasRegularData);
            setShowRegularSlab(hasRegularData);

            if (selectionType === 'stfoth') {
                setShowEcsSlab(false);
            } else {
                console.log('🔘 Setting showEcsSlab to:', hasEcsData);
                setShowEcsSlab(hasEcsData);
            }

            // Auto-select all saved slabs
            const regularIds = savedRegularSlabs.map((s) => s.fmfS_Id);
            const ecsIds = savedEcsSlabs.map((s) => s.fmfS_Id);
            console.log('Setting selectedRegular:', regularIds);
            console.log('Setting selectedEcs:', ecsIds);
            setSelectedRegular(regularIds);
            setSelectedEcs(ecsIds);
        } catch (error) {
            console.error('Error fetching saved fine slabs:', error);
            toast.error('Failed to load saved fine slabs');
        } finally {
            setLoading(false);
        }
    };
    const fetchFineSlabs = async () => {
        setLoading(true);
        try {
            let response: IAmountEntryFineSlabDetails;
            if (selectionType === 'stud') {
                response = (await getFineslabDetails('R', 'E')) as unknown as IAmountEntryFineSlabDetails;
            } else {
                response = (await getFineslabDetails('R')) as unknown as IAmountEntryFineSlabDetails;
            }

            if (response?.data) {
                const regularData: FineSlab[] = response.data.fillslab.map((slab) => ({
                    fmfS_Id: slab.fmfS_Id,
                    fmfS_FineType: slab.fmfS_FineType,
                    fmfS_FromDay: slab.fmfS_FromDay,
                    fmfS_ToDay: slab.fmfS_ToDay,
                    fmfS_ECSFlag: slab.fmfS_ECSFlag,
                    isSelected: false,
                    FTFS_FineType: '',
                    ftfS_Amount: ''
                }));

                const ecsData: FineSlab[] = response.data.fillslabecs.map((slab) => ({
                    fmfS_Id: slab.fmfS_Id,
                    fmfS_FineType: slab.fmfS_FineType,
                    fmfS_FromDay: slab.fmfS_FromDay,
                    fmfS_ToDay: slab.fmfS_ToDay,
                    fmfS_ECSFlag: slab.fmfS_ECSFlag,
                    isSelected: false,
                    FTFSE_FineType: '',
                    ftfsE_Amount: ''
                }));

                setRegularSlabs(regularData);
                setEcsSlabs(ecsData);

                // Show sections based on existing data or default to false
                setShowRegularSlab(existingRegularSlabs.length > 0);
                setShowEcsSlab(existingEcsSlabs.length > 0 && selectionType === 'stud');

                // Pre-fill data if we have existing slabs
                if (existingRegularSlabs.length > 0) {
                    const updatedRegular = regularData.map((slab) => {
                        const existing = existingRegularSlabs.find((existing) => existing.fmfS_Id === slab.fmfS_Id);
                        if (existing) {
                            return {
                                ...slab,
                                FTFS_FineType: existing.FTFS_FineType || '',
                                ftfS_Amount: existing.ftfS_Amount || '',
                                isSelected: true
                            };
                        }
                        return slab;
                    });
                    setRegularSlabs(updatedRegular);
                }

                if (existingEcsSlabs.length > 0 && selectionType === 'stud') {
                    const updatedEcs = ecsData.map((slab) => {
                        const existing = existingEcsSlabs.find((existing) => existing.fmfS_Id === slab.fmfS_Id);
                        if (existing) {
                            return {
                                ...slab,
                                FTFSE_FineType: existing.FTFSE_FineType || '',
                                ftfsE_Amount: existing.ftfsE_Amount || '',
                                isSelected: true
                            };
                        }
                        return slab;
                    });
                    setEcsSlabs(updatedEcs);
                }

                setSelectedRegular(existingRegularSlabs.map((slab) => slab.fmfS_Id));
                setSelectedEcs(existingEcsSlabs.map((slab) => slab.fmfS_Id));
            }
        } catch (error) {
            console.error('Error fetching fine slabs:', error);
            toast.error('Failed to load fine slabs');
        } finally {
            setLoading(false);
        }
    };

    const handleRegularCheckboxChange = (slabId: number) => {
        setSelectedRegular((prev) => {
            if (prev.includes(slabId)) {
                return prev.filter((id) => id !== slabId);
            }
            return [...prev, slabId];
        });
    };

    const handleEcsCheckboxChange = (slabId: number) => {
        setSelectedEcs((prev) => {
            if (prev.includes(slabId)) {
                return prev.filter((id) => id !== slabId);
            }
            return [...prev, slabId];
        });
    };

    const handleFineTypeChange = (index: number, value: string, isEcs = false) => {
        setValidationError('');
        if (isEcs) {
            const updated = [...ecsSlabs];
            updated[index].FTFSE_FineType = value;
            setEcsSlabs(updated);
        } else {
            const updated = [...regularSlabs];
            updated[index].FTFS_FineType = value;
            setRegularSlabs(updated);
        }
    };

    const handleAmountChange = (index: number, value: string, isEcs = false) => {
        setValidationError('');
        if (isEcs) {
            const updated = [...ecsSlabs];
            updated[index].ftfsE_Amount = value;
            setEcsSlabs(updated);
        } else {
            const updated = [...regularSlabs];
            updated[index].ftfS_Amount = value;
            setRegularSlabs(updated);
        }
    };

    const validateSelectedSlabs = () => {
        // Check regular slabs
        for (const slab of regularSlabs) {
            if (selectedRegular.includes(slab.fmfS_Id)) {
                if (!slab.FTFS_FineType || slab.FTFS_FineType.trim() === '') {
                    return `Please select Type for "${slab.fmfS_FineType}" in Regular Slab`;
                }
                if (!slab.ftfS_Amount || slab.ftfS_Amount.trim() === '' || Number.parseFloat(slab.ftfS_Amount) <= 0) {
                    return `Please enter valid Amount (> 0) for "${slab.fmfS_FineType}" in Regular Slab`;
                }
            }
        }

        // Check ECS slabs
        for (const slab of ecsSlabs) {
            if (selectedEcs.includes(slab.fmfS_Id)) {
                if (!slab.FTFSE_FineType || slab.FTFSE_FineType.trim() === '') {
                    return `Please select Type for "${slab.fmfS_FineType}" in ECS Slab`;
                }
                if (!slab.ftfsE_Amount || slab.ftfsE_Amount.trim() === '' || Number.parseFloat(slab.ftfsE_Amount) <= 0) {
                    return `Please enter valid Amount (> 0) for "${slab.fmfS_FineType}" in ECS Slab`;
                }
            }
        }

        return '';
    };

    const handleAddToCart = () => {
        // Always validate when saving (even in view mode when editing)
        const error = validateSelectedSlabs();
        if (error) {
            setValidationError(error);
            return;
        }

        // Prepare selected slabs with additional info
        const selectedRegularSlabs = regularSlabs
            .filter((slab) => selectedRegular.includes(slab.fmfS_Id))
            .map((slab) => ({
                ...slab,
                isSelected: true,
                fmH_Id: headId,
                ftI_Id: installmentId,
                fmG_Id: feeGroupId,
                fmcC_Id: categoryId,
                asmaY_Id: academicYearId
            }));

        const selectedEcsSlabs = ecsSlabs
            .filter((slab) => selectedEcs.includes(slab.fmfS_Id))
            .map((slab) => ({
                ...slab,
                isSelected: true,
                fmH_Id: headId,
                ftI_Id: installmentId,
                fmG_Id: feeGroupId,
                fmcC_Id: categoryId,
                asmaY_Id: academicYearId
            }));

        // Call parent save function
        onSave(selectedRegularSlabs, selectedEcsSlabs);
        setValidationError('');
        handleClose();
    };

    const handleCheckboxTypeChange = (type: 'regular' | 'ecs', checked: boolean) => {
        setValidationError('');
        if (type === 'regular') {
            setShowRegularSlab(checked);
            if (!checked) {
                setSelectedRegular([]);
            }
        } else {
            setShowEcsSlab(checked);
            if (!checked) {
                setSelectedEcs([]);
            }
        }
    };

    const handleClose = () => {
        setRegularSlabs([]);
        setEcsSlabs([]);
        setSelectedRegular([]);
        setSelectedEcs([]);
        setShowRegularSlab(false);
        setShowEcsSlab(false);
        setValidationError('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className='max-h-[90vh] max-w-[95vw] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle className='rounded-t-lg bg-primary p-4 text-white'>
                        Fine Slab Details {mode === 'view' ? '(View/Edit)' : ''}
                    </DialogTitle>
                </DialogHeader>

                <div className='p-6'>
                    {/* Type Selection */}
                    <div className='mb-8 rounded-lg bg-gray-50 p-4 text-center'>
                        <div className='flex justify-center gap-6'>
                            <Label className='flex items-center space-x-2'>
                                <Checkbox
                                    checked={showRegularSlab}
                                    onCheckedChange={(checked) => handleCheckboxTypeChange('regular', checked as boolean)}
                                />
                                <span className='lbl padding-8'>Regular</span>
                            </Label>
                            {selectionType === 'stud' && (
                                <Label className='flex items-center space-x-2'>
                                    <Checkbox
                                        checked={showEcsSlab}
                                        onCheckedChange={(checked) => handleCheckboxTypeChange('ecs', checked as boolean)}
                                    />
                                    <span className='lbl padding-8'>ECS</span>
                                </Label>
                            )}
                        </div>
                    </div>

                    {/* Validation Error */}
                    {validationError && (
                        <div className='mb-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-red-700'>
                            <AlertCircle className='h-5 w-5 flex-shrink-0' />
                            <span className='font-medium text-sm'>{validationError}</span>
                        </div>
                    )}

                    {/* Mode indicator */}
                    {/* {mode === 'view' && (
                        <div className='mb-6 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-700'>
                            <span className='font-medium text-sm'>Loaded saved fine slabs - you can edit and save changes</span>
                        </div>
                    )} */}

                    {/* Regular Slab */}
                    {showRegularSlab && (
                        <div className='mb-8 overflow-hidden rounded-lg border'>
                            <div className='flex items-center justify-between bg-primary p-4 text-white'>
                                <h3 className='font-semibold text-lg'>Regular Slab</h3>
                                <span className='text-sm'>{selectedRegular.length} selected</span>
                            </div>
                            <div className='p-6'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-[80px] text-center'>SLNO</TableHead>
                                            <TableHead className='w-[100px] text-center'>Select</TableHead>
                                            <TableHead className='min-w-[200px] px-8'>Slab Name</TableHead>
                                            <TableHead className='w-[150px] text-center'>From Day</TableHead>
                                            <TableHead className='w-[150px] text-center'>To Day</TableHead>
                                            <TableHead className='min-w-[250px] px-8'>Type</TableHead>
                                            <TableHead className='min-w-[250px] px-8'>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='py-8 text-center'>
                                                    <div className='flex justify-center'>
                                                        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : regularSlabs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='py-4 text-center text-gray-500'>
                                                    No regular slabs available
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            regularSlabs.map((slab, index) => (
                                                <TableRow
                                                    key={slab.fmfS_Id}
                                                    className={selectedRegular.includes(slab.fmfS_Id) ? 'bg-blue-50' : ''}>
                                                    <TableCell className='p-3 text-center align-middle'>{index + 1}</TableCell>
                                                    <TableCell className='p-3 text-center align-middle'>
                                                        <Checkbox
                                                            checked={selectedRegular.includes(slab.fmfS_Id)}
                                                            onCheckedChange={() => handleRegularCheckboxChange(slab.fmfS_Id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className='px-8 py-3 align-middle font-medium'>
                                                        {slab.fmfS_FineType}
                                                    </TableCell>
                                                    <TableCell className='p-3 text-center align-middle'>{slab.fmfS_FromDay}</TableCell>
                                                    <TableCell className='p-3 text-center align-middle'>{slab.fmfS_ToDay}</TableCell>
                                                    <TableCell className='px-8 py-3 align-middle'>
                                                        <Select
                                                            value={slab.FTFS_FineType || ''}
                                                            onValueChange={(value) => handleFineTypeChange(index, value)}
                                                            disabled={!selectedRegular.includes(slab.fmfS_Id)}>
                                                            <SelectTrigger
                                                                className={`w-full ${selectedRegular.includes(slab.fmfS_Id) && (!slab.FTFS_FineType || slab.FTFS_FineType.trim() === '') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}>
                                                                <SelectValue placeholder='Select Type' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {fineTypeOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className='px-8 py-3 align-middle'>
                                                        <InputText
                                                            type='number'
                                                            value={slab.ftfS_Amount || ''}
                                                            onChange={(e) => handleAmountChange(index, e.target.value)}
                                                            placeholder='0.00'
                                                            disabled={!selectedRegular.includes(slab.fmfS_Id)}
                                                            className={`w-full text-right ${selectedRegular.includes(slab.fmfS_Id) && (!slab.ftfS_Amount || Number.parseFloat(slab.ftfS_Amount) <= 0) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* ECS Slab */}
                    {showEcsSlab && selectionType === 'stud' && (
                        <div className='overflow-hidden rounded-lg border'>
                            <div className='flex items-center justify-between bg-primary p-4 text-white'>
                                <h3 className='font-semibold text-lg'>ECS Slab</h3>
                                <span className='text-sm'>{selectedEcs.length} selected</span>
                            </div>
                            <div className='p-6'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-[80px] text-center'>SLNO</TableHead>
                                            <TableHead className='w-[100px] text-center'>Select</TableHead>
                                            <TableHead className='min-w-[200px] px-8'>Slab Name</TableHead>
                                            <TableHead className='w-[150px] text-center'>From Day</TableHead>
                                            <TableHead className='w-[150px] text-center'>To Day</TableHead>
                                            <TableHead className='min-w-[250px] px-8'>Type</TableHead>
                                            <TableHead className='min-w-[250px] px-8'>Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='py-8 text-center'>
                                                    <div className='flex justify-center'>
                                                        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : ecsSlabs.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='py-4 text-center text-gray-500'>
                                                    No ECS slabs available
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            ecsSlabs.map((slab, index) => (
                                                <TableRow
                                                    key={slab.fmfS_Id}
                                                    className={selectedEcs.includes(slab.fmfS_Id) ? 'bg-blue-50' : ''}>
                                                    <TableCell className='p-3 text-center align-middle'>{index + 1}</TableCell>
                                                    <TableCell className='p-3 text-center align-middle'>
                                                        <Checkbox
                                                            checked={selectedEcs.includes(slab.fmfS_Id)}
                                                            onCheckedChange={() => handleEcsCheckboxChange(slab.fmfS_Id)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className='px-8 py-3 align-middle font-medium'>
                                                        {slab.fmfS_FineType}
                                                    </TableCell>
                                                    <TableCell className='p-3 text-center align-middle'>{slab.fmfS_FromDay}</TableCell>
                                                    <TableCell className='p-3 text-center align-middle'>{slab.fmfS_ToDay}</TableCell>
                                                    <TableCell className='px-8 py-3 align-middle'>
                                                        <Select
                                                            value={slab.FTFSE_FineType || ''}
                                                            onValueChange={(value) => handleFineTypeChange(index, value, true)}
                                                            disabled={!selectedEcs.includes(slab.fmfS_Id)}>
                                                            <SelectTrigger
                                                                className={`w-full ${selectedEcs.includes(slab.fmfS_Id) && (!slab.FTFSE_FineType || slab.FTFSE_FineType.trim() === '') ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}>
                                                                <SelectValue placeholder='Select Type' />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {fineTypeOptions.map((option) => (
                                                                    <SelectItem key={option.value} value={option.value}>
                                                                        {option.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell className='px-8 py-3 align-middle'>
                                                        <InputText
                                                            type='number'
                                                            value={slab.ftfsE_Amount || ''}
                                                            onChange={(e) => handleAmountChange(index, e.target.value, true)}
                                                            placeholder='0.00'
                                                            disabled={!selectedEcs.includes(slab.fmfS_Id)}
                                                            className={`w-full text-right ${selectedEcs.includes(slab.fmfS_Id) && (!slab.ftfsE_Amount || Number.parseFloat(slab.ftfsE_Amount) <= 0) ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className='px-6 pb-6'>
                    <Button variant='outline' onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleAddToCart} className='gap-2' disabled={selectedRegular.length === 0 && selectedEcs.length === 0}>
                        <Plus className='h-4 w-4' />
                        {mode === 'view' ? 'Update' : 'Add to Cart'} ({selectedRegular.length + selectedEcs.length})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
