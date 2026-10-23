import test from 'node:test';
import assert from 'node:assert/strict';
import {FISH,SPOTS,RODS,LURES} from '../src/data.js';
import {sampleSize,compatible,chooseFish,encounterWeights,createFight,stepFight,newSave,recordCatch,validateSave} from '../src/mechanics.js';
function rng(seed=1234){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
test('all spots and compatible lure loadouts have reachable fish',()=>{
  for(const spot of SPOTS)for(const rod of RODS)for(const lure of LURES){if(!compatible(rod,lure))continue;const entries=encounterWeights(spot,lure.id);assert.ok(entries.length>0);for(let i=0;i<20;i++)assert.ok(spot.pool[chooseFish(spot,lure.id,'direct',rng(i)).id]>0);}
});
test('length distribution and conditional weight remain within species bounds',()=>{
  const random=rng();for(const fish of FISH){const lengths=[];for(let i=0;i<1000;i++){const s=sampleSize(fish,random);assert.ok(s.length>=fish.length[0]&&s.length<=fish.length[3]);const condition=s.weight/(fish.k*s.length**3/100);assert.ok(condition>=.9&&condition<=1.1);lengths.push(s.length);}const mean=lengths.reduce((a,b)=>a+b)/lengths.length;assert.ok(Math.abs(mean-fish.length[1])<fish.length[2]*.2);}
});
test('every fish can be landed with every rod using tension control',()=>{
  for(const fish of FISH)for(const rod of RODS){const size={length:fish.length[3]},fight=createFight(fish,size,.95);let reel=false;for(let i=0;i<60*150&&!fight.outcome;i++){if(fight.tension<.38)reel=true;if(fight.tension>.66)reel=false;stepFight(fight,fish,rod,reel,1/60);}assert.equal(fight.outcome,'caught',`${fish.id}/${rod.id}`);}
});
test('uncontrolled reeling breaks the line, no reeling causes slack',()=>{
  for(const [reel,expected] of [[true,'break'],[false,'slack']]){const f=createFight(FISH[0],{length:28},.5);for(let i=0;i<3600&&!f.outcome;i++)stepFight(f,FISH[0],RODS[2],reel,1/60);assert.equal(f.outcome,expected);}
});
test('equivalent simulated time at 30 and 60 fps produces same fight',()=>{
  function simulate(frameDt){const f=createFight(FISH[0],{length:28},.5);let accumulator=0;for(let t=0;t<2-.0001;t+=frameDt){accumulator+=frameDt;while(accumulator>=1/60){stepFight(f,FISH[0],RODS[2],true,1/60);accumulator-=1/60;}}return f;}
  const a=simulate(1/30),b=simulate(1/60);assert.ok(Math.abs(a.tension-b.tension)<1e-8);assert.ok(Math.abs(a.stamina-b.stamina)<1e-8);
});
test('catch persistence is idempotent and import preserves records',()=>{
  const save=newSave(),fish=FISH[0],size={length:28,weight:420};assert.ok(recordCatch(save,'one',fish,size).isNew);assert.ok(recordCatch(save,'one',fish,size).duplicate);assert.equal(save.total,1);recordCatch(save,'two',fish,{length:30,weight:510});assert.equal(save.total,2);assert.equal(save.collection.seabream.bestLength,30);assert.deepEqual(validateSave(JSON.parse(JSON.stringify(save))).collection,save.collection);
});
test('invalid imported data is rejected and incompatible gear is repaired',()=>{
  assert.throws(()=>validateSave({version:9,collection:{}}));const save=newSave();recordCatch(save,'x',FISH[0],{length:28,weight:400});save.collection.seabream.bestLength=-1;assert.throws(()=>validateSave(save));const gear=newSave();gear.loadout={spot:'missing',rod:'ul',lure:'jig',rig:'texas'};const result=validateSave(gear);assert.equal(result.loadout.spot,'wharf');assert.ok(compatible(RODS[0],LURES.find(l=>l.id===result.loadout.lure)));
});
