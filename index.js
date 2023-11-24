/* eslint-disable require-jsdoc */
"use strict";

// Global variables for shared controls
let axis = 0;
let theta = [0, 0, 0];
let flag = true;
let lightPosition = vec4(0.5, 0.5, 1.0, 0.0);
let usePerspective = false;
let cubeColor = [1.0, 0.0, 0.0, 1.0];
let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
let materialAmbient = vec4(0.8, 0.8, 0.8, 1.0);
let materialDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
let materialSpecular = vec4(0.8, 0.8, 0.8, 1.0);
let lightSpecular = vec4(1.0, 0.0, 1.0, 1.0);

// Function to initialize shaders
function initShaders(gl, vertexShaderId, fragmentShaderId) {
  // Create shader variables
  let vertShdr;
  let fragShdr;

  // Load the vertex shader
  const vertElem = document.getElementById(vertexShaderId);
  if (!vertElem) {
    alert(`Unable to load vertex shader ${vertexShaderId}`);
    return -1;
  } else {
    // Create the vertex shader, load the source code, compile the shader
    vertShdr = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertShdr, vertElem.textContent.trim());
    gl.compileShader(vertShdr);

    // Check the compile status, alert and return if failed
    if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) {
      alert(`Vertex shader failed to compile. The error log is:\n${gl.getShaderInfoLog(vertShdr)}`);
      return -1;
    }
  }

  // Load the fragment shader
  const fragElem = document.getElementById(fragmentShaderId);
  if (!fragElem) {
    alert(`Unable to load fragment shader ${fragmentShaderId}`);
    return -1;
  } else {
    // Create the fragment shader, load the source code, compile the shader
    fragShdr = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragShdr, fragElem.textContent.trim());
    gl.compileShader(fragShdr);

    // Check the compile status, alert and return if failed
    if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
      alert(`Fragment shader failed to compile. The error log is:\n${gl.getShaderInfoLog(fragShdr)}`);
      return -1;
    }
  }

  // Create a shader program
  const program = gl.createProgram();

  // Attach the vertex and fragment shaders to the program
  gl.attachShader(program, vertShdr);
  gl.attachShader(program, fragShdr);

  // Link the program
  gl.linkProgram(program);

  // Check the link status, alert and return if failed
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    alert(`Shader program failed to link. The error log is:\n${gl.getProgramInfoLog(program)}`);
    return -1;
  }

  // Return the linked program
  return program;
}


/* eslint-disable require-jsdoc */
// ---
//
//  MVnew.js
//
// ---

//
// Helper Functions
//



// Function to create a buffer of given size
function MVbuffer(size) {
  // Create an object 'b'
  const b = {
    buf: new Float32Array(size), // Initialize a Float32Array of given size
    index: 0, // Initialize index to 0
    type: "", // Initialize type to an empty string
    // Define a push function to add elements to the buffer
    push(x) {
      // Use the set method to copy the input array 'x' into the buffer at the current index
      this.buf.set(x, this.index);
      // Increment the index by the length of 'x'
      this.index += x.length;
    },
  };

  // Return the object 'b'
  return b;
}


// Function to check if a given object is a vector
function isVector(v) {
  // Use includes method for cleaner code
  return ["vec2", "vec3", "vec4"].includes(v.type);
}

// Function to check if a given object is a matrix
function isMatrix(v) {
  // Use includes method for cleaner code
  return ["mat2", "mat3", "mat4"].includes(v.type);
}

// Function to convert degrees to radians
function radians(degrees) {
  return (degrees * Math.PI) / 180.0;
}

// Function to create a patch
function patch() {
  const out = Array(4).fill().map(() => Array(4)); // Use fill and map for cleaner code
  out.type = "patch";
  return out;
}

// Function to create a curve
function curve() {
  const out = Array(4); // Use Array constructor for cleaner code
  out.type = "curve";
  return out;
}

// Vector constructor
function vec2() {
  const out = Array(2); // Use Array constructor for cleaner code
  out.type = "vec2";

  switch (arguments.length) {
    case 0:
      out.fill(0.0); // Use fill method for cleaner code
      break;
    case 1:
      if (isVector(arguments[0]) && arguments[0].type !== "vec2") {
        out[0] = arguments[0][0];
        out[1] = arguments[0][1];
      }
      break;
    case 2:
      out[0] = arguments[0];
      out[1] = arguments[1];
      break;
  }
  return out;
}


function vec3() {
  // var result = _argumentsToArray( arguments );

  const out = new Array(3);
  out.type = "vec3";

  switch (arguments.length) {
    case 0:
      out[0] = 0.0;
      out[1] = 0.0;
      out[2] = 0.0;
      return out;
    case 1:
      if (isVector(arguments[0]) && arguments[0].type == "vec3") {
        out[0] = arguments[0][0];
        out[1] = arguments[0][1];
        out[2] = arguments[0][2];
        return out;
      }
    case 3:
      out[0] = arguments[0];
      out[1] = arguments[1];
      out[2] = arguments[2];
      return out;
    default:
      throw "vec3: wrong arguments";
  }

  return out;
}

