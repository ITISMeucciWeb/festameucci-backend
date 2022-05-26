<script setup lang="ts">

import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  Object3D,
  BoxBufferGeometry,
  MeshBasicMaterial,
  InstancedMesh,
  DynamicDrawUsage,
  CanvasTexture,
  Vector3,
  MathUtils,
  Mesh,
  TextureLoader,
  RawShaderMaterial,
  DoubleSide,
  BoxGeometry,
  ShaderMaterial,
  WebGLRenderTarget, Color, TorusKnotGeometry,
} from "three";
import OrbitronBlack from "../typefaces/Orbitron_Black.json?url";
import {onMounted, ref} from "vue";
import gsap from "gsap";
import {Font, FontLoader} from "three/examples/jsm/loaders/FontLoader";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry";
import {fragmentShader, vertexShader} from "@/shaders/shaders";
const appContainer = ref<HTMLDivElement | null>(null);




onMounted(async () => {
  let boxMaterialMeucci: ShaderMaterial | null = null;
  const rowCount = 36;
  const columnCount = 30;
  const layerCount = 3;

  const dummy = new Object3D();

  const camera = new PerspectiveCamera(60, innerWidth / innerHeight, 1, 1000);
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

  addEventListener('resize', onWindowResize, false);

  await renderTargetsPrepare();
  animate(0);

  function onWindowResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  }

  function animate(time: number) {
    render(time / 1000);
    requestAnimationFrame(animate);
  }

  setTimeout(() => {
    const timeLine = gsap.timeline();

    timeLine
        .to(camera.position, {
          duration: 2,
          x: 0,
          y: 15,
          ease: 'power2.inOut'
        }, "out")
        .to(camera.rotation, {
          duration: 2,
          x: -(Math.PI/2),
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
          y: -35,
          ease: 'power2.inOut'
        }, "=-1")
  }, 2000);

  async function renderTargetsPrepare(){
    const loader = new FontLoader();
    const font = await new Promise((resolve) => {
      loader.load(OrbitronBlack, resolve);
    }) as Font;


    const renderTargetMeucci = new WebGLRenderTarget(innerWidth, innerHeight);
    const renderTargetCameraMeucci = new PerspectiveCamera(45, 1, 0.1, 1000);
    renderTargetCameraMeucci.position.z = 2.5;

    const renderTargetSceneMeucci = new Scene();
    renderTargetSceneMeucci.background = new Color(0x00000000);

    const textGeometryMeucci = new TextGeometry('ITIS MEUCCI', {
      font: font,
      size: 80,
    });
    const textMaterialMeucci = new MeshBasicMaterial({color: 0xfffffff, side: DoubleSide, transparent: true});

    const textMeshMeucci = new Mesh(textGeometryMeucci, textMaterialMeucci);
    textMeshMeucci.position.set(-0.965, -0.6, 0);
    textMeshMeucci.rotation.set(Math.PI, -0.5, 0);
    textMeshMeucci.scale.set(0.004, -0.015, 0);
    renderTargetSceneMeucci.add(textMeshMeucci);

    const boxGeometry = new TorusKnotGeometry(9, 3, 768, 3, 4, 3);
    boxMaterialMeucci = new ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uTexture: { value: renderTargetMeucci.texture },
      }
    })

    const boxMeshMeucci = new Mesh(boxGeometry, boxMaterialMeucci);
    boxMeshMeucci.scale.set(0.1, 0.1, 0.1);
    boxMeshMeucci.rotation.set(-(Math.PI / 2), 0, 0);
    boxMeshMeucci.position.set(0, -40, 0);

    scene.add(boxMeshMeucci);

    renderer.setRenderTarget(renderTargetMeucci);
    renderer.render(renderTargetSceneMeucci, renderTargetCameraMeucci);
    renderer.setRenderTarget(null);

  }
  function render(time: number) {
    boxMaterialMeucci!.uniforms.uTime.value = time;
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
          dummy.scale.set(0.5, 1, 0.5)
          dummy.updateMatrix();

          mesh.setMatrixAt(i++, dummy.matrix);
        }
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    scene.rotation.y = time / 10;
    renderer.render(scene, camera);
  }




})
</script>
<template>
  <v-container class="pa-0" fluid>
    <div ref="appContainer"></div>
  </v-container>
</template>
