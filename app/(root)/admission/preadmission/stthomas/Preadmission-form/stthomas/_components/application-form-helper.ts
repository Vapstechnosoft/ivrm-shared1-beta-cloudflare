import type { IPreadmissionClassDropdown } from '@/types/admission/preadmission/transactions';

export const calculateClassBoundaryDates = (classData: IPreadmissionClassDropdown, cutOffDate: Date) => {
    // Max_date corresponds to Max Age (earliest allowable DOB)
    const maxDate = new Date(cutOffDate);
    maxDate.setFullYear(maxDate.getFullYear() - (classData.asmcL_MaxAgeYear || 0));
    maxDate.setMonth(maxDate.getMonth() - (classData.asmcL_MaxAgeMonth || 0));
    maxDate.setDate(maxDate.getDate() - (classData.asmcL_MaxAgeDays || 0));

    // Min_date corresponds to Min Age (latest allowable DOB)
    const minDate = new Date(cutOffDate);
    minDate.setFullYear(minDate.getFullYear() - (classData.asmcL_MinAgeYear || 0));
    minDate.setMonth(minDate.getMonth() - (classData.asmcL_MinAgeMonth || 0));
    minDate.setDate(minDate.getDate() - (classData.asmcL_MinAgeDays || 0));

    return { maxDate, minDate };
};

export const validateAgeForClass = (
    dob: Date,
    classData: IPreadmissionClassDropdown,
    config: any
): { isValid: boolean; reason?: string } => {
    const activeConfig = Array.isArray(config)
        ? config[0]
        : config && config.$values && Array.isArray(config.$values)
          ? config.$values[0]
          : config;

    if (!activeConfig) {
        return { isValid: true };
    }

    if (!dob || Number.isNaN(new Date(dob).getTime())) {
        return {
            isValid: false,
            reason: 'Invalid date of birth provided'
        };
    }

    const cutOffDate =
        activeConfig.ispaC_ApplCutOffDateFlag === 1 && activeConfig.asmaY_Cut_Of_Date
            ? new Date(activeConfig.asmaY_Cut_Of_Date)
            : new Date();

    const { maxDate, minDate } = calculateClassBoundaryDates(classData, cutOffDate);

    // Normalize dates to midnight for accurate boundary comparison
    const dobZero = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate()).getTime();
    const maxDateZero = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime();
    const minDateZero = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime();

    const minAgeFlag = activeConfig.ispaC_DOBMinAgeFlag ?? 0;
    const maxAgeFlag = activeConfig.ispaC_DOBMaxAgeFlag ?? 0;

    if (maxAgeFlag === 1 && minAgeFlag === 1) {
        if (dobZero < maxDateZero || dobZero > minDateZero) {
            return {
                isValid: false,
                reason: 'Child Date of Birth should be between Maximum and Minimum Date for Respective Class'
            };
        }
    } else if (maxAgeFlag === 1) {
        if (dobZero < maxDateZero) {
            return {
                isValid: false,
                reason: 'Child Date of Birth should be on or after Maximum Date of Birth'
            };
        }
    } else if (minAgeFlag === 1) {
        if (dobZero > minDateZero) {
            return {
                isValid: false,
                reason: 'Child Date of Birth should be on or before Minimum Date of Birth'
            };
        }
    }

    return { isValid: true };
};