function vec4() {
  const out = new Array(4);
  out.type = "vec4";
  switch (arguments.length) {
    case 0:
      out[0] = 0.0;
      out[1] = 0.0;
      out[2] = 0.0;
      out[3] = 0.0;
      return out;

    case 1:
      if (isVector(arguments[0])) {
        if (arguments[0].type == "vec4") {
          out[0] = arguments[0][0];
          out[1] = arguments[0][1];
          out[2] = arguments[0][2];
          out[3] = arguments[0][3];
          return out;
        }
      } else if (arguments[0].type == "vec3") {
        out[0] = arguments[0][0];
        out[1] = arguments[0][1];
        out[2] = arguments[0][2];
        out[3] = 1.0;
        return out;
      } else {
        out[0] = arguments[0][0];
        out[1] = arguments[0][1];
        out[2] = arguments[0][2];
        out[3] = arguments[0][3];
        return out;
      }

    case 2:
      if (typeof arguments[0] == "number" && arguments[1].type == "vec3") {
        out[0] = arguments[0];
        out[1] = arguments[1][0];
        out[2] = arguments[1][1];
        out[3] = arguments[1][2];
        return out;
      }
      return out;

    case 4:
      if (isVector(arguments[0])) {
        out[0] = arguments[0][0];
        out[1] = arguments[0][1];
        out[2] = arguments[0][2];
        out[3] = arguments[0][3];
        return out;
      }
      out[0] = arguments[0];
      out[1] = arguments[1];
      out[2] = arguments[2];
      out[3] = arguments[3];
      return out;
    case 3:
      out[0] = arguments[0][0];
      out[1] = arguments[0][1];
      out[2] = arguments[0][2];
      out[3] = 1.0;
      return out;
    default:
      throw "vec4: wrong arguments";
  }
}

// ----------------------------------------------------------------------------
//
//  Matrix Constructors
//

// Matrix constructor for mat2
function mat2() {
  // Initialize a 2x2 array with zeros
  const out = Array(2).fill().map(() => Array(2).fill(0.0));
  out.type = "mat2";

  switch (arguments.length) {
    case 0:
      // If no arguments, create an identity matrix
      out[0][0] = out[1][1] = 1.0;
      break;
    case 1:
      // If one argument of type mat2, copy its values
      if (arguments[0].type === "mat2") {
        out[0][0] = arguments[0][0][0];
        out[0][1] = arguments[0][0][1];
        out[1][0] = arguments[0][1][0];
        out[1][1] = arguments[0][1][1];
      }
      break;
    case 4:
      // If four arguments, assign them to the matrix elements
      out[0][0] = arguments[0];
      out[0][1] = arguments[1];
      out[1][0] = arguments[2];
      out[1][1] = arguments[3];
      break;
    default:
      throw "mat2: wrong arguments";
  }

  return out;
}


// ----------------------------------------------------------------------------
// Matrix constructor for mat3
function mat3() {
  // Initialize a 3x3 array with zeros
  const out = Array(3).fill().map(() => Array(3).fill(0.0));
  out.type = "mat3";

  switch (arguments.length) {
    case 0:
      // If no arguments, create an identity matrix
      out[0][0] = out[1][1] = out[2][2] = 1.0;
      break;
    case 1:
      // If one argument, copy its values to the matrix
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          out[i][j] = arguments[0][3 * i + j];
        }
      }
      break;
    case 9:
      // If nine arguments, assign them to the matrix elements
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          out[i][j] = arguments[3 * i + j];
        }
      }
      break;
    default:
      throw "mat3: wrong arguments";
  }

  return out;
}


// ----------------------------------------------------------------------------

// Matrix constructor for mat4
function mat4() {
  // Initialize a 4x4 array with zeros
  const out = Array(4).fill().map(() => Array(4).fill(0.0));
  out.type = "mat4";

  switch (arguments.length) {
    case 0:
      // If no arguments, create an identity matrix
      out[0][0] = out[1][1] = out[2][2] = out[3][3] = 1.0;
      break;
    case 1:
      // If one argument, copy its values to the matrix
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          out[i][j] = arguments[0][4 * i + j];
        }
      }
      break;
    case 4:
      // If four arguments of type vec4, copy their values to the matrix
      if (arguments[0].type === "vec4") {
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < 4; j++) {
            out[i][j] = arguments[i][j];
          }
        }
      }
      break;
    case 16:
      // If sixteen arguments, assign them to the matrix elements
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          out[i][j] = arguments[4 * i + j];
        }
      }
      break;
    default:
      throw "mat4: wrong arguments";
  }

  return out;
}


// ----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

