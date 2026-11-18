// export const ROLES = {
//     SUPER_ADMIN: 'SUPER_ADMIN',
//     CHAIRMAN: 'CHAIRMAN',
//     HR_ADMIN: 'HR_ADMIN',
//     GENERAL_STAFF: 'GENERAL_STAFF',
//     ADMIN: 'ADMIN',
//     STAFF: 'STAFF',
//     ONLINE_PREADMISSION_USER: 'ONLINEPREADMISSIONUSER',
//      STUDENT: 'STUDENT'
// } as const;

// export type Role = (typeof ROLES)[keyof typeof ROLES];
export const ROLES = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    CHAIRMAN: 'CHAIRMAN',
    HR_ADMIN: 'HR_ADMIN',
    GENERAL_STAFF: 'GENERAL_STAFF',
    ADMIN: 'ADMIN',
    STAFF: 'STAFF',
    ONLINE_PREADMISSION_USER: 'ONLINEPREADMISSIONUSER',
    STUDENT: 'STUDENT'
};

export type Role = (typeof ROLES)[keyof typeof ROLES];