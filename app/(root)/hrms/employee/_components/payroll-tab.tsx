'use client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HRMS_MI_ID } from '@/constants/hrms-config';
import { HRMS_QUERY_KEYS } from '@/constants/query-keys';
import {
    useEmployeeById,
    useEmployeeEarningsDeductions,
    useEmployeeRegisterOnload,
    useGetEmployeeSalaryDetailsByHead,
    useSaveEmployeeSalaryDetails,
    useUpdateEmployeeSalaryDetailsByHead
} from '@/hooks/hrms/useEmployeeRegister';
import { useMasterEarningsDeductions } from '@/hooks/hrms/useMasters';
import type { EmployeeSalaryDetailItem } from '@/types/hrms/employee-register';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

interface PayrollTabProps {
    employeeId: number | null;
    employeeCode: string;
    MI_Id?: number;
    onSuccess?: () => void;
    onSaveReady?: (save: (() => Promise<boolean>) | null) => void;
    hideSaveButton?: boolean;
    earningList?: any[];
    detectionList?: any[];
    arrearList?: any[];
    grossList?: any[];
}

type EditablePayrollItem = EmployeeSalaryDetailItem & {
    localAmount?: number;
    localPercentage?: string; // Actual %
    localApplicablePercentage?: string; // % Applicable
    localMaxAmount?: number;
    hrmeD_Percent?: string;
    hrmeD_Details?: string;
    AmountDis?: boolean;
    PercentDis?: boolean;
};

const DEFAULT_EMPTY_ARRAY: any[] = [];

// Helper functions to safely extract head ID and head Name across all possible API response formats
const getHeadId = (item: any): number => {
    if (!item) return 0;
    const id =
        item.HRMED_Id ??
        item.hrmeD_Id ??
        item.hrmed_id ??
        item.key ??
        item.Key ??
        item.id ??
        item.Id ??
        item.valueId ??
        item.ValueId ??
        0;
    return Number(id) || 0;
};

const getHeadName = (item: any): string => {
    if (!item) return '';
    const name =
        item.HRMED_Name ??
        item.hrmeD_Name ??
        item.hrmed_name ??
        item.value ??
        item.Value ??
        item.name ??
        item.Name ??
        item.label ??
        item.Label ??
        '';
    return String(name || '').trim();
};

