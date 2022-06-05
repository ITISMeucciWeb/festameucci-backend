<script lang="ts" setup>

import {
  Box3,
  BoxBufferGeometry,
  CanvasTexture,
  Color,
  DoubleSide,
  DynamicDrawUsage,
  ExtrudeBufferGeometry,
  Group,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  TorusKnotGeometry,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import OrbitronBlack from "../typefaces/Orbitron_Black.json?url";
import {onMounted, ref} from "vue";
import gsap from "gsap";
import {Font, FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {fragmentShader, vertexShader} from "@/shaders/shaders";
import QRCode from "easyqrcodejs";
import {SVGLoader} from "three/examples/jsm/loaders/SVGLoader";
import {useRouter} from "vue-router";

const appContainer = ref<HTMLDivElement | null>(null);

const router = useRouter();

let boxMaterialMeucci: ShaderMaterial | null = null;
let boxMeshMeucci: Mesh | null = null;
let boxMaterialNick: ShaderMaterial | null = null;
const rowCount = 36;
const columnCount = 30;
const layerCount = 3;
let dummyScale = {
  x: 0.5,
  y: 1,
  z: 0.5,
}
let renderingHole = true;

let doTheInitialAnimation = true;

let id = router.currentRoute.value.query.id as string | null;
if (id) {
  localStorage.setItem("idv2", id);
  doTheInitialAnimation = false;
} else {
  id = localStorage.getItem("idv2");
}

onMounted(async () => {
  const dummy = new Object3D();

  let camera: PerspectiveCamera = new PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
  camera.position.set(6, 7, 0);
  camera.lookAt(0.3, 0, 0);
  const scene = new Scene();

  const geom = new BoxBufferGeometry();

  geom.computeVertexNormals();

  const canvas = document.createElement('canvas');

  const size = canvas.height = canvas.width = 32;
  let ctx = canvas.getContext('2d');
  ctx!.fillStyle = 'white';
  ctx!.fillRect(0, 0, size, size);
  ctx!.clearRect(1, 1, size - 2, size - 2);
  const map = new CanvasTexture(canvas);
  map.anisotropy = 4;
  const material = new MeshBasicMaterial({map});


  const mesh = new InstancedMesh(geom, material, rowCount * columnCount * layerCount);
  mesh.instanceMatrix.setUsage(DynamicDrawUsage);
  scene.add(mesh);

  const renderer = new WebGLRenderer({antialias: true});
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  appContainer.value!.appendChild(renderer.domElement);

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
  }, false);

  await renderTargetsPrepare();
  animate(0);

  function animate(time: number) {
    const animTime = time / 1000;

    boxMaterialMeucci!.uniforms.uTime.value = animTime / 1.5;
    boxMaterialNick!.uniforms.uTime.value = animTime;
    if (renderingHole) {
      renderHole(animTime);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  if (doTheInitialAnimation) {
    const timeLine = gsap.timeline();

    timeLine
        .to(camera.position, {
          delay: 2,
          duration: 2,
          x: 0,
          y: 15,
          ease: 'power2.inOut'
        }, "out")
        .to(camera.rotation, {
          duration: 2,
          delay: 2,
          x: -(Math.PI / 2),
          y: 0,
          ease: 'power2.inOut'
        }, "out")
        .to(camera.position, {
          duration: 1,
          x: 0,
          y: -20,
          ease: 'power2.inOut'
        }, "align")
        .to(camera.rotation, {
          duration: 1,
          z: Math.PI,
          ease: 'power2.inOut'
        }, "align")
        .to(camera.position, {
          duration: 1,
          x: 0,
          y: -15,
          ease: 'power2.inOut'
        }, "=-1")
        .to(camera.position, {
          duration: 0.7,
          delay: 0.5,
          x: 0,
          y: -10,
          ease: 'power2.inOut'
        })
        .to(camera.position, {
          duration: 1,
          x: 0,
          y: -35,
          ease: 'power2.inOut'
        }, "=-0.1")
        .to(camera.rotation, {
          z: Math.PI * 3,
          duration: 0.5,
          ease: 'power2.inOut',
        }, "=-0.8")
        .to(dummyScale, {
          delay: 0.008,
          x: 0,
          y: 0,
          z: 0,
          duration: 1,
          onComplete: () => {
            renderingHole = false;
            scene.remove(mesh);
            if (!id) {
              setTimeout(() => {
                window.location.href = import.meta.env.VITE_BACKEND_API_URL + "google/redirect";
              }, 1000)
            } else {
              spawnQr();
            }
          }
        })
  } else {
    renderingHole = false;
    scene.remove(mesh);
    camera.position.set(0, -35, 0);
    camera.rotation.set(-(Math.PI / 2), 0, Math.PI * 3);

    spawnQr();
  }

  async function spawnQr() {
    const qrSVG = await new Promise<string>((resolve) => {
      new QRCode(document.createElement("div"), {
        text: id,
        correctLevel: QRCode.CorrectLevel.H,
        drawer: "svg",
        quietZone: 8,
        quietZoneColor: "rgba(255,255,255, 1)",
        onRenderingEnd: (_: object, svg: string) => {
          resolve(svg)
        },
        backgroundImageAlpha: 0
      });
    })

    const svgData = new SVGLoader().parse(qrSVG);

    const svgGroup = new Group();
    const fillMaterial = new MeshBasicMaterial({color: "#ffffff"});
    const innerMaterial = new MeshBasicMaterial({color: "#000000"});

    svgGroup.scale.y *= -1;
    svgData.paths.forEach((path) => {
      const shapes = SVGLoader.createShapes(path);

      shapes.forEach((shape) => {
        const meshGeometry = new ExtrudeBufferGeometry(shape, {
          depth: 1,
          bevelEnabled: false,
        });
        const mesh = new Mesh(meshGeometry, path.color.r != 0 ? fillMaterial : innerMaterial);

        svgGroup.add(mesh);
      });
    });

    const box = new Box3().setFromObject(svgGroup);
    const size = box.getSize(new Vector3());
    const yOffset = size.y / -2;
    const xOffset = size.x / -2;

    // Offset all of group's elements, to center them
    svgGroup.children.forEach((item) => {
      item.position.x = xOffset;
      item.position.y = yOffset;
    });
    svgGroup.rotateX(-Math.PI / 2);
    svgGroup.position.y = -400;
    svgGroup.scale.set(0, 0, 0);

    scene.add(svgGroup);


    const timeLine = gsap.timeline();
    timeLine
        .to(boxMeshMeucci!.scale, {
          duration: 1,
          delay: 1,
          x: 0.035,
          y: 0.035,
          z: 0.035,
          ease: 'power2.inOut',
        }, "enterqr")
        .to(svgGroup.scale, {
          duration: 1,
          delay: 1,
          x: 0.7,
          y: 0.7,
          z: 0.7,
          ease: 'power2.inOut',
        }, "enterqr")
  }


  async function renderTargetsPrepare() {
    const loader = new FontLoader();
    const font = await new Promise((resolve) => {
      loader.load(OrbitronBlack, resolve);
    }) as Font;

    const renderTargetMeucci = new WebGLRenderTarget(innerWidth, innerHeight);
    const renderTargetCameraMeucci = new PerspectiveCamera(45, 1, 0.1, 1000);
    renderTargetCameraMeucci.position.z = 2.5;

    const renderTargetNick = new WebGLRenderTarget(innerWidth, innerHeight);
    const renderTargetCameraNick = new PerspectiveCamera(45, 1, 0.1, 1000);
    renderTargetCameraNick.position.z = 2.5;


    const renderTargetSceneMeucci = new Scene();
    renderTargetSceneMeucci.background = new Color(0x00000000);

    const renderTargetSceneNick = new Scene();
    renderTargetSceneMeucci.background = new Color(0x00000000);

    const textGeometryMeucci = new TextGeometry('ITIS MEUCCI', {
      font: font,
      size: 80,
    });

    const textGeometryNick = new TextGeometry('DreamingCodes', {
      font: font,
      size: 80,
    });

    const textMaterial = new MeshBasicMaterial({color: 0xfffffff, side: DoubleSide, transparent: true});

    const textMeshMeucci = new Mesh(textGeometryMeucci, textMaterial);
    textMeshMeucci.position.set(-0.965, -0.6, 0);
    textMeshMeucci.rotation.set(Math.PI, -0.5, 0);
    textMeshMeucci.scale.set(0.004, -0.015, 0);
    renderTargetSceneMeucci.add(textMeshMeucci);

    const textMeshNick = new Mesh(textGeometryNick, textMaterial);
    textMeshNick.position.set(-0.965, -0.6, 0);
    textMeshNick.rotation.set(Math.PI, -0.5, 0);
    textMeshNick.scale.set(0.003, -0.015, 0);
    renderTargetSceneNick.add(textMeshNick);

    const boxGeometry = new TorusKnotGeometry(9, 3, 768, 3, 4, 3);
    boxMaterialMeucci = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: {value: 0},
        uTexture: {value: renderTargetMeucci.texture},
      }
    })
    boxMaterialNick = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: {value: 0},
        uTexture: {value: renderTargetNick.texture},
      }
    })

    boxMeshMeucci = new Mesh(boxGeometry, boxMaterialMeucci);
    boxMeshMeucci.scale.set(0.1, 0.1, 0.1);
    boxMeshMeucci.rotation.set(-(Math.PI / 2), 0, 0);
    boxMeshMeucci.position.set(0, -40, 0);

    scene.add(boxMeshMeucci);

    const boxMeshNick = new Mesh(boxGeometry, boxMaterialNick);
    boxMeshNick.scale.set(0.1, 0.1, 0.1);
    boxMeshNick.rotation.set(-(Math.PI / 2), 0, 0);
    boxMeshNick.position.set(0, -20, 0);

    scene.add(boxMeshNick);

    renderer.setRenderTarget(renderTargetMeucci);
    renderer.render(renderTargetSceneMeucci, renderTargetCameraMeucci);
    renderer.setRenderTarget(null);

    renderer.setRenderTarget(renderTargetNick);
    renderer.render(renderTargetSceneNick, renderTargetCameraNick);
    renderer.setRenderTarget(null);

  }

  function renderHole(time: number) {
    let i = 0;

    for (let x = 0; x < rowCount; x++) {

      const a = x / rowCount * Math.PI * 2;
      const X = Math.cos(a) / 2;
      const Z = Math.sin(a) / 2;
      const t = (time) % 1;

      for (let y = 0; y < layerCount; y++) {

        const shift = y * Math.abs(Math.sin(x / 1.3)) +
            Math.sin(x / 1.3) +
            Math.cos(x / 1.7) - layerCount;

        for (let z = 0; z < columnCount; z++) {

          const t1 = Math.max(0, (3 - z) + time % 1 - shift);
          const Y = y - Math.pow(t1, 5);

          dummy.position.set(X * (z + 4 - t), Y, Z * (z + 4 - t));
          dummy.rotation.y = -a;
          dummy.scale.set(dummyScale.x, dummyScale.y, dummyScale.z);
          dummy.updateMatrix();

          mesh.setMatrixAt(i++, dummy.matrix);
        }
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.rotation.y = time / 10;
  }


})
</script>
<template>
  <v-container class="pa-0" fluid>
    <div ref="appContainer"></div>
  </v-container>
</template>
<style scoped>
canvas {
  width: 100vw !important;
  height: 100vh !important;
  display: block;
  position: absolute !important;
  top: 0;
  left: 0;
}
</style>
