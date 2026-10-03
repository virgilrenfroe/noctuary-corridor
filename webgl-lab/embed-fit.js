import * as THREE from 'three';

const _tmp = new THREE.Box3();
const _size = new THREE.Vector3();
const _dir = new THREE.Vector3();

/**
 * Embed/floating-lab only. Frame the visible subject so an orbit at minDistance
 * keeps the whole bounding sphere inside the tighter frustum axis.
 * Huge planes (water, floors) are ignored. Wall murals are left alone.
 * Pushes the camera out when the subject does not fit; never dollies in.
 */
export function fitEmbedOrbit(camera, controls, root, opts = {}) {
  if (!document.body.classList.contains('embed')) return null;
  if (document.body.classList.contains('wall')) return null;
  const margin = opts.margin ?? 1.48;
  const limit = opts.limit ?? 36;

  root.updateMatrixWorld(true);
  const box = new THREE.Box3();
  root.traverse((obj) => {
    if (!obj.visible || !obj.geometry) return;
    if (!(obj.isMesh || obj.isPoints || obj.isLine || obj.isInstancedMesh)) return;
    if (obj.isInstancedMesh) obj.computeBoundingBox();
    else if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
    const src = obj.isInstancedMesh ? obj.boundingBox : obj.geometry.boundingBox;
    if (!src || src.isEmpty()) return;
    _tmp.copy(src).applyMatrix4(obj.matrixWorld);
    if (_tmp.isEmpty()) return;
    _tmp.getSize(_size);
    if (_size.length() > limit) return;
    box.union(_tmp);
  });
  if (box.isEmpty()) return null;

  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const center = sphere.center.clone();
  const R = Math.max(sphere.radius, 0.04);

  const apply = () => {
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const aspect = Math.max(0.25, camera.aspect || innerWidth / Math.max(1, innerHeight));
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const half = Math.max(0.12, Math.min(vFov, hFov) / 2);
    const Dfit = (R / Math.sin(half)) * margin;
    const pivot = controls ? controls.target : center;
    _dir.subVectors(camera.position, pivot);
    if (_dir.lengthSq() < 1e-8) _dir.set(0, 0.35, 1);
    _dir.normalize();
    const dist = camera.position.distanceTo(center);
    const D = Math.max(dist, Dfit);
    camera.position.copy(center).addScaledVector(_dir, D);
    const nearCap = Math.min(camera.near, Math.max(0.04, Math.min(0.2, (D - R) * 0.1)));
    if (nearCap < camera.near) camera.near = nearCap;
    const farNeed = D + R * 8 + 20;
    if (camera.far < farNeed) camera.far = farNeed;
    camera.updateProjectionMatrix();
    if (controls) {
      controls.target.copy(center);
      controls.minDistance = Dfit;
      controls.maxDistance = Math.max(controls.maxDistance || 0, Dfit * 8, D * 2);
      controls.update();
    } else {
      camera.lookAt(center);
    }
  };

  apply();
  addEventListener('resize', () => requestAnimationFrame(apply));
  return { radius: R, center: center.toArray() };
}
