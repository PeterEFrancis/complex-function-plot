
// p is a point in C, and r is a resolution measure (sometimes not needed)


function phase(p, r) {
  // get polar coord.
  //      theta  =  Hue
  var theta = Math.atan(p.im/p.re) + 2 * math.PI;
  if (p.re < 0) {
    theta += Math.PI;
  }
  theta *= 180 / Math.PI;
  const hue = theta % 360;

  return 'hsl(' + hue + ',100%, 50%)'
}

function standard_domain_coloring(p, r) {
  // get polar coord.
  //      theta  =  Hue
  var theta = Math.atan(p.im/p.re) + 2 * math.PI;
  if (p.re < 0) {
    theta += Math.PI;
  }
  theta *= 180 / Math.PI;
  const hue = theta % 360;

  const mod = Math.sqrt(p.re**2 + p.im**2);
  // const l = (2/Math.PI) * Math.atan(mod);
  const a = .4;
  const l = (mod**a)/(mod**a + 1);
  // const l = 1 - (0.5)**(mod)
  return 'hsl(' + hue + ',100%, ' + l * 100 + '%)'
}


function phase_and_modulus(p, r) {
  // get polar coord.
  //      theta  =  Hue
  //        mod  =  saturation
  var theta = Math.atan(p.im/p.re) + 2 * math.PI;
  if (p.re < 0) {
    theta += Math.PI;
  }
  theta *= 180 / Math.PI;
  const hue = theta % 360;

  const mod = Math.sqrt(p.re**2 + p.im**2);
  const l = (1/(((Math.log(mod)/Math.log(r/16)) % 1)**2 + .085)) + 38;

  return 'hsl(' + hue + ',100%, ' + l + '%)'
}


function cartesian_checkerboard(p, r) {
  return (Math.floor(p.re * r) + Math.ceil(p.im * r)) % 2 == 0 ? "black" : "white";
}

function real_stripes(p, r) {
  return Math.floor(p.re * r) % 2 == 0 ? "black" : "white";
}

function imaginary_stripes(p, r) {
  return Math.ceil(p.im * r) % 2 == 0 ? "black" : "white";
}


function alternating_modulus(p, r) {
  const mod = Math.sqrt(p.re**2 + p.im**2);
  const f = Math.floor(Math.log(mod)/Math.log(r/16));
  return f % 2 == 0 ? "white" : "black";
}

function alternating_phase(p, r) {
  var theta = Math.atan(p.im/p.re) + 2 * math.PI;
  if (p.re < 0) {
    theta += Math.PI;
  }
  const sect = Math.PI/r;
  return Math.ceil(theta / sect) % 2 == 0 ? "white" : "black";
}

function polar_chessboard(p, r) {
  if (alternating_phase(p,r) != alternating_modulus(p, r)) {
    return "white";
  }
  return "black";
}




// image part
