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
import { useSaveMasterSemesterOrder } from '@/hooks/college/useCollegeMasters';
import { IClgMasterSemester } from '@/types/college/masters';
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
        <tr ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-primary/10 border-b border-primary/20 text-sm font-medium cursor-grab active:cursor-grabbing hover:bg-primary/20">
            {props.children}
        </tr>
    );
}

interface OrderMasterSemesterFormProps {
    data: IClgMasterSemester[];
    onClose: () => void;
}

export default function OrderMasterSemesterForm({ data, onClose }: OrderMasterSemesterFormProps) {
    const saveOrderMutation = useSaveMasterSemesterOrder();
    const [items, setItems] = useState<IClgMasterSemester[]>([]);

    useEffect(() => {
        // Sort items initially by current order
        if (data) {
            const sorted = [...data].sort((a, b) => a.amsE_SEMOrder - b.amsE_SEMOrder);
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
                const oldIndex = items.findIndex((item) => item.amsE_Id === active.id);
                const newIndex = items.findIndex((item) => item.amsE_Id === over.id);

                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSaveOrder = async () => {
        const payload = {
            sem_temp: items.map((item, index) => ({
                amsE_Id: item.amsE_Id,
                amsE_SEMName: item.amsE_SEMName
            }))
        };

        const promise = saveOrderMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Updating order...',
            success: (response: any) => {
                if (response?.success) {
                    onClose();
                    return response?.message || 'Semester Order Updated Successfully';
                }
                throw new Error(response?.message || 'Failed To Update Semester Order');
            },
            error: (err: any) => err.message || 'Something went wrong'
        });
    };

    return (
        <AlertDialog open={true} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>MASTER SEMESTER</AlertDialogTitle>
                </AlertDialogHeader>
                <div className="max-h-[60vh] overflow-y-auto p-2">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                            modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                        >
                            <SortableContext
                                items={items.map((item) => item.amsE_Id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <table className="w-full table-auto border-collapse border border-border">
                                    <thead>
                                        <tr className="bg-muted">
                                            <th className="border border-border px-4 py-2 text-center text-sm font-semibold">SLNO</th>
                                            <th className="border border-border px-4 py-2 text-left text-sm font-semibold">Semester Name</th>
                                            <th className="border border-border px-4 py-2 text-left text-sm font-semibold">Semester Code</th>
                                            <th className="border border-border px-4 py-2 text-center text-sm font-semibold">Semester Order</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map((item, index) => (
                                            <SortableItem key={item.amsE_Id} id={item.amsE_Id}>
                                                <td className="border border-border px-4 py-2 text-center">{index + 1}</td>
                                                <td className="border border-border px-4 py-2 text-left">{item.amsE_SEMName}</td>
                                                <td className="border border-border px-4 py-2 text-left">{item.amsE_SEMCode}</td>
                                                <td className="border border-border px-4 py-2 text-center">{item.amsE_SEMOrder}</td>
                                            </SortableItem>
                                        ))}
                                    </tbody>
                                </table>
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
