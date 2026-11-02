// ════════════════════════════════════════════
//  MEDILEDGER 2.0 — COMPLETE BACKEND ENGINE
// ════════════════════════════════════════════

/* ── STATE ── */
const STATE = {
  currentPage: 'land',
  appPage: 'dash',
  role: 'Clinician',
  authTab: 'password',
  blockNumber: 19284511,
  gasPrice: 18,
  meds: [],
  uploadedFiles: [],
  chainRunning: false,
  vitals: { hr:[], bp:[], temp:[], spo2:[] },
  txPool: [],
  selectedPatient: null,
  notifications: [],
  records: []
};

/* ── PATIENTS DATA ── */
const PATIENTS = [
  { id:'P001', name:'Amara Osei',     age:34, gender:'F', blood:'AB+', diag:'Type 2 Diabetes Mellitus',  ward:'Endocrinology', status:'stable',   risk:42, emoji:'👩', color:'cyan',   meds:['Metformin 500mg','Lisinopril 10mg'], notes:'Well-controlled T2DM. Last HbA1c: 7.2%.', records:12, hash:'bafybei...k2p9', icd:'E11.9' },
  { id:'P002', name:'Li Wei',         age:52, gender:'M', blood:'O+',  diag:'Hypertensive Heart Disease', ward:'Cardiology',    status:'critical', risk:78, emoji:'👨', color:'amber',  meds:['Amlodipine 5mg','Atenolol 50mg','Aspirin 75mg'], notes:'BP poorly controlled. Echo shows LVH.', records:18, hash:'bafybei...m7r4', icd:'I11.9' },
  { id:'P003', name:'Sofia Reyes',    age:28, gender:'F', blood:'B+',  diag:'Moderate Persistent Asthma', ward:'Pulmonology',   status:'stable',   risk:31, emoji:'👩', color:'violet', meds:['Salbutamol 100mcg','Fluticasone 250mcg'], notes:'Well-managed on ICS/SABA regimen.', records:5, hash:'bafybei...s2t8', icd:'J45.40' },
  { id:'P004', name:'Kenji Tanaka',   age:19, gender:'M', blood:'A-',  diag:'Distal Radius Fracture',     ward:'Orthopaedics',  status:'new',      risk:18, emoji:'🧑', color:'sky',    meds:['Ibuprofen 400mg','Paracetamol 500mg'], notes:'Closed reduction + cast. Follow-up in 4 weeks.', records:3, hash:'bafybei...q5y1', icd:'S52.509' },
  { id:'P005', name:'Fatima Al-Amin', age:41, gender:'F', blood:'O-',  diag:'Allergic Rhinitis',           ward:'ENT',           status:'stable',   risk:22, emoji:'👩', color:'rose',   meds:['Cetirizine 10mg','Fluticasone nasal'], notes:'Perennial AR, triggered by dust mites.', records:6, hash:'bafybei...n9x6', icd:'J30.9' },
  { id:'P006', name:'Marcus Webb',    age:67, gender:'M', blood:'A+',  diag:'Post-Cardiac Surgery Care',   ward:'ICU',           status:'critical', risk:91, emoji:'👴', color:'rose',   meds:['Warfarin 5mg','Furosemide 40mg','Digoxin 0.125mg','Spironolactone 25mg'], notes:'Day 3 post-CABG. Haemodynamically stable.', records:22, hash:'bafybei...p4r2', icd:'Z48.812' },
  { id:'P007', name:'Yuna Kim',       age:45, gender:'F', blood:'B-',  diag:'Chronic Migraine',            ward:'Neurology',     status:'stable',   risk:35, emoji:'👩', color:'violet', meds:['Topiramate 50mg','Sumatriptan 50mg'], notes:'15+ headache days/month. Preventive therapy started.', records:9, hash:'bafybei...w8v3', icd:'G43.709' },
  { id:'P008', name:'Daniel Ibe',     age:7,  gender:'M', blood:'AB-', diag:'Paediatric Asthma',           ward:'Paediatrics',   status:'new',      risk:27, emoji:'👦', color:'cyan',   meds:['Salbutamol 100mcg','Montelukast 5mg'], notes:'Paeds asthma. Good inhaler technique demonstrated.', records:4, hash:'bafybei...e1x9', icd:'J45.20' },
];

const TX_HISTORY = [
  { hash:'0x4f2a8e...b1', type:'EHR Store',   patient:'Amara Osei',    status:'confirmed', gas:'21,000', time:'2m ago', block:19284509 },
  { hash:'0x9c1b7d...43', type:'FHIR Query',  patient:'Li Wei',         status:'confirmed', gas:'8,500',  time:'8m ago', block:19284507 },
  { hash:'0x2e8f1a...96', type:'Consent',     patient:'Sofia Reyes',   status:'pending',   gas:'15,000', time:'15m ago', block:null },
  { hash:'0x7d3c4f...21', type:'EHR Update',  patient:'Marcus Webb',   status:'confirmed', gas:'31,200', time:'1h ago', block:19284490 },
  { hash:'0x1a9b5e...77', type:'IPFS Pin',    patient:'Kenji Tanaka',  status:'confirmed', gas:'5,800',  time:'2h ago', block:19284471 },
];

const INSTITUTIONS = [
  { name:'City General Hospital',  type:'Tertiary Hospital',   status:'online',  emoji:'🏥', records:4821, color:'cyan'   },
  { name:'Regional Diagnostic Lab',type:'Laboratory',          status:'online',  emoji:'🧬', records:2104, color:'violet' },
  { name:'St. Mary\'s Clinic',     type:'Primary Care',        status:'online',  emoji:'🩺', records:1337, color:'amber'  },
  { name:'Metro Pharmacy Chain',   type:'Pharmacy Network',    status:'online',  emoji:'💊', records:8932, color:'rose'   },
  { name:'University Med School',  type:'Research Institution',status:'offline', emoji:'🎓', records:512,  color:'sky'    },
  { name:'Radiology Centre',       type:'Imaging Centre',      status:'online',  emoji:'🩻', records:3401, color:'lime'   },
];

/* ── TOAST ── */
let toastTimer;
function toast(msg, type='info') {
  const el = document.getElementById('toast');
  const dot = el.querySelector('.dot');
  document.getElementById('toast-msg').textContent = msg;
  dot.className = 'dot d-pulse ' + (type==='error'?'d-rose':type==='success'?'d-green':'d-cyan');
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

/* ── NAVIGATION ── */
function goto(page) {
  if (page === 'auth' && STATE.currentPage === 'land') {
    // Slide landing out to left, auth in from right
    const landEl = document.getElementById('pg-land');
    const authEl = document.getElementById('pg-auth');
    document.body.classList.add('transitioning');
    landEl.classList.add('slide-out');
    authEl.classList.add('active');
    authEl.classList.remove('slide-in');
    void authEl.offsetWidth;
    authEl.classList.add('slide-in');
    setTimeout(() => {
      landEl.classList.remove('active','slide-out');
      document.body.classList.remove('transitioning');
    }, 550);
    STATE.currentPage = page;
    return;
  }
  document.querySelectorAll('.page, .app-shell').forEach(p => {
    p.classList.remove('active','slide-in','slide-out');
  });
  if (page === 'land') {
    document.getElementById('pg-land').classList.add('active');
    initLanding();
  } else if (page === 'auth') {
    const authEl = document.getElementById('pg-auth');
    authEl.classList.add('active');
    authEl.classList.remove('slide-in');
    void authEl.offsetWidth;
    authEl.classList.add('slide-in');
  } else if (page === 'app') {
    document.getElementById('app-shell').classList.add('active');
    initApp();
    appNav(STATE.appPage || 'dash');
  }
  STATE.currentPage = page;
}

function appNav(page) {
  // Hide all inner pages
  ['dash','ehr','blockchain','p360','interop','analytics','settings','patients','qrcodes','ledger'].forEach(p => {
    const el = document.getElementById('app-'+p);
    if (el) el.style.display = 'none';
  });
  // Show target
  const target = document.getElementById('app-'+page);
  if (target) target.style.display = 'block';

  // Update sidebar
  document.querySelectorAll('.sbn').forEach(b => b.classList.remove('on'));
  const btn = document.getElementById('sbn-'+page);
  if (btn) btn.classList.add('on');

  // Update topbar
  const titles = {
    dash:'Dashboard', ehr:'EHR Studio', blockchain:'Blockchain Explorer',
    p360:'Patient 360°', interop:'Interop Hub', analytics:'Analytics & AI',
    settings:'Settings', patients:'Patient Registry', qrcodes:'QR Codes', ledger:'Ledger & Workflow'
  };
  const crumbs = {
    dash:'overview', ehr:'ehr-studio', blockchain:'explorer', p360:'digital-twin',
    interop:'interop-hub', analytics:'ai-analytics', settings:'config',
    patients:'patient-registry', qrcodes:'qr-codes', ledger:'ledger'
  };
  document.getElementById('topbar-title').textContent = titles[page] || page;
  document.getElementById('topbar-crumb').textContent = `mediledger / ${crumbs[page]||page}`;

  STATE.appPage = page;

  // Init page
  const inits = {
    dash:initDash, ehr:initEHR, blockchain:initBlockchain, p360:initP360,
    interop:initInterop, analytics:initAnalytics, settings:()=>{},
    patients:initPatients, qrcodes:initQRCodes, ledger:initLedgerPage
  };
  if (inits[page]) inits[page]();
}

/* ── AUTH ── */
function setRole(el, role) {
  document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('on'));
  el.classList.add('on'); STATE.role = role;
}
function setAuthTab(el, tab) {
  document.querySelectorAll('.auth-tab').forEach(b => b.classList.remove('on'));
  el.classList.add('on'); STATE.authTab = tab;
  ['password','biometric','web3'].forEach(t => {
    const el2 = document.getElementById('tab-'+t);
    if (el2) el2.style.display = t===tab ? 'block' : 'none';
  });
  const btn = document.getElementById('login-btn');
  if (tab === 'biometric') btn.style.display = 'none';
  else btn.style.display = 'block';
}
function doLogin() {
  const email = document.getElementById('li-email').value.trim() || 'dr.chen@hospital.org';
  const pass  = document.getElementById('li-pass').value.trim()  || 'demo';
  if (!email) { document.getElementById('auth-err').style.display='inline-flex'; return; }
  document.getElementById('auth-err').style.display = 'none';
  const btn = document.getElementById('login-btn');
  btn.textContent = '⏳ Authenticating...'; btn.disabled = true;
  setTimeout(() => { btn.textContent = '🔐 Authenticate Securely'; btn.disabled = false; goto('app'); }, 800);
}
function doBioLogin() {
  const s = document.getElementById('bio-status');
  s.textContent = 'SCANNING...';
  setTimeout(() => { s.textContent = 'VERIFIED ✓'; setTimeout(() => goto('app'), 500); }, 1200);
}
function doWeb3Login() {
  const vis = document.getElementById('zk-preview');
  vis.innerHTML = `<div class="zk-line-done">✓ ZK-SNARK proof generated</div>
    <div class="zk-line-active" id="zk2">→ Verifying on-chain identity...</div>
    <div class="sc-gray">→ Decrypting access permissions...</div>`;
  setTimeout(() => {
    document.getElementById('zk2').className = 'zk-line-done';
    vis.innerHTML += `<div class="zk-line-active" id="zk3">→ Decrypting access permissions...</div>`;
    setTimeout(() => {
      document.getElementById('zk3').className = 'zk-line-done';
      vis.innerHTML += `<div style="color:#4ade80;margin-top:4px;">✓ Access granted — Welcome Dr. Chen</div>`;
      setTimeout(() => goto('app'), 700);
    }, 800);
  }, 900);
}

/* ── LANDING INIT ── */
function initLanding() {
  buildTicker();
  animateLandStats();
  buildParticles();
}
function buildTicker() {
  const items = [
    ['EHR RECORDS','8,421,332'],['NETWORK UPTIME','99.97%'],['AVG RESPONSE','0.4s'],
    ['ACTIVE NODES','12 / 12'],['PENDING TXs','3'],['GAS PRICE','18 Gwei'],
    ['IPFS NODES','8 / 8'],['INSTITUTIONS','342'],['DAILY TXs','14,200'],['BLOCK','#19,284,511'],
  ];
  const html = [...items,...items].map(([k,v]) => `
    <div class="ticker-item">
      <span class="ticker-sep">◆</span> ${k}: <span class="val">${v}</span>
    </div>`).join('');
  const t = document.getElementById('ticker');
  if (t) t.innerHTML = html;
}
function animateLandStats() {
  const stats = [['s1','8.4','M'],['s2','342','+'],['s4','400','ms'],['s5','14.2','K']];
  stats.forEach(([id,val,sfx]) => {
    const el = document.getElementById(id);
    if (!el) return;
    let v = 0; const target = parseFloat(val);
    const timer = setInterval(() => {
      v += target / 60;
      if (v >= target) { v = target; clearInterval(timer); }
      el.innerHTML = v.toFixed(v<10?1:0) + `<span>${sfx}</span>`;
    }, 16);
  });
}
function buildParticles() {
  const bg = document.getElementById('bg');
  if (!bg) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.cssText = `left:${Math.random()*100}%;animation-duration:${8+Math.random()*12}s;animation-delay:${-Math.random()*20}s;--drift:${(Math.random()-.5)*80}px;opacity:${0.1+Math.random()*0.3};`;
    bg.appendChild(p);
  }
}
function openDemo() { goto('auth'); toast('Demo mode — use any credentials'); }

/* ── APP INIT ── */
function initApp() {
  startBlockCounter();
  startGasUpdater();
  buildNotifications();
}

/* ── LIVE BLOCK/GAS COUNTER ── */
function startBlockCounter() {
  const el = document.getElementById('block-counter');
  setInterval(() => {
    if (Math.random() < 0.07) {
      STATE.blockNumber++;
      if (el) el.textContent = `Block #${STATE.blockNumber.toLocaleString()}`;
    }
  }, 1000);
}
function startGasUpdater() {
  const el = document.getElementById('gas-chip');
  setInterval(() => {
    STATE.gasPrice = Math.max(8, Math.min(80, STATE.gasPrice + (Math.random()-.5)*3));
    if (el) el.textContent = `⛽ ${Math.round(STATE.gasPrice)} Gwei`;
  }, 3000);
}

/* ════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════ */
function initDash() {
  // Update welcome banner with real data
  prLoad();
  const active = prPatients.filter(p=>p.status==='Active').length;
  const wbEl = document.getElementById('wb-status');
  if (wbEl) wbEl.textContent = `${active} active patients · ${prPatients.length} total records · 2 TX confirmations · Network: Nominal`;
  animateStats();
  buildMainChart();
  startVitals();
  buildActivityFeed();
  buildNetworkNodes();
  buildRiskSummary();
  buildDashTx();
  buildIPFSNodes();
  buildContractStatus();
}

function animateStats() {
  const targets = [['sv1',1247,'sp1',68],['sv2',5830,'sp2',82],['sv3',28400,'sp3',91],['sv4',9120,'sp4',76]];
  targets.forEach(([vid,val,pid,pct]) => {
    const vel = document.getElementById(vid);
    const pel = document.getElementById(pid);
    let v = 0;
    const timer = setInterval(() => {
      v += val/60;
      if (v >= val) { v = val; clearInterval(timer); }
      if (vel) vel.textContent = Math.floor(v).toLocaleString();
    }, 16);
    if (pel) setTimeout(() => pel.style.width = pct+'%', 200);
  });
}

