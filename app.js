'use strict';
const $=id=>document.getElementById(id), J=window.Janggi;
const names={K:'궁',R:'차',C:'포',H:'마',E:'상',G:'사',S:'졸'};
const glyph=p=>p.t==='K'?(p.s==='cho'?'楚':'漢'):p.t==='S'?(p.s==='cho'?'卒':'兵'):{R:'車',C:'包',H:'馬',E:'象',G:'士'}[p.t];
let board=J.initial(),turn='cho',mode='ai',selected=null,targets=[],records=[],snapshots=[],result='',flipped=false,thinking=false,timer=null,passes=0,positions=[],pending=null,focusCell=76;
const key=()=>JSON.stringify(board)+turn;
positions=[key()];
let grid='';for(let r=0;r<10;r++)grid+=`<path d="M50 ${50+r*100}H850"/>`;for(let c=0;c<9;c++)grid+=`<path d="M${50+c*100} 50V950"/>`;
grid+='<path d="M350 50L550 250M550 50L350 250M350 750L550 950M550 750L350 950"/>';
for(const r of [2,3,6,7])for(const c of (r===2||r===7?[1,7]:[0,2,4,6,8]))for(const dx of [-1,1])for(const dy of [-1,1])if(c+dx>=0&&c+dx<9){let x=50+c*100,y=50+r*100;grid+=`<path d="M${x+dx*20} ${y+dy*7}H${x+dx*7}V${y+dy*20}" stroke-width="1.2"/>`;}
$('board-lines').innerHTML=grid;
const cells=[];for(let i=0;i<90;i++){const b=document.createElement('button');b.className='point';b.type='button';b.addEventListener('click',()=>selectCell(i));b.addEventListener('keydown',e=>{let next=i;const row=Math.floor(i/9),col=i%9;if(e.key==='ArrowRight')next=row*9+(col+1)%9;else if(e.key==='ArrowLeft')next=row*9+(col+8)%9;else if(e.key==='ArrowDown')next=(i+9)%90;else if(e.key==='ArrowUp')next=(i+81)%90;else if(e.key==='Escape'){selected=null;targets=[];render();return;}else return;e.preventDefault();focusCell=next;cells.forEach((cell,n)=>cell.tabIndex=n===next?0:-1);cells[next].focus();});cells.push(b);$('intersections').append(b);}
function boardCoords(i){const n=flipped?89-i:i;return [Math.floor(n/9),n%9];}
function render(){
 const checked=J.check(board,turn),last=records.at(-1);
 cells.forEach((cell,i)=>{const [r,c]=boardCoords(i),p=board[r][c],isSelected=selected&&selected[0]===r&&selected[1]===c,legal=targets.some(([y,x])=>y===r&&x===c),isLast=last&&!last.pass&&((last.r===r&&last.c===c)||(last.y===r&&last.x===c));
 cell.className='point'+(isSelected?' selected':'')+(legal?' legal':'')+(isLast?' last':'')+(p?.t==='K'&&p.s===turn&&checked?' checked':'');
 cell.innerHTML=p?`<span class="piece ${p.s} ${p.t==='K'?'king':''}" aria-hidden="true">${glyph(p)}</span>`:'';
 cell.setAttribute('aria-label',`${c+1}열 ${r+1}행${p?` ${p.s==='cho'?'초':'한'} ${names[p.t]}`:' 빈 자리'}${legal?' 이동 가능':''}`);cell.setAttribute('aria-pressed',String(!!isSelected));cell.tabIndex=i===focusCell?0:-1;
 });
 $('han-name').textContent=mode==='ai'?'컴퓨터':'플레이어 2';$('han-role').textContent=mode==='ai'?'한 · 漢  /  입문 난이도':'한 · 漢  /  두 번째로 두는 쪽';$('cho-name').innerHTML=mode==='ai'?'나 <span class="you-label">YOU</span>':'플레이어 1';
 $('han-turn').hidden=turn!=='han'||!!result;$('cho-turn').hidden=turn!=='cho'||!!result;$('han-turn').textContent=thinking?'생각하는 중':'한의 차례';$('cho-turn').textContent=mode==='ai'?'내 차례':'초의 차례';
 $('status-title').textContent=result||(checked?`${turn==='cho'?'초':'한'}, 장군입니다!`:thinking?'컴퓨터가 생각하고 있어요':`${turn==='cho'?'초':'한'}의 차례입니다`);
 $('status-detail').textContent=result?'새 대국을 시작하거나 이전 수로 돌아가세요.':checked?'궁을 지킬 수 있는 수를 두세요.':J.facing(board)?'빅장입니다. 해소하거나 쉼으로 무승부를 수락하세요.':thinking?'어떤 수를 둘지 살펴보고 있어요.':selected?`${names[board[selected[0]][selected[1]].t]} · 표시된 곳으로 이동할 수 있어요.`:records.length?'말을 선택하고 다음 수를 이어가세요.':'파란 말을 선택해 첫 수를 두세요.';
 $('undo').disabled=!snapshots.length;$('pass').disabled=thinking||!!result||checked;$('move-count').textContent=records.length+'수';
 for(const s of ['cho','han'])$('captured-'+s).textContent=records.filter(m=>m.s===s&&m.captured).map(m=>glyph(m.captured)).join('');
 if(records.length){let html='';for(let n=0;n<records.length;n+=2){const notation=m=>!m?'—':m.pass?'한 수 쉼':`${glyph(m.p)} ${m.c+1}${m.r+1}→${m.x+1}${m.y+1}${m.captured?' ×':''}`;html+=`<div class="history-line"><span>${n/2+1}</span><span>${notation(records[n])}</span><span>${notation(records[n+1])}</span></div>`;}$('history').innerHTML=html;$('history').scrollTop=$('history').scrollHeight;}else $('history').innerHTML='<div class="empty-history"><span class="empty-symbol" aria-hidden="true">棋</span><p>한 수, 한 수 쌓이는 이야기</p><span>첫 수를 두면 기보가 여기에 남아요.</span></div>';
 for(const m of ['ai','local']){$('mode-'+m).classList.toggle('active',mode===m);$('mode-'+m).setAttribute('aria-pressed',String(mode===m));}
}
function selectCell(i){if(thinking||result)return;focusCell=i;const [r,c]=boardCoords(i),p=board[r][c];if(selected&&targets.some(([y,x])=>y===r&&x===c)){move({r:selected[0],c:selected[1],y:r,x:c});return;}if(p?.s===turn){if(selected?.[0]===r&&selected?.[1]===c){selected=null;targets=[];}else{selected=[r,c];targets=J.legal(board,r,c);}}else{selected=null;targets=[];}render();}
function save(){snapshots.push({board:board.map(row=>row.slice()),turn,passes,result,positions:positions.slice(),records:records.slice()});}
function move(m){save();if(m){records.push({...m,s:turn,p:board[m.r][m.c],captured:board[m.y][m.x]});board=J.moved(board,m.r,m.c,m.y,m.x);passes=0;}else{records.push({pass:true,s:turn});passes++;if(J.facing(board))result='빅장 수락 · 무승부';if(passes>=2)result='연속 한 수 쉼 · 무승부';}turn=J.other(turn);selected=null;targets=[];positions.push(key());if(!result&&positions.filter(k=>k===key()).length>=3)result='같은 국면 3회 · 무승부';if(!result&&J.check(board,turn)&&!J.moves(board,turn).length)result=`${turn==='cho'?'한':'초'} 승리 · 외통수`;render();schedule();}
function schedule(){if(mode!=='ai'||turn!=='han'||result)return;thinking=true;render();timer=setTimeout(()=>{thinking=false;const m=J.choose(board,turn);move(m);},450);}
function reset(nextMode=mode){clearTimeout(timer);thinking=false;mode=nextMode;board=J.initial($('formation').value);turn='cho';selected=null;targets=[];records=[];snapshots=[];result='';passes=0;positions=[key()];render();}
function requestReset(nextMode=mode){if(records.length&&!result){pending=nextMode;$('confirm-dialog').showModal();}else reset(nextMode);}
$('new-game').onclick=()=>requestReset();$('mode-ai').onclick=()=>{if(mode!=='ai')requestReset('ai');};$('mode-local').onclick=()=>{if(mode!=='local')requestReset('local');};
$('confirm-start').onclick=()=>{reset(pending);$('confirm-dialog').close();};$('confirm-cancel').onclick=()=>$('confirm-dialog').close();
$('undo').onclick=()=>{clearTimeout(timer);thinking=false;if(!snapshots.length)return;let state=snapshots.pop();if(mode==='ai'&&state.turn==='han'&&snapshots.length)state=snapshots.pop();({board,turn,passes,result,positions,records}=state);selected=null;targets=[];render();};
$('pass').onclick=()=>{if(!thinking&&!result&&!J.check(board,turn))move(null);};$('flip').onclick=()=>{flipped=!flipped;render();};$('rules-open').onclick=()=>$('rules-dialog').showModal();$('rules-close').onclick=()=>$('rules-dialog').close();
const tips=['포는 다른 말을 하나 넘어 움직여요.<br>단, 포를 넘거나 포를 잡을 수는 없어요.','마는 첫 길목에 말이 있으면 움직일 수 없어요.<br>이를 ‘멱이 막혔다’고 해요.','차는 궁성 안에서 대각선으로도 움직여요.<br>궁성의 X자 선을 잘 활용해 보세요.','장군이 아닐 때는 한 수 쉴 수 있어요.<br>두 쪽이 연속으로 쉬면 무승부예요.','상은 강을 건널 수 있어요. 장기판에는 강이 없죠!<br>이동 경로 두 곳이 모두 비어 있어야 해요.'];let tipIndex=0;$('tip-next').onclick=()=>{$('tip-text').innerHTML=tips[++tipIndex%tips.length];};
render();
