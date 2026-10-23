import {FISH,SPOTS,RODS,LURES,RIGS,getFish,getSpot,fishArt,spotArt} from './data.js';
import {clamp,compatible,chooseFish,sampleSize,createFight,stepFight,SAVE_KEY,newSave,validateSave,recordCatch} from './mechanics.js';
import {FishingView} from './scene.js';
import {formatFishWeight} from './format.js';
const $=id=>document.getElementById(id);
let save,storageWarning='';
try{const raw=localStorage.getItem(SAVE_KEY);save=raw?validateSave(JSON.parse(raw)):newSave();}catch{save=newSave();storageWarning='無法讀取先前紀錄；你可以繼續遊玩，或在設定匯入備份。';}
const game={save,spot:getSpot(save.loadout.spot),phase:'setup',phaseTime:0,power:0,reeling:false,paused:false,fish:null,size:null,fight:null,wait:0,castId:'',accumulator:0,lastTwitch:-1};
const view=new FishingView($('scene'));
let held=false,audio=null,lastFrame=0,uiClock=0,pausedByDialog=false;
const phaseInfo={setup:['READY TO CAST','準備好了，就拋一竿。','按住拋竿'],charging:['FIND YOUR DISTANCE','放開，讓路亞飛向水面。','放開拋出'],casting:['ON ITS WAY','漂亮的一竿。','拋投中…'],waiting:['A MOMENT BY THE WATER','慢慢收餌，等一個訊號。','輕點逗餌'],bite:['NOW, SET THE HOOK!','咬鉤了！現在揚竿！','立即揚竿！'],fighting:['KEEP IT IN BALANCE','穩住拉力，把魚慢慢帶回來。','按住捲線'],landing:['YOUR LITTLE VICTORY','牠來了，準備起魚！','起魚中…'],result:['A STORY TO KEEP','把這次相遇，收進圖鑑。','查看魚獲'],escaped:['THE NEXT CAST AWAITS','沒關係，再拋一竿。','再試一次']};
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(game.save));storageWarning='';return true;}catch{storageWarning='本次進度尚未保存：瀏覽器儲存空間無法使用，請到設定匯出備份。';announce(storageWarning);return false;}}
function announce(message){$('announcement').textContent=message;}
function tone(kind){if(!game.save.settings.sound)return;try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume().catch(()=>{});const osc=audio.createOscillator(),gain=audio.createGain();osc.type='sine';osc.frequency.setValueAtTime(kind==='bite'?880:kind==='catch'?523:kind==='escape'?180:330,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(kind==='catch'?1046:kind==='bite'?1200:220,audio.currentTime+.18);gain.gain.setValueAtTime(.035,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.35);osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(audio.currentTime+.36);}catch{/* Audio is optional. */}}
function applySettings(){document.body.classList.toggle('reduced-motion',game.save.settings.reducedMotion);$('sound').checked=game.save.settings.sound;$('reduced-motion').checked=game.save.settings.reducedMotion;}
function updateStats(){$('total-catches').textContent=String(game.save.total).padStart(2,'0');$('journal-count').textContent=`${Object.keys(game.save.collection).length} / ${FISH.length}`;}
function renderSpots(){
  $('spots').innerHTML=SPOTS.map(spot=>`<button class="spot-card ${spot.id===game.spot.id?'selected':''}" data-spot="${spot.id}" aria-pressed="${spot.id===game.spot.id}"><span class="spot-thumb">${spotArt(spot.theme)}</span><span><strong>${spot.name}</strong><small>${spot.english}</small></span></button>`).join('');
  for(const el of $('spots').querySelectorAll('button')){el.disabled=game.phase!=='setup';el.addEventListener('click',()=>{if(game.phase!=='setup')return;game.spot=getSpot(el.dataset.spot);game.save.loadout.spot=game.spot.id;persist();updateSpot();renderSpots();});}
}
function updateSpot(){$('scene-name').textContent=game.spot.name;$('scene-caption').textContent=game.spot.caption;$('weather-text').textContent=game.spot.weather;$('spot-description').textContent=game.spot.description;}
function renderLoadout(){
  const l=game.save.loadout,rod=RODS.find(r=>r.id===l.rod);
  $('rod').innerHTML=RODS.map(r=>`<option value="${r.id}">${r.name}</option>`).join('');$('rod').value=l.rod;
  $('lure').innerHTML=LURES.map(b=>`<option value="${b.id}" ${compatible(rod,b)?'':'disabled'}>${b.name}${compatible(rod,b)?'':'（不適用此竿）'}</option>`).join('');$('lure').value=l.lure;
  const rigs=l.lure==='soft'?['jighead','texas']:['direct'];if(!rigs.includes(l.rig))l.rig=rigs[0];
  $('rig').innerHTML=rigs.map(id=>`<option value="${id}">${RIGS[id]}</option>`).join('');$('rig').value=l.rig;$('rod-note').textContent=rod.note;$('loadout-note').textContent=LURES.find(b=>b.id===l.lure).note;
  ['rod','lure','rig'].forEach(id=>$(id).disabled=game.phase!=='setup');
}
function setPhase(next,message=''){
  if(next==='setup')game.power=0;
  game.phase=next;game.phaseTime=0;game.reeling=false;game.accumulator=0;
  const [label,instruction,button]=phaseInfo[next];$('phase-label').textContent=label;$('instruction').textContent=instruction;$('action-text').textContent=button;
  $('action').disabled=['casting','landing','result'].includes(next);$('bite-alert').hidden=next!=='bite';$('fight-details').hidden=next!=='fighting';
  $('meter').classList.toggle('fighting',next==='fighting');$('meter').classList.remove('danger');
  const help={setup:'按住蓄力，放開拋出。',charging:'選擇力道，放開就會拋出。',casting:'讓路亞自然落水。',waiting:'輕點逗餌，看到「！」立刻按下。',bite:'就是現在！按下按鈕揚竿。',fighting:'按住捲線，放開洩力。',landing:'最後一段，慢慢帶回岸邊。',result:'魚獲已登錄，可以放心放流。',escaped:'每一次拋投，都有新的機會。'};
  $('action-help').innerHTML=`${help[next]}<br><small>空白鍵與觸控都能操作</small>`;
  $('meter-name').textContent=next==='fighting'?'釣線拉力':next==='waiting'?'水下動靜':next==='bite'?'揚竿時機':'拋投力道';
  $('meter-left').textContent=next==='fighting'?'過鬆 · 小心脫鉤':next==='waiting'?'慢慢等待':'輕拋';$('meter-right').textContent=next==='fighting'?'過緊 · 小心斷線':next==='waiting'?'保持觀察':'遠投';
  $('scene-status').textContent={setup:'水面平靜，適合拋竿',charging:'感受力道，準備拋投',casting:'路亞飛行中',waiting:'路亞在水下游動',bite:'魚咬鉤了！',fighting:'跟著魚的節奏，穩住拉力',landing:'魚正在靠近岸邊',result:'又多了一段水岸故事',escaped:'深呼吸，還有下一竿'}[next];
  $('round-label').textContent=`第 ${String(game.save.casts+(next==='setup'?1:0)).padStart(2,'0')} 次拋投`;
  renderSpots();['rod','lure','rig'].forEach(id=>$(id).disabled=next!=='setup');announce(message||storageWarning);updateMeter();
}
function updateMeter(){
  let value=game.power,text=game.phase==='setup'?'按住蓄力':`${Math.round(game.power*100)}%`;
  if(game.phase==='waiting'){value=.18+Math.sin(game.phaseTime*2)*.035;text='觀察水面';}
  if(game.phase==='bite'){value=clamp(1-game.phaseTime/1.35,0,1);text='現在揚竿！';}
  if(game.phase==='fighting'){
    const f=game.fight;value=f.tension;text=game.reeling?'捲線中':'正在洩力';
    const warning=f.burstClock>f.burstAt-.45&&f.burstClock<f.burstAt+1.15;
    if(warning){text='魚要衝刺，準備洩力！';$('scene-status').textContent='水花變大了，魚正在衝刺！';}else $('scene-status').textContent='跟著魚的節奏，穩住拉力';
    $('stamina').textContent=`${Math.ceil(f.stamina/f.maxStamina*100)}%`;$('distance').textContent=`${f.distance.toFixed(1)} m`;
    $('meter').classList.toggle('danger',value>.83||value<.15);
  }
  $('meter-fill').style.width=`${value*100}%`;$('meter-marker').style.left=`${value*100}%`;$('meter-value').textContent=text;
  $('meter').setAttribute('aria-valuenow',String(Math.round(value*100)));$('meter').setAttribute('aria-label',$('meter-name').textContent);
}
function onDown(){
  if(held||game.paused||document.querySelector('dialog[open]'))return;held=true;
  if(game.phase==='setup'){game.power=.05;setPhase('charging');}
  else if(game.phase==='waiting'){if(game.phaseTime-game.lastTwitch>.65){game.lastTwitch=game.phaseTime;game.wait=Math.max(.35,game.wait-.5);announce('輕抽一下，讓路亞換個泳姿。');tone('twitch');}}
  else if(game.phase==='bite'){
    game.fight=createFight(game.fish,game.size,game.power);setPhase('fighting','揚竿成功！先觀察拉力，再按住捲線。');tone('hook');
  }
  else if(game.phase==='fighting')game.reeling=true;
  else if(game.phase==='escaped'){setPhase('setup');held=false;}
}
function onUp(){if(!held)return;held=false;game.reeling=false;if(game.paused)return;if(game.phase==='charging'){
  game.save.casts++;game.castId=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
  game.fish=chooseFish(game.spot,game.save.loadout.lure,game.save.loadout.rig);game.size=sampleSize(game.fish);persist();tone('cast');setPhase('casting');
}}
function cancelHold(){held=false;game.reeling=false;if(game.phase==='charging')setPhase('setup','已取消這次蓄力。');}
function setPaused(value){if(value)cancelHold();game.paused=value;$('pause-overlay').hidden=!value;$('pause').textContent=value?'▷':'Ⅱ';$('pause').setAttribute('aria-label',value?'繼續遊戲':'暫停遊戲');}
function showDialog(id){if(document.querySelector('dialog[open]'))return;pausedByDialog=!game.paused;setPaused(true);if(id==='journal-dialog')renderCollection();$(id).showModal();}
function showCatch(){
  const result=recordCatch(game.save,game.castId,game.fish,game.size);persist();updateStats();
  $('catch-art').innerHTML=fishArt(game.fish);$('catch-name').textContent=game.fish.name;$('catch-scientific').textContent=game.fish.scientific;$('catch-location').textContent=`${game.spot.name} · ${LURES.find(l=>l.id===game.save.loadout.lure).name}`;
  $('catch-length').textContent=game.size.length.toFixed(1);$('catch-weight').textContent=formatFishWeight(game.size.weight);$('catch-weight-unit').textContent='重量';
  $('catch-badge').textContent=result.isNew?'初次相遇':result.record?'刷新紀錄':'再次相遇';$('catch-note').textContent=storageWarning||`${result.isNew?'新魚種已收進圖鑑。':result.record?'今天，超越了昨天的自己。':'每次相遇，都值得紀念。'} 謝謝牠陪你度過這段水岸時光。`;
  setPhase('result');tone('catch');showDialog('catch-dialog');
}
function renderCollection(){const found=Object.keys(game.save.collection).length;$('collection-progress').textContent=`${found} / ${FISH.length}`;$('collection-grid').innerHTML=FISH.map(f=>{const r=game.save.collection[f.id];return `<article class="fish-card ${r?'':'unknown'}">${fishArt(f,!r)}<h3>${r?f.name:'尚未相遇'}</h3><p>${r?f.habitat:'在不同釣點與擬餌之間，尋找新的驚喜。'}</p><p class="record">${r?`最佳 ${r.bestLength.toFixed(1)} cm · ${formatFishWeight(r.bestWeight)}<br>累計相遇 ${r.count} 次`:'等待登錄'}</p></article>`;}).join('');}
function step(dt){
  if(game.paused)return;game.phaseTime+=dt;
  if(game.phase==='charging')game.power=.05+.95*(.5-.5*Math.cos(game.phaseTime*2.5));
  else if(game.phase==='casting'&&game.phaseTime>=.85){game.wait=4+Math.random()*5;game.lastTwitch=-1;setPhase('waiting');}
  else if(game.phase==='waiting'){game.wait-=dt;if(game.wait<=0){setPhase('bite');tone('bite');}}
  else if(game.phase==='bite'&&game.phaseTime>=1.35){setPhase('escaped','剛剛的魚離開了。下一次看到驚嘆號時，立刻揚竿。');tone('escape');}
  else if(game.phase==='fighting'){
    game.accumulator+=dt;const rod=RODS.find(r=>r.id===game.save.loadout.rod);
    while(game.accumulator>=1/60){stepFight(game.fight,game.fish,rod,game.reeling,1/60);game.accumulator-=1/60;}
    const result=game.fight.outcome;if(result==='caught')setPhase('landing');else if(result){setPhase('escaped',{break:'拉力太高，釣線斷了。下次魚衝刺時先放開洩力。',slack:'釣線太鬆，魚脫鉤了。下次記得適時捲線。',distance:'魚游得太遠了。下次試著縮短放線時間。'}[result]);tone('escape');}
  }else if(game.phase==='landing'&&game.phaseTime>=1.25)showCatch();
}
function frame(now){const dt=Math.min((now-lastFrame)/1000||0,.05);lastFrame=now;step(dt);view.draw(game,dt);uiClock+=dt;if(uiClock>.05){updateMeter();uiClock=0;}requestAnimationFrame(frame);}
for(const id of ['rod','lure','rig'])$(id).addEventListener('change',()=>{if(game.phase!=='setup')return;game.save.loadout[id]=$(id).value;const rod=RODS.find(r=>r.id===game.save.loadout.rod),lure=LURES.find(b=>b.id===game.save.loadout.lure);if(!compatible(rod,lure))game.save.loadout.lure=LURES.find(b=>compatible(rod,b)).id;renderLoadout();persist();});
$('action').addEventListener('pointerdown',e=>{if(e.button!==0)return;e.preventDefault();$('action').focus({preventScroll:true});$('action').setPointerCapture(e.pointerId);onDown();});
window.addEventListener('pointerup',onUp);$('action').addEventListener('pointercancel',cancelHold);$('action').addEventListener('lostpointercapture',()=>{if(held)cancelHold();});
// Enter / assistive click provides a toggle alternative to holding the pointer.
$('action').addEventListener('click',e=>{if(e.detail!==0||game.paused)return;if(held)onUp();else if(game.phase==='fighting'){game.reeling=!game.reeling;}else onDown();});
window.addEventListener('keydown',e=>{if(e.code!=='Space'||e.repeat||document.querySelector('dialog[open]')||/^(SELECT|INPUT|TEXTAREA|BUTTON)$/.test(e.target.tagName)&&e.target!==$('action'))return;e.preventDefault();onDown();});
window.addEventListener('keyup',e=>{if(e.code==='Space'){e.preventDefault();onUp();}});
window.addEventListener('blur',()=>setPaused(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)setPaused(true);});
$('pause').addEventListener('click',()=>setPaused(!game.paused));$('resume').addEventListener('click',()=>setPaused(false));
[['journal-open','journal-dialog'],['settings-open','settings-dialog'],['help-open','help-dialog']].forEach(([button,dialog])=>$(button).addEventListener('click',()=>showDialog(dialog)));
document.querySelectorAll('.close-dialog').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('close',()=>{if(dialog.id==='catch-dialog'&&game.phase==='result')setPhase('setup');if(pausedByDialog){setPaused(false);pausedByDialog=false;}}));
$('catch-close').addEventListener('click',()=>$('catch-dialog').close());
$('sound').addEventListener('change',()=>{game.save.settings.sound=$('sound').checked;persist();tone('catch');});$('reduced-motion').addEventListener('change',()=>{game.save.settings.reducedMotion=$('reduced-motion').checked;applySettings();persist();});
$('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(game.save,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`tamsui-fishing-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('settings-message').textContent='備份已匯出，請妥善保存這個檔案。';});
$('import').addEventListener('click',()=>{if(game.phase!=='setup'){$('settings-message').textContent='請先完成或結束這一竿，再匯入紀錄。';return;}$('import-file').click();});
$('import-file').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>1024*1024)throw new Error('備份檔案過大');const imported=validateSave(JSON.parse(await file.text()));game.save=imported;game.spot=getSpot(imported.loadout.spot);renderSpots();renderLoadout();updateSpot();applySettings();updateStats();const saved=persist();$('settings-message').textContent=saved?'紀錄已匯入，已取代這個瀏覽器的原有進度。':storageWarning;}catch(error){$('settings-message').textContent=`無法匯入：${error.message}`;}finally{e.target.value='';}});
$('meter').setAttribute('role','progressbar');$('meter').setAttribute('aria-valuemin','0');$('meter').setAttribute('aria-valuemax','100');
renderSpots();renderLoadout();updateSpot();applySettings();updateStats();setPhase('setup');requestAnimationFrame(frame);
