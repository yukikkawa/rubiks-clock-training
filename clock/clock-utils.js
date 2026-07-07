/**
 * Rubik's Clock Common Utilities
 */

// 定数をグローバルに定義（どのファイルからも参照可能）
const COLORS = {
    leftHand: '#f06595',
    rightHand: '#339af0',
    defaultSolve: '#ff922b'
};

const ClockUtils = {
    /**
     * Dynamically creates a clock SVG element.
     * @param {string} id - Unique identifier (e.g. 'left', 'F00')
     * @param {Object} options - Configuration options
     * @returns {SVGElement} The constructed SVG element
     */
    createClockSVG(id, options = {}) {
        const isFront = options.isFront !== false;
        const className = options.className || 'sub-clock';
        const isCornerClickable = !!options.isCornerClickable;
        const clickHandler = options.clickHandler || null;
        const handId = options.handId || `hand-${id}`;

        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("class", className);
        svg.setAttribute("id", `container-${id}`);
        svg.setAttribute("viewBox", "0 0 100 100");

        if (isCornerClickable) {
            const cx = id[1], cy = id[2];
            const isCorner = (cx === '0' || cx === '2') && (cy === '0' || cy === '2');
            if (isCorner && clickHandler) {
                svg.classList.add('clickable');
                svg.onclick = () => clickHandler(id);
            }
        }

        const borderStroke = isFront ? "#0288d1" : "#3f51b5";

        // テンプレート文字列内で COLORS を正しく参照
        svg.innerHTML = `
            <circle cx="50" cy="50" r="45" fill="none" stroke="${borderStroke}" stroke-width="2"/>
            <circle id="dot-${id}" cx="50" cy="12" r="3" fill="#f03e3e"/>
            <g id="ticks-${id}"></g>
            <line id="${handId}" x1="50" y1="50" x2="50" y2="15" stroke="#212529" stroke-width="5" stroke-linecap="round"/>
            <defs>
                <marker id="solve-arrow-head-left" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${COLORS.leftHand}" opacity="0.80"/>
                </marker>
                <marker id="solve-arrow-head-right" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="${COLORS.rightHand}" opacity="0.80"/>
                </marker>
            </defs>
        `;

        const ticksGroup = svg.querySelector(`#ticks-${id}`);
        if (ticksGroup) {
            this.renderTicks(ticksGroup, false);
        }

        return svg;
    },

    /**
     * Renders 11 ticks inside a given SVG group element.
     * @param {SVGElement} ticksGroupElement - The SVG group to fill with ticks
     * @param {boolean} isFlipped - Whether to render ticks flipped (180 degrees)
     */
    renderTicks(ticksGroupElement, isFlipped) {
        if (!ticksGroupElement) return;
        ticksGroupElement.innerHTML = '';
        const dotColor = "#495057";
        const baseAngles = [30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

        let html = '';
        baseAngles.forEach(angle => {
            const finalAngle = isFlipped ? (angle + 180) % 360 : angle;
            const rad = (finalAngle - 90) * Math.PI / 180;
            const cx = 50 + 38 * Math.cos(rad);
            const cy = 50 + 38 * Math.sin(rad);
            html += `<circle cx="${cx}" cy="${cy}" r="2" fill="${dotColor}"/>`;
        });
        ticksGroupElement.innerHTML = html;
    },

    /**
     * Calculates the shortest angle difference between current angle and target hour (-180 to +180 degrees).
     * @param {number} currentAngle - The current rotation angle in degrees
     * @param {number} targetHour - Target hour (0-11)
     * @returns {number} The angular difference in degrees
     */
    calcShortestAngleDiff(currentAngle, targetHour) {
        const targetAngleBase = targetHour * 30;
        let diff = (targetAngleBase - currentAngle) % 360;
        if (diff < -180) diff += 360;
        if (diff > 180) diff -= 360;
        return diff;
    },

    /**
     * Updates a clock hand's rotation angle using shortest path animation or instant transition.
     * @param {SVGElement} handElement - The line element representing the hand
     * @param {Object} currentAngleMap - Map storing current angles (e.g. state.visualAngles)
     * @param {string} handId - Identifier key in the angle map
     * @param {number} targetHour - Target hour to rotate to
     * @param {boolean} instant - Whether to skip transition animation
     * @param {Function} [customDiffCalculator] - Optional custom calculator for angle difference
     */
    updateHandAngle(handElement, currentAngleMap, handId, targetHour, instant = false, customDiffCalculator = null) {
        if (!handElement) return;

        const targetAngleBase = targetHour * 30;
        const currentAngle = currentAngleMap[handId] || 0;

        if (instant) {
            currentAngleMap[handId] = targetAngleBase;
            handElement.style.transform = `rotate(${targetAngleBase}deg)`;
        } else {
            let diff = customDiffCalculator ? customDiffCalculator(currentAngle, targetHour) : this.calcShortestAngleDiff(currentAngle, targetHour);
            let newAngle = currentAngle + diff;
            currentAngleMap[handId] = newAngle;
            handElement.style.transform = `rotate(${newAngle}deg)`;
        }
    }
};