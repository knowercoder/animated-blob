// Canvas
const canvas = document.querySelector('canvas.webgl');

// #region Init Scene
const scene = new THREE.Scene();

const lightProperties = {
    backgroundColor: {value: new THREE.Color(0x5e5e5e)} 
}
scene.background = lightProperties.backgroundColor.value;

const sizes = {
    width: canvas.clientWidth,
    height: canvas.clientHeight
}

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight1.position.set(5, 6, 5);
directionalLight1.rotation.set(0, 0, 0);

scene.add(directionalLight1);

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 10;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(window.devicePixelRatio);

//#endregion

//set the initial blob properties here
const blobRadius = 4.0;
const blobProperties = {
    u_time: {value: 0.0},
    _mousePos: {value: new THREE.Vector3(0.0, 0.0, 4.0)},
    _wiggleDampening: {value: 0.0},
    _wiggleFrequency: {value: 1.5},
    _wiggleAmplitude: {value: 1.5},
    _wiggleSpeed: {value: 15.0},
    _mouseRotate: {value: 0.0},
    _baseColor1: {value: new THREE.Color(0xf0fc03)},
    _baseColor2: { value: new THREE.Color(0x03fc4e) },
    _baseColor3: { value: new THREE.Color(0xfc0314) },
    _baseColor4: { value: new THREE.Color(0x0352fc) },
    _baseColor5: { value: new THREE.Color(0xff00ff) },
    _baseColor6: { value: new THREE.Color(0x01801a) },
    _colorsAngle: { value: new THREE.Vector3(0.0, 0.0, -50.0)},
    _colorSinusoidal: {value: 0.5},
    _segmentColor1: {value: 0.1},
    _segmentColor2: {value: 0.1},
    _segmentColor3: {value: 0.1},
    _segmentColor4: {value: 0.1},
    _segmentColor5: {value: 0.1},
    _segmentColor6: {value: 0.1},
    _frequency: {value: 1.0},
    _amplitude: {value: 0.4},
    _metallic: { value: 0.9 },
    _smoothness: { value: 0.9 },

    _lightintensity: {value: 1.5}
}

