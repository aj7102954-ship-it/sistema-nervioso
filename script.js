/* ===== 1. ESQUEMA INTERACTIVO: texto de cada tarjeta ===== */
const INFO={
sn:"<b>Sistema nervioso:</b> recibe estímulos, procesa información y coordina respuestas.",
snc:"<b>SNC:</b> centro de control. Incluye encéfalo y médula espinal; integra la información y da órdenes.",
enc:"<b>Encéfalo:</b> cerebro, cerebelo y tronco encefálico. Piensa, recuerda, siente y coordina el movimiento.",
med:"<b>Médula espinal:</b> cordón dentro de la columna vertebral. Conduce impulsos y controla reflejos.",
snp:"<b>SNP:</b> nervios y ganglios que comunican el SNC con músculos, órganos y receptores.",
ner:"<b>Nervios:</b> haces de axones que llevan información sensorial al SNC y órdenes motoras hacia el cuerpo. Los <i>ganglios</i> son grupos de cuerpos neuronales fuera del SNC.",
som:"<b>Somático:</b> controla acciones voluntarias (músculos esqueléticos) y envía información sensorial al SNC.",
aut:"<b>Autónomo:</b> regula funciones involuntarias (corazón, digestión). <i>Simpático:</i> prepara para la acción. <i>Parasimpático:</i> favorece el reposo."};
document.querySelectorAll(".node").forEach(b=>b.onclick=()=>{
  document.querySelectorAll(".node").forEach(n=>n.classList.remove("on"));
  b.classList.add("on");
  document.getElementById("info").innerHTML=INFO[b.dataset.k];
});

/* ===== 2. VIDEOJUEGO ===== */
const cv=document.getElementById("cv"),ctx=cv.getContext("2d");
const $=id=>document.getElementById(id);
// Cada nivel: lista de rondas. z = zonas [nombre, ¿es correcta?]
const LEVELS=[
 {name:"ENCUENTRA EL SNC",rounds:[
  {t:"🧠 Lleva la señal al ENCÉFALO",z:[["Encéfalo",1],["Nervio",0],["Ganglio",0]]},
  {t:"🦴 Ahora a la MÉDULA ESPINAL",z:[["Médula",1],["Nervio",0],["Ganglio",0]]},
  {t:"Elige una estructura del SNC",z:[["Cerebelo",1],["Nervio ciático",0],["Ganglio",0]]}]},
 {name:"SNC VS SNP",rounds:[
  {t:"🤔 Pensar y decidir (procesar)",z:[["SNC",1],["SNP",0]]},
  {t:"💪 Nervio que llega al brazo",z:[["SNC",0],["SNP",1]]},
  {t:"🦴 Médula espinal",z:[["SNC",1],["SNP",0]]},
  {t:"🔵 Ganglios nerviosos",z:[["SNC",0],["SNP",1]]}]},
 {name:"VOLUNTARIO O INVOLUNTARIO",rounds:[
  {t:"👋 Levantar la mano",z:[["Somático",1],["Autónomo",0]]},
  {t:"❤️ Latido del corazón",z:[["Somático",0],["Autónomo",1]]},
  {t:"⚽ Patear un balón",z:[["Somático",1],["Autónomo",0]]},
  {t:"🍽️ Digestión",z:[["Somático",0],["Autónomo",1]]}]}
];
const OBS=["⚠️","🦠","💥"]; // ruta incorrecta, interferencia, señal perdida
let G={lv:0,round:0,lives:3,score:0,time:60,run:false,p:{x:40,y:200,r:12},zones:[],obs:[],parts:[],inv:0};
const keys={};
addEventListener("keydown",e=>{keys[e.key.toLowerCase()]=1;if(G.run&&e.key.startsWith("Arrow"))e.preventDefault()});
addEventListener("keyup",e=>keys[e.key.toLowerCase()]=0);
// Botones táctiles
document.querySelectorAll(".pad button").forEach(b=>{
  const k={up:"arrowup",down:"arrowdown",left:"arrowleft",right:"arrowright"}[b.dataset.d];
  b.onpointerdown=e=>{e.preventDefault();keys[k]=1};
  ["pointerup","pointerleave","pointercancel"].forEach(ev=>b.addEventListener(ev,()=>keys[k]=0));
});
// Sonido sencillo sin archivos
let ac;
function beep(f,d=.12){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.type="square";g.gain.value=.05;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+d)}catch(e){}}
function overlay(html,btns){const o=$("overlay");o.className="";o.innerHTML=html;btns.forEach(([txt,fn])=>{const b=document.createElement("button");b.textContent=txt;b.onclick=fn;o.appendChild(b)})}
function hideOv(){$("overlay").className="hide"}
function start(){overlay("<h2>⚡ MISIÓN: SALVA EL SISTEMA NERVIOSO</h2><p>Señales incorrectas atacan el sistema. Lleva la señal a la zona correcta y esquiva ⚠️ 🦠 💥.<br>Tocar una zona incorrecta o un obstáculo te quita una vida.</p>",[["▶ JUGAR",()=>loadLevel(0)]])}
function loadLevel(i){G.lv=i;G.round=0;G.lives=3;G.time=60;if(i==0)G.score=0;
  const n=3+i;G.obs=[];
  for(let k=0;k<n;k++)G.obs.push({x:150+Math.random()*280,y:30+Math.random()*340,vx:(Math.random()<.5?-1:1)*(1.2+i*.5),vy:(Math.random()<.5?-1:1)*(1.2+i*.5),e:OBS[k%3]});
  loadRound();hideOv();G.run=true;last=performance.now();requestAnimationFrame(loop)}
