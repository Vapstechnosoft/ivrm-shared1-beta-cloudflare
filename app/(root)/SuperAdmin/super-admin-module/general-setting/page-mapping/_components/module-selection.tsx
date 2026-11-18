'use client';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePageMapping } from './mapping-context';

export default function ModuleSelection() {
    const { modules, selectedModuleId, setSelectedModuleId } = usePageMapping();

    return (
        <div className='mb-6 grid grid-cols-12 items-center gap-4 rounded-md border bg-white p-4 shadow-sm'>
            <Label className='col-span-12 font-semibold text-md md:col-span-2'>Select Module:</Label>
            <div className='col-span-12 md:col-span-4'>
                <Select value={selectedModuleId ? String(selectedModuleId) : ''} onValueChange={(val) => setSelectedModuleId(Number(val))}>
                    <SelectTrigger>
                        <SelectValue placeholder='-- Select Module --' />
                    </SelectTrigger>
                    <SelectContent>
                        {modules.map((mod) => (
                            <SelectItem key={mod.ivrmM_Id} value={String(mod.ivrmM_Id)}>
                                {mod.ivrmM_ModuleName}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
