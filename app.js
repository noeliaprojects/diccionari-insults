const DATA_URL='data/insults.json';
let insults=[];
const $=s=>document.querySelector(s);
const escapeHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function speak(text,funny=false){
  if(!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text); u.lang='ca-ES'; u.rate=funny ? 0.92 : 0.86; u.pitch=funny ? 1.35 : 1.0;
  const ca=speechSynthesis.getVoices().find(v=>v.lang.toLowerCase().startsWith('ca')); if(ca)u.voice=ca;
  speechSynthesis.speak(u);
}
function favorites(){try{return JSON.parse(localStorage.getItem('favorites')||'[]')}catch{return[]}}
function saveFavorites(v){localStorage.setItem('favorites',JSON.stringify(v))}
function toggleFavorite(slug){let f=favorites(); f=f.includes(slug)?f.filter(x=>x!==slug):[...f,slug];saveFavorites(f);renderDay();renderFavorites()}
function card(i){return `<article class="card"><div class="eyebrow">Insult del dia</div><div class="word-row"><div class="word">${escapeHtml(i.nom)}</div><button class="icon-btn" aria-label="Escolta la paraula" data-speak="${escapeHtml(i.nom)}">▶</button><button class="icon-btn ${favorites().includes(i.slug)?'favorite':''}" aria-label="Preferit" data-favorite="${escapeHtml(i.slug)}">★</button></div><div class="definition">${escapeHtml(i.definicio)}</div>${i.similar?`<p class="syn">Sinònims: ${escapeHtml(i.similar)}</p>`:''}<div class="context-label">En context</div><div class="context-row"><div class="context">«${escapeHtml(i.frase)}»</div><button class="icon-btn" aria-label="Escolta la frase" data-speak="${escapeHtml(i.frase)}" data-funny="1">▶</button></div></article>`}
function renderDay(){const d=new Date(); const day=Math.floor(Date.UTC(d.getUTCFullYear(),d.getUTCMonth(),d.getUTCDate())/86400000); const sorted=[...insults].sort((a,b)=>a.nom.localeCompare(b.nom,'ca')); $('#day').innerHTML=card(sorted[Math.abs(day)%sorted.length])}
function renderList(q=''){q=q.trim().toLocaleLowerCase('ca');const rows=insults.filter(i=>!q||i.nom.toLocaleLowerCase('ca').includes(q)||i.definicio.toLocaleLowerCase('ca').includes(q)).sort((a,b)=>a.nom.localeCompare(b.nom,'ca'));$('#list').innerHTML=rows.map(i=>`<a href="insult/${i.slug}/"><strong>${escapeHtml(i.nom)}</strong></a>`).join('')||'<div class="muted" style="padding:14px">No s\'ha trobat cap insult.</div>'}
function renderFavorites(){const set=new Set(favorites()); const rows=insults.filter(i=>set.has(i.slug)).sort((a,b)=>a.nom.localeCompare(b.nom,'ca'));$('#favorites').innerHTML=rows.length?`<div class="list">${rows.map(i=>`<a href="insult/${i.slug}/"><strong>${escapeHtml(i.nom)}</strong></a>`).join('')}</div>`:'<p class="muted">Encara no hi ha preferits.</p>'}
function newQuiz(){const correct=insults[Math.floor(Math.random()*insults.length)];let opts=[correct];while(opts.length<4){const x=insults[Math.floor(Math.random()*insults.length)];if(!opts.some(o=>o.slug===x.slug))opts.push(x)}opts.sort(()=>Math.random()-.5);$('#quiz').innerHTML=`<div class="card"><div class="eyebrow">Quina definició?</div><h2>«${escapeHtml(correct.nom)}»</h2><div class="quiz-options">${opts.map(o=>`<button data-ok="${o.slug===correct.slug}">${escapeHtml(o.definicio)}</button>`).join('')}</div><div class="quiz-result"></div><button class="primary-btn" style="margin-top:8px" data-next-quiz="1">Següent</button></div>`;$('#quiz').querySelectorAll('[data-ok]').forEach(b=>b.onclick=()=>{$('#quiz .quiz-result').textContent=b.dataset.ok==='true'?'✅ Correcte!':`❌ Incorrecte. Era: ${correct.definicio}`})}
function showTab(id){document.querySelectorAll('.panel').forEach(x=>x.classList.toggle('active',x.id===id));document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.tab===id));if(id==='favorites')renderFavorites()}
function bindEmail(){document.querySelectorAll('[data-contact-email]').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();const address=`noelia.projects${String.fromCharCode(64)}gmail.com`;location.href=`mailto:${address}`}))}
document.addEventListener('click',e=>{const speakBtn=e.target.closest('[data-speak]');if(speakBtn){speak(speakBtn.dataset.speak,speakBtn.dataset.funny==='1');return}const fav=e.target.closest('[data-favorite]');if(fav){toggleFavorite(fav.dataset.favorite);return}if(e.target.closest('[data-next-quiz]'))newQuiz()});
async function init(){insults=await fetch(DATA_URL).then(r=>r.json());renderDay();renderList();newQuiz();$('#search').addEventListener('input',e=>renderList(e.target.value));document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>showTab(t.dataset.tab));bindEmail();if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});}
init();
