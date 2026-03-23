import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, getDocs, deleteDoc, query, orderBy, getDoc, where } from 'firebase/firestore';

// Helper function to find the greatest common divisor for fraction reduction
const gcd = (a, b) => {
    if (!b) return a;
    return gcd(b, a % b);
};

// Helper function to convert mm to a fractional inch string
const mmToInchesFractionalString = (mm, denominator = 8) => {
    if (!mm || mm === 0) return '0"';
    const inchesDecimal = mm / 25.4;
    const wholeInches = Math.floor(inchesDecimal);
    const fractionalPart = inchesDecimal - wholeInches;

    if (fractionalPart < 0.001) {
        return `${wholeInches}"`;
    }

    let numerator = Math.round(fractionalPart * denominator);
    
    if (numerator === 0) {
        if (wholeInches === 0) return '0"';
        return `${wholeInches}"`;
    }
    
    if (numerator === denominator) {
        return `${wholeInches + 1}"`;
    }

    const divisor = gcd(numerator, denominator);
    const reducedNumerator = numerator / divisor;
    const reducedDenominator = denominator / divisor;

    if (wholeInches === 0) {
        return `${reducedNumerator}/${reducedDenominator}"`;
    }

    return `${wholeInches} ${reducedNumerator}/${reducedDenominator}"`;
};

// Helper function to format window name for Purchase Order
const formatWindowNameForPO = (name) => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1 && !isNaN(parts[parts.length - 1])) {
        const prefix = parts[0][0];
        const number = parts[parts.length - 1];
        return `${prefix}${number}`;
    }
    return name; // fallback
};


// GlassNestingDiagram Component - Renders the 2D nesting layout
const GlassNestingDiagram = ({ packingResult, sheetWidth, sheetHeight }) => {
    if (!packingResult || packingResult.length === 0) {
        return <p className="text-sm text-gray-500">No nesting diagram to display.</p>;
    }

    const containerWidth = 300; // Max width for the diagram container
    const scale = containerWidth / sheetWidth;
    const containerHeight = sheetHeight * scale;

    return (
        <div className="mt-4 space-y-4">
            {packingResult.map((sheet, index) => (
                <div key={index} className="p-2 border rounded-lg bg-gray-50">
                    <h6 className="text-sm font-semibold mb-2 text-gray-700">Sheet {index + 1}</h6>
                    <svg width={containerWidth} height={containerHeight} viewBox={`0 0 ${sheetWidth} ${sheetHeight}`} className="border bg-white shadow-inner">
                        {/* Sheet Boundary */}
                        <rect x="0" y="0" width={sheetWidth} height={sheetHeight} fill="#f0f9ff" stroke="#a3a3a3" strokeWidth="2" />
                        
                        {/* Placed Panes */}
                        {sheet.panes.map((pane, paneIndex) => (
                            <g key={paneIndex}>
                                <rect
                                    x={pane.x}
                                    y={pane.y}
                                    width={pane.width}
                                    height={pane.height}
                                    fill="rgba(59, 130, 246, 0.5)"
                                    stroke="#1d4ed8"
                                    strokeWidth="2"
                                />
                                <text
                                    x={pane.x + pane.width / 2}
                                    y={pane.y + pane.height / 2}
                                    fontSize={Math.min(pane.width, pane.height) * 0.15}
                                    fill="#1e3a8a"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    className="font-sans font-semibold"
                                >
                                    <tspan x={pane.x + pane.width / 2} dy="-1.2em">{formatWindowNameForPO(pane.windowName)}</tspan>
                                    <tspan x={pane.x + pane.width / 2} dy="1.2em">{`${pane.originalWidth.toFixed(0)}mm (${mmToInchesFractionalString(pane.originalWidth)})`}</tspan>
                                    <tspan x={pane.x + pane.width / 2} dy="1.2em">{`${pane.originalHeight.toFixed(0)}mm (${mmToInchesFractionalString(pane.originalHeight)})`}</tspan>
                                </text>
                            </g>
                        ))}
                    </svg>
                </div>
            ))}
        </div>
    );
};


