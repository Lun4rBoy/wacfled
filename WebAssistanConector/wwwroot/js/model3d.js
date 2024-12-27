import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById('model3d-container');
    if (!container) {
        console.error('Container not found');
        return;
    }

    // Configuración inicial
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    // Crear el canvas para la textura de texto
    const textureSize = 1024;
    const textCanvas = document.createElement('canvas');
    textCanvas.width = textureSize;
    textCanvas.height = textureSize;
    const context = textCanvas.getContext('2d');
    const textTexture = new THREE.CanvasTexture(textCanvas);

    // Función principal
    function initCRTMonitor() {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        // Configurar renderer
        renderer.setSize(containerWidth, containerHeight);
        renderer.setClearColor(0x000000, 0); // Fondo transparente
        container.appendChild(renderer.domElement);

        // Ajustar cámara al contenedor
        camera.aspect = containerWidth / containerHeight;
        camera.position.set(9, 2, 18);  // Reducidos de (50, 20, 50)
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();

        // Iluminación
        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(8, 10, 10);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // Crear el cuerpo principal del monitor
        const monitorBody = new THREE.BoxGeometry(20, 15, 15);
        const monitorMaterial = new THREE.MeshStandardMaterial({
            color: 0x947EB0,         // Color base similar a los botones
            metalness: 0.3,          // Aumentar metalness para más reflejo
            roughness: 0.7,          // Mantener rugosidad para efecto mate
            envMapIntensity: 1.5,    // Intensidad del reflejo
        });

        // Crear materiales para diferentes caras para simular degradado
        const topMaterial = monitorMaterial.clone();
        topMaterial.color.setHex(0x8062D6);    // Tono más oscuro para arriba

        const bottomMaterial = monitorMaterial.clone();
        bottomMaterial.color.setHex(0x9288F8);  // Tono más claro para abajo

        const monitor = new THREE.Mesh(monitorBody, [
            monitorMaterial,     // derecha
            monitorMaterial,     // izquierda
            topMaterial,         // arriba
            bottomMaterial,      // abajo
            monitorMaterial,     // frente
            monitorMaterial      // atrás
        ]);
        scene.add(monitor);

        // Crear la pantalla
        const screenGeometry = new THREE.BoxGeometry(16, 12, 0.5);
        const screenMaterial = new THREE.MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x001100,
            emissiveMap: textTexture,
            emissiveIntensity: 20.0,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.95
        });
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.z = 7.5;
        monitor.add(screen);

        // Crear la base
        const baseGeometry = new THREE.BoxGeometry(10, 2, 8);
        const base = new THREE.Mesh(baseGeometry, monitorMaterial);
        base.position.y = -8.5;
        monitor.add(base);

        // Agregar controles de órbita
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 10;  // Distancia mínima al objetivo
        controls.maxDistance = 50; // Distancia máxima al objetivo

        // Manejar redimensionamiento
        window.addEventListener('resize', onWindowResize, false);
        function onWindowResize() {
            const newWidth = container.clientWidth;
            const newHeight = container.clientHeight;

            camera.aspect = newWidth / newHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(newWidth, newHeight);
        }

        // Inicializar con texto
        const now = new Date();
        const initialText = `
========================
System initialized
wacFled is now running
${now.toLocaleString()}
========================
`;

        typeWriter(initialText);

        // Configurar animación
        let isAnimating = true;
        let isCameraMoving = false;
        let rotationAngle = Math.PI; // Comienza girado 180 grados
        const animationDuration = 2000; // Duración en milisegundos
        const cameraDuration = 1000; // Duración del movimiento de la cámara
        const startTime = Date.now();
        let cameraStartTime;
        const initialCameraPosition = { x: 9, y: 2, z: 18 };
        const finalCameraPosition = { x: 0, y: 0, z: 25 };

        function animate() {
            requestAnimationFrame(animate);
            
            if (isAnimating) {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / animationDuration, 1);
                
                // Animación suave usando easeOut
                const easeOut = 1 - Math.pow(1 - progress, 3);
                monitor.rotation.y = rotationAngle * (1 - easeOut);
                
                if (progress >= 1) {
                    isAnimating = false;
                    monitor.rotation.y = 0;
                    isCameraMoving = true;
                    cameraStartTime = Date.now();
                }
            }

            if (isCameraMoving) {
                const elapsed = Date.now() - cameraStartTime;
                const progress = Math.min(elapsed / cameraDuration, 1);
                
                // Transición suave de la cámara
                const easeOut = 1 - Math.pow(1 - progress, 3);
                
                camera.position.x = initialCameraPosition.x + (finalCameraPosition.x - initialCameraPosition.x) * easeOut;
                camera.position.y = initialCameraPosition.y + (finalCameraPosition.y - initialCameraPosition.y) * easeOut;
                camera.position.z = initialCameraPosition.z + (finalCameraPosition.z - initialCameraPosition.z) * easeOut;
                
                if (progress >= 1) {
                    isCameraMoving = false;
                    camera.position.set(finalCameraPosition.x, finalCameraPosition.y, finalCameraPosition.z);
                }
            }
            
            controls.update();
            renderer.render(scene, camera);
        }

        animate();
    }

    // Función para actualizar el texto en la pantalla
    function updateScreenText(text) {
        context.fillStyle = '#000000';
        context.fillRect(0, 0, textureSize, textureSize);

        context.font = '32px "Monocraft"';
        context.fillStyle = '#00ff00';
        context.textAlign = 'left';
        context.textBaseline = 'top';

        const lines = text.split('\n');
        const lineHeight = 40;

        lines.forEach((line, i) => {
            context.shadowColor = '#00ff00';
            context.shadowBlur = 1;
            context.fillText(line, 10, 10 + (i * lineHeight));
        });

        textTexture.needsUpdate = true;
    }

    let currentTypewriterTimeout = null;

    function typeWriter(text, delay = 50) {
        // Cancelar cualquier animación en curso
        if (currentTypewriterTimeout) {
            clearTimeout(currentTypewriterTimeout);
            currentTypewriterTimeout = null;
        }
        
        // Limpiar la pantalla
        updateScreenText('');
        
        let displayText = '';
        let currentIndex = 0;

        function addLetter() {
            if (currentIndex < text.length) {
                displayText += text[currentIndex];
                updateScreenText(displayText);
                currentIndex++;
                currentTypewriterTimeout = setTimeout(addLetter, delay);
            } else {
                currentTypewriterTimeout = null;
            }
        }

        addLetter();
    }

    // Hacer typeWriter y currentTypewriterTimeout disponibles globalmente
    window.typeWriter = typeWriter;
    window.currentTypewriterTimeout = currentTypewriterTimeout;

    // Iniciar la aplicación
    initCRTMonitor();
});