// Function to check if two vectors or matrices are equal
function equal(u, v) {
  // Check if both inputs are vectors or matrices
  if (!((isMatrix(u) && isMatrix(v)) || (isVector(u) && isVector(v)))) {
    throw "equal: at least one input not a vec or mat";
  }

  // Check if both inputs are of the same type
  if (u.type !== v.type) throw "equal: types different";

  // If inputs are matrices, check if all elements are equal
  if (isMatrix(u)) {
    for (let i = 0; i < u.length; ++i) {
      for (let j = 0; j < u.length; ++j) {
        if (u[i][j] !== v[i][j]) return false;
      }
    }
    return true;
  }

  // If inputs are vectors, check if all elements are equal
  if (isVector(u)) {
    for (let i = 0; i < u.length; ++i) {
      if (u[i] !== v[i]) return false;
    }
    return true;
  }
}


// ----------------------------------------------------------------------------

// Function to add two vectors or matrices
function add(u, v) {
  // Check if both inputs are of the same type
  if (u.type !== v.type) {
    throw "add(): trying to add different types";
  }

  // If inputs are vectors, add their elements
  if (isVector(u)) {
    const result = Array(u.length).fill(0.0); // Use Array constructor and fill method for cleaner code
    result.type = u.type;
    for (let i = 0; i < u.length; i++) {
      result[i] = u[i] + v[i];
    }
    return result;
  }

  // If inputs are matrices, add their elements
  if (isMatrix(u)) {
    let result;
    if (u.type === "mat2") result = mat2();
    if (u.type === "mat3") result = mat3();
    if (u.type === "mat4") result = mat4();
    for (let i = 0; i < u.length; i++) {
      for (let j = 0; j < u.length; j++) {
        result[i][j] = u[i][j] + v[i][j];
      }
    }
    return result;
  }
}


// ----------------------------------------------------------------------------

// Function to subtract two vectors or matrices
function subtract(u, v) {
  // Check if both inputs are of the same type
  if (u.type !== v.type) {
    throw "subtract(): trying to subtract different types";
  }

  // If inputs are vectors, subtract their elements
  if (isVector(u)) {
    let result;
    if (u.type === "vec2") result = vec2();
    if (u.type === "vec3") result = vec3();
    if (u.type === "vec4") result = vec4();
    result.type = u.type;
    for (let i = 0; i < u.length; i++) {
      result[i] = u[i] - v[i];
    }
    return result;
  }

  // If inputs are matrices, subtract their elements
  if (isMatrix(u)) {
    let result;
    if (u.type === "mat2") result = mat2();
    if (u.type === "mat3") result = mat3();
    if (u.type === "mat4") result = mat4();
    for (let i = 0; i < u.length; i++) {
      for (let j = 0; j < u.length; j++) {
        result[i][j] = u[i][j] - v[i][j];
      }
    }
    return result;
  }
}


// ----------------------------------------------------------------------------

// Function to multiply two vectors or matrices, or a scalar and a vector or matrix
function mult(u, v) {
  // Check if u is a number and v is a vector or matrix
  if (typeof u === "number" && (isMatrix(v) || isVector(v))) {
    // If v is a vector, multiply each element by u
    if (isVector(v)) {
      const result = Array(v.length).fill(0.0); // Use Array constructor and fill method for cleaner code
      result.type = v.type;
      for (let i = 0; i < v.length; i++) {
        result[i] = u * v[i];
      }
      return result;
    }
    // If v is a matrix, create a new matrix of the same type
    let result;
    if (v.type === "mat2") result = mat2();
    if (v.type === "mat3") result = mat3();
    if (v.type === "mat4") result = mat4();
  }

  // If u and v are a matrix and a vector of compatible types, multiply them
  if ((u.type === "mat2" && v.type === "vec2") || (u.type === "mat3" && v.type === "vec3") || (u.type === "mat4" && v.type === "vec4")) {
    const result = Array(u.length).fill(0.0); // Use Array constructor and fill method for cleaner code
    result.type = v.type;
    for (let i = 0; i < u.length; i++) {
      for (let k = 0; k < u.length; k++) {
        result[i] += u[i][k] * v[k];
      }
    }
    return result;
  }

  // If u and v are matrices of the same type, multiply them
  if ((u.type === "mat2" && v.type === "mat2") || (u.type === "mat3" && v.type === "mat3") || (u.type === "mat4" && v.type === "mat4")) {
    const result = Array(u.length).fill().map(() => Array(u.length).fill(0.0)); // Use Array constructor, fill, and map methods for cleaner code
    result.type = u.type;
    for (let i = 0; i < u.length; i++) {
      for (let j = 0; j < u.length; j++) {
        for (let k = 0; k < u.length; k++) {
          result[i][j] += u[i][k] * v[k][j];
        }
      }
    }
    return result;
  }

  // If u and v are vectors of the same type, multiply their elements
  if ((u.type === "vec3" && v.type === "vec3") || (u.type === "vec4" && v.type === "vec4")) {
    const result = Array(u.length).fill(0.0); // Use Array constructor and fill method for cleaner code
    result.type = u.type;
    for (let i = 0; i < u.length; i++) {
      result[i] = u[i] * v[i];
    }
    return result;
  }

  throw "mult(): trying to mult incompatible types";
}


// ----------------------------------------------------------------------------
//
//  Basic Transformation Matrix Generators
//

