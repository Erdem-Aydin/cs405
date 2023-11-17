function multiplyMatrices(matrixA, matrixB) {
    var result = [];

    for (var i = 0; i < 4; i++) {
        result[i] = [];
        for (var j = 0; j < 4; j++) {
            var sum = 0;
            for (var k = 0; k < 4; k++) {
                sum += matrixA[i * 4 + k] * matrixB[k * 4 + j];
            }
            result[i][j] = sum;
        }
    }

    // Flatten the result array
    return result.reduce((a, b) => a.concat(b), []);
}
function createIdentityMatrix() {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ]);
}
function createScaleMatrix(scale_x, scale_y, scale_z) {
    return new Float32Array([
        scale_x, 0, 0, 0,
        0, scale_y, 0, 0,
        0, 0, scale_z, 0,
        0, 0, 0, 1
    ]);
}

function createTranslationMatrix(x_amount, y_amount, z_amount) {
    return new Float32Array([
        1, 0, 0, x_amount,
        0, 1, 0, y_amount,
        0, 0, 1, z_amount,
        0, 0, 0, 1
    ]);
}

function createRotationMatrix_Z(radian) {
    return new Float32Array([
        Math.cos(radian), -Math.sin(radian), 0, 0,
        Math.sin(radian), Math.cos(radian), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_X(radian) {
    return new Float32Array([
        1, 0, 0, 0,
        0, Math.cos(radian), -Math.sin(radian), 0,
        0, Math.sin(radian), Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function createRotationMatrix_Y(radian) {
    return new Float32Array([
        Math.cos(radian), 0, Math.sin(radian), 0,
        0, 1, 0, 0,
        -Math.sin(radian), 0, Math.cos(radian), 0,
        0, 0, 0, 1
    ])
}

function getTransposeMatrix(matrix) {
    return new Float32Array([
        matrix[0], matrix[4], matrix[8], matrix[12],
        matrix[1], matrix[5], matrix[9], matrix[13],
        matrix[2], matrix[6], matrix[10], matrix[14],
        matrix[3], matrix[7], matrix[11], matrix[15]
    ]);
}

const vertexShaderSource = `
attribute vec3 position;
attribute vec3 normal; // Normal vector for lighting

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

uniform vec3 lightDirection;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vNormal = vec3(normalMatrix * vec4(normal, 0.0));
    vLightDirection = lightDirection;

    gl_Position = vec4(position, 1.0) * projectionMatrix * modelViewMatrix; 
}

`

const fragmentShaderSource = `
precision mediump float;

uniform vec3 ambientColor;
uniform vec3 diffuseColor;
uniform vec3 specularColor;
uniform float shininess;

varying vec3 vNormal;
varying vec3 vLightDirection;

void main() {
    vec3 normal = normalize(vNormal);
    vec3 lightDir = normalize(vLightDirection);
    
    // Ambient component
    vec3 ambient = ambientColor;

    // Diffuse component
    float diff = max(dot(normal, lightDir), 0.0);
    vec3 diffuse = diff * diffuseColor;

    // Specular component (view-dependent)
    vec3 viewDir = vec3(0.0, 0.0, 1.0); // Assuming the view direction is along the z-axis
    vec3 reflectDir = reflect(-lightDir, normal);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = spec * specularColor;

    gl_FragColor = vec4(ambient + diffuse + specular, 1.0);
}

`

/**
 * @WARNING DO NOT CHANGE ANYTHING ABOVE THIS LINE
 */



/**
 * 
 * @TASK1 Calculate the model view matrix by using the chatGPT
 */

function getChatGPTModelViewMatrix() {
    const transformationMatrix = new Float32Array([
        0.6123724575042725, 0.3535533845424652, 0.7071067690849304, 0.3,
       -0.6123724575042725, 0.3535533845424652, -0.7071067690849304, -0.25,
       -0.5, 0.6123724575042725, -0.6123724575042725, 0,
        0, 0, 0, 1
    ]);
    
    
    return getTransposeMatrix(transformationMatrix);
}


/**
 * 
 * @TASK2 Calculate the model view matrix by using the given 
 * transformation methods and required transformation parameters
 * stated in transformation-prompt.txt
 */
function getModelViewMatrix() {
    // calculate the model view matrix by using the transformation
    // methods and return the modelView matrix in this method
    const transMatrix = createTranslationMatrix(0.3, -0.25, 0)
    const scaleMatrix = createScaleMatrix(0.5, 0.5, 1)
    const rotateMatrix_X = createRotationMatrix_X(30 * Math.PI / 180)
    const rotateMatrix_Y = createRotationMatrix_Y(45 * Math.PI / 180)
    const rotateMatrix_Z = createRotationMatrix_Z(60 * Math.PI / 180)

    // var returnMatrix = multiplyMatrices(scaleMatrix, transMatrix)
    // const tempMatrix = multiplyMatrices(rotateMatrix_Y, rotateMatrix_X)
    // returnMatrix = multiplyMatrices(tempMatrix, returnMatrix)
    // returnMatrix = multiplyMatrices(rotateMatrix_Z, returnMatrix)

    var returnMatrix = multiplyMatrices(scaleMatrix, transMatrix)
    returnMatrix = multiplyMatrices(rotateMatrix_X, returnMatrix)
    returnMatrix = multiplyMatrices(rotateMatrix_Y, returnMatrix)
    returnMatrix = multiplyMatrices(rotateMatrix_Z, returnMatrix)


    return returnMatrix
}

/**
 * 
 * @TASK3 Ask CHAT-GPT to animate the transformation calculated in 
 * task2 infinitely with a period of 10 seconds. 
 * First 5 seconds, the cube should transform from its initial 
 * position to the target position.
 * The next 5 seconds, the cube should return to its initial position.
 */
function getPeriodicMovement(startTime) {
    // Calculate the elapsed time since the animation started
    const currentTime = (Date.now() - startTime) % 10000; // 10000 milliseconds = 10 seconds

    // Define the duration for the transition (in milliseconds)
    const transitionDuration = 5000; // 5 seconds

    // Calculate the progress of the transition (between 0 and 1)
    const progress = currentTime / transitionDuration; // Progress over the entire 10 seconds

    // Use the progress to interpolate between the initial and final transformations
    // Assume initialTransform and finalTransform are your calculated transformation matrices
    let interpolatedTransform;

    if (currentTime <= transitionDuration) {
        // During the first 5 seconds, interpolate from the initial to final position
        interpolatedTransform = interpolateTransform(createIdentityMatrix(), getModelViewMatrix(), progress);
    } else {
        // During the last 5 seconds, interpolate from the final to initial position
        const reverseProgress = (currentTime - transitionDuration) / transitionDuration;
        interpolatedTransform = interpolateTransform(getModelViewMatrix(), createIdentityMatrix(), reverseProgress);
    }

    return interpolatedTransform;
}

// Helper function to interpolate between two transformation matrices
function interpolateTransform(matrixA, matrixB, progress) {
    // Assuming matrixA and matrixB are 4x4 transformation matrices
    // Interpolate each element of the matrices
    const interpolatedMatrix = [];

    for (let i = 0; i < 16; i++) {
        interpolatedMatrix[i] = matrixA[i] + progress * (matrixB[i] - matrixA[i]);
    }

    return interpolatedMatrix;
}




