/* ═══════════════════════════════════════════
   WEBGL LIGHT RAYS SHADER — ReactBits style
   Procedural God Rays with aspect-ratio awareness,
   pulsating oscillators, and inertia mouse lerp.
   - lightSpread = 0.7
   - raysSpeed = 1.2
   - mouseInfluence = 0.5 (applied in shader)
   - pulsating = true
   ═══════════════════════════════════════════ */
(function(){
  const cv = document.getElementById('canvas');
  if(!cv) return;
  const gl = cv.getContext('webgl')||cv.getContext('experimental-webgl');
  if(!gl){cv.remove();return;}

  const VS = `
attribute vec2 p;
void main(){
  gl_Position=vec4(p,0,1);
}`;

  const FS = `
precision highp float;
uniform float T;
uniform vec2 R;
uniform vec3 Lo, Hi;
uniform vec2 uMouse;

float getRays(vec2 uv, float t) {
  // Core light source coordinate (slightly above center-top)
  vec2 lightPos = vec2(0.5, 1.35);
  // Shift halfway toward mouse position (mouseInfluence = 0.5)
  lightPos = mix(lightPos, uMouse, 0.5);

  vec2 delta = uv - lightPos;
  float dist = length(delta);
  float angle = atan(delta.y, delta.x);

  // Multi-frequency wave synthesis (Speed = 1.2)
  float speed = t * 1.2;
  float beam = 0.0;
  beam += sin(angle * 7.0 + speed * 1.0) * 0.35;
  beam += sin(angle * 15.3 - speed * 1.3) * 0.25;
  beam += sin(angle * 28.6 + speed * 0.7) * 0.20;
  beam += sin(angle * 47.1 - speed * 1.9) * 0.12;
  beam += sin(angle * 73.8 + speed * 0.9) * 0.08;

  // Map to [0,1] range
  beam = beam * 0.5 + 0.5;

  // Light Spread (0.7) controls width/sharpness
  beam = smoothstep(1.0 - 0.7, 1.0, beam);

  // Pulsating animation (oscillator)
  float pulse = 1.0 + 0.15 * sin(t * 2.2);
  beam *= pulse;

  // Attenuation: fade rays as distance from origin increases
  float fade = 1.0 - smoothstep(0.1, 1.5, dist);
  beam *= fade;

  return clamp(beam, 0.0, 1.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / R;
  float ar = R.x / R.y;
  vec2 st = vec2(uv.x * ar, uv.y);
  vec2 m = vec2(uMouse.x * ar, uMouse.y);

  float ray = getRays(st, T);

  // Blend background Lo color with ray intensity using Hi glow
  vec3 color = mix(Lo, Hi, ray * 0.7);

  gl_FragColor = vec4(color, 1.0);
}`;

  function sh(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);return s;}
  const prog=gl.createProgram();
  gl.attachShader(prog,sh(gl.VERTEX_SHADER,VS));
  gl.attachShader(prog,sh(gl.FRAGMENT_SHADER,FS));
  gl.linkProgram(prog);gl.useProgram(prog);

  const buf=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,buf);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);

  const ap=gl.getAttribLocation(prog,'p');
  gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,2,gl.FLOAT,false,0,0);

  const uT=gl.getUniformLocation(prog,'T'),
        uR=gl.getUniformLocation(prog,'R'),
        uLo=gl.getUniformLocation(prog,'Lo'),
        uHi=gl.getUniformLocation(prog,'Hi'),
        uMouse=gl.getUniformLocation(prog,'uMouse');

  const html=document.documentElement;
  let off=performance.now(),paused=false;

  // Mouse positions with default shining from above center
  let targetMouse = { x: 0.5, y: 1.35 };
  let currentMouse = { x: 0.5, y: 1.35 };

  window.addEventListener('mousemove', (e) => {
    targetMouse.x = e.clientX / window.innerWidth;
    targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
  });

  // Track touches as well for responsive mobile interactions
  window.addEventListener('touchmove', (e) => {
    if(e.touches.length > 0) {
      targetMouse.x = e.touches[0].clientX / window.innerWidth;
      targetMouse.y = 1.0 - (e.touches[0].clientY / window.innerHeight);
    }
  }, { passive: true });

  function cols(){
    return html.dataset.theme==='light'
      ?{lo:[.96,.96,.97],hi:[.84,.86,.92]} // Polished light theme silver/blue rays
      :{lo:[.024,.024,.038],hi:[.085,.095,.175]};
  }

  function resize(){
    const d=Math.min(devicePixelRatio||1,1.5);
    cv.width=cv.clientWidth*d;cv.height=cv.clientHeight*d;
    gl.viewport(0,0,cv.width,cv.height);
  }

  function frame(now){
    if(!paused){
      const {lo,hi}=cols();
      // Smoothly interpolate current mouse to target mouse position (lerp inertia)
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.045;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.045;

      gl.uniform1f(uT,(now-off)*.001);
      gl.uniform2f(uR,cv.width,cv.height);
      gl.uniform3fv(uLo,lo);gl.uniform3fv(uHi,hi);
      gl.uniform2f(uMouse,currentMouse.x,currentMouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{paused=document.hidden;});
  new IntersectionObserver(([e])=>{paused=!e.isIntersecting;},{threshold:0}).observe(cv);
  resize();requestAnimationFrame(frame);
})();

