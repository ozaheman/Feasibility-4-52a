// --- START OF FILE actionRecorder.js ---
import { state } from './state.js';
import { handleFinishPolygon } from './eventHandlers.js';
import { placeServiceBlock } from './drawingTools.js';

export const macroState = {
    isRecording: false,
    recordedActions: []
};

/**
 * Starts macro recording.
 */
export function startRecording() {
    macroState.isRecording = true;
    macroState.recordedActions = [];
    document.getElementById('status-bar').textContent = 'Macro recording started...';
    // Optionally alert UI
}

/**
 * Stops macro recording and returns the JSON script.
 */
export function stopRecording() {
    macroState.isRecording = false;
    document.getElementById('status-bar').textContent = 'Macro recording stopped.';
    return JSON.stringify(macroState.recordedActions, null, 2);
}

/**
 * Records a user action to the macro script.
 */
export function recordAction(type, payload) {
    if (!macroState.isRecording) return;

    // To keep the payload serializable, we remove full fabric objects or cyclic references.
    const serializablePayload = JSON.parse(JSON.stringify(payload, (key, value) => {
        // Exclude canvas/fabric specific complex objects if needed, but payload should ideally already be clean
        if (key === 'canvas' || key === 'fabricObject') return undefined;
        return value;
    }));

    macroState.recordedActions.push({
        timestamp: Date.now(),
        type,
        payload: serializablePayload
    });
}

/**
 * Plays back a macro script JSON array sequentially.
 */
export async function playMacroScript(scriptContent) {
    try {
        const actions = JSON.parse(scriptContent);
        if (!Array.isArray(actions)) throw new Error('Invalid macro script format');

        document.getElementById('status-bar').textContent = `Playing macro: ${actions.length} actions...`;

        for (const action of actions) {
            // Need a slight delay to allow rendering between actions
            await new Promise(r => setTimeout(r, 50));

            switch (action.type) {
                case 'FINISH_POLYGON': {
                    if (action.payload.shape) {
                        const points = action.payload.shape.points;
                        const poly = new fabric.Polygon(points, { objectCaching: false });
                        poly.set(action.payload.shape);
                        handleFinishPolygon(poly, action.payload.mode || 'drawingFootprint');
                    }
                    break;
                }
                case 'FINISH_POLYLINE':
                    // Implement polyline finishing similarly if needed
                    break;
                case 'PLACE_BLOCK': {
                    const { position, blockData, level } = action.payload;
                    placeServiceBlock(position, blockData, level);
                    break;
                }
                case 'MOVE_OBJECT':
                    // Need to find object by ID and move it, complex depending on how ID is mapped
                    // For now, this is a placeholder for standard property mutations
                    break;
                default:
                    console.log('Unrecognized macro action:', action.type);
            }
        }
        state.canvas.renderAll();
        document.getElementById('status-bar').textContent = 'Macro playback finished.';
    } catch (e) {
        console.error('Error playing macro:', e);
        document.getElementById('status-bar').textContent = `Macro error: ${e.message}`;
    }
}
// --- END OF FILE actionRecorder.js