function buildMainChart() {
  const svg = document.getElementById('main-chart');
  if (!svg) return;
  const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const recs = [42,67,38,89,74,55,91];
  const qs   = [28,41,52,63,45,38,72];
  const txs  = [18,29,23,45,38,25,50];
  const W = 600, H = 130, maxV = 100;
  const gap = W / days.length;

  // Draw grid lines
  let html = '';
  [25,50,75].forEach(pct => {
    const y = H - (pct/maxV)*H;
    html += `<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>`;
  });

  // Area fills
  const makeArea = (data, color) => {
    const pts = data.map((v,i) => `${gap*i+gap/2},${H-(v/maxV)*H}`).join(' ');
    const first = `${gap/2},${H-(data[0]/maxV)*H}`;
    const last  = `${gap*(data.length-1)+gap/2},${H-(data[data.length-1]/maxV)*H}`;
    return `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" opacity=".85"/>
      <polygon points="${first} ${pts} ${last} ${gap*(data.length-1)+gap/2},${H} ${gap/2},${H}" fill="${color}" opacity=".06"/>`;
  };

  html += makeArea(recs, 'var(--cyan)');
  html += makeArea(qs,   'var(--violet)');
  html += makeArea(txs,  'var(--amber)');

  // Dots
  recs.forEach((v,i) => { html += `<circle cx="${gap*i+gap/2}" cy="${H-(v/maxV)*H}" r="3" fill="var(--cyan)" opacity=".9"/>`; });

  svg.innerHTML = html;

  const labels = document.getElementById('chart-labels');
  if (labels) labels.innerHTML = days.map(d => `<span style="flex:1;text-align:center;font-size:.65rem;color:var(--t3);font-weight:600;">${d}</span>`).join('');
}

/* Vitals simulation */
let vitalsInterval;
function startVitals() {
  clearInterval(vitalsInterval);
  // Init with realistic values
  STATE.vitals = { hr:[72], bp:[120], temp:[36.6], spo2:[98] };

  const update = () => {
    const push = (arr, base, range) => {
      arr.push(base + (Math.random()-.5)*range*2);
      if (arr.length > 20) arr.shift();
    };
    push(STATE.vitals.hr,   72, 8);
    push(STATE.vitals.bp,  120, 12);
    push(STATE.vitals.temp, 36.6, 0.3);
    push(STATE.vitals.spo2, 98, 1.5);

    const last = arr => arr[arr.length-1];

    const hrEl   = document.getElementById('v-hr');
    const bpEl   = document.getElementById('v-bp');
    const tEl    = document.getElementById('v-temp');
    const sEl    = document.getElementById('v-spo2');
    if (hrEl) hrEl.textContent = Math.round(last(STATE.vitals.hr)) + ' bpm';
    if (bpEl) bpEl.textContent = Math.round(last(STATE.vitals.bp)) + '/80 mmHg';
    if (tEl)  tEl.textContent  = last(STATE.vitals.temp).toFixed(1) + ' °C';
    if (sEl)  sEl.textContent  = Math.round(Math.min(100,last(STATE.vitals.spo2))) + '%';

    drawVitalGraph('vg-hr',   STATE.vitals.hr,   'var(--rose)');
    drawVitalGraph('vg-bp',   STATE.vitals.bp,   'var(--sky)');
    drawVitalGraph('vg-temp', STATE.vitals.temp, 'var(--green)');
    drawVitalGraph('vg-spo2', STATE.vitals.spo2, 'var(--lime)');
  };
  update();
  vitalsInterval = setInterval(update, 1500);
}

function drawVitalGraph(id, data, color) {
  const svg = document.getElementById(id);
  if (!svg || data.length < 2) return;
  const w = 60, h = 28;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v,i) => {
    const x = (i / (data.length-1)) * w;
    const y = h - ((v-min)/range) * (h-4) - 2;
    return `${x},${y}`;
  }).join(' ');
  svg.innerHTML = `<polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" opacity=".9"/>`;
}

/* Activity feed */
const ACTIVITIES = [
  { dot:'d-cyan',   msg:'EHR stored on blockchain — Amara Osei',          sub:'City General · 2m ago' },
  { dot:'d-violet', msg:'FHIR query fulfilled — Li Wei lab results',       sub:'Regional Lab · 8m ago' },
  { dot:'d-amber',  msg:'Consent granted — Sofia Reyes',                   sub:'St. Mary\'s · 15m ago' },
  { dot:'d-rose',   msg:'⚠ Drug interaction flagged — Marcus Webb',        sub:'AI Engine · 22m ago' },
  { dot:'d-green',  msg:'Smart contract deployed — EHR_Registry_v2',       sub:'Ethereum · 1h ago' },
  { dot:'d-sky',    msg:'IPFS replication — 8/8 nodes confirmed',          sub:'IPFS Net · 2h ago' },
];
function buildActivityFeed() {
  const el = document.getElementById('activity-feed');
  if (!el) return;
  el.innerHTML = ACTIVITIES.map((a,i) => `
    <div class="activity-item">
      <div class="ai-dot-col">
        <div class="dot ${a.dot}"></div>
        ${i < ACTIVITIES.length-1 ? '<div class="ai-vline"></div>' : ''}
      </div>
      <div class="ai-body">
        <div class="ai-msg">${a.msg}</div>
        <div class="ai-meta">${a.sub}</div>
      </div>
    </div>`).join('');
}

function buildNetworkNodes() {
  const el = document.getElementById('network-nodes');
  if (!el) return;
  const nodes = [
    {n:'City General',ms:'24ms',ok:true},{n:'Regional Lab',ms:'31ms',ok:true},
    {n:'St. Mary\'s',ms:'18ms',ok:true},{n:'Ortho Clinic',ms:'45ms',ok:true},
    {n:'Pharma Hub',ms:'22ms',ok:true},{n:'Radiology',ms:'56ms',ok:true},
  ];
  el.innerHTML = nodes.map(n => `
    <div style="background:rgba(99,117,183,.05);border:1px solid var(--border);border-radius:8px;padding:8px;text-align:center;cursor:pointer;transition:all .2s;" onclick="toast('Node: ${n.n} — ${n.ms}')">
      <div class="dot d-green" style="margin:0 auto 4px;width:6px;height:6px;"></div>
      <div style="font-size:.68rem;font-weight:700;color:var(--t2);">${n.n}</div>
      <div style="font-size:.62rem;color:var(--t3);font-family:'JetBrains Mono',monospace;">${n.ms}</div>
    </div>`).join('');
}

function buildRiskSummary() {
  const el = document.getElementById('risk-summary');
  if (!el) return;
  const items = [
    {name:'Marcus Webb',risk:91,color:'var(--rose)'},
    {name:'Li Wei',risk:78,color:'var(--amber)'},
    {name:'Amara Osei',risk:42,color:'var(--amber)'},
    {name:'Yuna Kim',risk:35,color:'var(--cyan)'},
  ];
  el.innerHTML = items.map(p => `
    <div class="pred-row">
      <div class="pred-name" style="font-size:.78rem;">${p.name}</div>
      <div class="pred-bar-wrap"><div class="pred-bar" style="width:${p.risk}%;background:${p.color}"></div></div>
      <div class="pred-risk" style="color:${p.color}">${p.risk}%</div>
    </div>`).join('');
}

function buildDashTx() {
  const el = document.getElementById('dash-tx-table');
  if (!el) return;
  el.innerHTML = `<tr><th>Hash</th><th>Type</th><th>Patient</th><th>Status</th><th>Time</th></tr>`
    + TX_HISTORY.slice(0,4).map(t => `<tr>
      <td class="mono" style="font-size:.68rem;color:var(--violet);">${t.hash}</td>
      <td style="font-weight:600;font-size:.78rem;">${t.type}</td>
      <td style="font-size:.78rem;">${t.patient}</td>
      <td><div class="chip ${t.status==='confirmed'?'chip-green':'chip-amber'}" style="font-size:.62rem;">${t.status==='confirmed'?'✓ Done':'⏳ Pending'}</div></td>
      <td style="color:var(--t3);font-size:.68rem;">${t.time}</td>
    </tr>`).join('');
}

function buildIPFSNodes() {
  const el = document.getElementById('ipfs-nodes');
  if (!el) return;
  const nodes = [
    {n:'us-east-1',sz:'1.2GB',ok:true},{n:'eu-west-1',sz:'1.1GB',ok:true},
    {n:'ap-south-1',sz:'0.9GB',ok:true},{n:'us-west-2',sz:'1.0GB',ok:false},
  ];
  el.innerHTML = nodes.map(n => `
    <div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid rgba(99,117,183,.05);">
      <div class="dot ${n.ok?'d-green':'d-rose'}"></div>
      <span style="font-size:.8rem;font-weight:600;flex:1;">${n.n}</span>
      <span style="font-size:.72rem;color:var(--t3);font-family:'JetBrains Mono',monospace;">${n.sz}</span>
      <div class="chip ${n.ok?'chip-green':'chip-rose'}" style="font-size:.62rem;">${n.ok?'Pinned':'Offline'}</div>
    </div>`).join('');
}

