let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let button_div = document.getElementById('button_div');
let g_codes_div = document.getElementById('g_codes');


let mouse_flag = false;
let mouse_counter = 0;
let coord_arr = [];
let mouse_abs_count = 0;
let pink_circle = [];
let pink_id = null;
let drag_flag = false;
let g_code_html = '';


canvas.addEventListener('mouseover', mouseover);
canvas.addEventListener('mouseout', mouseout);
canvas.addEventListener('mousemove', mousemove);
canvas.addEventListener('mousedown', mousedown);
canvas.addEventListener('mouseup', mouseup);
canvas.addEventListener('contextmenu', contextmenu);



function contextmenu(event) {
  event.preventDefault();
  if (pink_id != null) {
    coord_arr.splice(pink_id, 1)
    mouse_abs_count -= 1;
    pink_circle = [];
    pink_id = null;
    if (mouse_abs_count > 2) {
    bezier();
    } 
    else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i in coord_arr) {
        draw_circle(coord_arr[i][0], coord_arr[i][1], Number(i) + 1);
      }
      set_button(false);
    }
  }
}


function mousedown() {
  if (pink_id != null) {
    drag_flag = true;
  }
}


function mouseup() {
  if (drag_flag) {
    pink_circle = [];
    // setTimeout(bezier, 100);
  }
  drag_flag = false;
}


function mousemove() {
  let x = event.offsetX;
  let y = event.offsetY;

  if (drag_flag && pink_id != null) {
    coord_arr[pink_id][0] = x;
    coord_arr[pink_id][1] = y;
    bezier();
    draw_pink_circle(x, y)
    return;
  }

  let flag = false;

  for (let i in coord_arr) {
    if (Math.pow(x-coord_arr[i][0], 2) + Math.pow(y - coord_arr[i][1], 2) <= Math.pow(7, 2)) {
      draw_pink_circle(coord_arr[i][0], coord_arr[i][1]);
      pink_circle.push([coord_arr[i][0], coord_arr[i][1]]);
      flag = true;
      pink_id = i;
    }
  }
  if (flag == false) {
    if (pink_circle.length != 0) {
      for (let j in pink_circle) {
        draw_pink_circle(pink_circle[j][0], pink_circle[j][1], pink = false);
      }
      pink_circle = [];
      pink_id = null;
    }
  }
}


function draw_pink_circle(x, y, pink = true) {
  ctx.beginPath();
  ctx.clearRect(x - 6, y - 6, 12, 12);
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.strokeStyle="#834e9c";
  if (pink == false) {
    ctx.strokeStyle="black";
  }
  ctx.stroke();
}


function mouseover() {
  canvas.style = 'border-style: dashed';
  mouse_flag = true;
  canvas.addEventListener('click', mouse_click);
}


function mouseout() {
  canvas.style = 'border-style: solid';
  mouse_flag = false;
  canvas.removeEventListener('click', mouse_click);

  if (drag_flag) {
    drag_flag = false;
    pink_circle = [];
    bezier();
  }
}


function mouse_click() {
  if (pink_id != null || drag_flag) {
    return;
  }
  mouse_counter += 1;
  mouse_abs_count += 1;

  let x_coord = event.x - canvas.getBoundingClientRect().x;
  let y_coord = event.y - canvas.getBoundingClientRect().y;

  coord_arr.push([x_coord, y_coord]);
  draw_circle(x_coord, y_coord, mouse_abs_count);

  if (mouse_abs_count > 2) {
    bezier();
  }
}


function bezier(except = null) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i in coord_arr) {
      if (except == i) {
        continue;
      }
      draw_circle(coord_arr[i][0], coord_arr[i][1], Number(i) + 1);
    }
    // mouse_counter = 0;
    let separator = 500;
    for (let i = 0; i < separator; i++) {
      draw_bezier(coord_arr, separator, i);
    }

    set_button(true);
}


function draw_bezier(points, sep, j) {
  // (points)
  

  while (points.length != 1) {
    let temp_var = points.concat();
    points = []
    // (temp_var);
    
    for (let i = 1; i < temp_var.length; i++) {
      let temp_x = ((temp_var[i][0] - temp_var[i - 1][0]) / sep) * j + temp_var[i - 1][0];
      let temp_y = ((temp_var[i][1] - temp_var[i - 1][1]) / sep) * j + temp_var[i - 1][1];
      points.push([temp_x, temp_y])
      // (temp_x, temp_y)
    }
  }
  ctx.beginPath();
  ctx.fillRect(points[0][0], points[0][1], 2, 2)

}



function draw_circle(x, y, text) {
  context = ctx;
  context.beginPath();
  context.arc(x, y, 5, 0, 2 * Math.PI);
  context.font = "10px serif";
  context.fillStyle = "black";
  ctx.strokeStyle="black";
  context.fillText(text, x - 4, y - 12);
  context.stroke();
}


function set_button(flag) {
  if (flag == true) {
    button_div.innerHTML = '<div id="button">Получить G-коды</div>';
    g_codes_div.innerHTML = '';
    let button = document.getElementById('button');
    button.addEventListener('click', get_g_codes)
  }
  else if (flag == false) {
    if (typeof(button) != 'undefined') {
      button.removeEventListener('click', get_g_codes);
    }
    button_div.innerHTML = '';
    g_codes_div.innerHTML = ''
  }
}


function get_g_codes() {
  set_button(false);
  let g_codes = [];

  let sep = 500;

  for (let j = 0; j < sep; j++) {
    let points = coord_arr.concat();
    while (points.length != 1) {

      let temp_var = points.concat();
      points.length = 0;

      for (let i = 1; i < temp_var.length; i++) {
        let temp_x = ((temp_var[i][0] - temp_var[i - 1][0]) / sep) * j + temp_var[i - 1][0];
        let temp_y = ((temp_var[i][1] - temp_var[i - 1][1]) / sep) * j + temp_var[i - 1][1];
        points.push([temp_x, temp_y])
      }
    }
    g_codes.push([points[0][0].toFixed(3), (canvas.height - points[0][1]).toFixed(3)]);
  }
  print_g_codes(g_codes);
}


function print_g_codes(g_codes) {
  g_code_html = `<p>G17</p><p>G91</p><p>G00 X${g_codes[0][0]} Y${g_codes[0][1]}</p>`;
  for (let i in g_codes){
    g_code_html = g_code_html + `<p>G01 X${g_codes[i][0]} Y${g_codes[i][1]} F400</p>`
  }
  g_codes_div.innerHTML = `<div id="show_g_codes">${g_code_html}</div>`;
  
}



