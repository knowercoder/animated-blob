# animated-blob
A three.js blob, animated with a custom shader material. The blob has several properties that can be customized for its appearance and animation.

Live Demo: https://knowercoder.github.io/animated-blob/

![animated-blob](https://github.com/user-attachments/assets/96b32acf-c7e0-4fb9-8fca-8ec09efa3a3a)


### How it works
A 3D sphere's vertex is animated with the custom material's vertex shader in GLSL. The vertex normals have been adjusted to align with the vertex positions, for correct lighting calculations in the fragmet shader. In the fragment shader, a simple Blinn phong lighting model is used.
