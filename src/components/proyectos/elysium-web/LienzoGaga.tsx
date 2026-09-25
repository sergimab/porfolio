"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { AJUSTE_BASE, MAXP, POR_POLIGONO, construirForma, type Ajuste } from "./formaGaga";

// EL SÍMBOLO EN VOLUMEN.
//
// La silueta —polígonos exactos, ver formaGaga— se convierte en cuerpo dentro de
// la tarjeta gráfica, en tres pasadas:
//
//  1. SEMILLA + JFA. Un campo de distancias a la silueta dilatada un radio
//     («fusión»). El JFA es el salto de banderas: en vez de recorrer todos los
//     píxeles contra todos, cada paso mira ocho vecinos a distancia decreciente
//     y se queda con el más cercano, así que el campo sale en log(N) pasadas.
//  2. ALTURA. La forma «cerrada» —rincones y cruces rellenos como un líquido,
//     los picos intactos— y su profundidad, convertidas en altura con perfil de
//     gota.
//  3. NORMALES, deducidas de la altura.
//
// Un plano muy subdividido se desplaza con esa altura, se duplica en espejo para
// cerrar el volumen por detrás, y se pinta con un material físico —cromo
// iridiscente o cristal con dispersión— dentro de un plató de estudio.
//
// SUSTITUYE AL MOTOR ANTERIOR (LienzoMetal con `figura`). Aquel levantaba
// cúpulas a lo largo del trazo y las cortaba por un umbral, y ese umbral se
// medía en píxeles: la figura cambiaba con el tamaño del lienzo y las puntas
// cerraban redondeadas. LienzoMetal sigue en pie para lo que sí es suyo, el
// lienzo donde se dibuja a mano y el marco líquido.

export type Material = "cromo" | "cristal";

