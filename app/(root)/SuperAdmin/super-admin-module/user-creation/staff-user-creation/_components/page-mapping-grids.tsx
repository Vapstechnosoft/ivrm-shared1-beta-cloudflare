'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ApiSearchparams } from '@/types';
import type { MobilePageDTO, PageDTO, SavedMobilePageDTO, SavedPageDTO } from '@/types/super-admin/user-creation/staff-user-creation';
import { PageMappingPaginationTable, type PageMappingTableColumn } from '@/components/ui/view-data-table/page-mapping-pagination-table';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Search, Trash2 } from 'lucide-react';
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';

interface PageMappingGridsProps {
    webPages: PageDTO[];
    onWebPageUpdate: Dispatch<SetStateAction<PageDTO[]>>;
    webPageTotal: number;
    onWebPageParamsChange: Dispatch<SetStateAction<ApiSearchparams>>;
    currentWebPageParams: ApiSearchparams;
    isWebPageLoading: boolean;

    stagedWebPages: PageDTO[];
    onStagedWebPageUpdate: Dispatch<SetStateAction<PageDTO[]>>;

    savedGrid: SavedPageDTO[];
    onSavedGridUpdate: Dispatch<SetStateAction<SavedPageDTO[]>>;
    savedGridTotal: number;
    onSavedGridParamsChange: Dispatch<SetStateAction<ApiSearchparams>>;
    currentSavedGridParams: ApiSearchparams;
    isSavedGridLoading: boolean;

    savedMobilePages: SavedMobilePageDTO[];
    onSavedMobileUpdate: Dispatch<SetStateAction<SavedMobilePageDTO[]>>;
    savedMobilePageTotal: number;
    onSavedMobilePageParamsChange: Dispatch<SetStateAction<ApiSearchparams>>;
    currentSavedMobilePageParams: ApiSearchparams;
    isSavedMobilePageLoading: boolean;

    mobilePages: MobilePageDTO[];
    onMobilePageUpdate: Dispatch<SetStateAction<MobilePageDTO[]>>;
    mobilePageTotal: number;
    onMobilePageParamsChange: Dispatch<SetStateAction<ApiSearchparams>>;
    currentMobilePageParams: ApiSearchparams;
    isMobilePageLoading: boolean;

    showInstitution?: boolean;
}