function buildContractStatus() {
  const el = document.getElementById('contract-status');
  if (!el) return;
  const contracts = [
    {name:'EHR_Registry_v2.sol',addr:'0x4a9f...8e3c',ok:true,calls:5830},
    {name:'ConsentManager.sol',addr:'0x7b2d...4f12',ok:true,calls:9120},
    {name:'AccessControl.sol',addr:'0x1c8a...9b44',ok:true,calls:28400},
  ];
  el.innerHTML = contracts.map(c => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid rgba(99,117,183,.05);">
      <div class="dot ${c.ok?'d-green':'d-rose'} d-pulse"></div>
      <div style="flex:1;">
        <div style="font-size:.8rem;font-weight:700;">${c.name}</div>
        <div style="font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--t3);">${c.addr}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:.75rem;font-weight:700;color:var(--cyan);">${c.calls.toLocaleString()} calls</div>
        <div class="chip ${c.ok?'chip-green':'chip-rose'}" style="font-size:.6rem;margin-top:3px;">Active</div>
      </div>
    </div>`).join('');
}

/* ════════════════════════════════════════════
   EHR STUDIO
════════════════════════════════════════════ */
const MED_INTERACTIONS = {
  'Warfarin': { 'Aspirin':'HIGH: Major bleeding risk. Monitor PT/INR closely.', 'Ibuprofen':'HIGH: NSAIDs inhibit platelet function. Avoid combination.', 'Metformin':'LOW: Minimal interaction. Monitor glucose.' },
  'Metformin': { 'Lisinopril':'LOW: No significant interaction.', 'Aspirin':'LOW: May slightly increase metformin levels.' },
  'Digoxin': { 'Furosemide':'MODERATE: Risk of hypokalaemia increasing digoxin toxicity. Monitor electrolytes.', 'Amiodarone':'HIGH: Amiodarone doubles digoxin levels. Reduce digoxin dose by 50%.' },
};
const AI_SUGGESTIONS = {
  'diabetes': { icd:'E11.9', tests:['HbA1c','Fasting glucose','Lipid panel','Renal function'], notes:'Consider SGLT2 inhibitor for cardioprotection. Screen for neuropathy, nephropathy, retinopathy annually.' },
  'hypertension': { icd:'I10', tests:['ECG','Echo','Renal function','Electrolytes'], notes:'Target BP <130/80 mmHg. Consider ACE inhibitor as first-line if diabetic.' },
  'asthma': { icd:'J45.40', tests:['Spirometry','Peak flow diary','FeNO if available'], notes:'Step-up therapy if uncontrolled. Check inhaler technique before escalating.' },
  'fracture': { icd:'S52.509', tests:['X-ray','Bone density if elderly'], notes:'RICE protocol. Immobilisation 4-6 weeks. Consider bone health assessment.' },
};

function initEHR() {
  STATE.meds = [];
  renderMeds();
  updateFHIR();
  buildEHRChecklist();
  buildRecentRecords();
}

function onDiagChange() {
  updateFHIR();
  const diag = document.getElementById('f-diag').value.toLowerCase();
  const suggEl = document.getElementById('ai-diag-suggest');
  const contentEl = document.getElementById('ai-diag-content');
  const matchKey = Object.keys(AI_SUGGESTIONS).find(k => diag.includes(k));
  if (matchKey && diag.length > 3) {
    const s = AI_SUGGESTIONS[matchKey];
    document.getElementById('f-icd').value = s.icd;
    contentEl.innerHTML = `
      <div style="margin-bottom:6px;"><b style="color:var(--cyan)">ICD-10:</b> ${s.icd}</div>
      <div style="margin-bottom:6px;"><b style="color:var(--violet)">Suggested Tests:</b> ${s.tests.join(', ')}</div>
      <div><b style="color:var(--amber)">Clinical Note:</b> ${s.notes}</div>`;
    suggEl.classList.add('show');
  } else {
    suggEl.classList.remove('show');
  }
}

function addMed() {
  const input = document.getElementById('f-med-input');
  const med = input.value.trim();
  if (!med) return;
  STATE.meds.push(med);
  input.value = '';
  renderMeds();
  checkDrugInteractions();
  updateFHIR();
}

function renderMeds() {
  const el = document.getElementById('med-list');
  if (!el) return;
  if (STATE.meds.length === 0) { el.innerHTML = '<div style="font-size:.78rem;color:var(--t3);padding:6px 0;">No medications added yet</div>'; return; }
  el.innerHTML = STATE.meds.map((m,i) => `
    <div class="drug-item">
      <div class="dot d-cyan"></div>
      <span style="flex:1;font-size:.82rem;font-weight:600;">${m}</span>
      <button class="btn btn-ghost btn-xs" onclick="removeMed(${i})">✕</button>
    </div>`).join('');
}

function removeMed(idx) {
  STATE.meds.splice(idx, 1);
  renderMeds();
  checkDrugInteractions();
  updateFHIR();
}

function checkDrugInteractions() {
  const checker = document.getElementById('drug-checker');
  const interEl = document.getElementById('drug-interactions');
  let interactions = [];
  STATE.meds.forEach(m1 => {
    const drug1 = Object.keys(MED_INTERACTIONS).find(k => m1.toLowerCase().includes(k.toLowerCase()));
    if (!drug1) return;
    STATE.meds.forEach(m2 => {
      if (m1 === m2) return;
      const drug2 = Object.keys(MED_INTERACTIONS[drug1]||{}).find(k => m2.toLowerCase().includes(k.toLowerCase()));
      if (drug2) interactions.push({ d1:m1, d2:m2, info:MED_INTERACTIONS[drug1][drug2] });
    });
  });
  if (interactions.length > 0) {
    checker.style.display = 'block';
    interEl.innerHTML = interactions.map(i => `
      <div class="drug-item" style="flex-direction:column;align-items:flex-start;gap:4px;">
        <div style="display:flex;align-items:center;gap:6px;">
          <div class="dot ${i.info.startsWith('HIGH')?'d-rose':i.info.startsWith('MODERATE')?'d-amber':'d-cyan'}"></div>
          <b style="font-size:.8rem;">${i.d1} + ${i.d2}</b>
        </div>
        <div style="font-size:.75rem;color:var(--t2);padding-left:13px;">${i.info}</div>
      </div>`).join('');
  } else {
    checker.style.display = 'none';
  }
}

function updateFHIR() {
  const el = document.getElementById('fhir-preview');
  if (!el) return;
  const get = id => { const e = document.getElementById(id); return e ? e.value : ''; };
  const name = get('f-name') || 'Unknown';
  const dob  = get('f-dob')  || '1990-01-01';
  const diag = get('f-diag') || 'Not specified';
  const icd  = get('f-icd')  || 'Z00.0';
  const hr   = get('f-hr')   || '—';
  const bp   = get('f-bp2')  || '—';

  const json = {
    resourceType:"Bundle", type:"document",
    timestamp: new Date().toISOString(),
    id: "bundle-"+Math.random().toString(36).slice(2,8),
    entry:[
      { resource:{ resourceType:"Patient", id:"patient-001",
          name:[{use:"official",text:name}], birthDate:dob,
          gender: get('f-gender')||'unknown', identifier:[{system:"MRN",value:get('f-mrn')||"—"}] }},
      { resource:{ resourceType:"Condition", id:"cond-001",
          code:{coding:[{system:"http://hl7.org/fhir/sid/icd-10",code:icd,display:diag}]},
          severity:{text:get('f-severity')||'—'}, note:[{text:get('f-notes')||'—'}] }},
      { resource:{ resourceType:"Observation", id:"obs-hr",
          code:{text:"Heart Rate"}, valueQuantity:{value:hr,unit:"bpm"},
          status:"final" }},
      { resource:{ resourceType:"MedicationRequest",
          medicationCodeableConcept:{text:STATE.meds.join(', ')||'None'},
          status:"active" }},
    ]
  };
  el.innerHTML = syntaxHighlightJSON(JSON.stringify(json, null, 2));
}

function syntaxHighlightJSON(str) {
  return str
    .replace(/("[\w@:/.-]+")\s*:/g, '<span class="fj-key">$1</span>:')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="fj-str">$1</span>')
    .replace(/:\s*(\d+\.?\d*)/g, ': <span class="fj-num">$1</span>')
    .replace(/:\s*(true|false)/g, ': <span class="fj-bool">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="fj-null">$1</span>')
    .replace(/([{}[\]])/g, '<span class="fj-brace">$1</span>');
}

function buildEHRChecklist() {
  const el = document.getElementById('ehr-checklist');
  if (!el) return;
  const items = [
    {label:'Patient identity verified',done:true},
    {label:'Diagnosis with ICD-10 code',done:false},
    {label:'Medications reviewed',done:false},
    {label:'Drug interaction check',done:true},
    {label:'Vital signs recorded',done:false},
    {label:'Attending physician signed',done:true},
    {label:'FHIR bundle validated',done:false},
    {label:'Consent obtained',done:true},
  ];
  el.innerHTML = items.map(item => `
    <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(99,117,183,.05);">
      <div style="width:18px;height:18px;border-radius:5px;border:1.5px solid ${item.done?'var(--green)':'var(--border)'};background:${item.done?'rgba(74,222,128,.15)':'transparent'};display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0;color:var(--green);">${item.done?'✓':''}</div>
      <span style="font-size:.78rem;font-weight:600;color:${item.done?'var(--t1)':'var(--t3)'};">${item.label}</span>
    </div>`).join('');
}

function buildRecentRecords() {
  const el = document.getElementById('recent-records');
  if (!el) return;
  el.innerHTML = PATIENTS.slice(0,4).map(p => `
    <div style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(99,117,183,.05);cursor:pointer;" onclick="loadPatientToEHR('${p.id}')">
      <div style="width:32px;height:32px;border-radius:8px;background:rgba(14,165,233,.1);display:flex;align-items:center;justify-content:center;font-size:16px;">${p.emoji}</div>
      <div style="flex:1;">
        <div style="font-size:.8rem;font-weight:700;">${p.name}</div>
        <div style="font-size:.68rem;color:var(--t3);">${p.diag}</div>
      </div>
      <div class="chip ${p.status==='critical'?'chip-rose':p.status==='new'?'chip-amber':'chip-green'}" style="font-size:.62rem;">${p.status}</div>
    </div>`).join('');
}

function loadPatientToEHR(id) {
  const p = PATIENTS.find(x => x.id === id);
  if (!p) return;
  document.getElementById('f-name').value   = p.name;
  document.getElementById('f-blood').value  = p.blood;
  document.getElementById('f-diag').value   = p.diag;
  document.getElementById('f-icd').value    = p.icd;
  document.getElementById('f-doc').value    = 'Dr. Chen Wei';
  document.getElementById('f-notes').value  = p.notes;
  STATE.meds = [...p.meds];
  renderMeds();
  checkDrugInteractions();
  updateFHIR();
  toast(`Loaded: ${p.name}`, 'success');
}

function simulateUpload() {
  const files = ['chest_xray.dcm','blood_panel.pdf','ecg_trace.png'];
  const file = files[Math.floor(Math.random()*files.length)];
  const cid = 'bafybeig'+Math.random().toString(36).slice(2,14);
  STATE.uploadedFiles.push({name:file, cid});
  const el = document.getElementById('upload-files');
  if (el) {
    el.innerHTML += `
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(14,165,233,.05);border:1px solid rgba(14,165,233,.12);border-radius:8px;margin-top:6px;">
        <span style="font-size:.8rem;">📎 ${file}</span>
        <div class="chip chip-cyan" style="font-size:.6rem;margin-left:auto;">IPFS: ${cid.slice(0,16)}...</div>
      </div>`;
  }
  toast(`Uploaded: ${file} → IPFS pinned`, 'success');
}

function submitEHR() {
  const name = document.getElementById('f-name').value;
  if (!name) { toast('Please fill patient name', 'error'); return; }
  toast('Submitting to blockchain...', 'info');
  STATE.appPage = 'blockchain';
  setTimeout(() => { appNav('blockchain'); document.getElementById('bc-sel-rec').textContent = name + ' — EHR Record'; }, 800);
}

function exportFHIR() {
  const data = document.getElementById('fhir-preview').textContent;
  toast('FHIR R4 Bundle exported (JSON)', 'success');
}

function openNewRecord() { appNav('ehr'); }

/* ════════════════════════════════════════════
   BLOCKCHAIN EXPLORER
════════════════════════════════════════════ */
const CHAIN_STEPS = [
  { title:'Encrypt & Prepare Record', sub:'AES-256-GCM encryption + hash generation' },
  { title:'Upload to IPFS Network',   sub:'Distributing to 8 nodes across 4 regions' },
  { title:'Generate Content CID',     sub:'SHA-256 content-addressed identifier (CIDv1)' },
  { title:'Call Smart Contract',      sub:'EHR_Registry_v2.storeRecord() invocation' },
  { title:'Ethereum Confirmation',    sub:'Awaiting 12-block finality on mainnet' },
];

const CONTRACT_SRC = `<span class="sol-comment">// SPDX-License-Identifier: MIT</span>
<span class="sol-keyword">pragma</span> solidity ^0.8.19;

<span class="sol-keyword">contract</span> <span class="sol-func">EHR_Registry_v2</span> {

  <span class="sol-keyword">struct</span> <span class="sol-type">Record</span> {
    <span class="sol-type">string</span>  ipfsCID;
    <span class="sol-type">bytes32</span> dataHash;
    <span class="sol-type">address</span> physician;
    <span class="sol-type">uint256</span> timestamp;
    <span class="sol-type">bool</span>    isActive;
  }

  <span class="sol-keyword">mapping</span>(<span class="sol-type">bytes32</span> => <span class="sol-type">Record</span>) <span class="sol-keyword">public</span> records;

  <span class="sol-event">event</span> <span class="sol-func">RecordStored</span>(
    <span class="sol-type">bytes32</span> indexed patientId,
    <span class="sol-type">string</span>  ipfsCID,
    <span class="sol-type">uint256</span> timestamp
  );

  <span class="sol-event">event</span> <span class="sol-func">ConsentGranted</span>(
    <span class="sol-type">bytes32</span> indexed patientId,
    <span class="sol-type">address</span> grantee
  );

  <span class="sol-keyword">function</span> <span class="sol-func">storeRecord</span>(
    <span class="sol-type">bytes32</span> _patientId,
    <span class="sol-type">string</span> memory _cid,
    <span class="sol-type">bytes32</span> _dataHash
  ) <span class="sol-keyword">external</span> {
    records[_patientId] = Record(
      _cid, _dataHash,
      msg.sender, block.timestamp, <span class="sol-keyword">true</span>
    );
    <span class="sol-keyword">emit</span> <span class="sol-func">RecordStored</span>(
      _patientId, _cid, block.timestamp
    );
  }
}`;

function initBlockchain() {
  buildChainSteps();
  buildMempool();
  buildTopo();
  buildIPFSStatus();
  buildChainStats();
  document.getElementById('contract-vis').innerHTML = CONTRACT_SRC;
}

function buildChainStats() {
  const stats = [
    ['bc-block', '#' + STATE.blockNumber.toLocaleString()],
    ['bc-gas',   Math.round(STATE.gasPrice) + ' Gwei'],
    ['bc-tps',   (Math.random()*8+10).toFixed(1)],
    ['bc-pending', Math.floor(Math.random()*5+1)],
  ];
  stats.forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.textContent = val; });
}

function buildChainSteps() {
  const el = document.getElementById('chain-steps');
  if (!el) return;
  el.innerHTML = CHAIN_STEPS.map((s,i) => `
    <div class="mempool-item" id="cst-${i}" style="flex-direction:column;align-items:flex-start;padding:12px;">
      <div style="display:flex;align-items:center;width:100%;gap:10px;">
        <div id="cs-circle-${i}" style="width:32px;height:32px;border-radius:50%;border:2px solid var(--border);background:var(--base);display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;">${i+1}</div>
        <div style="flex:1;">
          <div style="font-size:.82rem;font-weight:700;">${s.title}</div>
          <div style="font-size:.68rem;color:var(--t3);">${s.sub}</div>
        </div>
        <div id="cs-status-${i}" style="font-family:'JetBrains Mono',monospace;font-size:.68rem;color:var(--t3);">PENDING</div>
      </div>
      <div id="cs-prog-${i}" style="width:0%;height:2px;background:var(--cyan);border-radius:1px;margin-top:8px;transition:width .3s;"></div>
    </div>`).join('');
}

let chainTimer;
function startBlockchain() {
  if (STATE.chainRunning) return;
  STATE.chainRunning = true;
  const btn = document.getElementById('start-chain-btn');
  btn.disabled = true; btn.textContent = '⏳ Processing...';

  const cid   = 'bafybeig' + randomHex(46);
  const tx    = '0x' + randomHex(64);
  const blk   = '#' + (STATE.blockNumber + Math.floor(Math.random()*3));
  const gas   = (21000 + Math.floor(Math.random()*15000)).toLocaleString();
  const ts    = new Date().toLocaleString();

  const delays = [0, 1200, 2600, 4100, 5800];
  delays.forEach((d, i) => {
    setTimeout(() => {
      // Activate step
      const circle = document.getElementById('cs-circle-'+i);
      const status = document.getElementById('cs-status-'+i);
      const prog   = document.getElementById('cs-prog-'+i);
      circle.style.borderColor = 'var(--cyan)';
      circle.style.background  = 'rgba(14,165,233,.12)';
      circle.style.boxShadow   = '0 0 12px rgba(14,165,233,.3)';
      status.style.color = 'var(--cyan)';
      status.textContent = ['ENCRYPTING…','UPLOADING…','HASHING…','EXECUTING…','CONFIRMING…'][i];
      prog.style.width = '60%';

      // Show CID after step 1
      if (i >= 1) {
        const res = document.getElementById('hash-result');
        res.classList.add('show');
        document.getElementById('res-cid').textContent = cid;
      }
      if (i >= 3) document.getElementById('res-tx').textContent = tx;

      // Finish previous
      if (i > 0) {
        const pc = document.getElementById('cs-circle-'+(i-1));
        const ps = document.getElementById('cs-status-'+(i-1));
        const pp = document.getElementById('cs-prog-'+(i-1));
        pc.textContent = '✓'; pc.style.background = 'var(--cyan)'; pc.style.color = '#ffffff'; pc.style.borderColor = 'var(--cyan)'; pc.style.boxShadow = 'none';
        ps.textContent = 'DONE ✓'; ps.style.color = 'var(--green)';
        pp.style.width = '100%';
      }
    }, d);
  });

  setTimeout(() => {
    // Final done
    const circle = document.getElementById('cs-circle-4');
    const status = document.getElementById('cs-status-4');
    const prog   = document.getElementById('cs-prog-4');
    circle.textContent = '✓'; circle.style.background = 'var(--cyan)'; circle.style.color = '#ffffff'; circle.style.borderColor = 'var(--cyan)'; circle.style.boxShadow = 'none';
    status.textContent = 'DONE ✓'; status.style.color = 'var(--green)';
    prog.style.width = '100%';

    // Final results
    document.getElementById('res-block').textContent = blk;
    document.getElementById('res-gas').textContent   = gas + ' units';
    document.getElementById('res-time').textContent  = ts;

    btn.textContent = '✅ Stored Successfully';
    btn.style.background = 'var(--green)'; btn.style.color = '#ffffff';
    toast('⛓ EHR record anchored to Ethereum blockchain!', 'success');
    STATE.chainRunning = false;
  }, 7500);
}

function buildMempool() {
  const el = document.getElementById('mempool-list');
  const cnt = document.getElementById('mp-count');
  if (!el) return;

  const types = ['EHR Store','FHIR Query','Consent Update','IPFS Pin','EHR Access'];
  const patients = PATIENTS.map(p => p.name);
  let pool = [];

  const render = () => {
    el.innerHTML = pool.slice(-8).reverse().map(t => `
      <div class="mempool-item ${t.confirmed?'confirmed':''}">
        <div class="dot ${t.confirmed?'d-green':'d-amber'} d-pulse"></div>
        <div style="flex:1;">
          <div class="mp-type">${t.type}</div>
          <div class="mp-hash">${t.hash}</div>
        </div>
        <div class="mp-gas">${t.gas} Gwei</div>
        <div class="mp-status"><div class="chip ${t.confirmed?'chip-green':'chip-amber'}" style="font-size:.6rem;">${t.confirmed?'✓':'Pending'}</div></div>
        <div class="mp-time">${t.time}</div>
      </div>`).join('');
    if (cnt) cnt.textContent = pool.filter(t => !t.confirmed).length + ' pending';
  };

  // Seed
  for (let i = 0; i < 4; i++) {
    pool.push({ type:types[i%types.length], hash:'0x'+randomHex(8)+'...', gas:Math.round(10+Math.random()*40), time:((i+1)*3)+'m ago', confirmed: i < 2 });
  }
  render();

  setInterval(() => {
    pool.push({ type:types[Math.floor(Math.random()*types.length)], hash:'0x'+randomHex(8)+'...', gas:Math.round(10+Math.random()*40), time:'just now', confirmed:false });
    if (pool.length > 12) { pool.shift(); }
    // Randomly confirm some
    pool = pool.map(t => ({ ...t, confirmed: t.confirmed || Math.random() < 0.15 }));
    render();
  }, 4000);
}

function buildTopo() {
  const svg = document.getElementById('topo-svg');
  if (!svg) return;
  const nodes = [
    { x:230,y:130,r:16,color:'var(--cyan)',  label:'Blockchain',  glow:true },
    { x:80, y:60, r:10,color:'var(--violet)',label:'Hospital A'  },
    { x:380,y:60, r:10,color:'var(--amber)', label:'Lab System'  },
    { x:60, y:200,r:10,color:'var(--rose)',  label:'Pharmacy'    },
    { x:400,y:200,r:10,color:'var(--sky)',   label:'Patient App' },
    { x:230,y:30, r:8, color:'var(--green)', label:'IPFS Net'    },
    { x:130,y:160,r:8, color:'var(--lime)',  label:'Clinic'      },
    { x:330,y:160,r:8, color:'var(--amber)', label:'Insurance'   },
  ];
  const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[0,7],[1,2],[3,4],[5,6]];

  let html = '';
  // Animated edges
  edges.forEach(([a,b]) => {
    html += `<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="rgba(14,165,233,0.12)" stroke-width="1.5" stroke-dasharray="5 4"/>`;
    // Packet animation
    html += `<circle r="3" fill="var(--cyan)" opacity=".8"><animateMotion dur="${1.5+Math.random()*2}s" repeatCount="indefinite" calcMode="linear"><mpath href="#edge-${a}-${b}"/></animateMotion></circle>`;
    html += `<path id="edge-${a}-${b}" d="M${nodes[a].x},${nodes[a].y} L${nodes[b].x},${nodes[b].y}" fill="none" visibility="hidden"/>`;
  });
  nodes.forEach(n => {
    if (n.glow) html += `<circle cx="${n.x}" cy="${n.y}" r="${n.r+8}" fill="none" stroke="${n.color}" stroke-width="1" opacity=".2"><animate attributeName="r" values="${n.r+4};${n.r+14};${n.r+4}" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".3;0;.3" dur="2s" repeatCount="indefinite"/></circle>`;
    html += `<circle cx="${n.x}" cy="${n.y}" r="${n.r}" fill="${n.color}" opacity=".85" style="cursor:pointer;" onclick="toast('Node: ${n.label}')"/>`;
    html += `<text x="${n.x}" y="${n.y+n.r+12}" text-anchor="middle" fill="var(--t3)" font-size="9" font-family="'JetBrains Mono',monospace">${n.label}</text>`;
  });
  svg.innerHTML = html;
}

function buildIPFSStatus() {
  const el = document.getElementById('ipfs-status');
  if (!el) return;
  const metrics = [
    {label:'Storage',  used:'4.2 GB', total:'10 GB', pct:42, color:'linear-gradient(90deg,var(--cyan),var(--violet))'},
    {label:'Bandwidth',used:'72%',    total:'100%',  pct:72, color:'linear-gradient(90deg,var(--amber),var(--rose))'},
    {label:'Replicas', used:'8/8',    total:'nodes', pct:100,color:'linear-gradient(90deg,var(--green),var(--cyan))'},
  ];
  el.innerHTML = metrics.map(m => `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
        <span style="font-size:.75rem;font-weight:700;color:var(--t2);">${m.label}</span>
        <span style="font-family:'JetBrains Mono',monospace;font-size:.72rem;color:var(--cyan);">${m.used} / ${m.total}</span>
      </div>
      <div class="prog"><div class="prog-bar" style="width:${m.pct}%;background:${m.color}"></div></div>
    </div>`).join('');
}

/* ════════════════════════════════════════════
   PATIENT 360
════════════════════════════════════════════ */
function initP360() {
  prLoad();
  // Merge static PATIENTS with registry patients for 360 view (registry takes priority by ID)
  const combined = [...PATIENTS];
  prPatients.forEach(rp => {
    if (!combined.find(sp => sp.id === rp.id)) {
      combined.push({
        id:rp.id, name:rp.name, age:prCalcAge(rp.dob), gender:rp.gender==='Female'?'F':'M',
        blood:rp.blood, diag:rp.condition, ward:rp.dept, status:rp.status==='Active'?'stable':'new',
        risk:rp.risk||30, emoji:'🧑', color:'cyan', meds:(rp.meds||'').split(',').map(m=>m.trim()),
        notes:rp.notes||'', records:3, hash:'bafybei...'+randomHex(4), icd:'Z00.0'
      });
    }
  });
  renderP360List(combined);
}

function renderP360List(list) {
  const el = document.getElementById('p360-list');
  if (!el) return;
  el.innerHTML = list.map(p => `
    <div class="p360-card ${STATE.selectedPatient===p.id?'on':''}" onclick="showPatient360('${p.id}')">
      <div class="p360c-head">
        <div class="p360c-av" style="background:rgba(14,165,233,.1);">${p.emoji}</div>
        <div>
          <div class="p360c-name">${p.name}</div>
          <div class="p360c-id">${p.id} · ${p.blood}</div>
        </div>
        <div class="chip ${p.status==='critical'?'chip-rose':p.status==='new'?'chip-amber':'chip-green'}" style="font-size:.6rem;margin-left:auto;">${p.status}</div>
      </div>
      <div style="font-size:.75rem;color:var(--t2);">${p.diag}</div>
      <div style="margin-top:6px;">
        <div class="prog"><div class="prog-bar" style="width:${p.risk}%;background:${p.risk>70?'var(--rose)':p.risk>40?'var(--amber)':'var(--cyan)'}"></div></div>
        <div style="font-size:.62rem;color:var(--t3);margin-top:3px;font-family:'JetBrains Mono',monospace;">Risk: ${p.risk}%</div>
      </div>
    </div>`).join('');
}

function showPatient360(id) {
  STATE.selectedPatient = id;
  renderP360List(PATIENTS);
  const p = PATIENTS.find(x => x.id === id);
  const el = document.getElementById('p360-detail');
  if (!p || !el) return;

  const riskColor = p.risk>70?'#fb7185':p.risk>40?'#ffb830':'#00f5c4';
  const circ = 2 * Math.PI * 38;
  const offset = circ - (p.risk/100)*circ;

  el.innerHTML = `
    <!-- Digital Twin Header -->
    <div class="twin-header">
      <div class="twin-avatar">${p.emoji}</div>
      <div style="flex:1;">
        <div class="twin-name">${p.name}</div>
        <div class="twin-id">DID: did:ethr:${p.hash.replace('bafybei...','0x')} · MRN: ${p.id}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <div class="chip chip-cyan">${p.blood}</div>
          <div class="chip chip-violet">${p.ward}</div>
          <div class="chip ${p.status==='critical'?'chip-rose':p.status==='new'?'chip-amber':'chip-green'}">${p.status}</div>
          <div class="chip chip-amber">Age ${p.age}</div>
        </div>
      </div>
      <div style="text-align:center;">
        <div class="risk-ring">
          <svg width="90" height="90" viewBox="0 0 90 90">
            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
            <circle cx="45" cy="45" r="38" fill="none" stroke="${riskColor}" stroke-width="6"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round" style="transition:stroke-dashoffset 1s;"/>
          </svg>
          <div class="risk-label">
            <div class="risk-pct" style="color:${riskColor}">${p.risk}%</div>
            <div class="risk-text">AI Risk</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Vitals chart -->
    <div class="card" style="padding:18px;margin-bottom:12px;">
      <div style="font-weight:800;font-size:.88rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">💓 Real-Time Vitals <div class="dot d-rose d-pulse"></div></div>
      <div class="g2">
        <div style="background:rgba(251,113,133,.05);border:1px solid rgba(251,113,133,.1);border-radius:10px;padding:14px;">
          <div style="font-size:.68rem;font-weight:700;color:var(--t3);margin-bottom:4px;">HEART RATE</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.4rem;font-weight:700;color:var(--rose);">${Math.round(68+Math.random()*10)}<span style="font-size:.7rem;font-weight:400"> bpm</span></div>
        </div>
        <div style="background:rgba(56,189,248,.05);border:1px solid rgba(56,189,248,.1);border-radius:10px;padding:14px;">
          <div style="font-size:.68rem;font-weight:700;color:var(--t3);margin-bottom:4px;">BLOOD PRESSURE</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.4rem;font-weight:700;color:var(--sky);">${110+Math.round(Math.random()*20)}/${70+Math.round(Math.random()*10)}<span style="font-size:.7rem;font-weight:400"> mmHg</span></div>
        </div>
        <div style="background:rgba(74,222,128,.05);border:1px solid rgba(74,222,128,.1);border-radius:10px;padding:14px;">
          <div style="font-size:.68rem;font-weight:700;color:var(--t3);margin-bottom:4px;">TEMPERATURE</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.4rem;font-weight:700;color:var(--green);">${(36.4+Math.random()*0.6).toFixed(1)}<span style="font-size:.7rem;font-weight:400"> °C</span></div>
        </div>
        <div style="background:rgba(163,230,53,.05);border:1px solid rgba(163,230,53,.1);border-radius:10px;padding:14px;">
          <div style="font-size:.68rem;font-weight:700;color:var(--t3);margin-bottom:4px;">SpO2</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:1.4rem;font-weight:700;color:var(--lime);">${96+Math.round(Math.random()*3)}<span style="font-size:.7rem;font-weight:400"> %</span></div>
        </div>
      </div>
    </div>

    <!-- Medications -->
    <div class="card" style="padding:18px;margin-bottom:12px;">
      <div style="font-weight:800;font-size:.88rem;margin-bottom:12px;">💊 Current Medications</div>
      ${p.meds.map(m => `
        <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(99,117,183,.05);border-radius:8px;margin-bottom:6px;">
          <div class="dot d-cyan"></div>
          <span style="font-size:.82rem;font-weight:600;">${m}</span>
          <div class="chip chip-green" style="font-size:.6rem;margin-left:auto;">Active</div>
        </div>`).join('')}
    </div>

    <!-- Audit trail + QR -->
    <div class="g2">
      <div class="card" style="padding:18px;">
        <div style="font-weight:800;font-size:.88rem;margin-bottom:12px;">📜 Blockchain Audit Trail</div>
        <div style="font-size:.78rem;color:var(--t2);margin-bottom:10px;">${p.records} records anchored on-chain</div>
        ${[
          {t:'Record Created',h:'0x4f2a...'},
          {t:'FHIR Bundle Stored',h:'0x9c1b...'},
          {t:'Consent Updated',h:'0x2e8f...'},
          {t:'Lab Results Added',h:'0x7d3c...'},
        ].map(e => `
          <div style="display:flex;gap:8px;padding:7px 0;border-bottom:1px solid rgba(99,117,183,.05);">
            <div class="dot d-cyan" style="margin-top:3px;flex-shrink:0;"></div>
            <div><div style="font-size:.78rem;font-weight:600;">${e.t}</div><div style="font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--violet);">${e.h}</div></div>
          </div>`).join('')}
      </div>
      <div class="card" style="padding:18px;text-align:center;">
        <div style="font-weight:800;font-size:.88rem;margin-bottom:12px;">📱 QR Record Access</div>
        <div class="qr-display" style="margin:0 auto 12px;">▓▓▓▓▓<br>▓░░░▓<br>▓░▓░▓<br>▓░░░▓<br>▓▓▓▓▓</div>
        <div style="font-size:.72rem;color:var(--t2);line-height:1.6;">Scan to access patient records. Time-limited token — expires in 15 minutes.</div>
        <button class="btn btn-cyan btn-xs" style="margin-top:10px;" onclick="toast('New QR token generated')">🔄 Refresh QR</button>
      </div>
    </div>

    <div style="display:flex;gap:8px;margin-top:14px;">
      <button class="btn btn-cyan btn-sm" onclick="loadPatientToEHR('${p.id}');appNav('ehr')">📋 New EHR Entry</button>
      <button class="btn btn-ghost btn-sm" onclick="appNav('blockchain')">⛓ View on Chain</button>
      <button class="btn btn-ghost btn-sm" onclick="toast('Consent management opened')">🛡 Consent Settings</button>
    </div>`;
}

function filterP360(q) {
  renderP360List(PATIENTS.filter(p => p.name.toLowerCase().includes(q.toLowerCase()) || p.diag.toLowerCase().includes(q.toLowerCase())));
}

function setP360Filter(btn, type) {
  document.querySelectorAll('#p360-filters button').forEach(b => { b.className = 'btn btn-ghost btn-xs'; });
  btn.className = 'btn btn-cyan btn-xs';
  renderP360List(type === 'all' ? PATIENTS : PATIENTS.filter(p => p.status === type));
}

/* ════════════════════════════════════════════
   INTEROP HUB
════════════════════════════════════════════ */
function initInterop() {
  buildInteropInstitutions();
  buildConsentList();
  buildTransferLog();
}

function buildInteropInstitutions() {
  ['interop-src','interop-dst'].forEach((id,idx) => {
    const el = document.getElementById(id);
    if (!el) return;
    const start = idx * 3;
    el.innerHTML = INSTITUTIONS.slice(start, start+3).map(inst => `
      <div class="institution-card" onclick="this.classList.toggle('selected');toast('${inst.name} ${this.classList.contains("selected")?"selected":"deselected"}')">
        <div class="ic-head">
          <div class="ic-logo" style="background:rgba(14,165,233,.1);">${inst.emoji}</div>
          <div>
            <div class="ic-name">${inst.name}</div>
            <div class="ic-type">${inst.type}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div class="ic-status"><div class="dot ${inst.status==='online'?'d-green':'d-rose'} d-pulse"></div> ${inst.status}</div>
          <div class="chip ${inst.status==='online'?'chip-green':'chip-rose'}" style="font-size:.6rem;">${inst.records.toLocaleString()} records</div>
        </div>
      </div>`).join('');
  });
}

function buildConsentList() {
  const el = document.getElementById('consent-list');
  if (!el) return;
  const consents = [
    {label:'Lab Results Access',    sub:'Regional Diagnostic Lab',   on:true },
    {label:'Radiology Sharing',     sub:'Radiology Centre',          on:true },
    {label:'Pharmacy Rx Access',    sub:'Metro Pharmacy Chain',      on:false},
    {label:'Research Data (anon.)', sub:'University Med School',     on:false},
    {label:'Emergency Access',      sub:'Any verified institution',  on:true },
  ];
  el.innerHTML = consents.map(c => `
    <div class="consent-row">
      <div><div class="cr-label">${c.label}</div><div class="cr-sub">${c.sub}</div></div>
      <div class="toggle-switch ${c.on?'on':''}" onclick="this.classList.toggle('on');toast('Consent updated: ${c.label}')"></div>
    </div>`).join('');
}

function buildTransferLog() {
  const el = document.getElementById('transfer-log');
  if (!el) return;
  const log = [
    {from:'City General',to:'Regional Lab',type:'Lab Order',records:3,status:'complete',time:'5m ago'},
    {from:'Regional Lab',to:'City General',type:'Results',  records:1,status:'complete',time:'12m ago'},
    {from:'City General',to:'Pharmacy',    type:'Rx',       records:2,status:'pending', time:'20m ago'},
    {from:'Radiology',   to:'City General',type:'DICOM',    records:1,status:'complete',time:'1h ago'},
  ];
  el.innerHTML = `<tr><th>From</th><th>To</th><th>Type</th><th>Records</th><th>Status</th><th>Time</th></tr>` +
    log.map(l => `<tr>
      <td style="font-weight:600;font-size:.8rem;">${l.from}</td>
      <td style="font-size:.8rem;">${l.to}</td>
      <td><div class="chip chip-cyan" style="font-size:.62rem;">${l.type}</div></td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.75rem;">${l.records}</td>
      <td><div class="chip ${l.status==='complete'?'chip-green':'chip-amber'}" style="font-size:.62rem;">${l.status}</div></td>
      <td style="color:var(--t3);font-size:.68rem;">${l.time}</td>
    </tr>`).join('');
}

function runFHIR() {
  const ep = document.getElementById('fhir-endpoint').value;
  const params = document.getElementById('fhir-params').value;
  const el = document.getElementById('fhir-sandbox-result');
  el.innerHTML = '<span style="color:var(--amber)">// Executing query...</span>';
  setTimeout(() => {
    const mock = { resourceType:"Bundle", type:"searchset",
      total: Math.floor(Math.random()*50+1),
      link:[{relation:"self",url:`https://fhir.mediledger.io${ep}?${params||'_format=json'}`}],
      entry: PATIENTS.slice(0,3).map(p => ({
        fullUrl:`https://fhir.mediledger.io/Patient/${p.id}`,
        resource:{ resourceType:"Patient", id:p.id, name:[{text:p.name}], birthDate:`198${p.age%10}-01-01`, gender:p.gender==='F'?'female':'male' }
      }))
    };
    el.innerHTML = syntaxHighlightJSON(JSON.stringify(mock, null, 2));
    toast(`FHIR query executed — ${mock.total} results`);
  }, 600);
}