export function PayrollTab({
    employeeId,
    employeeCode,
    MI_Id: propMI_Id,
    onSuccess,
    onSaveReady,
    hideSaveButton = false,
    earningList: propEarningList,
    detectionList: propDetectionList,
    arrearList: propArrearList,
    grossList: propGrossList
}: PayrollTabProps) {
    const isMountedRef = useRef(true);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const effectiveEmployeeId = employeeId !== null && employeeId !== undefined ? Number(employeeId) : 0;
    const { data: response, isLoading: isLoadingEmployee, refetch } = useEmployeeById(effectiveEmployeeId > 0 ? effectiveEmployeeId : null);
    const { data: salaryDetailsData, isLoading: isLoadingED } = useEmployeeEarningsDeductions(effectiveEmployeeId);
    const employeemiId = response?.data?.employee?.[0]?.mI_Id;

    const queryClient = useQueryClient();
    const MI_Id = propMI_Id || employeemiId || HRMS_MI_ID || 30;

    // Robustly extract salaryDetails array from any API response structure
    const extractList = (raw: any): any[] => {
        if (!raw) return DEFAULT_EMPTY_ARRAY;
        if (Array.isArray(raw)) return raw;
        if (Array.isArray(raw?.data)) return raw.data;
        if (Array.isArray(raw?.data?.data)) return raw.data.data;
        if (Array.isArray(raw?.result)) return raw.result;
        if (Array.isArray(raw?.data?.result)) return raw.data.result;
        return DEFAULT_EMPTY_ARRAY;
    };

    // Fetch master earnings & deductions directly from MasterEarningsDeductions catalog as source of truth
    const { data: masterEarningsResponse, isLoading: isLoadingMasterED } = useMasterEarningsDeductions({ page: 1, page_size: 100 });
    const masterListFromApi = useMemo(() => extractList(masterEarningsResponse), [masterEarningsResponse]);

    // Fetch master onload data as fallback/supplement so new employees get complete master heads and formulas
    const { data: onloadResponse, isLoading: isLoadingOnload } = useEmployeeRegisterOnload(MI_Id, effectiveEmployeeId);
    const rawOnloadData = (onloadResponse as any)?.data?.data || (onloadResponse as any)?.data || onloadResponse;
    const getList = (propList?: any[], ...possibleKeys: string[]) => {
        if (propList && propList.length > 0) return propList;
        if (!possibleKeys || possibleKeys.length === 0) return DEFAULT_EMPTY_ARRAY;
        for (const key of possibleKeys) {
            const list =
                rawOnloadData?.[key] ||
                (onloadResponse as any)?.[key] ||
                (onloadResponse as any)?.data?.[key] ||
                (onloadResponse as any)?.data?.data?.[key];
            if (Array.isArray(list) && list.length > 0) return list;
        }
        return DEFAULT_EMPTY_ARRAY;
    };

    // Build a comprehensive master catalog map of all known salary heads from all available sources
    const masterHeadsMap = useMemo(() => {
        const map = new Map<number, any>();
        const registerSources = (items: any, defaultFlag?: string) => {
            if (!items) return;
            const arr = Array.isArray(items) ? items : Array.isArray(items?.data) ? items.data : [];
            arr.forEach((item: any) => {
                const id = getHeadId(item);
                if (id > 0) {
                    const existing = map.get(id);
                    const name = getHeadName(item);
                    const flag = item.HRMED_EarnDedFlag || item.hrmeD_EarnDedFlag || existing?.HRMED_EarnDedFlag || defaultFlag;
                    const percentOff = item.percentOff || item.percentoff || item.HRMED_PercentOff || item.hrmeD_PercentOff || existing?.percentOff || '';
                    const percOfDTO = item.perc_OfDTO || item.perc_ofdto || existing?.perc_OfDTO || [];
                    const selList = item.selectedearningdetectionList || item.selectedearningdetectionlist || existing?.selectedearningdetectionList || [];

                    if (!existing) {
                        map.set(id, {
                            ...item,
                            ...(flag ? { HRMED_EarnDedFlag: flag } : {}),
                            percentOff,
                            perc_OfDTO: percOfDTO,
                            selectedearningdetectionList: selList
                        });
                    } else {
                        map.set(id, {
                            ...existing,
                            ...item,
                            HRMED_Name: getHeadName(existing) || name,
                            value: getHeadName(existing) || name,
                            ...(flag ? { HRMED_EarnDedFlag: flag } : {}),
                            percentOff: percentOff || existing.percentOff,
                            perc_OfDTO: percOfDTO.length > 0 ? percOfDTO : existing.perc_OfDTO,
                            selectedearningdetectionList: selList.length > 0 ? selList : existing.selectedearningdetectionList
                        });
                    }
                }
            });
        };

        registerSources(masterListFromApi);
        registerSources(rawOnloadData?.earningList, 'Earning');
        registerSources(rawOnloadData?.detectionList, 'Deduction');
        registerSources(rawOnloadData?.deductionList, 'Deduction');
        registerSources(rawOnloadData?.grossList, 'Gross');
        registerSources(rawOnloadData?.data?.earningList, 'Earning');
        registerSources(rawOnloadData?.data?.detectionList, 'Deduction');
        registerSources(rawOnloadData?.data?.deductionList, 'Deduction');
        registerSources(rawOnloadData?.data?.grossList, 'Gross');
        registerSources(rawOnloadData?.arrearList, 'Arrear');
        registerSources(rawOnloadData?.data?.arrearList, 'Arrear');
        registerSources(propEarningList, 'Earning');
        registerSources(propDetectionList, 'Deduction');
        registerSources(propGrossList, 'Gross');
        registerSources(propArrearList, 'Arrear');

        return map;
    }, [masterListFromApi, rawOnloadData, propEarningList, propDetectionList, propArrearList, propGrossList]);

    const isMatchFlag = (item: any, target: 'Earning' | 'Deduction' | 'Arrear' | 'Gross'): boolean => {
        const raw =
            item?.HRMED_EarnDedFlag ??
            item?.hrmeD_EarnDedFlag ??
            item?.hrmed_earndedflag ??
            item?.hrmed_EarnDedFlag ??
            item?.EarnDedFlag ??
            item?.earnDedFlag ??
            item?.flag ??
            '';
        const s = String(raw).trim().toLowerCase();
        const isE = s === 'earning' || s === 'e' || s === 'earnings';
        const isD = s === 'deduction' || s === 'd' || s === 'deductions';
        const isA = s === 'arrear' || s === 'arear' || s === 'a' || s === 'arrears' || s === 'arears';
        const isG = s === 'gross' || s === 'g';

        if (isE) return target === 'Earning';
        if (isD) return target === 'Deduction';
        if (isG) return target === 'Gross';
        if (isA) return target === 'Arrear';

        const name = getHeadName(item).toLowerCase();
        if (name === 'gross' || name === 'gross salary') return target === 'Gross';

        // Well-known deduction heads safeguard: PF, PRT, PT, Salary Advance, ESI, TDS, Loan, Tax
        const isKnownDeduction =
            name === 'pf' ||
            name.includes('provident') ||
            name === 'prt' ||
            name === 'pt' ||
            name.includes('prof tax') ||
            name.includes('professional tax') ||
            name.includes('salary advance') ||
            name === 'esi' ||
            name.includes('state insurance') ||
            name === 'tds' ||
            name.includes('tax') ||
            name.includes('loan');

        if (isKnownDeduction) {
            return target === 'Deduction';
        }

        // Fallback: lookup head flag from master catalog map
        const id = getHeadId(item);
        if (id > 0) {
            const master = masterHeadsMap.get(id);
            if (master && master !== item) {
                const masterRaw =
                    master?.HRMED_EarnDedFlag ??
                    master?.hrmeD_EarnDedFlag ??
                    master?.hrmed_earndedflag ??
                    master?.hrmed_EarnDedFlag ??
                    master?.EarnDedFlag ??
                    master?.earnDedFlag ??
                    master?.flag ??
                    '';
                const ms = String(masterRaw).trim().toLowerCase();
                const mIsE = ms === 'earning' || ms === 'e' || ms === 'earnings';
                const mIsD = ms === 'deduction' || ms === 'd' || ms === 'deductions';
                const mIsG = ms === 'gross' || ms === 'g';
                const mIsA = ms === 'arrear' || ms === 'arear' || ms === 'a' || ms === 'arrears' || ms === 'arears';

                if (mIsE) return target === 'Earning';
                if (mIsD) return target === 'Deduction';
                if (mIsG) return target === 'Gross';
                if (mIsA) return target === 'Arrear';

                const mname = getHeadName(master).toLowerCase();
                if (mname === 'gross' || mname === 'gross salary') return target === 'Gross';
            }

            // Fallback to Props Lists (Strict Order: Gross, Earning, Deduction, then Arrear)
            if (propGrossList?.some((p: any) => getHeadId(p) === id)) return target === 'Gross';
            if (propEarningList?.some((p: any) => getHeadId(p) === id)) return target === 'Earning';
            if (propDetectionList?.some((p: any) => getHeadId(p) === id)) return target === 'Deduction';
            if (propArrearList?.some((p: any) => getHeadId(p) === id)) return target === 'Arrear';
        }

        return false;
    };

    const masterEarningList = useMemo(() => {
        const fromProps = getList(propEarningList, 'earningList', 'earninglist', 'EarningDTO', 'earningDTO');
        if (fromProps && fromProps.length > 0) return fromProps;
        return (masterListFromApi || []).filter((item: any) => isMatchFlag(item, 'Earning'));
    }, [propEarningList, rawOnloadData, masterListFromApi, masterHeadsMap]);

    const masterDetectionList = useMemo(() => {
        const fromProps = getList(
            propDetectionList,
            'detectionList',
            'deductionList',
            'detectionlist',
            'deductionlist',
            'DeductionDTO',
            'deductionDTO'
        );
        if (fromProps && fromProps.length > 0) return fromProps;
        return (masterListFromApi || []).filter((item: any) => isMatchFlag(item, 'Deduction'));
    }, [propDetectionList, rawOnloadData, masterListFromApi, masterHeadsMap]);

    const masterArrearList = useMemo(() => {
        const fromProps = getList(propArrearList, 'arrearList', 'arrearlist', 'ArrearDTO', 'arrearDTO');
        const rawList =
            fromProps && fromProps.length > 0
                ? fromProps
                : (masterListFromApi || []).filter((item: any) => isMatchFlag(item, 'Arrear'));

        // Never let deduction or earning heads leak into arrears
        return (rawList || []).filter((item: any) => {
            const id = getHeadId(item);
            if (masterDetectionList?.some((d: any) => getHeadId(d) === id)) return false;
            if (masterEarningList?.some((e: any) => getHeadId(e) === id)) return false;
            if (isMatchFlag(item, 'Deduction') || isMatchFlag(item, 'Earning') || isMatchFlag(item, 'Gross')) return false;
            return true;
        });
    }, [propArrearList, rawOnloadData, masterListFromApi, masterHeadsMap, masterDetectionList, masterEarningList]);

    const masterGrossList = useMemo(() => {
        const fromProps = getList(propGrossList, 'grossList', 'grosslist', 'GrossDTO', 'grossDTO');
        if (fromProps && fromProps.length > 0) return fromProps;
        return (masterListFromApi || []).filter((item: any) => isMatchFlag(item, 'Gross'));
    }, [propGrossList, rawOnloadData, masterListFromApi, masterHeadsMap]);

    const salaryDetails = useMemo(() => {
        const listFromED = extractList(salaryDetailsData);
        const fromResponse = (response as any)?.data?.EarningsDeductions || 
                             (response as any)?.data?.earningsDeductions ||
                             (response as any)?.data?.employeeEarningsDeductions;
        const listFromResp = extractList(fromResponse);

        if (listFromED.length === 0 && listFromResp.length === 0) return DEFAULT_EMPTY_ARRAY;
        if (listFromED.length === 0) return listFromResp;
        if (listFromResp.length === 0) return listFromED;

        const merged = [...listFromED];
        listFromResp.forEach((respItem: any) => {
            const respHrmedId = getHeadId(respItem);
            const existingIdx = merged.findIndex((m: any) => getHeadId(m) === respHrmedId);
            if (existingIdx >= 0) {
                const edAmount = Number(merged[existingIdx].HREED_Amount ?? merged[existingIdx].hreeD_Amount ?? 0);
                const respAmount = Number(respItem.HREED_Amount ?? respItem.hreeD_Amount ?? 0);
                if (edAmount === 0 && respAmount > 0) {
                    merged[existingIdx] = { ...merged[existingIdx], ...respItem };
                }
            } else {
                merged.push(respItem);
            }
        });
        return merged;
    }, [salaryDetailsData, response]);
    console.log('🔍 [PayrollTab] Loaded salaryDetails from API:', salaryDetails);

    // Resolve the Gross Head HRMED_Id reliably across all possible sources
    const resolvedGrossHrmedId = useMemo(() => {
        const existingGross = (salaryDetails || []).find((sd: any) => isMatchFlag(sd, 'Gross'));
        const masterGross = (masterGrossList && masterGrossList.length > 0) ? masterGrossList[0] : null;
        const fromOnload = rawOnloadData?.grossList?.[0] || (rawOnloadData as any)?.data?.grossList?.[0];
        const fromPropGross = propGrossList?.[0];
        const fromMasterApi = (masterListFromApi || []).find((m: any) => isMatchFlag(m, 'Gross'));

        const id =
            getHeadId(existingGross) ||
            getHeadId(masterGross) ||
            getHeadId(fromOnload) ||
            getHeadId(fromPropGross) ||
            getHeadId(fromMasterApi) ||
            0;
        return Number(id) || 0;
    }, [salaryDetails, masterGrossList, rawOnloadData, propGrossList, masterListFromApi]);

    const isLoading =
        (Boolean(employeeId) && (isLoadingEmployee || isLoadingED)) ||
        (masterEarningList.length === 0 && (isLoadingOnload || isLoadingMasterED));

    const updateSalaryByHeadMutation = useUpdateEmployeeSalaryDetailsByHead({ suppressSuccessToast: true });
    // Local state for editable items
    const [earnings, setEarnings] = useState<EditablePayrollItem[]>([]);
    const [deductions, setDeductions] = useState<EditablePayrollItem[]>([]);
    const [arrears, setArrears] = useState<EditablePayrollItem[]>([]);
    const [grossDetails, setGrossDetails] = useState<EditablePayrollItem | null>(null);

    const earningsRef = useRef(earnings);
    earningsRef.current = earnings;
    const deductionsRef = useRef(deductions);
    deductionsRef.current = deductions;
    const arrearsRef = useRef(arrears);
    arrearsRef.current = arrears;
    const grossRef = useRef(grossDetails);
    grossRef.current = grossDetails;

    const dirtyRowsRef = useRef<{
        earnings: Set<number>;
        deductions: Set<number>;
        arrears: Set<number>;
        gross: boolean;
    }>({
        earnings: new Set(),
        deductions: new Set(),
        arrears: new Set(),
        gross: false
    });

    const _getEmployeeSalaryDetailsByHeadMutation = useGetEmployeeSalaryDetailsByHead();

    // Helper to extract effective percentage for an item
    const getHeadPercentage = (item: EditablePayrollItem): number => {
        // If localApplicablePercentage was modified and > 0
        const localApp = Number.parseFloat(String(item.localApplicablePercentage ?? ''));
        if (!Number.isNaN(localApp) && localApp > 0) return localApp;

        // If localPercentage was modified and > 0
        const localPerc = Number.parseFloat(String(item.localPercentage ?? ''));
        if (!Number.isNaN(localPerc) && localPerc > 0) return localPerc;

        // Employee saved percentages
        const hreedApp = Number.parseFloat(String(item.HREED_ApplicablePercentage ?? (item as any).hreeD_ApplicablePercentage ?? ''));
        if (!Number.isNaN(hreedApp) && hreedApp > 0) return hreedApp;

        const hreedPerc = Number.parseFloat(String(item.HREED_Percentage ?? (item as any).hreeD_Percentage ?? ''));
        if (!Number.isNaN(hreedPerc) && hreedPerc > 0) return hreedPerc;

        // Master percentage from HRMED master head
        const masterPerc = Number.parseFloat(
            String(
                item.hrmeD_Percent ??
                    (item as any).HRMED_AmountPercent ??
                    (item as any).hrmeD_AmountPercent ??
                    (item as any).hrmed_amountpercent ??
                    (item as any).HRMED_Percentage ??
                    (item as any).hrmeD_Percentage ??
                    (item as any).AmountPercent ??
                    (item as any).amountPercent ??
                    ''
            )
        );
        if (!Number.isNaN(masterPerc) && masterPerc > 0) return masterPerc;

        return 0;
    };

    // Helper to check if item is percentage based
    const isPercentageHead = (item: EditablePayrollItem, perc: number): boolean => {
        const rawFlag =
            item.HRMED_AmountPercentFlag ??
            (item as any).hrmeD_AmountPercentFlag ??
            (item as any).hrmed_amountpercentflag ??
            (item as any).AmountPercentFlag;
        const flagStr = String(rawFlag || '')
            .trim()
            .toLowerCase();
        if (flagStr === 'amount') return false;
        return flagStr === 'percentage' || perc > 0;
    };

    // Recalculate all percentage-based items with cascading dependency (Gross -> Basic Pay -> DA/HRA -> PF/Deductions)
    const calculateHeadsFromGross = (
        grossAmount: number,
        currentEarnings = earningsRef.current,
        currentDeductions = deductionsRef.current,
        currentArrears = arrearsRef.current,
        onlyIfZero = false,
        skipRecalcHeadId?: number
    ) => {
        let newEarnings = currentEarnings.map((item) => ({ ...item }));
        let newDeductions = currentDeductions.map((item) => ({ ...item }));
        let newArrears = currentArrears.map((item) => ({ ...item }));

        // Quick lookup by HRMED_Id or Name across all arrays
        const getHeadAmount = (hrmedId: number, name?: string): number => {
            const all = [...newEarnings, ...newDeductions, ...newArrears];
            if (hrmedId > 0) {
                const found = all.find((h) => getHeadId(h) === hrmedId);
                if (found && found.HREED_ActiveFlag) {
                    return Number(found.localAmount ?? found.HREED_Amount ?? 0);
                }
            }
            if (name) {
                const clean = name.trim().toLowerCase();
                const found = all.find((h) => getHeadName(h).trim().toLowerCase() === clean);
                if (found && found.HREED_ActiveFlag) {
                    return Number(found.localAmount ?? found.HREED_Amount ?? 0);
                }
            }
            return 0;
        };

        const getParentHeads = (item: EditablePayrollItem): { ids: number[]; names: string[]; isGross: boolean } => {
            const ids: number[] = [];
            const names: string[] = [];
            const hrmedId = getHeadId(item);
            const masterHead = masterHeadsMap.get(hrmedId);

            // 1. Check perc_OfDTO or selectedearningdetectionList
            const rawList =
                (item as any).selectedearningdetectionList ||
                (item as any).perc_OfDTO ||
                (item as any).perc_ofdto ||
                (item as any).selectedearningdetectionlist ||
                masterHead?.selectedearningdetectionList ||
                masterHead?.perc_OfDTO ||
                masterHead?.perc_ofdto ||
                masterHead?.selectedearningdetectionlist;

            if (Array.isArray(rawList) && rawList.length > 0) {
                rawList.forEach((s: any) => {
                    const pId =
                        typeof s === 'number'
                            ? s
                            : Number(
                                  s.hrmedP_HRMED_Id ??
                                  s.HRMEDP_HRMED_Id ??
                                  s.hrmedp_hrmed_id ??
                                  s.HRMEDP_Id ??
                                  s.hrmedP_Id ??
                                  s.hrmedp_id ??
                                  s.hrmeD_Id ??
                                  s.HRMED_Id ??
                                  s.hrmed_id ??
                                  0
                              );
                    if (pId > 0 && !ids.includes(pId)) {
                        ids.push(pId);
                    }
                });
            }

            // 2. Check percentOff string (e.g. "BASIC PAY" or "Gross" or "BASIC PAY, DA")
            const percentOffStr = String(
                (item as any).percentOff ||
                (item as any).percentoff ||
                (item as any).HRMED_PercentOff ||
                (item as any).hrmeD_PercentOff ||
                masterHead?.percentOff ||
                masterHead?.percentoff ||
                masterHead?.HRMED_PercentOff ||
                masterHead?.hrmeD_PercentOff ||
                ''
            ).trim();

            const lowerPercentOff = percentOffStr.toLowerCase();
            const isGross =
                ids.length === 0 &&
                (!percentOffStr || lowerPercentOff === 'gross' || lowerPercentOff === 'gross salary');

            if (!isGross && percentOffStr && ids.length === 0) {
                const parts = percentOffStr.split(/[,+]/).map((p) => p.trim()).filter(Boolean);
                const allItems = [...newEarnings, ...newDeductions, ...newArrears];
                parts.forEach((part) => {
                    const partLower = part.toLowerCase();
                    const matched = allItems.find((h) => {
                        const hName = getHeadName(h).trim().toLowerCase();
                        if (hName === partLower) return true;
                        if (new RegExp(`\\b${partLower}\\b`, 'i').test(hName)) return true;
                        return partLower.length >= 4 && (hName.includes(partLower) || partLower.includes(hName));
                    });
                    if (matched) {
                        const mId = getHeadId(matched);
                        if (mId > 0 && !ids.includes(mId)) {
                            ids.push(mId);
                        }
                    } else {
                        names.push(part);
                    }
                });
            }

            return { ids, names, isGross };
        };

        const updateItem = (item: EditablePayrollItem): EditablePayrollItem => {
            // If item is unchecked/inactive, preserve inactive state and set amount to 0
            if (item.HREED_ActiveFlag === false) {
                return {
                    ...item,
                    localAmount: 0,
                    HREED_Amount: 0,
                    HREED_ActiveFlag: false
                };
            }

            const perc = getHeadPercentage(item);
            if (!isPercentageHead(item, perc) || perc <= 0) {
                return item;
            }

            // If this item was explicitly manually edited, keep its manual amount
            if (skipRecalcHeadId && getHeadId(item) === skipRecalcHeadId) {
                return item;
            }

            // If only calculating uncalculated heads (e.g. initial load) and already has a saved amount, preserve it
            if (onlyIfZero && item.localAmount && item.localAmount > 0) {
                return item;
            }

            const { ids, names, isGross } = getParentHeads(item);

            let baseAmount = 0;
            if (isGross) {
                baseAmount = grossAmount;
            } else {
                if (ids.length > 0) {
                    ids.forEach((pId) => {
                        baseAmount += getHeadAmount(pId);
                    });
                }
                if (names.length > 0) {
                    names.forEach((pName) => {
                        baseAmount += getHeadAmount(0, pName);
                    });
                }
                // Fallback: If parent head amounts sum to 0 and no specific parent was mapped, use grossAmount
                if (baseAmount === 0 && ids.length === 0 && names.length === 0) {
                    baseAmount = grossAmount;
                }
            }

            const calculatedAmount = Number(((baseAmount * perc) / 100).toFixed(2));
            const percStr = String(perc);

            return {
                ...item,
                HRMED_AmountPercentFlag: 'Percentage',
                localPercentage: percStr,
                localApplicablePercentage: percStr,
                HREED_Percentage: percStr,
                HREED_ApplicablePercentage: percStr,
                localAmount: calculatedAmount,
                HREED_Amount: calculatedAmount,
                HREED_ActiveFlag: true
            };
        };

        // Multi-pass execution (3 passes):
        // Pass 1: Gross-dependent heads (like Basic Pay) calculate from Gross
        // Pass 2: Heads dependent on Basic Pay (like DA, HRA) calculate from Basic Pay
        // Pass 3: Deductions or heads dependent on Basic Pay + DA (like PF) calculate
        for (let pass = 0; pass < 3; pass++) {
            newEarnings = newEarnings.map(updateItem);
            newDeductions = newDeductions.map(updateItem);
            newArrears = newArrears.map(updateItem);
        }

        return { newEarnings, newDeductions, newArrears };
    };

    // Initialize local state when data loads
    useEffect(() => {
        const initializeList = (flag: 'Earning' | 'Deduction' | 'Arrear') => {
            const masterList =
                flag === 'Earning'
                    ? masterEarningList
                    : flag === 'Deduction'
                      ? masterDetectionList
                      : masterArrearList;

            // Base source: use master list if available; otherwise filter salaryDetails
            const baseList =
                masterList && masterList.length > 0
                    ? masterList
                    : (salaryDetails || []).filter((sd: any) => isMatchFlag(sd, flag));

            // Also include any items from salaryDetails that may not be in masterList
            const existingFromSalaryDetails = (salaryDetails || []).filter((sd: any) => isMatchFlag(sd, flag));
            const mergedList = [...baseList];
            existingFromSalaryDetails.forEach((sd: any) => {
                const sdId = getHeadId(sd);
                if (sdId > 0 && !mergedList.some((m: any) => getHeadId(m) === sdId)) {
                    mergedList.push(sd);
                }
            });

            return (mergedList || []).map((item: any) => {
                const hrmedId = getHeadId(item);

                // Match with employee saved details if present
                const existingItem = (salaryDetails || []).find((sd: any) => {
                    const sdHrmedId = getHeadId(sd);
                    return sdHrmedId > 0 && sdHrmedId === hrmedId;
                });

                // Prefer the current master API record over cached onload data.
                const currentMasterHead = masterListFromApi.find((head: any) => getHeadId(head) === hrmedId);
                const masterHead = currentMasterHead || masterHeadsMap.get(hrmedId) || item;

                const headName =
                    getHeadName(item) ||
                    getHeadName(existingItem) ||
                    getHeadName(masterHead) ||
                    '';

                const rawFlag =
                    currentMasterHead?.HRMED_AmountPercentFlag ??
                    currentMasterHead?.hrmeD_AmountPercentFlag ??
                    existingItem?.HRMED_AmountPercentFlag ??
                    existingItem?.hrmeD_AmountPercentFlag ??
                    item.HRMED_AmountPercentFlag ??
                    item.hrmeD_AmountPercentFlag ??
                    item.hrmed_amountpercentflag ??
                    item.AmountPercentFlag ??
                    existingItem?.AmountPercentFlag ??
                    masterHead?.HRMED_AmountPercentFlag ??
                    masterHead?.hrmeD_AmountPercentFlag;
                const isPercentage = String(rawFlag || '').trim().toLowerCase() === 'percentage';
                const amountPercentFlag = isPercentage ? 'Percentage' : 'Amount';

                // Master percentage value
                const masterPercVal =
                    currentMasterHead?.hrmeD_AmountPercent ??
                    currentMasterHead?.HRMED_AmountPercent ??
                    existingItem?.hrmeD_Percent ??
                    existingItem?.HRMED_AmountPercent ??
                    existingItem?.hrmeD_AmountPercent ??
                    item.hrmeD_Percent ??
                    item.hrmeD_AmountPercent ??
                    item.HRMED_AmountPercent ??
                    item.hrmed_amountpercent ??
                    item.HRMED_Percentage ??
                    item.hrmeD_Percentage ??
                    masterHead?.hrmeD_Percent ??
                    masterHead?.HRMED_AmountPercent ??
                    masterHead?.hrmeD_AmountPercent ??
                    '0';
                const masterPercStr = String(masterPercVal !== null && masterPercVal !== undefined && masterPercVal !== '' ? masterPercVal : '0');

                // Master Details formula (e.g. "50% of BASIC PAY")
                const percentOff =
                    existingItem?.percentOff ||
                    item.percentOff ||
                    item.percentoff ||
                    item.HRMED_PercentOff ||
                    item.hrmeD_PercentOff ||
                    masterHead?.percentOff ||
                    masterHead?.percentoff ||
                    masterHead?.HRMED_PercentOff ||
                    masterHead?.hrmeD_PercentOff ||
                    '';
                const detailsText =
                    isPercentage
                        ? existingItem?.hrmeD_Details ||
                          item.hrmeD_Details ||
                          item.HRMED_Details ||
                          masterHead?.hrmeD_Details ||
                          masterHead?.HRMED_Details ||
                          (percentOff ? `${masterPercStr}% of ${percentOff}` : Number(masterPercStr) > 0 ? `${masterPercStr}%` : '')
                        : '';

                const savedId = existingItem?.HREED_Id ?? existingItem?.hreeD_Id ?? item?.HREED_Id ?? item?.hreeD_Id ?? 0;
                const hasSavedRecord = Number(savedId) > 0;

                let percentage = '0';
                let appPercentage = '0';
                let amount = 0;
                let active = true;

                if (hasSavedRecord) {
                    const rawSavedPerc = existingItem?.HREED_Percentage ?? existingItem?.hreeD_Percentage ?? item?.HREED_Percentage ?? item?.hreeD_Percentage;
                    const rawSavedAppPerc = existingItem?.HREED_ApplicablePercentage ?? existingItem?.hreeD_ApplicablePercentage ?? item?.HREED_ApplicablePercentage ?? item?.hreeD_ApplicablePercentage;
                    if (isPercentage) {
                        percentage =
                            rawSavedPerc !== undefined &&
                            rawSavedPerc !== null &&
                            String(rawSavedPerc) !== '' &&
                            String(rawSavedPerc) !== '0' &&
                            String(rawSavedPerc) !== '0.00'
                                ? String(rawSavedPerc)
                                : masterPercStr;
                        appPercentage =
                            rawSavedAppPerc !== undefined &&
                            rawSavedAppPerc !== null &&
                            String(rawSavedAppPerc) !== '' &&
                            String(rawSavedAppPerc) !== '0' &&
                            String(rawSavedAppPerc) !== '0.00'
                                ? String(rawSavedAppPerc)
                                : percentage;
                    } else {
                        percentage = '0';
                        appPercentage = '0';
                    }

                    const savedAmount = Number(existingItem?.HREED_Amount ?? existingItem?.hreeD_Amount ?? item?.HREED_Amount ?? item?.hreeD_Amount ?? 0);
                    amount = !isPercentage && Number(rawSavedPerc) > 0 ? Number(masterPercVal) || 0 : savedAmount;
                    active = Boolean(existingItem?.HREED_ActiveFlag ?? existingItem?.hreeD_ActiveFlag ?? item?.HREED_ActiveFlag ?? item?.hreeD_ActiveFlag ?? true);
                } else {
                    // New employee defaults (exact match to Old IVRM employeeRegistration.js:1580-1605)
                    active = true;
                    if (isPercentage) {
                        percentage = masterPercStr;
                        appPercentage = masterPercStr;
                        amount = 0;
                    } else {
                        percentage = '0';
                        appPercentage = '0';
                        amount = Number(masterPercVal) || 0;
                    }
                }

                const maxVal = existingItem?.HREED_ApplicableMaxValue ?? existingItem?.hreeD_ApplicableMaxValue ?? item.HREED_ApplicableMaxValue ?? item.hreeD_ApplicableMaxValue ?? masterHead?.HREED_ApplicableMaxValue ?? 0;
                const maxAppFlg = Boolean(existingItem?.HREED_MaxApplicableFlg ?? existingItem?.hreeD_MaxApplicableFlg ?? item.HREED_MaxApplicableFlg ?? item.hreeD_MaxApplicableFlg ?? true);

                return {
                    ...(masterHead || {}),
                    ...(existingItem || {}),
                    ...item,
                    HREED_Id: existingItem?.HREED_Id ?? existingItem?.hreeD_Id ?? item?.HREED_Id ?? item?.hreeD_Id ?? 0,
                    HRMED_Id: hrmedId,
                    HRMED_Name: headName,
                    hrmeD_Name: headName,
                    HRMED_EarnDedFlag: flag,
                    HRMED_AmountPercentFlag: amountPercentFlag,
                    HREED_ActiveFlag: active,
                    HREED_Amount: amount,
                    HREED_Percentage: percentage,
                    HREED_ApplicablePercentage: appPercentage,
                    HREED_ApplicableMaxValue: maxVal,
                    HREED_MaxApplicableFlg: maxAppFlg,
                    // Local state for editing
                    localAmount: amount,
                    localPercentage: percentage,
                    localApplicablePercentage: appPercentage,
                    localMaxAmount: maxVal,
                    hrmeD_Percent: masterPercStr,
                    hrmeD_Details: detailsText,
                    percentOff: percentOff,
                    perc_OfDTO: item.perc_OfDTO || masterHead?.perc_OfDTO || existingItem?.perc_OfDTO || [],
                    selectedearningdetectionList: item.selectedearningdetectionList || masterHead?.selectedearningdetectionList || existingItem?.selectedearningdetectionList || [],
                    AmountDis: isPercentage,
                    PercentDis: !isPercentage
                } as EditablePayrollItem;
            });
        };

        let earningsList = initializeList('Earning');
        let deductionsList = initializeList('Deduction');
        let arrearsList = initializeList('Arrear');

        // Handle Gross separately
        const existingGross = (salaryDetails || []).find((sd: any) => isMatchFlag(sd, 'Gross'));
        const masterGross = (masterGrossList && masterGrossList.length > 0) ? masterGrossList[0] : null;

        const grossHrmedId = Number(
            getHeadId(existingGross) ||
            resolvedGrossHrmedId ||
            getHeadId(masterGross) ||
            0
        );
        let grossAmount = Number(existingGross ? (existingGross.HREED_Amount ?? existingGross.hreeD_Amount ?? 0) : 0);

        // Fallback recovery: if grossAmount is 0, check if Basic Pay or any 100% head has a saved amount
        if (grossAmount === 0) {
            const basicOr100 = earningsList.find((e) => {
                const perc = Number.parseFloat(String(e.localPercentage || e.HREED_Percentage || '0'));
                const amt = Number(e.localAmount ?? e.HREED_Amount ?? 0);
                return perc === 100 && amt > 0;
            });
            if (basicOr100) {
                grossAmount = Number(basicOr100.localAmount ?? basicOr100.HREED_Amount ?? 0);
            }
        }

        const grossHeadName =
            getHeadName(existingGross) ||
            getHeadName(masterGross) ||
            'GROSS';

        setGrossDetails({
            ...(masterGross || {}),
            ...(existingGross || {}),
            HREED_Id: existingGross?.HREED_Id ?? existingGross?.hreeD_Id ?? 0,
            HRMED_Id: grossHrmedId,
            HRMED_Name: grossHeadName,
            hrmeD_Name: grossHeadName,
            HRMED_EarnDedFlag: 'Gross',
            HRMED_AmountPercentFlag: 'Amount',
            HREED_ActiveFlag: true,
            HREED_Amount: grossAmount,
            HREED_Percentage: '0',
            HREED_ApplicablePercentage: '0',
            HREED_ApplicableMaxValue: 0,
            localAmount: grossAmount,
            localPercentage: '0',
            localApplicablePercentage: '0',
            localMaxAmount: 0,
            HREED_MaxApplicableFlg: true
        } as EditablePayrollItem);

        // If gross amount is present, automatically calculate percentage-based heads that have 0 amount
        if (grossAmount > 0) {
            const calculated = calculateHeadsFromGross(grossAmount, earningsList, deductionsList, arrearsList, true);
            earningsList = calculated.newEarnings;
            deductionsList = calculated.newDeductions;
            arrearsList = calculated.newArrears;
        }

        earningsRef.current = earningsList;
        deductionsRef.current = deductionsList;
        arrearsRef.current = arrearsList;

        setEarnings(earningsList);
        setDeductions(deductionsList);
        setArrears(arrearsList);
        calculateTotalsWithArrays(earningsList, deductionsList, arrearsList);
    }, [salaryDetails, masterEarningList, masterDetectionList, masterArrearList, masterGrossList, resolvedGrossHrmedId, masterHeadsMap]);
    // Helper function to calculate totals with specific arrays (client-side calculation)
    const calculateTotalsWithArrays = (
        earningsArray: EditablePayrollItem[],
        deductionsArray: EditablePayrollItem[],
        arrearsArray: EditablePayrollItem[]
    ) => {
        // Client-side calculation: Calculate totals from active items
        // Use max amount if > 0, otherwise use amount
        const totalEarning = earningsArray
            .filter((item) => item.HREED_ActiveFlag)
            .reduce((sum, item) => {
                const maxAmount = item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0;
                const amount = item.localAmount ?? item.HREED_Amount ?? 0;
                return sum + (maxAmount > 0 ? maxAmount : amount);
            }, 0);
        const totalDeduction = deductionsArray
            .filter((item) => item.HREED_ActiveFlag)
            .reduce((sum, item) => {
                const maxAmount = item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0;
                const amount = item.localAmount ?? item.HREED_Amount ?? 0;
                return sum + (maxAmount > 0 ? maxAmount : amount);
            }, 0);
        const totalArrear = arrearsArray
            .filter((item) => item.HREED_ActiveFlag)
            .reduce((sum, item) => {
                const maxAmount = item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0;
                const amount = item.localAmount ?? item.HREED_Amount ?? 0;
                return sum + (maxAmount > 0 ? maxAmount : amount);
            }, 0);
        setCalculatedTotals({
            totalEarning,
            totalDeduction,
            totalArrear,
            netSalary: totalEarning + totalArrear - totalDeduction
        });
    };
    // Validation helper functions
    const validatePercentage = (value: string): string => {
        if (value === '' || value === '-') return '0';
        const numValue = Number.parseFloat(value);
        if (Number.isNaN(numValue)) return '0';
        if (numValue < 0) return '0';
        if (numValue > 100) return '100';
        return value;
    };
    const validateAmount = (value: string): number => {
        if (value === '' || value === '-') return 0;
        // Remove any non-digit characters except decimal point
        let cleanValue = value.replace(/[^\d.]/g, '');
        // Remove negative sign if present (we don't allow negatives)
        cleanValue = cleanValue.replace(/-/g, '');
        // Check for max 15 digits (excluding decimal point)
        const digitsOnly = cleanValue.replace(/\./g, '');
        if (digitsOnly.length > 15) {
            // Truncate to 15 digits - keep integer part and allow some decimal places
            const truncatedDigits = digitsOnly.substring(0, 15);
            // If there was a decimal, try to preserve it
            if (cleanValue.includes('.')) {
                const parts = cleanValue.split('.');
                const intDigits = parts[0].replace(/\./g, '').length;
                const maxDecimals = Math.min(parts[1]?.length || 0, 15 - intDigits);
                const intPart = truncatedDigits.substring(0, intDigits);
                const decPart = maxDecimals > 0 ? truncatedDigits.substring(intDigits, intDigits + maxDecimals) : '';
                const result = decPart ? `${intPart}.${decPart}` : intPart;
                const numValue = Number.parseFloat(result);
                return Number.isNaN(numValue) ? 0 : Math.max(0, numValue);
            }
            const numValue = Number.parseFloat(truncatedDigits);
            return Number.isNaN(numValue) ? 0 : Math.max(0, numValue);
        }
        const numValue = Number.parseFloat(cleanValue);
        if (Number.isNaN(numValue)) return 0;
        return Math.max(0, numValue); // Ensure no negative values
    };
    // State for calculation trigger (kept as fallback)
    const _handleCalculateServerSide = async (
        currentEarnings = earningsRef.current,
        currentDeductions = deductionsRef.current,
        currentArrears = arrearsRef.current,
        currentGross = grossRef.current
    ) => {
        const effectiveMiId = Number(MI_Id || employeemiId || HRMS_MI_ID || 30);
        if (!effectiveMiId) return;

        // Construct standard payload for calculation with dual casing for C# backend compatibility
        const allItems = [...currentEarnings, ...currentDeductions, ...currentArrears, ...(currentGross ? [currentGross] : [])].map(
            (item) => {
                const targetHrmedId = getHeadId(item);
                const headName = getHeadName(item) || getHeadName(masterHeadsMap.get(targetHrmedId)) || '';
                const amt = Number(item.localAmount ?? item.HREED_Amount ?? 0);
                const perc = String(item.localApplicablePercentage ?? item.localPercentage ?? item.HREED_Percentage ?? '0');
                const maxVal = Number(item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0);
                const active = Boolean(item.HREED_ActiveFlag);

                return {
                    ...item,
                    HREED_Id: Number(item.HREED_Id || 0),
                    hreeD_Id: Number(item.HREED_Id || 0),
                    MI_Id: effectiveMiId,
                    mI_Id: effectiveMiId,
                    HRME_Id: employeeId ? Number(employeeId) : 0,
                    hrmE_Id: employeeId ? Number(employeeId) : 0,
                    HRMED_Id: targetHrmedId,
                    hrmeD_Id: targetHrmedId,
                    HRMED_Name: headName,
                    hrmeD_Name: headName,
                    HRMED_EarnDedFlag: item.HRMED_EarnDedFlag,
                    hrmeD_EarnDedFlag: item.HRMED_EarnDedFlag,
                    HRMED_AmountPercentFlag: item.HRMED_AmountPercentFlag,
                    hrmeD_AmountPercentFlag: item.HRMED_AmountPercentFlag,
                    HREED_Amount: amt,
                    hreeD_Amount: amt,
                    HREED_Percentage: perc,
                    hreeD_Percentage: perc,
                    HREED_ApplicablePercentage: perc,
                    hreeD_ApplicablePercentage: perc,
                    HREED_ApplicableMaxValue: maxVal,
                    hreeD_ApplicableMaxValue: maxVal,
                    HREED_ActiveFlag: active,
                    hreeD_ActiveFlag: active,
                    HREED_MaxApplicableFlg: Boolean(item.HREED_MaxApplicableFlg ?? true),
                    hreeD_MaxApplicableFlg: Boolean(item.HREED_MaxApplicableFlg ?? true)
                };
            }
        );

        const payload = {
            MI_Id: effectiveMiId,
            mI_Id: effectiveMiId,
            HRME_Id: employeeId ? Number(employeeId) : 0,
            hrmE_Id: employeeId ? Number(employeeId) : 0,
            employeeEarningsDeductionsDetails: allItems
        };

        try {
            console.log('📡 [PAYROLL] Calling server calculation with payload:', payload);
            const result = await _getEmployeeSalaryDetailsByHeadMutation.mutateAsync(payload);
            console.log('✅ [PAYROLL] Server calculation response:', result);

            const calcResult = result as any;
            const newDetails: any[] =
                calcResult?.employeeEarningsDeductionsDetails ||
                calcResult?.EmployeeEarningsDeductionsDetails ||
                calcResult?.data?.employeeEarningsDeductionsDetails ||
                calcResult?.data?.EmployeeEarningsDeductionsDetails ||
                (Array.isArray(calcResult?.data) ? calcResult.data : null) ||
                (Array.isArray(calcResult) ? calcResult : null) ||
                [];

            if (newDetails && newDetails.length > 0) {
                // Merge calculated results back into state
                const newEarnings: EditablePayrollItem[] = [];
                const newDeductions: EditablePayrollItem[] = [];
                const newArrears: EditablePayrollItem[] = [];
                let newGross: EditablePayrollItem | null = null;

                newDetails.forEach((item) => {
                    const hrmedId = getHeadId(item);
                    const existingItem = [...currentEarnings, ...currentDeductions, ...currentArrears, ...(currentGross ? [currentGross] : [])].find(
                        (e) => getHeadId(e) === hrmedId
                    );
                    const currentMasterHead = masterListFromApi.find((head: any) => getHeadId(head) === hrmedId);

                    // Get name from salary details only (API driven)
                    const name = getHeadName(item) || getHeadName(existingItem) || getHeadName(masterHeadsMap.get(hrmedId)) || '';
                    const rawFlag =
                        currentMasterHead?.HRMED_AmountPercentFlag ??
                        currentMasterHead?.hrmeD_AmountPercentFlag ??
                        existingItem?.HRMED_AmountPercentFlag ??
                        existingItem?.hrmeD_AmountPercentFlag ??
                        item.HRMED_AmountPercentFlag;
                    const amountPercentFlag = rawFlag?.toString().trim()
                        ? rawFlag.toString().trim()
                        : 'Amount';

                    const isPercentage = amountPercentFlag.trim().toLowerCase() === 'percentage';
                    const savedPercentage = item.HREED_Percentage ?? item.hreeD_Percentage ?? existingItem?.localPercentage ?? '0';
                    const calcPerc = isPercentage ? String(savedPercentage) : '0';
                    const calcAppPerc = isPercentage
                        ? String(item.HREED_ApplicablePercentage ?? item.hreeD_ApplicablePercentage ?? savedPercentage)
                        : '0';
                    const masterAmount =
                        currentMasterHead?.hrmeD_AmountPercent ??
                        currentMasterHead?.HRMED_AmountPercent ??
                        item.hrmeD_Percent ??
                        item.HRMED_AmountPercent ??
                        existingItem?.hrmeD_Percent ??
                        0;
                    const calcAmount =
                        !isPercentage && Number(savedPercentage) > 0
                            ? Number(masterAmount) || 0
                            : Number(item.HREED_Amount ?? item.hreeD_Amount ?? existingItem?.localAmount ?? 0);
                    const calcMax = Number(item.HREED_ApplicableMaxValue ?? item.hreeD_ApplicableMaxValue ?? existingItem?.localMaxAmount ?? 0);

                    const editableItem: EditablePayrollItem = {
                        ...existingItem,
                        ...item,
                        HRMED_Id: hrmedId,
                        HRMED_Name: name,
                        hrmeD_Name: name,
                        HRMED_AmountPercentFlag: amountPercentFlag,
                        HREED_ActiveFlag: item.HREED_ActiveFlag !== undefined ? Boolean(item.HREED_ActiveFlag) : (existingItem?.HREED_ActiveFlag ?? true),
                        localAmount: calcAmount,
                        HREED_Amount: calcAmount,
                        localPercentage: calcPerc,
                        HREED_Percentage: calcPerc,
                        localApplicablePercentage: calcAppPerc,
                        HREED_ApplicablePercentage: calcAppPerc,
                        localMaxAmount: calcMax,
                        HREED_ApplicableMaxValue: calcMax,
                        hrmeD_Percent: existingItem?.hrmeD_Percent || item.hrmeD_Percent || calcPerc,
                        hrmeD_Details: existingItem?.hrmeD_Details || item.hrmeD_Details || ''
                    };

                    if (isMatchFlag(item, 'Earning')) {
                        newEarnings.push(editableItem);
                    } else if (isMatchFlag(item, 'Deduction')) {
                        newDeductions.push(editableItem);
                    } else if (isMatchFlag(item, 'Arrear')) {
                        newArrears.push(editableItem);
                    } else if (isMatchFlag(item, 'Gross')) {
                        newGross = editableItem;
                    }
                });

                if (newEarnings.length > 0) {
                    earningsRef.current = newEarnings;
                    setEarnings(newEarnings);
                }
                if (newDeductions.length > 0) {
                    deductionsRef.current = newDeductions;
                    setDeductions(newDeductions);
                }
                if (newArrears.length > 0) {
                    arrearsRef.current = newArrears;
                    setArrears(newArrears);
                }
                if (newGross) {
                    grossRef.current = newGross;
                    setGrossDetails(newGross);
                }

                // Also update totals
                calculateTotalsWithArrays(
                    newEarnings.length > 0 ? newEarnings : currentEarnings,
                    newDeductions.length > 0 ? newDeductions : currentDeductions,
                    newArrears.length > 0 ? newArrears : currentArrears
                );
            }
        } catch (error) {
            console.error('Calculation error', error);
        }
    };

    const handleAutoSave = async (item: EditablePayrollItem) => {
        if (!employeeId) return;

        const effectiveMiId = Number(MI_Id || employeemiId || HRMS_MI_ID || 30);
        const targetHrmedId = Number(
            getHeadId(item) ||
            (isMatchFlag(item, 'Gross') ? resolvedGrossHrmedId : 0) ||
            0
        );

        if (targetHrmedId === 0) {
            console.warn(`⚠️ [PAYROLL AUTO-SAVE] Skipping save for head with invalid HRMED_Id:`, item);
            return;
        }

        const headName = getHeadName(item) || getHeadName(masterHeadsMap.get(targetHrmedId)) || '';

        // Construct payload matching backend DTO structure with both casings
        const payload = {
            // PascalCase keys for C# backend DTO binding
            HREED_Id: Number(item.HREED_Id || 0),
            MI_Id: effectiveMiId,
            HRME_Id: Number(employeeId),
            HRMED_Id: targetHrmedId,
            HRMED_Name: headName,
            HREED_Amount: Number(item.localAmount ?? item.HREED_Amount ?? 0),
            HREED_Percentage: String(item.localApplicablePercentage ?? item.HREED_ApplicablePercentage ?? item.HREED_Percentage ?? '0'),
            HREED_ActiveFlag: Boolean(item.HREED_ActiveFlag),
            HREED_MaxApplicableFlg: Boolean(item.HREED_MaxApplicableFlg ?? true),
            HREED_ApplicableMaxValue: Number(item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0),
            // camelCase keys
            hreeD_Id: Number(item.HREED_Id || 0),
            mI_Id: effectiveMiId,
            hrmE_Id: Number(employeeId),
            hrmeD_Id: targetHrmedId,
            hrmeD_Name: headName,
            hreeD_Amount: Number(item.localAmount ?? item.HREED_Amount ?? 0),
            hreeD_Percentage: String(item.localApplicablePercentage ?? item.HREED_ApplicablePercentage ?? item.HREED_Percentage ?? '0'),
            hreeD_ActiveFlag: Boolean(item.HREED_ActiveFlag),
            hreeD_MaxApplicableFlg: Boolean(item.HREED_MaxApplicableFlg ?? true),
            hreeD_ApplicableMaxValue: Number(item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0),
            updatedDate: new Date().toISOString(),
            hreeD_UpdatedBy: 0 // Logged in user ID from backend session
        };

        try {
            console.log(`[PAYROLL AUTO-SAVE] Payload for head ${targetHrmedId}:`, payload);
            await updateSalaryByHeadMutation.mutateAsync(payload);
        } catch (error) {
            console.error(`❌ [AUTO-SAVE ERROR] Failed for head ${targetHrmedId}:`, error);
        }
    };

    // Update handlers for earnings
    const updateEarning = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...earningsRef.current];
        let validatedValue = value;
        // Apply validation based on field type
        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            validatedValue = validatePercentage(String(value));
        } else if (field === 'localAmount' || field === 'localMaxAmount') {
            validatedValue = validateAmount(String(value));
        }

        const currentItem = updated[index];
        const currentItemId = getHeadId(currentItem);
        const newProps: Partial<EditablePayrollItem> = { [field]: validatedValue };

        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            if (field === 'localPercentage') {
                newProps.localApplicablePercentage = validatedValue;
            }
            newProps.HREED_Percentage = String(validatedValue);
            newProps.HREED_ApplicablePercentage = String(validatedValue);
        } else if (field === 'localAmount') {
            newProps.HREED_Amount = validatedValue;
        } else if (field === 'HREED_ActiveFlag') {
            const isActive = Boolean(validatedValue);
            newProps.HREED_ActiveFlag = isActive;
            if (!isActive) {
                newProps.localAmount = 0;
                newProps.HREED_Amount = 0;
            }
        }

        updated[index] = { ...currentItem, ...newProps };
        earningsRef.current = updated;

        const currentGross = Number(grossRef.current?.localAmount ?? grossRef.current?.HREED_Amount ?? grossDetails?.localAmount ?? 0);

        // Trigger cascading recalculation if percentage or amount or active changed
        if (field === 'localPercentage' || field === 'localApplicablePercentage' || field === 'localAmount' || field === 'HREED_ActiveFlag') {
            const skipRecalc = field === 'localAmount' ? currentItemId : undefined;
            const calculated = calculateHeadsFromGross(
                currentGross,
                updated,
                deductionsRef.current,
                arrearsRef.current,
                false,
                skipRecalc
            );
            earningsRef.current = calculated.newEarnings;
            deductionsRef.current = calculated.newDeductions;
            arrearsRef.current = calculated.newArrears;

            setEarnings(calculated.newEarnings);
            setDeductions(calculated.newDeductions);
            setArrears(calculated.newArrears);
            dirtyRowsRef.current.earnings.add(index);
            calculateTotalsWithArrays(calculated.newEarnings, calculated.newDeductions, calculated.newArrears);

            if (field === 'HREED_ActiveFlag' && calculated.newEarnings[index]) {
                handleAutoSave(calculated.newEarnings[index]);
            }

            return calculated.newEarnings;
        }

        setEarnings(updated);
        dirtyRowsRef.current.earnings.add(index);
        calculateTotalsWithArrays(updated, deductionsRef.current, arrearsRef.current);
        return updated;
    };

    // Update handlers for deductions
    const updateDeduction = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...deductionsRef.current];
        let validatedValue = value;
        // Apply validation based on field type
        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            validatedValue = validatePercentage(String(value));
        } else if (field === 'localAmount' || field === 'localMaxAmount') {
            validatedValue = validateAmount(String(value));
        }

        const currentItem = updated[index];
        const currentItemId = getHeadId(currentItem);
        const newProps: Partial<EditablePayrollItem> = { [field]: validatedValue };

        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            if (field === 'localPercentage') {
                newProps.localApplicablePercentage = validatedValue;
            }
            newProps.HREED_Percentage = String(validatedValue);
            newProps.HREED_ApplicablePercentage = String(validatedValue);
        } else if (field === 'localAmount') {
            newProps.HREED_Amount = validatedValue;
        } else if (field === 'HREED_ActiveFlag') {
            const isActive = Boolean(validatedValue);
            newProps.HREED_ActiveFlag = isActive;
            if (!isActive) {
                newProps.localAmount = 0;
                newProps.HREED_Amount = 0;
            }
        }

        updated[index] = { ...currentItem, ...newProps };
        deductionsRef.current = updated;

        const currentGross = Number(grossRef.current?.localAmount ?? grossRef.current?.HREED_Amount ?? grossDetails?.localAmount ?? 0);

        // Trigger cascading recalculation if percentage or amount or active changed
        if (field === 'localPercentage' || field === 'localApplicablePercentage' || field === 'localAmount' || field === 'HREED_ActiveFlag') {
            const skipRecalc = field === 'localAmount' ? currentItemId : undefined;
            const calculated = calculateHeadsFromGross(
                currentGross,
                earningsRef.current,
                updated,
                arrearsRef.current,
                false,
                skipRecalc
            );
            earningsRef.current = calculated.newEarnings;
            deductionsRef.current = calculated.newDeductions;
            arrearsRef.current = calculated.newArrears;

            setEarnings(calculated.newEarnings);
            setDeductions(calculated.newDeductions);
            setArrears(calculated.newArrears);
            dirtyRowsRef.current.deductions.add(index);
            calculateTotalsWithArrays(calculated.newEarnings, calculated.newDeductions, calculated.newArrears);

            if (field === 'HREED_ActiveFlag' && calculated.newDeductions[index]) {
                handleAutoSave(calculated.newDeductions[index]);
            }

            return calculated.newDeductions;
        }

        setDeductions(updated);
        dirtyRowsRef.current.deductions.add(index);
        calculateTotalsWithArrays(earningsRef.current, updated, arrearsRef.current);
        return updated;
    };

    // Update handlers for arrears
    const updateArrear = (index: number, field: keyof EditablePayrollItem, value: any) => {
        const updated = [...arrearsRef.current];
        let validatedValue = value;
        // Apply validation based on field type
        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            validatedValue = validatePercentage(String(value));
        } else if (field === 'localAmount' || field === 'localMaxAmount') {
            validatedValue = validateAmount(String(value));
        }

        const currentItem = updated[index];
        const currentItemId = getHeadId(currentItem);
        const newProps: Partial<EditablePayrollItem> = { [field]: validatedValue };

        if (field === 'localPercentage' || field === 'localApplicablePercentage') {
            if (field === 'localPercentage') {
                newProps.localApplicablePercentage = validatedValue;
            }
            newProps.HREED_Percentage = String(validatedValue);
            newProps.HREED_ApplicablePercentage = String(validatedValue);
        } else if (field === 'localAmount') {
            newProps.HREED_Amount = validatedValue;
        } else if (field === 'HREED_ActiveFlag') {
            const isActive = Boolean(validatedValue);
            newProps.HREED_ActiveFlag = isActive;
            if (!isActive) {
                newProps.localAmount = 0;
                newProps.HREED_Amount = 0;
            }
        }

        updated[index] = { ...currentItem, ...newProps };
        arrearsRef.current = updated;

        const currentGross = Number(grossRef.current?.localAmount ?? grossRef.current?.HREED_Amount ?? grossDetails?.localAmount ?? 0);

        // Trigger cascading recalculation if percentage or amount or active changed
        if (field === 'localPercentage' || field === 'localApplicablePercentage' || field === 'localAmount' || field === 'HREED_ActiveFlag') {
            const skipRecalc = field === 'localAmount' ? currentItemId : undefined;
            const calculated = calculateHeadsFromGross(
                currentGross,
                earningsRef.current,
                deductionsRef.current,
                updated,
                false,
                skipRecalc
            );
            earningsRef.current = calculated.newEarnings;
            deductionsRef.current = calculated.newDeductions;
            arrearsRef.current = calculated.newArrears;

            setEarnings(calculated.newEarnings);
            setDeductions(calculated.newDeductions);
            setArrears(calculated.newArrears);
            dirtyRowsRef.current.arrears.add(index);
            calculateTotalsWithArrays(calculated.newEarnings, calculated.newDeductions, calculated.newArrears);

            if (field === 'HREED_ActiveFlag' && calculated.newArrears[index]) {
                handleAutoSave(calculated.newArrears[index]);
            }

            return calculated.newArrears;
        }

        setArrears(updated);
        dirtyRowsRef.current.arrears.add(index);
        calculateTotalsWithArrays(earningsRef.current, deductionsRef.current, updated);
        return updated;
    };

    // Triggered when focus leaves an entire table row (clicking outside)
    const handleRowBlur = async (type: 'Earning' | 'Deduction' | 'Arrear', index: number) => {
        const dirtySet =
            type === 'Earning'
                ? dirtyRowsRef.current.earnings
                : type === 'Deduction'
                  ? dirtyRowsRef.current.deductions
                  : dirtyRowsRef.current.arrears;

        if (!dirtySet.has(index)) return;
        dirtySet.delete(index);

        const list = type === 'Earning' ? earningsRef.current : type === 'Deduction' ? deductionsRef.current : arrearsRef.current;
        const item = list[index];
        if (!item) return;

        await handleAutoSave(item);
    };

    // Update handlers for gross
    const updateGross = (field: keyof EditablePayrollItem, value: any) => {
        let validatedValue = value;
        if (field === 'localAmount') {
            validatedValue = validateAmount(String(value));
        }

        const baseGross =
            grossRef.current ||
            grossDetails ||
            ({
                HREED_Id: 0,
                HRMED_Id: resolvedGrossHrmedId,
                HRMED_Name: 'GROSS',
                HRMED_EarnDedFlag: 'Gross',
                HRMED_AmountPercentFlag: 'Amount',
                HREED_ActiveFlag: true,
                HREED_Amount: 0,
                HREED_Percentage: '0',
                HREED_ApplicablePercentage: '0',
                HREED_ApplicableMaxValue: 0,
                localAmount: 0,
                localPercentage: '0',
                localApplicablePercentage: '0',
                localMaxAmount: 0,
                HREED_MaxApplicableFlg: true
            } as EditablePayrollItem);

        const targetHrmedId = Number(baseGross.HRMED_Id || resolvedGrossHrmedId || 0);

        const updatedGross = {
            ...baseGross,
            HRMED_Id: targetHrmedId > 0 ? targetHrmedId : resolvedGrossHrmedId,
            [field]: validatedValue,
            ...(field === 'localAmount' ? { HREED_Amount: validatedValue } : {})
        };
        grossRef.current = updatedGross;
        setGrossDetails(updatedGross);
        dirtyRowsRef.current.gross = true;

        if (field === 'localAmount' && typeof validatedValue === 'number') {
            const calculated = calculateHeadsFromGross(
                validatedValue,
                earningsRef.current,
                deductionsRef.current,
                arrearsRef.current
            );
            earningsRef.current = calculated.newEarnings;
            deductionsRef.current = calculated.newDeductions;
            arrearsRef.current = calculated.newArrears;
            setEarnings(calculated.newEarnings);
            setDeductions(calculated.newDeductions);
            setArrears(calculated.newArrears);
            calculateTotalsWithArrays(calculated.newEarnings, calculated.newDeductions, calculated.newArrears);
        }

        return updatedGross;
    };

    const onBlurGross = async (updated = grossDetails) => {
        if (!updated) return;
        dirtyRowsRef.current.gross = false;

        const grossAmount = updated.localAmount ?? updated.HREED_Amount ?? 0;
        if (grossAmount > 0) {
            const { newEarnings, newDeductions, newArrears } = calculateHeadsFromGross(
                grossAmount,
                earningsRef.current,
                deductionsRef.current,
                arrearsRef.current
            );
            earningsRef.current = newEarnings;
            deductionsRef.current = newDeductions;
            arrearsRef.current = newArrears;
            setEarnings(newEarnings);
            setDeductions(newDeductions);
            setArrears(newArrears);
            calculateTotalsWithArrays(newEarnings, newDeductions, newArrears);

            // Trigger server calculation for exact master formula heads (e.g. PF, ESI, Basic dependent heads)
            try {
                await _handleCalculateServerSide(newEarnings, newDeductions, newArrears, updated);
            } catch (err) {
                console.warn('Server side salary calculation failed, using client calculation fallback', err);
            }

            // Auto-save gross head FIRST and await it
            const targetGross = {
                ...updated,
                HRMED_Id: Number(updated.HRMED_Id || resolvedGrossHrmedId || 0)
            };
            await handleAutoSave(grossRef.current || targetGross);

            // Auto-save recalculated heads sequentially to prevent DB race conditions
            for (const item of earningsRef.current) {
                if (item.HREED_ActiveFlag && (item.localAmount ?? 0) > 0) {
                    await handleAutoSave(item);
                }
            }
            for (const item of deductionsRef.current) {
                if (item.HREED_ActiveFlag && (item.localAmount ?? 0) > 0) {
                    await handleAutoSave(item);
                }
            }
            for (const item of arrearsRef.current) {
                if (item.HREED_ActiveFlag && (item.localAmount ?? 0) > 0) {
                    await handleAutoSave(item);
                }
            }
        } else {
            await handleAutoSave(grossRef.current || updated);
        }
    };
    // State for calculated totals from API
    const [calculatedTotals, setCalculatedTotals] = useState<{
        totalEarning: number;
        totalDeduction: number;
        totalArrear: number;
        netSalary: number;
    }>({
        totalEarning: 0,
        totalDeduction: 0,
        totalArrear: 0,
        netSalary: 0
    });
    // Calculate totals using client-side calculation
    const calculateTotals = () => {
        calculateTotalsWithArrays(earningsRef.current, deductionsRef.current, arrearsRef.current);
    };
    // Calculate totals when earnings, deductions, or arrears change (but not on checkbox toggle - handled separately)
    useEffect(() => {
        // Only calculate on initial load or when arrays change (not on checkbox toggle)
        // Checkbox toggles are handled in updateEarning/updateDeduction/updateArrear functions
        if (earnings.length > 0 || deductions.length > 0 || arrears.length > 0) {
            // Debounce to avoid multiple calls
            const timeoutId = setTimeout(() => {
                calculateTotals();
            }, 100);
            return () => clearTimeout(timeoutId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [earnings, deductions, arrears]);
    // Use calculated totals from API, fallback to 0 if not calculated yet
    const totalEarning = calculatedTotals.totalEarning;
    const totalDeduction = calculatedTotals.totalDeduction;
    const totalArrear = calculatedTotals.totalArrear;
    const netSalary = calculatedTotals.netSalary;

    const saveEmployeeSalaryDetailsMutation = useSaveEmployeeSalaryDetails();

    const handleSave = async (): Promise<boolean> => {
        if (!employeeId) {
            toast.error('Employee ID is required');
            return false;
        }

        try {
            // Step 1: Save gross head FIRST and await it so DB has Gross salary before anything else
            if (grossRef.current) {
                const targetGross = {
                    ...grossRef.current,
                    HRMED_Id: Number(grossRef.current.HRMED_Id || resolvedGrossHrmedId || 0)
                };
                await handleAutoSave(targetGross);
            }

            // Step 2: Save active earnings, deductions, arrears sequentially to avoid DB locks/races
            for (const item of earningsRef.current) {
                if (item.HREED_ActiveFlag || (item.localAmount ?? 0) > 0) {
                    await handleAutoSave(item);
                }
            }
            for (const item of deductionsRef.current) {
                if (item.HREED_ActiveFlag || (item.localAmount ?? 0) > 0) {
                    await handleAutoSave(item);
                }
            }
            for (const item of arrearsRef.current) {
                if (item.HREED_ActiveFlag || (item.localAmount ?? 0) > 0) {
                    await handleAutoSave(item);
                }
            }

            dirtyRowsRef.current.earnings.clear();
            dirtyRowsRef.current.deductions.clear();
            dirtyRowsRef.current.arrears.clear();
            dirtyRowsRef.current.gross = false;

            console.log(`🔍 [PayrollTab] Submitting Final Save for Employee ID: ${employeeId}, MI_Id: ${MI_Id}`);
            const result = await saveEmployeeSalaryDetailsMutation.mutateAsync({
                hrme_id: employeeId,
                MI_Id: MI_Id || 0
            });

            if (result?.success || result?.success === undefined) {
                await refetch();
                queryClient.invalidateQueries({
                    queryKey: [HRMS_QUERY_KEYS.EMPLOYEE]
                });
                toast.success(result?.message || 'Salary details saved successfully');
                // Call onSuccess if provided and still mounted
                if (isMountedRef.current && onSuccess) {
                    onSuccess();
                }
                return true;
            }
            toast.error(result?.message || 'Failed to save salary details');
            return false;
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(error?.response?.data?.message || error?.message || 'Failed to save salary details');
            return false;
        }
    };
    const handleSaveRef = useRef(handleSave);
    handleSaveRef.current = handleSave;

    useEffect(() => {
        if (!onSaveReady) return;
        const submitPayroll = () => handleSaveRef.current();
        onSaveReady(submitPayroll);
        return () => onSaveReady(null);
    }, [onSaveReady]);

    const isSaving = saveEmployeeSalaryDetailsMutation.isPending;
    if (isLoading) {
        return <div className='rounded-md border p-6 text-center text-muted-foreground'>Loading payroll details...</div>;
    }
    return (
        <div className='space-y-6'>
            {/* Gross Salary */}
            <div className='rounded-md border bg-white p-4'>
                <div className='flex items-center gap-4'>
                    <h3 className='min-w-[150px] font-semibold text-base text-gray-900 uppercase'>GROSS SALARY:</h3>
                    <div className='flex items-center gap-2'>
                        <span className='font-medium text-sm'>Amount:</span>
                        <Input
                            type='number'
                            className='h-9 w-40 text-right'
                            value={grossDetails?.localAmount ?? grossDetails?.HREED_Amount ?? 0}
                            onChange={(e) => updateGross('localAmount', e.target.value)}
                            onBlur={(e) => {
                                const validated = validateAmount(e.target.value);
                                const updated = updateGross('localAmount', validated);
                                if (updated) onBlurGross(updated);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.currentTarget.blur();
                                }
                            }}
                            min={0}
                            max={999999999999999}
                            step={0.01}
                        />
                    </div>
                </div>
            </div>

            {/* Earning Details */}
            <div className='rounded-md border'>
                <div className='border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>EARNING DETAILS</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16 text-center'>Action</TableHead>
                                <TableHead className='w-20 whitespace-nowrap text-center'>Serial NO.</TableHead>
                                <TableHead className='text-left min-w-[140px] px-4'>Earnings</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-center'>Actual %</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-center'>%&nbsp;Applicable</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Amount</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Max&nbsp;Amount</TableHead>
                                <TableHead className='text-center min-w-[100px] whitespace-nowrap'>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {earnings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className='text-center text-muted-foreground py-4'>
                                        No earning details available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                earnings.map((item, index) => {
                                    // Normalize the AmountPercentFlag value - handle null, undefined, empty string, and case variations
                                    const rawFlag = item.HRMED_AmountPercentFlag;
                                    const normalizedFlag = rawFlag ? String(rawFlag).trim().toLowerCase() : 'amount';
                                    const isAmountType = normalizedFlag === 'amount';
                                    const headPerc = getHeadPercentage(item);
                                    const isPercentageType = !isAmountType && (normalizedFlag === 'percentage' || headPerc > 0);
                                    return (
                                        <TableRow
                                            key={item.HREED_Id || index}
                                            onBlur={(e) => {
                                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                    handleRowBlur('Earning', index);
                                                }
                                            }}>
                                            <TableCell className='text-center'>
                                                <div className='flex justify-center'>
                                                    <Checkbox
                                                        checked={item.HREED_ActiveFlag || false}
                                                        onCheckedChange={(checked) => updateEarning(index, 'HREED_ActiveFlag', checked)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                            <TableCell className='font-medium text-left px-4 whitespace-nowrap'>
                                                {item.HRMED_Name || item.hrmeD_Name || (item as any).value || (item as any).Value || ''}
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='text'
                                                    readOnly
                                                    className='h-8 w-20 text-center mx-auto bg-muted/40 cursor-default font-medium'
                                                    value={isAmountType ? '0' : item.hrmeD_Percent || item.localPercentage || item.HREED_Percentage || '0'}
                                                    disabled={isAmountType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-center mx-auto'
                                                    value={
                                                        isAmountType
                                                            ? '0'
                                                            : (item.localApplicablePercentage ??
                                                              item.HREED_ApplicablePercentage ??
                                                              item.HREED_Percentage ??
                                                              '0')
                                                    }
                                                    onChange={(e) => updateEarning(index, 'localApplicablePercentage', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validatePercentage(e.target.value);
                                                        updateEarning(index, 'localApplicablePercentage', validated);
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag || isAmountType || !isPercentageType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-center mx-auto'
                                                    value={item.localAmount ?? item.HREED_Amount ?? 0}
                                                    onChange={(e) => updateEarning(index, 'localAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateEarning(index, 'localAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag || isPercentageType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-center mx-auto'
                                                    value={item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0}
                                                    onChange={(e) => updateEarning(index, 'localMaxAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateEarning(index, 'localMaxAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center text-xs font-medium text-muted-foreground whitespace-nowrap'>
                                                {item.hrmeD_Details}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className='border-t bg-muted px-4 py-2'>
                    <div className='flex justify-end'>
                        <span className='font-semibold'>Total Earning: ₹{totalEarning.toFixed(2)}</span>
                    </div>
                </div>
            </div>
            {/* Deduction Details */}
            <div className='rounded-md border'>
                <div className='border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>DEDUCTION DETAILS</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16 text-center'>Action</TableHead>
                                <TableHead className='w-20 whitespace-nowrap text-center'>Serial NO.</TableHead>
                                <TableHead className='text-left min-w-[140px] px-4'>Deductions</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-center'>Actual %</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-center'>%&nbsp;Applicable</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Amount</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Max&nbsp;Amount</TableHead>
                                <TableHead className='text-center min-w-[100px] whitespace-nowrap'>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {deductions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className='text-center text-muted-foreground py-4'>
                                        No deduction details available
                                    </TableCell>
                                </TableRow>
                            ) : (
                                deductions.map((item, index) => {
                                    // Normalize the AmountPercentFlag value - handle null, undefined, empty string, and case variations
                                    const rawFlag = item.HRMED_AmountPercentFlag;
                                    const normalizedFlag = rawFlag ? String(rawFlag).trim().toLowerCase() : 'amount';
                                    const isAmountType = normalizedFlag === 'amount';
                                    const headPerc = getHeadPercentage(item);
                                    const isPercentageType = !isAmountType && (normalizedFlag === 'percentage' || headPerc > 0);
                                    return (
                                        <TableRow
                                            key={item.HREED_Id || index}
                                            onBlur={(e) => {
                                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                    handleRowBlur('Deduction', index);
                                                }
                                            }}>
                                            <TableCell className='text-center'>
                                                <div className='flex justify-center'>
                                                    <Checkbox
                                                        checked={item.HREED_ActiveFlag || false}
                                                        onCheckedChange={(checked) => updateDeduction(index, 'HREED_ActiveFlag', checked)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                            <TableCell className='font-medium text-left px-4 whitespace-nowrap'>
                                                {item.HRMED_Name || item.hrmeD_Name || (item as any).value || (item as any).Value || ''}
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='text'
                                                    readOnly
                                                    className='h-8 w-20 text-center mx-auto bg-muted/40 cursor-default font-medium'
                                                    value={isAmountType ? '0' : item.hrmeD_Percent || item.localPercentage || item.HREED_Percentage || '0'}
                                                    disabled={isAmountType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-center mx-auto'
                                                    value={
                                                        isAmountType
                                                            ? '0'
                                                            : (item.localApplicablePercentage ??
                                                              item.HREED_ApplicablePercentage ??
                                                              item.HREED_Percentage ??
                                                              '0')
                                                    }
                                                    onChange={(e) => updateDeduction(index, 'localApplicablePercentage', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validatePercentage(e.target.value);
                                                        updateDeduction(index, 'localApplicablePercentage', validated);
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag || isAmountType || !isPercentageType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-center mx-auto'
                                                    value={item.localAmount ?? item.HREED_Amount ?? 0}
                                                    onChange={(e) => updateDeduction(index, 'localAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateDeduction(index, 'localAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    // disabled={!item.HREED_ActiveFlag || isPercentageType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-center mx-auto'
                                                    value={item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0}
                                                    onChange={(e) => updateDeduction(index, 'localMaxAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateDeduction(index, 'localMaxAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center text-xs font-medium text-muted-foreground whitespace-nowrap'>
                                                {item.hrmeD_Details}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className='border-t bg-muted px-4 py-2'>
                    <div className='flex justify-end'>
                        <span className='font-semibold'>Total Deduction: ₹{totalDeduction.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Gross Details */}
            <div className='rounded-md border'>
                <div className='border-b bg-muted px-4 py-2'>
                    <h3 className='font-semibold text-base text-gray-900 uppercase'>GROSS DETAILS</h3>
                </div>
                <div className='overflow-x-auto'>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className='w-16 text-center'>Action</TableHead>
                                <TableHead className='w-20 whitespace-nowrap text-center'>Serial NO.</TableHead>
                                <TableHead className='text-left min-w-[140px] px-4'>Gross Head</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-center'>Actual %</TableHead>
                                <TableHead className='w-24 whitespace-nowrap text-center'>%&nbsp;Applicable</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Amount</TableHead>
                                <TableHead className='w-32 whitespace-nowrap text-center'>Max&nbsp;Amount</TableHead>
                                <TableHead className='text-center min-w-[100px] whitespace-nowrap'>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow
                                onBlur={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                        if (grossRef.current) {
                                            onBlurGross(grossRef.current);
                                        }
                                    }
                                }}>
                                <TableCell className='text-center'>
                                    <div className='flex justify-center'>
                                        <Checkbox
                                            checked={grossDetails?.HREED_ActiveFlag ?? true}
                                            onCheckedChange={(checked) => updateGross('HREED_ActiveFlag', Boolean(checked))}
                                        />
                                    </div>
                                </TableCell>
                                <TableCell className='text-center font-medium'>1</TableCell>
                                <TableCell className='font-medium text-left px-4 whitespace-nowrap'>
                                    {grossDetails?.HRMED_Name || grossDetails?.hrmeD_Name || 'GROSS SALARY'}
                                </TableCell>
                                <TableCell className='text-center'>
                                    <Input
                                        type='text'
                                        readOnly
                                        className='h-8 w-20 text-center mx-auto bg-muted/40 cursor-default font-medium'
                                        value={grossDetails?.hrmeD_Percent || grossDetails?.localPercentage || '0'}
                                    />
                                </TableCell>
                                <TableCell className='text-center'>
                                    <Input
                                        type='number'
                                        className='h-8 w-20 text-center mx-auto'
                                        value={grossDetails?.localApplicablePercentage || '0'}
                                        disabled
                                    />
                                </TableCell>
                                <TableCell className='text-center'>
                                    <Input
                                        type='number'
                                        className='h-8 w-24 text-center mx-auto'
                                        value={grossDetails?.localAmount ?? grossDetails?.HREED_Amount ?? 0}
                                        onChange={(e) => updateGross('localAmount', e.target.value)}
                                        onBlur={(e) => {
                                            const validated = validateAmount(e.target.value);
                                            const updated = updateGross('localAmount', validated);
                                            if (updated) onBlurGross(updated);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.currentTarget.blur();
                                            }
                                        }}
                                        min={0}
                                        max={999999999999999}
                                        step={0.01}
                                        disabled={!(grossDetails?.HREED_ActiveFlag ?? true)}
                                    />
                                </TableCell>
                                <TableCell className='text-center'>
                                    <Input
                                        type='number'
                                        className='h-8 w-24 text-center mx-auto'
                                        value={grossDetails?.localMaxAmount ?? 0}
                                        disabled
                                    />
                                </TableCell>
                                <TableCell className='text-center text-xs font-medium text-muted-foreground whitespace-nowrap'>
                                    {grossDetails?.hrmeD_Details || 'Gross Salary'}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
                <div className='border-t bg-muted px-4 py-2'>
                    <div className='flex justify-end'>
                        <span className='font-semibold'>
                            Total Gross: ₹{Number(grossDetails?.localAmount ?? grossDetails?.HREED_Amount ?? 0).toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
            {/* Arrear Details */}
            {arrears && arrears.length > 0 && (
                <div className='rounded-md border'>
                    <div className='border-b bg-muted px-4 py-2'>
                        <h3 className='font-semibold text-base text-gray-900 uppercase'>ARREAR DETAILS</h3>
                    </div>
                    <div className='overflow-x-auto'>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='w-16 text-center'>Action</TableHead>
                                    <TableHead className='w-20 whitespace-nowrap text-center'>Serial NO.</TableHead>
                                    <TableHead className='text-left min-w-[140px] px-4'>Arrear Head</TableHead>
                                    <TableHead className='w-24 whitespace-nowrap text-center'>Actual %</TableHead>
                                    <TableHead className='w-24 whitespace-nowrap text-center'>%&nbsp;Applicable</TableHead>
                                    <TableHead className='w-32 whitespace-nowrap text-center'>Amount</TableHead>
                                    <TableHead className='w-32 whitespace-nowrap text-center'>Max&nbsp;Amount</TableHead>
                                    <TableHead className='text-center min-w-[100px] whitespace-nowrap'>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {arrears.map((item, index) => {
                                    const rawFlag = item.HRMED_AmountPercentFlag;
                                    const normalizedFlag = rawFlag ? String(rawFlag).trim().toLowerCase() : 'amount';
                                    const isAmountType = normalizedFlag === 'amount';
                                    const headPerc = getHeadPercentage(item);
                                    const isPercentageType = !isAmountType && (normalizedFlag === 'percentage' || headPerc > 0);
                                    return (
                                        <TableRow
                                            key={item.HREED_Id || index}
                                            onBlur={(e) => {
                                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                                    handleRowBlur('Arrear', index);
                                                }
                                            }}>
                                            <TableCell className='text-center'>
                                                <div className='flex justify-center'>
                                                    <Checkbox
                                                        checked={item.HREED_ActiveFlag || false}
                                                        onCheckedChange={(checked) => updateArrear(index, 'HREED_ActiveFlag', checked)}
                                                    />
                                                </div>
                                            </TableCell>
                                            <TableCell className='text-center font-medium'>{index + 1}</TableCell>
                                            <TableCell className='font-medium text-left px-4 whitespace-nowrap'>
                                                {item.HRMED_Name || item.hrmeD_Name || (item as any).value || (item as any).Value || ''}
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='text'
                                                    readOnly
                                                    className='h-8 w-20 text-center mx-auto bg-muted/40 cursor-default font-medium'
                                                    value={isAmountType ? '0' : item.hrmeD_Percent || item.localPercentage || item.HREED_Percentage || '0'}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-20 text-center mx-auto'
                                                    value={
                                                        isAmountType
                                                            ? '0'
                                                            : (item.localApplicablePercentage ??
                                                              item.HREED_ApplicablePercentage ??
                                                              item.HREED_Percentage ??
                                                              '0')
                                                    }
                                                    onChange={(e) => updateArrear(index, 'localApplicablePercentage', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validatePercentage(e.target.value);
                                                        updateArrear(index, 'localApplicablePercentage', validated);
                                                    }}
                                                    min={0}
                                                    max={100}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag || isAmountType || !isPercentageType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-center mx-auto'
                                                    value={item.localAmount ?? item.HREED_Amount ?? 0}
                                                    onChange={(e) => updateArrear(index, 'localAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateArrear(index, 'localAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag || isPercentageType}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center'>
                                                <Input
                                                    type='number'
                                                    className='h-8 w-24 text-center mx-auto'
                                                    value={item.localMaxAmount ?? item.HREED_ApplicableMaxValue ?? 0}
                                                    onChange={(e) => updateArrear(index, 'localMaxAmount', e.target.value)}
                                                    onBlur={(e) => {
                                                        const validated = validateAmount(e.target.value);
                                                        updateArrear(index, 'localMaxAmount', validated);
                                                    }}
                                                    min={0}
                                                    max={999999999999999}
                                                    step={0.01}
                                                    disabled={!item.HREED_ActiveFlag}
                                                />
                                            </TableCell>
                                            <TableCell className='text-center text-xs font-medium text-muted-foreground whitespace-nowrap'>
                                                {item.hrmeD_Details}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                    <div className='border-t bg-muted px-4 py-2'>
                        <div className='flex justify-end'>
                            <span className='font-semibold'>Total Arrear: ₹{totalArrear.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}
            {/* Net Salary */}
            <div className='rounded-md border-2 border-muted bg-muted/50 p-4'>
                <div className='flex justify-center'>
                    <span className='font-bold text-xl'>Net Salary: ₹{netSalary.toFixed(2)}</span>
                </div>
            </div>
            {/* Action Buttons */}
            {!hideSaveButton && (
                <div className='flex w-full items-center justify-center gap-3 pt-4'>
                    {/* <Button variant='outline' type='button'>
                        PREVIOUS
                    </Button> */}
                    <Button type='button' variant='default' onClick={handleSave} disabled={isSaving} className='w-fit'>
                        {isSaving ? 'SAVING...' : 'SUBMIT SALARY INFO'}
                    </Button>
                    {/* <Button variant='outline' type='button'>
                        CLEAR
                    </Button> */}
                </div>
            )}
        </div>
    );
}
