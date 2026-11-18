export interface WizardStep {
    id: number;
    title: string;
    url: string;
    group: string;
    description: string;
}

export const SUPER_ADMIN_WIZARD_STEPS: WizardStep[] = [
    // 1. Master Institution Group
    {
        id: 1,
        title: 'Master Institution',
        url: '/SuperAdmin/super-admin-module/institution/master-institution',
        group: 'Master Institution',
        description: 'Manage Master Institution details'
    },
    {
        id: 2,
        title: 'Institution Subscription',
        url: '/SuperAdmin/super-admin-module/institution/institution-subscription',
        group: 'Master Institution',
        description: 'Manage Institution Subscriptions'
    },
    {
        id: 3,
        title: 'Auto Mapping',
        url: '/SuperAdmin/super-admin-module/institution/auto-mapping',
        group: 'Master Institution',
        description: 'Manage Institution Auto Mapping'
    },

    // 2. General Setting Wizard Group
    {
        id: 4,
        title: 'General Setting Wizard',
        url: '/SuperAdmin/super-admin-module/general-setting/wizard',
        group: 'General Setting',
        description: 'Initial configuration setup wizard'
    },
    {
        id: 5,
        title: 'Master Module',
        url: '/SuperAdmin/super-admin-module/general-setting/module',
        group: 'General Setting',
        description: 'Manage Master Modules'
    },
    {
        id: 6,
        title: 'Master Pages',
        url: '/SuperAdmin/super-admin-module/general-setting/master-page',
        group: 'General Setting',
        description: 'Manage Master Pages'
    },
    {
        id: 7,
        title: 'Master Page Mapping',
        url: '/SuperAdmin/super-admin-module/general-setting/page-mapping',
        group: 'General Setting',
        description: 'Map Pages to Modules'
    },
    {
        id: 8,
        title: 'Master Role',
        url: '/SuperAdmin/super-admin-module/general-setting/master-role',
        group: 'General Setting',
        description: 'Manage Master Roles'
    },
    {
        id: 9,
        title: 'Master Role Type',
        url: '/SuperAdmin/super-admin-module/general-setting/master-role-type',
        group: 'General Setting',
        description: 'Manage Master Role Types'
    },
    {
        id: 10,
        title: 'Master Role Privileges',
        url: '/SuperAdmin/super-admin-module/general-setting/privileges',
        group: 'General Setting',
        description: 'Manage Role Privileges and access permissions'
    },
    {
        id: 11,
        title: 'Master Main Menu',
        url: '/SuperAdmin/super-admin-module/general-setting/master-main-menu',
        group: 'General Setting',
        description: 'Manage Master Main Menus'
    },
    {
        id: 12,
        title: 'Master Sub Menu',
        url: '/SuperAdmin/super-admin-module/general-setting/master-sub-menu',
        group: 'General Setting',
        description: 'Manage Master Sub Menus'
    },
    {
        id: 13,
        title: 'Master Menu Page Mapping',
        url: '/SuperAdmin/super-admin-module/general-setting/master-menu-page-mapping',
        group: 'General Setting',
        description: 'Manage Master Menu Page Mapping'
    },
    {
        id: 14,
        title: 'Master School Type',
        url: '/SuperAdmin/super-admin-module/general-setting/master-school-type',
        group: 'General Setting',
        description: 'Manage Master School Types'
    },

    // // 3. Configuration Setting Wizard Group
    // {
    //     id: 15,
    //     title: 'Configuration Setting Wizard',
    //     url: '/SuperAdmin/super-admin-module/configuration-setting/wizard',
    //     group: 'Configuration Setting',
    //     description: 'Configuration Setting Wizard overview and setup'
    // },
    {
        id: 16,
        title: 'Master Institution Role and Module Mapping',
        url: '/SuperAdmin/super-admin-module/configuration-setting/institution-module-page',
        group: 'Configuration Setting',
        description: 'Master Institution Role and Module Mapping'
    },
    {
        id: 17,
        title: 'Institute Main Menu',
        url: '/SuperAdmin/super-admin-module/configuration-setting/master-main-menu-ins',
        group: 'Configuration Setting',
        description: 'Master Main Menu Institution Mapping'
    },
    {
        id: 18,
        title: 'Institute Sub Menu',
        url: '/SuperAdmin/super-admin-module/configuration-setting/master-sub-menu-ins',
        group: 'Configuration Setting',
        description: 'Master Sub Menu Institution Mapping'
    },
    {
        id: 19,
        title: 'Master Menu Page Mapping Institutionwise',
        url: '/SuperAdmin/super-admin-module/configuration-setting/master-menu-page-mapping-institutionwise',
        group: 'Configuration Setting',
        description: 'Master Menu Page Mapping Institutionwise'
    },
    // {
    //     id: 20,
    //     title: 'Mobile App Master Pages',
    //     url: '/SuperAdmin/super-admin-module/configuration-setting/mobilemasterpage',
    //     group: 'Mobile Configuration',
    //     description: 'Mobile App Master Pages configuration'
    // },
    // {
    //     id: 21,
    //     title: 'Mobile APP Master Role Privileges',
    //     url: '/SuperAdmin/super-admin-module/configuration-setting/mobileroleprivileges',
    //     group: 'Mobile Configuration',
    //     description: 'Mobile App Master Role Privileges'
    // },

    // 4. User Creation Group
    {
        id: 22,
        title: 'Institution Staff User Creation',
        url: '/SuperAdmin/super-admin-module/user-creation/staff-user-creation',
        group: 'User Creation',
        description: 'Staff User Creation and role mapping'
    }
];

export function findWizardStep(pathname: string | null): {
    step: WizardStep | null;
    index: number;
    prevStep: WizardStep | null;
    nextStep: WizardStep | null;
    totalSteps: number;
} {
    if (!pathname) {
        return {
            step: null,
            index: -1,
            prevStep: null,
            nextStep: null,
            totalSteps: SUPER_ADMIN_WIZARD_STEPS.length
        };
    }

    const cleanPath = pathname.toLowerCase().replace(/\/$/, '');
    const index = SUPER_ADMIN_WIZARD_STEPS.findIndex(
        (s) => s.url.toLowerCase() === cleanPath
    );

    if (index === -1) {
        return {
            step: null,
            index: -1,
            prevStep: null,
            nextStep: null,
            totalSteps: SUPER_ADMIN_WIZARD_STEPS.length
        };
    }

    return {
        step: SUPER_ADMIN_WIZARD_STEPS[index],
        index,
        prevStep: index > 0 ? SUPER_ADMIN_WIZARD_STEPS[index - 1] : null,
        nextStep: index < SUPER_ADMIN_WIZARD_STEPS.length - 1 ? SUPER_ADMIN_WIZARD_STEPS[index + 1] : null,
        totalSteps: SUPER_ADMIN_WIZARD_STEPS.length
    };
}