// Function to create a translation matrix
function translate(x, y, z) {
  // Check if the number of arguments is 2 or 3
  if (arguments.length !== 2 && arguments.length !== 3) {
    throw "translate(): not a mat3 or mat4";
  }

  let result;

  // If two arguments, create a 3x3 translation matrix
  if (arguments.length === 2) {
    result = mat3();
    result[0][2] = x;
    result[1][2] = y;
    return result;
  }

  // If three arguments, create a 4x4 translation matrix
  result = mat4();
  result[0][3] = x;
  result[1][3] = y;
  result[2][3] = z;

  return result;
}


// ----------------------------------------------------------------------------

// Function to create a rotation matrix based on angle and axis
function rotate(angle, axis) {
  // If axis is an array of length 3, convert it to a vec3
  if (axis.length === 3) {
    axis = vec3(...axis);
  }

  // Check if axis is a vec3
  if (axis.type !== "vec3") throw "rotate: axis not a vec3";

  // Normalize the axis
  const v = normalize(axis);

  // Compute the cosine and sine of the angle
  const c = Math.cos(radians(angle));
  const s = Math.sin(radians(angle));
  const omc = 1.0 - c;

  // Create a 4x4 rotation matrix
  const result = mat4(
    c + v[0] * v[0] * omc,
    v[0] * v[1] * omc - v[2] * s,
    v[0] * v[2] * omc + v[1] * s,
    0.0,
    v[0] * v[1] * omc + v[2] * s,
    c + v[1] * v[1] * omc,
    v[1] * v[2] * omc - v[0] * s,
    0.0,
    v[0] * v[2] * omc - v[1] * s,
    v[1] * v[2] * omc + v[0] * s,
    c + v[2] * v[2] * omc,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );

  return result;
}


function rotateX(theta) {
  const c = Math.cos(radians(theta));
  const s = Math.sin(radians(theta));
  const rx = mat4(
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    c,
    -s,
    0.0,
    0.0,
    s,
    c,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );
  return rx;
}
function rotateY(theta) {
  const c = Math.cos(radians(theta));
  const s = Math.sin(radians(theta));
  const ry = mat4(
    c,
    0.0,
    s,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    -s,
    0.0,
    c,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );
  return ry;
}
function rotateZ(theta) {
  const c = Math.cos(radians(theta));
  const s = Math.sin(radians(theta));
  const rz = mat4(
    c,
    -s,
    0.0,
    0.0,
    s,
    c,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0,
    0.0,
    0.0,
    0.0,
    0.0,
    1.0
  );
  return rz;
}
// ----------------------------------------------------------------------------
// Function to create a scale matrix based on arguments
function scale() {
  // Check if the arguments are valid
  if (arguments.length < 2 || arguments.length > 3) {
    throw "scale: wrong arguments";
  }

  // Declare a variable to store the scale matrix
  var result;

  // If the second argument is a vector
  if (isVector(arguments[1])) {
    // Use the mult function to multiply the scalar with the vector
    result = mult(arguments[0], arguments[1]);
    // Set the type of the result to the same as the vector
    result.type = arguments[1].type;
  }
  // If the arguments are three scalars
  else if (arguments.length == 3) {
    // Create a 4x4 identity matrix
    result = mat4();
    // Set the diagonal elements to the scalars
    result[0][0] = arguments[0];
    result[1][1] = arguments[1];
    result[2][2] = arguments[2];
  }

  // Return the scale matrix
  return result;
}


// ----------------------------------------------------------------------------
//
//  ModelView Matrix Generators
//

// Function to create a view matrix based on eye, at, and up vectors
function lookAt(eye, at, up) {
  // Check if the arguments are valid vec3 objects
  if (eye.type != "vec3" || at.type != "vec3" || up.type != "vec3") {
    throw "lookAt(): parameters must be vec3 objects";
  }

  // Check if the eye and at vectors are equal
  if (equal(eye, at)) {
    // Return an identity matrix
    return mat4();
  }

  // Compute the view direction vector and normalize it
  let v = normalize(subtract(at, eye));

  // Compute the perpendicular vector and assume it is normalized
  const n = cross(v, up);

  // Compute the "new" up vector and assume it is normalized
  const u = cross(n, v);

  // Negate the view direction vector
  v = negate(v);

  // Create a 4x4 view matrix
  const result = mat4(
    n[0],
    n[1],
    n[2],
    0.0,
    u[0],
    u[1],
    u[2],
    0.0,
    v[0],
    v[1],
    v[2],
    0.0,
    -eye[0],
    -eye[1],
    -eye[2],
    1.0
  );

  // Return the view matrix
  return result;
}


// ----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//

