

var output_canvas = document.getElementById('output');
var output_ctx = output_canvas.getContext("2d");

var domain_canvas = document.getElementById('domain');
var domain_ctx = domain_canvas.getContext("2d");

var guppy_input = new Guppy('guppy-function-input');

var func;

var re_lb, re_ub;
var im_lb, im_ub;
var disc_re, disc_im;
var zoom_re, zoom_im;  // ratio:  pixel / actual
var depth_re, depth_im;
var scheme;
var resolution;

function get_settings() {

  re_lb = Number(document.getElementById('re-lb').value);
  re_ub = Number(document.getElementById('re-ub').value);
  im_lb = Number(document.getElementById('im-lb').value);
  im_ub = Number(document.getElementById('im-ub').value);

  disc_re = Number(document.getElementById('disc-re').value);
  output_canvas.width = disc_re;
  disc_im = Number(document.getElementById('disc-im').value);
  output_canvas.height = disc_im;

  zoom_re = disc_re / (re_ub - re_lb);
  zoom_im = disc_im / (im_ub - im_lb);

  depth_re = Math.pow(10, Math.round(Math.log(zoom_re) / Math.log(10)));
  depth_im = Math.pow(10, Math.round(Math.log(zoom_im) / Math.log(10)));

  set_scheme(document.querySelector('input[name="scheme"]:checked').value);
  resolution = Number(document.getElementById('resolution').value);
}


function get_output_canvas_point(p) {
  // given a point in C, get the output_canvas coordinate point to plot
  return {x: (p.re - re_lb) * zoom_re,
          y: (im_ub - p.im) * zoom_im};
}

function get_C_point(p) {
  // given the output_canvas coordinate point, get a point in C
  return {re: p.x / zoom_re + re_lb,
          im: im_ub - p.y / zoom_im};
}

function round(p, depth_r, depth_i) {
  return {re: (Math.round(p.re * depth_r) / depth_r),
          im: (Math.round(p.im * depth_i) / depth_i)
         };
}

function toString(p) {
  return p.re + "+" + p.im + "i";
}

output_canvas.addEventListener('mouseout', function() {
  document.getElementById('hover-loc').innerHTML = "&nbsp;";
});

output_canvas.addEventListener('mousemove', function(e) {
  try {
    var rect = output_canvas.getBoundingClientRect();
    var user_x = (e.clientX - rect.left) * (output_canvas.width / output_canvas.clientWidth);
    var user_y = (e.clientY - rect.top) * (output_canvas.height / output_canvas.clientHeight);
    var p = get_C_point({x:user_x, y:user_y});
    document.getElementById('hover-loc').innerHTML = "f(" + toString(round(p, depth_re, depth_im)) + ") = " + toString(round(func(p), depth_re, depth_im));
  } catch(e) {
    // if no image is loaded, this wont work, so this is ok
  }
});



function render() {


  output_ctx.clearRect(0, 0, output_canvas.width, output_canvas.height);

  try {

    document.getElementById('error').innerHTML = "&nbsp;";

    // parse with guppy
    try {
      var f = guppy_input.func(complex_operations);
      func = function(z) {
        return f({'z':z});
      }
    } catch(e) {
      throw "Error parsing the input f(z)";
    }

    get_settings();

    // iterate over points in the output display, and plot the color associated with their output of f
    for (var i = 0; i < disc_re; i++) {
      for (var j = 0; j < disc_im; j++) {
        output_ctx.fillStyle = get_color(func(get_C_point({x:i,y:j})));
        this.output_ctx.fillRect(i, j, 1, 1);
      }
    }

  } catch(e) {
    document.getElementById('error').innerHTML = e;
  }


}

function download_output() {
  var link = document.createElement('a');
  link.download = 'complex-function-phase-plot.png';
  link.href = output_canvas.toDataURL();
  link.click();
  // window.location.href = output_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
}


var image_obj;
var image_data = [];
var image_width;
var image_height;
var image_center_x;
var image_center_y;
var image_pixel_data;

function loadFile(event) {
  if (event.target.files.length == 0) {
    return;
  }
  image_obj = new Image();
  image_obj.src = URL.createObjectURL(event.target.files[0]);
  image_obj.onload = function() {
    var c = document.createElement('canvas');
    c.width = image_obj.width;
    c.height = image_obj.height;
    var ct = c.getContext('2d');
    ct.drawImage(image_obj, 0, 0, c.width, c.height);
    image_data = ct.getImageData(0,0,c.width,c.height);
    image_width = image_data.width;
    image_height = image_data.height;
    image_center_x = Math.floor(image_width / 2);
    image_center_y = Math.floor(image_height / 2);
    set_scheme('image');
    document.getElementById('image').checked = true;
  }
}



function set_scheme(scheme_name) {
  scheme = eval(scheme_name);
  preview_domain();
}

function set_resolution(res) {
  resolution = Number(res);
  preview_domain();
}

function preview_domain() {
  domain_ctx.clearRect(0,0,domain_canvas.width, domain_canvas.height);
  // always between -1, and 1 in both directions
  for (var i = 0; i < domain_canvas.width; i++) {
    for (var j = 0; j < domain_canvas.height; j++) {
      var re = i / (domain_canvas.width / 2) - 1;
      var im = 1 - j / (domain_canvas.width / 2);
      domain_ctx.fillStyle = get_color({re:re, im:im});
      domain_ctx.fillRect(i, j, 1, 1);
    }
  }
}





guppy_input.engine.add_symbol("conj", {"output": {"latex":"\\overline{{$1}}", "text":"conj($1)"}, "attrs": { "type":"conj", "group":"function"}});
guppy_input.engine.set_content(fractions);
guppy_input.engine.end();
guppy_input.render(true);


get_settings();
preview_domain();

// set up preview domain
var radios = document.getElementsByName('scheme');
for (var i = 0; i < radios.length; i++) {
  radios[i].onclick = function() {
    set_scheme(this.value);
  }
}