function loadRound(){
  const r=LEVELS[G.lv].rounds[G.round],z=[...r.z].sort(()=>Math.random()-.5),h=340/z.length;
  G.zones=z.map((q,i)=>({n:q[0],ok:q[1],x:490,y:30+i*h,w:140,h:h-12}));
  G.p.x=40;G.p.y=200;$("prompt").textContent="Nivel "+(G.lv+1)+" · "+LEVELS[G.lv].name+" — "+r.t;
  $("bar").style.width=(G.round/LEVELS[G.lv].rounds.length*100)+"%";}
function burst(x,y,c){for(let i=0;i<25;i++)G.parts.push({x,y,vx:Math.random()*6-3,vy:Math.random()*6-3,l:30,c})}
function hit(){if(G.inv>0)return;G.lives--;G.inv=60;beep(150,.3);G.p.x=40;G.p.y=200;burst(G.p.x,G.p.y,"#f44");
  if(G.lives<=0)end(false)}
function end(win){G.run=false;
  if(!win)overlay("<h2>💀 ¡La señal se perdió!</h2><p>Inténtalo nuevamente.</p>",[["🔄 JUGAR DE NUEVO",()=>loadLevel(G.lv)]]);
  else if(G.lv<2){G.score+=G.time*5;overlay("<h2>🎉 ¡Excelente!</h2><p>La señal llegó correctamente.<br>Puntos: "+G.score+"</p>",[["➡️ SIGUIENTE NIVEL",()=>loadLevel(G.lv+1)],["🔄 JUGAR DE NUEVO",()=>loadLevel(G.lv)]])}
  else{G.score+=G.time*5;overlay("<h2>🏆 ¡MISIÓN CUMPLIDA!</h2><p>Salvaste el sistema nervioso.<br>Puntuación final: "+G.score+"</p>",[["🔄 JUGAR DE NUEVO",()=>loadLevel(0)]])}}