// Function to create an orthographic projection matrix based on the planes
function ortho(left, right, bottom, top, near, far) {
  // Check if the arguments are valid numbers
  if (left == right || bottom == top || near == far) {
    throw "ortho(): invalid arguments";
  }

  // Compute some intermediate values
  const rl = 1 / ((right - left) / 2); // reciprocal of half-width
  const tb = 1 / ((top - bottom) / 2); // reciprocal of half-height
  const fn = 1 / ((far - near) / 2); // reciprocal of half-depth

  // Create a 4x4 orthographic projection matrix
  const result = mat4(
    rl,
    0.0,
    0.0,
    0.0,
    0.0,
    tb,
    0.0,
    0.0,
    0.0,
    0.0,
    -fn,
    0.0,
    -(left + right) * rl,
    -(top + bottom) * tb,
    -(near + far) * fn,
    1.0
  );

  // Return the orthographic projection matrix
  return result;
}


// ----------------------------------------------------------------------------

// Function to create a perspective projection matrix based on the parameters
function perspective(fovy, aspect, near, far) {
  // Check if the arguments are valid numbers
  if (fovy == 0 || aspect == 0 || near == far) {
    throw "perspective(): invalid arguments";
  }

  // Compute some intermediate values
  const f = 1 / Math.tan(radians(fovy) / 2); // focal length
  const d = 1 / (far - near); // reciprocal of depth
  const nf = 1 / (near - far); // reciprocal of negative depth

  // Create a 4x4 perspective projection matrix
  const result = mat4(
    f / aspect,
    0.0,
    0.0,
    0.0,
    0.0,
    f,
    0.0,
    0.0,
    0.0,
    0.0,
    (near + far) * d,
    -1.0,
    0.0,
    0.0,
    2 * near * far * nf,
    0.0
  );

  // Return the perspective projection matrix
  return result;
}

// ----------------------------------------------------------------------------
//
//  Matrix Functions
//



// Function to transpose a matrix
function transpose(m) {
  // Check if the matrix is a patch
  if (m.type == "patch") {
    // Create a new patch
    const out = patch();
    // Loop through the rows and columns of the patch
    for (var i = 0; i < 4; i++) {
      // Create a new array for each row
      out[i] = new Array(4);
      for (let j = 0; j < 4; j++) {
        // Swap the elements of the patch
        out[i][j] = m[j][i];
      }
    }
    // Return the transposed patch
    return out;
  }

  // Check if the matrix is a valid type
  if (m.type != "mat2" && m.type != "mat3" && m.type != "mat4") {
    // Throw an error
    throw "transpose(): trying to transpose a non-matrix";
  }

  // Get the size of the matrix
  const size = parseInt(m.type.slice(-1));

  // Create a new matrix of the same type
  var result = windowm.type;

  // Loop through the rows and columns of the matrix
  for (var i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      // Swap the elements of the matrix
      result[i][j] = m[j][i];
    }
  }

  // Return the transposed matrix
  return result;
}


// ----------------------------------------------------------------------------
//
//  Vector Functions
//

// Function to compute the dot product of two vectors
function dot(u, v) {
  // Check if the arguments are valid vectors of the same type
  if (u.type != v.type || u.type != "vec2" && u.type != "vec3" && u.type != "vec4") {
    throw "dot(): invalid arguments";
  }

  // Use the reduce method to multiply each pair of elements and sum them up
  return u.reduce((sum, ui, i) => sum + ui * v[i], 0.0);
}


// ----------------------------------------------------------------------------

// Function to negate a vector
function negate(u) {
  // Check if the argument is a valid vector
  if (u.type != "vec2" && u.type != "vec3" && u.type != "vec4") {
    throw "negate(): not a vector";
  }
  // Use the map method to negate each element of the vector
  const result = u.map((ui) => -ui);
  // Set the type of the result to the same as the vector
  result.type = u.type;
  // Return the negated vector
  return result;
}


// ----------------------------------------------------------------------------

function cross(u, v) {
  if (u.type == "vec3" && v.type == "vec3") {
    var result = vec3(
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0]
    );
    return result;
  }

  if (v.type == "vec4" && v.type == "vec4") {
    var result = vec3(
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0]
    );// Function to compute the cross product of two vectors
    function cross(u, v) {
      // Check if the arguments are valid vectors of the same type
      if (u.type != v.type || u.type != "vec3" && u.type != "vec4") {
        throw "cross(): invalid arguments";
      }

      // Use a ternary operator to return the cross product of vec3 or vec4
      return u.type == "vec3"
        ? vec3(
          u[1] * v[2] - u[2] * v[1],
          u[2] * v[0] - u[0] * v[2],
          u[0] * v[1] - u[1] * v[0]
        )
        : vec4(
          u[1] * v[2] - u[2] * v[1],
          u[2] * v[0] - u[0] * v[2],
          u[0] * v[1] - u[1] * v[0],
          0.0
        );
    }

    return result;
  }

  throw "cross: types aren't matched vec3 or vec4";
}

// ----------------------------------------------------------------------------

function length(u) {
  return Math.sqrt(dot(u, u));
}

// ----------------------------------------------------------------------------

