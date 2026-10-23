const TAU=Math.PI*2;
export class FishingView {
  constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.time=0;this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(canvas);this.resize();}
  resize(){const rect=this.canvas.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,2);this.canvas.width=Math.round(rect.width*dpr);this.canvas.height=Math.round(rect.height*dpr);}
  path(points,fill,stroke,width=1){const c=this.ctx;c.beginPath();points(c);if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke();}}
  ellipse(x,y,rx,ry,color,rotation=0){const c=this.ctx;c.beginPath();c.ellipse(x,y,rx,ry,rotation,0,TAU);c.fillStyle=color;c.fill();}
  line(x1,y1,x2,y2,color,width=1){this.path(c=>{c.moveTo(x1,y1);c.lineTo(x2,y2);},null,color,width);}
  draw(game,dt){
    if(!game.paused)this.time+=dt;
    const c=this.ctx,t=game.save.settings.reducedMotion?0:this.time,creek=game.spot.theme==='creek',estuary=game.spot.theme==='estuary';
    // Preserve illustration proportions on narrow screens; frame the angler and water.
    const scale=Math.max(this.canvas.width/1000,this.canvas.height/520);
    c.setTransform(scale,0,0,scale,(this.canvas.width-1000*scale)*.85,this.canvas.height-520*scale);c.clearRect(0,0,1000,520);
    const sky=c.createLinearGradient(0,0,0,300);sky.addColorStop(0,creek?'#c2d5c6':'#d2d7c6');sky.addColorStop(.6,creek?'#e4e4c6':'#efd8b3');sky.addColorStop(1,'#e8c59a');c.fillStyle=sky;c.fillRect(0,0,1000,520);
    this.ellipse(creek?700:675,142,37,37,'#fff0bdbb');this.ellipse(creek?700:675,142,61,61,'#fff0bd12');
    this.path(p=>{p.moveTo(0,240);p.bezierCurveTo(90,200,150,205,230,183);p.bezierCurveTo(320,150,330,220,450,224);p.bezierCurveTo(530,190,580,185,640,208);p.bezierCurveTo(760,172,800,181,1000,217);p.lineTo(1000,300);p.lineTo(0,300);},'#a6b5a480');
    this.path(p=>{p.moveTo(0,263);p.bezierCurveTo(170,234,206,216,292,237);p.bezierCurveTo(410,260,460,247,540,245);p.bezierCurveTo(630,219,705,240,770,244);p.bezierCurveTo(880,204,940,235,1000,224);p.lineTo(1000,310);p.lineTo(0,310);},creek?'#829d82':'#a4b3a1');
    const water=c.createLinearGradient(0,260,0,520);water.addColorStop(0,creek?'#94b7a7':'#99bbb0');water.addColorStop(.5,creek?'#669b90':'#73a299');water.addColorStop(1,creek?'#3e7a75':'#518e87');c.fillStyle=water;c.fillRect(0,268,1000,252);
    // Soft sunlight across the water, with thin horizontal reflections.
    for(let i=0;i<55;i++){const y=276+i*4.25,x=675+Math.sin(i*17.3+t*.6)*(10+i*.75);this.line(x-(i*.7+5),y,x+(i*.7+5),y,'#f3e0b02a',1.5);}
    for(let i=0;i<65;i++){const x=(i*149.7+t*(i%3+1)*2)%1060-30,y=280+(i*19.83)%240;const len=12+(i%7)*8;this.line(x,y+Math.sin(t+i)*.8,x+len,y+Math.sin(t+i)*.8,i%4===0?'#e1e6c854':'#325f5e20',i%3===0?1.3:.7);}
    if(creek)this.drawCreek(t);else if(estuary)this.drawEstuary(t);else this.drawHarbor(t);
    // Birds drift above the far bank.
    for(let i=0;i<4;i++){const x=(180+i*183+t*6)%1100-50,y=140+i*14;this.path(p=>{p.moveTo(x-7,y+2);p.quadraticCurveTo(x-3,y-2-Math.sin(t*2+i)*2,x,y+1);p.quadraticCurveTo(x+4,y-3-Math.sin(t*2+i)*2,x+8,y);},null,'#59756d70',1.3);}
    this.drawForeground(creek,estuary);
    this.drawAngler(game,t);
    // Calm grain-like texture, deterministic and subtle.
    c.fillStyle='#fff8df09';for(let i=0;i<140;i++)c.fillRect((i*97.3)%1000,(i*63.7)%520,1,1);
  }
  drawHarbor(t){
    const c=this.ctx;
    c.save();if(this.canvas.width/this.canvas.height<1.5)c.translate(190,0);
    // The white sail-shaped Lover's Bridge, softened by distance.
    this.path(p=>{p.moveTo(80,270);p.lineTo(520,270);p.lineTo(564,278);p.lineTo(73,278);},'#e3e5d1');
    this.path(p=>{p.moveTo(351,270);p.lineTo(363,151);p.lineTo(372,270);},'#f5eed8');
    for(let i=0;i<10;i++){this.line(363,164+i*6,111+i*22,270,'#f6efd7a0',1.3);this.line(366,163+i*7,509-i*13,270,'#f6efd7a0',1.2);}
    this.line(80,267,523,267,'#f9eed4',2);[104,275,443,514].forEach(x=>this.line(x,276,x-2,294,'#8caaa0',5));c.restore();
    // Tiny harbor buildings and sailboats.
    c.fillStyle='#9caa93';for(let i=0;i<7;i++){c.fillRect(750+i*32,253-i%3*6,25,17+i%3*6);this.line(753+i*32,253-i%3*6,770+i*32,253-i%3*6,'#dedbc0',2);}
    this.drawBoat(640+Math.sin(t*.15)*4,290,1);this.drawBoat(149,311,.55);
    for(let i=0;i<4;i++)this.line(787+i*45,275,787+i*45,291,'#dae3cf66',2);
  }
  drawBoat(x,y,s){const c=this.ctx;c.save();c.translate(x,y);c.scale(s,s);this.path(p=>{p.moveTo(-29,0);p.lineTo(32,0);p.lineTo(20,11);p.lineTo(-17,11);p.closePath();},'#e6e6cc');this.line(1,-43,1,0,'#627f74',1);this.path(p=>{p.moveTo(-2,-41);p.lineTo(-2,-4);p.lineTo(-24,-4);p.closePath();},'#f3ecd6');this.path(p=>{p.moveTo(4,-32);p.lineTo(4,-5);p.lineTo(21,-5);p.closePath();},'#d7dac2');c.restore();}
  drawEstuary(t){
    const c=this.ctx;
    this.path(p=>{p.moveTo(0,288);p.quadraticCurveTo(125,274,220,301);p.lineTo(340,325);p.quadraticCurveTo(146,328,0,363);},'#b9b69a');
    this.path(p=>{p.moveTo(0,298);p.quadraticCurveTo(153,291,234,314);p.quadraticCurveTo(101,324,0,339);},'#8d9c7e');
    for(let i=0;i<26;i++){const x=i*8,y=300+Math.sin(i)*7;this.line(x,y,x+Math.sin(t+i)*2,y-14-i%4*3,'#728f6d',1.5);}
    this.path(p=>{p.moveTo(830,278);p.quadraticCurveTo(918,249,1000,255);p.lineTo(1000,326);},'#8d9d7d');
    for(let i=0;i<9;i++){const x=853+i*20;this.line(x,281,x-2,255,'#7b8c6c',3);this.ellipse(x,251,16,13,'#8c9d7b');}
    this.drawBoat(520+Math.sin(t*.1)*5,285,.5);
    this.line(335,265,714,265,'#b8c2aa',2);for(let i=0;i<5;i++)this.line(376+i*65,265,376+i*65,277,'#a2b4a1',2);
  }
  drawCreek(t){
    const c=this.ctx;
    this.path(p=>{p.moveTo(0,260);p.quadraticCurveTo(290,240,398,279);p.quadraticCurveTo(220,292,150,360);p.quadraticCurveTo(70,407,0,425);},'#7d9674');
    this.path(p=>{p.moveTo(1000,242);p.quadraticCurveTo(828,248,755,279);p.quadraticCurveTo(891,307,925,370);p.lineTo(1000,395);},'#718d6b');
    for(let i=0;i<19;i++){const x=i*22,y=260+Math.sin(i*.7)*10;this.line(x,y,x,y-22,'#677e5f',4);this.ellipse(x,y-25,26,18,i%2?'#8ca77b':'#78956c');}
    for(let i=0;i<10;i++){const x=808+i*24,y=261-i*2;this.line(x,y,x,y-35,'#718562',4);this.ellipse(x,y-42,28,27,i%2?'#8ea47a':'#829c70');}
    this.path(p=>{p.moveTo(370,278);p.quadraticCurveTo(548,238,793,270);},null,'#d3d6bb',6);
    this.line(375,269,789,261,'#b4bea0',1.5);for(let i=0;i<10;i++){const x=380+i*43;this.line(x,267,x,277,'#b4bea0',1.4);}
    for(let i=0;i<14;i++){const x=i<7?i*32:850+(i-7)*24,y=355+(i*37)%127;this.ellipse(x,y,17+i%4*5,8+i%3*3,i%2?'#9aa58b':'#b5b59b',-.12);}
    for(let i=0;i<8;i++){const x=210+i*80,y=342+(i*17)%120;this.path(p=>{p.moveTo(x-15,y);p.quadraticCurveTo(x,y+5+Math.sin(t+i),x+35,y);},null,'#dce5c44a',1.4);}
  }
  drawForeground(creek,estuary){
    const c=this.ctx;
    if(creek){this.path(p=>{p.moveTo(640,520);p.quadraticCurveTo(728,432,819,437);p.quadraticCurveTo(910,408,1000,426);p.lineTo(1000,520);},'#78856b');this.path(p=>{p.moveTo(697,520);p.lineTo(814,457);p.lineTo(1000,449);p.lineTo(1000,520);},'#a5a38b');}
    else if(estuary){this.path(p=>{p.moveTo(536,520);p.lineTo(795,423);p.lineTo(1000,393);p.lineTo(1000,520);},'#929781');this.path(p=>{p.moveTo(570,520);p.lineTo(818,440);p.lineTo(1000,417);p.lineTo(1000,520);},'#a6a48b');for(let i=0;i<8;i++)this.ellipse(660+i*52,499-i*7,32,17,i%2?'#8a9280':'#b0ad92',-.2);}
    else {this.path(p=>{p.moveTo(570,520);p.lineTo(1000,383);p.lineTo(1000,520);},'#b3ac90');this.path(p=>{p.moveTo(570,520);p.lineTo(1000,383);p.lineTo(1000,396);p.lineTo(606,520);},'#d6ccb0');for(let i=0;i<5;i++){this.line(735+i*71,468-i*23,850+i*59,520,'#938e782f',1);}}
    // Reeds on the near bank frame the water.
    for(let i=0;i<20;i++){const x=12+i*6,y=520;this.path(p=>{p.moveTo(x,y);p.quadraticCurveTo(x+9,471-i%3*8,x-5+i%4*7,447-i%7*7);},null,i%2?'#526d57':'#647a5a',2);}
    // Fishing bag and a spare lure box.
    c.fillStyle='#60705c';c.fillRect(890,466,45,28);this.path(p=>{p.moveTo(899,466);p.quadraticCurveTo(903,452,922,466);},null,'#475f4d',3);c.fillStyle='#b8b595';c.fillRect(936,478,27,12);this.line(940,481,959,481,'#e3d6b5',1);
  }
  drawAngler(game,t){
    const c=this.ctx,phase=game.phase,active=['casting','waiting','bite','fighting','landing'].includes(phase),fight=game.fight;
    let tension=phase==='fighting'?fight.tension:phase==='bite'?.85:.1;
    const castProgress=phase==='casting'?Math.min(1,game.phaseTime/.85):1;
    const hand={x:823,y:398};let tip={x:703,y:292+tension*28};
    if(phase==='charging'){tip={x:871,y:275-game.power*22};}
    if(phase==='casting'){tip={x:871-168*Math.min(1,castProgress*2),y:260+32*castProgress};}
    const bob={x:phase==='fighting'?590+(1-fight.distance/28)*150:515+game.power*170,y:phase==='fighting'?350+(1-fight.distance/28)*53:342};
    const twitch=game.phaseTime-game.lastTwitch;
    if(phase==='waiting'&&twitch>=0&&twitch<.5){const action=Math.sin(twitch/.5*Math.PI);bob.x-=action*12;bob.y-=action*(game.save.loadout.lure==='soft'?13:6);}
    const wave=Math.sin(t*3)*2;
    if(active){
      let end={x:bob.x,y:bob.y+wave};
      if(phase==='casting'){const p=castProgress;end={x:hand.x+(bob.x-hand.x)*p,y:hand.y+(bob.y-hand.y)*p-Math.sin(p*Math.PI)*150};}
      if(phase==='landing'){end={x:bob.x+(hand.x-bob.x)*Math.min(1,game.phaseTime),y:bob.y-Math.sin(Math.min(1,game.phaseTime)*Math.PI)*150};this.drawFishSilhouette(end.x,end.y,game.fish.color,1.1);}
      this.path(p=>{p.moveTo(tip.x,tip.y);p.quadraticCurveTo((tip.x+end.x)/2,(tip.y+end.y)/2+(phase==='fighting'?2:18),end.x,end.y);},null,'#f3efd8b0',.95);
      if(phase!=='landing'){
        if(phase==='fighting'){this.ellipse(bob.x,bob.y+8,26,7,'#264d493b',-.15);this.drawFishSilhouette(bob.x,bob.y+9,'#305d5740',.7);}
        else this.ellipse(end.x,end.y,3.5,2.5,'#ead9a3',-.3);
        if(phase!=='casting'||castProgress>.85)for(let i=0;i<3;i++){const radius=((t*12+i*14)%44)+3,alpha=(1-radius/50)*.35;c.beginPath();c.ellipse(bob.x,bob.y+wave,radius,radius*.23,0,0,TAU);c.strokeStyle=`rgba(240,237,205,${alpha})`;c.lineWidth=1;c.stroke();}
        if(phase==='fighting'&&fight.burstClock>fight.burstAt-.45&&fight.burstClock<fight.burstAt+1.15){for(let i=0;i<7;i++){const a=i*.9+t*4;this.line(bob.x+Math.cos(a)*10,bob.y-3,bob.x+Math.cos(a)*22,bob.y-12-Math.sin(a)*6,'#e8e9c7aa',1.5);}}
      }
    }
    // Angler: rubber boots, trousers, relaxed jacket, brimmed hat.
    this.ellipse(843,469,35,6,'#3c594b35');
    this.line(843,428,832,463,'#344e48',11);this.line(854,428,859,462,'#3b554d',11);this.line(831,464,819,466,'#334d43',8);this.line(858,464,869,466,'#334d43',8);
    this.path(p=>{p.moveTo(830,379);p.quadraticCurveTo(846,373,859,382);p.lineTo(866,430);p.quadraticCurveTo(845,437,825,428);p.closePath();},'#d6c7a1');
    this.path(p=>{p.moveTo(848,383);p.lineTo(839,402);p.lineTo(820,402);},null,'#c4b58e',10);this.line(820,401,811,396,'#b99c77',6);
    this.ellipse(844,367,11,15,'#be9e76');this.path(p=>{p.moveTo(827,358);p.lineTo(834,343);p.quadraticCurveTo(846,338,855,345);p.lineTo(861,359);},'#7c8b6c');this.ellipse(844,358,27,4,'#667b61',-.06);
    this.line(850,382,852,422,'#b3aa86',1.5);
    // A curved rod bends continuously with tension.
    this.path(p=>{p.moveTo(833,410);p.lineTo(hand.x,hand.y);p.quadraticCurveTo(760,321-tension*25,tip.x,tip.y);},null,'#304f47',3);
    this.line(831,408,817,394,'#a77a53',5);
    this.ellipse(820,407,7,7,'#46675c');this.ellipse(820,407,4,4,'#bdc2a0');
    const reelAngle=game.reeling?t*17:0;this.line(820,407,820+Math.cos(reelAngle)*10,407+Math.sin(reelAngle)*10,'#344e46',2);this.ellipse(820+Math.cos(reelAngle)*10,407+Math.sin(reelAngle)*10,2,3,'#a2ad8c');
    if(phase==='casting'&&castProgress>.87){const p=(castProgress-.87)/.13;for(let i=0;i<6;i++){const a=i/6*Math.PI;this.ellipse(bob.x+Math.cos(a)*p*27,bob.y-Math.sin(a)*p*24,1.6,3,'#f5e9c7aa',a);}}
  }
  drawFishSilhouette(x,y,color,scale){const c=this.ctx;c.save();c.translate(x,y);c.rotate(-.25);c.scale(scale,scale);this.ellipse(0,0,19,6,color);this.path(p=>{p.moveTo(14,0);p.lineTo(28,-8);p.lineTo(26,8);p.closePath();},color);c.restore();}
}