/* ═══════════════════════════════════════════
   THEME
═══════════════════════════════════════════ */
(function(){
  const html=document.documentElement;
  const KEY='rbp-theme';
  const saved=localStorage.getItem(KEY)||'dark';
  html.dataset.theme=saved;
  const btn=document.getElementById('theme-btn');
  if(btn) btn.textContent=saved==='dark'?'☀️':'🌙';

  window.__setTheme=function(t){
    html.dataset.theme=t;
    localStorage.setItem(KEY,t);
    const b=document.getElementById('theme-btn');
    if(b) b.textContent=t==='dark'?'☀️':'🌙';
  };
  if(btn) btn.addEventListener('click',()=>{
    window.__setTheme(html.dataset.theme==='dark'?'light':'dark');
  });
})();

/* ═══════════════════════════════════════════
   NAV INDICATOR (spring slide)
═══════════════════════════════════════════ */
(function(){
  const pill=document.querySelector('.nav-pill');
  const ind=document.querySelector('.nav-ind');
  const links=document.querySelectorAll('.nav-a');
  if(!pill||!ind||!links.length) return;

  function moveTo(el){
    const pr=pill.getBoundingClientRect(),lr=el.getBoundingClientRect();
    ind.style.cssText+=`;left:${lr.left-pr.left}px;top:${lr.top-pr.top}px;width:${lr.width}px;height:${lr.height}px`;
  }
  // Init without animation
  const active=document.querySelector('.nav-a.on');
  if(active){ind.style.transition='none';moveTo(active);requestAnimationFrame(()=>{ind.style.transition='';})}

  links.forEach(a=>{
    a.addEventListener('mouseenter',()=>moveTo(a));
    a.addEventListener('mouseleave',()=>{const on=document.querySelector('.nav-a.on');if(on)moveTo(on);});
  });
})();

/* ═══════════════════════════════════════════
   SCROLL REVEAL
═══════════════════════════════════════════ */
(function(){
  const obs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');obs.unobserve(e.target);}});
  },{threshold:.08,rootMargin:'0px 0px -50px 0px'});
  document.querySelectorAll('.r').forEach(el=>obs.observe(el));
})();

/* ═══════════════════════════════════════════
   COPY EMAIL
═══════════════════════════════════════════ */
window.copyMail=function(email){
  navigator.clipboard.writeText(email).then(()=>{
    document.querySelectorAll('.copy-btn').forEach(b=>{
      const span=b.querySelector('span');
      b.classList.add('copy-ok');
      if(span){const old=span.textContent;span.textContent='Copied!';setTimeout(()=>{span.textContent=old;b.classList.remove('copy-ok');},2400);}
    });
  });
};

/* ═══════════════════════════════════════════
   PORTRAIT MAGNETIC
═══════════════════════════════════════════ */
(function(){
  const wrap=document.querySelector('.portrait');
  const img=wrap&&wrap.querySelector('img');
  if(!wrap||!img) return;
  wrap.addEventListener('mousemove',e=>{
    const r=wrap.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)/r.width;
    const y=(e.clientY-r.top-r.height/2)/r.height;
    img.style.transform=`translate(${x*10}px,${y*10}px) scale(1.04)`;
  });
  wrap.addEventListener('mouseleave',()=>{img.style.transform='';});
})();

/* Smooth anchor scroll */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}
  });
});

/* ═══════════════════════════════════════════
   CONTACT FORM SUBMISSION HANDLER
   ═══════════════════════════════════════════ */
window.handleContactFormSubmit = function(event) {
  event.preventDefault();
  const name = document.getElementById('contact-name').value;
  const email = document.getElementById('contact-email').value;
  const message = document.getElementById('contact-message').value;
  const subject = encodeURIComponent(`Message from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
  window.location.href = `mailto:kobarne21@gmail.com?subject=${subject}&body=${body}`;
};
