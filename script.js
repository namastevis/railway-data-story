(async function(){

const [facts, agg] = await Promise.all([
  fetch('data/facts.json').then(r=>r.json()),
  fetch('data/aggregates.json').then(r=>r.json())
]);

const factsByAct = d3.group(facts, d=>d.act);

const ACTS = [
  {key:'scale', label:'Act I', title:'Sixteen zones, one country', viz:'zoneBar'},
  {key:'hierarchy', label:'Act II', title:'The long tail of Indian Railways', viz:'dotMatrix'},
  {key:'geography', label:'Act III', title:"Where India doesn't reach", viz:'stateBar'},
  {key:'elite', label:'Act IV', title:'The elite, concentrated', viz:'eliteBar'},
  {key:'language', label:'Act V', title:'The language of the rails', viz:'wordBar'},
  {key:'codes', label:'Act VI', title:'Fossils in the code', viz:'codeLetters'},
  {key:'detective', label:'Act VII', title:'The detective story', viz:'detective'},
];

const story = d3.select('#story');

/* ---------------- build DOM ---------------- */
ACTS.forEach(act=>{
  const sec = story.append('section').attr('class','act').attr('id','act-'+act.key);
  sec.append('p').attr('class','act-label').text(act.label);
  sec.append('h2').attr('class','act-title').text(act.title);
  const scene = sec.append('div').attr('class','scene');
  const stickyCol = scene.append('div').attr('class','sticky-col');
  const stickyVis = stickyCol.append('div').attr('class','sticky-visual');
  stickyVis.append('svg').attr('id','viz-'+act.key).attr('viewBox','0 0 600 600').attr('preserveAspectRatio','xMidYMid meet');

  const stepsCol = scene.append('div').attr('class','steps-col');
  const list = factsByAct.get(act.key) || [];
  list.forEach((f,i)=>{
    const step = stepsCol.append('div').attr('class','step').attr('data-idx', i).attr('data-act', act.key);
    const inner = step.append('div').attr('class','step-inner');
    inner.append('p').html(f.headline);
    if(f.detail) inner.append('span').attr('class','step-detail').text(f.detail);
  });
});

/* rollcall section */
const rc = story.append('section').attr('class','act').attr('id','act-rollcall');
rc.append('p').attr('class','act-label').text('Act VIII');
rc.append('h2').attr('class','act-title').text('One hundred and twenty-eight small stories, in full');
const grid = rc.append('div').attr('class','rollcall-grid');
(factsByAct.get('rollcall')||[]).forEach(f=>{
  const card = grid.append('div').attr('class','rc-card');
  card.append('h4').text(f.headline);
  if(f.detail) card.append('p').text(f.detail);
});

/* ================= HERO COUNTER ================= */
const heroNum = document.getElementById('hero-number');
let start=null; const target=8477; const dur=1800;
function tick(ts){
  if(!start) start=ts;
  const p = Math.min(1,(ts-start)/dur);
  const eased = 1-Math.pow(1-p,3);
  heroNum.textContent = Math.round(eased*target).toLocaleString('en-IN');
  if(p<1) requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* ================= PROGRESS BAR ================= */
const bar = document.getElementById('progress-bar');
window.addEventListener('scroll', ()=>{
  const h = document.documentElement;
  const pct = (h.scrollTop)/(h.scrollHeight - h.clientHeight)*100;
  bar.style.width = pct+'%';
}, {passive:true});

/* ================= COLORS ================= */
const C = {
  accent:'#ff7a45', accent2:'#4dd0c4', accent3:'#f2c94c',
  gray:'#2b3038', grayMid:'#565f6b', grayLight:'#7a828d', text:'#eef0f2'
};

/* ================= ZONE BAR (Act I) ================= */
function drawZoneBar(){
  const svg = d3.select('#viz-scale');
  const W=600,H=600, m={top:20,right:60,bottom:20,left:120};
  const data = Object.entries(agg.zone_counts).sort((a,b)=>b[1]-a[1]);
  const y = d3.scaleBand().domain(data.map(d=>d[0])).range([m.top, H-m.bottom]).padding(0.25);
  const x = d3.scaleLinear().domain([0, d3.max(data,d=>d[1])]).range([0, W-m.left-m.right]);
  const g = svg.append('g').attr('transform',`translate(${m.left},0)`);
  g.selectAll('rect').data(data).enter().append('rect')
    .attr('class', d=>'zbar zbar-'+d[0])
    .attr('y', d=>y(d[0])).attr('height', y.bandwidth())
    .attr('x',0).attr('width', d=>x(d[1]))
    .attr('rx',2)
    .attr('fill', C.gray);
  g.selectAll('text.lbl').data(data).enter().append('text')
    .attr('class','bar-label')
    .attr('x',-8).attr('y', d=>y(d[0])+y.bandwidth()/2).attr('dy','0.35em')
    .attr('text-anchor','end').text(d=>d[0]);
  g.selectAll('text.val').data(data).enter().append('text')
    .attr('class','bar-value')
    .attr('x', d=>x(d[1])+6).attr('y', d=>y(d[0])+y.bandwidth()/2).attr('dy','0.35em')
    .text(d=>d[1].toLocaleString());
}
function highlightZoneBar(stepIdx, total){
  const svg = d3.select('#viz-scale');
  svg.selectAll('.zbar').attr('fill', C.gray);
  const frac = stepIdx/Math.max(1,total-1);
  if(frac < 0.35){ /* default */ }
  else if(frac < 0.7){
    svg.select('.zbar-NR').attr('fill', C.accent);
    svg.select('.zbar-WCR').attr('fill', C.accent2);
  } else {
    svg.select('.zbar-NR').attr('fill', C.accent);
    svg.select('.zbar-WCR').attr('fill', C.accent2);
  }
}

/* ================= DOT MATRIX (Act II) ================= */
function drawDotMatrix(){
  const svg = d3.select('#viz-hierarchy');
  const total = agg.tier_counts.longtail + agg.tier_counts.workhorse + agg.tier_counts.elite;
  const cols = 92, cell=6, gap=1;
  const order = [
    ...Array(agg.tier_counts.longtail).fill('longtail'),
    ...Array(agg.tier_counts.workhorse).fill('workhorse'),
    ...Array(agg.tier_counts.elite).fill('elite'),
  ];
  const rows = Math.ceil(order.length/cols);
  svg.attr('viewBox', `0 0 ${cols*(cell+gap)} ${rows*(cell+gap)+10}`);
  const colorMap = {longtail:C.gray, workhorse:C.grayMid, elite:C.accent};
  const g = svg.append('g');
  g.selectAll('rect').data(order).enter().append('rect')
    .attr('class', d=>'dot dot-'+d)
    .attr('x',(d,i)=> (i%cols)*(cell+gap))
    .attr('y',(d,i)=> Math.floor(i/cols)*(cell+gap))
    .attr('width',cell).attr('height',cell)
    .attr('fill', d=>colorMap[d]);
}
function highlightDotMatrix(stepIdx,total){
  const svg = d3.select('#viz-hierarchy');
  const frac = stepIdx/Math.max(1,total-1);
  svg.selectAll('.dot').attr('opacity',1);
  if(frac<0.4){
    svg.selectAll('.dot-workhorse,.dot-elite').attr('opacity',.25);
  } else if(frac<0.75){
    svg.selectAll('.dot-longtail').attr('opacity',.25);
    svg.selectAll('.dot-elite').attr('opacity',.25);
  } else {
    svg.selectAll('.dot-longtail,.dot-workhorse').attr('opacity',.2);
  }
}

/* ================= STATE BAR (Act III) ================= */
function drawStateBar(){
  const svg = d3.select('#viz-geography');
  const data = agg.state_bar;
  const W=600,H=600,m={top:20,right:50,bottom:20,left:130};
  const y = d3.scaleBand().domain(data.map(d=>d.state)).range([m.top,H-m.bottom]).padding(.28);
  const x = d3.scaleLinear().domain([0,d3.max(data,d=>d.count)]).range([0,W-m.left-m.right]);
  const g = svg.append('g').attr('transform',`translate(${m.left},0)`);
  g.selectAll('rect.base').data(data).enter().append('rect')
    .attr('class','sbar')
    .attr('y',d=>y(d.state)).attr('height',y.bandwidth())
    .attr('x',0).attr('width',d=>x(d.count))
    .attr('rx',2).attr('fill',C.gray);
  g.selectAll('text.lbl').data(data).enter().append('text')
    .attr('class','bar-label').attr('x',-8).attr('y',d=>y(d.state)+y.bandwidth()/2).attr('dy','.35em')
    .attr('text-anchor','end').text(d=>d.state);
  g.selectAll('circle.nsg1').data(data.filter(d=>d.nsg1>0)).enter().append('circle')
    .attr('class','nsg1dot')
    .attr('cx',d=>x(d.count)+16).attr('cy',d=>y(d.state)+y.bandwidth()/2).attr('r',9)
    .attr('fill',C.accent);
  g.selectAll('text.nsg1t').data(data.filter(d=>d.nsg1>0)).enter().append('text')
    .attr('x',d=>x(d.count)+16).attr('y',d=>y(d.state)+y.bandwidth()/2).attr('dy','.32em')
    .attr('text-anchor','middle').attr('font-size','9px').attr('fill','#0b0d10').attr('font-weight','700')
    .text(d=>d.nsg1);
}

/* ================= ELITE BAR (Act IV) ================= */
function drawEliteBar(){
  const svg = d3.select('#viz-elite');
  const data = agg.state_bar.map(d=>({state:d.state, pct: d.count? +(d.nsg1/d.count*100).toFixed(2):0, nsg1:d.nsg1}))
    .sort((a,b)=>b.pct-a.pct).slice(0,10);
  const W=600,H=600,m={top:20,right:60,bottom:20,left:130};
  const y = d3.scaleBand().domain(data.map(d=>d.state)).range([m.top,H-m.bottom]).padding(.28);
  const x = d3.scaleLinear().domain([0,d3.max(data,d=>d.pct)]).range([0,W-m.left-m.right]);
  const g = svg.append('g').attr('transform',`translate(${m.left},0)`);
  g.selectAll('rect').data(data).enter().append('rect')
    .attr('y',d=>y(d.state)).attr('height',y.bandwidth())
    .attr('x',0).attr('width',d=>x(d.pct)).attr('rx',2)
    .attr('fill',(d,i)=> i===0? C.accent : C.grayMid);
  g.selectAll('text.lbl').data(data).enter().append('text')
    .attr('class','bar-label').attr('x',-8).attr('y',d=>y(d.state)+y.bandwidth()/2).attr('dy','.35em')
    .attr('text-anchor','end').text(d=>d.state);
  g.selectAll('text.val').data(data).enter().append('text')
    .attr('class','bar-value').attr('x',d=>x(d.pct)+6).attr('y',d=>y(d.state)+y.bandwidth()/2).attr('dy','.35em')
    .text(d=>d.pct+'% elite');
}

/* ================= WORD BAR (Act V) ================= */
function drawWordBar(){
  const svg = d3.select('#viz-language');
  const data = Object.entries(agg.word_counts).sort((a,b)=>b[1]-a[1]);
  const W=600,H=600,m={top:20,right:50,bottom:20,left:90};
  const y = d3.scaleBand().domain(data.map(d=>d[0])).range([m.top,H-m.bottom]).padding(.25);
  const x = d3.scaleLog().domain([1,d3.max(data,d=>d[1])]).range([0,W-m.left-m.right]);
  const g = svg.append('g').attr('transform',`translate(${m.left},0)`);
  g.selectAll('rect').data(data).enter().append('rect')
    .attr('y',d=>y(d[0])).attr('height',y.bandwidth())
    .attr('x',0).attr('width',d=>x(d[1])).attr('rx',2)
    .attr('fill',C.accent2);
  g.selectAll('text.lbl').data(data).enter().append('text')
    .attr('class','bar-label').attr('x',-8).attr('y',d=>y(d[0])+y.bandwidth()/2).attr('dy','.35em')
    .attr('text-anchor','end').text(d=>d[0]);
  g.selectAll('text.val').data(data).enter().append('text')
    .attr('class','bar-value').attr('x',d=>x(d[1])+6).attr('y',d=>y(d[0])+y.bandwidth()/2).attr('dy','.35em')
    .text(d=>d[1]);
}

/* ================= CODE FIRST LETTERS (Act VI) ================= */
function drawCodeLetters(){
  const svg = d3.select('#viz-codes');
  // approximate distribution reused from state/zone style isn't in agg; use word_counts-independent small hardcoded set for visual flourish
  const letters = ['B','K','S','M','P','D','G','N','A','T','C','R','J','H','L','V','U','I','W','F','O','Y','E','Z','Q','X'];
  const vals = [1063,956,863,758,548,517,436,412,398,384,373,368,345,245,204,189,112,63,55,53,46,34,30,11,10,4];
  const data = letters.map((l,i)=>({l,v:vals[i]}));
  const W=600,H=600,m={top:30,right:20,bottom:40,left:20};
  const x = d3.scaleBand().domain(data.map(d=>d.l)).range([m.left,W-m.right]).padding(.2);
  const yMax = d3.max(data,d=>d.v);
  const y = d3.scaleLinear().domain([0,yMax]).range([H-m.bottom,m.top]);
  const g = svg.append('g');
  g.selectAll('rect').data(data).enter().append('rect')
    .attr('x',d=>x(d.l)).attr('width',x.bandwidth())
    .attr('y',d=>y(d.v)).attr('height',d=>y(0)-y(d.v))
    .attr('rx',2)
    .attr('fill',d=> d.l==='B' ? C.accent3 : C.grayMid);
  g.selectAll('text').data(data).enter().append('text')
    .attr('x',d=>x(d.l)+x.bandwidth()/2).attr('y',H-m.bottom+16)
    .attr('text-anchor','middle').attr('font-size','10px').attr('fill', C.grayLight)
    .text(d=>d.l);
}

/* ================= DETECTIVE (Act VII) ================= */
function drawDetective(){
  const svg = d3.select('#viz-detective');
  const W=600,H=600;
  const g = svg.append('g').attr('transform',`translate(${W/2},${H/2-40})`);
  g.append('text').attr('text-anchor','middle').attr('font-size','80').attr('font-weight','700')
    .attr('fill', C.grayLight).attr('id','det-official').text('8,477');
  g.append('text').attr('y',40).attr('text-anchor','middle').attr('font-size','14').attr('fill', C.grayMid)
    .text('officially listed');
  g.append('text').attr('y',110).attr('text-anchor','middle').attr('font-size','56').attr('font-weight','700')
    .attr('fill', C.accent).attr('id','det-real').attr('opacity',0).text('8,453');
  g.append('text').attr('y',145).attr('text-anchor','middle').attr('font-size','13').attr('fill', C.grayMid)
    .attr('id','det-real-label').attr('opacity',0).text('unique stations, once duplicates are removed');
}
function highlightDetective(stepIdx,total){
  const frac = stepIdx/Math.max(1,total-1);
  const svg = d3.select('#viz-detective');
  if(frac>0.15){
    svg.select('#det-official').transition().duration(400).attr('fill', C.grayMid);
    svg.select('#det-real').transition().duration(400).attr('opacity',1);
    svg.select('#det-real-label').transition().duration(400).attr('opacity',1);
  } else {
    svg.select('#det-official').transition().duration(300).attr('fill', C.grayLight);
    svg.select('#det-real').transition().duration(300).attr('opacity',0);
    svg.select('#det-real-label').transition().duration(300).attr('opacity',0);
  }
}

drawZoneBar();
drawDotMatrix();
drawStateBar();
drawEliteBar();
drawWordBar();
drawCodeLetters();
drawDetective();

/* ================= SCROLLYTELLING OBSERVER ================= */
const stepGroups = {};
document.querySelectorAll('.step').forEach(el=>{
  const act = el.dataset.act;
  if(!stepGroups[act]) stepGroups[act]=[];
  stepGroups[act].push(el);
});

const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el = entry.target;
      const act = el.dataset.act;
      const idx = +el.dataset.idx;
      const group = stepGroups[act];
      group.forEach(s=>s.classList.remove('active'));
      el.classList.add('active');
      if(act==='scale') highlightZoneBar(idx, group.length);
      if(act==='hierarchy') highlightDotMatrix(idx, group.length);
      if(act==='detective') highlightDetective(idx, group.length);
    }
  });
}, {threshold:0.6, rootMargin:'-10% 0px -10% 0px'});

document.querySelectorAll('.step').forEach(el=>io.observe(el));

/* rollcall fade-in */
const rcio = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('visible'); });
},{threshold:0.15});
document.querySelectorAll('.rc-card').forEach(el=>rcio.observe(el));

})();
