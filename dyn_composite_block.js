import { state, setCurrentMode } from './state.js';
import { PREDEFINED_BLOCKS, BLOCK_CATEGORY_COLORS } from './config.js';
import { createCompositeGroup } from './drawingTools.js';

let currentRequirements = null;
let currentPreviewMode = 'requirements'; // 'requirements' or 'selection'
let currentSelectedIndex = -1;

/**
 * Maps block keys to short display labels for the preview panel.
 */
function getShortLabel(key) {
    const k = key.toLowerCase();
    if (k.includes('lift')) return 'LIFT';
    if (k.includes('staircase')) return 'STAIR';
    if (k.includes('electrical')) return 'ELE';
    if (k.includes('garbage')) return 'GARB';
    if (k.includes('water_meter') || k.includes('watermeter')) return 'WATER';
    if (k.includes('pump_room') || k.includes('pumproom')) return 'PUMP';
    if (k.includes('telephone') || k.includes('tele_room')) return 'TELE';
    if (k.includes('substation')) return 'SUB';
    if (k.includes('control_room')) return 'CTRL';
    if (k.includes('lv_room')) return 'LV';
    if (k.includes('ets_room')) return 'ETS';
    if (k.includes('generator')) return 'GEN';
    if (k.includes('gsm')) return 'GSM';
    if (k.includes('rmu')) return 'RMU';
    if (k.includes('btu')) return 'BTU';
    if (k.includes('shaft')) return 'SHAFT';
    if (k.includes('lobby') || k.includes('entrance')) return 'LOBBY';
    if (k.includes('water_tank')) return 'TANK';
    if (k.includes('toilet')) return 'WC';
    if (k.includes('janitor')) return 'JAN';
    if (k.includes('security')) return 'SEC';
    
    // Fallback: first word up to 5 chars
    return key.split('_')[0].substring(0, 5).toUpperCase();
}

/**
 * Determines the category of a block based on its key.
 */
function getBlockCategory(key) {
    const k = key.toLowerCase();
    if (k.includes('lift') || k.includes('staircase')) return 'gfa';
    return 'service';
}

/**
 * Initializes the dynamic composite preview UI and event listeners.
 */
export function initCompositePreview() {
    const drawBtn = document.getElementById('draw-from-preview-btn');
    if (drawBtn) {
        drawBtn.addEventListener('click', () => {
            activateDrawFromPreview();
        });
    }

    const container = document.getElementById('composite-preview-container');
    if (container) {
        container.style.cursor = 'grab';
        container.addEventListener('mousedown', (e) => {
            // Only start drag if we aren't clicking an input
            if (e.target.tagName !== 'INPUT') {
                activateDrawFromPreview();
                // We add a small flag to indicate this started as a drag
                window.isDraggingFromPreview = true;
            }
        });
    }

    const selectEl = document.getElementById('composite-block-select');
    if (selectEl) {
        selectEl.addEventListener('change', (e) => {
            handleSelectCoreChange(e.target.value);
        });
    }

    // Show a default preview initially so it's not empty
    updateCompositePreview({ 
        'Lift_Typical_2.4_2.4': 2, 
        'Comm_Staircase_Typical_6_3': 2, 
        'Electrical_Room_3_3': 1, 
        'Garbage_Room_8_1': 1 
    }, "Standard Core (Default)");
}

/**
 * Handles changes in the composite block selection dropdown.
 */
function handleSelectCoreChange(index) {
    const core = state.userCompositeBlocks[index];
    if (!core) return;

    currentPreviewMode = 'selection';
    currentSelectedIndex = index;

    // Aggregate counts for ALL blocks in the core
    const counts = {};
    core.blocks.forEach(b => {
        counts[b.key] = (counts[b.key] || 0) + 1;
    });

    // Update the preview using the aggregated counts
    updateCompositePreview(counts, `Selected: ${core.name}`);
}

/**
 * Updates the preview container with the latest building requirements or selected core composition.
 * @param {Object} reqs - Map of block keys to counts.
 * @param {string} title - Optional title for the preview box.
 */
