// States
export const STATES = ['OH', 'NJ', 'MS'];

// Election Selections
export const ELECTIONS = ['Presidential 2016', 'House of Representatives 2016', 'House of Representatives 2018'];
export const ELECTIONS_ENUM = ['PRESIDENTIAL_2016', 'CONGRESSIONAL_2016', 'CONGRESSIONAL_2018'];

// Leaftlet center
export const MAP_CENTER = [39, -65];

// Layer colors
export const COLORS = ['#9AC7F5', '#26B1A0', '#1B88CC', '#7BBCDF','#95DBB2', '#017E90', '#C9DB84', '#D7C2AA'];

export const PARTIES = [
    'Democratic',
    'Republican'
];
export const PARTIES_ENUM = ['DEMOCRAT', 'REPUBLICAN'];

// Layer zoom level to show districts and precincts
export const DP_ZOOM_LEVEL = 5

export const RACE_GROUPS = ['White', 'Asian', 'Black or African American', 'American Indian and Alaska Native', 
                            'Native Hawaiian and Other Pacific Islander', 'Other Race'];

export const RACE_ENUM = ["NH_WHITE", "NH_ASIAN", "NH_BLACK", "NH_AMIN", "NH_NHPI", "NH_OTHER"];

export const FAKE_DEMOGRAPHIC = [7536433, 1324144, 1234124, 213423, 657555, 567567, 657567, 567567];

export const FAKE_ELECTION = [12362, 13515];//, 7877, 4568];

export const ERROR_HEADER = ["Enclosed Precincts", "Overlapping Precincts", "Potential Ghost Precincts", 
                            "Gaps in Precinct Coverage", "Multi-polygon Precincts", "Anamalous Demographic Data", "Anamalous Election Data"];

export const ERROR_ENUM = ["ENCLOSED_PRECINCT", "OVERLAPPING_PRECINCT", "GHOST_PRECINCT", "PRECINCT_GAP", 
                            "MULTIPOLYGON_PRECINCT", "ANOMALOUS_DEMOGRAPHIC_DATA", "ANOMALOUS_ELECTION_DATA"];

export const ERROR_HINTS = [
    "The precincts are nested. It can be fixed by combining the precincts. "
    + "Choose 'Combine Precincts' button under 'Edit' Dropdown. Note that only neighbor "
    + "precincts can be combines; choose 'Add Precinct Neighbor' button under 'Edit' Dropdown "
    + "to add a neighbor.",

    "The precinct boundaries overlapped. It can be fixed by redrawing the precinct boundaries. "
    + "Choose 'Edit Precinct Boundary' button under 'Edit' Dropdown.",

    "The precinct boundary is not closed. It can be fixed by redrawing the precinct boundary. "
    + "Choose 'Edit Precinct Boundary' button under 'Edit' Dropdown.",

    "The precinct is a potential ghost precinct generated to cover the gaps. "
    + "Choose 'Confirm Ghost Precinct' button under 'Edit' Dropdown to confirm that it is a ghost precinct.",

    "The precinct is a multi-polygon. It can be fixed by spliting the multi-polygon into polygons. "
    + "Choose 'Split MultiPolygon to Polygon' button under 'Edit' Dropdown.",

    "The precinct's data is incorrect. It can be fixed by editing the precinct's election or demographic data."
];
