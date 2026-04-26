window.objectToAlign = null;
window.currentLevelOp = { mode: null, object: null };
window.currentlyEditingCompositeIndex = -1;
window.tempCompositeData = null;
window.currentPdfData = null; // Manage PDF buffer here for file handling flow
window.isMeasuring = false;
window.scalePoint1 = null;

window.snapIndicators;
window.scaleLine = null;
window.edgeSnapIndicator =null;
window.currentDrawingPolygon = null;
window.guideLine = null;
window.overlayCtx=null;
window.overlayCanvas=null;

window.parkingStartPoint = null;
window.parkingLine = null;
window.selectedCompositeBlockData = null;

window.edgeSnapIndicator = null;
window.isEditingGroup = false;
window.groupBeingEdited = null;
window.snapThreshold = 15; // Pixels for snapping
window.addDrawingPoint=null;
window.measurePoint1 = null;

window.finalpolygonPoints = [];
window.polygonPoints = [];
window.isPanning =false;
window.alignmentHighlight=null,
window.lastPanPoint=null; 
window.scaleReady=null;
window.currentlyEditingUnitKey = null;
window.tempUnitData= null;
window.inputs = {};
import { initCanvas, getCanvas } from './canvasController.js';
import { initUI, updateUI } from './uiController.js';
import { initDrawingTools } from './drawingTools.js';
import { init3D } from './viewer3d.js';
import { setupEventListeners } from './eventHandlers.js';
import { resetState, state } from './state.js';
import { loadFromAutosave, autosaveToLocalStorage } from './io.js';


document.addEventListener('DOMContentLoaded', async () => {
    // --- MODIFICATION START: Set the pdf.js worker source to match the library version. ---
    if (window.pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;
    }
    initCanvas('plot-canvas', 'overlay-canvas');
    initDrawingTools();
    init3D();
    initUI();
    setupEventListeners();
    resetState();

    const canvas = getCanvas();
    const loaded = await loadFromAutosave(canvas);
    if (!loaded) {
        updateUI();
    }

    // Set up periodic autosave every 10 seconds for crash recovery
    setInterval(() => {
        autosaveToLocalStorage();
    }, 10000);

    // Set up rolling autosave every 5 minutes (5 iterations max)
    setInterval(() => {
        if (window.rollingAutosave) {
            window.rollingAutosave();
        } else {
            // Import dynamically if needed or just rely on the imported version if we add it
            import('./io.js').then(module => {
                if (module.rollingAutosave) module.rollingAutosave();
            });
        }
    }, 300000);
});