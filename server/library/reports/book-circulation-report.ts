'use server';

import { api } from '@/lib/apiService';
import { auth } from '@/lib/auth';
import type { IBookCirculationReportInitialData, IBookCirculationReportRequest } from '@/types/library/reports/book-circulation-report';

const FACADE = 'BookCirculationReport';

const extractList = (list: any) => {
    if (!list) return [];
    const actualList = list.data || list;
    if (actualList && typeof actualList === 'object' && '$values' in actualList) {
        return actualList.$values;
    }
    return Array.isArray(actualList) ? actualList : [];
};

export async function getBookCirculationReportInitialData() {
    const session = await auth();
    if (!session?.mi_id) {
        throw new Error('Authentication required');
    }

    const url = `${FACADE}/circulation-getdetails`;

    let response: any;
    let getError = null;
    try {
        response = await api.get<any>('library', url, {
            params: {
                MI_Id: session.mi_id
            }
        });
    } catch (e: any) {
        getError = e?.message || String(e);
        console.warn('[circulation-getdetails] GET failed, attempting POST fallback:', getError);
    }

    let finalData = response?.data?.data || response?.data || response || {};

    if (!response || getError) {
        try {
            const postResponse = await api.post<any>('library', url, {
                MI_Id: session.mi_id
            });
            const postData = postResponse?.data?.data || postResponse?.data || postResponse;
            if (postData) {
                finalData = postData;
            }
        } catch (postErr: any) {
            console.warn('[circulation-getdetails] POST fallback failed:', postErr?.message || String(postErr));
        }
    }

const normalizeLibraryList = (list: any[]) => {
    return list
        .map((lib: any) => {
            if (!lib || typeof lib !== 'object') return null;
            const lmaL_Id = lib.lmaL_Id ?? lib.LMAL_Id ?? lib.lmal_Id ?? lib.lmal_id ?? lib.lmalId ?? lib.id;
            const lmaL_LibraryName =
                lib.lmaL_LibraryName ??
                lib.LMAL_LibraryName ??
                lib.lmal_LibraryName ??
                lib.lmal_libraryname ??
                lib.libraryname ??
                lib.libraryName ??
                lib.name;
            const idNum = Number(lmaL_Id);
            if (!idNum || isNaN(idNum)) return null;
            return {
                ...lib,
                lmaL_Id: idNum,
                lmaL_LibraryName: String(lmaL_LibraryName || `Library ${idNum}`)
            };
        })
        .filter(Boolean);
};

    // Extract lists from circulation-getdetails response
    let finalLibList = extractList(
        finalData.lib_list ||
            finalData.msterliblist1 ||
            finalData.msterliblist ||
            finalData.libraryList ||
            finalData.libList ||
            finalData.library_list ||
            finalData.masterliblist ||
            finalData.masterlibrary ||
            []
    );
    let finalClassList = extractList(
        finalData.classList || finalData.classlist || finalData.msterclasslist || finalData.fillclass || finalData.classlist1 || []
    );
    const finalSectionList = extractList(
        finalData.sectionList ||
            finalData.sectionlist ||
            finalData.mstersectionlist ||
            finalData.fillsection ||
            finalData.sectionlist1 ||
            []
    );

    // Merge or fallback to get-master-library-list if libraries or classes are empty
    if (finalLibList.length === 0 || finalClassList.length === 0) {
        try {
            const masterLibUrl = `/MasterLibrary/get-master-library-list?page=1&page_size=100&sort_column=lmaL_LibraryName&sort_direction=asc&mI_Id=${session.mi_id}`;
            const masterLibRes = await api.get<any>('library', masterLibUrl);
            const mData = masterLibRes?.data || masterLibRes;
            if (mData) {
                if (finalLibList.length === 0) {
                    finalLibList = extractList(
                        mData.list ||
                            mData.librylist ||
                            mData.liballdata ||
                            mData.msterliblist1 ||
                            mData.msterliblist ||
                            mData.libraryList ||
                            mData.lib_list ||
                            mData.libList ||
                            (Array.isArray(mData) ? mData : [])
                    );
                }
                if (finalClassList.length === 0) {
                    finalClassList = extractList(mData.classlist || mData.classList || mData.msterclasslist || []);
                }
            }
        } catch (e: any) {
            console.warn('Failed to fetch master libraries/classes fallback:', e?.message || String(e));
        }
    }

    finalLibList = normalizeLibraryList(finalLibList);

    return {
        lib_list: finalLibList,
        classList: finalClassList,
        sectionList: finalSectionList,
        parentsubjectlist: extractList(finalData.parentsubjectlist || []),
        subsubjectlist: extractList(finalData.subsubjectlist || []),
        booktype: extractList(finalData.booktype || []),
        booktitle: extractList(finalData.booktitle || [])
    } as IBookCirculationReportInitialData;
}

