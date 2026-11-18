'use client';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Eye, Plus, Trash2 } from 'lucide-react';

// Types for the component props
interface ActionButtonsProps {
    rowData: any;
    buttons: {
        edit?: boolean;
        delete?: boolean;
        toggle?: boolean;
        view?: boolean;
        copy?: boolean;
    };
    onEdit?: (data: any) => void;
    onDelete?: (data: any) => void;
    onToggle?: (data: any, newState: boolean) => void;
    onView?: (data: any) => void;
    onCopy?: (data: any) => void;
    disabled?: {
        edit?: boolean;
        delete?: boolean;
        toggle?: boolean;
        view?: boolean;
        copy?: boolean;
    };
    toggleConditionKey?: string | string[];
    className?: string;
    size?: 'sm' | 'default' | 'lg';
    variant?: 'default' | 'ghost' | 'outline';
}

export function ActionButtons({
    rowData,
    buttons = { edit: true, delete: false, toggle: false, view: false, copy: false },
    disabled = { edit: false, delete: false, toggle: false, view: false, copy: false },
    onEdit,
    onDelete,
    onToggle,
    onView,
    onCopy,
    toggleConditionKey = 'active_flag',
    className = '',
    size = 'sm',
    variant = 'ghost'
}: ActionButtonsProps) {
    const activeValues = new Set([1, true]);

    const isActive = Array.isArray(toggleConditionKey)
        ? toggleConditionKey.some((key) => activeValues.has(rowData?.[key]))
        : activeValues.has(rowData?.[toggleConditionKey as string]);

    const handleEdit = () => {
        if (onEdit) {
            onEdit(rowData);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete(rowData);
        }
    };

    const handleToggle = (checked: boolean) => {
        if (onToggle) {
            onToggle(rowData, checked);
        }
    };

    const handleView = () => {
        if (onView) {
            onView(rowData);
        }
    };

    const handleCopy = () => {
        if (onCopy) {
            onCopy(rowData);
        }
    };

    return (
        <TooltipProvider>
            <div className={`flex items-center gap-3 ${className}`}>
                {/* Copy/Add Button */}
                {buttons.copy && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={variant}
                                size={size}
                                onClick={handleCopy}
                                disabled={disabled.copy}
                                className='h-8 w-8 p-0 text-green-600 transition-all duration-200 hover:bg-green-50 hover:text-green-700'>
                                <Plus className='h-4 w-4' />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Add Copy</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* View Button */}
                {buttons.view && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={variant}
                                size={size}
                                onClick={handleView}
                                disabled={disabled.view}
                                className='h-8 w-8 p-0 text-blue-600 transition-all duration-200 hover:bg-blue-50 hover:text-blue-700'>
                                <Eye className='h-4 w-4' />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>View</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Edit Button */}
                {buttons.edit && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={variant}
                                size={size}
                                onClick={handleEdit}
                                disabled={disabled.edit}
                                className='h-8 w-8 p-0 text-primary transition-all duration-200 hover:bg-primary/5 hover:text-primary'>
                                <Edit className='h-4 w-4' />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Edit</p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {/* Status Label and Toggle Switch */}
                {buttons.toggle && (
                    <div className='flex w-28 items-center gap-2'>
                        <span className={`font-medium text-sm ${isActive ? 'text-green-700' : 'text-red-600'}`}>
                            {isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Switch
                            checked={isActive}
                            onCheckedChange={handleToggle}
                            className='data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500'
                        />
                    </div>
                )}

                {/* Delete Button */}
                {buttons.delete && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant={variant}
                                size={size}
                                onClick={handleDelete}
                                className='h-8 w-8 p-0 text-destructive transition-all duration-200 hover:bg-red-50 hover:text-destructive'>
                                <Trash2 className='h-4 w-4' />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete</p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>
        </TooltipProvider>
    );
}
