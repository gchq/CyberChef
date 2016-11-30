import $ from 'jquery';
import Utils from '../../core/Utils';
import CanvasComponents from './utils/CanvasComponents';

const inlineFuncs = {
  colorpicker({ rgba }) {
    $('#colorpicker').colorpicker({
      format: 'rgba',
      color: rgba,
      container: true,
      inline: true,
    }).on('changeColor', (e) => {
      const { r, g, b, a } = e.color.toRGB();
      const css = `rgba(${r}, ${g}, ${b}, ${a})`;
      document.getElementById('input-text').value = css;
      window.app.auto_bake();
    });
  },
  entropy({ entropy }) {
    const canvas = document.getElementById('chart-area');
    const parent_rect = canvas.parentNode.getBoundingClientRect();
    const height = parent_rect.height * 0.25;
    canvas.width = parent_rect.width * 0.95;
    canvas.height = height > 150 ? 150 : height;
    CanvasComponents.draw_scale_bar(canvas, entropy, 8, [
      {
        label: 'English text',
        min: 3.5,
        max: 5,
      }, {
        label: 'Encrypted/compressed',
        min: 7.5,
        max: 8,
      },
    ]);
  },
  freq({ percentages }) {
    const scores = JSON.parse(percentages);
    const canvas = document.getElementById('chart-area');
    const parent_rect = canvas.parentNode.getBoundingClientRect();
    canvas.width = parent_rect.width * 0.95;
    canvas.height = parent_rect.height * 0.9;
    CanvasComponents.draw_bar_chart(canvas, scores, 'Byte', 'Frequency %', 16, 6);
  },
};

/**
 * Waiter to handle events related to the output.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 *
 * @constructor
 * @param {HTMLApp} app - The main view object for CyberChef.
 * @param {Manager} manager - The CyberChef event manager.
 */
export default function OutputWaiter(app, manager) {
  this.app = app;
  this.manager = manager;
}


/**
 * Gets the output string from the output textarea.
 *
 * @returns {string}
 */
OutputWaiter.prototype.get = function () {
  return document.getElementById('output-text').value;
};


/**
 * Sets the output in the output textarea.
 *
 * @param {string} data_str - The output string/HTML
 * @param {string} type - The data type of the output
 * @param {number} duration - The length of time (ms) it took to generate the output
 */
OutputWaiter.prototype.set = function (data_str, type, duration) {
  let output_text = document.getElementById('output-text'),
    output_html = document.getElementById('output-html'),
    output_highlighter = document.getElementById('output-highlighter'),
    input_highlighter = document.getElementById('input-highlighter');

  if (type == 'html') {
    output_text.style.display = 'none';
    output_html.style.display = 'block';
    output_highlighter.display = 'none';
    input_highlighter.display = 'none';

    output_text.value = '';
    output_html.innerHTML = data_str;

        // Execute script sections
    const script_elements = output_html.querySelectorAll('[data-cyber-chef-func]');
    for (let i = 0; i < script_elements.length; i++) {
      const el = script_elements[i];
      const data = el.dataset;
      const func = inlineFuncs[data.cyberChefFunc];
      try {
        func(data);
      } catch (err) {
        console.error(err);
      }
    }
  } else {
    output_text.style.display = 'block';
    output_html.style.display = 'none';
    output_highlighter.display = 'block';
    input_highlighter.display = 'block';

    output_text.value = Utils.printable(data_str, true);
    output_html.innerHTML = '';
  }

  this.manager.highlighter.remove_highlights();
  const lines = data_str.count('\n') + 1;
  this.set_output_info(data_str.length, lines, duration);
};


/**
 * Displays information about the output.
 *
 * @param {number} length - The length of the current output string
 * @param {number} lines - The number of the lines in the current output string
 * @param {number} duration - The length of time (ms) it took to generate the output
 */
OutputWaiter.prototype.set_output_info = function (length, lines, duration) {
  let width = length.toString().length;
  width = width < 4 ? 4 : width;

  const length_str = Utils.pad(length.toString(), width, ' ').replace(/ /g, '&nbsp;');
  const lines_str = Utils.pad(lines.toString(), width, ' ').replace(/ /g, '&nbsp;');
  const time_str = Utils.pad(`${duration.toString()}ms`, width, ' ').replace(/ /g, '&nbsp;');

  document.getElementById('output-info').innerHTML = `time: ${time_str
        }<br>length: ${length_str
        }<br>lines: ${lines_str}`;
  document.getElementById('input-selection-info').innerHTML = '';
  document.getElementById('output-selection-info').innerHTML = '';
};


/**
 * Handler for save click events.
 * Saves the current output to a file, downloaded as a URL octet stream.
 */
OutputWaiter.prototype.save_click = function () {
  let data = Utils.to_base64(this.app.dish_str),
    filename = window.prompt('Please enter a filename:', 'download.dat');

  if (filename) {
    const el = document.createElement('a');
    el.setAttribute('href', `data:application/octet-stream;base64;charset=utf-8,${data}`);
    el.setAttribute('download', filename);

        // Firefox requires that the element be added to the DOM before it can be clicked
    el.style.display = 'none';
    document.body.appendChild(el);

    el.click();
    el.remove();
  }
};


/**
 * Handler for switch click events.
 * Moves the current output into the input textarea.
 */
OutputWaiter.prototype.switch_click = function () {
  this.switch_orig_data = this.manager.input.get();
  document.getElementById('undo-switch').disabled = false;
  this.app.set_input(this.app.dish_str);
};


/**
 * Handler for undo switch click events.
 * Removes the output from the input and replaces the input that was removed.
 */
OutputWaiter.prototype.undo_switch_click = function () {
  this.app.set_input(this.switch_orig_data);
  document.getElementById('undo-switch').disabled = true;
};
