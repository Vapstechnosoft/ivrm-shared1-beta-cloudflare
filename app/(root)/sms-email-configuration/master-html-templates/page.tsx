'use client';

import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
    useDeleteHtmlTemplate,
    useEditHtmlTemplate,
    useHtmlTemplatesData,
    useSaveHtmlTemplate
} from '@/hooks/sms-email-configuration/useMasterHtmlTemplates';
import { tableSearchVariables } from '@/lib/data-table.config';
import type { MasterHtmlTemplate } from '@/types/sms-email-configuration/master-html-templates';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, List, Plus } from 'lucide-react';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import * as z from 'zod';

const formSchema = z.object({
    ismhtmL_Id: z.number().default(0),
    ismhtmL_HTMLName: z
        .string()
        .min(1, { message: 'Enter Template Name' })
        .max(50, { message: 'Maximum 50 characters allowed' })
        .regex(/^[a-zA-Z0-9\[\]_-]+$/, {
            message: 'Only alphanumeric characters, brackets, underscores, and hyphens are allowed'
        }),
    ismhtmL_HTMLTemplate: z.string().min(1, { message: 'Enter Html Template' })
});

export default function MasterHTMLTemplates() {
    const { data: initData, isLoading } = useHtmlTemplatesData();
    const saveMutation = useSaveHtmlTemplate();
    const deleteMutation = useDeleteHtmlTemplate();
    const editMutation = useEditHtmlTemplate();

    const [searchTerm, setSearchTerm] = useState('');
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [viewHtmlContent, setViewHtmlContent] = useState('');
    const [showForm, setShowForm] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const quillRef = useRef<any>(null);
    const [quillSelection, setQuillSelection] = useState<number | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ismhtmL_Id: 0,
            ismhtmL_HTMLName: '',
            ismhtmL_HTMLTemplate: ''
        }
    });

    const parameterlist = initData?.parameterlist || [];
    const parameters = initData?.parms || [];

    const [searchQuery] = useQueryState(tableSearchVariables.search, parseAsString.withDefault(''));

    const [currentPage] = useQueryState(tableSearchVariables.page, parseAsInteger.withDefault(1));

    const [pageSize] = useQueryState(tableSearchVariables.page_size, parseAsInteger.withDefault(10));

    const filteredData = React.useMemo(() => {
        if (!searchQuery) return parameterlist;
        const lowerQuery = searchQuery.toLowerCase();
        return parameterlist.filter(
            (item: any) =>
                item.ismhtmL_HTMLName?.toLowerCase().includes(lowerQuery) || item.ismhtmL_HTMLTemplate?.toLowerCase().includes(lowerQuery)
        );
    }, [parameterlist, searchQuery]);

    const paginatedData = React.useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return filteredData.slice(startIndex, startIndex + pageSize);
    }, [filteredData, currentPage, pageSize]);

    const filteredParameters = parameters.filter((item: any) => item.ismP_NAME.toLowerCase().includes(searchTerm.toLowerCase()));

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        saveMutation.mutate(values, {
            onSuccess: (data: any) => {
                if (data && (data.success || data.returnval)) {
                    form.reset();
                    setShowForm(false);
                }
            }
        });
    };

    const handleEdit = (record: MasterHtmlTemplate) => {
        editMutation.mutate(
            { ismhtmL_Id: record.ismhtmL_Id },
            {
                onSuccess: (data) => {
                    const row = data[0];
                    if (row) {
                        form.setValue('ismhtmL_Id', row.ismhtmL_Id);
                        form.setValue('ismhtmL_HTMLName', row.ismhtmL_HTMLName);
                        form.setValue('ismhtmL_HTMLTemplate', row.ismhtmL_HTMLTemplate);
                        setShowForm(true);
                    }
                }
            }
        );
    };

    const handleDeactivate = (record: MasterHtmlTemplate) => {
        const isActivating = !record.ismhtmL_ActiveFlg;
        const actionText = isActivating ? 'Activate' : 'Deactivate';

        Swal.fire({
            title: 'Are you sure?',
            text: `Do you want to ${actionText} record?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#DD6B55',
            confirmButtonText: `Yes, ${actionText} it!`,
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMutation.mutate({
                    ismhtmL_Id: record.ismhtmL_Id,
                    ismhtmL_ActiveFlg: record.ismhtmL_ActiveFlg
                });
            } else {
                Swal.fire(`${actionText} Cancelled`, '', 'error');
            }
        });
    };

    const handleViewTemplate = (htmlTemplate: string) => {
        setViewHtmlContent(htmlTemplate);
        setViewModalOpen(true);
    };

    const appendParameter = (paramName: string) => {
        const quill = quillRef.current?.getEditor();
        if (quill) {
            const position = quillSelection !== null ? quillSelection : quill.getLength() - 1; // getLength includes trailing newline
            const insertPos = Math.max(0, position);
            quill.insertText(insertPos, paramName);

            const newPos = insertPos + paramName.length;
            setTimeout(() => {
                quill.setSelection(newPos, 0);
                setQuillSelection(newPos);
            }, 0);
            return;
        }

        const currentValue = form.getValues('ismhtmL_HTMLTemplate') || '';

        if (textareaRef.current) {
            const cursorPosition = textareaRef.current.selectionStart;
            const textBeforeCursor = currentValue.substring(0, cursorPosition);
            const textAfterCursor = currentValue.substring(cursorPosition);
            const newValue = `${textBeforeCursor}${paramName}${textAfterCursor}`;

            form.setValue('ismhtmL_HTMLTemplate', newValue, { shouldValidate: true });

            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    const newCursorPosition = cursorPosition + paramName.length;
                    textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
                }
            }, 0);
        } else {
            form.setValue('ismhtmL_HTMLTemplate', currentValue + paramName, { shouldValidate: true });
        }
    };

    const handleClear = () => {
        form.reset({
            ismhtmL_Id: 0,
            ismhtmL_HTMLName: '',
            ismhtmL_HTMLTemplate: ''
        });
        setShowForm(false);
    };

    const columns: ColumnDef<MasterHtmlTemplate>[] = [
        {
            id: 'slno',
            header: () => <div className='text-center'>SL NO</div>,
            cell: ({ row }) => <div className='text-center'>{(currentPage - 1) * pageSize + row.index + 1}</div>
        },
        {
            accessorKey: 'ismhtmL_HTMLName',
            header: () => <div className='text-center'>TEMPLATE NAME</div>,
            cell: ({ row }) => <div className='text-center'>{row.original.ismhtmL_HTMLName}</div>
        },
        {
            accessorKey: 'ismhtmL_HTMLTemplate',
            header: () => <div className='text-center'>TEMPLATE</div>,
            cell: ({ row }) => (
                <div className='text-center'>
                    <Button
                        variant='link'
                        className='h-auto p-0 font-normal text-blue-600 hover:text-blue-800'
                        onClick={() => handleViewTemplate(row.original.ismhtmL_HTMLTemplate)}>
                        <Eye className='mr-1 h-4 w-4' />
                        View Html Template
                    </Button>
                </div>
            )
        },
        {
            id: 'actions',
            header: () => <div className='text-center'>Action</div>,
            cell: ({ row }) => (
                <div className='flex items-center justify-center gap-2'>
                    <button
                        onClick={() => handleEdit(row.original)}
                        className='text-primary transition-colors hover:text-primary/80'
                        title='Edit'>
                        <Edit className='h-4 w-4' />
                    </button>
                    <span className='text-gray-300'>|</span>
                    <button
                        className={`text-sm transition-colors ${
                            row.original.ismhtmL_ActiveFlg
                                ? 'text-destructive hover:text-destructive/80'
                                : 'text-green-600 hover:text-green-700'
                        }`}
                        onClick={() => handleDeactivate(row.original)}>
                        {row.original.ismhtmL_ActiveFlg ? 'Deactivate' : 'Activate'}
                    </button>
                </div>
            )
        }
    ];

    if (isLoading) return <div className='p-4'>Loading...</div>;

    return (
        <div className='space-y-6'>
            {showForm && (
                <Card className='rounded-md border-t-4 border-t-primary shadow-md'>
                    <CardHeader className='flex flex-row items-center justify-between border-border/50 border-b bg-white py-3'>
                        <CardTitle className='font-bold text-base text-primary uppercase'>EMAIL TEMPLATE</CardTitle>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={() => {
                                setShowForm(false);
                                handleClear();
                            }}
                            className='h-8'>
                            <List className='mr-2 h-4 w-4' />
                            View List
                        </Button>
                    </CardHeader>
                    <CardContent className='bg-slate-50/50 pt-6'>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
                                <div className='mb-6 flex justify-center'>
                                    <div className='w-full max-w-lg'>
                                        <FormField
                                            control={form.control}
                                            name='ismhtmL_HTMLName'
                                            render={({ field }) => (
                                                <FormItem className='grid grid-cols-4 items-center gap-4 space-y-0'>
                                                    <FormLabel className='col-span-1 text-right font-medium text-gray-700 text-sm'>
                                                        Template Name:<span className='text-red-500'>*</span>
                                                    </FormLabel>
                                                    <FormControl className='col-span-3'>
                                                        <Input
                                                            {...field}
                                                            maxLength={50}
                                                            className='h-9 border-blue-200 focus-visible:ring-blue-500'
                                                        />
                                                    </FormControl>
                                                    <FormMessage className='col-span-3 col-start-2' />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
                                    <div className='space-y-4 md:col-span-3'>
                                        <FormField
                                            control={form.control}
                                            name='ismhtmL_HTMLTemplate'
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className='space-y-6'>
                                                            <div className='rounded-md border bg-white'>
                                                                <ReactQuill
                                                                    // @ts-ignore
                                                                    ref={quillRef}
                                                                    theme='snow'
                                                                    value={field.value}
                                                                    onChange={field.onChange}
                                                                    onChangeSelection={(selection) => {
                                                                        if (selection) {
                                                                            setQuillSelection(selection.index);
                                                                        }
                                                                    }}
                                                                    className='mb-12 h-[250px]'
                                                                    placeholder='Type your HTML template here...'
                                                                    modules={{
                                                                        toolbar: [
                                                                            [{ header: [1, 2, 3, false] }],
                                                                            ['bold', 'italic', 'underline', 'strike'],
                                                                            [{ align: [] }],
                                                                            [{ list: 'ordered' }, { list: 'bullet' }],
                                                                            ['link', 'image'],
                                                                            ['clean']
                                                                        ]
                                                                    }}
                                                                />
                                                            </div>

                                                            <div>
                                                                <FormLabel className='mb-2 block font-semibold text-sm'>
                                                                    Html Template:
                                                                </FormLabel>
                                                                <Textarea
                                                                    {...field}
                                                                    ref={(e) => {
                                                                        field.ref(e);
                                                                        // @ts-ignore
                                                                        textareaRef.current = e;
                                                                    }}
                                                                    className='min-h-[150px] resize-y bg-slate-50 font-mono text-xs'
                                                                    placeholder='Raw HTML will appear here...'
                                                                />
                                                            </div>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className='flex h-[500px] flex-col rounded-md border bg-white p-0 shadow-sm md:col-span-1'>
                                        <div className='border-b bg-slate-100 p-2'>
                                            <FormLabel className='block text-center font-bold text-xs tracking-wide'>PARAMETERS:</FormLabel>
                                        </div>
                                        <div className='border-b p-2'>
                                            <Input
                                                placeholder='Search parameters...'
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className='h-8 text-xs'
                                            />
                                        </div>
                                        <ScrollArea className='flex-1 p-2'>
                                            <div className='space-y-1'>
                                                {filteredParameters.length > 0 ? (
                                                    filteredParameters.map((param) => (
                                                        <div
                                                            key={param.ismP_ID}
                                                            className='cursor-pointer rounded border border-transparent p-2 text-sm transition-colors hover:border-primary/20 hover:bg-primary/10'
                                                            onClick={() => appendParameter(param.ismP_NAME)}
                                                            title={`Insert ${param.ismP_NAME}`}>
                                                            {param.ismP_NAME}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className='py-4 text-center text-muted-foreground text-sm'>
                                                        No parameters found
                                                    </div>
                                                )}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                </div>

                                <div className='mt-4 flex items-center justify-center gap-4 border-border/50 border-t pt-6'>
                                    <Button
                                        type='submit'
                                        className='w-[120px] rounded bg-[#3f51b5] text-white shadow-md hover:bg-[#3f51b5]/90'
                                        disabled={saveMutation.isPending}>
                                        <i className='fa fa-floppy-o mr-2' aria-hidden='true'></i>
                                        Save
                                    </Button>
                                    <Button
                                        type='button'
                                        className='w-[120px] rounded bg-[#ff5722] text-white shadow-md hover:bg-[#ff5722]/90'
                                        onClick={handleClear}>
                                        <i className='fa fa-times mr-2' aria-hidden='true'></i>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            )}

            {!showForm && (
                <Card>
                    <CardHeader className='flex flex-row items-center justify-between border-border/50 border-b'>
                        <CardTitle>EMAIL TEMPLATE LIST</CardTitle>
                        <Button onClick={() => setShowForm(true)} size='sm'>
                            <Plus className='mr-2 h-4 w-4' />
                            Add New
                        </Button>
                    </CardHeader>
                    <CardContent className='pt-6'>
                        <DataTable columns={columns as any} data={paginatedData} totalItems={filteredData.length} />
                    </CardContent>
                </Card>
            )}

            <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
                <DialogContent className='max-h-[80vh] max-w-4xl overflow-y-auto'>
                    <DialogHeader>
                        <DialogTitle>Template Preview</DialogTitle>
                    </DialogHeader>
                    <div className='min-h-[300px] rounded-md border bg-white p-4'>
                        <div dangerouslySetInnerHTML={{ __html: viewHtmlContent }} className='prose max-w-none' />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
