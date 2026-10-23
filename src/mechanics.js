import { FISH, RODS, LURES, SPOTS } from './data.js';
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function normal(random=Math.random){const u=Math.max(Number.EPSILON,random()),v=random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
export function truncatedNormal(mean,sd,min,max,random=Math.random){
  for(let i=0;i<128;i++){const n=mean+normal(random)*sd;if(n>=min&&n<=max)return n;}
  return clamp(mean,min,max);
}
export function sampleSize(fish,random=Math.random){const [min,mean,sd,max]=fish.length;const length=truncatedNormal(mean,sd,min,max,random);const condition=truncatedNormal(1,.05,.9,1.1,random);return {length,weight:fish.k*length**3/100*condition};}
export function compatible(rod,lure){return lure.weight>=rod.min&&lure.weight<=rod.max;}
export function encounterWeights(spot,lureId,rig='direct'){
  return FISH.map(f=>({fish:f,weight:(spot.pool[f.id]||0)*(f.affinity[lureId]||0)*(rig==='texas'&&f.id==='grouper'?1.15:1)})).filter(f=>f.weight>0);
}
export function chooseFish(spot,lureId,rig='direct',random=Math.random){
  const entries=encounterWeights(spot,lureId,rig),sum=entries.reduce((a,b)=>a+b.weight,0);if(!sum)throw new Error('這組釣組在此處沒有可釣魚種');
  let r=random()*sum;for(const entry of entries){r-=entry.weight;if(r<0)return entry.fish;}return entries.at(-1).fish;
}
export function createFight(fish,size,castPower){return {tension:.43,stamina:fish.stamina*(.8+size.length/fish.length[1]*.2),maxStamina:fish.stamina*(.8+size.length/fish.length[1]*.2),distance:12+castPower*12,highTime:0,lowTime:0,burstClock:0,burstAt:3.8,elapsed:0,outcome:null};}
// Deterministic model, stepped at 1/60 s by the game controller.
export function stepFight(f,fish,rod,reeling,dt){
  if(f.outcome)return f;
  f.elapsed+=dt;f.burstClock+=dt;
  const burst=f.burstClock>f.burstAt&&f.burstClock<f.burstAt+1.15;
  if(f.burstClock>f.burstAt+1.5){f.burstClock=0;f.burstAt=3.2+(fish.power*1.7);}
  const fatigue=.5+.5*(f.stamina/f.maxStamina);
  const pull=(.025+fish.power*.035)*fatigue+(burst?.17+fish.power*.08:0);
  f.tension=clamp(f.tension+((reeling?.19/rod.control:-.23*rod.control)+pull)*dt,0,1);
  const effective=f.tension>=.2&&f.tension<=.82;
  if(reeling&&effective){f.stamina=Math.max(0,f.stamina-(6.8*rod.power)*dt);f.distance=Math.max(.4,f.distance-(1.65*rod.power)*(burst?.45:1)*dt);}
  else if(!reeling){f.stamina=Math.min(f.maxStamina,f.stamina+.7*dt);f.distance+=.35*fatigue*dt;}
  if(burst)f.distance+=.3*dt;
  f.highTime=f.tension>.95?f.highTime+dt:Math.max(0,f.highTime-dt*2);
  f.lowTime=f.tension<.07?f.lowTime+dt:Math.max(0,f.lowTime-dt*2);
  if(f.highTime>.65)f.outcome='break';else if(f.lowTime>1.6)f.outcome='slack';else if(f.distance>45)f.outcome='distance';else if(f.stamina<=0&&f.distance<=1)f.outcome='caught';
  return f;
}
export const SAVE_KEY='tamsui-fishing:save:v1';
export function newSave(){return {version:1,collection:{},total:0,casts:0,loadout:{spot:'wharf',rod:'ml',lure:'soft',rig:'jighead'},settings:{sound:false,reducedMotion:false},recentCatchIds:[]};}
export function validateSave(raw){
  if(!raw||raw.version!==1||!raw.collection||typeof raw.collection!=='object'||Array.isArray(raw.collection))throw new Error('無法辨識的存檔格式');
  const save=newSave();let total=0;
  for(const fish of FISH){const r=raw.collection[fish.id];if(!r)continue;
    const [min,,,max]=fish.length;
    if(!Number.isSafeInteger(r.count)||r.count<1||r.count>1e8||!Number.isFinite(r.bestLength)||r.bestLength<min||r.bestLength>max||!Number.isFinite(r.bestWeight)||r.bestWeight<fish.k*min**3/100*.89||r.bestWeight>fish.k*max**3/100*1.11||typeof r.firstAt!=='string'||!Number.isFinite(Date.parse(r.firstAt)))throw new Error('魚獲紀錄的數值不正確');
    save.collection[fish.id]={count:r.count,bestLength:r.bestLength,bestWeight:r.bestWeight,firstAt:r.firstAt};total+=r.count;
  }
  save.total=total;save.casts=Number.isSafeInteger(raw.casts)&&raw.casts>=0?Math.max(raw.casts,total):total;
  const l=raw.loadout||{};const rod=RODS.find(r=>r.id===l.rod)||RODS[2];const lure=LURES.find(b=>b.id===l.lure&&compatible(rod,b))||LURES.find(b=>compatible(rod,b));
  save.loadout={spot:SPOTS.some(s=>s.id===l.spot)?l.spot:'wharf',rod:rod.id,lure:lure.id,rig:lure.id==='soft'?(l.rig==='texas'?'texas':'jighead'):'direct'};
  save.settings={sound:raw.settings?.sound===true,reducedMotion:raw.settings?.reducedMotion===true};
  save.recentCatchIds=Array.isArray(raw.recentCatchIds)?raw.recentCatchIds.filter(x=>typeof x==='string'&&x.length<100).slice(-64):[];
  return save;
}
export function recordCatch(save,catchId,fish,size,now=new Date().toISOString()){
  if(save.recentCatchIds.includes(catchId))return {duplicate:true};
  const old=save.collection[fish.id],isNew=!old,record=!!old&&(size.length>old.bestLength||size.weight>old.bestWeight);
  save.collection[fish.id]={count:(old?.count||0)+1,bestLength:Math.max(old?.bestLength||0,size.length),bestWeight:Math.max(old?.bestWeight||0,size.weight),firstAt:old?.firstAt||now};save.total++;save.recentCatchIds.push(catchId);save.recentCatchIds=save.recentCatchIds.slice(-64);
  return {isNew,record,duplicate:false};
}