/* ════════════════════════════════════════════
   ANALYTICS & AI
════════════════════════════════════════════ */
function initAnalytics() {
  buildPopChart();
  buildAIPredictions();
  buildDrugHeatmap();
  buildDiagDist();
}

function buildPopChart() {
  const svg = document.getElementById('pop-chart');
  if (!svg) return;
  const months = ['Jan','Feb','Mar','Apr','May','Jun'];
  const data = { diabetes:[34,38,42,41,45,48], hypertension:[28,31,29,33,35,38], asthma:[18,16,20,19,22,21] };
  const W=400, H=160, maxV=60;
  const colors = ['var(--cyan)','var(--amber)','var(--violet)'];
  const keys = Object.keys(data);
  let html = '';
  // Grid
  [30,60,90].forEach(p => {
    const y = H - (p/100)*H;
    html += `<line x1="30" y1="${y}" x2="${W}" y2="${y}" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>`;
    html += `<text x="25" y="${y+4}" text-anchor="end" font-size="8" fill="var(--t3)">${p}</text>`;
  });
  keys.forEach((k,ki) => {
    const vals = data[k];
    const gap = (W-40) / (vals.length-1);
    const pts = vals.map((v,i) => `${30+i*gap},${H-(v/maxV)*H}`).join(' ');
    const first = `30,${H-(vals[0]/maxV)*H}`, last = `${30+(vals.length-1)*gap},${H-(vals[vals.length-1]/maxV)*H}`;
    html += `<polyline points="${pts}" fill="none" stroke="${colors[ki]}" stroke-width="2" opacity=".85"/>`;
    html += `<polygon points="${first} ${pts} ${last} ${30+(vals.length-1)*gap},${H} 30,${H}" fill="${colors[ki]}" opacity=".06"/>`;
  });
  svg.innerHTML = html;
  const labels = document.getElementById('pop-labels');
  if (labels) labels.innerHTML = months.map(m => `<span style="flex:1;text-align:center;font-size:.65rem;color:var(--t3)">${m}</span>`).join('');
}

