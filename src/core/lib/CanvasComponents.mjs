/**
 * Various components for drawing diagrams on an HTML5 canvas.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * Draws a line from one point to another
 *
 * @param ctx
 * @param startX
 * @param startY
 * @param endX
 * @param endY
 */
export function drawLine(ctx, startX, startY, endX, endY) {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.closePath();
    ctx.stroke();
}

/**
 * Draws a bar chart on the canvas.
 *
 * @param canvas
 * @param scores
 * @param xAxisLabel
 * @param yAxisLabel
 * @param numXLabels
 * @param numYLabels
 * @param fontSize
 */
export function drawBarChart(
    canvas,
    scores,
    xAxisLabel,
    yAxisLabel,
    numXLabels,
    numYLabels,
    fontSize,
) {
    fontSize = fontSize || 15;
    if (!numXLabels || numXLabels > Math.round(canvas.width / 50)) {
        numXLabels = Math.round(canvas.width / 50);
    }
    if (!numYLabels || numYLabels > Math.round(canvas.width / 50)) {
        numYLabels = Math.round(canvas.height / 50);
    }

    // Graph properties
    const ctx = canvas.getContext("2d"),
        leftPadding = canvas.width * 0.08,
        rightPadding = canvas.width * 0.03,
        topPadding = canvas.height * 0.08,
        bottomPadding = canvas.height * 0.2,
        graphHeight = canvas.height - topPadding - bottomPadding,
        graphWidth = canvas.width - leftPadding - rightPadding,
        base = topPadding + graphHeight,
        ceil = topPadding;

    ctx.font = fontSize + "px Arial";

    // Draw axis
    ctx.lineWidth = "1.0";
    ctx.strokeStyle = "#444";
    drawLine(ctx, leftPadding, base, graphWidth + leftPadding, base); // x
    drawLine(ctx, leftPadding, base, leftPadding, ceil); // y

    // Bar properties
    const barPadding = graphWidth * 0.003,
        barWidth = (graphWidth - barPadding * scores.length) / scores.length,
        max = Math.max.apply(Math, scores);
    let currX = leftPadding + barPadding;

    // Draw bars
    ctx.fillStyle = "green";
    for (let i = 0; i < scores.length; i++) {
        const h = (scores[i] / max) * graphHeight;
        ctx.fillRect(currX, base - h, barWidth, h);
        currX += barWidth + barPadding;
    }

    // Mark x axis
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    currX = leftPadding + barPadding;
    if (numXLabels >= scores.length) {
        // Mark every score
        for (let i = 0; i <= scores.length; i++) {
            ctx.fillText(i, currX, base + bottomPadding * 0.3);
            currX += barWidth + barPadding;
        }
    } else {
        // Mark some scores
        for (let i = 0; i <= numXLabels; i++) {
            const val = Math.ceil((scores.length / numXLabels) * i);
            currX = (graphWidth / numXLabels) * i + leftPadding;
            ctx.fillText(val, currX, base + bottomPadding * 0.3);
        }
    }

    // Mark y axis
    ctx.textAlign = "right";
    let currY;
    if (numYLabels >= max) {
        // Mark every increment
        for (let i = 0; i <= max; i++) {
            currY = base - (i / max) * graphHeight + fontSize / 3;
            ctx.fillText(i, leftPadding * 0.8, currY);
        }
    } else {
        // Mark some increments
        for (let i = 0; i <= numYLabels; i++) {
            const val = Math.ceil((max / numYLabels) * i);
            currY = base - (val / max) * graphHeight + fontSize / 3;
            ctx.fillText(val, leftPadding * 0.8, currY);
        }
    }

    // Label x axis
    if (xAxisLabel) {
        ctx.textAlign = "center";
        ctx.fillText(
            xAxisLabel,
            graphWidth / 2 + leftPadding,
            base + bottomPadding * 0.8,
        );
    }

    // Label y axis
    if (yAxisLabel) {
        ctx.save();
        const x = leftPadding * 0.3,
            y = graphHeight / 2 + topPadding;
        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillText(yAxisLabel, 0, 0);
        ctx.restore();
    }
}

/**
 * Draws a scale bar on the canvas.
 *
 * @param canvas
 * @param score
 * @param max
 * @param markings
 */
export function drawScaleBar(canvas, score, max, markings) {
    // Bar properties
    const ctx = canvas.getContext("2d"),
        leftPadding = canvas.width * 0.01,
        rightPadding = canvas.width * 0.01,
        topPadding = canvas.height * 0.1,
        bottomPadding = canvas.height * 0.35,
        barHeight = canvas.height - topPadding - bottomPadding,
        barWidth = canvas.width - leftPadding - rightPadding;

    // Scale properties
    const proportion = score / max;

    // Draw bar outline
    ctx.strokeRect(leftPadding, topPadding, barWidth, barHeight);

    // Shade in up to proportion
    const grad = ctx.createLinearGradient(
        leftPadding,
        0,
        barWidth + leftPadding,
        0,
    );
    grad.addColorStop(0, "green");
    grad.addColorStop(0.5, "gold");
    grad.addColorStop(1, "red");
    ctx.fillStyle = grad;
    ctx.fillRect(leftPadding, topPadding, barWidth * proportion, barHeight);

    // Add markings
    let x0, y0, x1, y1;
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.font = "13px Arial";
    for (let i = 0; i < markings.length; i++) {
        // Draw min line down
        x0 = (barWidth / max) * markings[i].min + leftPadding;
        y0 = topPadding + barHeight + bottomPadding * 0.1;
        x1 = x0;
        y1 = topPadding + barHeight + bottomPadding * 0.3;
        drawLine(ctx, x0, y0, x1, y1);

        // Draw max line down
        x0 = (barWidth / max) * markings[i].max + leftPadding;
        x1 = x0;
        drawLine(ctx, x0, y0, x1, y1);

        // Join min and max lines
        x0 = (barWidth / max) * markings[i].min + leftPadding;
        y0 = topPadding + barHeight + bottomPadding * 0.3;
        x1 = (barWidth / max) * markings[i].max + leftPadding;
        y1 = y0;
        drawLine(ctx, x0, y0, x1, y1);

        // Add label
        if (markings[i].max >= max * 0.9) {
            ctx.textAlign = "right";
            x0 = x1;
        } else if (markings[i].max <= max * 0.1) {
            ctx.textAlign = "left";
        } else {
            x0 = x0 + (x1 - x0) / 2;
        }
        y0 = topPadding + barHeight + bottomPadding * 0.8;
        ctx.fillText(markings[i].label, x0, y0);
    }
}
