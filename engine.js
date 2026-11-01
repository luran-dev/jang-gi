/* Pure janggi rules; shared by browser and Node tests. */
(function(root){
'use strict';
const other=s=>s==='cho'?'han':'cho';
const inside=(r,c)=>r>=0&&r<10&&c>=0&&c<9;
const palace=(r,c,s)=>c>=3&&c<=5&&(s==='han'?r>=0&&r<=2:r>=7&&r<=9);
const lines=[[[0,3],[1,4],[2,5]],[[0,5],[1,4],[2,3]],[[7,3],[8,4],[9,5]],[[7,5],[8,4],[9,3]]];
function initial(setup='outer'){
 const b=Array.from({length:10},()=>Array(9).fill(null));
 for(const s of ['han','cho']){const home=s==='han'?0:9, pawn=s==='han'?3:6, cannon=s==='han'?2:7;
 const order=setup==='inner'?['R','H','E','G',null,'G','E','H','R']:['R','E','H','G',null,'G','H','E','R'];
 order.forEach((t,c)=>{if(t)b[home][c]={s,t};});b[s==='han'?1:8][4]={s,t:'K'};
 [0,2,4,6,8].forEach(c=>b[pawn][c]={s,t:'S'});[1,7].forEach(c=>b[cannon][c]={s,t:'C'});
 }return b;
}
function raw(b,r,c){
 const p=b[r][c];if(!p)return [];const out=[];
 const add=(y,x)=>{if(inside(y,x)&&b[y][x]?.s!==p.s)out.push([y,x]);};
 const ray=path=>{let screen=false;for(const [y,x] of path){const q=b[y][x];if(p.t==='C'){if(!screen){if(q){if(q.t==='C')break;screen=true;}continue;}if(q?.t==='C')break;add(y,x);if(q)break;}else{add(y,x);if(q)break;}}};
 if(p.t==='K'||p.t==='G'){
 for(const [dy,dx] of [[1,0],[-1,0],[0,1],[0,-1]])if(palace(r+dy,c+dx,p.s))add(r+dy,c+dx);
 for(const line of lines){const i=line.findIndex(([y,x])=>y===r&&x===c);if(i>=0)for(const j of [i-1,i+1])if(line[j]&&palace(...line[j],p.s))add(...line[j]);}
 }else if(p.t==='R'||p.t==='C'){
 for(const [dy,dx] of [[1,0],[-1,0],[0,1],[0,-1]]){const path=[];for(let n=1;inside(r+n*dy,c+n*dx);n++)path.push([r+n*dy,c+n*dx]);ray(path);}
 for(const line of lines){const i=line.findIndex(([y,x])=>y===r&&x===c);if(i>=0){ray(line.slice(i+1));ray(line.slice(0,i).reverse());}}
 }else if(p.t==='H'||p.t==='E'){
 for(const a of [-1,1])for(const d of [-1,1]){
 if(p.t==='H'){if(inside(r+a,c)&&!b[r+a][c])add(r+2*a,c+d);if(inside(r,c+a)&&!b[r][c+a])add(r+d,c+2*a);}
 else{if(inside(r+2*a,c+d)&&!b[r+a][c]&&!b[r+2*a][c+d])add(r+3*a,c+2*d);if(inside(r+d,c+2*a)&&!b[r][c+a]&&!b[r+d][c+2*a])add(r+2*d,c+3*a);}
 }
 }else if(p.t==='S'){
 const dy=p.s==='cho'?-1:1;add(r+dy,c);add(r,c-1);add(r,c+1);
 for(const line of lines){const i=line.findIndex(([y,x])=>y===r&&x===c);if(i>=0)for(const j of [i-1,i+1])if(line[j]&&line[j][0]-r===dy&&palace(...line[j],other(p.s)))add(...line[j]);}
 }return out;
}
function moved(b,r,c,y,x){const n=b.map(row=>row.slice());n[y][x]=n[r][c];n[r][c]=null;return n;}
function king(b,s){for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(b[r][c]?.s===s&&b[r][c].t==='K')return [r,c];return null;}
function check(b,s){const k=king(b,s);if(!k)return true;for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(b[r][c]&&b[r][c].s!==s&&raw(b,r,c).some(([y,x])=>y===k[0]&&x===k[1]))return true;return false;}
function facing(b){const a=king(b,'han'),z=king(b,'cho');if(!a||!z||a[1]!==z[1])return false;for(let r=a[0]+1;r<z[0];r++)if(b[r][a[1]])return false;return true;}
function legal(b,r,c){const p=b[r][c];if(!p)return [];const mustBreak=facing(b);return raw(b,r,c).filter(([y,x])=>{if(b[y][x]?.t==='K')return false;const n=moved(b,r,c,y,x);return !check(n,p.s)&&(!mustBreak||!facing(n));});}
function moves(b,s){const a=[];for(let r=0;r<10;r++)for(let c=0;c<9;c++)if(b[r][c]?.s===s)for(const [y,x] of legal(b,r,c))a.push({r,c,y,x});return a;}
const value={K:10000,R:130,C:70,H:50,E:30,G:30,S:20};
function evaluate(b,s){let n=0;for(let r=0;r<10;r++)for(let c=0;c<9;c++){const p=b[r][c];if(p)n+=(p.s===s?1:-1)*(value[p.t]+(p.t==='S'?(p.s==='cho'?9-r:r)*1.6:0)+(p.t==='H'?4-Math.abs(4-c):0));}return n;}
function choose(b,s){let best=-Infinity,chosen=null;const options=moves(b,s);for(const m of options){const next=moved(b,m.r,m.c,m.y,m.x),responses=moves(next,other(s));let score=Infinity;if(!responses.length)score=check(next,other(s))?100000:evaluate(next,s);else for(const reply of responses){score=Math.min(score,evaluate(moved(next,reply.r,reply.c,reply.y,reply.x),s));if(score<best-1)break;}score+=Math.random()*.4;if(score>best){best=score;chosen=m;}}return chosen;}
const api={initial,raw,moved,check,facing,legal,moves,choose,other};if(typeof module!=='undefined')module.exports=api;else root.Janggi=api;
})(typeof window!=='undefined'?window:globalThis);