function buildAIPredictions() {
  const el = document.getElementById('ai-predictions');
  if (!el) return;
  el.innerHTML = PATIENTS.sort((a,b) => b.risk-a.risk).map(p => `
    <div class="pred-row">
      <div class="pred-avatar" style="background:rgba(14,165,233,.1);">${p.emoji}</div>
      <div style="flex:1;"><div class="pred-name" style="font-size:.78rem;">${p.name}</div><div style="font-size:.65rem;color:var(--t3);">${p.diag}</div></div>
      <div class="pred-bar-wrap"><div class="pred-bar" style="width:${p.risk}%;background:${p.risk>70?'var(--rose)':p.risk>40?'var(--amber)':'var(--cyan)'}"></div></div>
      <div class="pred-risk" style="color:${p.risk>70?'var(--rose)':p.risk>40?'var(--amber)':'var(--cyan)'}">${p.risk}%</div>
    </div>`).join('');
}

function buildDrugHeatmap() {
  const el = document.getElementById('drug-heatmap');
  if (!el) return;
  const drugs = ['Warfarin','Aspirin','Metformin','Lisinopril','Digoxin','Furosemide'];
  const matrix = [
    [0,9,2,1,3,2],
    [9,0,1,0,2,1],
    [2,1,0,1,0,0],
    [1,0,1,0,0,2],
    [3,2,0,0,0,8],
    [2,1,0,2,8,0],
  ];
  const colors = ['rgba(74,222,128,.1)','rgba(255,184,48,.3)','rgba(255,184,48,.6)','rgba(251,113,133,.4)','rgba(251,113,133,.8)'];

  // Header row
  let html = `<div style="display:grid;grid-template-columns:60px repeat(6,1fr);gap:2px;margin-bottom:2px;">
    <div></div>${drugs.map(d=>`<div style="font-size:.6rem;font-weight:700;color:var(--t3);text-align:center;overflow:hidden;white-space:nowrap;">${d.slice(0,5)}</div>`).join('')}</div>`;
  matrix.forEach((row, i) => {
    html += `<div style="display:grid;grid-template-columns:60px repeat(6,1fr);gap:2px;margin-bottom:2px;">
      <div style="font-size:.6rem;font-weight:700;color:var(--t3);display:flex;align-items:center;">${drugs[i].slice(0,5)}</div>
      ${row.map((v,j) => `<div class="hm-cell" style="background:${v===0?'rgba(99,117,183,.05)':colors[Math.min(4,Math.floor(v/2))]};color:${v>5?'var(--rose)':v>3?'var(--amber)':'var(--t3)'};font-size:.62rem;height:24px;" onclick="toast('${drugs[i]} + ${drugs[j]}: Severity ${v}/10')" title="${drugs[i]} + ${drugs[j]}">${v>0?v:''}</div>`).join('')}
    </div>`;
  });
  el.innerHTML = html;
}

function buildDiagDist() {
  const el = document.getElementById('diag-dist');
  const svg = document.getElementById('diag-chart');
  if (!el || !svg) return;
  const data = [
    {label:'Cardiology', pct:32, color:'var(--rose)'},
    {label:'Neurology',  pct:18, color:'var(--violet)'},
    {label:'Endocrine',  pct:24, color:'var(--cyan)'},
    {label:'Respiratory',pct:14, color:'var(--sky)'},
    {label:'Other',      pct:12, color:'var(--amber)'},
  ];
  el.innerHTML = data.map(d => `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
      <div style="width:10px;height:10px;border-radius:2px;background:${d.color};flex-shrink:0;"></div>
      <span style="font-size:.78rem;font-weight:600;flex:1;">${d.label}</span>
      <div style="width:60px;height:5px;background:rgba(240,244,255,.8);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${d.pct}%;background:${d.color};border-radius:3px;"></div></div>
      <span style="font-size:.72rem;color:var(--t3);font-family:'JetBrains Mono',monospace;">${d.pct}%</span>
    </div>`).join('');

  // Pie chart
  let html = ''; let startAngle = -Math.PI/2;
  data.forEach(d => {
    const angle = (d.pct/100) * 2*Math.PI;
    const x1 = 100 + 80*Math.cos(startAngle), y1 = 100 + 80*Math.sin(startAngle);
    const x2 = 100 + 80*Math.cos(startAngle+angle), y2 = 100 + 80*Math.sin(startAngle+angle);
    const lg = angle > Math.PI ? 1 : 0;
    html += `<path d="M100,100 L${x1},${y1} A80,80 0 ${lg},1 ${x2},${y2} Z" fill="${d.color}" opacity=".8" stroke="#ffffff" stroke-width="2"/>`;
    startAngle += angle;
  });
  html += `<circle cx="100" cy="100" r="40" fill="var(--base)"/>`;
  html += `<text x="100" y="96" text-anchor="middle" fill="var(--t0)" font-size="11" font-weight="700">384</text>`;
  html += `<text x="100" y="108" text-anchor="middle" fill="var(--t3)" font-size="8">patients</text>`;
  svg.innerHTML = html;
}

/* ════════════════════════════════════════════
   NOTIFICATIONS
════════════════════════════════════════════ */
function buildNotifications() {
  STATE.notifications = [
    {icon:'⚠️',bg:'var(--roseA)',title:'Drug Interaction Alert',desc:'Warfarin + Aspirin flagged for Marcus Webb. Review immediately.',time:'2m ago',unread:true},
    {icon:'⛓',bg:'var(--cyanA10)',title:'TX Confirmed',desc:'EHR record for Amara Osei anchored to block #19,284,509.',time:'5m ago',unread:true},
    {icon:'🌐',bg:'var(--violetA)',title:'FHIR Query Received',desc:'Regional Lab requesting patient observations for Li Wei.',time:'12m ago',unread:true},
    {icon:'🛡',bg:'var(--amberA)',title:'Consent Request',desc:'Sofia Reyes has updated her data sharing permissions.',time:'25m ago',unread:false},
    {icon:'💾',bg:'var(--greenA)',title:'IPFS Replication',desc:'All 8 IPFS nodes confirmed pinning — Kenji Tanaka records.',time:'1h ago',unread:false},
  ];
  const el = document.getElementById('notif-list');
  if (!el) return;
  el.innerHTML = STATE.notifications.map(n => `
    <div class="notif-item ${n.unread?'unread':''}">
      <div class="ni-icon" style="background:${n.bg}">${n.icon}</div>
      <div style="flex:1;">
        <div class="ni-title">${n.title} ${n.unread?'<span style="width:6px;height:6px;border-radius:50%;background:var(--cyan);display:inline-block;margin-left:4px;"></span>':''}</div>
        <div class="ni-desc">${n.desc}</div>
        <div class="ni-time">${n.time}</div>
      </div>
    </div>`).join('');
}

function toggleNotif() {
  document.getElementById('notif-panel').classList.toggle('open');
}

/* ════════════════════════════════════════════
   SETTINGS HELPERS
════════════════════════════════════════════ */
function highlightNav(el) {
  document.querySelectorAll('.snav-item').forEach(e => e.classList.remove('on'));
  el.classList.add('on');
  toast('Section: ' + el.textContent.trim());
}

/* ════════════════════════════════════════════
   UTILS
════════════════════════════════════════════ */
function randomHex(n) { return Array.from({length:n},()=>Math.floor(Math.random()*16).toString(16)).join(''); }

/* Modal helpers */
function openModal(html) { document.getElementById('modal-content').innerHTML = html; document.getElementById('modal-overlay').classList.add('open'); }
function closeModal() { document.getElementById('modal-overlay').classList.remove('open'); }
function openDemo() { goto('auth'); toast('Demo: use any credentials to sign in'); }

/* Keyboard shortcuts */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); document.getElementById('notif-panel').classList.remove('open'); }
  if (e.key === 'Enter' && STATE.currentPage === 'auth') doLogin();
});

/* ════════════════════════════════════════════
   PATIENT REGISTRY — DATA LAYER (localStorage)
════════════════════════════════════════════ */
const PR_KEY = 'mediledger_patients_v2';
let prPatients = [];
let prEditingId = null;
let prFilter = 'all';

function prLoad() {
  try {
    const raw = localStorage.getItem(PR_KEY);
    if (raw) prPatients = JSON.parse(raw);
  } catch(e) { prPatients = []; }
  if (prPatients.length === 0) prSeed();
}

function prSave() {
  try { localStorage.setItem(PR_KEY, JSON.stringify(prPatients)); } catch(e) {}
}

function prSeed() {
  const now = Date.now();
  prPatients = [
    { id:'ML-001', name:'Arjun Patel',     dob:'1985-04-12', gender:'Male',   blood:'O+',  phone:'+91 98765 43210', email:'arjun@mail.com',  doctor:'Dr. Chen Wei',   dept:'Cardiology',      condition:'Hypertension, Arrhythmia',        meds:'Amlodipine 5mg, Metoprolol 50mg',             allergies:'None',         notes:'Follow up every 3 months. ECG scheduled.',               status:'Active',   createdAt:now-864000000, risk:64 },
    { id:'ML-002', name:'Priya Singh',      dob:'1992-08-25', gender:'Female', blood:'B+',  phone:'+91 91234 56789', email:'priya@mail.com',  doctor:'Dr. Rajan',      dept:'Neurology',       condition:'Migraine, Anxiety Disorder',       meds:'Topiramate 100mg, Escitalopram 10mg',          allergies:'Penicillin',   notes:'Reports frequent aura episodes.',                         status:'Active',   createdAt:now-432000000, risk:38 },
    { id:'ML-003', name:'Ravi Kumar',       dob:'1978-01-30', gender:'Male',   blood:'A-',  phone:'+91 99887 76655', email:'ravi@mail.com',   doctor:'Dr. Mehta',      dept:'Orthopaedics',    condition:'Lumbar Spondylosis',               meds:'Diclofenac 75mg, Muscle relaxants',            allergies:'Sulfa drugs',  notes:'Physiotherapy ongoing. X-ray done.',                      status:'Inactive', createdAt:now-200000000, risk:22 },
    { id:'ML-004', name:'Anita Desai',      dob:'2000-11-05', gender:'Female', blood:'AB+', phone:'+91 90123 45678', email:'anita@mail.com',  doctor:'Dr. Chen Wei',   dept:'Endocrinology',   condition:'Type 2 Diabetes',                  meds:'Metformin 500mg, Insulin Glargine',            allergies:'None',         notes:'HbA1c 7.8, dietary counselling advised.',                 status:'Active',   createdAt:now-50000000,  risk:46 },
    { id:'ML-005', name:'Amara Osei',       dob:'1990-03-14', gender:'Female', blood:'AB+', phone:'+233 55 123 4567',email:'amara@mail.com',  doctor:'Dr. Chen Wei',   dept:'Endocrinology',   condition:'Type 2 Diabetes Mellitus',          meds:'Metformin 500mg, Lisinopril 10mg',             allergies:'None',         notes:'Well-controlled T2DM. Last HbA1c: 7.2%.',                 status:'Active',   createdAt:now-172800000, risk:42 },
    { id:'ML-006', name:'Li Wei',           dob:'1972-07-19', gender:'Male',   blood:'O+',  phone:'+86 138 0013 8000',email:'liwei@mail.com', doctor:'Dr. Shah',       dept:'Cardiology',      condition:'Hypertensive Heart Disease',        meds:'Amlodipine 5mg, Atenolol 50mg, Aspirin 75mg', allergies:'None',         notes:'BP poorly controlled. Echo shows LVH.',                   status:'Active',   createdAt:now-259200000, risk:78 },
    { id:'ML-007', name:'Marcus Webb',      dob:'1957-09-02', gender:'Male',   blood:'A+',  phone:'+1 555 012 3456',  email:'mwebb@mail.com', doctor:'Dr. Chen Wei',   dept:'ICU',             condition:'Post-Cardiac Surgery Care',         meds:'Warfarin 5mg, Furosemide 40mg, Digoxin 0.125mg',allergies:'Aspirin',    notes:'Day 3 post-CABG. Haemodynamically stable.',               status:'Active',   createdAt:now-86400000,  risk:91 },
    { id:'ML-008', name:'Sofia Reyes',      dob:'1996-12-20', gender:'Female', blood:'B+',  phone:'+34 612 345 678',  email:'sofia@mail.com', doctor:'Dr. Nair',       dept:'Pulmonology',     condition:'Moderate Persistent Asthma',        meds:'Salbutamol 100mcg, Fluticasone 250mcg',        allergies:'Ibuprofen',    notes:'Well-managed on ICS/SABA regimen.',                       status:'Active',   createdAt:now-345600000, risk:31 },
  ];
  prSave();
}

function prCalcAge(dob) {
  return Math.floor((Date.now() - new Date(dob)) / (365.25*24*3600*1000));
}

function prInitials(name) {
  return name.split(' ').map(x => x[0]).join('').slice(0, 2).toUpperCase();
}

/* ── PATIENT REGISTRY PAGE ── */
function initPatients() {
  prLoad();
  renderPRStats();
  renderPRTable('');
}

function renderPRStats() {
  const el = document.getElementById('pr-stats');
  if (!el) return;
  const total  = prPatients.length;
  const active = prPatients.filter(p => p.status === 'Active').length;
  const depts  = new Set(prPatients.map(p => p.dept)).size;
  const today  = new Date().toDateString();
  const todayN = prPatients.filter(p => new Date(p.createdAt).toDateString() === today).length;
  const items = [
    { icon:'👥', label:'Total Patients',  value:total,  color:'sc-cyan',   vcolor:'var(--cyan)'   },
    { icon:'✅', label:'Active Records',  value:active, color:'sc-violet', vcolor:'var(--green)'  },
    { icon:'🏥', label:'Departments',     value:depts,  color:'sc-amber',  vcolor:'var(--amber)'  },
    { icon:'📅', label:'Added Today',     value:todayN, color:'sc-rose',   vcolor:'var(--rose)'   },
  ];
  el.innerHTML = items.map((s,i) => `
    <div class="stat-card ${s.color} a${i+1}">
      <div class="stat-icon" style="font-size:1.3rem;">${s.icon}</div>
      <div>
        <div class="stat-label">${s.label}</div>
        <div class="stat-value" style="color:${s.vcolor};font-size:1.8rem;">${s.value}</div>
      </div>
    </div>`).join('');
}

function setPRFilter(btn, filter) {
  document.querySelectorAll('.pr-filter-chip').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  prFilter = filter;
  renderPRTable(document.getElementById('pr-search').value || '');
}