function normalize(u, excludeLastComponent) {
  if (u.type != "vec3" && u.type != "vec4") {
    throw "normalize: not a vector type";
  }
  switch (u.type) {
    case "vec2":
      var len = Math.sqrt(u[0] * u[0] + u[1] * u[1]);
      var result = vec2(u[0] / len, u[1] / len);
      return result;
      break;
    case "vec3":
      if (excludeLastComponent) {
        var len = Math.sqrt(u[0] * u[0] + u[1] * u[1]);
        var result = vec3(u[0] / len, u[1] / len, u[2]);
        return result;
        break;
      } else {
        var len = Math.sqrt(u[0] * u[0] + u[1] * u[1] + u[2] * u[2]);
        var result = vec3(u[0] / len, u[1] / len, u[2] / len);
        return result;
        break;
      }
    case "vec4":
      if (excludeLastComponent) {
        var len = Math.sqrt(u[0] * u[0] + u[1] * u[1] + u[2] * u[2]);
        var result = vec4(u[0] / len, u[1] / len, u[2] / len, u[3]);
        return result;
        break;
      } else {
        var len = Math.sqrt(
          u[0] * u[0] + u[1] * u[1] + u[2] * u[2] + u[3] * u[3]
        );
        var result = vec4(u[0] / len, u[1] / len, u[2] / len, u[3] / len);
        return result;
        break;
      }
  }
}

// ----------------------------------------------------------------------------

// Function to mix two values or vectors by a scalar
function mix(u, v, s) {
  // Check if the last parameter is a number
  if (typeof s !== "number") {
    throw "mix: the last parameter " + s + " must be a number";
  }
  // Check if the first two parameters are numbers
  if (typeof u == "number" && typeof v == "number") {
    // Return the linear interpolation of the numbers
    return (1.0 - s) * u + s * v;
  }
  // Check if the first two parameters are vectors of the same type and length
  if (u.type != v.type || u.length != v.length) {
    throw "mix: invalid arguments";
  }
  // Use the map method to apply the linear interpolation to each pair of elements
  const result = u.map((ui, i) => (1.0 - s) * ui + s * v[i]);
  // Set the type of the result to the same as the vectors
  result.type = u.type;
  // Return the mixed vector
  return result;
}


// ----------------------------------------------------------------------------
//
// Vector and Matrix utility functions
//

/**
 * Flattens a 2D array (matrix) or a 1D array (vector) and returns a 1D Float32Array.
 * @param {Array} v - The input array (can be a vector or a matrix).
 * @returns {Float32Array} - The flattened array.
 */
function flatten(v) {
  // Check if it's a vector
  if (isVector(v)) {
    // If it's a vector, create a new Float32Array directly
    return new Float32Array(v);
  }

  // If it's not a vector, assume it's a 2D array (matrix)
  const rows = v.length;
  const cols = v[0].length;
  const floats = new Float32Array(rows * cols);

  // Flatten the matrix
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      floats[i * cols + j] = v[i][j];
    }
  }

  return floats;
}



//
// ----------------------------------------------------------------------------

// Function to round a number to three decimal places
function cut(a) {
  return Math.round(a * 1000) / 1000;
}

// Function to print matrices of different types
function printm(m) {
  switch (m.type) {
    case "mat2":
      printMatrix(m, 2);
      break;
    case "mat3":
      printMatrix(m, 3);
      break;
    case "mat4":
      printMatrix(m, 4);
      break;
    case "patch":
      for (let i = 0; i < 4; i++) {
        console.log(m[i].map(cut).join(" "));
      }
      break;
    default:
      throw "printm: not a matrix";
  }
}

// Function to print a matrix of a given size
function printMatrix(m, size) {
  for (let i = 0; i < size; i++) {
    console.log(m[i].map(cut).join(" "));
  }
}

