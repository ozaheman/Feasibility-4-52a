import { state, resetState, setScale, rehydrateProgram } from './state.js';
import { PROJECT_PROGRAMS } from './config.js';
import { setCanvasBackground } from './canvasController.js';

let autoSaveIntervalId = null;
const AUTO_SAVE_INTERVAL_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Searches the canvas for a plot geometry and returns its ID/No if available.
 */
export function detectPlotNumber() {
    const plotObj = state.canvas.getObjects().find(o => o.isPlot || o.isPlotPolygon);
    if (plotObj && plotObj.blockData && plotObj.blockData.name) {
        return plotObj.blockData.name.replace(/[^a-zA-Z0-9_-]/g, '_');
    }
    return 'plot_unknown';
}

/**
 * Serializes the current fabric canvas state and app parameters to a JSON script.
 */
export function generateStateScript(includeBg = true) {
    const customProps = ['level', 'isServiceBlock', 'blockData', 'blockId', 'isPlot', 'isPlotPolygon', 'isFootprint', 'isCompositeGroup', 'compositeDefName', 'isParkingRow', 'parkingParams', 'parkingCount', 'isGuide', 'isDxfOverlay', 'linkedBlockId', 'isImportedGeometry', 'isGeometryGroup', 'geometryGroupName', 'layerName'];

    const canvasObjects = state.canvas.getObjects().filter(obj => !obj.isSnapPoint && !obj.isEdgeHighlight && !obj.isSnapIndicator);
    const fabricData = canvasObjects.map(obj => obj.toObject(customProps));

    let bgSrc = null;
    if (includeBg && state.canvas.backgroundImage) {
        if (typeof state.canvas.backgroundImage.getSrc === 'function') {
            bgSrc = state.canvas.backgroundImage.getSrc();
        } else if (state.canvas.backgroundImage.src) {
            bgSrc = state.canvas.backgroundImage.src;
        }
    }

    const statePayload = {
        timestamp: Date.now(),
        plotNumber: detectPlotNumber(),
        scale: state.scale,
        projectType: state.projectType,
        programData: state.currentProgram,
        userCompositeBlocks: state.userCompositeBlocks,
        plotEdgeProperties: state.plotEdgeProperties,
        backgroundImage: bgSrc,
        canvasObjects: fabricData
    };

    return JSON.stringify(statePayload, null, 2);
}

/**
 * Auto-saves the state script to localStorage.
 */
export function performAutoSave() {
    const script = generateStateScript(false); // Do not include background to avoid QuotaExceededError 
    const plotNo = detectPlotNumber();
    try {
        localStorage.setItem(`feasibility_autosave_${plotNo}`, script);
        console.log(`Auto-saved state script for plot ${plotNo} at ${new Date().toLocaleTimeString()}`);
        const sb = document.getElementById('status-bar');
        if (sb) sb.textContent = `Auto-saved successfully (Plot: ${plotNo})`;
    } catch (e) {
        console.warn("Autosave failed. Error (likely quota exceeded):", e);
    }
}

/**
 * Starts the interval for auto-saving state scripts.
 */
export function startAutoSave() {
    if (autoSaveIntervalId) clearInterval(autoSaveIntervalId);
    autoSaveIntervalId = setInterval(performAutoSave, AUTO_SAVE_INTERVAL_MS);
}

/**
 * Stops auto-saving.
 */
export function stopAutoSave() {
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
    }
}

/**
 * Parses and loads a State Script JSON into the canvas.
 */
export async function loadStateScript(scriptContent, clearCanvas = true) {
    try {
        const payload = JSON.parse(scriptContent);
        if (!payload.canvasObjects) throw new Error("Invalid state script data.");

        // Clear existing canvas if requested
        if (clearCanvas) {
            state.canvas.clear();
            if (payload.backgroundImage) {
                setCanvasBackground(payload.backgroundImage);
            }
        }

        // Restore scale
        if (payload.scale && payload.scale.pixels > 0 && payload.scale.meters > 0) {
            setScale(payload.scale.pixels, payload.scale.meters);
        }

        // Restore properties
        state.projectType = payload.projectType || 'Residential';
        const projectSelect = document.getElementById('project-type-select');
        if (projectSelect) projectSelect.value = state.projectType;

        if (payload.programData) {
            const masterProgram = PROJECT_PROGRAMS[state.projectType];
            state.currentProgram = rehydrateProgram(payload.programData, masterProgram);
        }

        state.userCompositeBlocks = payload.userCompositeBlocks || [];
        state.plotEdgeProperties = payload.plotEdgeProperties || {};

        // Important: levels to be non-selectable by default
        const nonSelectableLevels = ['Typical_Floor', 'Ground_Floor', 'Podium', 'Podium_Last', 'Roof', 'Plot', 'Basement', 'Basement_Last'];

        // Enliven canvas objects
        await new Promise((resolve) => {
            fabric.util.enlivenObjects(payload.canvasObjects, (enlivenedObjects) => {
                enlivenedObjects.forEach((obj) => {
                    const originalData = payload.canvasObjects.find(d =>
                        (d.blockId === obj.blockId) ||
                        (d.left === obj.left && d.top === obj.top)
                    ) || {};

                    if (nonSelectableLevels.includes(originalData.level) ||
                        originalData.isPlot || originalData.isPlotPolygon || originalData.isParkingRow) {
                        obj.set({ selectable: false, evented: false });
                    }

                    if (obj.isCompositeGroup) {
                        obj.forEachObject(subObj => subObj.set({ selectable: false, evented: false }));
                    }

                    state.canvas.add(obj);
                });
                resolve();
            });
        });

        state.canvas.renderAll();
        if (typeof window.refreshServiceBlockLabels === 'function') window.refreshServiceBlockLabels();

        document.getElementById('status-bar').textContent = 'State Script loaded successfully.';
    } catch (e) {
        console.error("Failed to load State Script:", e);
        document.getElementById('status-bar').textContent = `Error loading script: ${e.message}`;
    }
}
