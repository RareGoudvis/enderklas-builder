export interface LeafExercise {
    id: string;
    label: string;
    typeId: string;
    defaultConstraints?: Record<string, unknown>;
    placeholder?: boolean;
}

export interface ExerciseType {
    id: string;
    label: string;
    // Leaf: has typeId, no children
    typeId?: string;
    defaultConstraints?: Record<string, unknown>;
    // Accordion: has children, no typeId
    children?: LeafExercise[];
    placeholder?: boolean;
}

export interface Subdomain {
    id: string;
    label: string;
    types: ExerciseType[];
    placeholder?: boolean;
}

export interface Domain {
    id: string;
    label: string;
    accentVar: string;
    subdomains: Subdomain[];
}

// ── placeholder helpers ──────────────────────────────────────────────────────
const ph = (id: string, label: string): ExerciseType => ({ id, label, placeholder: true });
const phLeaf = (id: string, label: string): LeafExercise => ({ id, label, typeId: '__placeholder__', placeholder: true });
const phAcc = (id: string, label: string, children: LeafExercise[]): ExerciseType => ({
    id, label, placeholder: true, children,
});

export const APP_STRUCTURE: Domain[] = [
    {
        id: 'getallenkennis',
        label: 'Getallenkennis',
        accentVar: '--accent-getallenkennis',
        subdomains: [
            {
                id: 'getalbegrip',
                label: 'Getalbegrip',
                placeholder: true,
                types: [
                    ph('getalbegrip-tekenen-noteren', 'Tekenen / noteren (MAB)'),
                    phAcc('getalbegrip-splitsen', 'Splitsen', [
                        phLeaf('getalbegrip-splitsen-nat', 'Natuurlijke getallen'),
                        phLeaf('getalbegrip-splitsen-dec', 'Decimale getallen'),
                    ]),
                    phAcc('getalbegrip-ordenen', 'Ordenen', [
                        phLeaf('getalbegrip-ordenen-nat', 'Natuurlijke getallen'),
                        phLeaf('getalbegrip-ordenen-dec', 'Decimale getallen'),
                        phLeaf('getalbegrip-ordenen-rat', 'Rationale getallen'),
                        phLeaf('getalbegrip-ordenen-geh', 'Gehele getallen'),
                    ]),
                    phAcc('getalbegrip-getallenassen', 'Getallenassen', [
                        phLeaf('getalbegrip-getallenassen-nat', 'Natuurlijke getallen'),
                        phLeaf('getalbegrip-getallenassen-dec', 'Decimale getallen'),
                        phLeaf('getalbegrip-getallenassen-rat', 'Rationale getallen'),
                        phLeaf('getalbegrip-getallenassen-geh', 'Gehele getallen'),
                    ]),
                    ph('getalbegrip-functie', 'Functie van getallen'),
                ],
            },
            {
                id: 'afronden',
                label: 'Afronden',
                placeholder: true,
                types: [
                    ph('afronden-nat', 'Natuurlijke getallen'),
                    ph('afronden-dec', 'Decimale getallen'),
                ],
            },
            {
                id: 'patronen',
                label: 'Patronen',
                placeholder: true,
                types: [
                    ph('patronen-nat', 'Natuurlijke getallen'),
                    ph('patronen-dec', 'Decimale getallen'),
                ],
            },
            {
                id: 'veelvouden-delers',
                label: 'Veelvouden en delers',
                placeholder: true,
                types: [ph('veelvouden-delers-item', 'Veelvouden en delers')],
            },
            {
                id: 'deelbaarheid',
                label: 'Deelbaarheid',
                placeholder: true,
                types: [ph('deelbaarheid-item', 'Deelbaarheid')],
            },
            {
                id: 'romeinse-cijfers',
                label: 'Romeinse cijfers',
                placeholder: true,
                types: [ph('romeinse-cijfers-item', 'Romeinse cijfers')],
            },
            {
                id: 'procenten',
                label: 'Procenten',
                placeholder: true,
                types: [ph('procenten-item', 'Procenten')],
            },
            {
                id: 'breuken',
                label: 'Breuken',
                types: [
                    { id: 'breuken-kleuren', label: 'Breuken kleuren', typeId: 'breuken', defaultConstraints: { subType: 'kleuren' } },
                    { id: 'breuken-herkennen', label: 'Breuken herkennen', typeId: 'breuken', defaultConstraints: { subType: 'herkennen' } },
                    { id: 'breuken-hoeveelheid', label: 'Breuk van een hoeveelheid', typeId: 'breuken', defaultConstraints: { subType: 'hoeveelheid' } },
                    { id: 'breuken-lijnstuk', label: 'Breuk van een lijnstuk', typeId: 'breuken', defaultConstraints: { subType: 'lijnstuk' } },
                    { id: 'breuken-veelhoek', label: 'Breuk van een veelhoek', typeId: 'breuken', defaultConstraints: { subType: 'veelhoek' } },
                    ph('breuken-rangschikken', 'Breuken rangschikken'),
                ],
            },
            {
                id: 'gehele-getallen',
                label: 'Gehele getallen',
                placeholder: true,
                types: [ph('gehele-getallen-item', 'Gehele getallen')],
            },
        ],
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
                    {
                        id: 'hr-std-optellen',
                        label: 'Optellen',
                        children: [
                            { id: 'hr-std-optellen-nat', label: 'Natuurlijke getallen', typeId: 'hr-std-optellen', defaultConstraints: { numberType: 'natural' } },
                            { id: 'hr-std-optellen-dec', label: 'Decimale getallen', typeId: 'hr-std-optellen', defaultConstraints: { numberType: 'decimal' } },
                            { id: 'hr-std-optellen-rat', label: 'Rationale getallen', typeId: 'hr-std-optellen', defaultConstraints: { numberType: 'rational' } },
                        ],
                    },
                    {
                        id: 'hr-std-aftrekken',
                        label: 'Aftrekken',
                        children: [
                            { id: 'hr-std-aftrekken-nat', label: 'Natuurlijke getallen', typeId: 'hr-std-aftrekken', defaultConstraints: { numberType: 'natural' } },
                            { id: 'hr-std-aftrekken-dec', label: 'Decimale getallen', typeId: 'hr-std-aftrekken', defaultConstraints: { numberType: 'decimal' } },
                            { id: 'hr-std-aftrekken-rat', label: 'Rationale getallen', typeId: 'hr-std-aftrekken', defaultConstraints: { numberType: 'rational' } },
                        ],
                    },
                    {
                        id: 'hr-std-vermenigvuldigen',
                        label: 'Vermenigvuldigen',
                        children: [
                            { id: 'hr-std-vermenigvuldigen-nat', label: 'Natuurlijke getallen', typeId: 'hr-std-vermenigvuldigen', defaultConstraints: { numberType: 'natural' } },
                            { id: 'hr-std-vermenigvuldigen-dec', label: 'Decimale getallen', typeId: 'hr-std-vermenigvuldigen', defaultConstraints: { numberType: 'decimal' } },
                            { id: 'hr-std-vermenigvuldigen-rat', label: 'Rationale getallen', typeId: 'hr-std-vermenigvuldigen', defaultConstraints: { numberType: 'rational' } },
                        ],
                    },
                    {
                        id: 'hr-std-delen',
                        label: 'Delen',
                        children: [
                            { id: 'hr-std-delen-nat', label: 'Natuurlijke getallen', typeId: 'hr-std-delen', defaultConstraints: { numberType: 'natural' } },
                            { id: 'hr-std-delen-dec', label: 'Decimale getallen', typeId: 'hr-std-delen', defaultConstraints: { numberType: 'decimal' } },
                            { id: 'hr-std-delen-rat', label: 'Rationale getallen', typeId: 'hr-std-delen', defaultConstraints: { numberType: 'rational' } },
                        ],
                    },
                ],
            },
            {
                id: 'cijferen',
                label: 'Cijferen',
                placeholder: true,
                types: [
                    phAcc('cijferen-optellen', 'Optellen', [
                        phLeaf('cijferen-optellen-nat', 'Natuurlijke getallen'),
                        phLeaf('cijferen-optellen-dec', 'Decimale getallen'),
                    ]),
                    phAcc('cijferen-aftrekken', 'Aftrekken', [
                        phLeaf('cijferen-aftrekken-nat', 'Natuurlijke getallen'),
                        phLeaf('cijferen-aftrekken-dec', 'Decimale getallen'),
                    ]),
                    phAcc('cijferen-vermenigvuldigen', 'Vermenigvuldigen', [
                        phLeaf('cijferen-vermenigvuldigen-nat', 'Natuurlijke getallen'),
                        phLeaf('cijferen-vermenigvuldigen-dec', 'Decimale getallen'),
                    ]),
                    phAcc('cijferen-delen', 'Delen', [
                        phLeaf('cijferen-delen-nat', 'Natuurlijke getallen'),
                        phLeaf('cijferen-delen-dec', 'Decimale getallen'),
                    ]),
                ],
            },
        ],
    },
    {
        id: 'meten-metend-rekenen',
        label: 'Meten en metend rekenen',
        accentVar: '--accent-metendrekenen',
        subdomains: [
            {
                id: 'kloklezen',
                label: 'Kloklezen',
                types: [
                    { id: 'klok-analoog', label: 'Analoge klok', typeId: 'klok-kloklezen', defaultConstraints: { clockType: 'analoog' } },
                    { id: 'klok-digitaal', label: 'Digitale klok', typeId: 'klok-kloklezen', defaultConstraints: { clockType: 'digitaal' } },
                ],
            },
            {
                id: 'geld',
                label: 'Geld',
                placeholder: true,
                types: [
                    ph('geld-herkennen', 'Herkennen / tekenen'),
                    ph('geld-wisselen', 'Wisselen'),
                    ph('geld-gepast-betalen', 'Gepast betalen'),
                    ph('geld-teruggeven', 'Teruggeven'),
                    phAcc('geld-rekenen', 'Rekenen met geld', [
                        phLeaf('geld-rekenen-korting', 'Korting'),
                        phLeaf('geld-rekenen-intrest', 'Intrest'),
                        phLeaf('geld-rekenen-winst', 'Winst / Verlies'),
                    ]),
                ],
            },
        ],
    },
    {
        id: 'meetkunde',
        label: 'Meetkunde',
        accentVar: '--accent-meetkunde',
        subdomains: [
            {
                id: 'vormleer',
                label: 'Vormleer',
                placeholder: true,
                types: [
                    phAcc('vormleer-punt-lijn', 'Punt / lijn / rechte', [
                        phLeaf('vormleer-punt-lijn-herkennen', 'Herkennen'),
                        phLeaf('vormleer-punt-lijn-tekenen', 'Tekenen'),
                    ]),
                    phAcc('vormleer-hoeken', 'Hoeken', [
                        phLeaf('vormleer-hoeken-herkennen', 'Herkennen'),
                        phLeaf('vormleer-hoeken-tekenen', 'Tekenen'),
                    ]),
                    phAcc('vormleer-vlakke-figuren', 'Vlakke figuren', [
                        phLeaf('vormleer-driehoeken-hoeken', 'Driehoeken (volgens hoeken)'),
                        phLeaf('vormleer-driehoeken-zijden', 'Driehoeken (volgens zijden)'),
                        phLeaf('vormleer-vierhoeken', 'Vierhoeken'),
                    ]),
                ],
            },
        ],
    },
];