export async function getBookCirculationReportData(data: IBookCirculationReportRequest) {
    try {
        const session = await auth();
        if (!session?.mi_id) {
            throw new Error('Authentication required');
        }

        const type = !data.Type || data.Type.toLowerCase() === 'all' ? 'ALL' : data.Type;
        const agType = !data.AGType || data.AGType.toLowerCase() === 'all' ? 'Student' : data.AGType;
        const trnType = !data.TrnType || data.TrnType.toLowerCase() === 'all' ? 'ALL' : data.TrnType;

        // Default date range is 2025-01-01 to 2025-12-31 as expected by the circulation-Report API when dates are not filtered
        const issueFromDate = data.IssueFromDate && data.IssueFromDate.trim() !== '' ? data.IssueFromDate : '2025-01-01';
        const issueToDate = data.IssueToDate && data.IssueToDate.trim() !== '' ? data.IssueToDate : '2025-12-31';
        const dueFromDate = data.DueFromdate && data.DueFromdate.trim() !== '' ? data.DueFromdate : '2025-01-01';
        const dueToDate = data.DueTodate && data.DueTodate.trim() !== '' ? data.DueTodate : '2025-12-31';

        const lmalId = Number(data.LMAL_Id || 13);
        const bookSummary = 'false';
        const miId = session.mi_id || 13;
        const ivrmulId = session.roleId || (session as any)?.userId || (session as any)?.ivrmuL_Id || 0;
        const lastParam = (data as any)?.param || 'NA';

        // Endpoint: api/BookCirculationReport/circulation-Report/ALL/Student/ALL/2025-01-01/2025-12-31/2025-01-01/2025-12-31/13/false/13/0/NA
        const url = `${FACADE}/circulation-Report/${type}/${agType}/${trnType}/${issueFromDate}/${issueToDate}/${dueFromDate}/${dueToDate}/${lmalId}/${bookSummary}/${miId}/${ivrmulId}/${lastParam}`;

        const payload = {
            Type: type,
            type: type,
            AGType: agType,
            agType: agType,
            TrnType: trnType,
            trnType: trnType,
            IssueFromDate: issueFromDate,
            issueFromDate: issueFromDate,
            IssueToDate: issueToDate,
            issueToDate: issueToDate,
            DueFromdate: dueFromDate,
            dueFromdate: dueFromDate,
            DueTodate: dueToDate,
            dueTodate: dueToDate,
            LMAL_Id: lmalId,
            lmaL_Id: lmalId,
            BookSummary: false,
            bookSummary: false,
            selectedClasslist: data.selectedClasslist || [],
            selectedSectionlist: data.selectedSectionlist || [],
            selectedSubjectlist: data.selectedSubjectlist || [],
            selectedSubSubjectlist: data.selectedSubSubjectlist || [],
            MI_Id: miId,
            mI_Id: miId,
            IVRMUL_Id: ivrmulId,
            ivrmuL_Id: ivrmulId
        };

        console.info(`[BookCirculationReport] Calling endpoint: ${url}`);

        let response: any;
        try {
            response = await api.post<any>('library', url, payload);
        } catch (postErr: any) {
            console.warn(`[BookCirculationReport] Primary POST to ${url} failed, attempting GET fallback:`, postErr?.message || postErr);
            try {
                response = await api.get<any>('library', url);
            } catch {
                try {
                    response = await api.post<any>('library', url, {});
                } catch {
                    throw postErr;
                }
            }
        }

        const responseData = response?.data || response;
        const resObj =
            responseData?.data && typeof responseData.data === 'object' && !Array.isArray(responseData.data)
                ? responseData.data
                : responseData;

        const rawList = extractList(
            resObj?.reportlist ||
                resObj?.reportList ||
                resObj?.gridList ||
                resObj?.gridlist ||
                resObj?.alldata ||
                resObj?.circulationlist ||
                resObj?.circulationList ||
                resObj?.data ||
                resObj
        );

        // Normalize keys to uppercase and handle common variations for all member types
        const normalizedList = rawList.map((item: any) => {
            if (!item || typeof item !== 'object') return item;
            const normalizedItem: any = {};
            for (const key in item) {
                normalizedItem[key.toUpperCase()] = item[key];
            }

            // Shared / Common Fields
            normalizedItem.LMB_BOOKTITLE =
                normalizedItem.LMB_BOOKTITLE ||
                normalizedItem.BOOKTITLE ||
                normalizedItem.BOOK_TITLE ||
                item.lmB_BookTitle ||
                item.bookTitle ||
                item.BookTitle ||
                '';

            normalizedItem.LMBANO_ACCESSIONNO =
                normalizedItem.LMBANO_ACCESSIONNO ||
                normalizedItem.ACCESSIONNO ||
                normalizedItem.ACCESSION_NO ||
                item.lmbanO_AccessionNo ||
                item.accessionNo ||
                item.AccessionNo ||
                '';

            normalizedItem.LBTR_STATUS =
                normalizedItem.LBTR_STATUS || normalizedItem.STATUS || item.lbtR_Status || item.status || item.Status || '';

            normalizedItem.LBTR_ISSUEDDATE =
                normalizedItem.LBTR_ISSUEDDATE ||
                normalizedItem.ISSUEDDATE ||
                normalizedItem.ISSUE_DATE ||
                item.lbtR_IssuedDate ||
                item.issueDate ||
                item.IssueDate ||
                '';

            normalizedItem.LBTR_DUEDATE =
                normalizedItem.LBTR_DUEDATE ||
                normalizedItem.DUEDATE ||
                normalizedItem.DUE_DATE ||
                item.lbtR_DueDate ||
                item.dueDate ||
                item.DueDate ||
                '';

            normalizedItem.LBTR_RETURNEDDATE =
                normalizedItem.LBTR_RETURNEDDATE ||
                normalizedItem.RETURNEDDATE ||
                normalizedItem.RETURN_DATE ||
                item.lbtR_ReturnedDate ||
                item.returnDate ||
                item.ReturnDate ||
                null;

            normalizedItem.LBTR_FINECOLLECTED =
                normalizedItem.LBTR_FINECOLLECTED ?? normalizedItem.FINECOLLECTED ?? item.lbtR_FineCollected ?? item.fineCollected ?? 0;

            normalizedItem.LBTR_TOTALFINE =
                normalizedItem.LBTR_TOTALFINE ?? normalizedItem.TOTALFINE ?? item.lbtR_TotalFine ?? item.totalFine ?? 0;

            normalizedItem.LMB_BOOKTYPE =
                normalizedItem.LMB_BOOKTYPE ||
                normalizedItem.BOOKTYPE ||
                normalizedItem.BOOK_TYPE ||
                item.lmB_BookType ||
                item.bookType ||
                item.BookType ||
                '';

            // Student Fields
            normalizedItem.AMST_ADMNO =
                normalizedItem.AMST_ADMNO ||
                normalizedItem.ADMNO ||
                normalizedItem.ADMISSIONNO ||
                item.amsT_AdmNo ||
                item.admNo ||
                item.AdmNo ||
                item.admissionNo ||
                '';

            normalizedItem.AMST_NAME =
                normalizedItem.AMST_NAME ||
                normalizedItem.STUDENTNAME ||
                normalizedItem.STUDENT_NAME ||
                normalizedItem.AMST_FIRSTNAME ||
                item.amsT_FirstName ||
                item.amsT_Name ||
                item.studentName ||
                item.StudentName ||
                '';

            normalizedItem.ASMCL_CLASSNAME =
                normalizedItem.ASMCL_CLASSNAME ||
                normalizedItem.ASMCL_CLASS_NAME ||
                normalizedItem.CLASSNAME ||
                normalizedItem.CLASS_NAME ||
                item.asmcL_ClassName ||
                item.asmcl_classname ||
                item.className ||
                item.ClassName ||
                '';

            normalizedItem.ASMC_SECTIONNAME =
                normalizedItem.ASMC_SECTIONNAME ||
                normalizedItem.ASMS_SECTIONNAME ||
                normalizedItem.SECTIONNAME ||
                normalizedItem.SECTION_NAME ||
                normalizedItem.ASMC_SECTION_NAME ||
                normalizedItem.ASMS_SECTION_NAME ||
                normalizedItem.MC_SECTIONNAME ||
                item.asmC_SectionName ||
                item.asmS_SectionName ||
                item.asmc_sectionname ||
                item.asms_sectionname ||
                item.sectionName ||
                item.SectionName ||
                '';

            normalizedItem.AMAY_ROLLNO =
                normalizedItem.AMAY_ROLLNO ||
                normalizedItem.ROLLNO ||
                normalizedItem.ROLL_NO ||
                item.amaY_RollNo ||
                item.rollNo ||
                item.RollNo ||
                '';

            normalizedItem.LATEDAYS =
                normalizedItem.LATEDAYS ?? normalizedItem.LATE_DAYS ?? item.lateDays ?? item.LateDays ?? item.latedays ?? 0;

            // Staff Fields
            normalizedItem.EMPNAME =
                normalizedItem.EMPNAME ||
                normalizedItem.STAFFNAME ||
                normalizedItem.STAFF_NAME ||
                item.empName ||
                item.staffName ||
                item.hrmE_EmployeeFirstName ||
                '';

            normalizedItem.HRME_EMPLOYEECODE =
                normalizedItem.HRME_EMPLOYEECODE ||
                normalizedItem.STAFFCODE ||
                normalizedItem.STAFF_CODE ||
                item.hrmE_EmployeeCode ||
                item.employeeCode ||
                item.staffCode ||
                '';

            // Guest Fields
            normalizedItem.LBTR_GUESTNAME =
                normalizedItem.LBTR_GUESTNAME || normalizedItem.GUESTNAME || item.lbtR_GuestName || item.guestName || '';

            normalizedItem.LBTR_GUESTEMAILID =
                normalizedItem.LBTR_GUESTEMAILID ||
                normalizedItem.GUESTEMAILID ||
                normalizedItem.GUEST_EMAIL ||
                item.lbtR_GuestEmailId ||
                item.guestEmail ||
                '';

            normalizedItem.LBTR_GUESTCONTACTNO =
                normalizedItem.LBTR_GUESTCONTACTNO ||
                normalizedItem.GUESTCONTACTNO ||
                normalizedItem.GUEST_CONTACT ||
                item.lbtR_GuestContactNo ||
                item.guestContactNo ||
                '';

            // Department Fields
            normalizedItem.HRMD_DEPARTMENTNAME =
                normalizedItem.HRMD_DEPARTMENTNAME ||
                normalizedItem.DEPARTMENTNAME ||
                normalizedItem.DEPARTMENT_NAME ||
                item.hrmD_DepartmentName ||
                item.departmentName ||
                '';

            return normalizedItem;
        });

        return {
            success: true,
            data: normalizedList
        };
    } catch (error: any) {
        console.error('🔴 [getBookCirculationReportData] Error:', error?.message || error);
        return {
            success: false,
            error: error?.message || String(error)
        };
    }
}