export function updateCompositePreview(reqs, title = "Core Requirements Preview") {
    currentRequirements = reqs;
    if (title.includes("Requirements") || title.includes("Default")) {
        currentPreviewMode = 'requirements';
    }

    const container = document.getElementById('composite-preview-container');
    const drawBtn = document.getElementById('draw-from-preview-btn');
    const header = document.querySelector('#composite-preview-wrapper h4');

    if (!container) return;

    if (header) header.textContent = title;
    container.innerHTML = '';
    
    if (!reqs) {
        container.innerHTML = '<p style="color: #999; font-size: 0.8em; text-align: center; width: 100%;">Calculate to see requirements</p>';
        if (drawBtn) {
            drawBtn.disabled = true;
            drawBtn.setAttribute('data-has-reqs', 'false');
        }
        return;
    }

    if (drawBtn) {
        drawBtn.disabled = false;
        drawBtn.setAttribute('data-has-reqs', 'true');
    }

    // NEW: Sync placement data immediately after the requirements are updated
    // This solves the issue where dragging and dropping didn't reflect the preview counts
    syncPlacementData();

    // Create preview items from the reqs map
    Object.entries(reqs).forEach(([key, count]) => {
        if (count === 0 && currentPreviewMode === 'requirements') return;
        
        const labelText = getShortLabel(key);
        const category = getBlockCategory(key);
        
        const blockEl = document.createElement('div');
        blockEl.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            min-width: 60px;
            position: relative;
            margin-right: 20px;
            opacity: ${count > 0 ? 1 : 0.4};
        `;

        const countInput = document.createElement('input');
        countInput.type = 'number';
        countInput.value = count;
        countInput.min = 0;
        countInput.title = "Edit count";
        countInput.style.cssText = `
            position: absolute;
            top: -28px;
            background: white;
            border: 1px solid #333;
            width: 35px;
            padding: 2px 0;
            font-weight: bold;
            font-size: 0.9em;
            box-shadow: 2px 2px 0 rgba(0,0,0,0.2);
            text-align: center;
            border-radius: 0;
        `;
        countInput.addEventListener('input', () => {
            const newVal = parseInt(countInput.value, 10);
            if (!isNaN(newVal)) {
                currentRequirements[key] = newVal;
                
                // Track modification
                const header = document.querySelector('#composite-preview-wrapper h4');
                if (header && !header.textContent.includes('(Modified)')) {
                    header.textContent += ' (Modified)';
                }
                
                // If it was a predefined selection, we are now in 'custom' requirements mode
                if (currentPreviewMode === 'selection') {
                    currentPreviewMode = 'requirements'; 
                }

                // Dynamically update opacity based on new count
                blockEl.style.opacity = newVal > 0 ? 1 : 0.4;

                // Sync the placement data if we are in placement mode or preparing for drag
                if (state.currentMode === 'placingCompositeBlock' || window.isDraggingFromPreview) {
                    syncPlacementData();
                }
            }
        });

        const box = document.createElement('div');
        const colors = BLOCK_CATEGORY_COLORS[category] || { fill: '#ccc' };
        box.style.cssText = `
            width: 40px;
            height: 40px;
            background: ${colors.fill};
            border: 2px solid #333;
            margin-bottom: 5px;
            box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
        `;

        const label = document.createElement('div');
        label.textContent = labelText;
        label.title = key.replace(/_/g, ' '); // Tooltip with full name
        label.style.cssText = `
            font-size: 0.6em;
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            width: 100%;
        `;

        blockEl.appendChild(countInput);
        blockEl.appendChild(box);
        blockEl.appendChild(label);
        container.appendChild(blockEl);
    });
}

/**
 * Synchronizes the window.selectedCompositeBlockData with the current preview state.
 */
export function syncPlacementData() {
    const header = document.querySelector('#composite-preview-wrapper h4');
    const currentTitle = header ? header.textContent : "Automatic Core";
    
    if (currentPreviewMode === 'selection' && currentSelectedIndex !== -1) {
        const coreData = state.userCompositeBlocks[currentSelectedIndex];
        if (coreData) {
            window.selectedCompositeBlockData = JSON.parse(JSON.stringify(coreData));
            return;
        }
    }

    if (!currentRequirements) return;

    // Determine the level for the new core
    // If we were modifying a selection, use its level. Otherwise use current state level.
    let targetLevel = state.currentLevel;
    if (currentSelectedIndex !== -1 && state.userCompositeBlocks[currentSelectedIndex]) {
        targetLevel = state.userCompositeBlocks[currentSelectedIndex].level || targetLevel;
    }

    // Create a temporary composite definition (Dynamic Version)
    const dynamicComposite = {
        name: currentTitle,
        level: targetLevel,
        blocks: []
    };

    let offsetX = 0;
    const padding = 2; // meters between blocks

    // Group blocks by category for a cleaner "core" layout
    const keys = Object.keys(currentRequirements).sort((a, b) => {
        const catA = getBlockCategory(a);
        const catB = getBlockCategory(b);
        if (catA === catB) return a.localeCompare(b);
        return catA === 'gfa' ? -1 : 1;
    });

    keys.forEach(key => {
        const count = currentRequirements[key];
        if (count <= 0) return;
        
        let blockData = PREDEFINED_BLOCKS[key];
        
        if (!blockData) {
            const lowerKey = key.toLowerCase();
            const foundKey = Object.keys(PREDEFINED_BLOCKS).find(k => k.toLowerCase() === lowerKey);
            if (foundKey) blockData = PREDEFINED_BLOCKS[foundKey];
        }

        if (!blockData) {
            console.warn(`[Composite] No block definition found for key: ${key}`);
            return;
        }

        for (let i = 0; i < count; i++) {
            dynamicComposite.blocks.push({
                key: blockData.key || key,
                x: offsetX,
                y: 0,
                w: blockData.width,
                h: blockData.height
            });
            offsetX += blockData.width + padding;
        }
    });

    if (dynamicComposite.blocks.length > 0) {
        window.selectedCompositeBlockData = dynamicComposite;
        console.log(`[Composite] Synchronized dynamic core "${dynamicComposite.name}" for level ${dynamicComposite.level} with ${dynamicComposite.blocks.length} blocks.`);
    }
}

/**
 * Enters placement mode for a composite block matching the current requirements or selection.
 */
function activateDrawFromPreview() {
    syncPlacementData();
    
    if (!window.selectedCompositeBlockData) return;

    setCurrentMode('placingCompositeBlock');
    
    const name = window.selectedCompositeBlockData.name || "Automatic Core";
    document.getElementById('status-bar').textContent = 
        `Click on canvas to place the ${name}.`;
}
