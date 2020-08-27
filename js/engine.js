

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
    document.getElementById('hover-loc').innerHTML = "f(" + toString(round(p, depth_re, depth_im)) + ") = " + toString(round(evaluate(func, p), depth_re, depth_im));
  } catch(e) {
    // if no image is loaded, this wont work, so this is ok
  }
});


function evaluate(string, z) {
  return math.evaluate(string.replace(/z/g,'(' + z.re + '+' + z.im + 'i)').replace(/neg/g,'(-1)*'));
}


function show() {


  output_ctx.clearRect(0, 0, output_canvas.width, output_canvas.height);

  try {

    document.getElementById('error').innerHTML = "&nbsp;";

    // parse with guppy
    try {
      func = guppy_input.engine.get_content('text');
    } catch(e) {
      throw "Error parsing the input f(z)";
    }

    get_settings();

    // iterate over points in the output display, and plot the color associated with their output of f
    for (var i = 0; i < disc_re; i++) {
      for (var j = 0; j < disc_im; j++) {
        const z = get_C_point({x:i,y:j});
        const f_z = evaluate(func, z);
        output_ctx.fillStyle = scheme(f_z, resolution);
        this.output_ctx.fillRect(i, j, 1, 1);
      }
    }

  } catch(e) {
    document.getElementById('error').innerHTML = e;
  }


}

function download_image() {
  var image = output_canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  window.location.href = image;
}

function set_scheme(scheme_name) {
  scheme = eval(scheme_name);
}

function set_resolution(res) {
  resolution = Number(res);
  preview_domain();
}

function preview_domain() {
  // always between -1, and 1 in both directions
  for (var i = 0; i < domain_canvas.width; i++) {
    for (var j = 0; j < domain_canvas.height; j++) {
      var re = i / (domain_canvas.width / 2) - 1;
      var im = 1 - j / (domain_canvas.width / 2);
      domain_ctx.fillStyle = scheme({re:re, im:im}, resolution);
      domain_ctx.fillRect(i, j, 1, 1);
    }
  }
}





guppy_input.engine.add_symbol("conj", {"output": {"latex":"\\overline{{$1}}", "text":"conj($1)"}, "attrs": { "type":"conj", "group":"function"}});
guppy_input.engine.set_content(z_squared);
guppy_input.engine.end();
guppy_input.render(true);


get_settings();
preview_domain();

// set up preview domain
var radios = document.getElementsByName('scheme');
for (var i = 0; i < radios.length; i++) {
  radios[i].onclick = function() {
    set_scheme(this.value);
    preview_domain();
  }
}