const blobMaterial = new THREE.ShaderMaterial({
    uniforms: blobProperties,
    vertexShader: /* glsl */` 
        attribute vec3 tangent;

        uniform float u_time;         
        uniform vec3 _mousePos;
        uniform float _frequency; 
        uniform float _amplitude;  
        
        uniform float _wiggleDampening;
        uniform float _wiggleFrequency;
        uniform float _wiggleAmplitude;
        uniform float _wiggleSpeed;

        uniform float _mouseRotate;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 PositionVS;        
        varying vec3 PositionWS;
        varying vec3 PositionOS;

        vec3 mod289(vec3 x)
        {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 mod289(vec4 x)
        {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
        }

        vec4 permute(vec4 x)
        {
        return mod289(((x*34.0)+10.0)*x);
        }

        vec4 taylorInvSqrt(vec4 r)
        {
        return 1.79284291400159 - 0.85373472095314 * r;
        }

        vec3 fade(vec3 t) {
        return t*t*t*(t*(t*6.0-15.0)+10.0);
        }

        float pnoise(vec3 P, vec3 rep)
        {
        vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
        vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
        Pi0 = mod289(Pi0);
        Pi1 = mod289(Pi1);
        vec3 Pf0 = fract(P); // Fractional part for interpolation
        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
        vec4 iy = vec4(Pi0.yy, Pi1.yy);
        vec4 iz0 = Pi0.zzzz;
        vec4 iz1 = Pi1.zzzz;

        vec4 ixy = permute(permute(ix) + iy);
        vec4 ixy0 = permute(ixy + iz0);
        vec4 ixy1 = permute(ixy + iz1);

        vec4 gx0 = ixy0 * (1.0 / 7.0);
        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
        gx0 = fract(gx0);
        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
        vec4 sz0 = step(gz0, vec4(0.0));
        gx0 -= sz0 * (step(0.0, gx0) - 0.5);
        gy0 -= sz0 * (step(0.0, gy0) - 0.5);

        vec4 gx1 = ixy1 * (1.0 / 7.0);
        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
        gx1 = fract(gx1);
        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
        vec4 sz1 = step(gz1, vec4(0.0));
        gx1 -= sz1 * (step(0.0, gx1) - 0.5);
        gy1 -= sz1 * (step(0.0, gy1) - 0.5);

        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
        g000 *= norm0.x;
        g010 *= norm0.y;
        g100 *= norm0.z;
        g110 *= norm0.w;
        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
        g001 *= norm1.x;
        g011 *= norm1.y;
        g101 *= norm1.z;
        g111 *= norm1.w;

        float n000 = dot(g000, Pf0);
        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
        float n111 = dot(g111, Pf1);

        vec3 fade_xyz = fade(Pf0);
        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
        return 2.2 * n_xyz;
        }

        mat4 createRotationMatrix(vec3 angles) {
            float cosX = cos(angles.x);
            float sinX = sin(angles.x);
            float cosY = cos(angles.y);
            float sinY = sin(angles.y);
            float cosZ = cos(angles.z);
            float sinZ = sin(angles.z);
    
            mat4 rotationX = mat4(
                1.0, 0.0, 0.0, 0.0,
                0.0, cosX, -sinX, 0.0,
                0.0, sinX, cosX, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            mat4 rotationY = mat4(
                cosY, 0.0, sinY, 0.0,
                0.0, 1.0, 0.0, 0.0,
                -sinY, 0.0, cosY, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            mat4 rotationZ = mat4(
                cosZ, -sinZ, 0.0, 0.0,
                sinZ, cosZ, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            return rotationZ * rotationY * rotationX;
        }


        
        void main() {
            vUv = uv;
            //vNormal = normalize(normalMatrix * normal);
            float time = u_time * 0.5;
            vec3 rep = vec3(10.0);
            float frequency = _frequency;
            float amplitude = _amplitude;
            PositionOS = position;

            vec3 mousepos = (inverse(modelMatrix) * vec4(_mousePos, 1.0)).xyz;
            float mdistance = length(mousepos - position);
            vec3 wiggleOffset = normal * sin(-time * _wiggleSpeed + mdistance * _wiggleFrequency) * clamp(1.0/mdistance, 0.0, 1.0) * _wiggleDampening * _wiggleAmplitude;
            
            vec3 rotateOffset = -(createRotationMatrix(vec3(0.0, _mouseRotate,  0.0)) * vec4(position, 1.0)).xyz + position;

            float displacement = pnoise((position + wiggleOffset + rotateOffset) * frequency + time, rep) * amplitude;            
            vec3 newPosition = position + normal * displacement;

            vec3 posPlusTangent = position + tangent * 0.01;
            displacement = pnoise((posPlusTangent + wiggleOffset + rotateOffset) * frequency + time, rep) * amplitude;
            posPlusTangent = posPlusTangent + normal * displacement;

            vec3 bitangent = cross(normal, tangent);
            vec3 posPlusBitangent = position + bitangent * 0.01;
            displacement = pnoise((posPlusBitangent + wiggleOffset + rotateOffset) * frequency + time, rep) * amplitude;
            posPlusBitangent = posPlusBitangent + normal * displacement;

            vec3 modifiedTangent = posPlusTangent - newPosition;
            vec3 modifiedBitangent = posPlusBitangent - newPosition;
            vec3 modifiedNormal = cross(modifiedTangent, modifiedBitangent);
            vNormal = normalize(modifiedNormal);
            vNormal = normalize(normalMatrix * vNormal);
            
            PositionWS = vec3(modelMatrix * vec4(newPosition, 1.0));
            PositionVS = vec3(modelViewMatrix * vec4(newPosition, 1.0));

            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: /* glsl */`            
        uniform vec3 _baseColor1;
        uniform vec3 _baseColor2;        
        uniform vec3 _baseColor3;
        uniform vec3 _baseColor4;
        uniform vec3 _baseColor5;
        uniform vec3 _baseColor6;   
        uniform vec3 _colorsAngle;  
        uniform float _colorSinusoidal; 
        uniform float _segmentColor1;  
        uniform float _segmentColor2; 
        uniform float _segmentColor3; 
        uniform float _segmentColor4; 
        uniform float _segmentColor5; 
        uniform float _segmentColor6; 
        uniform float _metallic;
        uniform float _smoothness;

        uniform float _lightintensity;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 PositionWS;
        varying vec3 PositionVS;  
        varying vec3 PositionOS;
        
        mat4 createRotationMatrix(vec3 angles) {
            float cosX = cos(angles.x);
            float sinX = sin(angles.x);
            float cosY = cos(angles.y);
            float sinY = sin(angles.y);
            float cosZ = cos(angles.z);
            float sinZ = sin(angles.z);
    
            mat4 rotationX = mat4(
                1.0, 0.0, 0.0, 0.0,
                0.0, cosX, -sinX, 0.0,
                0.0, sinX, cosX, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            mat4 rotationY = mat4(
                cosY, 0.0, sinY, 0.0,
                0.0, 1.0, 0.0, 0.0,
                -sinY, 0.0, cosY, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            mat4 rotationZ = mat4(
                cosZ, -sinZ, 0.0, 0.0,
                sinZ, cosZ, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            );
    
            return rotationZ * rotationY * rotationX;
        }

        vec3 SegmentColor(vec3 positionos){
            
            vec3 angles = vec3(radians(_colorsAngle.x), radians(_colorsAngle.y), radians(_colorsAngle.z));
            mat4 rotationMatrix = createRotationMatrix(angles);
            vec4 transformedPosition = rotationMatrix * vec4(positionos, 1.0);
        
            float segmentBounds[6];
            segmentBounds[0] = _segmentColor1;
            segmentBounds[1] = _segmentColor2;
            segmentBounds[2] = _segmentColor3;
            segmentBounds[3] = _segmentColor4;
            segmentBounds[4] = _segmentColor5;
            segmentBounds[5] = _segmentColor6;
        
            float totalWidth = 0.0;
            for (int i = 0; i < 6; ++i) {
                totalWidth += segmentBounds[i];
            }
        
            transformedPosition.y += sin(transformedPosition.x) * _colorSinusoidal;
            float normalizedY = (transformedPosition.y + 5.0) / 10.0;
            float cumulativeWidth = 0.0;
            int segmentIndex = 0;
        
            for (int i = 0; i < 7; ++i) {
                cumulativeWidth += segmentBounds[i] / totalWidth;
                if (normalizedY <= cumulativeWidth) {
                    segmentIndex = i;
                    break;
                }
            }

            float segmentFraction = (normalizedY - (cumulativeWidth - segmentBounds[segmentIndex] / totalWidth)) / (segmentBounds[segmentIndex] / totalWidth);
            float sineFraction = 0.5 * (1.0 - cos(segmentFraction * 3.14159265));
        
            vec3 colors[6];
            colors[0] = _baseColor1;
            colors[1] = _baseColor2;
            colors[2] = _baseColor3;
            colors[3] = _baseColor4;
            colors[4] = _baseColor5;
            colors[5] = _baseColor6;
        
            vec3 colorA = colors[segmentIndex];
            vec3 colorB = colors[(segmentIndex + 1) % 6];
        
            return mix(colorA, colorB, sineFraction);
        }

        vec3 SegmentColor2(vec3 poitionos) {
            vec3 angles = vec3(radians(_colorsAngle.x), radians(_colorsAngle.y), radians(_colorsAngle.z));
            mat4 rotationMatrix = createRotationMatrix(angles);
            vec4 transformedPosition = rotationMatrix * vec4(poitionos, 1.0);
        
            transformedPosition.y += sin(transformedPosition.x);
            float segmentIndex = (transformedPosition.y + 4.0) / 8.0 * 6.0;
            float segmentIndexFloor = floor(segmentIndex);
            float segmentFraction = segmentIndex - segmentIndexFloor;
        
            // Use a sine wave pattern to modulate the fraction
            float sineFraction = 0.5 * (1.0 - cos(segmentFraction * 3.14159265));
        
            vec3 color0 = _baseColor1;  
            vec3 color1 = _baseColor2;  
            vec3 color2 = _baseColor3;  
            vec3 color3 = _baseColor4;  
            vec3 color4 = _baseColor5;  
            vec3 color5 = _baseColor6;  
        
            vec3 colorA;
            vec3 colorB;
        
            if (segmentIndexFloor == 0.0) {
                colorA = color0;
                colorB = color1;
            } else if (segmentIndexFloor == 1.0) {
                colorA = color1;
                colorB = color2;
            } else if (segmentIndexFloor == 2.0) {
                colorA = color2;
                colorB = color3;
            } else if (segmentIndexFloor == 3.0) {
                colorA = color3;
                colorB = color4;
            } else if (segmentIndexFloor == 4.0) {
                colorA = color4;
                colorB = color5;
            } else {
                colorA = color5;
                colorB = color0; // Wrap around for a cyclic color
            }
        
            return mix(colorA, colorB, sineFraction);
        }
        
        

        void main() {           
            
            vec2 uv = vUv;
            vec3 vnormal = normalize(vNormal);

            vec3 albedo = SegmentColor(PositionOS);

            //vec3 indirectLight = vec3(0.15);
            vec3 mate = vec3(0.18) * albedo;
            //diffuse            
            vec3 lightdir = normalize(vec3(0.8, 0.4, 0.7));
            float sunDiffuse = clamp(dot(vnormal, lightdir), 0.0, 1.0);
            float skyDiffuse = clamp(0.5 + 0.5 * dot(vnormal, vec3(0.0, 1.0, 0.0)), 0.0, 1.0);// * (1.0 - metallic); 
            float bounceDiffuse = clamp(0.5 + 0.5 * dot(vnormal, vec3(0.0, -1.0, 0.0)), 0.0, 1.0);       

            vec3 diffuseCol = mate * vec3(7.0, 4.5, 3.0) * sunDiffuse * _lightintensity;
            diffuseCol += mate * vec3(0.5, 0.8, 0.9) * skyDiffuse;
            diffuseCol += mate * vec3(0.7, 0.3, 0.2) * bounceDiffuse * (1.0 - _metallic);

            // specular
            vec3 viewDir = normalize(-PositionVS);
            vec3 reflectDir = reflect(-lightdir, vnormal);  
            float spec = pow(max(dot(viewDir, reflectDir), 0.0), _smoothness * 128.0);   
            vec3 specular = vec3(1.0) * spec * 1.5 * _metallic; 
            // specular += mate * vec3(0.5, 0.8, 0.9) * skyDiffuse;
            // specular += mate * vec3(0.7, 0.3, 0.2) * bounceDiffuse;
            

            vec3 finalcol = (diffuseCol + specular);
            finalcol = pow(finalcol, vec3(0.4545));
            gl_FragColor = vec4(finalcol, 1.0);
        }
    `,
    side: THREE.DoubleSide
});

//craete a 3D sphere mesh with our blob material
const blobGeometry = new THREE.SphereGeometry(blobRadius, 300, 300);
blobGeometry.computeTangents();
const blob = new THREE.Mesh(blobGeometry, blobMaterial);
scene.add(blob);


// Handle window resize
window.addEventListener('resize', () => {
    sizes.width = canvas.clientWidth;
    sizes.height = canvas.clientHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(window.devicePixelRatio);
});

let isDragging = false;
let dragged = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

// Function to check if the mouse is over the dat.GUI panel
function isMouseOverGUI(event) {
    return document.querySelector('.dg.ac').contains(event.target);
}

let damp = 0.0;
function onMouseDown(event) {
   
    if (isMouseOverGUI(event))
        return;

    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;      
    
    // Add event listeners for mousemove and mouseup
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

let eulerRotation = new THREE.Euler(0.0, 0.0, 0.0,'XYZ');
let isrotateAnimating = false;
function onMouseMove(event) {
    
    isDragging = true;
    // Handle drag start
    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    // Update sphere rotation
    eulerRotation = new THREE.Euler(
        THREE.MathUtils.degToRad(deltaMove.y * 0.5),
        THREE.MathUtils.degToRad(deltaMove.x * 0.5),
        0,
        'XYZ'
    )     
    const deltaRotationQuaternion = new THREE.Quaternion()
        .setFromEuler(eulerRotation);

    blob.quaternion.multiplyQuaternions(deltaRotationQuaternion, blob.quaternion);

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };  
        
}

function onMouseUp(event) {
    // Remove event listeners for mousemove and mouseup
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    if (!isDragging) {
        // Handle click action
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        // Raycaster to detect mouse intersection with the blob
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObject(blob);
        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            blobProperties._mousePos.value.copy(intersectPoint); 
            animateDamp();
        }    
        console.log('Mouse clicked');
    } else {
        // Handle drag end        
        console.log('Drag ended');
    }

    isDragging = false; // Reset drag flag
}

document.addEventListener('mousedown', onMouseDown);

function animateDamp() {
    const timeline = gsap.timeline();
    timeline.to(blobProperties._wiggleDampening, { value: 0.5, duration: 0.2, ease: "power1.inOut" })
            .to(blobProperties._wiggleDampening, { value: 0.0, duration: 1.0, ease: "power1.inOut" })
};

//#region Dat.GUI
const gui = new dat.GUI();

// Helper function to add color controls
function addColorControl(gui, obj, propName, name) {
    const colorProxy = { color: `#${obj[propName].value.getHexString()}` };
    gui.addColor(colorProxy, 'color').name(name).onChange(value => {
        obj[propName].value.set(value);
    });
}

// Add color controls
const colorsFolder = gui.addFolder('Colors');
addColorControl(colorsFolder, blobProperties, '_baseColor1', 'Base Color1');
addColorControl(colorsFolder, blobProperties, '_baseColor2', 'Base Color2');
addColorControl(colorsFolder, blobProperties, '_baseColor3', 'Base Color3');
addColorControl(colorsFolder, blobProperties, '_baseColor4', 'Base Color4');
addColorControl(colorsFolder, blobProperties, '_baseColor5', 'Base Color5');
addColorControl(colorsFolder, blobProperties, '_baseColor6', 'Base Color6');

const colorsAngleFolder = colorsFolder.addFolder('colors Angle');
colorsAngleFolder.add(blobProperties._colorsAngle.value, 'x', -180, 180).name('x');
colorsAngleFolder.add(blobProperties._colorsAngle.value, 'y', -180, 180).name('y');
colorsAngleFolder.add(blobProperties._colorsAngle.value, 'z', -180, 180).name('z');
colorsAngleFolder.add(blobProperties._colorSinusoidal, 'value', 0, 1).name('Color Sinusoidal');

const colorsSegmentFolder = colorsFolder.addFolder('Color Segments');
colorsSegmentFolder.add(blobProperties._segmentColor1, 'value', 0, 1).name('Segment1');
colorsSegmentFolder.add(blobProperties._segmentColor2, 'value', 0, 1).name('Segment2');
colorsSegmentFolder.add(blobProperties._segmentColor3, 'value', 0, 1).name('Segment3');
colorsSegmentFolder.add(blobProperties._segmentColor4, 'value', 0, 1).name('Segment4');
colorsSegmentFolder.add(blobProperties._segmentColor5, 'value', 0, 1).name('Segment5');
colorsSegmentFolder.add(blobProperties._segmentColor6, 'value', 0, 1).name('Segment6');

const blobProp = gui.addFolder('Blob Properties');
blobProp.add(blobProperties._frequency, 'value', 0, 10).name('Frequency');
blobProp.add(blobProperties._amplitude, 'value', 0, 2).name('Amplitude');
blobProp.add(blobProperties._metallic, 'value', 0, 1).name('Metallic');
blobProp.add(blobProperties._smoothness, 'value', 0.01, 1).name('Smoothness');

const wiggleProp = gui.addFolder('Wiggle Properties');
wiggleProp.add(blobProperties._wiggleFrequency, 'value', 0, 10).name('Wiggle Frequency');
wiggleProp.add(blobProperties._wiggleAmplitude, 'value', 0, 10).name('Wiggle Amplitude');
wiggleProp.add(blobProperties._wiggleSpeed, 'value', 0, 30).name('Wiggle Speed');

const lightingProp = gui.addFolder('Lighting Properties');
addColorControl(lightingProp, lightProperties, 'backgroundColor', 'Base Color');
lightingProp.add(blobProperties._lightintensity, 'value', 0, 3).name('Light Intensity');

//#endregion


// Animation loop
let startTime = performance.now() / 1000;
let currentTime = 0.0;
let elapsedTime = 0.0; 

function animate() {
    requestAnimationFrame(animate);    
    
    currentTime = performance.now() / 1000;
    elapsedTime = currentTime - startTime;  
    blobProperties.u_time.value = elapsedTime;

    renderer.render(scene, camera);
}

animate();
