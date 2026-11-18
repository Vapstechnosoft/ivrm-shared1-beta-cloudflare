'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    getAdminUserList,
    getCategoryDropdownByInstitution,
    getInstitutionDropdown,
    getInstitutionOnChangeOfTrust,
    getMasterPageListGridOnChangeOfModule,
    getMasterPageListGridOnChangeOfStaff,
    getMobileAppMasterPageListOnChangeOfStaff,
    getModuleDropdownByInstitution,
    getMultipleStaffUsers,
    getRoleTypeDropdown,
    getSavedListGridOnChangeOfStaff,
    getSavedMobileAppPageListOnChangeOfStaff,
    getStaffData,
    getStaffDropdownByInstitution,
    getStaffUserCreationOnload,
    getTrustDropdown,
    getUsernameOnStaffSelection,
    saveStaffUser,
    sendOTPSms,
    updateUsername,
    verifyOTP
} from '@/server/super-admin/user-creation/staff-user-creation';
import type { ApiSearchparams } from '@/types';
import type {
    CategoryDTO,
    EmployeeListDTO,
    InstitutionDTO,
    MobilePageDTO,
    ModuleDTO,
    PageDTO,
    RoleTypeDTO,
    SavedMobilePageDTO,
    SavedPageDTO,
    StaffDTO,
    TrustDTO
} from '@/types/super-admin/user-creation/staff-user-creation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCcw, Save, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ChangeUsernameModal from './_components/change-username-modal';
import PageMappingGrids from './_components/page-mapping-grids';
import SelectionForm from './_components/selection-form';
import UserDetails from './_components/user-details';
import ViewUsernamesModal from './_components/view-usernames-modal';

