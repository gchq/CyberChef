"use strict";

/**
 * Various components for drawing diagrams on an HTML5 canvas.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constant
 * @namespace
 */
var CanvasComponents = {

	draw_line: function(ctx, start_x, start_y, end_x, end_y) {
		ctx.beginPath();
		ctx.moveTo(start_x, start_y);
		ctx.lineTo(end_x, end_y);
		ctx.closePath();
		ctx.stroke();
	},

	draw_bar_chart: function(canvas, scores, x_axis_label, y_axis_label, num_x_labels, num_y_labels, font_size) {
		font_size = font_size || 15;
		if (!num_x_labels || num_x_labels > Math.round(canvas.width / 50)) {
			num_x_labels = Math.round(canvas.width / 50);
		}
		if (!num_y_labels || num_y_labels > Math.round(canvas.width / 50)) {
			num_y_labels = Math.round(canvas.height / 50);
		}
		
		// Graph properties
		var ctx = canvas.getContext("2d"),
			left_padding = canvas.width * 0.08,
			right_padding = canvas.width * 0.03,
			top_padding = canvas.height * 0.08,
			bottom_padding = canvas.height * 0.15,
			graph_height = canvas.height - top_padding - bottom_padding,
			graph_width = canvas.width - left_padding - right_padding,
			base = top_padding + graph_height,
			ceil = top_padding;
			
		ctx.font = font_size + "px Arial";
		
		// Draw axis
		ctx.lineWidth = "1.0";
		ctx.strokeStyle = "#444";
		CanvasComponents.draw_line(ctx, left_padding, base, graph_width + left_padding, base); // x
		CanvasComponents.draw_line(ctx, left_padding, base, left_padding, ceil); // y
		
		// Bar properties
		var bar_padding = graph_width * 0.003,
			bar_width = (graph_width - (bar_padding * scores.length)) / scores.length,
			curr_x = left_padding + bar_padding,
			max = Math.max.apply(Math, scores);
			
		// Draw bars
		ctx.fillStyle = "green";
		for (var i = 0; i < scores.length; i++) {
			var h = scores[i] / max * graph_height;
			ctx.fillRect(curr_x, base - h, bar_width, h);
			curr_x += bar_width + bar_padding;
		}
		
		// Mark x axis
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		curr_x = left_padding + bar_padding;
		if (num_x_labels >= scores.length) {
			// Mark every score
			for (var i = 0; i <= scores.length; i++) {
				ctx.fillText(i, curr_x, base + (bottom_padding * 0.3));
				curr_x += bar_width + bar_padding;
			}
		} else {
			// Mark some scores
			for (var i = 0; i <= num_x_labels; i++) {
				var val = Math.ceil((scores.length / num_x_labels) * i);
				curr_x = (graph_width / num_x_labels) * i + left_padding;
				ctx.fillText(val, curr_x, base + (bottom_padding * 0.3));
			}
		}
		
		// Mark y axis
		ctx.textAlign = "right";
		var curr_y;
		if (num_y_labels >= max) {
			// Mark every increment
			for (var i = 0; i <= max; i++) {
				curr_y = base - (i / max * graph_height) + font_size / 3;
				ctx.fillText(i, left_padding * 0.8, curr_y);
			}
		} else {
			// Mark some increments
			for (var i = 0; i <= num_y_labels; i++) {
				var val = Math.ceil((max / num_y_labels) * i);
				curr_y = base - (val / max * graph_height) + font_size / 3;
				ctx.fillText(val, left_padding * 0.8, curr_y);
			}
		}
		
		// Label x axis
		if (x_axis_label) {
			ctx.textAlign = "center";
			ctx.fillText(x_axis_label, graph_width / 2 + left_padding, base + bottom_padding * 0.8);
		}
		
		// Label y axis
		if (y_axis_label) {
			ctx.save();
			var x = left_padding * 0.3,
				y = graph_height / 2 + top_padding;
			ctx.translate(x, y);
			ctx.rotate(-Math.PI / 2);
			ctx.textAlign = "center";
			ctx.fillText(y_axis_label, 0, 0);
			ctx.restore();
		}
	},
	
	draw_scale_bar: function(canvas, score, max, markings) {
		// Bar properties
		var ctx = canvas.getContext("2d"),
			left_padding = canvas.width * 0.01,
			right_padding = canvas.width * 0.01,
			top_padding = canvas.height * 0.1,
			bottom_padding = canvas.height * 0.3,
			bar_height = canvas.height - top_padding - bottom_padding,
			bar_width = canvas.width - left_padding - right_padding;
		
		// Scale properties
		var proportion = score / max;
		
		// Draw bar outline
		ctx.strokeRect(left_padding, top_padding, bar_width, bar_height);
		
		// Shade in up to proportion
		var grad = ctx.createLinearGradient(left_padding, 0, bar_width + left_padding, 0);
		grad.addColorStop(0, "green");
		grad.addColorStop(0.5, "gold");
		grad.addColorStop(1, "red");
		ctx.fillStyle = grad;
		ctx.fillRect(left_padding, top_padding, bar_width * proportion, bar_height);
		
		// Add markings
		var x0, y0, x1, y1;
		ctx.fillStyle = "black";
		ctx.textAlign = "center";
		ctx.font = "13px Arial";
		for (var i = 0; i < markings.length; i++) {
			// Draw min line down
			x0 = bar_width / max * markings[i].min + left_padding;
			y0 = top_padding + bar_height + (bottom_padding * 0.1);
			x1 = x0;
			y1 = top_padding + bar_height + (bottom_padding * 0.3);
			CanvasComponents.draw_line(ctx, x0, y0, x1, y1);
			
			// Draw max line down
			x0 = bar_width / max * markings[i].max + left_padding;
			x1 = x0;
			CanvasComponents.draw_line(ctx, x0, y0, x1, y1);
			
			// Join min and max lines
			x0 = bar_width / max * markings[i].min + left_padding;
			y0 = top_padding + bar_height + (bottom_padding * 0.3);
			x1 = bar_width / max * markings[i].max + left_padding;
			y1 = y0;
			CanvasComponents.draw_line(ctx, x0, y0, x1, y1);
			
			// Add label
			if (markings[i].max >= max * 0.9) {
				ctx.textAlign = "right";
				x0 = x1;
			} else if (markings[i].max <= max * 0.1) {
				ctx.textAlign = "left";
			} else {
				x0 = x0 + (x1 - x0) / 2;
			}
			y0 = top_padding + bar_height + (bottom_padding * 0.8);
			ctx.fillText(markings[i].label, x0, y0);
		}
	},
	
};