let last=0,acc=0;
function loop(t){
  if(!G.run)return;
  const dt=(t-last)/1000;last=t;acc+=dt;if(acc>=1){acc=0;G.time--;if(G.time<=0){G.time=0;end(false)}}
  const p=G.p,s=4;
  if(keys.arrowleft||keys.a)p.x-=s;if(keys.arrowright||keys.d)p.x+=s;
  if(keys.arrowup||keys.w)p.y-=s;if(keys.arrowdown||keys.s)p.y+=s;
  p.x=Math.max(p.r,Math.min(640-p.r,p.x));p.y=Math.max(p.r,Math.min(400-p.r,p.y));
  if(G.inv>0)G.inv--;
  G.obs.forEach(o=>{o.x+=o.vx;o.y+=o.vy;if(o.x<100||o.x>480)o.vx*=-1;if(o.y<15||o.y>385)o.vy*=-1;
    if(Math.hypot(o.x-p.x,o.y-p.y)<24)hit()});
  for(const z of G.zones){
    if(p.x>z.x&&p.y>z.y&&p.y<z.y+z.h){
      if(z.ok){G.score+=100;beep(700);burst(p.x,p.y,"#ff0");G.round++;
        if(G.round>=LEVELS[G.lv].rounds.length){$("bar").style.width="100%";end(true)}else loadRound()}
      else hit();
      break}}
  G.parts.forEach(q=>{q.x+=q.vx;q.y+=q.vy;q.l--});G.parts=G.parts.filter(q=>q.l>0);
  draw();hud();requestAnimationFrame(loop)}
function hud(){$("hLives").textContent="❤️".repeat(Math.max(G.lives,0));$("hScore").textContent=G.score;$("hTime").textContent=G.time;$("hLevel").textContent=G.lv+1}
function draw(){
  ctx.clearRect(0,0,640,400);
  // Recorrido decorativo: estímulo → receptor → nervio → médula → encéfalo → respuesta
  ctx.fillStyle="#3a4a9a";ctx.font="11px Arial";
  ["ESTÍMULO","RECEPTOR","NERVIO","MÉDULA","ENCÉFALO"].forEach((t,i)=>ctx.fillText(t+(i<4?" →":""),20+i*85,392));
  G.zones.forEach(z=>{ctx.fillStyle="#1d2a6b";ctx.strokeStyle="#22e0ff";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(z.x,z.y,z.w,z.h,10);ctx.fill();ctx.stroke();
    ctx.fillStyle="#fff";ctx.font="bold 15px Arial";ctx.textAlign="center";ctx.fillText(z.n,z.x+z.w/2,z.y+z.h/2+5);ctx.textAlign="left"});
  ctx.font="26px Arial";G.obs.forEach(o=>ctx.fillText(o.e,o.x-13,o.y+9));
  const p=G.p;if(G.inv%10<5){ctx.shadowColor="#22e0ff";ctx.shadowBlur=20;ctx.fillStyle="#22e0ff";ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill();ctx.shadowBlur=0;ctx.font="16px Arial";ctx.fillText("⚡",p.x-8,p.y+6)}
  G.parts.forEach(q=>{ctx.fillStyle=q.c;ctx.globalAlpha=q.l/30;ctx.fillRect(q.x,q.y,4,4)});ctx.globalAlpha=1}
start();

/* ===== 3. EVALUACIÓN FINAL ===== */
const QS=[
 ["¿Qué estructuras forman el SNC?",["Nervios y ganglios","Encéfalo y médula espinal","Simpático y parasimpático"],1],
 ["El SNP se encarga de...",["Comunicar el SNC con el resto del cuerpo","Pensar y decidir","Producir hormonas"],0],
 ["El sistema somático controla...",["El latido del corazón","La digestión","Acciones voluntarias"],2],
 ["El sistema autónomo regula...",["Funciones involuntarias","Solo los reflejos","El movimiento voluntario"],0],
 ["¿Cuál es el orden general de funcionamiento?",["Respuesta, procesamiento, estímulo","Estímulo, procesamiento, respuesta","Procesamiento, respuesta, estímulo"],1]];
$("quiz").innerHTML=QS.map((q,i)=>`<div class="q"><b>${i+1}. ${q[0]}</b>`+q[1].map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join("")+"</div>").join("");
$("qBtn").onclick=()=>{let ok=0;
  QS.forEach((q,i)=>{const s=document.querySelector(`input[name=q${i}]:checked`);if(s&&+s.value===q[2])ok++});
  const m=ok>=5?"🏆 Excelente dominio":ok>=3?"👍 Buen trabajo":"📚 Necesitas repasar";
  $("qRes").innerHTML=`<b>${ok} / 5</b> — ${m}`};
