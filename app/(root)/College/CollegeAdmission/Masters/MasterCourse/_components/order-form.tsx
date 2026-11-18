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
import { IMasterCourse } from '@/types/college/masters';
import { useSaveMasterCourseOrder } from '@/hooks/college/useCollegeMasters';
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

interface OrderMasterCourseFormProps {
    data: IMasterCourse[];
    onClose: () => void;
}

function SortableItem({ item, index }: { item: IMasterCourse; index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: item.amcO_Id.toString() });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className='flex items-center gap-4 border p-3 bg-card rounded-md shadow-sm mb-2'>
            <div {...attributes} {...listeners} className='cursor-grab active:cursor-grabbing text-muted-foreground'>
                <GripVertical className='h-5 w-5' />
            </div>
            <div className='flex-1 grid grid-cols-3 gap-4'>
                <div className='font-medium'>{item.amcO_CourseName}</div>
                <div className='text-muted-foreground'>{item.amcO_CourseCode}</div>
                <div className='text-right font-semibold'>Order: {index + 1}</div>
            </div>
        </div>
    );
}

export default function OrderMasterCourseForm({ data, onClose }: OrderMasterCourseFormProps) {
    const [items, setItems] = useState<IMasterCourse[]>([]);
    const saveOrderMutation = useSaveMasterCourseOrder();

    useEffect(() => {
        // Sort items by current order initially
        const sortedData = [...data].sort((a, b) => {
            const orderA = Number(a.amcO_Order) || 0;
            const orderB = Number(b.amcO_Order) || 0;
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
                const oldIndex = items.findIndex((item) => item.amcO_Id.toString() === active.id);
                const newIndex = items.findIndex((item) => item.amcO_Id.toString() === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        const payload = items.map((item, index) => ({
            ...item,
            amcO_Order: index + 1
        }));

        const promise = saveOrderMutation.mutateAsync({
            coursedto: payload
        });

        toast.promise(promise, {
            loading: 'Saving order...',
            success: (response: any) => {
                if (response?.retrunMsg) {
                    onClose();
                    return response.retrunMsg;
                }
                onClose();
                return 'Records Updated Successfully';
            },
            error: (err: any) => err.message || 'No Records Updated'
        });
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className='max-w-3xl max-h-[80vh] flex flex-col'>
                <DialogHeader>
                    <DialogTitle>Set Course Order</DialogTitle>
                </DialogHeader>
                
                <div className='flex-1 overflow-y-auto p-1'>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={items.map(item => item.amcO_Id.toString())}
                            strategy={verticalListSortingStrategy}
                        >
                            {items.map((item, index) => (
                                <SortableItem key={item.amcO_Id} item={item} index={index} />
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
