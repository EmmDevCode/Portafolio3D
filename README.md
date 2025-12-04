<p align="center"> <a href="https://github.com/DenverCoder1/readme-typing-svg"><img src="https://readme-typing-svg.herokuapp.com?font=Time+New+Roman&color=%233F54927&size=25&center=true&vCenter=true&width=600&height=100&lines=My+3D+Portfolio+💻;Interactive+WebGL+Room;by+Emmanuel+Diaz"></a>

</p>

## What languages ​​does it use??
<p align="center">

This project uses HTML, combined with JavaScript and CSS.

<a href="#"><img alt="HTML" src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white"></a>
<a href="#"><img alt="Js" src="https://img.shields.io/badge/javascript-f0db4f.svg?style=for-the-badge&logo=javascript&logoColor=white"></a>
<a href="#"><img alt="Css" src="https://img.shields.io/badge/Css-663399.svg?style=for-the-badge&logo=Css&logoColor=white"></a>

</p>

</p>

## Which JavaScript frameworks does it use?  <a href="#"><img alt="PYTHON" src="https://techstack-generator.vercel.app/js-icon.svg" alt="icon" width="50" height="50"></a>
<p align="center">

This project uses a unique combination of WebGLRenderer and CSS3DRenderer.

WebGL: Renders the 3D geometry of the room, lighting, and shadows (the .glb model).

CSS3D: Allows us to map standard HTML elements (divs, buttons, scrollable text) onto 3D planes within the scene. This means the screens inside the 3D room are fully interactive DOM elements!

</p>

## The Blender Workflow
<p align="center">

The room was modeled in Blender. Instead of hard-coding positions in JavaScript, I placed "Empty" objects (locators) in Blender where I wanted the screens to appear (e.g., monitor-empty, ipad-empty). The code reads these positions from the exported .glb file and automatically snaps the interactive HTML screens to those coordinates.


</p>

</p>

## 🛠️ Tech Stack
<p align="center">
  
* **Three.js: The core 3D library for the web.**

* **Blender: Used for 3D modeling the room and assets.**

* **GSAP: Used for smooth camera transitions and animations.**

* **HTML5/CSS3: For the UI overlay and the internal 3D screens.**

<p align="center"> <a href="https://threejs.org/" target="_blank"><img src="https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white"/></a> <a href="https://www.blender.org/" target="_blank"><img src="https://img.shields.io/badge/Blender-E87D0D?style=for-the-badge&logo=blender&logoColor=white"/></a> <a href="https://greensock.com/gsap/" target="_blank"><img src="https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=white"/></a> <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank"><img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/></a> </p>
</p>

## 📂Project Structure
```bash
Portfolio_3D/
├── assets/                 # 3D Models (.glb) and Images
│   ├── Portafolio2.glb     # The Blender room model
│   └── perfil.png          # Profile picture
├── index.html              # Main entry point & overlay UI
├── styles.css              # Styling for UI and 3D screens
├── script.js               # UI Logic (Loading screen, Overlay events)
├── three.js                # Core 3D Logic (Scene, Camera, Renderers)
└── README.md
```
</p>

## 🎮 How to Navigate 

* Orbit Controls: You can click and drag to rotate the view slightly around the current focus point.

* Click to Navigate: Click on any screen in the 3D world (Monitor, iPad, etc.) to zoom in and focus on that section.

* Navbar: Use the floating navigation bar on the left to jump between sections:

 * 👤 Monitor: About Me

 * 💼 iPad: Projects (Scrollable & Clickable)

 * 💻 Wall: Technical Skills

 * ✉️ TV: Contact Form

* Theme Toggle: Click the Sun/Moon icon in the top right to switch between Day (Light) and Night (Dark) modes. This changes the room's lighting and materials in real-time!

## 🎬 DEMO

![WEB Demo GIF](./demo/Demo.mp4)