// WindowDisplay Component - Visual representation of the window
const WindowDisplay = ({ width, height, numTracks }) => {
    const maxWidth = 180; // Max display width in pixels for the inner window frame
    const maxHeight = 120; // Max display height in pixels for the inner window frame

    // Calculate aspect ratio and scale factor for the inner window frame
    let innerDisplayWidth = 0;
    let innerDisplayHeight = 0;

    if (width && height) {
        const aspectRatio = width / height;

        if (width > height) {
            innerDisplayWidth = maxWidth;
            innerDisplayHeight = maxWidth / aspectRatio;
            if (innerDisplayHeight > maxHeight) {
                innerDisplayHeight = maxHeight;
                innerDisplayWidth = maxHeight * aspectRatio;
            }
        } else {
            innerDisplayHeight = maxHeight;
            innerDisplayWidth = maxHeight * aspectRatio;
            if (innerDisplayWidth > maxWidth) {
                innerDisplayWidth = maxWidth;
                innerDisplayHeight = maxHeight / aspectRatio;
            }
        }
    }

    // Determine the number of sashes based on numTracks for visual display
    let numSashes = 0;
    if (numTracks === 2 || numTracks === 2.5) {
        numSashes = 2;
    } else if (numTracks === 3 || numTracks === 3.5) {
        numSashes = 3;
    }

    const sashWidthPercent = 100 / numSashes;

    return (
        // Outer container for the window visual and its measurements
        <div
            className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-md shadow-inner p-6 relative"
            style={{
                width: `${innerDisplayWidth + 60}px`,
                height: `${innerDisplayHeight + 60}px`
            }}
        >
            {width && height ? (
                <div
                    className="relative flex border-2 border-indigo-700 bg-gray-200"
                    style={{ width: `${innerDisplayWidth}px`, height: `${innerDisplayHeight}px` }}
                >
                    {/* Sashes */}
                    {Array.from({ length: numSashes }).map((_, i) => (
                        <div
                            key={i}
                            className="relative h-full border-r border-gray-400 last:border-r-0 flex items-center justify-center"
                            style={{ width: `${sashWidthPercent}%` }}
                        >
                            {/* Glass/Screen Panel Placeholder */}
                            <div className={`absolute inset-2 flex items-center justify-center text-xs text-gray-500 ${
                                ((numTracks === 2.5 || numTracks === 3.5) && i === numSashes - 1)
                                    ? 'bg-green-100 border border-green-300' // Screen color
                                    : 'bg-blue-100 border border-blue-300' // Glass color
                            }`}>
                                {((numTracks === 2.5 || numTracks === 3.5) && i === numSashes - 1) ? (
                                    <span className="text-center">Screen</span>
                                ) : (
                                    <span className="text-center">Glass</span>
                                )}
                            </div>
                        </div>
                    ))}
                    {/* Width Measurement */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap"
                         style={{ transform: 'translate(-50%, -150%)' }}>
                        {width} mm
                    </div>
                    {/* Height Measurement */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 text-xs font-semibold text-gray-700 whitespace-nowrap"
                         style={{ transform: 'translate(150%, -50%)' }}>
                        {height} mm
                    </div>
                </div>
            ) : (
                <span className="text-gray-400 text-sm text-center p-2">Enter dimensions to see preview</span>
            )}
        </div>
    );
};


// Main App component
const App = () => {
    // State to track if external scripts have loaded
    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    // Define allowed track options by series
    const trackOptionsMap = {
        'Slider Eco Window': [
            { label: '2 Tracks (2 Glass Shutters)', value: 2, fullSeriesName: 'Eco 2 Track' },
            { label: '2.5 Tracks (2 Glass, 1 Screen)', value: 2.5, fullSeriesName: 'Eco 2.5 Track' }
        ],
        'Slider Standard Window': [
            { label: '2 Tracks (2 Glass Shutters)', value: 2, fullSeriesName: 'Slider Standard Window 2 Track' },
            { label: '2.5 Tracks (2 Glass, 1 Screen)', value: 2.5, fullSeriesName: 'Slider Standard Window 2.5 Track' },
            { label: '3 Tracks (3 Glass Shutters)', value: 3, fullSeriesName: 'Slider Standard Window 3 Track' }
        ],
        'Slider Premium Window': [
            { label: '2 Tracks (2 Glass Shutters)', value: 2, fullSeriesName: 'Slider Premium Window 2 Track' },
            { label: '2.5 Tracks (2 Glass, 1 Screen)', value: 2.5, fullSeriesName: 'Slider Premium Window 2.5 Track' },
            { label: '3 Tracks (3 Glass Shutters)', value: 3, fullSeriesName: 'Slider Premium Window 3 Track' }
        ],
        'Slider Standard Door': [
            { label: '2 Tracks (2 Glass Shutters)', value: 2, fullSeriesName: 'Slider Standard Door 2 Track' },
            { label: '2.5 Tracks (2 Glass, 1 Screen)', value: 2.5, fullSeriesName: 'Slider Standard Door 2.5 Track' },
            { label: '3 Tracks (3 Glass Shutters)', value: 3, fullSeriesName: 'Slider Standard Door 3 Track' }
        ],
        'Slider Premium Door': [
            { label: '2 Tracks (2 Glass Shutters)', value: 2, fullSeriesName: 'Slider Door Premium 2 Track' },
            { label: '2.5 Tracks (2 Glass, 1 Screen)', value: 2.5, fullSeriesName: 'Slider Door Premium 2.5 Track' },
            { label: '3 Tracks (3 Glass Shutters)', value: 3, fullSeriesName: 'Slider Door Premium 3 Track' },
            { label: '3.5 Tracks (2 Glass, 1 Screen)', value: 3.5, fullSeriesName: 'Slider Door Premium 3.5 Track' }
        ]
    };

    // Define top-level series options
    const topLevelSeriesOptions = Object.keys(trackOptionsMap);

    // State variables for managing multiple windows
    const [windows, setWindows] = useState([
        { id: 1, name: 'Window 1', width: '', height: '', numTracks: 2, quantity: 1, topLevelSeries: 'Slider Eco Window', selectedFullSeriesName: 'Eco 2 Track', glassType: '5mm Clear Glass', hardwareType: 'Standard' }
    ]);
    const [nextWindowId, setNextWindowId] = useState(2);

    // State variables for derived parts and optimization results
    const [allPartsList, setAllPartsList] = useState([]);
    const [combinedCuttingPlan, setCombinedCuttingPlan] = useState({});
    const [totalUnusableWasteLength, setTotalUnusableWasteLength] = useState(0);
    const [totalMaterialCost, setTotalMaterialCost] = useState(0);
    const [profileCosts, setProfileCosts] = useState({});
    const [totalUsableRemittance, setTotalUsableRemittance] = useState(0);
    const [totalUsableRemittanceCost, setTotalUsableRemittanceCost] = useState(0);
    const [totalKerfLength, setTotalKerfLength] = useState(0);
    const [totalKerfCost, setTotalKerfCost] = useState(0);
    const [totalEdgeTrimLength, setTotalEdgeTrimLength] = useState(0);
    const [totalEdgeTrimCost, setTotalEdgeTrimCost] = useState(0);
    const [totalUtilizedMaterialCost, setTotalUtilizedMaterialCost] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // New states for area and rates
    const [totalAreaSqMeters, setTotalAreaSqMeters] = useState(0);
    const [totalAreaSqFeet, setTotalAreaSqFeet] = useState(0);
    const [ratePerSqMeter, setRatePerSqMeter] = useState(0);
    const [ratePerSqFeet, setRatePerSqFeet] = useState(0);

    // New states for material cost percentages
    const [usedMaterialPercentage, setUsedMaterialPercentage] = useState(0);
    const [kerfEdgeTrimPercentage, setKerfEdgeTrimPercentage] = useState(0);
    const [usableMaterialPercentage, setUsableMaterialPercentage] = useState(0);
    const [unusableWastagePercentage, setUnusableWastagePercentage] = useState(0);
    const [usedMaterialPercentagePerProfile, setUsedMaterialPercentagePerProfile] = useState({});

    // New states for detailed costs
    const [totalActualUsedPartsCost, setTotalActualUsedPartsCost] = useState(0);
    const [totalUnusableWasteCost, setTotalUnusableWasteCost] = useState(0);

    // NEW states for overall totals
    const [totalLengthsPurchased, setTotalLengthsPurchased] = useState(0);
    const [totalCostOfAllProfiles, setTotalCostOfAllProfiles] = useState(0);
    const [totalNumberOfStockLengthsUsed, setTotalNumberOfStockLengthsUsed] = useState(0); // New state for total stock lengths
    const [totalNumberOfStockLengthsUsedPerProfile, setTotalNumberOfStockLengthsUsedPerProfile] = useState({}); // New state for profile-wise stock lengths

    // New states for cost breakdown by source
    const [totalCostOfNewStockUsed, setTotalCostOfNewStockUsed] = useState(0);
    const [totalCostOfInventoryUsed, setTotalCostOfInventoryUsed] = useState(0);
    const [percentageOfNewStockUsed, setPercentageOfNewStockUsed] = useState(0);
    const [percentageOfInventoryUsed, setPercentageOfInventoryUsed] = useState(0);

    // New state for total inventory value
    const [totalInventoryValue, setTotalInventoryValue] = useState(0);

    // New states for utilized cost per area
    const [utilizedCostPerSqMeter, setUtilizedCostPerSqMeter] = useState(0);
    const [utilizedCostPerSqFeet, setUtilizedCostPerSqFeet] = useState(0);

    // New states for summarized cutting results
    const [newLengthsSummary, setNewLengthsSummary] = useState({});
    const [remLengthsSummary, setRemLengthsSummary] = useState({});
    const [inventoryUsedSummary, setInventoryUsedSummary] = useState({});

    // NEW states for glass calculation
    const [totalGlassCost, setTotalGlassCost] = useState(0);
    const [glassCuttingSummary, setGlassCuttingSummary] = useState({});
    const [glassPurchaseOrder, setGlassPurchaseOrder] = useState([]);
    const [totalHardwareCost, setTotalHardwareCost] = useState(0);
    const [hardwareSummary, setHardwareSummary] = useState({});


    // State for Settings Panel visibility
    const [showSettings, setShowSettings] = useState(false);

    // State for Firebase and User
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [saveMessage, setSaveMessage] = useState('');

    // Refs for hidden file inputs
    const fileInputRef = useRef(null);
    const imageFileInputRef = useRef(null);
    const pdfFileInputRef = useRef(null);

    // State for new profile and series inputs
    const [newProfileName, setNewProfileName] = useState('');
    const [newSeriesName, setNewSeriesName] = useState('');
    const [newGlassTypeName, setNewGlassTypeName] = useState('');
    const [newHardwareTypeName, setNewHardwareTypeName] = useState('');

    // State for inventory (now stores arrays of lengths)
    const [inventory, setInventory] = useState({});

    // New state to store individual usable remittance pieces
    const [individualUsableRemittances, setIndividualUsableRemittances] = useState([]);

    // New state for project name
    const [projectName, setProjectName] = useState('');

    // Project management states
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [projectAction, setProjectAction] = useState(null); // 'save' or 'load'
    const [newProjectNameInput, setNewProjectNameInput] = useState('');
    const [savedProjects, setSavedProjects] = useState([]);
    const [currentProjectId, setCurrentProjectId] = useState(null);

    // State for confirmation modals
    const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    
    // State for File Import feature
    const [showImageImportModal, setShowImageImportModal] = useState(false);
    const [showPdfImportModal, setShowPdfImportModal] = useState(false);
    const [importedFile, setImportedFile] = useState(null);
    const [importedFileName, setImportedFileName] = useState('');
    const [importedFileMimeType, setImportedFileMimeType] = useState('');
    const [extractedMeasurements, setExtractedMeasurements] = useState([]);
    const [extractionSummary, setExtractionSummary] = useState({});
    const [isExtracting, setIsExtracting] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [pdfPageThumbnails, setPdfPageThumbnails] = useState([]);
    const [isPdfRendering, setIsPdfRendering] = useState(false);
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [showExportMenu, setShowExportMenu] = useState(false);


    // State for Application Settings
    const [appSettings, setAppSettings] = useState({
        kerfThickness: 15, // Material lost per cut (mm)
        weldingThickness: 2.5, // Material added/consumed at each welded joint (e.g., 3mm per joint, so 6mm for 2 joints)
        edgeTrimThickness: 10, // Material trimmed from the edge of a new stock bar (mm)
        minGlassCutSize: 25, // Fallback if dynamic is off
        useDynamicMinGlassCutSize: true, // NEW: Toggle for dynamic min remnant size
        stockLengths: {
            'beed 80': 5900, 'beed 95': 5900, 'frame 112 outer': 5900, 'frame 55 outer': 5900,
            'frame 60 outer': 5900, 'frame 80 outer': 5900, 'frame 95 outer': 5900,
            'interlock 47x46 door': 5900, 'interlock 80': 5900, 'interlock window': 5900,
            'sash 57x34': 5900, 'sash 57x42': 5900, 'sash 67x42': 5900, 'sash 88x42': 5900,
            'screen 50x24': 5900, 'screen 65x24': 5900,
        },
        useCommonStockLength: false,
        commonStockLength: 5900,
        pricePerKg: {
            'beed 80': 100, 'beed 95': 100, 'frame 112 outer': 100, 'frame 55 outer': 100,
            'frame 60 outer': 100, 'frame 80 outer': 100, 'frame 95 outer': 100,
            'interlock 47x46 door': 100, 'interlock 80': 100, 'interlock window': 100,
            'sash 57x34': 100, 'sash 57x42': 100, 'sash 67x42': 100, 'sash 88x42': 100,
            'screen 50x24': 100, 'screen 65x24': 100,
        },
        weightPerMeter: {
            'beed 80': 0.2095, 'beed 95': 0.2585, 'frame 112 outer': 1.676, 'frame 55 outer': 0.8,
            'frame 60 outer': 1.029, 'frame 80 outer': 1.187, 'frame 95 outer': 1.35,
            'interlock 47x46 door': 0.257, 'interlock 80': 0.179, 'interlock window': 0.222,
            'sash 57x34': 0.7675, 'sash 57x42': 0.8625, 'sash 67x42': 0.9425, 'sash 88x42': 1.2075,
            'screen 50x24': 0.531, 'screen 65x24': 0.6260,
        },
        useCommonPrice: false,
        commonPricePerKg: 100,
        usableRemittanceThresholds: {
            'beed 80': 300, 'beed 95': 300, 'frame 112 outer': 1100, 'frame 55 outer': 100,
            'frame 60 outer': 750, 'frame 80 outer': 750, 'frame 95 outer': 750,
            'interlock 47x46 door': 1900, 'interlock 80': 200, 'interlock window': 300,
            'sash 57x34': 100, 'sash 57x42': 200, 'sash 67x42': 600, 'sash 88x42': 600,
            'screen 50x24': 100, 'screen 65x24': 200,
        },
        fixedNegligibleWasteLimit: {
            'beed 80': 100, 'beed 95': 100, 'frame 112 outer': 600, 'frame 55 outer': 50,
            'frame 60 outer': 200, 'frame 80 outer': 100, 'frame 95 outer': 200,
            'interlock 47x46 door': 1000, 'interlock 80': 200, 'interlock window': 300,
            'sash 57x34': 100, 'sash 57x42': 200, 'sash 67x42': 200, 'sash 88x42': 250,
            'screen 50x24': 100, 'screen 65x24': 200,
        },
        glassSettings: {
            '5mm Clear Glass': {
                processingType: 'In-House',
                purchaseMargin: 10,
                sheets: [{ id: 1, sheetWidth: 2440, sheetHeight: 1830, costPerSqFt: 50 }]
            },
            '6mm Toughened Glass': {
                processingType: 'Outsourced',
                purchaseMargin: 15,
                sheets: [{ id: 1, sheetWidth: 2440, sheetHeight: 1830, costPerSqFt: 80 }]
            },
        },
        hardwareSettings: {
            'Standard': { cost: 500 },
            'Premium': { cost: 1200 },
        },
        seriesDeductions: {
            'Eco 2 Track': { sashLengthDeduction: 80, sashWidthOverlap: 50, interlockLengthDeduction: 80, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 55 outer', sashProfile: 'sash 57x34', interlockProfile: 'interlock 80', beadingProfile: 'beed 80', screenProfile: 'screen 50x24' },
            'Eco 2.5 Track': { sashLengthDeduction: 100, sashWidthOverlap: 50, interlockLengthDeduction: 100, beadingDeduction: 20, screenLengthDeduction: 100, frameProfile: 'frame 80 outer', sashProfile: 'sash 57x34', interlockProfile: 'interlock 80', beadingProfile: 'beed 80', screenProfile: 'screen 50x24' },
            'Slider Standard Window 2 Track': { sashLengthDeduction: 90, sashWidthOverlap: 50, interlockLengthDeduction: 90, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 60 outer', sashProfile: 'sash 57x42', interlockProfile: 'interlock window', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Standard Window 2.5 Track': { sashLengthDeduction: 110, sashWidthOverlap: 50, interlockLengthDeduction: 110, beadingDeduction: 20, screenLengthDeduction: 110, frameProfile: 'frame 95 outer', sashProfile: 'sash 57x42', interlockProfile: 'interlock window', beadingProfile: 'beed 95', screenProfile: 'screen 50x24' },
            'Slider Standard Window 3 Track': { sashLengthDeduction: 90, sashWidthOverlap: 50, interlockLengthDeduction: 90, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 112 outer', sashProfile: 'sash 57x42', interlockProfile: 'interlock window', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Premium Window 2 Track': { sashLengthDeduction: 90, sashWidthOverlap: 50, interlockLengthDeduction: 90, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 60 outer', sashProfile: 'sash 67x42', interlockProfile: 'interlock window', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Premium Window 2.5 Track': { sashLengthDeduction: 110, sashWidthOverlap: 50, interlockLengthDeduction: 110, beadingDeduction: 20, screenLengthDeduction: 110, frameProfile: 'frame 95 outer', sashProfile: 'sash 67x42', interlockProfile: 'interlock window', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Premium Window 3 Track': { sashLengthDeduction: 90, sashWidthOverlap: 50, interlockLengthDeduction: 90, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 112 outer', sashProfile: 'sash 67x42', interlockProfile: 'interlock 47x46 door', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Standard Door 2 Track': { sashLengthDeduction: 90, sashWidthOverlap: 50, interlockLengthDeduction: 90, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 60 outer', sashProfile: 'sash 67x42', interlockProfile: 'interlock 47x46 door', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Standard Door 2.5 Track': { sashLengthDeduction: 110, sashWidthOverlap: 50, interlockLengthDeduction: 110, beadingDeduction: 20, screenLengthDeduction: 110, frameProfile: 'frame 95 outer', sashProfile: 'sash 67x42', interlockProfile: 'interlock 47x46 door', beadingProfile: 'beed 95', screenProfile: 'screen 50x24' },
            'Slider Standard Door 3 Track': { sashLengthDeduction: 90, sashWidthOverlap: 50, interlockLengthDeduction: 90, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 112 outer', sashProfile: 'sash 67x42', interlockProfile: 'interlock 47x46 door', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Door Premium 2 Track': { sashLengthDeduction: 90, sashWidthOverlap: 50, interlockLengthDeduction: 90, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 60 outer', sashProfile: 'sash 88x42', interlockProfile: 'interlock 47x46 door', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Door Premium 2.5 Track': { sashLengthDeduction: 110, sashWidthOverlap: 50, interlockLengthDeduction: 110, beadingDeduction: 20, screenLengthDeduction: 110, frameProfile: 'frame 95 outer', sashProfile: 'sash 88x42', interlockProfile: 'interlock 47x46 door', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Door Premium 3 Track': { sashLengthDeduction: 90, sashWidthOverlap: 50, interlockLengthDeduction: 90, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 112 outer', sashProfile: 'sash 88x42', interlockProfile: 'interlock 47x46 door', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
            'Slider Door Premium 3.5 Track': { sashLengthDeduction: 110, sashWidthOverlap: 50, interlockLengthDeduction: 110, beadingDeduction: 20, screenLengthDeduction: 110, frameProfile: 'frame 112 outer', sashProfile: 'sash 88x42', interlockProfile: 'interlock 47x46 door', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' },
        }
    });

    // Dynamically get all unique deduction keys for table headers, separated into numerical and profile types
    const { numericalDeductionKeys, profileAssignmentKeys } = React.useMemo(() => {
        const keys = new Set();
        Object.values(appSettings.seriesDeductions || {}).forEach(deductions => {
            Object.keys(deductions || {}).forEach(key => keys.add(key));
        });
        const allKeys = Array.from(keys);
        const numericalKeys = allKeys.filter(key => !key.includes('Profile')).sort();
        const profileKeys = allKeys.filter(key => key.includes('Profile')).sort();
        return { numericalDeductionKeys: numericalKeys, profileAssignmentKeys: profileKeys };
    }, [appSettings.seriesDeductions]);

    // Get all unique profile names for the combined table
    const allProfileNames = React.useMemo(() => {
        const profiles = new Set();
        Object.keys(appSettings.stockLengths || {}).forEach(p => profiles.add(p));
        Object.keys(appSettings.pricePerKg || {}).forEach(p => profiles.add(p));
        Object.keys(appSettings.weightPerMeter || {}).forEach(p => profiles.add(p));
        Object.keys(appSettings.usableRemittanceThresholds || {}).forEach(p => profiles.add(p));
        Object.keys(appSettings.fixedNegligibleWasteLimit || {}).forEach(p => profiles.add(p));
        Object.keys(inventory || {}).forEach(p => profiles.add(p));
        return Array.from(profiles).sort();
    }, [appSettings.stockLengths, appSettings.pricePerKg, appSettings.weightPerMeter, appSettings.usableRemittanceThresholds, appSettings.fixedNegligibleWasteLimit, inventory]);

    // Calculate usable remittance from last run for display in inventory table
    const usableRemittanceFromLastRunByProfile = React.useMemo(() => {
        const map = {};
        individualUsableRemittances.forEach(item => {
            map[item.profile] = (map[item.profile] || 0) + item.length;
        });
        return map;
    }, [individualUsableRemittances]);

    // Helper function to categorize waste: "Waste", "Negligible Waste", or "Usable Profile"
    const getWasteCategory = useCallback((waste, profile) => {
        const usableThreshold = appSettings.usableRemittanceThresholds[profile] || 0;
        const negligibleLimit = appSettings.fixedNegligibleWasteLimit[profile] || 100;

        if (waste >= usableThreshold) {
            return 'Usable Profile';
        } else if (waste >= 0 && waste < negligibleLimit) {
            return 'Negligible Waste';
        } else {
            return 'Waste'; // This is the 'absolute waste' category (between negligibleLimit and usableThreshold)
        }
    }, [appSettings.usableRemittanceThresholds, appSettings.fixedNegligibleWasteLimit]);

    // Save inventory data to Firestore - made a top-level function for useCallback dependency
    const saveInventory = useCallback(async (currentInventory) => {
        if (!db || !userId) {
            setSaveMessage('Authentication not ready. Please try again.');
            setTimeout(() => setSaveMessage(''), 3000);
            return;
        }

        setSaveMessage('Saving inventory...');
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const inventoryDocRef = doc(db, 'artifacts', appId, 'users', userId, 'inventory', 'currentStock');
            await setDoc(inventoryDocRef, { stock: currentInventory }, { merge: true });
            setSaveMessage('Inventory saved successfully!');
        } catch (error) {
            console.error("Error saving inventory:", error);
            setSaveMessage('Error saving inventory.');
        } finally {
            setTimeout(() => setSaveMessage(''), 3000);
        }
    }, [db, userId]); // Dependencies for useCallback

    // 2D Bin Packing Algorithm with Guillotine Logic and Minimum Cut Size
    const packPanes = useCallback((panes, sheetWidth, sheetHeight, minCutSize) => {
        const sortedPanes = [...panes].map((p, i) => ({ ...p, id: i })).sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));
        let remainingPanes = [...sortedPanes];
        const sheets = [];

        while (remainingPanes.length > 0) {
            const currentSheet = { panes: [], freeRects: [{ x: 0, y: 0, width: sheetWidth, height: sheetHeight }] };
            sheets.push(currentSheet);
            let packedOnThisSheetIndices = new Set();

            let placedAPane;
            do {
                placedAPane = false;
                let bestFit = null;

                for (let i = 0; i < remainingPanes.length; i++) {
                    const pane = remainingPanes[i];
                    for (let j = 0; j < currentSheet.freeRects.length; j++) {
                        const rect = currentSheet.freeRects[j];
                        const orientations = [{ w: pane.width, h: pane.height }, { w: pane.height, h: pane.width }];

                        for (const p of orientations) {
                            if (p.w <= rect.width && p.h <= rect.height) {
                                const score = Math.min(rect.width - p.w, rect.height - p.h);
                                if (!bestFit || score < bestFit.score) {
                                    bestFit = { pane, paneIndex: i, rect, rectIndex: j, placedWidth: p.w, placedHeight: p.h, score };
                                }
                            }
                        }
                    }
                }

                if (bestFit) {
                    const { pane, rect, rectIndex, placedWidth, placedHeight } = bestFit;
                    
                    currentSheet.panes.push({ x: rect.x, y: rect.y, width: placedWidth, height: placedHeight, originalWidth: pane.width, originalHeight: pane.height, windowName: pane.windowName });
                    packedOnThisSheetIndices.add(pane.id);
                    
                    currentSheet.freeRects.splice(rectIndex, 1);

                    const rightRect = { x: rect.x + placedWidth, y: rect.y, width: rect.width - placedWidth, height: rect.height };
                    if (rightRect.width >= minCutSize) currentSheet.freeRects.push(rightRect);

                    const bottomRect = { x: rect.x, y: rect.y + placedHeight, width: placedWidth, height: rect.height - placedHeight };
                    if (bottomRect.height >= minCutSize) currentSheet.freeRects.push(bottomRect);
                    
                    placedAPane = true;
                    remainingPanes = remainingPanes.filter(p => !packedOnThisSheetIndices.has(p.id));
                }
            } while (placedAPane && remainingPanes.length > 0);
        }
        return sheets;
    }, []);

    // Helper function to get glass thickness from its name
    const getGlassThickness = (glassTypeName) => {
        const match = glassTypeName.match(/(\d+(\.\d+)?)\s*mm/i);
        return match ? parseFloat(match[1]) : 5; // Default to 5mm if not found
    };

    // Function to calculate and optimize parts for all windows
    const calculateAllParts = useCallback(async () => { // Made async to await saveInventory
        console.log("Starting calculateAllParts...");
        // --- Reset all state variables ---
        setErrorMessage('');
        setShowResults(false);
        setAllPartsList([]);
        setCombinedCuttingPlan({});
        setTotalUnusableWasteLength(0);
        setTotalMaterialCost(0);
        setProfileCosts({});
        setTotalUsableRemittance(0);
        setTotalUsableRemittanceCost(0);
        setTotalKerfLength(0);
        setTotalKerfCost(0);
        setTotalEdgeTrimLength(0);
        setTotalEdgeTrimCost(0);
        setTotalUtilizedMaterialCost(0);
        setTotalAreaSqMeters(0);
        setTotalAreaSqFeet(0);
        setRatePerSqMeter(0);
        setRatePerSqFeet(0);
        setUsedMaterialPercentage(0);
        setKerfEdgeTrimPercentage(0);
        setUsableMaterialPercentage(0);
        setUnusableWastagePercentage(0);
        setTotalUnusableWasteCost(0);
        setTotalActualUsedPartsCost(0);
        setUsedMaterialPercentagePerProfile({});
        setTotalLengthsPurchased(0);
        setTotalCostOfAllProfiles(0);
        setTotalNumberOfStockLengthsUsed(0);
        setTotalNumberOfStockLengthsUsedPerProfile({});
        setIndividualUsableRemittances([]);
        setTotalCostOfNewStockUsed(0);
        setTotalCostOfInventoryUsed(0);
        setPercentageOfNewStockUsed(0);
        setPercentageOfInventoryUsed(0);
        setUtilizedCostPerSqMeter(0);
        setUtilizedCostPerSqFeet(0);
        setNewLengthsSummary({});
        setRemLengthsSummary({});
        setInventoryUsedSummary({});
        setTotalGlassCost(0);
        setGlassCuttingSummary({});
        setGlassPurchaseOrder([]);
        setTotalHardwareCost(0);
        setHardwareSummary({});


        // --- Local variables for calculation ---
        let tempAllParts = [];
        let tempCombinedCuttingPlan = {};
        let tempTotalUnusableWasteLength = 0;
        let tempTotalUnusableWasteCost = 0;
        let tempProfileCosts = {};
        let tempTotalAreaSqMm = 0;
        let tempTotalUsableRemittance = 0;
        let tempTotalUsableRemittanceCost = 0;
        let tempTotalKerfLength = 0;
        let tempTotalKerfCost = 0;
        let tempTotalEdgeTrimLength = 0;
        let tempTotalEdgeTrimCost = 0;
        let tempTotalActualUsedPartsCost = 0;
        let tempUsedMaterialPercentagePerProfile = {};
        let tempTotalNumberOfStockLengthsUsed = 0;
        let tempTotalNumberOfStockLengthsUsedPerProfile = {};
        let tempIndividualUsableRemittances = [];
        let currentProjectUsableRemittanceCost = 0;
        let tempTotalCostOfNewStockUsed = 0;
        let tempTotalCostOfInventoryUsed = 0;
        let tempNewLengthsSummary = {};
        let tempRemLengthsSummary = {};
        let tempInventoryUsedSummary = {};
        let tempAllGlassPanes = []; // For glass calculation
        let tempTotalHardwareCost = 0;
        let tempHardwareSummary = {};


        // Initialize tempProfileCosts for all known profiles
        for (const profileName of allProfileNames) {
            tempProfileCosts[profileName] = { totalLengthPurchased: 0, totalWeightNeeded: 0, totalCost: 0, totalLengthCutForParts: 0 };
            tempTotalNumberOfStockLengthsUsedPerProfile[profileName] = 0;
            tempNewLengthsSummary[profileName] = {};
            tempRemLengthsSummary[profileName] = {};
            tempInventoryUsedSummary[profileName] = {};
        }

        // --- 1. GATHER PROFILE PARTS & GLASS PANES ---
        for (const window of windows) {
            const width = parseFloat(window.width);
            const height = parseFloat(window.height);
            const quantity = parseInt(window.quantity) || 1;
            const selectedFullSeriesName = window.selectedFullSeriesName;
            const glassType = window.glassType;
            const hardwareType = window.hardwareType;

            if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0 || !glassType || !hardwareType) {
                setErrorMessage(`Invalid input for ${window.name}. Please check all fields.`);
                return;
            }

            const deductions = appSettings.seriesDeductions[selectedFullSeriesName];
            if (!deductions) {
                setErrorMessage(`Deduction settings not found for series: ${selectedFullSeriesName}.`);
                return;
            }

            // Hardware Cost Calculation
            const hardwareInfo = appSettings.hardwareSettings[hardwareType];
            if (hardwareInfo) {
                const hardwareCostForWindow = hardwareInfo.cost * quantity;
                tempTotalHardwareCost += hardwareCostForWindow;
                if (tempHardwareSummary[hardwareType]) {
                    tempHardwareSummary[hardwareType].quantity += quantity;
                    tempHardwareSummary[hardwareType].totalCost += hardwareCostForWindow;
                } else {
                    tempHardwareSummary[hardwareType] = { quantity, totalCost: hardwareCostForWindow };
                }
            }

            tempTotalAreaSqMm += (width * height * quantity);

            let requiredPartsForWindow = [];
            const frameProfileName = deductions.frameProfile;
            const sashProfileName = deductions.sashProfile;
            const interlockProfileName = deductions.interlockProfile;
            const beadingProfileName = deductions.beadingProfile;
            const screenProfileName = deductions.screenProfile;

            // Frame Parts
            requiredPartsForWindow.push({ type: 'Frame Top', length: width + (2 * appSettings.weldingThickness), profile: frameProfileName, count: 1 });
            requiredPartsForWindow.push({ type: 'Frame Bottom', length: width + (2 * appSettings.weldingThickness), profile: frameProfileName, count: 1 });
            requiredPartsForWindow.push({ type: 'Frame Left', length: height + (2 * appSettings.weldingThickness), profile: frameProfileName, count: 1 });
            requiredPartsForWindow.push({ type: 'Frame Right', length: height + (2 * appSettings.weldingThickness), profile: frameProfileName, count: 1 });

            // Sash & Glass Calculation
            let glassSashCount = 0;
            let meshShutterCount = 0;
            let glassSashCalculatedWidth = 0;
            let meshShutterCalculatedWidth = 0;
            const effectiveSashHeight = height - deductions.sashLengthDeduction;
            const screenHeight = height - deductions.screenLengthDeduction;
            let numSashesForWidthCalculation = 0;

            if (window.numTracks === 2) {
                glassSashCount = 2; numSashesForWidthCalculation = 2;
                glassSashCalculatedWidth = (width / numSashesForWidthCalculation) + deductions.sashWidthOverlap;
            } else if (window.numTracks === 2.5) {
                glassSashCount = 2; meshShutterCount = 1; numSashesForWidthCalculation = 2;
                glassSashCalculatedWidth = (width / numSashesForWidthCalculation) + deductions.sashWidthOverlap;
                meshShutterCalculatedWidth = (width / numSashesForWidthCalculation);
            } else if (window.numTracks === 3) {
                glassSashCount = 3; numSashesForWidthCalculation = 3;
                glassSashCalculatedWidth = (width / numSashesForWidthCalculation) + deductions.sashWidthOverlap;
            } else if (window.numTracks === 3.5) {
                glassSashCount = 2; meshShutterCount = 1; numSashesForWidthCalculation = 2;
                glassSashCalculatedWidth = (width / numSashesForWidthCalculation) + deductions.sashWidthOverlap;
                meshShutterCalculatedWidth = (width / numSashesForWidthCalculation);
            }

            // Add Glass Sash Parts & Glass Panes
            for (let i = 0; i < glassSashCount; i++) {
                requiredPartsForWindow.push({ type: `Glass Sash ${i + 1} Vertical`, length: effectiveSashHeight, profile: sashProfileName, count: 2 });
                requiredPartsForWindow.push({ type: `Glass Sash ${i + 1} Horizontal`, length: glassSashCalculatedWidth, profile: sashProfileName, count: 2 });
                requiredPartsForWindow.push({ type: `Interlock ${i + 1}`, length: height - deductions.interlockLengthDeduction, profile: interlockProfileName, count: 1 });

                const glassBeadingWidth = glassSashCalculatedWidth - deductions.beadingDeduction;
                const glassBeadingHeight = effectiveSashHeight - deductions.beadingDeduction;
                requiredPartsForWindow.push({ type: `Glass Beading ${i + 1} Horizontal`, length: glassBeadingWidth, profile: beadingProfileName, count: 2 });
                requiredPartsForWindow.push({ type: `Glass Beading ${i + 1} Vertical`, length: glassBeadingHeight, profile: beadingProfileName, count: 2 });
                
                // Add Glass Pane
                tempAllGlassPanes.push({ width: glassBeadingWidth, height: glassBeadingHeight, type: glassType, count: quantity, windowName: window.name });
            }

            // Add Mesh Shutter Parts
            for (let i = 0; i < meshShutterCount; i++) {
                requiredPartsForWindow.push({ type: `Mesh Shutter ${i + 1} Vertical`, length: screenHeight, profile: screenProfileName, count: 2 });
                requiredPartsForWindow.push({ type: `Mesh Shutter ${i + 1} Horizontal`, length: meshShutterCalculatedWidth, profile: screenProfileName, count: 2 });
            }

            requiredPartsForWindow.forEach(part => {
                for (let i = 0; i < (part.count * quantity); i++) {
                    tempAllParts.push({ windowId: window.id, windowName: window.name, type: part.type, length: part.length, profile: part.profile });
                }
            });
        }
        
        setAllPartsList(tempAllParts);

        // --- 2. 1D OPTIMIZATION FOR PROFILES ---
        const currentInventoryForCutting = {};
        for (const profileName of allProfileNames) {
            currentInventoryForCutting[profileName] = [];
            if (inventory[profileName] && inventory[profileName].length > 0) {
                inventory[profileName].forEach((length, index) => {
                    currentInventoryForCutting[profileName].push({ id: `INV-${profileName}-${index + 1}`, originalLength: length, remainingLength: length, cuts: [], isInventory: true, wasUsedInThisRun: false });
                });
            }
            tempCombinedCuttingPlan[profileName] = [...currentInventoryForCutting[profileName]];
        }

        for (const part of tempAllParts) {
            let bestFitIndex = -1;
            let minRemainingLength = Infinity;
            const sortedStockForProfile = [...tempCombinedCuttingPlan[part.profile]].sort((a, b) => a.remainingLength - b.remainingLength);

            for (let i = 0; i < sortedStockForProfile.length; i++) {
                const stock = sortedStockForProfile[i];
                const potentialRemainingLength = stock.remainingLength - (part.length + appSettings.kerfThickness);
                const wasteCategory = getWasteCategory(potentialRemainingLength, part.profile);
                if (potentialRemainingLength >= 0 && wasteCategory !== 'Waste') {
                    const originalIndex = tempCombinedCuttingPlan[part.profile].findIndex(s => s.id === stock.id);
                    if (originalIndex !== -1) {
                        if (wasteCategory === 'Negligible Waste' && potentialRemainingLength < minRemainingLength) {
                            minRemainingLength = potentialRemainingLength;
                            bestFitIndex = originalIndex;
                        } else if (wasteCategory === 'Usable Profile' && bestFitIndex === -1) {
                            minRemainingLength = potentialRemainingLength;
                            bestFitIndex = originalIndex;
                        } else if (wasteCategory === 'Usable Profile' && potentialRemainingLength < minRemainingLength && getWasteCategory(tempCombinedCuttingPlan[part.profile][bestFitIndex].remainingLength - (part.length + appSettings.kerfThickness), part.profile) === 'Usable Profile') {
                            minRemainingLength = potentialRemainingLength;
                            bestFitIndex = originalIndex;
                        }
                    }
                }
            }

            const partCost = (part.length / 1000) * (appSettings.weightPerMeter[part.profile] || 0) * (appSettings.useCommonPrice ? appSettings.commonPricePerKg : appSettings.pricePerKg[part.profile] || 0);
            tempTotalActualUsedPartsCost += partCost;

            if (bestFitIndex !== -1) {
                const stock = tempCombinedCuttingPlan[part.profile][bestFitIndex];
                stock.cuts.push({ windowName: part.windowName, type: part.type, length: part.length });
                stock.remainingLength -= (part.length + appSettings.kerfThickness);
                tempTotalKerfLength += appSettings.kerfThickness;
                tempProfileCosts[part.profile].totalLengthCutForParts += part.length;
                if (stock.isInventory) {
                    stock.wasUsedInThisRun = true;
                    const roundedOriginalLength = Math.round(stock.originalLength);
                    tempInventoryUsedSummary[part.profile][roundedOriginalLength] = (tempInventoryUsedSummary[part.profile][roundedOriginalLength] || 0) + 1;
                }
            } else {
                const newStockLength = appSettings.useCommonStockLength ? appSettings.commonStockLength : appSettings.stockLengths[part.profile];
                const effectiveStockLength = newStockLength - appSettings.edgeTrimThickness;
                const remainingAfterFirstCut = effectiveStockLength - (part.length + appSettings.kerfThickness);
                const newBarWasteCategory = getWasteCategory(remainingAfterFirstCut, part.profile);

                if (newBarWasteCategory === 'Waste' || remainingAfterFirstCut < 0) {
                    setErrorMessage(`Part ${part.type} (${part.length}mm) cannot be cut from a new ${part.profile} stock bar.`);
                    return;
                }

                tempTotalEdgeTrimLength += appSettings.edgeTrimThickness;
                tempTotalKerfLength += appSettings.kerfThickness;
                const stockWeight = (newStockLength / 1000) * (appSettings.weightPerMeter[part.profile] || 0);
                const stockCost = stockWeight * (appSettings.useCommonPrice ? appSettings.commonPricePerKg : appSettings.pricePerKg[part.profile] || 0);
                tempProfileCosts[part.profile].totalLengthPurchased += newStockLength;
                tempProfileCosts[part.profile].totalWeightNeeded += stockWeight;
                tempProfileCosts[part.profile].totalCost += stockCost;
                tempTotalCostOfNewStockUsed += stockCost;

                tempCombinedCuttingPlan[part.profile].push({ id: `NEW-${part.profile}-${tempCombinedCuttingPlan[part.profile].filter(s => !s.isInventory).length + 1}`, originalLength: newStockLength, remainingLength: remainingAfterFirstCut, cuts: [{ windowName: part.windowName, type: part.type, length: part.length }], isInventory: false, wasUsedInThisRun: true });
                tempProfileCosts[part.profile].totalLengthCutForParts += part.length;
                const roundedNewLength = Math.round(newStockLength);
                tempNewLengthsSummary[part.profile][roundedNewLength] = (tempNewLengthsSummary[part.profile][roundedNewLength] || 0) + 1;
            }
        }

        // --- 3. 2D OPTIMIZATION FOR GLASS ---
        let calculatedTotalGlassCost = 0;
        const tempGlassCuttingSummary = {};
        const tempPurchaseOrder = [];
        const groupedGlassPanes = {};

        tempAllGlassPanes.forEach(pane => {
            if (!groupedGlassPanes[pane.type]) groupedGlassPanes[pane.type] = [];
            for (let i = 0; i < pane.count; i++) {
                groupedGlassPanes[pane.type].push({ width: pane.width, height: pane.height, windowName: pane.windowName });
            }
        });

        for (const glassType in groupedGlassPanes) {
            const glassConfig = appSettings.glassSettings[glassType];
            if (!glassConfig) {
                setErrorMessage(`Settings for glass type "${glassType}" not found.`);
                continue;
            }

            const panes = groupedGlassPanes[glassType];

            if (glassConfig.processingType === 'In-House') {
                const availableSheets = glassConfig.sheets;
                if (!availableSheets || availableSheets.length === 0) {
                    setErrorMessage(`No sheet sizes for glass type "${glassType}".`);
                    continue;
                }

                let bestSheetChoice = null;
                let minCost = Infinity;

                const thickness = getGlassThickness(glassType);
                const minCutSizeForThisGlass = appSettings.useDynamicMinGlassCutSize ? Math.max(1, thickness - 1) : appSettings.minGlassCutSize;

                availableSheets.forEach(sheetInfo => {
                    const packingResult = packPanes(panes, sheetInfo.sheetWidth, sheetInfo.sheetHeight, minCutSizeForThisGlass);
                    const totalAreaPurchased = packingResult.length * sheetInfo.sheetWidth * sheetInfo.sheetHeight;
                    const cost = (totalAreaPurchased / (304.8 * 304.8)) * sheetInfo.costPerSqFt;

                    if (cost < minCost) {
                        minCost = cost;
                        bestSheetChoice = { ...sheetInfo, packingResult, cost };
                    }
                });

                if (!bestSheetChoice) {
                    setErrorMessage(`Could not pack panes for "${glassType}".`);
                    continue;
                }

                const totalPaneArea = panes.reduce((sum, p) => sum + (p.width * p.height), 0);
                const totalAreaPurchased = bestSheetChoice.packingResult.length * bestSheetChoice.sheetWidth * bestSheetChoice.sheetHeight;
                
                calculatedTotalGlassCost += bestSheetChoice.cost;

                tempGlassCuttingSummary[glassType] = {
                    sheetsUsed: bestSheetChoice.packingResult.length,
                    totalAreaNeeded: totalPaneArea,
                    totalCost: bestSheetChoice.cost,
                    wastageArea: totalAreaPurchased - totalPaneArea,
                    optimalSheet: `${bestSheetChoice.sheetWidth}x${bestSheetChoice.sheetHeight} mm`,
                    packingResult: bestSheetChoice.packingResult,
                    sheetWidth: bestSheetChoice.sheetWidth,
                    sheetHeight: bestSheetChoice.sheetHeight,
                };
            } else { // Outsourced
                const margin = glassConfig.purchaseMargin || 0;
                const costPerSqFt = glassConfig.sheets[0]?.costPerSqFt || 0; // Use first sheet's cost
                const groupedForPO = {};

                panes.forEach(pane => {
                    const orderWidth = pane.width + margin;
                    const orderHeight = pane.height + margin;
                    const key = `${pane.windowName}-${orderWidth.toFixed(0)}x${orderHeight.toFixed(0)}`;

                    if (groupedForPO[key]) {
                        groupedForPO[key].quantity++;
                    } else {
                        groupedForPO[key] = {
                            projectName: projectName,
                            windowName: pane.windowName,
                            glassType,
                            width: orderWidth,
                            height: orderHeight,
                            quantity: 1,
                        };
                    }
                });

                Object.values(groupedForPO).forEach(item => {
                    const orderArea = item.width * item.height;
                    const cost = (orderArea / (304.8 * 304.8)) * costPerSqFt * item.quantity;
                    calculatedTotalGlassCost += cost;
                    tempPurchaseOrder.push(item);
                });
            }
        }
        setTotalGlassCost(calculatedTotalGlassCost);
        setGlassCuttingSummary(tempGlassCuttingSummary);
        setGlassPurchaseOrder(tempPurchaseOrder);

        // --- 4. FINALIZE CALCULATIONS & SET STATE ---
        let finalInventoryState = {};
        let overallTotalUsableRemittanceLength = 0;
        let overallTotalUnusableWasteLength = 0;
        let overallTotalUnusableWasteCost = 0;
        let overallTotalCostOfAllProfiles = 0;
        let overallTotalLengthsPurchased = 0;
        let totalNumberOfStockLengthsUsed = 0;
        let totalNumberOfStockLengthsUsedPerProfile = {};

        for (const profile in tempCombinedCuttingPlan) {
            totalNumberOfStockLengthsUsedPerProfile[profile] = 0;
            finalInventoryState[profile] = [];
            const profileInfo = tempProfileCosts[profile];
            
            tempCombinedCuttingPlan[profile].forEach(stock => {
                if (!stock.isInventory || stock.wasUsedInThisRun) {
                    const costPerMeter = appSettings.useCommonPrice ? appSettings.commonPricePerKg : appSettings.pricePerKg[profile] || 0;
                    const weightPerMeter = appSettings.weightPerMeter[profile] || 0;
                    const stockCost = (stock.originalLength / 1000) * weightPerMeter * costPerMeter;
                    overallTotalCostOfAllProfiles += stockCost;
                    overallTotalLengthsPurchased += stock.originalLength;
                    totalNumberOfStockLengthsUsed++;
                    totalNumberOfStockLengthsUsedPerProfile[profile]++;
                    if (stock.isInventory && stock.wasUsedInThisRun) {
                        tempTotalCostOfInventoryUsed += stockCost;
                    }
                }
                
                const remaining = stock.remainingLength;
                const category = getWasteCategory(remaining, profile);
                const wasteCost = (remaining / 1000) * (appSettings.weightPerMeter[profile] || 0) * (appSettings.useCommonPrice ? appSettings.commonPricePerKg : appSettings.pricePerKg[profile] || 0);

                if (category === 'Usable Profile') {
                    overallTotalUsableRemittanceLength += remaining;
                    tempIndividualUsableRemittances.push({ profile: profile, length: remaining });
                    const roundedRemLength = Math.round(remaining);
                    tempRemLengthsSummary[profile][roundedRemLength] = (tempRemLengthsSummary[profile][roundedRemLength] || 0) + 1;
                    if (stock.cuts.length > 0 || !stock.isInventory) {
                        currentProjectUsableRemittanceCost += wasteCost;
                    }
                    finalInventoryState[profile].push(remaining);
                } else if (category === 'Negligible Waste' || category === 'Waste') {
                    overallTotalUnusableWasteLength += remaining;
                    overallTotalUnusableWasteCost += wasteCost;
                }
            });

            let totalLengthAvailableForProfileForPercentage = (profileInfo.totalLengthPurchased || 0) +
                tempCombinedCuttingPlan[profile].filter(s => s.isInventory && s.wasUsedInThisRun).reduce((sum, s) => sum + s.originalLength, 0);

            const totalLengthCutForParts = profileInfo.totalLengthCutForParts || 0;
            tempUsedMaterialPercentagePerProfile[profile] = totalLengthAvailableForProfileForPercentage > 0 ? (totalLengthCutForParts / totalLengthAvailableForProfileForPercentage) * 100 : 0;
        }

        setInventory(finalInventoryState);
        setIndividualUsableRemittances(tempIndividualUsableRemittances);
        await saveInventory(finalInventoryState);

        const averageWeightPerMeter = Object.values(appSettings.weightPerMeter).reduce((a, b) => a + b, 0) / (Object.keys(appSettings.weightPerMeter).length || 1);
        const averagePricePerKg = Object.values(appSettings.pricePerKg).reduce((a, b) => a + b, 0) / (Object.keys(appSettings.pricePerKg).length || 1);
        const totalKerfCost = (tempTotalKerfLength / 1000) * averageWeightPerMeter * averagePricePerKg;
        const totalEdgeTrimCost = (tempTotalEdgeTrimLength / 1000) * averageWeightPerMeter * averagePricePerKg;
        
        const totalUtilizedProfileCost = tempTotalActualUsedPartsCost + totalKerfCost + totalEdgeTrimCost + overallTotalUnusableWasteCost;
        const totalFinalCost = overallTotalCostOfAllProfiles + calculatedTotalGlassCost + tempTotalHardwareCost;

        const totalAreaSqMeters = tempTotalAreaSqMm / 1_000_000;
        const totalAreaSqFeet = totalAreaSqMeters * 10.7639;

        setCombinedCuttingPlan(Object.keys(tempCombinedCuttingPlan).reduce((acc, key) => {
            const filtered = tempCombinedCuttingPlan[key].filter(stock => stock.cuts.length > 0 || !stock.isInventory);
            if (filtered.length > 0) acc[key] = filtered;
            return acc;
        }, {}));
        setTotalUnusableWasteLength(overallTotalUnusableWasteLength);
        setTotalMaterialCost(totalFinalCost);
        setProfileCosts(tempProfileCosts);
        setTotalUsableRemittance(overallTotalUsableRemittanceLength);
        setTotalUsableRemittanceCost(currentProjectUsableRemittanceCost);
        setTotalKerfLength(tempTotalKerfLength);
        setTotalKerfCost(totalKerfCost);
        setTotalEdgeTrimLength(tempTotalEdgeTrimLength);
        setTotalEdgeTrimCost(totalEdgeTrimCost);
        setTotalUtilizedMaterialCost(totalUtilizedProfileCost + calculatedTotalGlassCost + tempTotalHardwareCost);
        setTotalAreaSqMeters(totalAreaSqMeters);
        setTotalAreaSqFeet(totalAreaSqFeet);
        setRatePerSqMeter(totalAreaSqMeters > 0 ? totalFinalCost / totalAreaSqMeters : 0);
        setRatePerSqFeet(totalAreaSqFeet > 0 ? totalFinalCost / totalAreaSqFeet : 0);
        setUsedMaterialPercentage(overallTotalCostOfAllProfiles > 0 ? (tempTotalActualUsedPartsCost / overallTotalCostOfAllProfiles) * 100 : 0);
        setKerfEdgeTrimPercentage(overallTotalCostOfAllProfiles > 0 ? ((totalKerfCost + totalEdgeTrimCost) / overallTotalCostOfAllProfiles) * 100 : 0);
        setUsableMaterialPercentage(overallTotalCostOfAllProfiles > 0 ? (currentProjectUsableRemittanceCost / overallTotalCostOfAllProfiles) * 100 : 0);
        setUnusableWastagePercentage(overallTotalCostOfAllProfiles > 0 ? (overallTotalUnusableWasteCost / overallTotalCostOfAllProfiles) * 100 : 0);
        setTotalActualUsedPartsCost(tempTotalActualUsedPartsCost);
        setTotalUnusableWasteCost(overallTotalUnusableWasteCost);
        setUsedMaterialPercentagePerProfile(tempUsedMaterialPercentagePerProfile);
        setTotalLengthsPurchased(overallTotalLengthsPurchased);
        setTotalCostOfAllProfiles(overallTotalCostOfAllProfiles);
        setTotalNumberOfStockLengthsUsed(totalNumberOfStockLengthsUsed);
        setTotalNumberOfStockLengthsUsedPerProfile(totalNumberOfStockLengthsUsedPerProfile);
        setTotalCostOfNewStockUsed(tempTotalCostOfNewStockUsed);
        setTotalCostOfInventoryUsed(tempTotalCostOfInventoryUsed);
        setPercentageOfNewStockUsed(overallTotalCostOfAllProfiles > 0 ? (tempTotalCostOfNewStockUsed / overallTotalCostOfAllProfiles) * 100 : 0);
        setPercentageOfInventoryUsed(overallTotalCostOfAllProfiles > 0 ? (tempTotalCostOfInventoryUsed / overallTotalCostOfAllProfiles) * 100 : 0);
        setUtilizedCostPerSqMeter(totalAreaSqMeters > 0 ? (totalUtilizedProfileCost + calculatedTotalGlassCost + tempTotalHardwareCost) / totalAreaSqMeters : 0);
        setUtilizedCostPerSqFeet(totalAreaSqFeet > 0 ? (totalUtilizedProfileCost + calculatedTotalGlassCost + tempTotalHardwareCost) / totalAreaSqFeet : 0);
        setNewLengthsSummary(tempNewLengthsSummary);
        setRemLengthsSummary(tempRemLengthsSummary);
        setInventoryUsedSummary(tempInventoryUsedSummary);
        setHardwareSummary(tempHardwareSummary);
        setTotalHardwareCost(tempTotalHardwareCost);
        setShowResults(true);
        console.log("Optimization calculation completed.");
    }, [windows, appSettings, getWasteCategory, inventory, saveInventory, allProfileNames, packPanes, projectName]);

    // Firebase Initialization and Auth
    useEffect(() => {
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};

        if (!firebaseConfig.apiKey) {
            console.error("Firebase config is missing. App will not connect to Firebase.");
            setLoadingSettings(false);
            return;
        }

        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const firebaseAuth = getAuth(app);

        setDb(firestore);
        setAuth(firebaseAuth);

        const unsubscribe = onAuthStateChanged(firebaseAuth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(firebaseAuth, __initial_auth_token);
                    } else {
                        await signInAnonymously(firebaseAuth);
                    }
                } catch (error) {
                    console.error("Error during sign-in:", error);
                    setErrorMessage(`Failed to sign in. Please check connection.`);
                }
            }
            setLoadingSettings(false);
        });

        return () => unsubscribe();
    }, []);

    // Load settings and window data from Firestore
    useEffect(() => {
        if (db && userId) {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

            // Load settings
            const settingsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'settings', 'appSettings');
            const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setAppSettings(prevSettings => {
                        const loadedSettings = docSnap.data();
                        // Deep merge for nested objects
                        return {
                            ...prevSettings,
                            ...loadedSettings,
                            stockLengths: { ...prevSettings.stockLengths, ...loadedSettings.stockLengths },
                            pricePerKg: { ...prevSettings.pricePerKg, ...loadedSettings.pricePerKg },
                            weightPerMeter: { ...prevSettings.weightPerMeter, ...loadedSettings.weightPerMeter },
                            usableRemittanceThresholds: { ...prevSettings.usableRemittanceThresholds, ...loadedSettings.usableRemittanceThresholds },
                            fixedNegligibleWasteLimit: { ...prevSettings.fixedNegligibleWasteLimit, ...loadedSettings.fixedNegligibleWasteLimit },
                            seriesDeductions: { ...prevSettings.seriesDeductions, ...loadedSettings.seriesDeductions },
                            glassSettings: loadedSettings.glassSettings || prevSettings.glassSettings, // Replace whole glass settings
                            hardwareSettings: loadedSettings.hardwareSettings || prevSettings.hardwareSettings,
                        };
                    });
                }
            });

            // Load windows data
            const windowsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'windows', 'windowData');
            const unsubscribeWindows = onSnapshot(windowsDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.windows) {
                        setWindows(data.windows);
                        setNextWindowId(data.windows.reduce((max, w) => Math.max(max, w.id), 0) + 1);
                    }
                    if (data.projectName) setProjectName(data.projectName);
                }
            });

            // Load inventory data
            const inventoryDocRef = doc(db, 'artifacts', appId, 'users', userId, 'inventory', 'currentStock');
            const unsubscribeInventory = onSnapshot(inventoryDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const loadedStock = docSnap.data().stock || {};
                    const parsedStock = {};
                    for (const profileName in loadedStock) { // FIX: Use profileName consistently
                        if (typeof loadedStock[profileName] === 'number') {
                            parsedStock[profileName] = [loadedStock[profileName]];
                        } else if (Array.isArray(loadedStock[profileName])) {
                            parsedStock[profileName] = loadedStock[profileName].map(l => parseFloat(l)).filter(n => !isNaN(n) && n > 0);
                        } else {
                            parsedStock[profileName] = [];
                        }
                    }
                    setInventory(parsedStock);
                }
            });

            // Load saved projects list
            const projectsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'projects');
            const q = query(projectsCollectionRef, orderBy('createdAt', 'desc'));
            const unsubscribeProjects = onSnapshot(q, (snapshot) => {
                setSavedProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });

            return () => {
                unsubscribeSettings();
                unsubscribeWindows();
                unsubscribeInventory();
                unsubscribeProjects();
            };
        }
    }, [db, userId]);

    // Dynamically load external scripts and configure PDF.js worker
    useEffect(() => {
        const loadScript = (id, src) => {
            return new Promise((resolve, reject) => {
                if (document.getElementById(id)) {
                    resolve();
                    return;
                }
                const script = document.createElement('script');
                script.id = id;
                script.src = src;
                script.async = true;
                script.onload = () => {
                    console.log(`${src} loaded successfully.`);
                    resolve();
                };
                script.onerror = () => {
                    console.error(`Failed to load script: ${src}`);
                    reject(new Error(`Failed to load script: ${src}`));
                };
                document.head.appendChild(script);
            });
        };

        loadScript('tailwind-cdn-script', 'https://cdn.tailwindcss.com')
            .then(() => loadScript('pdfjs-script', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.min.js'))
            .then(() => loadScript('xlsx-script', 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'))
            .then(() => loadScript('jspdf-script', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'))
            .then(() => loadScript('jspdf-autotable-script', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js'))
            .then(() => {
                if (window.pdfjsLib) {
                    window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`;
                    console.log('PDF.js worker source configured.');
                } else {
                    throw new Error('pdfjsLib is not available on window object.');
                }
                setScriptsLoaded(true);
            })
            .catch(error => {
                console.error("Script loading error:", error);
                setErrorMessage(error.message);
                setScriptsLoaded(true); 
            });
    }, []);

    // PDF Thumbnail Rendering Effect
    useEffect(() => {
        if (showPdfImportModal && importedFile && importedFileMimeType === 'application/pdf' && window.pdfjsLib) {
            const renderPdfThumbnails = async () => {
                setIsPdfRendering(true);
                setPdfPageThumbnails([]);
                setSelectedPages(new Set()); 

                try {
                    const pdf = await window.pdfjsLib.getDocument(importedFile).promise;
                    const thumbnails = [];
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const viewport = page.getViewport({ scale: 0.4 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        await page.render({ canvasContext: context, viewport: viewport }).promise;
                        thumbnails.push(canvas.toDataURL());
                    }
                    setPdfPageThumbnails(thumbnails);
                } catch (error) {
                    console.error("Error rendering PDF:", error);
                    setErrorMessage("Could not render PDF thumbnails. The file might be corrupted.");
                } finally {
                    setIsPdfRendering(false);
                }
            };
            renderPdfThumbnails();
        }
    }, [showPdfImportModal, importedFile, importedFileMimeType]);


    // Calculate total inventory value
    useEffect(() => {
        let calculatedTotalValue = 0;
        for (const profile in inventory) {
            const lengths = inventory[profile] || [];
            const weightPerMeter = appSettings.weightPerMeter[profile] || 0;
            const pricePerKg = appSettings.useCommonPrice ? appSettings.commonPricePerKg : appSettings.pricePerKg[profile] || 0;
            lengths.forEach(length => {
                calculatedTotalValue += (length / 1000) * weightPerMeter * pricePerKg;
            });
        }
        setTotalInventoryValue(calculatedTotalValue);
    }, [inventory, appSettings]);

    // Save settings to Firestore
    const saveSettings = async () => {
        if (!db || !userId) { setSaveMessage('Authentication not ready.'); return; }
        setSaveMessage('Saving settings...');
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const settingsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'settings', 'appSettings');
            await setDoc(settingsDocRef, appSettings, { merge: true });
            setSaveMessage('Settings saved successfully!');
        } catch (error) {
            setSaveMessage('Error saving settings.');
        } finally {
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    // Save window data to Firestore
    const saveWindowData = async () => {
        if (!db || !userId) { setSaveMessage('Authentication not ready.'); return; }
        if (!projectName.trim()) { setErrorMessage('Please enter a project name.'); return; }
        setSaveMessage('Saving current project...');
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const projectsCollectionRef = collection(db, 'artifacts', appId, 'users', userId, 'projects');
            const q = query(projectsCollectionRef, where('name', '==', projectName.trim()));
            const querySnapshot = await getDocs(q);
            let targetDocRef = querySnapshot.empty ? doc(projectsCollectionRef) : doc(projectsCollectionRef, querySnapshot.docs[0].id);
            
            await setDoc(targetDocRef, { name: projectName.trim(), windows: windows, createdAt: new Date().toISOString() }, { merge: true });
            setCurrentProjectId(targetDocRef.id);
            setSaveMessage('Current project saved successfully!');
        } catch (error) {
            setSaveMessage('Error saving current project.');
        } finally {
            setTimeout(() => setSaveMessage(''), 3000);
        }
    };

    const addWindow = () => {
        const defaultGlassType = Object.keys(appSettings.glassSettings)[0] || '';
        const defaultHardwareType = Object.keys(appSettings.hardwareSettings)[0] || '';
        setWindows(prev => [...prev, { id: nextWindowId, name: `Window ${nextWindowId}`, width: '', height: '', numTracks: 2, quantity: 1, topLevelSeries: 'Slider Eco Window', selectedFullSeriesName: 'Eco 2 Track', glassType: defaultGlassType, hardwareType: defaultHardwareType }]);
        setNextWindowId(prev => prev + 1);
        setShowResults(false);
    };

    const removeWindow = (id) => {
        setWindows(prev => prev.filter(w => w.id !== id));
        setShowResults(false);
    };

    const updateWindow = (id, field, value) => {
        setWindows(prev => prev.map(w => {
            if (w.id !== id) return w;
            const newWindow = { ...w, [field]: value };
            if (field === 'topLevelSeries') {
                const availableTracks = trackOptionsMap[value] || [];
                const defaultTrack = availableTracks[0] || { value: 2, fullSeriesName: '' };
                newWindow.numTracks = defaultTrack.value;
                newWindow.selectedFullSeriesName = defaultTrack.fullSeriesName;
            } else if (field === 'numTracks') {
                const trackOption = (trackOptionsMap[w.topLevelSeries] || []).find(opt => opt.value === parseFloat(value));
                newWindow.selectedFullSeriesName = trackOption ? trackOption.fullSeriesName : w.selectedFullSeriesName;
            }
            return newWindow;
        }));
        setShowResults(false);
    };

    // --- Settings Update Functions ---
    const updateGlassSetting = (glassType, index, field, value) => {
        setAppSettings(prev => {
            const newGlassSettings = { ...prev.glassSettings };
            newGlassSettings[glassType].sheets[index][field] = parseFloat(value) || 0;
            return { ...prev, glassSettings: newGlassSettings };
        });
    };
    
    const updateGlassTypeSetting = (glassType, field, value) => {
        setAppSettings(prev => {
            const newGlassSettings = { ...prev.glassSettings };
            newGlassSettings[glassType][field] = value;
            return { ...prev, glassSettings: newGlassSettings };
        });
    };

    const addGlassSheetSize = (glassType) => {
        setAppSettings(prev => {
            const newGlassSettings = { ...prev.glassSettings };
            const newId = (newGlassSettings[glassType].sheets.length > 0) ? Math.max(...newGlassSettings[glassType].sheets.map(s => s.id)) + 1 : 1;
            newGlassSettings[glassType].sheets.push({ id: newId, sheetWidth: 2440, sheetHeight: 1830, costPerSqFt: 100 });
            return { ...prev, glassSettings: newGlassSettings };
        });
    };

    const removeGlassSheetSize = (glassType, index) => {
        setAppSettings(prev => {
            const newGlassSettings = { ...prev.glassSettings };
            if (newGlassSettings[glassType].sheets.length > 1) { // Prevent removing the last one
                newGlassSettings[glassType].sheets.splice(index, 1);
            } else {
                setErrorMessage(`Cannot remove the last sheet size for ${glassType}.`);
            }
            return { ...prev, glassSettings: newGlassSettings };
        });
    };
    
    const addNewGlassType = () => {
        const name = newGlassTypeName.trim();
        if (!name || appSettings.glassSettings[name]) {
            setErrorMessage(name ? `Glass type "${name}" already exists.` : 'Glass type name is empty.');
            return;
        }
        setAppSettings(p => ({ ...p, glassSettings: { ...p.glassSettings, [name]: { processingType: 'In-House', purchaseMargin: 10, sheets: [{ id: 1, sheetWidth: 2440, sheetHeight: 1830, costPerSqFt: 100 }] } } }));
        setNewGlassTypeName('');
        setErrorMessage('');
    };

    const updateSetting = (category, key, value) => {
        setAppSettings(prev => {
            const newSettings = { ...prev };
            if (['stockLengths', 'weightPerMeter', 'usableRemittanceThresholds', 'fixedNegligibleWasteLimit', 'pricePerKg', 'hardwareSettings'].includes(category)) {
                if (category === 'hardwareSettings') {
                    newSettings[category][key] = { ...newSettings[category][key], cost: parseFloat(value) || 0 };
                } else {
                    newSettings[category] = { ...newSettings[category], [key]: parseFloat(value) || 0 };
                }
            } else if (category === 'seriesDeductions') {
                const [seriesName, deductionKey] = key.split('.');
                const parsedValue = deductionKey.includes('Profile') ? value : (parseFloat(value) || 0);
                newSettings.seriesDeductions[seriesName] = { ...newSettings.seriesDeductions[seriesName], [deductionKey]: parsedValue };
            } else {
                newSettings[key] = value; // Allow non-numeric for toggles
            }
            return newSettings;
        });
        setShowResults(false);
    };
    
    const addNewHardwareType = () => {
        const name = newHardwareTypeName.trim();
        if (!name || appSettings.hardwareSettings[name]) {
            setErrorMessage(name ? `Hardware type "${name}" already exists.` : 'Hardware type name is empty.');
            return;
        }
        setAppSettings(p => ({ ...p, hardwareSettings: { ...p.hardwareSettings, [name]: { cost: 0 } } }));
        setNewHardwareTypeName('');
        setErrorMessage('');
    };

    const toggleUseCommonPrice = () => setAppSettings(p => ({ ...p, useCommonPrice: !p.useCommonPrice }));
    const updateCommonPrice = (v) => setAppSettings(p => ({ ...p, commonPricePerKg: parseFloat(v) || 0 }));
    const toggleUseCommonStockLength = () => setAppSettings(p => ({ ...p, useCommonStockLength: !p.useCommonStockLength }));
    const updateCommonStockLength = (v) => setAppSettings(p => ({ ...p, commonStockLength: parseFloat(v) || 0 }));

    const addNewProfile = () => {
        const name = newProfileName.trim().toLowerCase();
        if (!name || appSettings.weightPerMeter[name]) {
            setErrorMessage(name ? `Profile "${name}" already exists.` : 'Profile name is empty.');
            return;
        }
        setAppSettings(p => ({ ...p, stockLengths: { ...p.stockLengths, [name]: p.commonStockLength || 5900 }, pricePerKg: { ...p.pricePerKg, [name]: p.commonPricePerKg || 100 }, weightPerMeter: { ...p.weightPerMeter, [name]: 0.5 }, usableRemittanceThresholds: { ...p.usableRemittanceThresholds, [name]: 300 }, fixedNegligibleWasteLimit: { ...p.fixedNegligibleWasteLimit, [name]: 100 } }));
        setInventory(p => ({ ...p, [name]: [] }));
        setNewProfileName('');
        setErrorMessage('');
    };

    const addNewSeries = () => {
        const name = newSeriesName.trim();
        if (!name || appSettings.seriesDeductions[name]) {
            setErrorMessage(name ? `Series "${name}" already exists.` : 'Series name is empty.');
            return;
        }
        setAppSettings(p => ({ ...p, seriesDeductions: { ...p.seriesDeductions, [name]: { sashLengthDeduction: 90, sashWidthOverlap: 50, interlockLengthDeduction: 90, beadingDeduction: 20, screenLengthDeduction: 0, frameProfile: 'frame 60 outer', sashProfile: 'sash 57x42', interlockProfile: 'interlock window', beadingProfile: 'beed 95', screenProfile: 'screen 65x24' } } }));
        setNewSeriesName('');
        setErrorMessage('');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const lines = ev.target.result.split('\n').filter(Boolean);
                if (lines.length < 2) throw new Error("CSV is empty or has only headers.");
                const headers = lines[0].split(',').map(h => h.trim());
                const newWindows = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const data = headers.reduce((obj, header, i) => {
                        let value = values[i] ? values[i].trim() : '';
                        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1).replace(/""/g, '"');
                        obj[header] = ['id', 'width', 'height', 'numTracks', 'quantity'].includes(header) ? parseFloat(value) || 0 : value;
                        return obj;
                    }, {});
                    return data;
                });
                setWindows(newWindows);
                setNextWindowId(newWindows.reduce((max, w) => Math.max(max, w.id), 0) + 1);
                setProjectName(newWindows[0]?.projectName || '');
                setSaveMessage('Data imported successfully!');
            } catch (err) {
                setErrorMessage('Error importing data. Check file format.');
            }
        };
        reader.readAsText(file);
    };

    const importData = () => fileInputRef.current.click();

    const saveProject = async () => {
        if (!db || !userId || !newProjectNameInput.trim()) {
            setErrorMessage('Authentication not ready or project name is empty.');
            return;
        }
        setSaveMessage('Saving project...');
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const newDocRef = doc(collection(db, 'artifacts', appId, 'users', userId, 'projects'));
            await setDoc(newDocRef, { name: newProjectNameInput.trim(), windows: windows, createdAt: new Date().toISOString() });
            setProjectName(newProjectNameInput.trim());
            setCurrentProjectId(newDocRef.id);
            setShowProjectModal(false);
            setSaveMessage('Project saved successfully!');
        } catch (error) {
            setSaveMessage('Error saving project.');
        }
    };

    const loadProject = async (projectId) => {
        if (!db || !userId) return;
        setSaveMessage('Loading project...');
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const docSnap = await getDoc(doc(db, 'artifacts', appId, 'users', userId, 'projects', projectId));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProjectName(data.name || '');
                setWindows(data.windows || []);
                setNextWindowId((data.windows || []).reduce((max, w) => Math.max(max, w.id), 0) + 1);
                setCurrentProjectId(projectId);
                setShowResults(false);
                setSaveMessage(`Project "${data.name}" loaded.`);
            }
        } catch (error) {
            setErrorMessage('Error loading project.');
        } finally {
            setShowProjectModal(false);
        }
    };
    
    const performDeleteProject = async () => {
        if (!db || !userId || !projectToDelete) return;
        try {
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            await deleteDoc(doc(db, 'artifacts', appId, 'users', userId, 'projects', projectToDelete.id));
            if (currentProjectId === projectToDelete.id) {
                setCurrentProjectId(null);
            }
            setSaveMessage('Project deleted.');
        } catch (error) {
            setSaveMessage('Error deleting project.');
        } finally {
            setShowDeleteConfirmModal(false);
            setProjectToDelete(null);
        }
    };

    const performClearWindowData = () => {
        const defaultGlassType = Object.keys(appSettings.glassSettings)[0] || '';
        setWindows([{ id: 1, name: 'Window 1', width: '', height: '', numTracks: 2, quantity: 1, topLevelSeries: 'Slider Eco Window', selectedFullSeriesName: 'Eco 2 Track', glassType: defaultGlassType }]);
        setNextWindowId(2);
        setProjectName('');
        setCurrentProjectId(null);
        setShowResults(false);
        setErrorMessage('');
        setSaveMessage('Window data cleared.');
        setShowClearConfirmModal(false);
    };

    const handleImageFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        setImportedFileName(file.name);
        setImportedFileMimeType(file.type);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImportedFile(reader.result);
            setExtractedMeasurements([]);
            setShowImageImportModal(true);
        };
        reader.onerror = () => {
            setErrorMessage('Failed to read the image file.');
        };
        reader.readAsDataURL(file);
        e.target.value = null;
    };

    const handlePdfFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImportedFileName(file.name);
        setImportedFileMimeType(file.type);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImportedFile(reader.result);
            setExtractedMeasurements([]);
            setShowPdfImportModal(true);
        };
        reader.onerror = () => {
            setErrorMessage('Failed to read the PDF file.');
        };
        reader.readAsDataURL(file);
        e.target.value = null;
    };
    
    const extractMeasurementsFromFile = async () => {
        if (!importedFile) {
            setErrorMessage('No file to process.');
            return;
        }
        setIsExtracting(true);
        setErrorMessage('');
        setExtractedMeasurements([]);
        setExtractionSummary({});

        const base64FileData = importedFile.split(',')[1];
        
        const pagesToAnalyze = Array.from(selectedPages).sort((a, b) => a - b).join(', ');

        let analysisInstruction = `Analyze the provided file (${importedFileMimeType}).`;
        if (pagesToAnalyze && importedFileMimeType === 'application/pdf') {
            analysisInstruction += ` IMPORTANT: Focus your analysis ONLY on the following pages of the PDF: ${pagesToAnalyze}. Ignore all other pages.`;
        } else if (importedFileMimeType === 'application/pdf') {
            analysisInstruction += ` Analyze all pages of the document.`;
        }

        const prompt = `
            ${analysisInstruction}
            Identify all window measurements. For each window, extract its width, height, and the page number it was found on.
            Return the data as a JSON array of objects. Each object must have "width", "height", and "page_number" keys with numerical values.
            If a dimension is given in feet and inches, convert it to millimeters (1 inch = 25.4 mm, 1 foot = 304.8 mm).
            Focus on extracting numerical data from tables or lists if present.
            Example output format: [{"width": 1200, "height": 1500, "page_number": 1}, {"width": 900, "height": 1000, "page_number": 2}]
        `;

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: importedFileMimeType,
                                data: base64FileData
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "width": { "type": "NUMBER" },
                            "height": { "type": "NUMBER" },
                            "page_number": { "type": "NUMBER" }
                        },
                        required: ["width", "height", "page_number"]
                    }
                }
            }
        };
        
        const apiKey = ""; // Will be provided by the environment
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                 if (response.status === 401) {
                     throw new Error('Authentication Error (401): The API key is invalid or missing. This might be a temporary issue with the environment.');
                }
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const jsonText = result.candidates[0].content.parts[0].text;
                const parsedJson = JSON.parse(jsonText);
                setExtractedMeasurements(parsedJson);

                const summary = parsedJson.reduce((acc, item) => {
                    acc[item.page_number] = (acc[item.page_number] || 0) + 1;
                    return acc;
                }, {});
                setExtractionSummary(summary);

            } else {
                console.error("Unexpected API response structure:", result);
                if (result.promptFeedback && result.promptFeedback.blockReason) {
                     setErrorMessage(`File blocked: ${result.promptFeedback.blockReason}. Please try another file.`);
                } else {
                     setErrorMessage('Could not extract measurements. The model did not return valid data. Please check the file or try again.');
                }
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setErrorMessage(error.message || 'An error occurred while processing the file. Please try again.');
        } finally {
            setIsExtracting(false);
        }
    };

    const closeImageModal = () => {
        setShowImageImportModal(false);
        setImportedFile(null);
        setImportedFileName('');
        setExtractedMeasurements([]);
        setExtractionSummary({});
        setIsExtracting(false);
        setShowExportMenu(false);
    };

    const closePdfModal = () => {
        setShowPdfImportModal(false);
        setImportedFile(null);
        setImportedFileName('');
        setPdfPageThumbnails([]);
        setExtractedMeasurements([]);
        setExtractionSummary({});
        setSelectedPages(new Set());
        setIsExtracting(false);
        setIsPdfRendering(false);
        setShowExportMenu(false);
    };

    const applyExtractedMeasurements = () => {
        if (extractedMeasurements.length === 0) {
            setErrorMessage('No measurements to apply.');
            return;
        }
    
        const defaultGlassType = Object.keys(appSettings.glassSettings)[0] || '';
        const defaultHardwareType = Object.keys(appSettings.hardwareSettings)[0] || '';
    
        const isReplacing = windows.length === 1 && windows[0].width === '' && windows[0].height === '';
        let startId = isReplacing ? 1 : nextWindowId;
    
        const newWindows = extractedMeasurements.map((meas, index) => ({
            id: startId + index,
            name: `Window ${startId + index}`,
            width: meas.width || '',
            height: meas.height || '',
            numTracks: 2,
            quantity: 1,
            topLevelSeries: 'Slider Eco Window',
            selectedFullSeriesName: 'Eco 2 Track',
            glassType: defaultGlassType,
            hardwareType: defaultHardwareType
        }));
    
        if (isReplacing) {
            setWindows(newWindows);
            setNextWindowId(newWindows.length + 1);
        } else {
            setWindows(prev => [...prev, ...newWindows]);
            setNextWindowId(startId + newWindows.length);
        }
    
        closeImageModal();
        closePdfModal();
        setSaveMessage(`${newWindows.length} windows added from file.`);
    };

    const handlePageSelect = (pageNumber) => {
        setSelectedPages(prev => {
            const newSet = new Set(prev);
            if (newSet.has(pageNumber)) {
                newSet.delete(pageNumber);
            } else {
                newSet.add(pageNumber);
            }
            return newSet;
        });
    };
    
    const exportToCSV = useCallback(() => {
        if (extractedMeasurements.length === 0) return;
        const headers = ['Window', 'Width (mm)', 'Height (mm)', 'Page'];
        const csvRows = [headers.join(',')];
        extractedMeasurements.forEach((meas, index) => {
            const row = [
                `Window ${index + 1}`,
                meas.width,
                meas.height,
                meas.page_number || 'N/A'
            ];
            csvRows.push(row.join(','));
        });
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${importedFileName.split('.')[0] || 'extracted_measurements'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }, [extractedMeasurements, importedFileName]);

    const exportToExcel = useCallback(() => {
        if (!window.XLSX) {
            setErrorMessage("Excel export library is not loaded yet. Please try again in a moment.");
            return;
        }
        if (extractedMeasurements.length === 0) return;

        const worksheetData = [
            ['Window', 'Width (mm)', 'Height (mm)', 'Page'],
            ...extractedMeasurements.map((meas, index) => [
                `Window ${index + 1}`,
                meas.width,
                meas.height,
                meas.page_number || 'N/A'
            ])
        ];

        const ws = window.XLSX.utils.aoa_to_sheet(worksheetData);
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Measurements");
        
        window.XLSX.writeFile(wb, `${importedFileName.split('.')[0] || 'extracted_measurements'}.xlsx`);
    }, [extractedMeasurements, importedFileName]);

    const exportToPDF = useCallback(async () => {
        if (!window.jspdf || !window.jspdf.jsPDF) {
            setErrorMessage("PDF export library is not loaded yet. Please try again in a moment.");
            return;
        }
        if (extractedMeasurements.length === 0) return;
        setIsExporting(true);
    
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        doc.setFontSize(18);
        doc.text(`Extracted Measurements from ${importedFileName}`, 14, 22);
    
        const addTableAndSave = (startY) => {
            if (startY > 22) { // Add a new page if there's content before the table
                 if (doc.internal.getNumberOfPages() > 1 || startY > doc.internal.pageSize.getHeight() - 50) {
                    doc.addPage();
                    startY = 20;
                 }
            }
            doc.autoTable({
                head: [['Window', 'Width (mm)', 'Height (mm)', 'Page']],
                body: extractedMeasurements.map((meas, index) => [
                    `Window ${index + 1}`,
                    meas.width,
                    meas.height,
                    meas.page_number || 'N/A'
                ]),
                startY: startY,
            });
            doc.save(`${importedFileName.split('.')[0] || 'extracted_measurements'}.pdf`);
            setIsExporting(false);
        };
    
        if (importedFileMimeType.startsWith('image')) {
            const img = new Image();
            img.src = importedFile;
            img.onload = () => {
                try {
                    const imgProps = doc.getImageProperties(img);
                    const pdfWidth = doc.internal.pageSize.getWidth();
                    const pdfHeight = (imgProps.height * (pdfWidth - 28)) / imgProps.width;
                    doc.addImage(img, 'PNG', 14, 40, pdfWidth - 28, pdfHeight);
                    addTableAndSave(pdfHeight + 50);
                } catch (e) {
                    console.error("Error adding image to PDF:", e);
                    setErrorMessage("Could not add image to PDF. Exporting data only.");
                    addTableAndSave(40);
                }
            };
            img.onerror = () => {
                setErrorMessage("Failed to load image for PDF export. Exporting data only.");
                addTableAndSave(40);
            };
        } else if (importedFileMimeType === 'application/pdf') {
            try {
                const pdf = await window.pdfjsLib.getDocument(importedFile).promise;
                let yPos = 40;
                const pageNumbersToRender = selectedPages.size > 0 ? Array.from(selectedPages) : Array.from({ length: pdf.numPages }, (_, i) => i + 1);

                for (let i = 0; i < pageNumbersToRender.length; i++) {
                    const pageNum = pageNumbersToRender[i];
                    if (i > 0) { // Add a new page for subsequent images
                        doc.addPage();
                        yPos = 20;
                    }
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page.render({ canvasContext: context, viewport: viewport }).promise;
                    const imgData = canvas.toDataURL('image/png');
                    
                    const pdfWidth = doc.internal.pageSize.getWidth();
                    const pdfHeight = (canvas.height * (pdfWidth - 28)) / canvas.width;
                    
                    doc.addImage(imgData, 'PNG', 14, yPos, pdfWidth - 28, pdfHeight);
                }
                doc.addPage();
                addTableAndSave(20);
            } catch (error) {
                console.error("Error rendering PDF pages for export:", error);
                setErrorMessage("Could not render PDF pages for export. Exporting data only.");
                addTableAndSave(40);
            }
        } else {
            addTableAndSave(40);
        }
    }, [extractedMeasurements, importedFileName, importedFile, importedFileMimeType, selectedPages]);


    if (!scriptsLoaded || loadingSettings) {
        return <div className="flex items-center justify-center min-h-screen bg-gray-100 text-xl font-semibold">Loading Application...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); body { font-family: 'Inter', sans-serif; } ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #f1f1f1; } ::-webkit-scrollbar-thumb { background: #888; border-radius: 10px; }`}</style>
            <h1 className="text-3xl sm:text-4xl font-bold text-center text-indigo-800 mb-8 sm:mb-10 p-3 bg-indigo-50 shadow-md rounded-lg">Pro OPI</h1>

            {errorMessage && (<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert"><strong className="font-bold">Error!</strong><span className="block sm:inline"> {errorMessage}</span><span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setErrorMessage('')}><svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg></span></div>)}
            {saveMessage && (<div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert"><span className="block sm:inline"> {saveMessage}</span></div>)}

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Panel: Window Inputs */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-y-auto max-h-[80vh]">
                    <h2 className="text-2xl font-semibold text-indigo-700 mb-6 border-b pb-3">Window Configurations</h2>
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm"><label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">Current Project Name</label><input type="text" id="projectName" value={projectName} onChange={(e) => setProjectName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2" placeholder="e.g., My Building Project" /></div>
                    {windows.map(window => (<div key={window.id} className="mb-8 p-6 border border-indigo-200 rounded-lg bg-indigo-50 shadow-sm"><div className="flex justify-between items-center mb-4"><h3 className="text-xl font-medium text-indigo-600">{window.name}</h3>{windows.length > 1 && (<button onClick={() => removeWindow(window.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-semibold shadow-md">Remove</button>)}</div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><div><label htmlFor={`width-${window.id}`} className="block text-sm font-medium">Width (mm)</label><input type="number" id={`width-${window.id}`} value={window.width} onChange={(e) => updateWindow(window.id, 'width', e.target.value)} className="mt-1 block w-full rounded-md p-2" /></div><div><label htmlFor={`height-${window.id}`} className="block text-sm font-medium">Height (mm)</label><input type="number" id={`height-${window.id}`} value={window.height} onChange={(e) => updateWindow(window.id, 'height', e.target.value)} className="mt-1 block w-full rounded-md p-2" /></div><div><label htmlFor={`topLevelSeries-${window.id}`} className="block text-sm font-medium">Series</label><select id={`topLevelSeries-${window.id}`} value={window.topLevelSeries} onChange={(e) => updateWindow(window.id, 'topLevelSeries', e.target.value)} className="mt-1 block w-full rounded-md p-2">{topLevelSeriesOptions.map(o => (<option key={o} value={o}>{o}</option>))}</select></div><div><label htmlFor={`numTracks-${window.id}`} className="block text-sm font-medium">Tracks</label><select id={`numTracks-${window.id}`} value={window.numTracks} onChange={(e) => updateWindow(window.id, 'numTracks', e.target.value)} className="mt-1 block w-full rounded-md p-2">{(trackOptionsMap[window.topLevelSeries] || []).map(t => (<option key={t.value} value={t.value}>{t.label}</option>))}</select></div><div><label htmlFor={`quantity-${window.id}`} className="block text-sm font-medium">Quantity</label><input type="number" id={`quantity-${window.id}`} value={window.quantity} onChange={(e) => updateWindow(window.id, 'quantity', parseInt(e.target.value) || 1)} min="1" className="mt-1 block w-full rounded-md p-2" /></div><div><label htmlFor={`glassType-${window.id}`} className="block text-sm font-medium">Glass Type</label><select id={`glassType-${window.id}`} value={window.glassType} onChange={(e) => updateWindow(window.id, 'glassType', e.target.value)} className="mt-1 block w-full rounded-md p-2">{Object.keys(appSettings.glassSettings).map(g => (<option key={g} value={g}>{g}</option>))}</select></div><div><label htmlFor={`hardwareType-${window.id}`} className="block text-sm font-medium">Hardware Type</label><select id={`hardwareType-${window.id}`} value={window.hardwareType} onChange={(e) => updateWindow(window.id, 'hardwareType', e.target.value)} className="mt-1 block w-full rounded-md p-2">{Object.keys(appSettings.hardwareSettings).map(h => (<option key={h} value={h}>{h}</option>))}</select></div></div><div className="flex justify-center mt-4"><WindowDisplay width={window.width} height={window.height} numTracks={window.numTracks} /></div></div>))}
                    <button onClick={addWindow} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md transform hover:scale-105">Add New Window</button>
                    <div className="mt-6 flex flex-wrap justify-between gap-4"><button onClick={saveWindowData} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow-md min-w-[150px]">Save Project</button><button onClick={() => { setProjectAction('save'); setShowProjectModal(true); setNewProjectNameInput(projectName); }} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-md shadow-md min-w-[150px]">Save As...</button><button onClick={() => { setProjectAction('load'); setShowProjectModal(true); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md min-w-[150px]">Load Project</button></div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
                        <button onClick={importData} className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Import from CSV</button>
                        <input type="file" ref={imageFileInputRef} onChange={handleImageFileChange} accept="image/*" className="hidden" />
                        <button onClick={() => imageFileInputRef.current.click()} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Import from Image</button>
                        <input type="file" ref={pdfFileInputRef} onChange={handlePdfFileChange} accept=".pdf" className="hidden" />
                        <button onClick={() => pdfFileInputRef.current.click()} className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Import from PDF</button>
                    </div>
                    <div className="mt-4"><button onClick={() => setShowClearConfirmModal(true)} className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Clear All Data</button></div>
                </div>

                {/* Right Panel: Settings and Results */}
                <div className="flex-1 bg-white p-6 rounded-xl shadow-lg border border-gray-200 overflow-y-auto max-h-[80vh]">
                    <div className="flex justify-between items-center mb-6 border-b pb-3"><h2 className="text-2xl font-semibold text-indigo-700">Settings & Results</h2><button onClick={() => setShowSettings(!showSettings)} className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md font-semibold shadow-md">{showSettings ? 'Hide' : 'Show'} Settings</button></div>
                    {showSettings && (<div className="mb-8 p-6 border rounded-lg bg-gray-50 shadow-inner space-y-8">
                        <div><h3 className="text-xl font-medium text-gray-700 mb-4 border-b pb-2">Application Settings</h3>
                            {/* General Settings */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div><label className="block text-sm font-medium text-gray-700">Kerf Thickness (mm)</label><input type="number" value={appSettings.kerfThickness} onChange={(e) => updateSetting(null, 'kerfThickness', e.target.value)} className="mt-1 w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700">Welding Thickness (mm)</label><input type="number" value={appSettings.weldingThickness} onChange={(e) => updateSetting(null, 'weldingThickness', e.target.value)} className="mt-1 w-full p-2 border rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-700">Edge Trim (mm)</label><input type="number" value={appSettings.edgeTrimThickness} onChange={(e) => updateSetting(null, 'edgeTrimThickness', e.target.value)} className="mt-1 w-full p-2 border rounded-md"/></div>
                            </div>

                            {/* Hardware Settings */}
                            <div className="mb-6"><h4 className="text-lg font-medium text-gray-700 mb-2">Hardware Settings</h4><div className="space-y-2"> {Object.entries(appSettings.hardwareSettings).map(([name, settings]) => (<div key={name} className="grid grid-cols-2 gap-4 items-center"><label className="text-sm font-medium text-gray-700">{name}</label><input type="number" value={settings.cost} onChange={(e) => updateSetting('hardwareSettings', name, e.target.value)} className="w-full p-1 border rounded-md" /></div>))}</div><div className="mt-4 flex gap-2"><input type="text" placeholder="New Hardware Type" value={newHardwareTypeName} onChange={(e) => setNewHardwareTypeName(e.target.value)} className="flex-1 rounded-md border-gray-300 p-2" /><button onClick={addNewHardwareType} className="bg-indigo-500 text-white px-4 py-2 rounded-md font-semibold shadow-md">Add Hardware</button></div></div>
                            
                            {/* Glass Settings UI */}
                            <div className="mb-6"><h4 className="text-lg font-medium text-gray-700 mb-2">Glass Settings</h4>
                                <div className="mb-4 p-4 border rounded-lg bg-white shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="useDynamicMinGlassCutSize" className="block text-sm font-medium text-gray-700">Use Dynamic Minimum Remnant Size<span className="block text-xs text-gray-500">(Based on glass thickness - 1mm)</span></label>
                                        <input type="checkbox" id="useDynamicMinGlassCutSize" checked={appSettings.useDynamicMinGlassCutSize} onChange={(e) => setAppSettings(prev => ({ ...prev, useDynamicMinGlassCutSize: e.target.checked }))} className="form-checkbox h-5 w-5 text-indigo-600 rounded-md"/>
                                    </div>
                                    {!appSettings.useDynamicMinGlassCutSize && (<div className="mt-4"><label htmlFor="minGlassCutSize" className="block text-sm font-medium text-gray-700">Minimum Remnant Size (mm)</label><input type="number" id="minGlassCutSize" value={appSettings.minGlassCutSize} onChange={(e) => updateSetting(null, 'minGlassCutSize', e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2"/><p className="text-xs text-gray-500 mt-1">Prevents creating unusable slivers of glass.</p></div>)}
                                </div>
                                <div className="space-y-4">{Object.entries(appSettings.glassSettings).map(([glassType, config]) => (<div key={glassType} className="p-4 border rounded-lg bg-white shadow-sm"><h5 className="font-semibold text-indigo-600 mb-3">{glassType}</h5><div className="grid grid-cols-2 gap-4 mb-4"><div><label className="block text-sm font-medium text-gray-700">Processing Type</label><select value={config.processingType} onChange={(e) => updateGlassTypeSetting(glassType, 'processingType', e.target.value)} className="mt-1 block w-full p-2 border rounded-md"><option>In-House</option><option>Outsourced</option></select></div>{config.processingType === 'Outsourced' && (<div><label className="block text-sm font-medium text-gray-700">Purchase Margin (mm)</label><input type="number" value={config.purchaseMargin} onChange={(e) => updateGlassTypeSetting(glassType, 'purchaseMargin', parseFloat(e.target.value) || 0)} className="mt-1 block w-full p-2 border rounded-md" /></div>)}</div><div className="grid grid-cols-4 gap-2 items-center mb-2 text-xs font-medium text-gray-600 px-1"><h6 className="col-span-1">Width (mm)</h6><h6 className="col-span-1">Height (mm)</h6><h6 className="col-span-1">Cost/sq.ft</h6><h6 className="col-span-1"></h6></div>{config.sheets.map((sheet, index) => (<div key={sheet.id} className="grid grid-cols-4 gap-2 items-center mb-2"><input type="number" placeholder="Width" value={sheet.sheetWidth} onChange={(e) => updateGlassSetting(glassType, index, 'sheetWidth', e.target.value)} className="col-span-1 p-1 border rounded-md" /><input type="number" placeholder="Height" value={sheet.sheetHeight} onChange={(e) => updateGlassSetting(glassType, index, 'sheetHeight', e.target.value)} className="col-span-1 p-1 border rounded-md" /><input type="number" placeholder="Cost/sq.ft" value={sheet.costPerSqFt} onChange={(e) => updateGlassSetting(glassType, index, 'costPerSqFt', e.target.value)} className="col-span-1 p-1 border rounded-md" /><button onClick={() => removeGlassSheetSize(glassType, index)} className="bg-red-500 text-white rounded-md px-2 py-1 text-xs">Remove</button></div>))}<button onClick={() => addGlassSheetSize(glassType)} className="w-full mt-2 bg-indigo-200 text-indigo-800 rounded-md py-1 text-sm font-medium">Add Sheet Size</button></div>))}</div>
                                <div className="mt-4 flex gap-2"><input type="text" placeholder="New Glass Type Name" value={newGlassTypeName} onChange={(e) => setNewGlassTypeName(e.target.value)} className="flex-1 rounded-md border-gray-300 p-2" /><button onClick={addNewGlassType} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md font-semibold shadow-md">Add Glass Type</button></div>
                            </div>
                        </div>

                        {/* Profile Settings Table */}
                        <div><h3 className="text-xl font-medium text-gray-700 mb-4 border-b pb-2">Profile Settings</h3><div className="overflow-x-auto"><table className="min-w-full bg-white text-sm"><thead><tr className="bg-gray-200"><th>Profile</th><th>Stock Len (mm)</th><th>Price/kg</th><th>Weight/m</th><th>Usable Rem (mm)</th><th>Negligible Waste (mm)</th></tr></thead><tbody>{allProfileNames.map(p => (<tr key={p} className="border-t"><td className="p-2 font-semibold capitalize">{p}</td><td><input type="number" value={appSettings.stockLengths[p] || ''} onChange={e => updateSetting('stockLengths', p, e.target.value)} className="w-24 p-1 border rounded-md" disabled={appSettings.useCommonStockLength}/></td><td><input type="number" value={appSettings.pricePerKg[p] || ''} onChange={e => updateSetting('pricePerKg', p, e.target.value)} className="w-24 p-1 border rounded-md" disabled={appSettings.useCommonPrice}/></td><td><input type="number" value={appSettings.weightPerMeter[p] || ''} onChange={e => updateSetting('weightPerMeter', p, e.target.value)} className="w-24 p-1 border rounded-md"/></td><td><input type="number" value={appSettings.usableRemittanceThresholds[p] || ''} onChange={e => updateSetting('usableRemittanceThresholds', p, e.target.value)} className="w-24 p-1 border rounded-md"/></td><td><input type="number" value={appSettings.fixedNegligibleWasteLimit[p] || ''} onChange={e => updateSetting('fixedNegligibleWasteLimit', p, e.target.value)} className="w-24 p-1 border rounded-md"/></td></tr>))}</tbody></table></div><div className="mt-4 flex gap-2"><input type="text" placeholder="New Profile Name" value={newProfileName} onChange={e => setNewProfileName(e.target.value)} className="flex-1 rounded-md border-gray-300 p-2"/><button onClick={addNewProfile} className="bg-indigo-500 text-white px-4 py-2 rounded-md font-semibold shadow-md">Add Profile</button></div></div>
                        
                        {/* Series Deductions Section */}
                        <div>
                            <h3 className="text-xl font-medium text-gray-700 mb-4 border-b pb-2">Series Deductions & Profiles</h3>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                {/* Numerical Deductions Table */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-600 mb-2">Numerical Deductions (mm)</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white text-sm">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="p-2 text-left">Series Name</th>
                                                    {numericalDeductionKeys.map(k => <th key={k} className="p-2 text-left capitalize">{k.replace(/([A-Z])/g, ' $1')}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(appSettings.seriesDeductions).map(([seriesName, deductions]) => (
                                                    <tr key={seriesName} className="border-t">
                                                        <td className="p-2 font-semibold">{seriesName}</td>
                                                        {numericalDeductionKeys.map(key => (
                                                            <td key={key} className="p-1">
                                                                <input 
                                                                    type='number' 
                                                                    value={deductions[key] || ''} 
                                                                    onChange={e => updateSetting('seriesDeductions', `${seriesName}.${key}`, e.target.value)} 
                                                                    className="w-full p-1 border rounded-md"
                                                                />
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Profile Assignments Table */}
                                <div>
                                    <h4 className="text-lg font-medium text-gray-600 mb-2">Profile Assignments</h4>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full bg-white text-sm">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    <th className="p-2 text-left">Series Name</th>
                                                    {profileAssignmentKeys.map(k => <th key={k} className="p-2 text-left capitalize">{k.replace(/([A-Z])/g, ' $1')}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(appSettings.seriesDeductions).map(([seriesName, deductions]) => (
                                                    <tr key={seriesName} className="border-t">
                                                        <td className="p-2 font-semibold">{seriesName}</td>
                                                        {profileAssignmentKeys.map(key => (
                                                            <td key={key} className="p-1">
                                                                <select
                                                                    value={deductions[key] || ''}
                                                                    onChange={e => updateSetting('seriesDeductions', `${seriesName}.${key}`, e.target.value)}
                                                                    className="w-full p-1 border rounded-md bg-white"
                                                                >
                                                                    <option value="">Select Profile</option>
                                                                    {allProfileNames.map(profileName => (
                                                                        <option key={profileName} value={profileName}>{profileName}</option>
                                                                    ))}
                                                                </select>
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="New Series Name" 
                                    value={newSeriesName} 
                                    onChange={e => setNewSeriesName(e.target.value)} 
                                    className="flex-1 rounded-md border-gray-300 p-2"
                                />
                                <button 
                                    onClick={addNewSeries} 
                                    className="bg-indigo-500 text-white px-4 py-2 rounded-md font-semibold shadow-md">
                                    Add Series
                                </button>
                            </div>
                        </div>
                        
                        <button onClick={saveSettings} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Save All Settings</button>
                    </div>)}
                    <button onClick={calculateAllParts} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-md shadow-lg transform hover:scale-105 mb-6">Calculate & Optimize</button>
                    {showResults && (<div className="mt-8">
                        <h3 className="text-2xl font-semibold text-indigo-700 mb-4 border-b pb-3">Optimization Results</h3>
                        <div className="bg-blue-50 p-4 rounded-lg shadow-sm mb-6 border border-blue-200"><h4 className="text-lg font-semibold text-blue-800 mb-3">Overall Summary</h4><div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm"><p><span className="font-medium">Total Area:</span> {totalAreaSqMeters.toFixed(2)} m² ({totalAreaSqFeet.toFixed(2)} ft²)</p><p><span className="font-medium">Total Material Cost:</span> ₹{totalMaterialCost.toFixed(2)}</p><p><span className="font-medium">Total Profile Cost:</span> ₹{totalCostOfAllProfiles.toFixed(2)}</p><p><span className="font-medium">Total Glass Cost:</span> ₹{totalGlassCost.toFixed(2)}</p><p><span className="font-medium">Total Hardware Cost:</span> ₹{totalHardwareCost.toFixed(2)}</p><p><span className="font-medium">Rate per m²:</span> ₹{ratePerSqMeter.toFixed(2)}</p><p><span className="font-medium">Rate per ft²:</span> ₹{ratePerSqFeet.toFixed(2)}</p><p><span className="font-medium">Total Utilized Cost:</span> ₹{totalUtilizedMaterialCost.toFixed(2)}</p></div></div>
                        {Object.keys(hardwareSummary).length > 0 && <div className="bg-indigo-50 p-4 rounded-lg shadow-sm mb-6 border border-indigo-200"><h4 className="text-lg font-semibold text-indigo-800 mb-3">Hardware Summary</h4><table className="min-w-full bg-white text-sm"><thead><tr><th className="text-left p-2">Type</th><th className="text-left p-2">Quantity</th><th className="text-right p-2">Total Cost</th></tr></thead><tbody>{Object.entries(hardwareSummary).map(([type, summary]) => (<tr key={type} className="border-t"><td className="p-2">{type}</td><td className="p-2">{summary.quantity}</td><td className="text-right p-2">₹{summary.totalCost.toFixed(2)}</td></tr>))}</tbody></table></div>}
                        {Object.keys(glassCuttingSummary).length > 0 && <div className="bg-teal-50 p-4 rounded-lg shadow-sm mb-6 border border-teal-200"><h4 className="text-lg font-semibold text-teal-800 mb-3">In-House Glass Cutting Summary</h4>{Object.entries(glassCuttingSummary).map(([type, summary]) => (<div key={type} className="border border-teal-300 p-3 rounded-md bg-white"><h5 className="font-semibold text-md text-teal-700">{type}</h5><p className="text-sm"><span className="font-medium">Optimal Sheet:</span> {summary.optimalSheet}</p><p className="text-sm"><span className="font-medium">Sheets Required:</span> {summary.sheetsUsed}</p><p className="text-sm"><span className="font-medium">Total Area Needed:</span> {(summary.totalAreaNeeded / 1_000_000).toFixed(2)} m²</p><p className="text-sm"><span className="font-medium">Total Cost:</span> ₹{summary.totalCost.toFixed(2)}</p><p className="text-sm"><span className="font-medium">Wastage Area:</span> {(summary.wastageArea / 1_000_000).toFixed(2)} m²</p><GlassNestingDiagram packingResult={summary.packingResult} sheetWidth={summary.sheetWidth} sheetHeight={summary.sheetHeight} /></div>))}</div>}
                        {glassPurchaseOrder.length > 0 && <div className="bg-orange-50 p-4 rounded-lg shadow-sm mb-6 border border-orange-200"><h4 className="text-lg font-semibold text-orange-800 mb-3">Glass Purchase Order</h4><table className="min-w-full bg-white text-sm"><thead><tr><th className="text-left p-2">Project</th><th className="text-left p-2">Window</th><th className="text-left p-2">Glass Type</th><th className="text-left p-2">Dimensions (mm / in)</th><th className="text-left p-2">Qty</th></tr></thead><tbody>{glassPurchaseOrder.map((item, i) => <tr key={i} className="border-t"><td className="p-2">{item.projectName.split(' ').map(w=>w[0]).join('')}</td><td className="p-2">{formatWindowNameForPO(item.windowName)}</td><td className="p-2">{item.glassType}</td><td className="p-2">{`${item.width.toFixed(0)}x${item.height.toFixed(0)} mm`} <span className="text-xs text-gray-500">({mmToInchesFractionalString(item.width)} x {mmToInchesFractionalString(item.height)})</span></td><td className="p-2">{item.quantity}</td></tr>)}</tbody></table></div>}
                        <div className="bg-yellow-50 p-4 rounded-lg shadow-sm border border-yellow-200"><h4 className="text-lg font-semibold text-yellow-800 mb-3">Cutting Plan (Detailed)</h4>{Object.keys(combinedCuttingPlan).length > 0 ? (<div className="space-y-6">{Object.entries(combinedCuttingPlan).map(([profile, stocks]) => (stocks.length > 0 && <div key={profile} className="border border-yellow-300 p-4 rounded-md bg-white"><h5 className="font-semibold text-lg text-orange-700 capitalize mb-3">{profile}</h5>{stocks.map(stock => (<div key={stock.id} className="mb-4 p-3 border rounded-md bg-gray-50"><p className="font-medium text-sm mb-2">Stock Bar {stock.id} (Original: {stock.originalLength} mm, Rem: {stock.remainingLength.toFixed(2)} mm - <span className={`font-bold ${getWasteCategory(stock.remainingLength, profile) === 'Usable Profile' ? 'text-green-600' : 'text-red-600'}`}>{getWasteCategory(stock.remainingLength, profile)}</span>)</p><ul className="list-disc list-inside text-xs">{stock.cuts.map((cut, idx) => (<li key={idx}>{cut.type} ({cut.windowName}): {cut.length} mm</li>))}</ul></div>))}</div>))}</div>) : (<p className="text-sm text-gray-500">Run calculation to see cutting plan.</p>)}</div>
                    </div>)}
                </div>
            </div>
            {userId && (<div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full shadow-lg">User ID: {userId}</div>)}
            {showProjectModal && (<div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg mx-4"><div className="flex justify-between items-center mb-6 border-b pb-3"><h3 className="text-2xl font-semibold">{projectAction === 'save' ? 'Save Project As...' : 'Load Project'}</h3><button onClick={() => setShowProjectModal(false)} className="text-xl font-bold">&times;</button></div>{projectAction === 'save' ? (<div><label htmlFor="newProjectName" className="block text-sm font-medium mb-2">Project Name:</label><input type="text" id="newProjectName" value={newProjectNameInput} onChange={(e) => setNewProjectNameInput(e.target.value)} className="w-full rounded-md p-2 mb-4" /><button onClick={saveProject} className="w-full bg-green-600 text-white py-2 rounded-md">Save</button></div>) : (<div><h4 className="text-lg font-medium mb-3">Saved Projects:</h4>{savedProjects.length > 0 ? (<ul className="space-y-3">{savedProjects.map(p => (<li key={p.id} className="flex justify-between items-center p-3 border rounded-md"><div><p>{p.name}</p><p className="text-xs text-gray-500">Saved: {new Date(p.createdAt).toLocaleString()}</p></div><div className="flex gap-2"><button onClick={() => loadProject(p.id)} className="bg-indigo-500 text-white px-3 py-1 rounded-md">Load</button><button onClick={() => { setProjectToDelete({ id: p.id, name: p.name }); setShowDeleteConfirmModal(true); }} className="bg-red-500 text-white px-3 py-1 rounded-md">Delete</button></div></li>))}</ul>) : <p>No projects saved.</p>}</div>)}</div></div>)}
            {showClearConfirmModal && (<div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm mx-4"><h3 className="text-xl font-semibold text-red-700 mb-6">Confirm Clear All Data</h3><p className="mb-6">Are you sure? This cannot be undone.</p><div className="flex justify-end gap-4"><button onClick={() => setShowClearConfirmModal(false)} className="bg-gray-300 py-2 px-4 rounded-md">Cancel</button><button onClick={performClearWindowData} className="bg-red-600 text-white py-2 px-4 rounded-md">Yes, Clear All</button></div></div></div>)}
            {showDeleteConfirmModal && projectToDelete && (<div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm mx-4"><h3 className="text-xl font-semibold text-red-700 mb-6">Confirm Deletion</h3><p className="mb-6">Are you sure you want to delete the project "{projectToDelete.name}"? This cannot be undone.</p><div className="flex justify-end gap-4"><button onClick={() => setShowDeleteConfirmModal(false)} className="bg-gray-300 py-2 px-4 rounded-md">Cancel</button><button onClick={performDeleteProject} className="bg-red-600 text-white py-2 px-4 rounded-md">Yes, Delete</button></div></div></div>)}
            {showImageImportModal && (<div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"><div className="flex justify-between items-center mb-6 border-b pb-3"><h3 className="text-2xl font-semibold">Import Measurements from Image</h3><button onClick={closeImageModal} className="text-xl font-bold">&times;</button></div><div className="mb-4"><p className="text-sm font-medium text-gray-700">File: <span className="font-normal text-gray-900">{importedFileName}</span></p></div><div className="space-y-4">{importedFile && (<div className="text-center"><img src={importedFile} alt="Imported for measurements" className="max-w-full max-h-80 mx-auto border rounded-md"/></div>)}{isExtracting && (<div className="text-center p-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div><p className="mt-2 text-gray-600">Extracting data... Please wait.</p></div>)}{!isExtracting && extractedMeasurements.length > 0 && (<div><h4 className="text-lg font-medium mb-2">Extracted Measurements:</h4><div className="overflow-x-auto border rounded-md"><table className="min-w-full bg-white text-sm"><thead className="bg-gray-100"><tr><th className="p-2 text-left">Window</th><th className="p-2 text-left">Width (mm)</th><th className="p-2 text-left">Height (mm)</th></tr></thead><tbody>{extractedMeasurements.map((meas, index) => (<tr key={index} className="border-t"><td className="p-2">Window {index + 1}</td><td className="p-2">{meas.width}</td><td className="p-2">{meas.height}</td></tr>))}</tbody></table></div></div>)}<div className="mt-6 flex justify-end gap-4">{!isExtracting && (<button onClick={closeImageModal} className="bg-gray-300 py-2 px-4 rounded-md">Cancel</button>)}{extractedMeasurements.length > 0 ? (<><div className="relative"><button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-blue-600 text-white py-2 px-4 rounded-md">Export</button>{showExportMenu && (<div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg border z-20"><button onClick={exportToCSV} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as CSV</button><button onClick={exportToExcel} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as Excel</button><button onClick={exportToPDF} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as PDF with Image</button></div>)}</div><button onClick={applyExtractedMeasurements} className="bg-green-600 text-white py-2 px-4 rounded-md">Apply Measurements</button></>) : (!isExtracting && <button onClick={extractMeasurementsFromFile} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow-md">Extract Measurements</button>)}</div></div></div></div>)}
            {showPdfImportModal && (<div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50"><div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] flex flex-col"><div className="flex justify-between items-center mb-4 border-b pb-3 flex-shrink-0"><h3 className="text-2xl font-semibold">Import Measurements from PDF</h3><button onClick={closePdfModal} className="text-xl font-bold">&times;</button></div><div className="mb-4"><p className="text-sm font-medium text-gray-700">File: <span className="font-normal text-gray-900">{importedFileName}</span></p></div><div className="flex-grow overflow-y-auto"><div className="space-y-4">{isPdfRendering ? (<div className="text-center p-4"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-700 mx-auto"></div><p className="mt-2 text-gray-600">Rendering PDF pages...</p></div>) : (<><div className="mb-4"><p className="text-sm font-medium text-gray-700 mb-2">Select pages to analyze (or leave blank to analyze all):</p><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2 bg-gray-100 rounded-lg">{pdfPageThumbnails.map((thumbnail, index) => (<div key={index} className="relative cursor-pointer" onClick={() => handlePageSelect(index + 1)}><img src={thumbnail} alt={`Page ${index + 1}`} className={`w-full h-auto border-2 rounded-md transition-all ${selectedPages.has(index + 1) ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300'}`} /><div className="absolute bottom-1 right-1 bg-gray-800 text-white text-xs px-1.5 py-0.5 rounded">{index + 1}</div></div>))}</div></div>{Object.keys(extractionSummary).length > 0 && (<div className="mt-4 p-4 border rounded-lg bg-gray-50"><h4 className="text-lg font-medium mb-2">Extraction Summary:</h4><ul className="list-disc list-inside text-sm">{Object.entries(extractionSummary).map(([page, count]) => (<li key={page}>Page {page}: {count} measurement(s) found</li>))}</ul></div>)}</>)} {extractedMeasurements.length > 0 && (<div><h4 className="text-lg font-medium mb-2">Extracted Measurements:</h4><div className="overflow-x-auto border rounded-md"><table className="min-w-full bg-white text-sm"><thead className="bg-gray-100"><tr><th className="p-2 text-left">Window</th><th className="p-2 text-left">Width (mm)</th><th className="p-2 text-left">Height (mm)</th><th className="p-2 text-left">Page</th></tr></thead><tbody>{extractedMeasurements.map((meas, index) => (<tr key={index} className="border-t"><td className="p-2">Window {index + 1}</td><td className="p-2">{meas.width}</td><td className="p-2">{meas.height}</td><td className="p-2">{meas.page_number}</td></tr>))}</tbody></table></div></div>)}</div></div><div className="flex-shrink-0 pt-4 border-t mt-4 flex justify-end gap-4">{isExporting && (<div className="text-center p-2 w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700 mx-auto"></div><p className="mt-2 text-sm text-gray-600">Exporting PDF...</p></div>)}{!isPdfRendering && !isExtracting && !isExporting && (<button onClick={closePdfModal} className="bg-gray-300 py-2 px-4 rounded-md">Cancel</button>)}{isExtracting && (<div className="text-center p-2 w-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-700 mx-auto"></div><p className="mt-2 text-sm text-gray-600">Extracting data...</p></div>)}{!isPdfRendering && !isExtracting && !isExporting && extractedMeasurements.length === 0 && (<button onClick={extractMeasurementsFromFile} className="bg-indigo-600 text-white py-2 px-4 rounded-md">Extract Measurements</button>)}{!isPdfRendering && !isExtracting && !isExporting && extractedMeasurements.length > 0 && (<><div className="relative"><button onClick={() => setShowExportMenu(!showExportMenu)} className="bg-blue-600 text-white py-2 px-4 rounded-md">Export</button>{showExportMenu && (<div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg border z-20"><button onClick={exportToCSV} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as CSV</button><button onClick={exportToExcel} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as Excel</button><button onClick={exportToPDF} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as PDF with Image</button></div>)}</div><button onClick={applyExtractedMeasurements} className="bg-green-600 text-white py-2 px-4 rounded-md">Apply Measurements</button></>)}</div></div></div>)}
        </div>
    );
};

export default App;