// Function to calculate the determinant of a 2x2 matrix
function det2(m) {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

// Function to calculate the determinant of a 3x3 matrix
function det3(m) {
  const d =
    m[0][0] * m[1][1] * m[2][2] +
    m[0][1] * m[1][2] * m[2][0] +
    m[0][2] * m[2][1] * m[1][0] -
    m[2][0] * m[1][1] * m[0][2] -
    m[1][0] * m[0][1] * m[2][2] -
    m[0][0] * m[1][2] * m[2][1];
  return d;
}

// Function to calculate the determinant of a 4x4 matrix
function det4(m) {
  const m0 = [m[1].slice(1), m[2].slice(1), m[3].slice(1)];
  const m1 = [m[1].slice(0, 1).concat(m[1].slice(2)), m[2].slice(0, 1).concat(m[2].slice(2)), m[3].slice(0, 1).concat(m[3].slice(2))];
  const m2 = [m[1].slice(0, 2), m[2].slice(0, 2), m[3].slice(0, 2)];
  const m3 = [m[1].slice(0, 3), m[2].slice(0, 3), m[3].slice(0, 3)];
  return m[0][0] * det3(m0) - m[0][1] * det3(m1) + m[0][2] * det3(m2) - m[0][3] * det3(m3);
}

// Function to calculate the determinant of a matrix of any size
function det(m) {
  if (!isMatrix(m)) throw "det: m not a matrix";
  if (m.length == 2) return det2(m);
  if (m.length == 3) return det3(m);
  if (m.length == 4) return det4(m);
}

// Function to calculate the inverse of a 2x2 matrix
function inverse2(m) {
  const a = mat2();
  const d = det2(m);
  a[0][0] = m[1][1] / d;
  a[0][1] = -m[0][1] / d;
  a[1][0] = -m[1][0] / d;
  a[1][1] = m[0][0] / d;
  return a;
}

// Function to calculate the inverse of a 3x3 matrix
function inverse3(m) {
  const a = mat3();
  const d = det3(m);

  const submatrices = [
    [vec2(m[1][1], m[1][2]), vec2(m[2][1], m[2][2])],
    [vec2(m[1][0], m[1][2]), vec2(m[2][0], m[2][2])],
    [vec2(m[1][0], m[1][1]), vec2(m[2][0], m[2][1])],
    [vec2(m[0][1], m[0][2]), vec2(m[2][1], m[2][2])],
    [vec2(m[0][0], m[0][2]), vec2(m[2][0], m[2][2])],
    [vec2(m[0][0], m[0][1]), vec2(m[2][0], m[2][1])],
    [vec2(m[0][1], m[0][2]), vec2(m[1][1], m[1][2])],
    [vec2(m[0][0], m[0][2]), vec2(m[1][0], m[1][2])],
    [vec2(m[0][0], m[0][1]), vec2(m[1][0], m[1][1])],
  ];

  a[0][0] = det2(submatrices[0]) / d;
  a[0][1] = -det2(submatrices[3]) / d;
  a[0][2] = det2(submatrices[6]) / d;
  a[1][0] = -det2(submatrices[1]) / d;
  a[1][1] = det2(submatrices[4]) / d;
  a[1][2] = -det2(submatrices[7]) / d;
  a[2][0] = det2(submatrices[2]) / d;
  a[2][1] = -det2(submatrices[5]) / d;
  a[2][2] = det2(submatrices[8]) / d;

  return a;
}


// Function to calculate the inverse of a 4x4 matrix
function inverse4(m) {
  const a = mat4();
  const d = det4(m);

  // Submatrices for cofactors
  const submatrices = [
    [vec3(m[1][1], m[1][2], m[1][3]), vec3(m[2][1], m[2][2], m[2][3]), vec3(m[3][1], m[3][2], m[3][3])],
    [vec3(m[1][0], m[1][2], m[1][3]), vec3(m[2][0], m[2][2], m[2][3]), vec3(m[3][0], m[3][2], m[3][3])],
    [vec3(m[1][0], m[1][1], m[1][3]), vec3(m[2][0], m[2][1], m[2][3]), vec3(m[3][0], m[3][1], m[3][3])],
    [vec3(m[1][0], m[1][1], m[1][2]), vec3(m[2][0], m[2][1], m[2][2]), vec3(m[3][0], m[3][1], m[3][2])]
  ];

  // Calculate cofactors and populate the inverse matrix
  a[0][0] = det3(submatrices[0]) / d;
  a[0][1] = -det3(submatrices[1]) / d;
  a[0][2] = det3(submatrices[2]) / d;
  a[0][3] = -det3(submatrices[3]) / d;
  a[1][0] = -det3(submatrices[4]) / d;
  a[1][1] = det3(submatrices[5]) / d;
  a[1][2] = -det3(submatrices[6]) / d;
  a[1][3] = det3(submatrices[7]) / d;
  a[2][0] = det3(submatrices[8]) / d;
  a[2][1] = -det3(submatrices[9]) / d;
  a[2][2] = det3(submatrices[10]) / d;
  a[2][3] = -det3(submatrices[11]) / d;
  a[3][0] = -det3(submatrices[12]) / d;
  a[3][1] = det3(submatrices[13]) / d;
  a[3][2] = -det3(submatrices[14]) / d;
  a[3][3] = det3(submatrices[15]) / d;

  return a;
}

// Function to calculate the inverse of a matrix of any size
function inverse(m) {
  if (!isMatrix(m)) throw "inverse: m not a matrix";
  if (m.length == 2) return inverse2(m);
  if (m.length == 3) return inverse3(m);
  if (m.length == 4) return inverse4(m);
}


// ---------------------------------------------------------

// normal matrix

function normalMatrix(m, flag) {
  if (m.type != "mat4") throw "normalMatrix: input not a mat4";
  const a = inverse(transpose(m));
  if (arguments.length == 1 && flag == false) return a;

  const b = mat3();
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) b[i][j] = a[i][j];

  return b;
}

