'use server';

import { api } from '@/lib/apiService';

export async function getInitialData() {
    try {
        const response = await api.get<any>('college', `/CollegeStudentAdmission/Getdetails`);

        if (response && response.data) {
            const data = response.data;
            const firstStudent = data.studentList && data.studentList.length > 0 ? data.studentList[0] : {};

            for (const key in firstStudent) {
                if (data[key] === null || data[key] === undefined) {
                    data[key] = firstStudent[key];
                }
            }
        }

        return response;
    } catch (error) {
        console.error('[Server] getInitialData error:', error);
        return { success: false, message: 'Failed to fetch initial data' } as any;
    }
}

export async function onYearChange(asmaY_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/getCourse?ASMAY_Id=${asmaY_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to update year' } as any;
    }
}

export async function onCourseChange(asmaY_Id: number, amcO_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/getBranch?ASMAY_Id=${asmaY_Id}&AMCO_Id=${amcO_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to update course and fetch branch' } as any;
    }
}

export async function onBranchChange(asmaY_Id: number, amB_Id: number, acaycB_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/getSemester?ASMAY_Id=${asmaY_Id}&AMB_Id=${amB_Id}&ACAYCB_Id=${acaycB_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to update branch' } as any;
    }
}

export async function getCasteByCategory(imcC_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/getCaste?IMCC_Id=${imcC_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch castes' } as any;
    }
}

export async function getQuotaCategory(acQ_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/getQuotaCategory?ACQ_Id=${acQ_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch quota categories' } as any;
    }
}

export async function saveFirstTab(data: any) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/saveStudentDetails`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save student details' } as any;
    }
}

export async function saveAddressDetails(data: any) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/save_address`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save address details' } as any;
    }
}

export async function saveParentsDetails(data: any) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/saveParentsDetails`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save parents details' } as any;
    }
}

export async function onSelectGetStateApi(ivrmmC_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/getdpstate?IVRMMC_Id=${ivrmmC_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch states' } as any;
    }
}

export async function saveOthersDetails(data: any) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/saveOthersDetails`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save others details' } as any;
    }
}

export async function checkDuplicate(params: any) {
    try {
        const queryParams = new URLSearchParams(params).toString();
        return await api.post<any>('college', `/CollegeStudentAdmission/check_duplicate?${queryParams}`);
    } catch (error) {
        return { success: false, message: 'Failed to check duplicates' } as any;
    }
}

export async function getCompExamName(params: any) {
    try {
        const queryParams = new URLSearchParams();
        if (params.tempidlist) queryParams.append('tempidlist', JSON.stringify(params.tempidlist));
        if (params.subflg) queryParams.append('subflg', params.subflg.toString());
        if (params.AMCEXMSUB_Id) queryParams.append('AMCEXMSUB_Id', params.AMCEXMSUB_Id.toString());
        if (params.AMCEXM_Id) queryParams.append('AMCEXM_Id', params.AMCEXM_Id.toString());

        return await api.post<any>('college', `/CollegeStudentAdmission/compExamName?${queryParams.toString()}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch competitive exam details' } as any;
    }
}
export async function deleteEntry(amcsT_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/DeleteEntry?AMCST_Id=${amcsT_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to delete entry' } as any;
    }
}

export async function getEditEntry(amcsT_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/Edit?AMCST_Id=${amcsT_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch edit entry' } as any;
    }
}

export async function getViewStudentProfile(amcsT_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/ViewStudentProfile?AMCST_Id=${amcsT_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch student profile' } as any;
    }
}

export async function getStateByCountryName(ivrmmC_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/StateByCountryName?IVRMMC_Id=${ivrmmC_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch states by country name' } as any;
    }
}

export async function checkBiometricCode(amcsT_Id: number, biometricId: string) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/checkbiometriccode?AMCST_Id=${amcsT_Id}&AMCST_BiometricId=${biometricId}`);
    } catch (error) {
        return { success: false, message: 'Failed to check biometric code' } as any;
    }
}

export async function checkRFCardDuplicate(amcsT_Id: number, rfCardNo: string) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/checkrfcardduplicate?AMCST_Id=${amcsT_Id}&AMCST_RFCardNo=${rfCardNo}`);
    } catch (error) {
        return { success: false, message: 'Failed to check RF card duplicate' } as any;
    }
}

export async function saveDocuments(data: any) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/saveDocuments`, data);
    } catch (error) {
        return { success: false, message: 'Failed to save documents' } as any;
    }
}

export async function searchByColumn(data: { searchColumn: string; enteredData: string; ASMAY_Id: number }) {
    try {
        // Map asmaY_Id to ASMAY_Id to handle case-sensitivity issues if any
        const payload = {
            searchColumn: data.searchColumn,
            enteredData: data.enteredData,
            ASMAY_Id: data.ASMAY_Id
        };
        return await api.post<any>('college', `/CollegeStudentAdmission/SearchByColumn`, payload);
    } catch (error) {
        return { success: false, message: 'Failed to search students' } as any;
    }
}

export async function getPrintData(amcsT_Id: number) {
    try {
        return await api.post<any>('college', `/CollegeStudentAdmission/getprintdata?AMCST_Id=${amcsT_Id}`);
    } catch (error) {
        return { success: false, message: 'Failed to fetch print data' } as any;
    }
}
