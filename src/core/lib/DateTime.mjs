/**
 * DateTime resources.
 *
 * @author n1474335 [n1474335@gmail.com]
 * @copyright Crown Copyright 2016
 * @license Apache-2.0
 */

/**
 * DateTime units.
 */
export const UNITS = ["Seconds (s)", "Milliseconds (ms)", "Microseconds (μs)", "Nanoseconds (ns)"];

/**
 * DateTime formats.
 */
export const DATETIME_FORMATS = [
    {
        name: "Custom",
        value: ""
    },
    {
        name: "Standard date and time",
        value: "DD/MM/YYYY HH:mm:ss"
    },
    {
        name: "American-style date and time",
        value: "MM/DD/YYYY HH:mm:ss"
    },
    {
        name: "International date and time",
        value: "YYYY-MM-DD HH:mm:ss"
    },
    {
        name: "Verbose date and time",
        value: "dddd Do MMMM YYYY HH:mm:ss Z z"
    },
    {
        name: "UNIX timestamp (seconds)",
        value: "X"
    },
    {
        name: "UNIX timestamp offset (milliseconds)",
        value: "x"
    },
    {
        name: "Automatic",
        value: ""
    },
];

/**
 * MomentJS DateTime formatting examples.
 */
export const FORMAT_EXAMPLES = `Format string tokens:
<table class="table table-striped table-hover table-sm table-bordered" style="font-family: sans-serif">
  <thead class="thead-dark">
    <tr>
      <th>Category</th>
      <th>Token</th>
      <th>Output</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><b>Month</b></td>
      <td>M</td>
      <td>1 2 ... 11 12</td>
    </tr>
    <tr>
      <td></td>
      <td>Mo</td>
      <td>1st 2nd ... 11th 12th</td>
    </tr>
    <tr>
      <td></td>
      <td>MM</td>
      <td>01 02 ... 11 12</td>
    </tr>
    <tr>
      <td></td>
      <td>MMM</td>
      <td>Jan Feb ... Nov Dec</td>
    </tr>
    <tr>
      <td></td>
      <td>MMMM</td>
      <td>January February ... November December</td>
    </tr>
    <tr>
      <td><b>Quarter</b></td>
      <td>Q</td>
      <td>1 2 3 4</td>
    </tr>
    <tr>
      <td><b>Day of Month</b></td>
      <td>D</td>
      <td>1 2 ... 30 31</td>
    </tr>
    <tr>
      <td></td>
      <td>Do</td>
      <td>1st 2nd ... 30th 31st</td>
    </tr>
    <tr>
      <td></td>
      <td>DD</td>
      <td>01 02 ... 30 31</td>
    </tr>
    <tr>
      <td><b>Day of Year</b></td>
      <td>DDD</td>
      <td>1 2 ... 364 365</td>
    </tr>
    <tr>
      <td></td>
      <td>DDDo</td>
      <td>1st 2nd ... 364th 365th</td>
    </tr>
    <tr>
      <td></td>
      <td>DDDD</td>
      <td>001 002 ... 364 365</td>
    </tr>
    <tr>
      <td><b>Day of Week</b></td>
      <td>d</td>
      <td>0 1 ... 5 6</td>
    </tr>
    <tr>
      <td></td>
      <td>do</td>
      <td>0th 1st ... 5th 6th</td>
    </tr>
    <tr>
      <td></td>
      <td>dd</td>
      <td>Su Mo ... Fr Sa</td>
    </tr>
    <tr>
      <td></td>
      <td>ddd</td>
      <td>Sun Mon ... Fri Sat</td>
    </tr>
    <tr>
      <td></td>
      <td>dddd</td>
      <td>Sunday Monday ... Friday Saturday</td>
    </tr>
    <tr>
      <td><b>Day of Week (Locale)</b></td>
      <td>e</td>
      <td>0 1 ... 5 6</td>
    </tr>
    <tr>
      <td><b>Day of Week (ISO)</b></td>
      <td>E</td>
      <td>1 2 ... 6 7</td>
    </tr>
    <tr>
      <td><b>Week of Year</b></td>
      <td>w</td>
      <td>1 2 ... 52 53</td>
    </tr>
    <tr>
      <td></td>
      <td>wo</td>
      <td>1st 2nd ... 52nd 53rd</td>
    </tr>
    <tr>
      <td></td>
      <td>ww</td>
      <td>01 02 ... 52 53</td>
    </tr>
    <tr>
      <td><b>Week of Year (ISO)</b></td>
      <td>W</td>
      <td>1 2 ... 52 53</td>
    </tr>
    <tr>
      <td></td>
      <td>Wo</td>
      <td>1st 2nd ... 52nd 53rd</td>
    </tr>
    <tr>
      <td></td>
      <td>WW</td>
      <td>01 02 ... 52 53</td>
    </tr>
    <tr>
      <td><b>Year</b></td>
      <td>YY</td>
      <td>70 71 ... 29 30</td>
    </tr>
    <tr>
      <td></td>
      <td>YYYY</td>
      <td>1970 1971 ... 2029 2030</td>
    </tr>
    <tr>
      <td><b>Week Year</b></td>
      <td>gg</td>
      <td>70 71 ... 29 30</td>
    </tr>
    <tr>
      <td></td>
      <td>gggg</td>
      <td>1970 1971 ... 2029 2030</td>
    </tr>
    <tr>
      <td><b>Week Year (ISO)</b></td>
      <td>GG</td>
      <td>70 71 ... 29 30</td>
    </tr>
    <tr>
      <td></td>
      <td>GGGG</td>
      <td>1970 1971 ... 2029 2030</td>
    </tr>
    <tr>
      <td><b>AM/PM</b></td>
      <td>A</td>
      <td>AM PM</td>
    </tr>
    <tr>
      <td></td>
      <td>a</td>
      <td>am pm</td>
    </tr>
    <tr>
      <td><b>Hour</b></td>
      <td>H</td>
      <td>0 1 ... 22 23</td>
    </tr>
    <tr>
      <td></td>
      <td>HH</td>
      <td>00 01 ... 22 23</td>
    </tr>
    <tr>
      <td></td>
      <td>h</td>
      <td>1 2 ... 11 12</td>
    </tr>
    <tr>
      <td></td>
      <td>hh</td>
      <td>01 02 ... 11 12</td>
    </tr>
    <tr>
      <td><b>Minute</b></td>
      <td>m</td>
      <td>0 1 ... 58 59</td>
    </tr>
    <tr>
      <td></td>
      <td>mm</td>
      <td>00 01 ... 58 59</td>
    </tr>
    <tr>
      <td><b>Second</b></td>
      <td>s</td>
      <td>0 1 ... 58 59</td>
    </tr>
    <tr>
      <td></td>
      <td>ss</td>
      <td>00 01 ... 58 59</td>
    </tr>
    <tr>
      <td><b>Fractional Second</b></td>
      <td>S</td>
      <td>0 1 ... 8 9</td>
    </tr>
    <tr>
      <td></td>
      <td>SS</td>
      <td>00 01 ... 98 99</td>
    </tr>
    <tr>
      <td></td>
      <td>SSS</td>
      <td>000 001 ... 998 999</td>
    </tr>
    <tr>
      <td></td>
      <td>SSSS ... SSSSSSSSS</td>
      <td>000[0..] 001[0..] ... 998[0..] 999[0..]</td>
    </tr>
    <tr>
      <td><b>Timezone</b></td>
      <td>z or zz</td>
      <td>EST CST ... MST PST</td>
    </tr>
    <tr>
      <td></td>
      <td>Z</td>
      <td>-07:00 -06:00 ... +06:00 +07:00</td>
    </tr>
    <tr>
      <td></td>
      <td>ZZ</td>
      <td>-0700 -0600 ... +0600 +0700</td>
    </tr>
    <tr>
      <td><b>Unix Timestamp</b></td>
      <td>X</td>
      <td>1360013296</td>
    </tr>
    <tr>
      <td><b>Unix Millisecond Timestamp</b></td>
      <td>x</td>
      <td>1360013296123</td>
    </tr>
  </tbody>
</table>`;

