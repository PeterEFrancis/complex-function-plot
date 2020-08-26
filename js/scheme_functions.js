
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
  const sat = 109 + (10/(-((Math.log(mod)/Math.log(1.4)) % 1) - 0.1));

  return 'hsl(' + hue + ',' + sat + '%, 50%)'
}


function cartesian_checkerboard(p, r) {
  return (Math.floor(p.re * r) + Math.ceil(p.im * r)) % 2 == 0 ? "black" : "white";
}


// function polar_chessboard(p) {
//
// }




const SCHEMES = [phase, phase_and_modulus, cartesian_checkerboard];