const formSchema = z.object({
    roleType: z.string().min(1, 'Select Role Type'),
    trust: z.string().optional(),
    institution: z.string().optional(),
    filterData: z.enum(['Single', 'Multiple']).default('Single'),
    adddelte: z.enum(['Add', 'Del']).default('Add'),
    staffId: z.string().optional(),
    userName: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function StaffUserCreationPage() {
    const methods = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roleType: '',
            trust: '',
            institution: '',
            filterData: 'Single',
            adddelte: 'Add',
            staffId: '',
            userName: ''
        }
    });

    const [onloadData, setOnloadData] = useState<any>(null);
    const [institutions, setInstitutions] = useState<InstitutionDTO[]>([]);
    const [roleTypes, setRoleTypes] = useState<RoleTypeDTO[]>([]);
    const [trusts, setTrusts] = useState<TrustDTO[]>([]);
    const [staffList, setStaffList] = useState<StaffDTO[]>([]);
    const [categories, setCategories] = useState<CategoryDTO[]>([]);
    const [modules, setModules] = useState<ModuleDTO[]>([]);
    const [existingUsers, setExistingUsers] = useState<EmployeeListDTO[]>([]);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isUserNameDisabled, setIsUserNameDisabled] = useState(false);

    // Grid states
    const [webPages, setWebPages] = useState<PageDTO[]>([]);
    const [stagedWebPages, setStagedWebPages] = useState<PageDTO[]>([]);
    const [mobilePages, setMobilePages] = useState<MobilePageDTO[]>([]);
    const [savedGrid, setSavedGrid] = useState<SavedPageDTO[]>([]);
    const [savedMobilePages, setSavedMobilePages] = useState<SavedMobilePageDTO[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [machineIp] = useState<string>('127.0.0.1');
    const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
    const [staffMobileNo, setStaffMobileNo] = useState<string>('');
    const [lastSelectedStaffId, setLastSelectedStaffId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isOnloadLoading, setIsOnloadLoading] = useState(false);
    const [isInstitutionsLoading, setIsInstitutionsLoading] = useState(false);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const [isModulesLoading, setIsModulesLoading] = useState(false);
    const [isStaffListLoading, setIsStaffListLoading] = useState(false);
    const [isStaffDataLoading, setIsStaffDataLoading] = useState(false);
    const [isAdminViewRole, setIsAdminViewRole] = useState<any>([]);

    // Pagination states for Master Page List
    const [webPageTotal, setWebPageTotal] = useState(0);
    const [webPageParams, setWebPageParams] = useState<ApiSearchparams>({
        page: 1,
        page_size: 10,
        search_query: '',
        sort_column: '',
        sort_direction: ''
    });
    const [isWebPageLoading, setIsWebPageLoading] = useState(false);
    const [savedGridTotal, setSavedGridTotal] = useState(0);
    const [savedGridParams, setSavedGridParams] = useState<ApiSearchparams>({
        page: 1,
        page_size: 10,
        search_query: '',
        sort_column: '',
        sort_direction: ''
    });
    const [isSavedGridLoading, setIsSavedGridLoading] = useState(false);

    const [mobilePageTotal, setMobilePageTotal] = useState(0);
    const [mobilePageParams, setMobilePageParams] = useState<ApiSearchparams>({
        page: 1,
        page_size: 10,
        search_query: '',
        sort_column: '',
        sort_direction: ''
    });
    const [isMobilePageLoading, setIsMobilePageLoading] = useState(false);

    const [savedMobilePageTotal, setSavedMobilePageTotal] = useState(0);
    const [savedMobilePageParams, setSavedMobilePageParams] = useState<ApiSearchparams>({
        page: 1,
        page_size: 10,
        search_query: '',
        sort_column: '',
        sort_direction: ''
    });
    const [isSavedMobilePageLoading, setIsSavedMobilePageLoading] = useState(false);

    const watchRoleType = methods.watch('roleType');
    const watchTrust = methods.watch('trust');
    const watchInstitution = methods.watch('institution');
    const watchStaffId = methods.watch('staffId');
    const watchFilterData = methods.watch('filterData');
    const watchUserName = methods.watch('userName');

    const isRoleSelected = !!watchRoleType && watchRoleType !== '';
    const selectedRole = roleTypes.find((r) => String(r.ivrmrT_Id) === watchRoleType);
    const roleName = selectedRole?.ivrmrT_Role || '';
    const isAdmin = roleName.toUpperCase() === 'ADMIN' || roleName.toUpperCase() === 'SUPER ADMIN';

    const selectedInstIds = institutions.filter((i) => i.Selected).map((i) => i.mI_Id);
    const selectedInstIdsKey = selectedInstIds.sort().join(',');
    const effectiveMiId = isAdmin
        ? institutions.find((i) => i.Selected)?.mI_Id || 0
        : Number(watchInstitution) || 0;

    const clearGrids = () => {
        setWebPages([]);
        setStagedWebPages([]);
        setMobilePages([]);
        setSavedGrid([]);
        setSavedMobilePages([]);
        setUserId(null);
        setWebPageTotal(0);
        setSavedGridTotal(0);
        setMobilePageTotal(0);
        setSavedMobilePageTotal(0);
        setIsUserNameDisabled(false);
    };

    const handleReload = () => {
        window.location.reload();
    };

    useEffect(() => {
        const fetchOnload = async () => {
            try {
                setIsOnloadLoading(true);
                console.info('🚀 [CLIENT] Initiating fetchOnload...');
                const roleTypeResult = await getRoleTypeDropdown();
                console.info('📦 [CLIENT] Role Type Result:', roleTypeResult);
                if (roleTypeResult.success && roleTypeResult.data) {
                    setRoleTypes(roleTypeResult.data);
                }

                const trustResult = await getTrustDropdown();
                console.info('📦 [CLIENT] Trust Result:', trustResult);
                if (trustResult.success && trustResult.data) {
                    setTrusts(trustResult.data);
                }

                const instResult = await getInstitutionDropdown();
                console.info('📦 [CLIENT] Institution Result:', instResult);
                if (instResult.success && instResult.data) {
                    setInstitutions(instResult.data);
                }

                const result = await getStaffUserCreationOnload(2); // Page ID 2 as per legacy code
                console.info('📦 [CLIENT] Onload Result:', result.success ? 'Success' : 'Failed');
                if (result.success && result.data) {
                    setOnloadData(result.data);
                    // Institutions are now handled by dedicated API above
                    if (result.data.fillstaff) setStaffList(result.data.fillstaff);
                    if (result.data.fillcategory) setCategories(result.data.fillcategory);
                    if (result.data.fillmodule) setModules(result.data.fillmodule);
                }
            } catch (error) {
                console.error('❌ [CLIENT] fetchOnload error:', error);
            } finally {
                setIsOnloadLoading(false);
            }
        };
        fetchOnload();
    }, []);

    const isFirstMount = useRef(true);

    useEffect(() => {
        if (isFirstMount.current) {
            isFirstMount.current = false;
            return;
        }

        const handleTrustChange = async () => {
            const trustId = Number(watchTrust);
            if (watchTrust && trustId > 0) {
                try {
                    setIsInstitutionsLoading(true);
                    console.info(`📡 [CLIENT] Fetching institutions for Trust ID: ${trustId}`);
                    const result = await getInstitutionOnChangeOfTrust(trustId);
                    console.info('📦 [CLIENT] getInstitutionOnChangeOfTrust Result:', result);

                    const rawList = Array.isArray(result)
                        ? result
                        : (result?.data ?? (result?.data ?? []));

                    if (Array.isArray(rawList)) {
                        const formattedInstitutions: InstitutionDTO[] = rawList.map((inst: any) => ({
                            ...inst,
                            mI_Id: inst.mI_Id ?? inst.mi_id ?? inst.MI_Id,
                            mI_Name: inst.mI_Name ?? inst.mi_name ?? inst.MI_Name ?? inst.institutionName,
                            Selected: false
                        }));
                        setInstitutions(formattedInstitutions);
                    } else {
                        setInstitutions([]);
                    }

                    // Reset selected institution and dependent fields
                    methods.setValue('institution', '');
                    methods.setValue('staffId', '');
                    methods.setValue('userName', '');
                    setStaffList([]);
                    setCategories([]);
                    setModules([]);
                    clearGrids();
                } catch (error) {
                    console.error('handleTrustChange error:', error);
                } finally {
                    setIsInstitutionsLoading(false);
                }
            } else if (!watchTrust) {
                // If trust was cleared, reload full institutions list
                try {
                    setIsInstitutionsLoading(true);
                    console.info('📡 [CLIENT] Trust cleared, restoring default institutions list...');
                    const instResult = await getInstitutionDropdown();
                    if (instResult.success && instResult.data) {
                        setInstitutions(instResult.data.map((inst: any) => ({ ...inst, Selected: false })));
                    }
                    methods.setValue('institution', '');
                    methods.setValue('staffId', '');
                    methods.setValue('userName', '');
                    setStaffList([]);
                    setCategories([]);
                    setModules([]);
                    clearGrids();
                } catch (err) {
                    console.error('Failed to reload institutions on trust reset:', err);
                } finally {
                    setIsInstitutionsLoading(false);
                }
            }
        };

        handleTrustChange();
    }, [watchTrust]);

    useEffect(() => {
        const handleInstitutionChange = async () => {
            const selectedRole = roleTypes.find((r) => String(r.ivrmrT_Id) === watchRoleType);
            const roleName = selectedRole?.ivrmrT_Role || '';
            const isStaff = !(roleName.toUpperCase() === 'ADMIN' || roleName.toUpperCase() === 'SUPER ADMIN');

            const hasSelection = isStaff ? !!watchInstitution : institutions.some((i) => i.Selected);

            if (hasSelection && watchRoleType) {
                // Clear dependent states
                methods.setValue('staffId', '');
                methods.setValue('userName', '');

                const primaryMiId = isStaff
                    ? Number(watchInstitution)
                    : institutions.find((i) => i.Selected)?.mI_Id || 0;

                const multipleinsti = isStaff
                    ? []
                    : institutions.filter((i) => i.Selected).map((i) => ({ mi_id: i.mI_Id, MI_Id: i.mI_Id }));

                const payload = {
                    MI_Id: primaryMiId,
                    rolenamess: roleName,
                    IVRMRT_Id: Number(watchRoleType),
                    multipleinsti: multipleinsti,
                    flag: isStaff ? 'S' : 'A'
                };

                // Specifically for Category Dropdown API as requested
                console.info(`📡 [CLIENT] Fetching categories for MI_Id: ${primaryMiId}`);
                setIsCategoriesLoading(true);
                const categoryResult = await getCategoryDropdownByInstitution(primaryMiId);
                if (categoryResult.success && categoryResult.data) {
                    setCategories(categoryResult.data);
                }
                setIsCategoriesLoading(false);

                // Specifically for Module Dropdown API as requested
                console.info(`📡 [CLIENT] Fetching modules for MI_Id: ${primaryMiId}`);
                setIsModulesLoading(true);
                const moduleResult = await getModuleDropdownByInstitution(primaryMiId);
                console.log('moduleResult', moduleResult);
                if (moduleResult.success && moduleResult.data) {
                    setModules(moduleResult.data);
                }
                setIsModulesLoading(false);

                // Specifically for Individual mode, use the dedicated Staff Dropdown API as requested
                if (!isAdmin && watchFilterData === 'Single') {
                    console.info(`📡 [CLIENT] Fetching individual staff for MI_Id: ${primaryMiId}, multipleinsti:`, multipleinsti);
                    setIsStaffListLoading(true);
                    const staffResult = await getStaffDropdownByInstitution(payload);
                    console.log('staffResult', staffResult);
                    if (staffResult.success && staffResult.data) {
                        setStaffList(staffResult?.data?.fillstaff);

                    }
                    setIsStaffListLoading(false);
                }

                // Specifically for Multiple mode, use the dedicated Multiple Staff Users API as requested
                else if (!isAdmin && watchFilterData === 'Multiple') {
                    console.info(`📡 [CLIENT] Fetching multiple staff users for MI_Id: ${primaryMiId}`);
                    setIsStaffListLoading(true);
                    const staffResult = await getMultipleStaffUsers(primaryMiId);
                    if (staffResult.success && staffResult.data) {
                        setStaffList(staffResult.data);
                    }
                    setIsStaffListLoading(false);
                }
            } else {
                setStaffList([]);
                setCategories([]);
                setModules([]);
                setExistingUsers([]);
            }
        };
        handleInstitutionChange();
    }, [watchInstitution, watchRoleType, watchFilterData, selectedInstIdsKey, methods, roleTypes, isAdmin]);

    const handleViewAdminUsernames = async () => {
        if (!effectiveMiId || !watchRoleType) return;

        const selectedRole = roleTypes.find((r) => String(r.ivrmrT_Id) === watchRoleType);
        const roleName = selectedRole?.ivrmrT_Role || '';
        const roleFlag = selectedRole?.flag || '';

        try {
            console.info(`📡 [CLIENT] Fetching Admin Usernames for MI_Id: ${effectiveMiId}`);
            const result = await getAdminUserList(
                effectiveMiId,
                roleFlag || (isAdmin ? 'A' : 'S'),
                Number(watchRoleType),
                roleName
            );

            if (result.success && result.data) {
                console.log('admin user list', result.data);
                setExistingUsers(result.data);
                setIsViewModalOpen(true);
            } else {
                toast.error(result.message || 'No users found.');
            }
        } catch (error) {
            console.error('handleViewAdminUsernames error:', error);
            toast.error('Failed to fetch admin usernames.');
        }
    };

    useEffect(() => {
        const handleStaffChange = async () => {
            if (!isAdmin && watchStaffId && watchFilterData === 'Single' && effectiveMiId) {
                try {
                    setIsStaffDataLoading(true);
                    const payload = {
                        IVRMSTAUL_Id: Number(watchStaffId),
                        MI_Id: effectiveMiId,
                        rolenamess: watchRoleType,
                        IVRMRT_Id: Number(watchRoleType)
                    };
                    const result = await getStaffData(payload);
                    if (result.success && result.data) {
                        if (result.data.singleemployee && result.data.singleemployee.length > 0) {
                            methods.setValue('userName', result.data.singleemployee[0].user_Name);
                        }
                    }

                    // Call the new API to fetch username and handle field state
                    console.info(
                        `📡 [CLIENT] Fetching staff username for StaffId: ${watchStaffId}, MI_Id: ${effectiveMiId}. role_id: ${watchRoleType}`
                    );
                    const usernameResult = await getUsernameOnStaffSelection(
                        Number(watchStaffId),
                        effectiveMiId,
                        Number(watchRoleType)
                    );
                    console.log(' Username Result:', usernameResult);
                    if (usernameResult.success && usernameResult.data && usernameResult.data.length > 0) {
                        const userData = usernameResult.data[0];
                        const staffUsername = userData.user_Name || userData.userName;

                        // Check if we have pre-checked modules in the response
                        if (userData.moduleexistid) {
                            const allModulesData = Array.isArray(userData.moduleexistid)
                                ? userData.moduleexistid
                                : (userData.moduleexistid.$values || []);

                            if (allModulesData.length > 0) {
                                setModules((prevModules) =>
                                    prevModules.map((mod) => {
                                        if (allModulesData.some((m: any) => m.ivrmM_Id === mod.ivrmM_Id)) {
                                            return { ...mod, model: true };
                                        }
                                        return mod;
                                    })
                                );
                            }
                        }

                        if (staffUsername) {
                            methods.setValue('userName', staffUsername);
                            setUserId(userData.userId || userData.ivrmu_Id || null);
                            setStaffMobileNo(userData.hrmE_MobileNo || '');
                            setIsUserNameDisabled(true);

                            // Fetch mapping data for the grids (except Master Page List which is now handled by dedicated API)
                            console.info(`📡 [CLIENT] Fetching mapping data for StaffId: ${watchStaffId}`);
                            await getStaffData({
                                HRME_Id: Number(watchStaffId),
                                MI_Id: effectiveMiId,
                                IVRMRT_Id: Number(watchRoleType)
                            });
                        } else {
                            methods.setValue('userName', '');
                            setIsUserNameDisabled(false);
                            clearGrids();
                        }
                    } else {
                        methods.setValue('userName', '');
                        setIsUserNameDisabled(false);
                        clearGrids();
                    }
                } catch (error) {
                    console.error('handleStaffChange error:', error);
                } finally {
                    setIsStaffDataLoading(false);
                }
            } else {
                setIsUserNameDisabled(false);
            }
        };
        handleStaffChange();
    }, [watchStaffId, watchFilterData, effectiveMiId, watchRoleType, methods]);

    const effectiveStaffId = watchFilterData === 'Single' ? (watchStaffId ? Number(watchStaffId) : null) : lastSelectedStaffId;

    useEffect(() => {
        if (effectiveStaffId && effectiveMiId && watchRoleType) {
            fetchMasterPages(webPageParams);
        }
    }, [webPageParams, effectiveStaffId, effectiveMiId, watchRoleType]);

    useEffect(() => {
        if (effectiveStaffId && effectiveMiId && watchRoleType) {
            fetchMobileMasterPages(mobilePageParams);
        }
    }, [mobilePageParams, effectiveStaffId, effectiveMiId, watchRoleType]);

    useEffect(() => {
        if (effectiveStaffId && effectiveMiId && watchRoleType) {
            fetchSavedMobilePages(savedMobilePageParams);
        }
    }, [savedMobilePageParams, effectiveStaffId, effectiveMiId, watchRoleType]);

    useEffect(() => {
        if (effectiveStaffId && effectiveMiId && watchRoleType) {
            fetchSavedListPages(savedGridParams);
        }
    }, [savedGridParams, effectiveStaffId, effectiveMiId, watchRoleType]);

    const fetchMasterPages = async (params: ApiSearchparams) => {
        if (!effectiveStaffId || !effectiveMiId || !watchRoleType) return;
        try {
            setIsWebPageLoading(true);
            console.info(
                `📡 [CLIENT] Fetching Master Page List for StaffId: ${effectiveStaffId}, MI_Id: ${effectiveMiId}, RoleId: ${watchRoleType}`
            );
            const result = await getMasterPageListGridOnChangeOfStaff(
                effectiveStaffId,
                effectiveMiId,
                Number(watchRoleType),
                params
            );

            console.log('master web pages list', result);

            if (result.success && result.data) {
                const mappedPages = Array.isArray(result.data)
                    ? result.data.map((item: any) => ({
                        pageMappingId: item.pageMappingId || item.ivrmimP_Id || item.ivrmmP_Id || item.ivrmP_Id,
                        pageName: item.pageName || item.pageName,
                        moduleName: item.moduleName || item.ivrmM_ModuleName || item.moduleName || '',
                        institutionName: item.institutionName || item.instituteName || item.institutionName || '',
                        addFlag: Boolean(item.ivrmrP_AddFlag ?? item.addFlag),
                        deleteFlag: Boolean(item.ivrmrP_DeleteFlag ?? item.deleteFlag),
                        updateFlag: Boolean(item.ivrmrP_UpdateFlag ?? item.updateFlag),
                        processFlag: Boolean(item.ivrmrP_ProcessFlag ?? item.processFlag),
                        reportFlag: Boolean(item.ivrmrP_ReportFlag ?? item.reportFlag),
                        checked: stagedWebPages.some((s) => s.pageMappingId === (item.ivrmmP_Id || item.pageMappingId))
                    }))
                    : [];

                setWebPages(mappedPages);
                setWebPageTotal(result.total);
            }
        } catch (error) {
            console.error('fetchMasterPages error:', error);
            toast.error('Failed to fetch web pages.');
        } finally {
            setIsWebPageLoading(false);
        }
    };

    const fetchMobileMasterPages = async (params: ApiSearchparams) => {
        if (!effectiveStaffId || !effectiveMiId || !watchRoleType) return;
        try {
            setIsMobilePageLoading(true);
            console.info(
                `📡 [CLIENT] Fetching Mobile App Master Page List for StaffId: ${effectiveStaffId}, MI_Id: ${effectiveMiId}, RoleId: ${watchRoleType}`
            );
            const result = await getMobileAppMasterPageListOnChangeOfStaff(
                effectiveStaffId,
                effectiveMiId,
                Number(watchRoleType),
                params
            );

            if (result.success && result.data) {
                setMobilePages(result.data.map((p: any) => ({ ...p, checked: false })));
                setMobilePageTotal(result.total);
            }
            console.log(' Mobile Master Pages Result:', result);
        } catch (error) {
            console.error('fetchMobileMasterPages error:', error);
            toast.error('Failed to fetch mobile master pages.');
        } finally {
            setIsMobilePageLoading(false);
        }
    };

    const fetchSavedMobilePages = async (params: ApiSearchparams) => {
        if (!effectiveStaffId || !effectiveMiId || !watchRoleType) return;
        try {
            setIsSavedMobilePageLoading(true);
            console.info(
                `📡 [CLIENT] Fetching Saved Mobile App Page List for StaffId: ${effectiveStaffId}, MI_Id: ${effectiveMiId}, RoleId: ${watchRoleType}`
            );
            const result = await getSavedMobileAppPageListOnChangeOfStaff(
                effectiveStaffId,
                effectiveMiId,
                Number(watchRoleType),
                params
            );

            if (result.success && result.data) {
                setSavedMobilePages(result.data.map((p: any) => ({ ...p, checked: false })));
                setSavedMobilePageTotal(result.total);
            }
        } catch (error) {
            console.error('fetchSavedMobilePages error:', error);
            toast.error('Failed to fetch saved mobile pages.');
        } finally {
            setIsSavedMobilePageLoading(false);
        }
    };

    const fetchSavedListPages = async (params: ApiSearchparams) => {
        if (!effectiveStaffId || !effectiveMiId || !watchRoleType) return;
        try {
            setIsSavedGridLoading(true);
            console.info(
                `📡 [CLIENT] Fetching Saved List for StaffId: ${effectiveStaffId}, MI_Id: ${effectiveMiId}, RoleId: ${watchRoleType}`
            );
            const result = await getSavedListGridOnChangeOfStaff(effectiveStaffId, effectiveMiId, Number(watchRoleType), params);

            if (result.success && result.data) {
                setSavedGrid(result.data.map((p: any) => ({ ...p, checked: false })));
                setSavedGridTotal(result.total);
            }
        } catch (error) {
            console.error('fetchSavedListPages error:', error);
            toast.error('Failed to fetch saved list pages.');
        } finally {
            setIsSavedGridLoading(false);
        }
    };

    const handleSelectAllCategories = () => {
        const allChecked = categories.every((cat) => cat.catid);
        const updated = categories.map((cat) => ({ ...cat, catid: !allChecked }));
        setCategories(updated);
    };

    const handleSelectAllModules = () => {
        const allChecked = modules.every((mod) => mod.model);
        const updated = modules.map((mod) => ({ ...mod, model: !allChecked }));
        handleModulesChange(updated);
    };

    const handleSelectAllStaff = () => {
        const allSelected = staffList.every((s) => s.Selected);
        const updated = staffList.map((s) => ({ ...s, Selected: !allSelected }));
        setStaffList(updated);
    };

    const handleStaffCheckboxChange = (id: number, checked: boolean) => {
        const updated = staffList.map((s) => (s.hrmE_Id === id ? { ...s, Selected: checked } : s));
        setStaffList(updated);
        if (checked) {
            setLastSelectedStaffId(id);
        } else if (lastSelectedStaffId === id) {
            const firstSelected = updated.find((s) => s.Selected);
            setLastSelectedStaffId(firstSelected ? firstSelected.hrmE_Id : null);
        }
    };

    const handleSelectAllInstitutions = () => {
        const allSelected = institutions.length > 0 && institutions.every((i) => i.Selected);
        const updated = institutions.map((i) => ({ ...i, Selected: !allSelected }));
        setInstitutions(updated);
    };

    const handleInstitutionCheckboxChange = (id: number, checked: boolean) => {
        const updated = institutions.map((i) => (i.mI_Id === id ? { ...i, Selected: checked } : i));
        setInstitutions(updated);
    };

    const handleSendOTP = async () => {
        if (!staffMobileNo) {
            // Fallback or alert if mobile missing
            toast.error('Staff mobile number not found for OTP');
            return false;
        }
        const result = await sendOTPSms(staffMobileNo);
        if (!result.success) {
            toast.error(result.message || 'Failed to send OTP');
        }
        return result.success;
    };

    const handleVerifyOTP = async (otp: string) => {
        const result = await verifyOTP(otp);
        if (!result.success) {
            toast.error(result.message || 'OTP verification failed');
        }
        return result.success;
    };

    const handleUsernameChange = async (newUsername: string) => {
        const payload = {
            curuser: methods.getValues('userName'),
            newuser: newUsername
        };
        const result = await updateUsername(payload);
        if (result.success) {
            methods.setValue('userName', newUsername);
            toast.success(result.message || 'Username updated successfully');
            return true;
        }
        toast.error(result.message || 'Failed to update username');
        return false;
    };

    const onSubmit = async (data: FormValues) => {
        console.log('Form Data:', data);

        const selectedCategories = categories.filter((c) => c.catid).map((c) => ({ amC_Id: c.amC_Id }));
        const selectedModules = modules.filter((m) => m.model).map((m) => ({ ivrmM_Id: m.ivrmM_Id }));

        const selectedRole = roleTypes.find((r) => String(r.ivrmrT_Id) === data.roleType);
        const isAdmin = selectedRole?.ivrmrT_Role.toUpperCase() === 'ADMIN' || selectedRole?.ivrmrT_Role.toUpperCase() === 'SUPER ADMIN';

        let selectedInstitutes: any[] = [];
        if (!data.userName || data.userName.trim() === '') {
            toast.error('Please enter User Name');
            return;
        }
        if (isAdmin) {
            selectedInstitutes = institutions.filter((i) => i.Selected).map((i) => ({ mi_id: i.mI_Id, MI_Id: i.mI_Id }));
            if (selectedInstitutes.length === 0) {
                toast.error('Please select at least one institution');
                return;
            }
            
        } else {
            if (!data.institution) {
                toast.error('Please select an institution');
                return;
            }
            if (data.filterData === 'Single' && !data.staffId) {
                toast.error('Please select a staff');
                return;
            }
            selectedInstitutes = [];
        }

        const primaryMiId = isAdmin
            ? (institutions.find((i) => i.Selected)?.mI_Id || 0)
            : Number(data.institution);

        console.log('stagedWebPages:', stagedWebPages);
        console.log('savedGrid:', savedGrid);
        console.log('mobilePages:', mobilePages);
        console.log('savedMobilePages:', savedMobilePages);

        console.log('stagedWebPages in submit:', stagedWebPages);

        const payload = {
            mI_Id: primaryMiId,
            staffId: data.filterData === 'Single' ? Number(data.staffId) : 0,
            userName: data.userName || '',
            mode: data.filterData,
            multipleStaff:
                data.filterData === 'Multiple' ? staffList.filter((s) => s.Selected).map((s) => ({ ivrmstauL_Id: s.hrmE_Id })) : [],
            machineIp: machineIp || '127.0.0.1',
            roleTypeId: Number(data.roleType),
            userId: userId || 0,
            multipleInstitutes: selectedInstitutes,
            multipleinsti: selectedInstitutes,
            tempararyArrayList: selectedModules,
            datasaved: savedGrid
                .filter((p) => !p.checked)
                .map((p) => ({
                    ivrmrP_AddFlag: p.ivrmrP_AddFlag,
                    ivrmrP_DeleteFlag: p.ivrmrP_DeleteFlag,
                    ivrmrP_UpdateFlag: p.ivrmrP_UpdateFlag,
                    ivrmrP_ProcessFlag: p.ivrmrP_ProcessFlag,
                    ivrmrP_ReportFlag: p.ivrmrP_ReportFlag,
                    ivrmstauP_Id: p.ivrmstauP_Id
                })),
            savetmpdata: stagedWebPages.map((p) => ({
                IVRMRP_AddFlag: p.addFlag,
                IVRMRP_DeleteFlag: p.deleteFlag,
                IVRMRP_UpdateFlag: p.updateFlag,
                IVRMRP_ProcessFlag: p.processFlag,
                IVRMRP_ReportFlag: p.reportFlag,
                IVRMIMP_Id: p.pageMappingId,
                ivrmP_Id: 0 // Default or if available
            })),
            deletesaved: savedGrid
                .filter((p) => p.checked)
                .map((p) => ({
                    ivrmstauP_Id: p.ivrmstauP_Id
                })),
            savetmpdatamobile: mobilePages
                .filter((p) => p.checked)
                .map((p) => ({
                    ivrmmaP_Id: p.ivrmmaP_Id,
                    ivrmmaP_AddFlg: p.ivrmmaP_AddFlg,
                    ivrmmaP_UpdateFlg: p.ivrmmaP_UpdateFlg,
                    ivrmmaP_DeleteFlg: p.ivrmmaP_DeleteFlg
                })),
            updatemobilepagespre: savedMobilePages
                .filter((p) => !p.checked)
                .map((p) => ({
                    ivrmumalP_Id: p.ivrmumalP_Id,
                    ivrmumalP_AddFlg: p.ivrmumalP_AddFlg,
                    ivrmumalP_UpdateFlg: p.ivrmumalP_UpdateFlg,
                    ivrmumalP_DeleteFlg: p.ivrmumalP_DeleteFlg
                })),
            deletmobile: savedMobilePages
                .filter((p) => p.checked)
                .map((p) => ({
                    ivrmumalP_Id: p.ivrmumalP_Id,
                    ivrmumalP_AddFlg: p.ivrmumalP_AddFlg,
                    ivrmumalP_UpdateFlg: p.ivrmumalP_UpdateFlg,
                    ivrmumalP_DeleteFlg: p.ivrmumalP_DeleteFlg
                }))
        };

        console.log('payload', payload);

        setIsSaving(true);
        try {
            const result = await saveStaffUser(payload);

            console.log('reponse final ', result);
            if (result.success) {
                toast.success(result.message || 'Saved successfully');
                // Clear form fields
                methods.setValue('userName', '');
                methods.setValue('staffId', '');
                methods.setValue('roleType', '');
                methods.setValue('trust', '');
                methods.setValue('institution', '');

                // Uncheck all staff in Multiple mode
                setStaffList(staffList.map((s) => ({ ...s, Selected: false })));
                setLastSelectedStaffId(null);

                // Clear grids
                clearGrids();
            } else {
                toast.error(result.message || 'Failed to save staff user privileges');
            }
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('An unexpected error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    };

    const handleModulesChange = (updatedModules: ModuleDTO[]) => {
        setModules(updatedModules);

        const checkedModuleIds = updatedModules.filter((mod) => mod.model).map((mod) => mod.ivrmM_Id);

        const uncheckedModuleIds = updatedModules.filter((mod) => !mod.model).map((mod) => mod.ivrmM_Id);

        console.log('Checked module IDs:', checkedModuleIds);
        console.log('Unchecked module IDs:', uncheckedModuleIds);

        getPagesBasedOnModules(checkedModuleIds);
    };

    const getPagesBasedOnModules = async (
        moduleIds: number[],
        username?: string,
        updateModuleCheckboxes: boolean = false
    ) => {
        if (!effectiveMiId || !watchRoleType) return;

        if (moduleIds.length === 0) {
            fetchMasterPages(webPageParams);
            return;
        }

        const selectedInstitutions = isAdmin
            ? institutions.filter((i) => i.Selected).map((i) => i.mI_Id)
            : [Number(watchInstitution)];

        const payloadUserName = username?.trim() || watchUserName || methods.getValues('userName') || '';
        console.info(`📡 [CLIENT] Fetching pages based on modules: ${moduleIds}`);
        try {
            setIsWebPageLoading(true);
            const result = await getMasterPageListGridOnChangeOfModule(
                payloadUserName,
                effectiveMiId,
                Number(watchRoleType),
                moduleIds,
                selectedInstitutions.length > 0 ? selectedInstitutions : [effectiveMiId]
            );

            console.log('onchange result', result);

            if (result.success) {
                const mappedPages = Array.isArray(result.data)
                    ? result.data.map((item: any) => ({
                        pageMappingId: item.pageMappingId || item.ivrmimP_Id || item.IVRMIMP_Id || item.ivrmmP_Id || item.ivrmP_Id,
                        pageName: item.pageName || item.ivrmmP_PageName || item.IVRMMP_PageName || '',
                        moduleName: item.moduleName || item.ivrmm_ModuleName || item.ivrmM_ModuleName || item.IVRMM_ModuleName || '',
                        institutionName: item.institutionName || item.intname || item.instituteName || '',
                        addFlag: Boolean(item.ivrmrP_AddFlag ?? item.IVRMRP_AddFlag ?? item.addFlag),
                        deleteFlag: Boolean(item.ivrmrP_DeleteFlag ?? item.IVRMRP_DeleteFlag ?? item.deleteFlag),
                        updateFlag: Boolean(item.ivrmrP_UpdateFlag ?? item.IVRMRP_UpdateFlag ?? item.updateFlag),
                        processFlag: Boolean(item.ivrmrP_ProcessFlag ?? item.IVRMRP_ProcessFlag ?? item.processFlag),
                        reportFlag: Boolean(item.ivrmrP_ReportFlag ?? item.IVRMRP_ReportFlag ?? item.reportFlag),
                        checked: stagedWebPages.some((s) => s.pageMappingId === (item.ivrmimP_Id || item.IVRMIMP_Id || item.ivrmmP_Id || item.pageMappingId))
                    }))
                    : [];

                setWebPages(mappedPages);
                setWebPageTotal(typeof result.total === 'number' ? result.total : mappedPages.length);

                if (result.savedGrid) {
                    const mappedSavedGrid = (Array.isArray(result.savedGrid) ? result.savedGrid : []).map((p: any) => ({
                        ivrmmP_PageName: p.ivrmmP_PageName || p.IVRMMP_PageName || '',
                        ivrmstauP_Id: p.ivrmstauP_Id ?? p.IVRMSTAUP_Id ?? 0,
                        ivrmrP_AddFlag: Boolean(p.ivrmrP_AddFlag ?? p.IVRMRP_AddFlag),
                        ivrmrP_DeleteFlag: Boolean(p.ivrmrP_DeleteFlag ?? p.IVRMRP_DeleteFlag),
                        ivrmrP_UpdateFlag: Boolean(p.ivrmrP_UpdateFlag ?? p.IVRMRP_UpdateFlag),
                        ivrmrP_ProcessFlag: Boolean(p.ivrmrP_ProcessFlag ?? p.IVRMRP_ProcessFlag),
                        ivrmrP_ReportFlag: Boolean(p.ivrmrP_ReportFlag ?? p.IVRMRP_ReportFlag),
                        ivrmimP_Id: p.ivrmimP_Id ?? p.IVRMIMP_Id ?? 0,
                        checked: false
                    }));
                    setSavedGrid(mappedSavedGrid);
                    setSavedGridTotal(mappedSavedGrid.length);
                }

                // Update module checkboxes based on moduleexistid when requested
                if (updateModuleCheckboxes && result.moduleexistid) {
                    const allModulesData = Array.isArray(result.moduleexistid)
                        ? result.moduleexistid
                        : (result.moduleexistid.$values || []);

                    console.info('📦 [CLIENT] Updating module checkboxes from moduleexistid:', allModulesData);
                    setModules((prevModules) =>
                        prevModules.map((mod) => {
                            const isMatched = allModulesData.some((m: any) => {
                                if (typeof m === 'number' || typeof m === 'string') {
                                    return Number(m) === Number(mod.ivrmM_Id);
                                }
                                const id = m?.ivrmM_Id ?? m?.IVRMM_Id ?? m?.ivrmm_id ?? m?.id;
                                return Number(id) === Number(mod.ivrmM_Id);
                            });
                            return { ...mod, model: isMatched };
                        })
                    );
                }
            } else {
                setWebPages([]);
                setWebPageTotal(0);
            }
        } catch (error) {
            console.error('getPagesBasedOnModules error:', error);
            setWebPages([]);
            setWebPageTotal(0);
        } finally {
            setIsWebPageLoading(false);
        }
    };

    const handleAdminUsernameBlur = async (username: string) => {
        const normalizedUsername = username.trim();
        if (!normalizedUsername) {
            clearGrids();
            return;
        }

        if (!isAdmin || !effectiveMiId || !watchRoleType) return;

        let currentModules = modules;
        if (currentModules.length === 0) {
            const moduleResult = await getModuleDropdownByInstitution(effectiveMiId);
            if (moduleResult.success && moduleResult.data) {
                currentModules = moduleResult.data;
                setModules(currentModules);
            }
        }

        const moduleIds = currentModules.map((module) => module.ivrmM_Id);
        if (moduleIds.length === 0) return;

        clearGrids();
        await getPagesBasedOnModules(moduleIds, normalizedUsername, true);
    };

    const hasInstitutionSelected = isAdmin
        ? institutions.some((i) => i.Selected)
        : !!watchInstitution;

    return (
        <div className='container mx-auto p-6'>
            <Card className='w-full'>
                <CardHeader>
                    <div className='relative flex min-h-[40px] items-center justify-center'>
                        <CardTitle className='text-center font-bold text-2xl text-primary'>Institution Staff User Creation</CardTitle>
                        <div className='absolute right-0'>
                            <Button
                                type='button'
                                variant='outline'
                                size='sm'
                                onClick={handleReload}
                                className='rounded-full border-[#2669bc] text-[#2669bc] hover:bg-blue-50'
                                title='Reload Settings'>
                                <RotateCcw className='mr-2 h-3.5 w-3.5' />
                                Reload
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <FormProvider {...methods}>
                        <form onSubmit={methods.handleSubmit(onSubmit)} className='space-y-8'>
                            <SelectionForm
                                roleTypes={roleTypes.filter((v, i, a) => a.findIndex((t) => t.ivrmrT_Id === v.ivrmrT_Id) === i)}
                                trusts={trusts.filter((v, i, a) => a.findIndex((t) => t.mO_Id === v.mO_Id) === i)}
                                institutions={institutions.filter((v, i, a) => a.findIndex((t) => t.mI_Id === v.mI_Id) === i)}
                                staffList={staffList.filter((v, i, a) => a.findIndex((t) => t.hrmE_Id === v.hrmE_Id) === i)}
                                isOnloadLoading={isOnloadLoading}
                                isStaffListLoading={isStaffListLoading}
                                isStaffDataLoading={isStaffDataLoading}
                                isInstitutionsLoading={isInstitutionsLoading}
                                onStaffCheckboxChange={handleStaffCheckboxChange}
                                onSelectAllStaff={handleSelectAllStaff}
                                onInstitutionCheckboxChange={handleInstitutionCheckboxChange}
                                onSelectAllInstitutions={handleSelectAllInstitutions}
                                onViewUsernames={handleViewAdminUsernames}
                                showViewUsernames={true} // Visibility now handled inside SelectionForm based on isAdmin
                            />

                            {/* UserDetails & Modules (Only visible when role and institution/staff selections are made) */}
                            {isRoleSelected && hasInstitutionSelected && (isAdmin || watchFilterData === 'Multiple' || !!watchStaffId) && (
                                <>
                                    {isStaffDataLoading ? (
                                        <div className='flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white p-12 shadow-sm'>
                                            <div className='flex items-center gap-3 text-primary'>
                                                <Loader2 className='h-6 w-6 animate-spin' />
                                                <span className='font-semibold text-base'>Loading staff details & module permissions...</span>
                                            </div>
                                            <p className='mt-2 text-gray-500 text-xs'>
                                                Please wait while user credentials and module configurations are loaded.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <UserDetails
                                                categories={categories}
                                                onCategoryChange={setCategories}
                                                modules={modules}
                                                onModuleChange={handleModulesChange}
                                                onSelectAllCategories={handleSelectAllCategories}
                                                onSelectAllModules={handleSelectAllModules}
                                                onAdminUsernameBlur={handleAdminUsernameBlur}
                                                isUserNameDisabled={isAdmin ? false : isUserNameDisabled}
                                                onChangeUsernameToggle={() => setIsChangeModalOpen(true)}
                                                isStaffDataLoading={isStaffDataLoading}
                                                isAdmin={isAdmin}
                                            />

                                            {/* Conditional Rendering of Mapping Grids */}
                                            {(isAdmin
                                                ? modules.some((module) => module.model) || webPages.length > 0 || savedGrid.length > 0
                                                : watchFilterData === 'Single'
                                                    ? isUserNameDisabled || modules.some((module) => module.model) || webPages.length > 0 || savedGrid.length > 0
                                                    : staffList.some((s) => s.Selected) || modules.some((module) => module.model) || webPages.length > 0 || savedGrid.length > 0) && (
                                                    <PageMappingGrids
                                                        webPages={webPages}
                                                        onWebPageUpdate={setWebPages}
                                                        stagedWebPages={stagedWebPages}
                                                        onStagedWebPageUpdate={setStagedWebPages}
                                                        webPageTotal={webPageTotal}
                                                        onWebPageParamsChange={setWebPageParams}
                                                        currentWebPageParams={webPageParams}
                                                        isWebPageLoading={isWebPageLoading}
                                                        savedGridTotal={savedGridTotal}
                                                        onSavedGridParamsChange={setSavedGridParams}
                                                        currentSavedGridParams={savedGridParams}
                                                        isSavedGridLoading={isSavedGridLoading}
                                                        mobilePageTotal={mobilePageTotal}
                                                        onMobilePageParamsChange={setMobilePageParams}
                                                        currentMobilePageParams={mobilePageParams}
                                                        isMobilePageLoading={isMobilePageLoading}
                                                        savedMobilePageTotal={savedMobilePageTotal}
                                                        onSavedMobilePageParamsChange={setSavedMobilePageParams}
                                                        currentSavedMobilePageParams={savedMobilePageParams}
                                                        isSavedMobilePageLoading={isSavedMobilePageLoading}
                                                        mobilePages={mobilePages}
                                                        onMobilePageUpdate={setMobilePages}
                                                        savedGrid={savedGrid}
                                                        onSavedGridUpdate={setSavedGrid}
                                                        savedMobilePages={savedMobilePages}
                                                        onSavedMobileUpdate={setSavedMobilePages}
                                                        showInstitution={isAdmin}
                                                    />
                                                )}

                                            <div className='flex justify-center gap-4'>
                                                <Button type='submit' className='px-8 shadow-md' size='lg' disabled={isSaving}>
                                                    {isSaving ? (
                                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                    ) : (
                                                        <Save className='mr-2 h-4 w-4' />
                                                    )}
                                                    {isSaving ? 'Saving...' : 'Save'}
                                                </Button>
                                                <Button
                                                    type='button'
                                                    variant='outline'
                                                    onClick={() => methods.reset()}
                                                    className='px-8'
                                                    size='lg'>
                                                    <X className='mr-2 h-4 w-4' />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </form>
                    </FormProvider>
                </CardContent>
            </Card>

            <ViewUsernamesModal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                users={existingUsers}
                roleName={roleTypes.find((r) => String(r.ivrmrT_Id) === watchRoleType)?.ivrmrT_Role}
            />

            <ChangeUsernameModal
                isOpen={isChangeModalOpen}
                onClose={() => setIsChangeModalOpen(false)}
                currentUsername={methods.getValues('userName') || ''}
                onUsernameChange={handleUsernameChange}
                onSendOTP={handleSendOTP}
                onVerifyOTP={handleVerifyOTP}
            />
        </div>
    );
}
