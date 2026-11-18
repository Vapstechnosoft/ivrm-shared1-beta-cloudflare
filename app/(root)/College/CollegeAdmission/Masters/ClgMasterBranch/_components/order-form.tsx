'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { IClgMasterBranch } from '@/types/college/masters';
import { useSaveClgMasterBranchOrder } from '@/hooks/college/useCollegeMasters';
import { toast } from 'sonner';
import { Loader2, GripVertical } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface OrderClgMasterBranchFormProps {
    data: IClgMasterBranch[];
    onClose: () => void;
}

function SortableItem({ item, index }: { item: IClgMasterBranch; index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.amB_Id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className='flex items-center gap-4 border p-3 bg-card rounded-md shadow-sm mb-2 hover:bg-accent/50'>
            <div {...attributes} {...listeners} className='cursor-grab active:cursor-grabbing text-muted-foreground'>
                <GripVertical className='h-5 w-5' />
            </div>
            <div className='flex-1 grid grid-cols-4 gap-4 text-center items-center'>
                <div className='font-medium border-r'>{index + 1}</div>
                <div className='font-medium border-r'>{item.amB_BranchName}</div>
                <div className='text-muted-foreground border-r'>{item.amB_BranchCode}</div>
                <div className='font-semibold'>{index + 1}</div>
            </div>
        </div>
    );
}

export default function OrderClgMasterBranchForm({ data, onClose }: OrderClgMasterBranchFormProps) {
    const [items, setItems] = useState<IClgMasterBranch[]>([]);
    const saveOrderMutation = useSaveClgMasterBranchOrder();

    useEffect(() => {
        // Sort items by current order initially
        const sortedData = [...data].sort((a, b) => {
            const orderA = Number(a.amB_Order) || 0;
            const orderB = Number(b.amB_Order) || 0;
            return orderA - orderB;
        });
        setItems(sortedData);
    }, [data]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.amB_Id.toString() === active.id);
                const newIndex = items.findIndex((item) => item.amB_Id.toString() === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        const payload = items.map((item, index) => ({
            amB_Id: item.amB_Id,
            amB_Order: index + 1
        }));

        const promise = saveOrderMutation.mutateAsync({
            orderlistbranch: payload
        });

        toast.promise(promise, {
            loading: 'Saving order...',
            success: (response: any) => {
                if (response?.success === false) {
                    throw new Error(response?.message || 'Failed to update the record');
                }
                if (response?.success || response?.returnval) {
                    onClose();
                    return response?.message || 'Records Updated Successfully';
                }
                throw new Error('Failed to update the record');
            },
            error: (err: any) => err.message || 'No Records Updated'
        });
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='max-w-3xl max-h-[80vh] flex flex-col'>
                <DialogHeader>
                    <DialogTitle>Set Branch Order</DialogTitle>
                </DialogHeader>
                
                <div className='flex-1 overflow-y-auto p-1'>
                    <div className='flex items-center gap-4 border p-3 bg-[#0a58a6] text-white rounded-md shadow-sm mb-2'>
                        <div className='w-5'></div>
                        <div className='flex-1 grid grid-cols-4 gap-4 text-center font-bold text-sm'>
                            <div className='border-r border-white/20'>SLNO</div>
                            <div className='border-r border-white/20'>Branch Name</div>
                            <div className='border-r border-white/20'>Branch Code</div>
                            <div>Branch Order</div>
                        </div>
                    </div>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(item => item.amB_Id.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.map((item, index) => (
                                <SortableItem key={item.amB_Id} item={item} index={index} />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>

                <DialogFooter className='mt-4'>
                    <Button variant='outline' onClick={onClose} disabled={saveOrderMutation.isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saveOrderMutation.isPending}>
                        {saveOrderMutation.isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                        Save Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