export default function PageMappingGrids({
    webPages,
    onWebPageUpdate,
    webPageTotal,
    onWebPageParamsChange,
    currentWebPageParams,
    isWebPageLoading,

    stagedWebPages,
    onStagedWebPageUpdate,

    savedGrid,
    onSavedGridUpdate,
    savedGridTotal,
    onSavedGridParamsChange,
    currentSavedGridParams,
    isSavedGridLoading,

    mobilePages,
    onMobilePageUpdate,
    mobilePageTotal,
    onMobilePageParamsChange,
    currentMobilePageParams,
    isMobilePageLoading,

    savedMobilePages,
    onSavedMobileUpdate,
    savedMobilePageTotal,
    onSavedMobilePageParamsChange,
    currentSavedMobilePageParams,
    isSavedMobilePageLoading,

    showInstitution = false
}: PageMappingGridsProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [searchWeb, setSearchWeb] = useState(currentWebPageParams.search_query || '');
    const [searchMobile, setSearchMobile] = useState(currentMobilePageParams.search_query || '');
    const [searchSavedWeb, setSearchSavedWeb] = useState(currentSavedGridParams.search_query || '');
    const [searchSavedMobile, setSearchSavedMobile] = useState(currentSavedMobilePageParams.search_query || '');
    const [searchStaged, setSearchStaged] = useState(''); // Added for staged web pages
    const [stagedPage, setStagedPage] = useState(1);
    const stagedPageSize = 10;

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleWebCheck = (index: number, field: keyof PageDTO, value: boolean) => {
        const updated = [...webPages];
        console.log('webpages', webPages);
        const page = { ...updated[index] };
        (page as any)[field] = value;

        const isInStaged = stagedWebPages.some((p) => p.pageMappingId === page.pageMappingId);

        if (field === 'checked') {
            if (value) {
                updated[index] = page;
                onWebPageUpdate(updated);
                if (!isInStaged) {
                    onStagedWebPageUpdate([...stagedWebPages, page]);
                }
            } else {
                updated[index] = page;
                onWebPageUpdate(updated);
                if (isInStaged) {
                    onStagedWebPageUpdate(stagedWebPages.filter((p) => p.pageMappingId !== page.pageMappingId));
                }
            }
        } else {
            // Privilege flag clicked
            if (value) {
                // Auto-check 'checked' if privilege is granted
                page.checked = true;
                updated[index] = page;
                onWebPageUpdate(updated);

                if (!isInStaged) {
                    onStagedWebPageUpdate([...stagedWebPages, page]);
                } else {
                    onStagedWebPageUpdate(stagedWebPages.map((p) => (p.pageMappingId === page.pageMappingId ? page : p)));
                }
            } else {
                updated[index] = page;
                onWebPageUpdate(updated);
                // Privilege revoked, update in staged if present
                if (isInStaged) {
                    onStagedWebPageUpdate(stagedWebPages.map((p) => (p.pageMappingId === page.pageMappingId ? page : p)));
                }
            }
        }
    };

    const handleStagedCheck = (index: number, field: keyof PageDTO, value: boolean) => {
        if (index > -1 && index < stagedWebPages.length) {
            const updated = [...stagedWebPages];
            (updated[index] as any)[field] = value;
            onStagedWebPageUpdate(updated);
        }
    };

    const handleRemoveStaged = (pageMappingId: number) => {
        onStagedWebPageUpdate(stagedWebPages.filter((p) => p.pageMappingId !== pageMappingId));
        // Also uncheck in master list if present
        onWebPageUpdate(webPages.map((p) => (p.pageMappingId === pageMappingId ? { ...p, checked: false } : p)));
    };

    const handleToggleAll = (field: keyof PageDTO, value: boolean) => {
        const updated = webPages.map((p) => ({ ...p, [field]: value }));
        onWebPageUpdate(updated);

        if (field === 'checked') {
            if (value) {
                // Add all to staged (avoiding duplicates)
                const newStaged = [...stagedWebPages];
                updated.forEach((p) => {
                    if (!newStaged.some((s) => s.pageMappingId === p.pageMappingId)) {
                        newStaged.push({ ...p });
                    }
                });
                onStagedWebPageUpdate(newStaged);
            } else {
                // Remove all from staged if they are in the current master page view
                const masterIds = new Set(webPages.map((p) => p.pageMappingId));
                onStagedWebPageUpdate(stagedWebPages.filter((p) => !masterIds.has(p.pageMappingId)));
            }
        }
    };

    const handleMobileToggleAll = (field: keyof MobilePageDTO, value: boolean) => {
        const updated = mobilePages.map((p) => ({ ...p, [field]: value }));
        onMobilePageUpdate(updated);
    };

    const handleMobileCheck = (index: number, field: keyof MobilePageDTO, value: boolean) => {
        const updated = [...mobilePages];
        (updated[index] as any)[field] = value;
        onMobilePageUpdate(updated);
    };

    const handleSavedCheck = (index: number, field: keyof SavedPageDTO, value: boolean) => {
        const updated = [...savedGrid];
        (updated[index] as any)[field] = value;
        onSavedGridUpdate(updated);
    };

    const handleSavedMobileCheck = (index: number, field: keyof SavedMobilePageDTO, value: boolean) => {
        const updated = [...savedMobilePages];
        (updated[index] as any)[field] = value;
        onSavedMobileUpdate(updated);
    };

    const filteredWebPages = useMemo(() => {
        const query = (searchWeb || '').trim().toLowerCase();
        if (!query) return webPages;
        return webPages.filter((item) => {
            const pageName = String(item.pageName || (item as any).ivrmmP_PageName || (item as any).IVRMMP_PageName || '').toLowerCase();
            const moduleName = String(item.moduleName || (item as any).ivrmM_ModuleName || (item as any).ivrmm_ModuleName || (item as any).IVRMM_ModuleName || '').toLowerCase();
            const instName = String(item.institutionName || (item as any).intname || (item as any).instituteName || '').toLowerCase();
            return pageName.includes(query) || moduleName.includes(query) || instName.includes(query);
        });
    }, [webPages, searchWeb]);

    const filteredStaged = useMemo(() => {
        const query = (searchStaged || '').trim().toLowerCase();
        if (!query) return stagedWebPages;
        return stagedWebPages.filter((item) => {
            const pageName = String(item.pageName || (item as any).ivrmmP_PageName || (item as any).IVRMMP_PageName || '').toLowerCase();
            const moduleName = String(item.moduleName || (item as any).ivrmM_ModuleName || (item as any).ivrmm_ModuleName || (item as any).IVRMM_ModuleName || '').toLowerCase();
            const instName = String(item.institutionName || (item as any).intname || (item as any).instituteName || '').toLowerCase();
            return pageName.includes(query) || moduleName.includes(query) || instName.includes(query);
        });
    }, [stagedWebPages, searchStaged]);

    const filteredSavedGrid = useMemo(() => {
        const query = (searchSavedWeb || '').trim().toLowerCase();
        if (!query) return savedGrid;
        return savedGrid.filter((item) => {
            const pageName = String(item.ivrmmP_PageName || (item as any).pageName || (item as any).IVRMMP_PageName || '').toLowerCase();
            const moduleName = String((item as any).moduleName || (item as any).ivrmM_ModuleName || (item as any).ivrmm_ModuleName || (item as any).IVRMM_ModuleName || '').toLowerCase();
            const instName = String((item as any).institutionName || (item as any).intname || (item as any).instituteName || '').toLowerCase();
            return pageName.includes(query) || moduleName.includes(query) || instName.includes(query);
        });
    }, [savedGrid, searchSavedWeb]);

    const filteredMobilePages = useMemo(() => {
        const query = (searchMobile || '').trim().toLowerCase();
        if (!query) return mobilePages;
        return mobilePages.filter((item) => {
            const pageName = String(item.ivrmmaP_AppPageName || (item as any).appPageName || (item as any).pageName || '').toLowerCase();
            return pageName.includes(query);
        });
    }, [mobilePages, searchMobile]);

    const filteredSavedMobilePages = useMemo(() => {
        const query = (searchSavedMobile || '').trim().toLowerCase();
        if (!query) return savedMobilePages;
        return savedMobilePages.filter((item) => {
            const pageName = String(item.ivrmmaP_AppPageName || (item as any).appPageName || (item as any).pageName || '').toLowerCase();
            return pageName.includes(query);
        });
    }, [savedMobilePages, searchSavedMobile]);

    const handleWebSelect = (id: any, checked: boolean) => {
        const idx = webPages.findIndex((p) => p.pageMappingId === id);
        if (idx !== -1) handleWebCheck(idx, 'checked', checked);
    };

    const handleWebSelectAll = (checked: boolean, ids: any[]) => {
        const updated = [...webPages];
        const newStaged = [...stagedWebPages];
        const idsSet = new Set(ids);

        updated.forEach((p, idx) => {
            if (idsSet.has(p.pageMappingId)) {
                updated[idx] = { ...p, checked };
                const isInStaged = newStaged.some((s) => s.pageMappingId === p.pageMappingId);
                if (checked && !isInStaged) {
                    newStaged.push({ ...p, checked: true });
                } else if (!checked && isInStaged) {
                    const sIdx = newStaged.findIndex((s) => s.pageMappingId === p.pageMappingId);
                    newStaged.splice(sIdx, 1);
                }
            }
        });

        onWebPageUpdate(updated);
        onStagedWebPageUpdate(newStaged);
    };

    const handleSavedSelect = (id: any, checked: boolean) => {
        const idx = savedGrid.findIndex((p) => p.ivrmstauP_Id === id);
        if (idx !== -1) handleSavedCheck(idx, 'checked', checked);
    };

    const handleSavedSelectAll = (checked: boolean, ids: any[]) => {
        const idsSet = new Set(ids);
        const updated = savedGrid.map((p) => (idsSet.has(p.ivrmstauP_Id) ? { ...p, checked } : p));
        onSavedGridUpdate(updated);
    };

    const handleMobileSelect = (id: any, checked: boolean) => {
        const idx = mobilePages.findIndex((p) => p.ivrmmaP_Id === id);
        if (idx !== -1) handleMobileCheck(idx, 'checked', checked);
    };

    const handleMobileSelectAll = (checked: boolean, ids: any[]) => {
        const idsSet = new Set(ids);
        const updated = mobilePages.map((p) => (idsSet.has(p.ivrmmaP_Id) ? { ...p, checked } : p));
        onMobilePageUpdate(updated);
    };

    const handleSavedMobileSelect = (id: any, checked: boolean) => {
        const idx = savedMobilePages.findIndex((p) => p.ivrmumalP_Id === id);
        if (idx !== -1) handleSavedMobileCheck(idx, 'checked', checked);
    };

    const handleSavedMobileSelectAll = (checked: boolean, ids: any[]) => {
        const idsSet = new Set(ids);
        const updated = savedMobilePages.map((p) => (idsSet.has(p.ivrmumalP_Id) ? { ...p, checked } : p));
        onSavedMobileUpdate(updated);
    };

    const webColumns: PageMappingTableColumn<PageDTO>[] = [
        {
            header: <div className="text-center font-bold text-[10px] uppercase">SL.NO</div>,
            cell: (item, index, currentPage, itemsPerPage) => (
                <div className="text-center text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</div>
            )
        },
        ...(showInstitution
            ? [
                {
                    header: <div className="font-bold text-[10px] uppercase">Institution</div>,
                    cell: (item: PageDTO) => <span>{item.institutionName ?? ''}</span>
                }
            ]
            : []),
        {
            header: <div className="font-bold text-[10px] uppercase">Module</div>,
            cell: (item) => <span>{item.moduleName}</span>
        },
        {
            header: (
                <div className="cursor-pointer font-bold text-[10px] uppercase" >
                    Page Name{' '}
                    {currentWebPageParams.sort_column === 'pageName' && (currentWebPageParams.sort_direction === 'asc' ? '▲' : '▼')}
                </div>
            ),
            cell: (item) => <span className="font-medium text-xs">{item.pageName}</span>
        },
        {
            header: (
                <div className="flex items-center justify-center gap-1 font-bold text-[10px] uppercase">
                    Add <Checkbox onCheckedChange={(v) => handleToggleAll('addFlag', !!v)} className='bg-white' />
                </div>
            ),
            cell: (item) => {
                const idx = webPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.addFlag} onCheckedChange={(v) => handleWebCheck(idx, 'addFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: (
                <div className="flex items-center justify-center gap-1 font-bold text-[10px] uppercase">
                    Delete <Checkbox onCheckedChange={(v) => handleToggleAll('deleteFlag', !!v)} className='bg-white' />
                </div>
            ),
            cell: (item) => {
                const idx = webPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.deleteFlag} onCheckedChange={(v) => handleWebCheck(idx, 'deleteFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: (
                <div className="flex items-center justify-center gap-1 font-bold text-[10px] uppercase">
                    Update <Checkbox onCheckedChange={(v) => handleToggleAll('updateFlag', !!v)} className='bg-white' />
                </div>
            ),
            cell: (item) => {
                const idx = webPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.updateFlag} onCheckedChange={(v) => handleWebCheck(idx, 'updateFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: (
                <div className="flex items-center justify-center gap-1 font-bold text-[10px] uppercase">
                    Process <Checkbox onCheckedChange={(v) => handleToggleAll('processFlag', !!v)} className='bg-white' />
                </div>
            ),
            cell: (item) => {
                const idx = webPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.processFlag} onCheckedChange={(v) => handleWebCheck(idx, 'processFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: (
                <div className="flex items-center justify-center gap-1 font-bold text-[10px] uppercase">
                    Report <Checkbox onCheckedChange={(v) => handleToggleAll('reportFlag', !!v)} className='bg-white' />
                </div>
            ),
            cell: (item) => {
                const idx = webPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.reportFlag} onCheckedChange={(v) => handleWebCheck(idx, 'reportFlag', !!v)} />
                    </div>
                );
            }
        }
    ];

    const stagedColumns: PageMappingTableColumn<PageDTO>[] = [
        {
            header: <div className="text-center font-bold text-[10px] uppercase">SL.NO</div>,
            cell: (item, index, currentPage, itemsPerPage) => (
                <div className="text-center text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</div>
            )
        },
        {
            header: <div className="font-bold text-[10px] uppercase">Page Name</div>,
            cell: (item) => <span className="font-medium text-xs">{item.pageName}</span>
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Add</div>,
            cell: (item) => {
                const idx = stagedWebPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.addFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'addFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Del</div>,
            cell: (item) => {
                const idx = stagedWebPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.deleteFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'deleteFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Upd</div>,
            cell: (item) => {
                const idx = stagedWebPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.updateFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'updateFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Proc</div>,
            cell: (item) => {
                const idx = stagedWebPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.processFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'processFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Rep</div>,
            cell: (item) => {
                const idx = stagedWebPages.findIndex((p) => p.pageMappingId === item.pageMappingId);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.reportFlag} onCheckedChange={(v) => handleStagedCheck(idx, 'reportFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase text-white">Action</div>,
            cell: (item) => (
                <div className="flex justify-center">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRemoveStaged(item.pageMappingId)}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            )
        }
    ];

    const savedColumns: PageMappingTableColumn<SavedPageDTO>[] = [
        {
            header: <div className="text-center font-bold text-[10px] uppercase">SL.NO</div>,
            cell: (item, index, currentPage, itemsPerPage) => (
                <div className="text-center text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</div>
            )
        },
        {
            header: (
                <div className="cursor-pointer font-bold text-[10px] uppercase" >
                    Page Name{' '}
                    {currentSavedGridParams.sort_column === 'pageName' && (currentSavedGridParams.sort_direction === 'asc' ? '▲' : '▼')}
                </div>
            ),
            cell: (item) => <span className="font-medium text-xs">{item.ivrmmP_PageName}</span>
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Add</div>,
            cell: (item) => {
                const idx = savedGrid.findIndex((p) => p.ivrmstauP_Id === item.ivrmstauP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.ivrmrP_AddFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_AddFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Del</div>,
            cell: (item) => {
                const idx = savedGrid.findIndex((p) => p.ivrmstauP_Id === item.ivrmstauP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.ivrmrP_DeleteFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_DeleteFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Upd</div>,
            cell: (item) => {
                const idx = savedGrid.findIndex((p) => p.ivrmstauP_Id === item.ivrmstauP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.ivrmrP_UpdateFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_UpdateFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Proc</div>,
            cell: (item) => {
                const idx = savedGrid.findIndex((p) => p.ivrmstauP_Id === item.ivrmstauP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.ivrmrP_ProcessFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_ProcessFlag', !!v)} />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Rep</div>,
            cell: (item) => {
                const idx = savedGrid.findIndex((p) => p.ivrmstauP_Id === item.ivrmstauP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.ivrmrP_ReportFlag} onCheckedChange={(v) => handleSavedCheck(idx, 'ivrmrP_ReportFlag', !!v)} />
                    </div>
                );
            }
        }
    ];

    const mobileColumns: PageMappingTableColumn<MobilePageDTO>[] = [
        {
            header: <div className="text-center font-bold text-[10px] uppercase">SL.NO</div>,
            cell: (item, index, currentPage, itemsPerPage) => (
                <div className="text-center text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</div>
            )
        },
        {
            header: (
                <div className="cursor-pointer font-bold text-[10px] uppercase" >
                    Page Name{' '}
                    {currentMobilePageParams.sort_column === 'pageName' && (currentMobilePageParams.sort_direction === 'asc' ? '▲' : '▼')}
                </div>
            ),
            cell: (item) => <span className="font-medium text-xs">{item.ivrmmaP_AppPageName}</span>
        },
        {
            header: (
                <div className="flex items-center justify-center gap-1 font-bold text-[10px] uppercase">
                    Add <Checkbox onCheckedChange={(v) => handleMobileToggleAll('ivrmmaP_AddFlg', !!v)} className='bg-white' />
                </div>
            ),
            cell: (item) => {
                const idx = mobilePages.findIndex((p) => p.ivrmmaP_Id === item.ivrmmaP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.ivrmmaP_AddFlg} onCheckedChange={(v) => handleMobileCheck(idx, 'ivrmmaP_AddFlg', !!v)} />
                    </div>
                );
            }
        },
        {
            header: (
                <div className="flex items-center justify-center gap-1 font-bold text-[10px] uppercase">
                    Upd <Checkbox onCheckedChange={(v) => handleMobileToggleAll('ivrmmaP_UpdateFlg', !!v)} className='bg-white' />
                </div>
            ),
            cell: (item) => {
                const idx = mobilePages.findIndex((p) => p.ivrmmaP_Id === item.ivrmmaP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.ivrmmaP_UpdateFlg} onCheckedChange={(v) => handleMobileCheck(idx, 'ivrmmaP_UpdateFlg', !!v)} />
                    </div>
                );
            }
        },
        {
            header: (
                <div className="flex items-center justify-center gap-1 font-bold text-[10px] uppercase">
                    Del <Checkbox onCheckedChange={(v) => handleMobileToggleAll('ivrmmaP_DeleteFlg', !!v)} className='bg-white' />
                </div>
            ),
            cell: (item) => {
                const idx = mobilePages.findIndex((p) => p.ivrmmaP_Id === item.ivrmmaP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox checked={item.ivrmmaP_DeleteFlg} onCheckedChange={(v) => handleMobileCheck(idx, 'ivrmmaP_DeleteFlg', !!v)} />
                    </div>
                );
            }
        }
    ];

    const savedMobileColumns: PageMappingTableColumn<SavedMobilePageDTO>[] = [
        {
            header: <div className="text-center font-bold text-[10px] uppercase">SL.NO</div>,
            cell: (item, index, currentPage, itemsPerPage) => (
                <div className="text-center text-xs">{(currentPage - 1) * itemsPerPage + index + 1}</div>
            )
        },
        {
            header: (
                <div className="cursor-pointer font-bold text-[10px] uppercase" >
                    Page Name{' '}
                    {currentSavedMobilePageParams.sort_column === 'pageName' &&
                        (currentSavedMobilePageParams.sort_direction === 'asc' ? '▲' : '▼')}
                </div>
            ),
            cell: (item) => <span className="font-medium text-xs">{item.ivrmmaP_AppPageName}</span>
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Add</div>,
            cell: (item) => {
                const idx = savedMobilePages.findIndex((p) => p.ivrmumalP_Id === item.ivrmumalP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox
                            checked={!!item.ivrmumalP_AddFlg}
                            onCheckedChange={(v) => handleSavedMobileCheck(idx, 'ivrmumalP_AddFlg', !!v)}
                        />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Del</div>,
            cell: (item) => {
                const idx = savedMobilePages.findIndex((p) => p.ivrmumalP_Id === item.ivrmumalP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox
                            checked={!!item.ivrmumalP_DeleteFlg}
                            onCheckedChange={(v) => handleSavedMobileCheck(idx, 'ivrmumalP_DeleteFlg', !!v)}
                        />
                    </div>
                );
            }
        },
        {
            header: <div className="text-center font-bold text-[10px] uppercase">Upd</div>,
            cell: (item) => {
                const idx = savedMobilePages.findIndex((p) => p.ivrmumalP_Id === item.ivrmumalP_Id);
                return (
                    <div className="flex justify-center">
                        <Checkbox
                            checked={!!item.ivrmumalP_UpdateFlg}
                            onCheckedChange={(v) => handleSavedMobileCheck(idx, 'ivrmumalP_UpdateFlg', !!v)}
                        />
                    </div>
                );
            }
        }
    ];

    if (!isMounted) return null;

    return (
        <div className='space-y-6'>
            <Tabs defaultValue='web' className='w-full'>
                <TabsList className='grid w-full grid-cols-2 bg-gray-100'>
                    <TabsTrigger
                        value='web'
                        className='font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white'>
                        Web Mapping
                    </TabsTrigger>
                    <TabsTrigger
                        value='mobile'
                        className='font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white'>
                        Mobile Mapping
                    </TabsTrigger>
                </TabsList>

                {/* Web Mapping Tab */}
                <TabsContent value='web' className='space-y-6 pt-4'>
                    {/* Master Page List */}
                    <div className='overflow-hidden border bg-white shadow-sm'>
                        <div className='flex items-center justify-between bg-purple-600 px-4 py-2 text-white'>
                            <h3 className='font-bold text-sm'>Master Page List</h3>
                            <div className="flex justify-end mr-2">
                                <div className="relative w-64">
                                    <Search className="absolute top-1.5 left-2 h-4 w-4 text-white " />
                                    <Input
                                        placeholder="search here..."
                                        className="h-7 border-purple-300 pl-8 text-xs placeholder:text-white focus-visible:ring-1 focus-visible:ring-white"
                                        value={searchWeb}
                                        onChange={(e) => setSearchWeb(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="pt-2 ">

                            {isWebPageLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-8 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <PageMappingPaginationTable
                                    data={filteredWebPages}
                                    columns={webColumns}
                                    searchKeys={[]}
                                    idKey="pageMappingId"
                                    selectedIds={new Set(webPages.filter((p) => p.checked).map((p) => p.pageMappingId))}
                                    onSelect={handleWebSelect}
                                    onSelectAll={handleWebSelectAll}
                                    itemsPerPage={currentWebPageParams.page_size || 10}
                                    selectionPosition="end"
                                    selectionHeaderLabel="Select"
                                    variant="web-grid"
                                    headerBgColor="bg-purple-600"
                                />
                            )}
                        </div>
                    </div>

                    {/* Add New Pages Grid (staged) */}
                    {stagedWebPages.length > 0 && (
                        <div className='mt-6 overflow-hidden border border-purple-100 bg-white shadow-sm'>
                            <div className='flex items-center justify-between bg-purple-600 px-4 py-2 text-white'>
                                <h3 className='font-bold text-sm'>Add New Pages</h3>
                                <div className='relative w-48'>
                                    <Search className='absolute top-1.5 left-2 h-4 w-4 text-white ' />
                                    <Input
                                        placeholder='Search staged...'
                                        className='h-7 border-white pl-8 text-white text-xs placeholder:text-white focus-visible:ring-1 focus-visible:ring-white'
                                        value={searchStaged}
                                        onChange={(e) => {
                                            setSearchStaged(e.target.value);
                                            setStagedPage(1);
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="pt-2 ">
                                <PageMappingPaginationTable
                                    data={filteredStaged}
                                    columns={stagedColumns}
                                    searchKeys={[]}
                                    idKey="pageMappingId"
                                    itemsPerPage={stagedPageSize}
                                    variant="web-grid"
                                    headerBgColor="bg-purple-600"
                                />
                            </div>
                        </div>
                    )}

                    {/* Saved List */}
                    <div className='overflow-hidden border border-green-100 bg-white shadow-sm'>
                        <div className='flex items-center justify-between bg-purple-600 px-4 py-2 text-white'>
                            <h3 className='font-bold text-sm'>Saved List (Existing Privileges)</h3>
                            <div className='relative w-48'>
                                <Search className='absolute top-1.5 left-2 h-4 w-4 text-white ' />
                                <Input
                                    placeholder='Search..'
                                    className='h-7  pl-8 text-xs placeholder:text-white focus-visible:ring-1 focus-visible:ring-white'
                                    value={searchSavedWeb}
                                    onChange={(e) => setSearchSavedWeb(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="pt-2 ">
                            {isSavedGridLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-8 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <PageMappingPaginationTable
                                    data={filteredSavedGrid}
                                    columns={savedColumns}
                                    searchKeys={[]}
                                    idKey="ivrmstauP_Id"
                                    selectedIds={new Set(savedGrid.filter((p) => p.checked).map((p) => p.ivrmstauP_Id))}
                                    onSelect={handleSavedSelect}
                                    onSelectAll={handleSavedSelectAll}
                                    itemsPerPage={currentSavedGridParams.page_size || 10}
                                    selectionPosition="end"
                                    selectionHeader={<div className="text-center font-bold text-[10px] uppercase text-white">Rem</div>}
                                    variant="web-grid"
                                    headerBgColor="bg-purple-600"
                                />
                            )}
                        </div>
                    </div>
                </TabsContent>

                {/* Mobile Mapping Tab */}
                <TabsContent value='mobile' className='space-y-6 pt-4'>
                    {/* Mobile Master List */}
                    <div className='overflow-hidden border border-purple-100 bg-white shadow-sm'>
                        <div className='flex items-center justify-between bg-purple-600 px-4 py-2 text-white'>
                            <h3 className='font-bold text-sm'>Mobile App Master Page List</h3>
                            <div className='relative w-48'>
                                <Search className='absolute top-1.5 left-2 h-3 w-3 text-white/70' />
                                <Input
                                    placeholder='Search..'
                                    className='h-7 border-none bg-white/10 pl-8 text-white text-xs placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/30'
                                    value={searchMobile}
                                    onChange={(e) => setSearchMobile(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="pt-2 ">
                            {isMobilePageLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-8 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <PageMappingPaginationTable
                                    data={filteredMobilePages}
                                    columns={mobileColumns}
                                    searchKeys={[]}
                                    idKey="ivrmmaP_Id"
                                    selectedIds={new Set(mobilePages.filter((p) => p.checked).map((p) => p.ivrmmaP_Id))}
                                    onSelect={handleMobileSelect}
                                    onSelectAll={handleMobileSelectAll}
                                    itemsPerPage={currentMobilePageParams.page_size || 10}
                                    selectionPosition="end"
                                    selectionHeaderLabel="Select"
                                    variant="web-grid"
                                    headerBgColor="bg-purple-600"
                                />
                            )}
                        </div>
                    </div>

                    {/* Saved Mobile List */}
                    <div className='overflow-hidden  border border-orange-100 bg-white shadow-sm'>
                        <div className='flex items-center justify-between bg-purple-600 px-4 py-2 text-white'>
                            <h3 className='font-bold text-sm'>Saved Mobile App Page List</h3>
                            <div className='relative w-48'>
                                <Search className='absolute top-1.5 left-2 h-3 w-3 text-white/70' />
                                <Input
                                    placeholder='Search..'
                                    className='h-7 border-none bg-white/10 pl-8 text-white text-xs placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/30'
                                    value={searchSavedMobile}
                                    onChange={(e) => setSearchSavedMobile(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="pt-2 ">
                            {isSavedMobilePageLoading ? (
                                <div className="space-y-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-8 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <PageMappingPaginationTable
                                    data={filteredSavedMobilePages}
                                    columns={savedMobileColumns}
                                    searchKeys={[]}
                                    idKey="ivrmumalP_Id"
                                    selectedIds={new Set(savedMobilePages.filter((p) => p.checked).map((p) => p.ivrmumalP_Id))}
                                    onSelect={handleSavedMobileSelect}
                                    onSelectAll={handleSavedMobileSelectAll}
                                    itemsPerPage={currentSavedMobilePageParams.page_size || 10}
                                    selectionPosition="end"
                                    selectionHeader={<div className="text-center font-bold text-[10px] uppercase text-white">Rem</div>}
                                    variant="web-grid"
                                    headerBgColor="bg-purple-600"
                                />
                            )}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