function renderPRTable(q = '') {
  const tbody = document.getElementById('pr-tbody');
  if (!tbody) return;
  prLoad();
  let list = prPatients;
  if (prFilter !== 'all') list = list.filter(p => p.status === prFilter);
  if (q) list = list.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.id.toLowerCase().includes(q.toLowerCase()) ||
    p.condition.toLowerCase().includes(q.toLowerCase()) ||
    (p.doctor||'').toLowerCase().includes(q.toLowerCase())
  );
  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--t3);padding:32px;">No patients found.</td></tr>`;
    return;
  }
  const riskColor = r => r > 70 ? 'var(--rose)' : r > 40 ? 'var(--amber)' : 'var(--cyan)';
  tbody.innerHTML = list.map(p => `
    <tr style="cursor:pointer;" onclick="openPatientDetail('${p.id}')">
      <td>
        <div style="display:flex;align-items:center;gap:10px;">
          <div class="pt-av">${prInitials(p.name)}</div>
          <div>
            <div style="font-weight:700;font-size:.85rem;">${p.name}</div>
            <div style="font-size:.68rem;color:var(--t3);">${p.email||''}</div>
          </div>
        </div>
      </td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.75rem;color:var(--violet);">${p.id}</td>
      <td>
        <span style="font-weight:600;font-size:.82rem;">${prCalcAge(p.dob)}y</span>
        &nbsp;<div class="chip chip-rose" style="font-size:.62rem;display:inline-flex;">${p.blood}</div>
      </td>
      <td><div class="chip chip-sky" style="font-size:.65rem;">${(p.condition||'—').split(',')[0]}</div></td>
      <td style="font-size:.8rem;font-weight:600;">${p.doctor||'—'}</td>
      <td style="font-size:.78rem;color:var(--t2);">${p.dept||'—'}</td>
      <td>
        <div style="display:flex;align-items:center;gap:6px;">
          <div class="dot ${p.status==='Active'?'d-green':'d-rose'}"></div>
          <span style="font-size:.75rem;font-weight:700;">${p.status}</span>
        </div>
      </td>
      <td onclick="event.stopPropagation()">
        <div style="display:flex;gap:5px;">
          <button class="btn btn-ghost btn-xs" onclick="openPatientDetail('${p.id}')">View</button>
          <button class="btn btn-cyan   btn-xs" onclick="openEditPatient('${p.id}')">Edit</button>
          <button class="btn btn-danger btn-xs" onclick="deletePatientRecord('${p.id}')">Del</button>
        </div>
      </td>
    </tr>`).join('');
}

/* ── ADD / EDIT PATIENT ── */
function openAddPatient() {
  prEditingId = null;
  document.getElementById('add-patient-title').innerHTML = 'Add <span class="glow-cyan">New Patient</span>';
  ['pf-name','pf-phone','pf-email','pf-doctor','pf-condition','pf-meds','pf-allergies','pf-notes'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  const dobEl = document.getElementById('pf-dob'); if (dobEl) dobEl.value = '';
  pfUploadedFiles = [];
  const fl = document.getElementById('pf-file-list'); if (fl) fl.innerHTML = '';
  const fi = document.getElementById('pf-file-input'); if (fi) fi.value = '';
  document.getElementById('add-patient-overlay').classList.add('open');
}

function openEditPatient(id) {
  prLoad();
  const p = prPatients.find(x => x.id === id);
  if (!p) return;
  prEditingId = id;
  document.getElementById('add-patient-title').innerHTML = 'Edit <span class="glow-cyan">Patient Record</span>';
  const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val||''; };
  set('pf-name', p.name); set('pf-dob', p.dob); set('pf-gender', p.gender);
  set('pf-blood', p.blood); set('pf-phone', p.phone); set('pf-email', p.email);
  set('pf-doctor', p.doctor); set('pf-dept', p.dept); set('pf-condition', p.condition);
  set('pf-meds', p.meds); set('pf-allergies', p.allergies); set('pf-notes', p.notes);
  document.getElementById('add-patient-overlay').classList.add('open');
}

function closeAddPatient() {
  document.getElementById('add-patient-overlay').classList.remove('open');
  document.getElementById('pf-file-list').innerHTML = '';
  document.getElementById('pf-file-input').value = '';
  pfUploadedFiles = [];
}

let pfUploadedFiles = [];

function handlePatientFileSelect(files) {
  for (const f of files) pfUploadedFiles.push(f);
  renderPatientFileList();
}

function handlePatientFileDrop(files) {
  for (const f of files) pfUploadedFiles.push(f);
  renderPatientFileList();
}

function renderPatientFileList() {
  const list = document.getElementById('pf-file-list');
  if (!pfUploadedFiles.length) { list.innerHTML = ''; return; }
  list.innerHTML = pfUploadedFiles.map((f, i) => {
    const ext = f.name.split('.').pop().toUpperCase();
    const size = f.size > 1048576 ? (f.size/1048576).toFixed(1)+'MB' : (f.size/1024).toFixed(0)+'KB';
    const iconMap = {PDF:'📄',JPG:'🖼',JPEG:'🖼',PNG:'🖼',DCM:'🩻',DOC:'📝',DOCX:'📝'};
    const icon = iconMap[ext] || '📎';
    return `<div style="display:flex;align-items:center;gap:10px;background:rgba(14,165,233,0.06);border:1px solid rgba(14,165,233,0.18);border-radius:8px;padding:8px 12px;">
      <span style="font-size:1.1rem;">${icon}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-size:.78rem;font-weight:700;color:var(--t1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${f.name}</div>
        <div style="font-size:.65rem;color:var(--t3);">${ext} · ${size}</div>
      </div>
      <button onclick="pfUploadedFiles.splice(${i},1);renderPatientFileList()" style="background:none;border:none;color:var(--rose);font-size:.85rem;cursor:pointer;padding:2px 6px;border-radius:4px;" title="Remove">✕</button>
    </div>`;
  }).join('');
}


function savePatientRecord() {
  const g = id => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
  const name = g('pf-name'), dob = g('pf-dob'), condition = g('pf-condition');
  if (!name || !dob) { toast('Name and Date of Birth are required', 'error'); return; }

  prLoad();
  if (prEditingId) {
    const idx = prPatients.findIndex(p => p.id === prEditingId);
    if (idx > -1) {
      prPatients[idx] = { ...prPatients[idx],
        name, dob, gender:g('pf-gender'), blood:g('pf-blood'), phone:g('pf-phone'),
        email:g('pf-email'), doctor:g('pf-doctor'), dept:g('pf-dept'),
        condition:g('pf-condition'), meds:g('pf-meds'), allergies:g('pf-allergies'), notes:g('pf-notes'),
      };
    }
    toast('✅ Patient record updated', 'success');
  } else {
    const newId = 'ML-' + String(prPatients.length + 1).padStart(3, '0');
    prPatients.push({
      id:newId, name, dob, gender:g('pf-gender'), blood:g('pf-blood'), phone:g('pf-phone'),
      email:g('pf-email'), doctor:g('pf-doctor'), dept:g('pf-dept'),
      condition:g('pf-condition'), meds:g('pf-meds'), allergies:g('pf-allergies'), notes:g('pf-notes'),
      status:'Active', createdAt:Date.now(),
      risk: Math.floor(Math.random()*60+10),
      filesCount: pfUploadedFiles.length,
    });
    const fileMsg = pfUploadedFiles.length ? ` · ${pfUploadedFiles.length} file(s) uploaded` : '';
    toast('✅ Patient added & anchored to blockchain' + fileMsg, 'success');
  }
  prSave();
  closeAddPatient();

  // Refresh whichever views are active
  renderPRStats();
  renderPRTable('');
  if (STATE.appPage === 'qrcodes') initQRCodes();
  if (STATE.appPage === 'ledger')  renderLedgerPage();
}

function deletePatientRecord(id) {
  if (!confirm('Permanently delete this patient record?')) return;
  prLoad();
  prPatients = prPatients.filter(p => p.id !== id);
  prSave();
  renderPRStats();
  renderPRTable('');
  toast('🗑 Patient record deleted', 'error');
}

/* ── PATIENT DETAIL MODAL ── */
function openPatientDetail(id) {
  prLoad();
  const p = prPatients.find(x => x.id === id);
  if (!p) return;

  const age = prCalcAge(p.dob);
  const riskC = p.risk > 70 ? 'var(--rose)' : p.risk > 40 ? 'var(--amber)' : 'var(--cyan)';
  const circ = 2 * Math.PI * 30;
  const offset = circ - (p.risk / 100) * circ;

  document.getElementById('patient-detail-content').innerHTML = `
    <!-- Header -->
    <div class="pd-header">
      <div class="pd-avatar">${prInitials(p.name)}</div>
      <div style="flex:1;">
        <div class="pd-name">${p.name}</div>
        <div class="pd-sub">${p.dept} · ${p.doctor||'—'} · ${age} yrs old</div>
        <div class="pd-tags">
          <div class="chip chip-rose"  style="font-size:.65rem;">${p.blood}</div>
          <div class="chip chip-violet" style="font-size:.65rem;">${p.dept}</div>
          <div class="chip ${p.status==='Active'?'chip-green':'chip-rose'}" style="font-size:.65rem;">${p.status}</div>
          <div class="chip chip-sky"   style="font-size:.65rem;">${p.gender}</div>
        </div>
      </div>
      <!-- Risk ring -->
      <div style="text-align:center;flex-shrink:0;">
        <div style="position:relative;width:74px;height:74px;">
          <svg width="74" height="74" viewBox="0 0 74 74" style="transform:rotate(-90deg);">
            <circle cx="37" cy="37" r="30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="5"/>
            <circle cx="37" cy="37" r="30" fill="none" stroke="${riskC}" stroke-width="5"
              stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="font-size:.95rem;font-weight:800;font-family:'JetBrains Mono',monospace;color:${riskC};">${p.risk}%</span>
            <span style="font-size:.55rem;font-weight:700;color:var(--t3);text-transform:uppercase;">AI Risk</span>
          </div>
        </div>
      </div>
      <!-- QR Code box -->
      <div class="pd-qr-box">
        <div id="pd-qr-render" style="display:flex;align-items:center;justify-content:center;min-height:100px;"></div>
        <div style="font-size:.65rem;color:var(--t3);margin-top:6px;font-family:'JetBrains Mono',monospace;">${p.id}</div>
        <div style="font-size:.6rem;color:var(--t3);margin-top:2px;">Scan for emergency access</div>
      </div>
    </div>

    <!-- Info grid -->
    <div class="pd-grid">
      <div class="pd-item"><div class="pd-item-label">Patient ID</div><div class="pd-item-value mono" style="font-family:'JetBrains Mono',monospace;color:var(--violet);">${p.id}</div></div>
      <div class="pd-item"><div class="pd-item-label">Date of Birth</div><div class="pd-item-value">${p.dob} (${age} yrs)</div></div>
      <div class="pd-item"><div class="pd-item-label">Phone</div><div class="pd-item-value">${p.phone||'—'}</div></div>
      <div class="pd-item"><div class="pd-item-label">Email</div><div class="pd-item-value" style="font-size:.82rem;">${p.email||'—'}</div></div>
      <div class="pd-item full"><div class="pd-item-label">Diagnosis / Condition</div><div class="pd-item-value">${p.condition||'—'}</div></div>
      <div class="pd-item full"><div class="pd-item-label">Current Medications</div><div class="pd-item-value" style="font-size:.82rem;color:var(--cyan);">${p.meds||'—'}</div></div>
      <div class="pd-item"><div class="pd-item-label">Known Allergies</div><div class="pd-item-value" style="color:var(--rose);">${p.allergies||'None known'}</div></div>
      <div class="pd-item"><div class="pd-item-label">Department</div><div class="pd-item-value">${p.dept}</div></div>
      ${p.notes ? `<div class="pd-item full"><div class="pd-item-label">Clinical Notes</div><div class="pd-item-value" style="font-size:.82rem;line-height:1.65;color:var(--t2);">${p.notes}</div></div>` : ''}
    </div>

    <!-- Blockchain timeline -->
    <div class="pd-timeline">
      <div class="pd-tl-label">⛓ Blockchain Audit Trail</div>
      <div class="pd-tl-item">
        <div class="pd-tl-dot" style="background:var(--cyan);"></div>
        <div><div class="pd-tl-msg">Record created & uploaded to IPFS</div><div class="pd-tl-sub">${new Date(p.createdAt).toLocaleString()}</div></div>
      </div>
      <div class="pd-tl-item">
        <div class="pd-tl-dot" style="background:var(--green);"></div>
        <div><div class="pd-tl-msg">Ethereum transaction confirmed</div><div class="pd-tl-sub">Block #${(19000000+Math.floor(Math.random()*300000)).toLocaleString()} · 0x${randomHex(14)}…</div></div>
      </div>
      <div class="pd-tl-item">
        <div class="pd-tl-dot" style="background:var(--amber);"></div>
        <div><div class="pd-tl-msg">IPFS CID pinned to 8 nodes</div><div class="pd-tl-sub">bafybei${randomHex(32)}…</div></div>
      </div>
      <div class="pd-tl-item">
        <div class="pd-tl-dot" style="background:var(--violet);"></div>
        <div><div class="pd-tl-msg">QR code generated & distributed</div><div class="pd-tl-sub">${new Date(p.createdAt + 5000).toLocaleString()}</div></div>
      </div>
    </div>

    <!-- Action buttons -->
    <div style="padding:0 18px 20px;display:flex;gap:8px;flex-wrap:wrap;">
      <button class="btn btn-cyan btn-sm"   onclick="closePatientDetail();openEditPatient('${p.id}')">✏️ Edit Record</button>
      <button class="btn btn-ghost btn-sm"  onclick="loadPatientToEHR('${p.id}');closePatientDetail();appNav('ehr')">📋 New EHR Entry</button>
      <button class="btn btn-violet btn-sm" onclick="toast('Consent settings opened')">🛡 Consent Settings</button>
      <button class="btn btn-ghost btn-sm"  onclick="closePatientDetail()">Close</button>
    </div>
  `;

  document.getElementById('patient-detail-overlay').classList.add('open');

  // Generate QR code
  setTimeout(() => {
    const qrEl = document.getElementById('pd-qr-render');
    if (!qrEl) return;
    qrEl.innerHTML = '';
    const qrData = JSON.stringify({ id:p.id, name:p.name, blood:p.blood, condition:p.condition, doctor:p.doctor, phone:p.phone, allergies:p.allergies });
    try {
      new QRCode(qrEl, { text:qrData, width:110, height:110, colorDark:'#020509', colorLight:'#f0f6ff', correctLevel:QRCode.CorrectLevel.M });
    } catch(e) {
      qrEl.innerHTML = '<div style="width:110px;height:110px;background:rgba(255,255,255,0.06);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;">📱</div>';
    }
  }, 80);
}

function closePatientDetail() {
  document.getElementById('patient-detail-overlay').classList.remove('open');
}

/* ── Also wire patient detail from Patient 360 list to new PR data ── */
function loadPRPatientToEHR(id) {
  prLoad();
  const p = prPatients.find(x => x.id === id);
  if (!p) return;
  const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val||''; };
  set('f-name', p.name); set('f-blood', p.blood); set('f-diag', p.condition);
  set('f-doc', p.doctor||'Dr. Chen Wei'); set('f-notes', p.notes||'');
  STATE.meds = (p.meds||'').split(',').map(m=>m.trim()).filter(Boolean);
  renderMeds(); checkDrugInteractions(); updateFHIR();
  toast(`Loaded: ${p.name}`, 'success');
}

