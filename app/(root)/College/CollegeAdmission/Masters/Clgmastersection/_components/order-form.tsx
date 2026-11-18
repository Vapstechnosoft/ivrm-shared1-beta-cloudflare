'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useSaveMasterSectionOrder } from '@/hooks/college/useCollegeMasters';
import { IClgMasterSection } from '@/types/college/masters';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

function SortableItem(props: { id: number; children: React.ReactNode }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </div>
    );
}

interface OrderMasterSectionFormProps {
    data: IClgMasterSection[];
    onClose: () => void;
}

export default function OrderMasterSectionForm({ data, onClose }: OrderMasterSectionFormProps) {
    const saveOrderMutation = useSaveMasterSectionOrder();
    const [items, setItems] = useState<IClgMasterSection[]>([]);

    useEffect(() => {
        // Sort items initially by current order
        if (data) {
            const sorted = [...data].sort((a, b) => a.acmS_Order - b.acmS_Order);
            setItems(sorted);
        }
    }, [data]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setItems((items) => {
                const oldIndex = items.findIndex((item) => item.acmS_Id === active.id);
                const newIndex = items.findIndex((item) => item.acmS_Id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSaveOrder = async () => {
        const payload = {
            master_Section_CLg_Temp: items.map((item, index) => ({
                acmS_Id: item.acmS_Id,
                acmS_SectionName: item.acmS_SectionName,
                acmS_Order: index + 1
            }))
        };

        const promise = saveOrderMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Updating order...',
            success: (response: any) => {
                if (response?.success) {
                    onClose();
                    return response?.message || 'Records Updated Successfully';
                }
                throw new Error(response?.message || 'Failed to Update the Record');
            },
            error: (err: any) => err.message || 'Something went wrong'
        });
    };

    return (
        <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Class Order</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-2">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                    >
                        <SortableContext
                            items={items.map((item) => item.acmS_Id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <SortableItem key={item.acmS_Id} id={item.acmS_Id}>
                                        <div className="bg-primary/10 border border-primary/20 text-primary p-3 rounded-md text-sm font-medium cursor-grab active:cursor-grabbing">
                                            {item.acmS_SectionName}
                                        </div>
                                    </SortableItem>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                    <Button onClick={handleSaveOrder} disabled={saveOrderMutation.isPending}>
                        {saveOrderMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                    <AlertDialogCancel onClick={onClose} disabled={saveOrderMutation.isPending}>
                        Close
                    </AlertDialogCancel>
                </div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
