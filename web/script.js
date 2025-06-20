import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OCCTLoader } from 'occt-import-js';

// --- Елементи DOM ---
const fileInput = document.getElementById('fileInput');
const loadFileBtn = document.getElementById('loadFileBtn');
const viewerContainer = document.getElementById('viewer-container');
const loaderElement = document.getElementById('loader');
const dropzone = document.getElementById('dropzone');

let scene, camera, renderer, controls, currentModel;

// --- Ініціалізація 3D-середовища ---
function init() {
    // Сцена
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x282c34);

    // Камера
    camera = new THREE.PerspectiveCamera(75, viewerContainer.clientWidth / viewerContainer.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    viewerContainer.appendChild(renderer.domElement);
    renderer.domElement.id = 'viewer-canvas';

    // Освітлення
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Контроли камери
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Обробник зміни розміру вікна
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

// --- Цикл анімації ---
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// --- Обробка зміни розміру вікна ---
function onWindowResize() {
    camera.aspect = viewerContainer.clientWidth / viewerContainer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewerContainer.clientWidth, viewerContainer.clientHeight);
}

// --- Логіка завантаження файлу ---
async function loadFile(file) {
    if (!file) return;

    // Показати завантажувач та приховати dropzone
    loaderElement.classList.remove('hidden');
    dropzone.style.display = 'none';

    // Видалити попередню модель
    if (currentModel) {
        scene.remove(currentModel);
        currentModel.traverse(child => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
    }

    const loader = new OCCTLoader();
    const fileBuffer = await file.arrayBuffer();

    try {
        const result = await loader.parse(fileBuffer);

        currentModel = result;
        scene.add(currentModel);

        // Центрування камери на моделі
        const box = new THREE.Box3().setFromObject(currentModel);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
        cameraZ *= 1.5; // Додатковий відступ

        camera.position.copy(center);
        camera.position.x += size.x / 2;
        camera.position.y += size.y / 2;
        camera.position.z += cameraZ;

        controls.target.copy(center);
        controls.update();

    } catch (err) {
        console.error('Помилка завантаження моделі:', err);
        alert('Не вдалося завантажити модель. Перевірте консоль для деталей.');
    } finally {
        loaderElement.classList.add('hidden');
    }
}


// --- Обробники подій ---
loadFileBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (event) => {
    if (event.target.files.length > 0) {
        loadFile(event.target.files[0]);
    }
});

// Drag and Drop
viewerContainer.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('dragover');
});

viewerContainer.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

viewerContainer.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragover');
    if (event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (file.name.toLowerCase().endsWith('.step') || file.name.toLowerCase().endsWith('.stp')) {
            loadFile(file);
        } else {
            alert('Будь ласка, завантажте файл у форматі .step або .stp');
        }
    }
});


// --- Ініціалізація Service Worker для PWA ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker зареєстровано:', reg))
            .catch(err => console.error('Помилка реєстрації Service Worker:', err));
    });
}

// --- Запуск ---
init();