export default function LienzoGaga({
  // Un valor por era, de 0 a 1, en el orden de ERAS.
  valores,
  material = "cromo",
  // Los tres mandos de la forma. Los de fábrica son los que dejó afinados el
  // generador aparte; se pasan solo si una pantalla concreta pide otra cosa.
  ajuste,
  // Fusión: el radio del cierre que redondea rincones y cruces.
  fusion = 0.036,
  // Ondulación del contorno. Muy poca, o la figura pierde el filo.
  organico = 0.01,
  // Suavizado de la silueta y del volumen.
  suavidad = 3.5,
  // Cuánto levanta la pieza.
  volumen = 1.2,
  // El giro del plató. Decide qué reflejos caen en la pieza, así que es lo que
  // más cambia el color de un metal.
  giroLuz = -180,
  // Con `animar` el contorno respira; sin él, la figura se queda quieta.
  animar = true,
  // Si se puede girar la pieza con el ratón.
  girable = false,
  className,
}: {
  valores: readonly number[];
  material?: Material;
  ajuste?: Partial<Ajuste>;
  fusion?: number;
  organico?: number;
  suavidad?: number;
  volumen?: number;
  giroLuz?: number;
  animar?: boolean;
  girable?: boolean;
  className?: string;
}) {
  const lienzo = useRef<HTMLCanvasElement>(null);
  // Lo que cambia entre cuadros viaja por una caja, no por el efecto: montar
  // toda la cadena de render otra vez porque ha cambiado un número sería tirar
  // las texturas y el plató en cada pulsación.
  const vivo = useRef({ valores, material, ajuste, fusion, organico, suavidad, volumen, giroLuz, animar });
  vivo.current = { valores, material, ajuste, fusion, organico, suavidad, volumen, giroLuz, animar };

  useEffect(() => {
    const canvas = lienzo.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);

    // EL PLATÓ. De salida, uno por código —cúpula clara con horizonte gris,
    // franjas de luz y paneles oscuros—, que es lo que se ve mientras llega el
    // de verdad. Lo que refleja el cromo son esas bandas.
    const platoDeCodigo = () => {
      const env = new THREE.Scene();
      env.add(new THREE.Mesh(new THREE.SphereGeometry(20, 64, 32), new THREE.ShaderMaterial({
        side: THREE.BackSide,
        vertexShader: "varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader: `varying vec3 v;void main(){
          vec3 top=vec3(1.05,1.08,1.12), mid=vec3(.62,.68,.72), low=vec3(.16,.18,.2);
          vec3 c=v.y>0.?mix(mid,top,smoothstep(0.,.6,v.y)):mix(mid,low,smoothstep(0.,.25,-v.y));
          c*=1.-.55*exp(-pow(v.y*14.,2.));
          gl_FragColor=vec4(c,1.);}`,
      })));
      const panel = (w: number, h: number, color: number, k: number, pos: [number, number, number]) => {
        const m = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide })
        );
        m.position.set(...pos);
        m.lookAt(0, 0, 0);
        env.add(m);
      };
      panel(14, 5, 0xffffff, 3.2, [-6, 9, 5]);      // softbox arriba a la izquierda
      panel(1.4, 16, 0xffffff, 4, [11, 0, 4]);      // tira vertical derecha
      panel(1, 14, 0xe8f2ff, 2.5, [-12, -1, -2]);   // tira izquierda
      panel(18, 1.1, 0xffffff, 2.2, [0, 3, -14]);   // franja al fondo
      panel(10, 7, 0x000000, 1, [7, -4, 9]);        // panel negro
      panel(8, 12, 0x05070a, 1, [-10, 2, 10]);
      return env;
    };
    const deCodigo = pmrem.fromScene(platoDeCodigo(), 0.015).texture;
    scene.environment = deCodigo;
    scene.environmentRotation.y = (vivo.current.giroLuz * Math.PI) / 180;

    // Y encima, el estudio de verdad, servido desde el propio sitio. Si no
    // llega, se queda el de código y no se nota más que en el reflejo.
    let hdr: THREE.Texture | null = null;
    new RGBELoader().load(
      "/elysium/estudio.hdr",
      (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        hdr = pmrem.fromEquirectangular(tex).texture;
        tex.dispose();
        scene.environment = hdr;
      },
      undefined,
      () => {}
    );

    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0, 4.6);
    let controls: OrbitControls | null = null;
    if (vivo.current && girable) {
      controls = new OrbitControls(camera, canvas);
      controls.enableDamping = true;
      controls.enablePan = false;
      controls.minDistance = 2.5;
      controls.maxDistance = 9;
    }

    // ── Las pasadas 2D ──
    const N = 1024; // resolución del mapa de alturas
    const nearest = { minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false };
    const jfa = [new THREE.WebGLRenderTarget(N, N, nearest), new THREE.WebGLRenderTarget(N, N, nearest)];
    const lineal = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
    const medio = { ...lineal, type: THREE.HalfFloatType };
    const sdfRT = new THREE.WebGLRenderTarget(N, N, medio);
    const borronRT = new THREE.WebGLRenderTarget(N, N, medio);
    const crudoRT = new THREE.WebGLRenderTarget(N, N, medio);
    const alturaRT = new THREE.WebGLRenderTarget(N, N, medio);
    const normalRT = new THREE.WebGLRenderTarget(N, N, lineal);

    const U = {
      uN: { value: N },
      uCenter: { value: new THREE.Vector2() },
      uSize: { value: 2 },
      uTime: { value: 0 },
      uWarp: { value: 0 },
      uR: { value: 0.025 },
      uBevel: { value: 0.05 },
      uPolyCount: { value: 0 },
      uPoly: { value: new Float32Array(MAXP * POR_POLIGONO) },
      uTex: { value: null as THREE.Texture | null },
      uStep: { value: 1 },
      uVol: { value: 1 },
      uSoft: { value: 0 },
      uDir: { value: new THREE.Vector2(1, 0) },
    };
    const COMUN = `
#define MAXP ${MAXP}
uniform float uN, uSize, uTime, uWarp, uR, uBevel, uStep, uVol, uSoft; uniform vec2 uCenter, uDir;
uniform int uPolyCount; uniform vec4 uPoly[MAXP*3]; uniform sampler2D uTex;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
void edge(vec2 p,vec2 a,vec2 b,inout float d,inout float s){
  vec2 e=b-a, w=p-a; if(dot(e,e)<1e-12) return;
  vec2 q=w-e*clamp(dot(w,e)/dot(e,e),0.,1.); d=min(d,dot(q,q));
  bvec3 c=bvec3(p.y>=a.y,p.y<b.y,e.x*w.y>e.y*w.x);
  if(all(c)||all(not(c))) s*=-1.;
}
float poly6(vec2 p,vec4 a,vec4 b,vec4 c){
  float d=dot(p-a.xy,p-a.xy), s=1.;
  edge(p,a.xy,c.zw,d,s); edge(p,a.zw,a.xy,d,s); edge(p,b.xy,a.zw,d,s);
  edge(p,b.zw,b.xy,d,s); edge(p,c.xy,b.zw,d,s); edge(p,c.zw,c.xy,d,s);
  return s*sqrt(d);
}
float map(vec2 p){
  p+=uWarp*(vec2(noise(p*1.5+uTime*.15),noise(p*1.5+19.-uTime*.15))-.5);
  float d=1e3;
  for(int i=0;i<MAXP;i++){ if(i>=uPolyCount)break; d=min(d,poly6(p,uPoly[i*3],uPoly[i*3+1],uPoly[i*3+2])); }
  return d;
}
vec4 enc(vec2 q){ vec2 v=clamp((q+1024.)*8.,0.,65000.), hi=floor(v/256.), lo=v-hi*256.; return vec4(hi.x,lo.x,hi.y,lo.y)/255.; }
vec2 dec(vec4 t){ return vec2(t.r*65280.+t.g*255.,t.b*65280.+t.a*255.)/8.-1024.; }
float pj(){ return uSize/uN; }
vec2 world(vec2 fc){ return uCenter+(fc-.5*uN)*pj(); }
`;
    const pasada = (fs: string) =>
      new THREE.ShaderMaterial({
        uniforms: U,
        vertexShader: "void main(){gl_Position=vec4(position.xy,0.,1.);}",
        fragmentShader: COMUN + fs,
        depthTest: false,
        depthWrite: false,
      });
    const mSemilla = pasada(`void main(){
      vec2 p=world(gl_FragCoord.xy); float d=map(p);
      if(d<=uR){ gl_FragColor=vec4(1); return; }
      vec2 g=normalize(vec2(map(p+vec2(pj(),0))-d,map(p+vec2(0,pj()))-d)+1e-9);
      gl_FragColor=enc((p-g*(d-uR)-uCenter)/pj()+.5*uN);
    }`);
    const mJfa = pasada(`void main(){
      vec2 fc=gl_FragCoord.xy, best=vec2(0); float bd=1e20;
      for(int j=-1;j<=1;j++) for(int i=-1;i<=1;i++){
        vec2 c=fc+vec2(i,j)*uStep;
        if(c.x<0.||c.y<0.||c.x>uN||c.y>uN) continue;
        vec2 q=dec(texture2D(uTex,c/uN)); if(q.x>7000.) continue;
        float dd=dot(q-fc,q-fc); if(dd<bd){ bd=dd; best=q; } }
      gl_FragColor=bd<1e19?enc(best):vec4(1);
    }`);
    const mSdf = pasada(`void main(){
      vec2 fc=gl_FragCoord.xy; float d=map(world(fc));
      vec2 q=dec(texture2D(uTex,fc/uN));
      float c=d>uR?d:uR-(q.x>7000.?1e3:length(q-fc)*pj());
      gl_FragColor=vec4(clamp(c,-.5,.5),0.,0.,1.);
    }`);
    const mBorron = pasada(`uniform float uSigma; void main(){
      vec2 uv=gl_FragCoord.xy/uN; vec4 c0=texture2D(uTex,uv);
      if(uSigma<.3){ gl_FragColor=c0; return; }
      float acc=0., wsum=0.;
      for(int i=-24;i<=24;i++){ float x=float(i); if(abs(x)>3.*uSigma) continue;
        float w=exp(-x*x/(2.*uSigma*uSigma)); acc+=w*texture2D(uTex,uv+uDir*x/uN).r; wsum+=w; }
      gl_FragColor=vec4(acc/wsum,c0.g,0.,1.);
    }`);
    mBorron.uniforms = { ...U, uSigma: { value: 0 } };
    const mAltura = pasada(`void main(){
      float c=texture2D(uTex,gl_FragCoord.xy/uN).r, depth=max(-c,0.);
      float h=depth<uBevel?sqrt(depth*(2.*uBevel-depth)):uBevel+.35*(depth-uBevel);
      gl_FragColor=vec4(h*2./uSize*uVol, 1.-smoothstep(-pj(),pj(),c), 0., 1.);
    }`);
    // Altura final = la menor entre la suavizada y la original: la suavizada
    // redondea las crestas de dentro, la original mantiene el borde que baja a
    // cero justo en la silueta.
    const mUnir = pasada(`uniform sampler2D uRaw; void main(){
      vec2 uv=gl_FragCoord.xy/uN; vec4 r=texture2D(uRaw,uv);
      gl_FragColor=vec4(min(texture2D(uTex,uv).r,r.r),r.g,0.,1.);
    }`);
    mUnir.uniforms = { ...U, uRaw: { value: crudoRT.texture } };
    const mNormal = pasada(`void main(){
      vec2 uv=gl_FragCoord.xy/uN; float e=1./uN, k=uN/4.;
      float hx=texture2D(uTex,uv+vec2(e,0)).r-texture2D(uTex,uv-vec2(e,0)).r;
      float hy=texture2D(uTex,uv+vec2(0,e)).r-texture2D(uTex,uv-vec2(0,e)).r;
      gl_FragColor=vec4(normalize(vec3(-hx*k,-hy*k,1.))*.5+.5,1.);
    }`);

    const escenaPlano = new THREE.Scene();
    const camPlano = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const plano = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mSemilla);
    plano.frustumCulled = false;
    escenaPlano.add(plano);
    const correr = (mat: THREE.ShaderMaterial, destino: THREE.WebGLRenderTarget | null, tex: THREE.Texture | null) => {
      plano.material = mat;
      U.uTex.value = tex;
      renderer.setRenderTarget(destino);
      renderer.render(escenaPlano, camPlano);
    };

    // ── La pieza ──
    const MATERIALES = {
      cromo: new THREE.MeshPhysicalMaterial({
        color: 0xe4ecf2, metalness: 1, roughness: 0.06,
        iridescence: 0.55, iridescenceIOR: 1.35, iridescenceThicknessRange: [220, 420],
        clearcoat: 1, clearcoatRoughness: 0.04,
      }),
      cristal: new THREE.MeshPhysicalMaterial({
        color: 0xffffff, metalness: 0, roughness: 0.02, transmission: 1, thickness: 0.35,
        ior: 2.0, dispersion: 8, attenuationColor: new THREE.Color(0x9fb6c6), attenuationDistance: 0.45,
        specularIntensity: 1, iridescence: 0.5, iridescenceIOR: 1.3,
        clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 3.5,
      }),
    };
    for (const m of Object.values(MATERIALES)) {
      Object.assign(m, {
        displacementMap: alturaRT.texture, displacementScale: 1,
        normalMap: normalRT.texture, alphaMap: alturaRT.texture,
        alphaTest: 0.5, side: THREE.FrontSide, transparent: false,
      });
    }
    const geo = new THREE.PlaneGeometry(2, 2, 768, 768);
    const delante = new THREE.Mesh(geo, MATERIALES.cromo);
    const detras = new THREE.Mesh(geo, MATERIALES.cromo);
    detras.scale.z = -1; // la mitad de atrás en espejo, y el volumen cierra
    const pieza = new THREE.Group();
    pieza.add(delante, detras);
    scene.add(pieza);

    // El encuadre persigue a la figura en vez de saltar: cuando cambia una
    // selección la caja crece o mengua, y sin amortiguar el símbolo daría un
    // tirón en cada clic.
    const vista = { size: 2, cx: 0, cy: 0 };
    // ARRANCA EN SU SITIO, NO EN CERO. Lo que sigue amortigua hacia el valor
    // nuevo, que es lo que hace que un cambio de selección no dé un tirón; pero
    // empezando en cero ese amortiguado se convierte en una entrada —la figura
    // creciendo desde nada— y eso no lo pide nadie. Montada, la pieza ya está
    // hecha; a partir de ahí, cada cambio se desliza.
    const mostrado = Float32Array.from(vivo.current.valores);
    const t0 = performance.now();
    const BLANCO = new THREE.Color(0xffffff);
    let animId = 0;

    // EL TAMAÑO SE MIDE EN EL PADRE, NUNCA EN EL PROPIO LIENZO. `setSize` le
    // escribe al canvas su ancho y su alto en el estilo, así que medirlo a él
    // sería medir lo que uno mismo acaba de escribir: un lienzo sin tamaño en el
    // CSS arranca en 300×150, se mide, se le escribe 300×150, se vuelve a medir…
    // y en unos cuadros llega a los dieciséis millones de píxeles.
    const medir = () => {
      const caja = canvas.parentElement;
      const r = caja ? caja.getBoundingClientRect() : canvas.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      const px = renderer.getPixelRatio();
      if (canvas.width !== Math.round(r.width * px) || canvas.height !== Math.round(r.height * px)) {
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
      }
      return true;
    };

    const cuadro = (ahora: number) => {
      animId = requestAnimationFrame(cuadro);
      if (!medir()) return;
      const v = vivo.current;
      for (let i = 0; i < mostrado.length; i++) {
        mostrado[i] += ((v.valores[i] ?? 0) - mostrado[i]) * 0.12;
      }
      const P: Ajuste = { ...AJUSTE_BASE, ...v.ajuste };
      const forma = construirForma(mostrado, P);
      pieza.visible = !!forma;
      if (forma) {
        const [[x0, y0], [x1, y1]] = forma.caja;
        vista.size += (Math.max(x1 - x0, y1 - y0) * 1.1 + 0.1 - vista.size) * 0.15;
        vista.cx += ((x0 + x1) / 2 - vista.cx) * 0.15;
        vista.cy += ((y0 + y1) / 2 - vista.cy) * 0.15;
        U.uCenter.value.set(vista.cx, vista.cy);
        U.uSize.value = vista.size;
        if (v.animar) U.uTime.value = (ahora - t0) / 1000;
        U.uWarp.value = v.organico;
        U.uR.value = v.fusion;
        U.uBevel.value = 0.06 * P.grosor;
        U.uSoft.value = v.suavidad;
        U.uVol.value = v.volumen;
        U.uPolyCount.value = forma.cuantos;
        (U.uPoly.value as Float32Array).set(forma.poligonos);
        scene.environmentRotation.y = (v.giroLuz * Math.PI) / 180;

        correr(mSemilla, jfa[0], null);
        let src = 0;
        for (let paso = N / 2; paso >= 1; paso >>= 1) {
          U.uStep.value = paso;
          correr(mJfa, jfa[1 - src], jfa[src].texture);
          src = 1 - src;
        }
        correr(mSdf, sdfRT, jfa[src].texture);
        const borrar2 = (de: THREE.WebGLRenderTarget, a: THREE.WebGLRenderTarget, sigma: number) => {
          mBorron.uniforms.uSigma.value = sigma;
          U.uDir.value.set(1, 0);
          correr(mBorron, borronRT, de.texture);
          U.uDir.value.set(0, 1);
          correr(mBorron, a, borronRT.texture);
        };
        borrar2(sdfRT, sdfRT, U.uSoft.value);                 // la silueta
        correr(mAltura, crudoRT, sdfRT.texture);
        borrar2(crudoRT, sdfRT, 4 + 1.5 * U.uSoft.value);     // el volumen
        correr(mUnir, alturaRT, sdfRT.texture);
        correr(mNormal, normalRT, alturaRT.texture);

        const mat = MATERIALES[v.material === "cristal" ? "cristal" : "cromo"];
        delante.material = detras.material = mat;
        // El cristal necesita algo detrás que refractar; el cromo sale con el
        // fondo transparente, que es lo que deja verse el universo.
        scene.background = mat === MATERIALES.cristal ? BLANCO : null;
      }
      renderer.setRenderTarget(null);
      controls?.update();
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(cuadro);

    return () => {
      cancelAnimationFrame(animId);
      controls?.dispose();
      for (const rt of [...jfa, sdfRT, borronRT, crudoRT, alturaRT, normalRT]) rt.dispose();
      for (const m of Object.values(MATERIALES)) m.dispose();
      for (const m of [mSemilla, mJfa, mSdf, mBorron, mAltura, mUnir, mNormal]) m.dispose();
      geo.dispose();
      plano.geometry.dispose();
      deCodigo.dispose();
      hdr?.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
    // El montaje es de una vez: lo que cambia después viaja por `vivo`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [girable]);

  // EL TAMAÑO EN EL ESTILO VIENE DE SERIE. `setSize` se llama sin tocar el
  // estilo —el lienzo tiene que seguir a su caja, no al revés—, y un canvas sin
  // tamaño en el CSS se dibuja tan grande como su resolución: en una pantalla
  // del doble de densidad, el doble de su caja. Poniéndolo aquí, quien lo usa no
  // tiene que acordarse.
  return (
    <canvas
      ref={lienzo}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
      aria-hidden="true"
    />
  );
}