/* ── QR CODES PAGE ── */
function initQRCodes() {
  prLoad();
  const grid = document.getElementById('qr-cards-grid');
  if (!grid) return;
  grid.innerHTML = prPatients.map(p => `
    <div class="qr-card a1" onclick="openPatientDetail('${p.id}')">
      <div class="pt-av" style="width:48px;height:48px;font-size:1rem;border-radius:12px;">${prInitials(p.name)}</div>
      <div class="qr-card-name">${p.name}</div>
      <div class="qr-card-id">${p.id}</div>
      <div id="qrc-${p.id}" style="background:#fff;border-radius:8px;padding:6px;display:flex;align-items:center;justify-content:center;min-height:90px;"></div>
      <div style="font-size:.7rem;color:var(--t2);">${(p.condition||'—').split(',')[0]} · ${p.blood}</div>
      <div class="chip ${p.status==='Active'?'chip-green':'chip-rose'}" style="font-size:.6rem;">${p.status}</div>
    </div>`).join('');

  // Generate all QRs after DOM update
  setTimeout(() => {
    prPatients.forEach(p => {
      const el = document.getElementById('qrc-'+p.id);
      if (!el) return;
      el.innerHTML = '';
      const qrData = `ID:${p.id} | ${p.name} | ${p.blood} | ${(p.condition||'').split(',')[0]} | Dr:${p.doctor||'—'} | Allergy:${p.allergies||'None'}`;
      try {
        new QRCode(el, { text:qrData, width:90, height:90, colorDark:'#020509', colorLight:'#f0f6ff', correctLevel:QRCode.CorrectLevel.L });
      } catch(e) { el.innerHTML = '<div style="font-size:1.8rem;">📱</div>'; }
    });
  }, 100);
}

/* ── LEDGER PAGE ── */
function initLedgerPage() {
  renderLedgerPage();
}

function renderLedgerPage() {
  prLoad();
  const el = document.getElementById('ledger-rows');
  if (!el) return;
  if (prPatients.length === 0) {
    el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--t3);">No records anchored yet. Add patients to see ledger entries.</div>';
    return;
  }
  el.innerHTML = prPatients.map(p => `
    <div class="ledger-row" onclick="openPatientDetail('${p.id}')">
      <div class="dot d-green d-pulse" style="flex-shrink:0;"></div>
      <span style="color:var(--green);font-size:.75rem;">✔ Confirmed</span>
      <span style="color:var(--t3);">Block #${(19000000+Math.floor(Math.random()*500000)).toLocaleString()}</span>
      <span style="color:var(--violet);">${p.id}</span>
      <span style="font-family:'Outfit',sans-serif;font-weight:700;color:var(--t0);">${p.name}</span>
      <div class="chip chip-sky" style="font-size:.62rem;">${(p.condition||'—').split(',')[0]}</div>
      <span style="color:var(--t3);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">0x${randomHex(32)}…</span>
      <span style="color:var(--amber);font-size:.72rem;">${new Date(p.createdAt).toLocaleDateString()}</span>
    </div>`).join('');
}

/* ── OVERRIDE loadPatientToEHR to also handle PR patients ── */
const _origLoadPatientToEHR = loadPatientToEHR;
function loadPatientToEHR(id) {
  // Try PATIENTS array first (static)
  const staticP = PATIENTS.find(x => x.id === id);
  if (staticP) { _origLoadPatientToEHR(id); return; }
  // Then try PR patients
  loadPRPatientToEHR(id);
}

/* ── INIT PR data on app boot ── */
prLoad();

/* ════════════════════════════════════════════
   LEDGER & WORKFLOW PAGE
════════════════════════════════════════════ */
function initLedgerPage() {
  buildWFStats();
  buildWFTechStack();
  renderLedgerPage();
}

/* ── Workflow node details ── */
const WF_DETAILS = {
  1: {
    title:'① User Registration & Login',
    body:'The patient or doctor creates a secure account. Credentials are hashed and stored with a Decentralised Identity (DID) on Ethereum. Zero-knowledge proofs allow authentication without exposing sensitive data. Session tokens are scoped per role — Clinician, Admin, or Patient.',
    tech:['ZK-SNARKs','Ethereum DID','JWT','AES-256','OAuth 2.0']
  },
  2: {
    title:'② Medical Record Upload & Storage (IPFS)',
    body:'Medical records are encrypted client-side with AES-256-GCM before upload. Files are pinned to 8 IPFS nodes across multiple geographic regions for redundancy. The content-addressed CID (Content Identifier) uniquely fingerprints each record — any tampering changes the CID immediately.',
    tech:['IPFS','AES-256-GCM','CIDv1','SHA-256','Multi-region pinning']
  },
  3: {
    title:'③ Blockchain Transaction Creation',
    body:'The IPFS CID is passed to EHR_Registry_v2.sol — an audited Ethereum smart contract. The storeRecord() function anchors the CID + patient ID + timestamp on-chain in a single transaction. Gas is optimised using EIP-1559 dynamic fee pricing. Confirmation requires 12 blocks (~2.5 minutes).',
    tech:['Ethereum','Solidity 0.8','EIP-1559','Smart Contract','IPFS CID','Web3.js']
  },
  4: {
    title:'④ QR Code Generation & Access Request',
    body:'Every patient receives a unique QR code encoding their ID, blood group, condition, and record pointer. In emergency scenarios, any authorised doctor scans the QR code which triggers a permissioned data retrieval request. The QR token is time-limited (15 min) and logged on-chain.',
    tech:['QRCode.js','IPFS Retrieval','JWT Token','Time-lock','Audit Log']
  },
  5: {
    title:'⑤ Permission Verification & Data Retrieval',
    body:'ConsentManager.sol verifies the requesting doctor\'s wallet address against the patient\'s consent mapping on-chain. If verified, the smart contract emits a ConsentGranted event and the encrypted IPFS record is fetched, decrypted client-side, and returned to the physician — never stored server-side.',
    tech:['ConsentManager.sol','Wallet Verify','On-chain ACL','Client decrypt','Event Emitter']
  },
};

function wfActivate(step) {
  // Remove active from all nodes
  document.querySelectorAll('.wf-node').forEach(n => n.classList.remove('active'));
  // Activate clicked
  const ids = step === 1 ? ['wfn-1','wfn-1b'] : [`wfn-${step}`];
  ids.forEach(id => { const el = document.getElementById(id); if (el) el.classList.add('active'); });

  const detail = WF_DETAILS[step];
  if (!detail) return;
  const panel = document.getElementById('wf-detail-panel');
  const titleEl = document.getElementById('wf-detail-title');
  const bodyEl  = document.getElementById('wf-detail-body');
  const techEl  = document.getElementById('wf-detail-tech');
  titleEl.textContent = detail.title;
  bodyEl.textContent  = detail.body;
  techEl.innerHTML = detail.tech.map(t => `<div class="chip chip-cyan" style="font-size:.62rem;">${t}</div>`).join('');
  panel.style.display = 'block';
}

let wfSimRunning = false;
function simulateWorkflow() {
  if (wfSimRunning) return;
  wfSimRunning = true;
  const btn = document.getElementById('wf-simulate-btn');
  btn.disabled = true; btn.textContent = '⏳ Simulating...';

  // Reset all statuses
  const allStatuses = [
    ['wfs-1','● PROCESSING...'],['wfs-2','● STANDBY'],['wfs-3','● STANDBY'],
    ['wfs-4','● STANDBY'],['wfs-5','● STANDBY'],['wfs-1b','● WAITING']
  ];
  allStatuses.forEach(([id, txt]) => {
    const el = document.getElementById(id);
    if (el) { el.textContent = txt; el.className = 'wf-node-status'; }
  });
  document.querySelectorAll('.wf-node').forEach(n => n.classList.remove('active'));

  const steps = [
    { nodeId:'wfn-1',  statusId:'wfs-1',  delay:0,    msg:'● AUTHENTICATING...', done:'✓ LOGIN COMPLETE',   step:1 },
    { nodeId:'wfn-2',  statusId:'wfs-2',  delay:1800, msg:'● UPLOADING TO IPFS...',done:'✓ IPFS PINNED',     step:2 },
    { nodeId:'wfn-3',  statusId:'wfs-3',  delay:3800, msg:'● TX PENDING...',      done:'✓ TX CONFIRMED',     step:3 },
    { nodeId:'wfn-5',  statusId:'wfs-5',  delay:5800, msg:'● VERIFYING...',       done:'✓ ACCESS GRANTED',   step:5 },
    { nodeId:'wfn-4',  statusId:'wfs-4',  delay:7400, msg:'● SCANNING QR...',     done:'✓ QR RESOLVED',      step:4 },
    { nodeId:'wfn-1b', statusId:'wfs-1b', delay:9200, msg:'● DECRYPTING...',      done:'✓ RECORD DELIVERED', step:null },
  ];

  steps.forEach(({ nodeId, statusId, delay, msg, done, step }) => {
    setTimeout(() => {
      const node   = document.getElementById(nodeId);
      const status = document.getElementById(statusId);
      if (node)   { node.classList.add('active'); node.scrollIntoView({ behavior:'smooth', block:'nearest' }); }
      if (status) { status.textContent = msg; status.classList.add('running'); }
      if (step)   wfActivate(step);
    }, delay);

    setTimeout(() => {
      const status = document.getElementById(statusId);
      if (status) { status.textContent = done; status.className = 'wf-node-status done'; }
    }, delay + 1400);
  });

  setTimeout(() => {
    toast('✅ Full workflow simulation complete — record delivered!', 'success');
    btn.disabled = false; btn.textContent = '▶ Simulate Full Workflow';
    wfSimRunning = false;
  }, 11200);
}

function buildWFStats() {
  const el = document.getElementById('wf-stats');
  if (!el) return;
  prLoad();
  const stats = [
    { label:'Total Records Processed',  value: prPatients.length,                          color:'var(--cyan)'   },
    { label:'IPFS Nodes Pinning',        value: '8 / 8',                                   color:'var(--violet)' },
    { label:'Avg TX Confirmation Time',  value: '~2.5 min',                                color:'var(--amber)'  },
    { label:'Smart Contract Calls',      value: (prPatients.length * 3).toLocaleString(),  color:'var(--green)'  },
    { label:'ZK Proofs Generated',       value: prPatients.length,                          color:'var(--rose)'   },
    { label:'QR Codes Active',           value: prPatients.filter(p=>p.status==='Active').length, color:'var(--sky)' },
  ];
  el.innerHTML = stats.map(s => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(99,117,183,.05);">
      <span style="font-size:.78rem;color:var(--t2);">${s.label}</span>
      <span style="font-family:'JetBrains Mono',monospace;font-size:.8rem;font-weight:700;color:${s.color};">${s.value}</span>
    </div>`).join('');
}

function buildWFTechStack() {
  const el = document.getElementById('wf-tech-stack');
  if (!el) return;
  const stack = [
    { layer:'Identity',    tech:'Ethereum DID · ZK-SNARKs · JWT',     icon:'🔮', color:'var(--violet)' },
    { layer:'Storage',     tech:'IPFS · CIDv1 · AES-256-GCM',         icon:'💾', color:'var(--cyan)'   },
    { layer:'Blockchain',  tech:'Ethereum · Solidity 0.8 · EIP-1559',  icon:'⛓', color:'var(--amber)'  },
    { layer:'Access',      tech:'ConsentManager.sol · On-chain ACL',   icon:'🛡', color:'var(--green)'  },
    { layer:'Interop',     tech:'FHIR R4 · HL7 · REST API',            icon:'🌐', color:'var(--sky)'    },
    { layer:'QR / Access', tech:'QRCode.js · Time-lock Tokens',        icon:'📱', color:'var(--rose)'   },
  ];
  el.innerHTML = stack.map(s => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(99,117,183,.05);">
      <span style="font-size:1.1rem;">${s.icon}</span>
      <div style="flex:1;">
        <div style="font-size:.72rem;font-weight:700;color:${s.color};text-transform:uppercase;letter-spacing:.5px;">${s.layer}</div>
        <div style="font-size:.72rem;color:var(--t2);">${s.tech}</div>
      </div>
    </div>`).join('');
}

/* ── BOOT ── */
window.addEventListener('load', () => {
  initLanding();
  const emailEl = document.getElementById('li-email');
  if (emailEl) emailEl.value = 'dr.chen@hospital.org';
});

// ════════════════════════════════════════════════════════════════
//  ENHANCED FEATURES — Role Login, Upload, Blockchain Sim, etc.
// ════════════════════════════════════════════════════════════════

/* ── SHARED RECORD STORE (persisted in memory, accessible by all roles) ── */
const SHARED_RECORDS = [];

function randomHexNew(len) {
  return Array.from({length:len},()=>'0123456789abcdef'[Math.floor(Math.random()*16)]).join('');
}

function generateBlockchainData() {
  return {
    blockId: '#' + (19284511 + Math.floor(Math.random()*10000)).toLocaleString(),
    txHash: '0x' + randomHexNew(64),
    ipfsCid: 'bafybeig' + randomHexNew(46),
    dataHash: randomHexNew(64),
    timestamp: new Date().toLocaleString('en-IN', { timeZone:'Asia/Kolkata', hour12:true })
  };
}

/* ── ENHANCED doLogin — role-based routing ── */
const _origDoLogin = doLogin;
function doLogin() {
  const email = (document.getElementById('li-email')?.value || '').trim();
  const role  = STATE.role;
  document.getElementById('auth-err').style.display = 'none';
  const btn = document.getElementById('login-btn');
  btn.textContent = '⏳ Authenticating...'; btn.disabled = true;

  setTimeout(() => {
    btn.textContent = '🔐 Authenticate Securely'; btn.disabled = false;
    STATE.loggedInEmail = email || 'user@mediledger.io';

    if (role === 'Patient') {
      STATE.patientName = extractName(email) || 'Patient User';
      initPatientDash();
      goto('patient-dash');
    } else if (role === 'Clinician') {
      STATE.doctorName = extractName(email, true) || 'Dr. Chen Wei';
      initDoctorDash();
      goto('doctor-dash');
    } else if (role === 'Admin') {
      initAdminDash();
      goto('admin-dash');
    } else {
      goto('app');
    }
  }, 900);
}

function extractName(email, isDoctor) {
  if (!email || !email.includes('@')) return null;
  const local = email.split('@')[0].replace(/[._-]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
  return isDoctor ? 'Dr. ' + local : local;
}

function goto(page) {
  const map = {
    land: 'pg-land', auth: 'pg-auth',
    'patient-dash': 'pg-patient-dash',
    'doctor-dash': 'pg-doctor-dash',
    'admin-dash': 'pg-admin-dash',
    app: 'app-shell'
  };

  if (page === 'auth' && STATE.currentPage === 'land') {
    const landEl = document.getElementById('pg-land');
    const authEl = document.getElementById('pg-auth');
    document.body.classList.add('transitioning');
    landEl.classList.add('slide-out');
    authEl.classList.add('active');
    authEl.classList.remove('slide-in');
    void authEl.offsetWidth;
    authEl.classList.add('slide-in');
    setTimeout(() => {
      landEl.classList.remove('active','slide-out');
      document.body.classList.remove('transitioning');
    }, 550);
    const infoBtn = document.getElementById('project-info-toggle');
    if (infoBtn) infoBtn.style.display = 'none';
    STATE.currentPage = page;
    return;
  }

  document.querySelectorAll('.page, .app-shell').forEach(p => p.classList.remove('active','slide-in','slide-out'));
  const targetId = map[page];
  if (targetId) {
    const el = document.getElementById(targetId);
    if (el) {
      el.classList.add('active');
      if (page === 'auth') {
        el.classList.remove('slide-in');
        void el.offsetWidth;
        el.classList.add('slide-in');
      }
    }
  }
  if (page === 'land') initLanding();
  if (page === 'app')  { initApp(); appNav(STATE.appPage || 'dash'); }

  // Show/hide project info panel
  const infoBtn = document.getElementById('project-info-toggle');
  if (infoBtn) infoBtn.style.display = (page === 'land') ? 'flex' : 'none';
  const infoPanel = document.getElementById('project-info-panel');
  if (infoPanel) infoPanel.style.display = 'none';

  STATE.currentPage = page;
}

/* ══════════════════════════════
   PATIENT DASHBOARD
══════════════════════════════ */
function initPatientDash() {
  const name = STATE.patientName || 'Patient';
  const el = document.getElementById('pt-welcome-name');
  if (el) el.textContent = name;
  const badge = document.getElementById('pt-avatar-badge');
  if (badge) badge.textContent = name.slice(0,2).toUpperCase();
  updatePatientStats();
  renderPatientRecords();
}

function updatePatientStats() {
  const myRecs = SHARED_RECORDS.filter(r => r.patientName === (STATE.patientName || 'Patient'));
  const confirmed = myRecs.filter(r => r.status === 'Confirmed').length;
  const shared = myRecs.filter(r => r.shared).length;
  const el1 = document.getElementById('pt-stat-records');
  const el2 = document.getElementById('pt-stat-confirmed');
  const el3 = document.getElementById('pt-stat-shared');
  const elC = document.getElementById('pt-rec-count');
  if (el1) el1.textContent = myRecs.length;
  if (el2) el2.textContent = confirmed;
  if (el3) el3.textContent = shared;
  if (elC) elC.textContent = myRecs.length + ' record' + (myRecs.length!==1?'s':'');
}

function handleFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  const el = document.getElementById('pt-selected-file');
  if (el) {
    el.style.display = 'block';
    el.innerHTML = `<div class="chip chip-cyan" style="font-size:.72rem;">📎 ${file.name} (${(file.size/1024).toFixed(1)}KB)</div>`;
  }
  STATE.selectedFile = file;
}

function handleDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (!file) return;
  const input = document.getElementById('pt-upload-input');
  const el = document.getElementById('pt-selected-file');
  STATE.selectedFile = file;
  if (el) {
    el.style.display = 'block';
    el.innerHTML = `<div class="chip chip-cyan" style="font-size:.72rem;">📎 ${file.name} (${(file.size/1024).toFixed(1)}KB)</div>`;
  }
  document.getElementById('pt-dropzone').style.borderColor = 'rgba(14,165,233,.5)';
}

function uploadPatientRecord() {
  const name  = document.getElementById('pt-rec-name')?.value.trim();
  const type  = document.getElementById('pt-rec-type')?.value;
  const doc   = document.getElementById('pt-rec-doctor')?.value.trim() || 'Unknown Doctor';
  const file  = STATE.selectedFile;

  if (!name)  { toast('Please enter patient name', 'error'); return; }
  if (!type)  { toast('Please select record type', 'error'); return; }
  if (!file)  { toast('Please select a file to upload', 'error'); return; }

  // Simulate upload progress
  const dz = document.getElementById('pt-dropzone');
  if (dz) { dz.innerHTML = '<div style="font-size:1.5rem;margin-bottom:6px;">⏳</div><div style="font-size:.82rem;font-weight:700;color:var(--cyan);">Encrypting &amp; uploading to IPFS...</div>'; }
  toast('🔐 Encrypting with AES-256-GCM...', 'info');

  setTimeout(() => {
    toast('📡 Pinning to IPFS nodes...', 'info');
    setTimeout(() => {
      toast('⛓ Writing to Ethereum blockchain...', 'info');
      setTimeout(() => {
        const bc = generateBlockchainData();
        const record = {
          id: 'REC-' + Date.now(),
          patientName: name,
          recordType: type,
          uploadDate: new Date().toLocaleDateString('en-IN'),
          fileName: file.name,
          fileSize: (file.size/1024).toFixed(1) + 'KB',
          doctor: doc,
          status: 'Confirmed',
          shared: false,
          blockId: bc.blockId,
          txHash: bc.txHash,
          ipfsCid: bc.ipfsCid,
          dataHash: bc.dataHash,
          timestamp: bc.timestamp
        };
        SHARED_RECORDS.push(record);

        // Show blockchain info card
        showBlockchainCard(record);
        updatePatientStats();
        renderPatientRecords();

        // Reset dropzone
        if (dz) dz.innerHTML = '<div style="font-size:2.5rem;margin-bottom:8px;">📁</div><div style="font-size:.88rem;font-weight:700;color:var(--t1);">Drop file here or click to browse</div><div style="font-size:.72rem;color:var(--t3);margin-top:4px;">Supports: PDF, JPEG, PNG, DICOM (max 50MB)</div><input type="file" id="pt-upload-input" style="display:none;" accept=".pdf,.jpg,.jpeg,.png,.dcm" onchange="handleFileSelect(this)"><div id="pt-selected-file" style="display:none;"></div>';
        dz.style.borderColor = '';
        STATE.selectedFile = null;

        toast('✅ Record uploaded & confirmed on blockchain!', 'success');
        updateDoctorRecordsIfOpen();
        updateAdminRecordsIfOpen();
      }, 1200);
    }, 900);
  }, 800);
}

function showBlockchainCard(record) {
  const card = document.getElementById('pt-bc-card');
  if (!card) return;
  card.style.display = 'block';
  document.getElementById('bc-block-id').textContent = record.blockId;
  document.getElementById('bc-tx-hash').textContent = record.txHash;
  document.getElementById('bc-ipfs-cid').textContent = record.ipfsCid;
  document.getElementById('bc-data-hash').textContent = record.dataHash;
  document.getElementById('bc-timestamp').textContent = record.timestamp;

  // Generate QR code
  const qrDiv = document.getElementById('pt-qr-container');
  if (qrDiv) {
    qrDiv.innerHTML = '';
    try {
      new QRCode(qrDiv, {
        text: JSON.stringify({ id: record.id, patient: record.patientName, type: record.recordType, tx: record.txHash.slice(0,20), block: record.blockId }),
        width: 120, height: 120, colorDark:'#000', colorLight:'#fff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch(e) {
      qrDiv.innerHTML = '<div style="width:120px;height:120px;background:#222;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:40px;">📱</div>';
    }
  }
  card.scrollIntoView({ behavior:'smooth', block:'nearest' });
}

function renderPatientRecords() {
  const tbody = document.getElementById('pt-records-tbody');
  if (!tbody) return;
  const myRecs = SHARED_RECORDS.filter(r => r.patientName === (STATE.patientName || '___'));
  if (myRecs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--t3);padding:28px;font-size:.82rem;">No records uploaded yet. Use the upload form above to add your first medical record.</td></tr>';
    return;
  }
  tbody.innerHTML = myRecs.map(r => `
    <tr>
      <td style="font-weight:700;">${r.patientName}</td>
      <td><div class="chip chip-cyan" style="font-size:.68rem;">${r.recordType}</div></td>
      <td style="color:var(--t2);font-size:.78rem;">${r.uploadDate}</td>
      <td style="font-size:.78rem;color:var(--t2);">📎 ${r.fileName}</td>
      <td style="font-size:.75rem;color:var(--t3);">${r.doctor}</td>
      <td><div class="chip chip-green" style="font-size:.62rem;">✓ ${r.status}</div></td>
      <td><button class="btn btn-ghost btn-xs" onclick="showRecordQR('${r.id}')">📱 QR</button></td>
    </tr>`).join('');
}

function showRecordQR(recordId) {
  const rec = SHARED_RECORDS.find(r => r.id === recordId);
  if (rec) showBlockchainCard(rec);
}

function downloadQR() {
  toast('QR code downloaded as PNG', 'success');
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior:'smooth' });
}

/* ══════════════════════════════
   DOCTOR DASHBOARD
══════════════════════════════ */
function initDoctorDash() {
  const name = STATE.doctorName || 'Dr. User';
  const el = document.getElementById('dr-welcome-name');
  if (el) el.textContent = name;
  refreshDoctorRecords();
}

function refreshDoctorRecords() {
  const tbody = document.getElementById('dr-records-tbody');
  const statEl = document.getElementById('dr-stat-records');
  if (!tbody) return;

  // Show all records (doctors see everything)
  const allRecs = [...SHARED_RECORDS, ...getDefaultDoctorRecords()];
  if (statEl) statEl.textContent = allRecs.length;

  if (allRecs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--t3);padding:28px;font-size:.82rem;">No patient records found. Records uploaded by patients will appear here.</td></tr>';
    return;
  }
  renderDoctorTable(allRecs);
}

function getDefaultDoctorRecords() {
  return PATIENTS.map(p => ({
    id: p.id + '-base',
    patientName: p.name,
    recordType: 'EHR Record',
    uploadDate: new Date(Date.now() - Math.random()*1e10).toLocaleDateString('en-IN'),
    fileName: 'EHR_' + p.id + '.json',
    doctor: 'Dr. Chen Wei',
    status: 'Confirmed',
    blockId: '#' + (19284000 + Math.floor(Math.random()*1000)).toLocaleString(),
    txHash: '0x' + randomHexNew(64),
    ipfsCid: p.hash,
    dataHash: randomHexNew(64),
    timestamp: new Date().toLocaleString()
  }));
}

function renderDoctorTable(recs) {
  const tbody = document.getElementById('dr-records-tbody');
  if (!tbody) return;
  tbody.innerHTML = recs.map(r => `
    <tr>
      <td style="font-weight:700;">${r.patientName}</td>
      <td><div class="chip chip-violet" style="font-size:.68rem;">${r.recordType}</div></td>
      <td style="color:var(--t2);font-size:.78rem;">${r.uploadDate}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.65rem;color:var(--cyan);">${r.blockId}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.62rem;color:var(--violet);">${r.txHash.slice(0,18)}…</td>
      <td><div class="chip chip-green" style="font-size:.62rem;">✓ Confirmed</div></td>
      <td style="display:flex;gap:5px;">
        <button class="btn btn-ghost btn-xs" onclick="downloadRecord('${r.id}')">⬇ Download</button>
        <button class="btn btn-ghost btn-xs" onclick="verifyRecordHash('${r.txHash}')">🔐 Verify</button>
      </td>
    </tr>`).join('');
}

function filterDoctorRecords(q) {
  const allRecs = [...SHARED_RECORDS, ...getDefaultDoctorRecords()];
  const filtered = q ? allRecs.filter(r =>
    r.patientName.toLowerCase().includes(q.toLowerCase()) ||
    r.recordType.toLowerCase().includes(q.toLowerCase())
  ) : allRecs;
  renderDoctorTable(filtered);
}

function downloadRecord(id) {
  toast('📄 Record downloaded successfully', 'success');
}

function verifyRecordHash(hash) {
  document.getElementById('dr-hash-input').value = hash;
  verifyHash();
}

function verifyHash() {
  const input = document.getElementById('dr-hash-input')?.value.trim();
  if (!input) { toast('Please enter a hash or record ID', 'error'); return; }

  const result = document.getElementById('dr-verify-result');
  const detail = document.getElementById('dr-verify-detail');
  if (!result) return;

  // Simulate verification
  setTimeout(() => {
    result.style.display = 'block';
    const rec = SHARED_RECORDS.find(r => r.txHash.includes(input) || r.id === input || r.patientName === input);
    if (detail) detail.textContent = rec
      ? `Patient: ${rec.patientName} · Record: ${rec.recordType} · Block: ${rec.blockId} · Timestamp: ${rec.timestamp}`
      : `Hash verified on Ethereum Mainnet · Block: ${(19284511 + Math.floor(Math.random()*1000)).toLocaleString()} · Timestamp: ${new Date().toLocaleString()}`;
    toast('✅ Hash verified — record is authentic', 'success');
  }, 600);
}

function updateDoctorRecordsIfOpen() {
  if (STATE.currentPage === 'doctor-dash') refreshDoctorRecords();
}

/* ══════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════ */
function initAdminDash() {
  updateAdminStats();
  renderAdminRecords();
  buildAdminBCActivity();
}

function updateAdminStats() {
  const total = SHARED_RECORDS.length + PATIENTS.length;
  const el = document.getElementById('adm-total-records');
  if (el) el.textContent = (8421 + SHARED_RECORDS.length).toLocaleString();
  const elC = document.getElementById('adm-rec-count');
  if (elC) elC.textContent = (SHARED_RECORDS.length + PATIENTS.length) + ' records';
}

function renderAdminRecords() {
  const tbody = document.getElementById('adm-records-tbody');
  if (!tbody) return;
  const allRecs = [...SHARED_RECORDS, ...getDefaultDoctorRecords()];
  if (allRecs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--t3);padding:24px;">No records yet.</td></tr>';
    return;
  }
  tbody.innerHTML = allRecs.map(r => `
    <tr>
      <td style="font-weight:700;">${r.patientName}</td>
      <td><div class="chip chip-amber" style="font-size:.62rem;">${r.recordType}</div></td>
      <td style="font-size:.75rem;color:var(--t2);">${r.uploadDate}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.63rem;color:var(--cyan);">${r.blockId}</td>
      <td style="font-family:'JetBrains Mono',monospace;font-size:.6rem;color:var(--violet);">${r.txHash.slice(0,16)}…</td>
      <td style="font-size:.75rem;color:var(--t2);">${r.doctor || 'Auto'}</td>
      <td><div class="chip chip-green" style="font-size:.6rem;">✓ ${r.status}</div></td>
    </tr>`).join('');
}

function buildAdminBCActivity() {
  const el = document.getElementById('admin-bc-activity');
  if (!el) return;
  const items = [
    { dot:'d-green', msg:'Block #19,284,512 confirmed', time:'just now' },
    { dot:'d-cyan',  msg:'EHR record stored — P001', time:'2m ago' },
    { dot:'d-violet',msg:'Consent granted — P003 → Dr. Chen', time:'5m ago' },
    { dot:'d-amber', msg:'IPFS pin — 8/8 nodes', time:'12m ago' },
    { dot:'d-rose',  msg:'Drug interaction flagged — P006', time:'18m ago' },
  ];
  el.innerHTML = items.map(a => `
    <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid rgba(99,117,183,.05);">
      <div class="dot ${a.dot}"></div>
      <span style="font-size:.78rem;flex:1;">${a.msg}</span>
      <span style="font-size:.65rem;color:var(--t3);font-family:'JetBrains Mono',monospace;">${a.time}</span>
    </div>`).join('');
}

function updateAdminRecordsIfOpen() {
  if (STATE.currentPage === 'admin-dash') { updateAdminStats(); renderAdminRecords(); }
}

/* ══════════════════════════════
   MODAL SYSTEM
══════════════════════════════ */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'flex';
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

/* ══════════════════════════════
   PROJECT INFO PANEL (landing)
══════════════════════════════ */
let projectPanelOpen = false;
function toggleProjectPanel() {
  projectPanelOpen = !projectPanelOpen;
  const panel = document.getElementById('project-info-panel');
  const btn   = document.getElementById('project-info-toggle');
  if (panel) panel.style.display = projectPanelOpen ? 'block' : 'none';
  if (btn)   btn.style.background = projectPanelOpen ? 'rgba(14,165,233,.25)' : 'rgba(14,165,233,.15)';
}

/* Show project info button on landing page load */
(function() {
  const check = () => {
    const btn = document.getElementById('project-info-toggle');
    if (btn) { btn.style.display = 'flex'; btn.style.alignItems = 'center'; btn.style.justifyContent = 'center'; }
  };
  if (document.readyState === 'complete') check();
  else window.addEventListener('load', check);
})();

/* ══════════════════════════════
   ALSO UPDATE AUTH PAGE — add role selector labels enhancements
   and enhance auth UI to show quick demo credentials
══════════════════════════════ */
window.addEventListener('load', () => {
  // Add demo credentials hints below role buttons
  const roleGrid = document.querySelector('.role-grid');
  if (roleGrid && !document.getElementById('role-demo-hint')) {
    const hint = document.createElement('div');
    hint.id = 'role-demo-hint';
    hint.style.cssText = 'margin-top:10px;padding:10px 14px;background:rgba(14,165,233,.05);border:1px solid rgba(14,165,233,.1);border-radius:8px;font-size:.72rem;color:var(--t3);line-height:1.7;';
    hint.innerHTML = '💡 <strong style="color:var(--cyan);">Demo:</strong> Select any role above, enter any email, and click Authenticate Securely to see the role-specific dashboard.';
    roleGrid.parentElement.insertBefore(hint, roleGrid.nextSibling);
  }
});

