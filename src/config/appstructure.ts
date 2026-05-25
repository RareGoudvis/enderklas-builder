export interface ExerciseType {
    id: string;
    label: string;
}

export interface Subdomain {
    id: string;
    label: string;
    types: ExerciseType[];
    directAdd?: string; // if set, subdomain label is a direct add button for this typeId
}

export interface Domain {
    id: string;
    label: string;
    accentVar: string; // CSS variable, e.g. '--accent-bewerkingen'
    subdomains: Subdomain[];
}

export const APP_STRUCTURE: Domain[] = [
    {
        id: 'getallenkennis',
        label: 'Getallenkennis',
        accentVar: '--accent-getallenkennis',
        subdomains: [
            { id: 'getallenrijen', label: 'Getallenrijen', types: [] },
            { id: 'breuken', label: 'Breuken', directAdd: 'breuken', types: [] },
        ]
    },
    {
        id: 'bewerkingen',
        label: 'Bewerkingen',
        accentVar: '--accent-bewerkingen',
        subdomains: [
            {
                id: 'hoofdrekenen-standaardprocedure',
                label: 'Hoofdrekenen (standaardprocedure)',
                types: [
                    { id: 'hr-std-optellen', label: 'Optellen' },
                    { id: 'hr-std-aftrekken', label: 'Aftrekken' },
                    { id: 'hr-std-vermenigvuldigen', label: 'Vermenigvuldigen' },
                    { id: 'hr-std-delen', label: 'Delen' },
                ]
            }
        ]
    },
    {
        id: 'metend-rekenen',
        label: 'Metend rekenen',
        accentVar: '--accent-metendrekenen',
        subdomains: [
            {
                id: 'kloklezen',
                label: 'Kloklezen',
                directAdd: 'klok-kloklezen',
                types: []
            }
        ]
    },
    {
        id: 'meetkunde',
        label: 'Meetkunde',
        accentVar: '--accent-meetkunde',
        subdomains: [
            {
                id: 'tekenen-herkennen',
                label: 'Tekenen / Herkennen',
                types: [
                    { id: 'meetkunde-lijnen', label: 'Lijnen, rechten en punten' },
                ]
            }
        ]
    },
];