function shadedCube(canvasId) {
  let gl;
  let program;
  let colorUniformLocation;
  const numPositions = 36;

  const positionsArray = [];
  const normalsArray = [];

  const vertices = [
    vec4(-0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, 0.5, 0.5, 1.0),
    vec4(0.5, 0.5, 0.5, 1.0),
    vec4(0.5, -0.5, 0.5, 1.0),
    vec4(-0.5, -0.5, -0.5, 1.0),
    vec4(-0.5, 0.5, -0.5, 1.0),
    vec4(0.5, 0.5, -0.5, 1.0),
    vec4(0.5, -0.5, -0.5, 1.0),
  ];

  const viewerPosition = vec4(0.0, 0.0, 20.0, 0.0);



  const materialShininess = 100.0;

  const xAxis = 0;
  const yAxis = 1;
  const zAxis = 2;

  function quad(a, b, c, d) {
    const t1 = subtract(vertices[b], vertices[a]);
    const t2 = subtract(vertices[c], vertices[b]);
    let normal = cross(t1, t2);
    normal = vec3(normal);
    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    positionsArray.push(vertices[b]);
    normalsArray.push(normal);
    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    positionsArray.push(vertices[a]);
    normalsArray.push(normal);
    positionsArray.push(vertices[c]);
    normalsArray.push(normal);
    positionsArray.push(vertices[d]);
    normalsArray.push(normal);
  }

  function colorCube() {
    quad(1, 0, 3, 2);
    quad(2, 3, 7, 6);
    quad(3, 0, 4, 7);
    quad(6, 5, 1, 2);
    quad(4, 5, 6, 7);
    quad(5, 4, 0, 1);
  }

  function init() {
    const canvas = document.getElementById(canvasId);
    gl = canvas.getContext("webgl2");
    if (!gl) {
      alert("WebGL 2.0 is not available");
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // generate the data needed for the cube
    colorCube();
    console.log("number of normals", normalsArray.length);

    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    console.log("positionLoc", positionLoc);

    const nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    const normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(normalLoc);
    console.log("normalLoc", normalLoc);
    console.log(canvas.width, canvas.height, "auysh");
    const projectionMatrix = usePerspective
      ? perspective(45, canvas.width / canvas.height, 0.1, 100.0)
      : ortho(-1, 1, -1, 1, -100, 100);

    const ambientProduct = mult(lightAmbient, materialAmbient);
    const diffuseProduct = mult(lightDiffuse, materialDiffuse);
    const specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(
      gl.getUniformLocation(program, "uAmbientProduct"),
      ambientProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uDiffuseProduct"),
      diffuseProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uSpecularProduct"),
      specularProduct
    );
    gl.uniform1f(
      gl.getUniformLocation(program, "uShininess"),
      materialShininess
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uLightPosition"),
      lightPosition
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uViewerPosition"),
      viewerPosition
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uProjectionMatrix"),
      false,
      flatten(projectionMatrix)
    );
    render();
  }
  function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (flag) {
      theta[axis] += 2.0;
    }
    let modelViewMatrix = mat4();
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[xAxis], vec3(1, 0, 0))
    );
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[yAxis], vec3(0, 1, 0))
    );
    modelViewMatrix = mult(
      modelViewMatrix,
      rotate(theta[zAxis], vec3(0, 0, 1))
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uModelViewMatrix"),
      false,
      flatten(modelViewMatrix)
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uLightPosition"),
      lightPosition
    );
    const ambientProduct = mult(lightAmbient, materialAmbient);
    const diffuseProduct = mult(lightDiffuse, materialDiffuse);
    const specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(
      gl.getUniformLocation(program, "uAmbientProduct"),
      ambientProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uDiffuseProduct"),
      diffuseProduct
    );
    gl.uniform4fv(
      gl.getUniformLocation(program, "uSpecularProduct"),
      specularProduct
    );
    const projectionMatrix = usePerspective
      ? perspective(45, 400 / 400, 0.1, 100.0)
      : ortho(-1, 1, -1, 1, -100, 100);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(program, "uProjectionMatrix"),
      false,
      flatten(projectionMatrix)
    );
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
    requestAnimationFrame(render);
  }
  init(); // Initialize the cube
}

shadedCube("gl-canvas1");
shadedCube("gl-canvas2");

document.getElementById("rotateX").onclick = function () {
  axis = 0;
};
document.getElementById("rotateY").onclick = function () {
  axis = 1;
};
document.getElementById("rotateZ").onclick = function () {
  axis = 2;
};
document.getElementById("toggle").onclick = function () {
  flag = !flag;
};

document.getElementById("lightX").addEventListener("input", function (e) {
  lightPosition[0] = parseFloat(e.target.value);
});
document.getElementById("lightY").addEventListener("input", function (e) {
  lightPosition[1] = parseFloat(e.target.value);
});
document.getElementById("lightZ").addEventListener("input", function (e) {
  lightPosition[2] = parseFloat(e.target.value);
});
document
  .getElementById("toggleProjection")
  .addEventListener("click", function () {
    usePerspective = !usePerspective;
  });
document.getElementById("colorPicker").addEventListener("input", function (e) {
  const color = hexToRgb(e.target.value);
  lightSpecular = vec4(parseFloat(color.r / 255), parseFloat(color.g / 255), parseFloat(color.b / 255), 1.0)
  console.log(lightAmbient, 'ayush')
});
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : null;
}
