// Ecological references and the limits of this game model are documented in docs/DESIGN.md.
// All size distributions and encounter weights below are gameplay parameters, not surveys.
export const FISH = [
  {id:'seabream',name:'黑鯛',scientific:'Acanthopagrus schlegelii',color:'#8a9b9a',stripe:true,length:[15,27,6,44],k:1.9,power:.53,stamina:62,affinity:{soft:1.2,minnow:.65,pencil:.2,jig:.8,spoon:.7},shape:'deep',habitat:'河口與沿岸沙泥底，善於利用水流。'},
  {id:'jarbua',name:'花身雞魚',scientific:'Terapon jarbua',color:'#b1b79a',stripe:true,length:[10,19,4,30],k:1.5,power:.25,stamina:43,affinity:{soft:1.6,minnow:.9,pencil:.4,jig:1.1,spoon:1.2},shape:'deep',habitat:'沿岸與河口的小獵手，身上有醒目的弧形條紋。'},
  {id:'grouper',name:'點帶石斑魚',scientific:'Epinephelus coioides',color:'#a3976c',spots:true,length:[18,31,7,52],k:1.8,power:.75,stamina:76,affinity:{soft:1.6,minnow:.6,pencil:.2,jig:1.1,spoon:.4},shape:'deep',habitat:'偏好底層結構，咬鉤後常有一波強勁衝刺。'},
  {id:'jack',name:'竹莢魚',scientific:'Trachurus japonicus',color:'#8bb2aa',length:[12,22,4,35],k:1.0,power:.35,stamina:48,affinity:{soft:.9,minnow:1.3,pencil:.6,jig:1.6,spoon:1.4},shape:'slim',habitat:'沿岸中上層的群游魚，喜歡追逐移動中的小餌。'},
  {id:'tilapia',name:'尼羅口孵非鯽',scientific:'Oreochromis niloticus',color:'#829b80',stripe:true,length:[12,24,5,38],k:2.2,power:.4,stamina:54,affinity:{soft:1.5,minnow:.5,pencil:.2,jig:.4,spoon:.7},shape:'deep',habitat:'俗稱吳郭魚；公司田溪調查有紀錄的外來魚種。'},
  {id:'chub',name:'粗首馬口鱲',scientific:'Opsariichthys pachycephalus',color:'#a5b6aa',length:[8,15,3,24],k:1.1,power:.2,stamina:35,affinity:{soft:1.1,minnow:1.5,pencil:1,jig:.4,spoon:1.5},shape:'slim',habitat:'溪流中的原生魚，會追逐小型擬餌。'},
  {id:'barbel',name:'臺灣鬚鱲',scientific:'Candidia barbata',color:'#b2b8a1',length:[7,13,2.5,20],k:1.0,power:.15,stamina:30,affinity:{soft:1.3,minnow:1.4,pencil:.6,jig:.3,spoon:1.4},shape:'slim',habitat:'公司田溪調查記錄的原生溪流魚，適合輕量路亞。'},
  {id:'trevally',name:'六帶鰺',scientific:'Caranx sexfasciatus',color:'#a7b6a3',length:[14,25,5,40],k:1.5,power:.65,stamina:70,affinity:{soft:1,minnow:1.4,pencil:1.4,jig:1.5,spoon:1.2},shape:'deep',habitat:'幼魚可進入河口；公司田溪調查曾有紀錄。'}
];
export const SPOTS = [
  {id:'wharf',name:'漁人碼頭',english:'FISHERMAN’S WHARF',caption:'夕陽、港灣，和下一次期待。',weather:'夕照微風',description:'港灣裡的每一道波紋，都藏著驚喜。',theme:'harbor',pool:{seabream:30,jarbua:32,grouper:8,jack:25,trevally:5}},
  {id:'youche',name:'油車口',english:'YOUCHEKOU',caption:'潮水經過，故事就開始了。',weather:'河口微風',description:'沿著河口拋投，讓路亞順著潮流游動。',theme:'estuary',pool:{seabream:30,jarbua:40,grouper:7,jack:8,trevally:15}},
  {id:'creek',name:'公司田溪',english:'GONGSITIAN CREEK',caption:'把城市留在身後，聽溪水說話。',weather:'溪畔晴時',description:'循著溪流，尋找小型原生魚與感潮河段的訪客。',theme:'creek',pool:{tilapia:40,chub:32,barbel:23,trevally:5}}
];
export const RODS = [
  {id:'ul',name:'UL · 溪流輕路亞竿',min:1,max:7,control:1.12,power:.83,note:'1–7 g · 輕巧靈敏，適合小型魚'},
  {id:'l',name:'L · 輕量路亞竿',min:2,max:12,control:1.06,power:.94,note:'2–12 g · 輕量泛用，操作輕鬆'},
  {id:'ml',name:'ML · 泛用路亞竿',min:4,max:18,control:1,power:1.06,note:'4–18 g · 港灣與河口的均衡選擇'},
  {id:'m',name:'M · 強韌路亞竿',min:7,max:28,control:.94,power:1.2,note:'7–28 g · 有力回收，應對較大的魚'}
];
export const LURES = [
  {id:'soft',name:'軟蟲 · 5 g',weight:5,note:'慢速跳底，尋找藏在底層的魚。'},
  {id:'minnow',name:'米諾 · 7 g',weight:7,note:'小魚般的泳姿，吸引追逐中的獵手。'},
  {id:'pencil',name:'鉛筆 · 8 g',weight:8,note:'水面左右擺動，期待一次漂亮的水花。'},
  {id:'jig',name:'小鐵板 · 10 g',weight:10,note:'下沉後輕抽，搜尋不同水層。'},
  {id:'spoon',name:'亮片 · 3 g',weight:3,note:'閃光與搖擺，適合溪流與小型魚。'}
];
export const RIGS = {jighead:'汲鉤頭釣組',texas:'德州釣組',direct:'直接連接擬餌'};
export const getFish = id => FISH.find(f=>f.id===id);
export const getSpot = id => SPOTS.find(s=>s.id===id);
export function fishArt(fish, unknown=false) {
  const color=unknown?'#c2ccbd':fish.color, deep=fish.shape==='deep', belly=deep?70:49;
  const stripes=fish.stripe?'<path d="M98 68q-13 32 4 62M119 58q-15 43 4 80M141 54q-13 46 4 85M163 55q-11 45 4 83M185 61q-10 33 4 67" fill="none" stroke="#405d52" opacity=".35" stroke-width="7"/>':'';
  let spots=''; if(fish.spots)for(let i=0;i<22;i++){const x=90+(i*37%122),y=76+(i*19%49);spots+=`<circle cx="${x}" cy="${y}" r="3" fill="#6d573c" opacity=".6"/>`;}
  return `<svg viewBox="0 0 320 190" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${unknown?'尚未登錄':fish.name}插圖"><ellipse cx="160" cy="162" rx="76" ry="5" fill="#324b3b" opacity=".07"/><g transform="translate(0 -5)"><path d="M225 97l48-38-7 41 9 41-49-29" fill="${color}" stroke="#486257" stroke-width="1.5"/><path d="M116 63l13-32 18 13 17-17 16 24 22-2 2 24" fill="${color}" stroke="#486257" stroke-width="1.2"/><path d="M136 125l14 28 22-20 21 14 7-25" fill="${color}" stroke="#486257" stroke-width="1.2"/><path d="M60 100Q105 ${100-belly} 171 ${100-belly+8}Q216 53 240 100Q204 ${100+belly} 141 ${100+belly-7}Q89 ${100+belly-8} 60 100Z" fill="${color}" stroke="#486257" stroke-width="1.5"/><path d="M68 103Q136 149 228 105Q187 151 141 144Q91 138 68 103" fill="#f4f3d9" opacity=".45"/>${stripes}${spots}<path d="M106 71q18 29 0 61M129 103l31-7-16 24Z" fill="none" stroke="#486257" opacity=".55" stroke-width="1.5"/><path d="M65 101l14 4" stroke="#385349" stroke-width="1.5"/><circle cx="86" cy="87" r="7" fill="#e4d99f"/><circle cx="85" cy="87" r="3.7" fill="#263f38"/><circle cx="83.5" cy="85" r="1.3" fill="white"/><path d="M254 80l-15 21 17 22M130 51l5 13m12-21 5 18m13-18 4 18" fill="none" stroke="#486257" opacity=".5"/></g></svg>`;
}
export function spotArt(theme){
  const creek=theme==='creek',estuary=theme==='estuary';
  return `<svg viewBox="0 0 100 70" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="70" fill="${creek?'#d2d9bd':'#ead7b6'}"/><circle cx="74" cy="22" r="10" fill="#f6e7b3"/><path d="M0 36Q24 14 48 32T100 26V70H0Z" fill="${creek?'#789780':'#a6b8a3'}"/><path d="M0 45Q38 35 100 41V70H0Z" fill="#7ba6a0"/><path d="M0 55l28-2m21 9 32-2m-27-11 25-1" stroke="#d2dfc5" opacity=".6"/>${creek?'<path d="M0 37l30 3 7 30H0m100-36-26 9-9 27h35" fill="#617c61"/>':estuary?'<path d="M0 50l23 5L5 70H0m95-28 5-1v29H66" fill="#7c8b69"/>':'<path d="M12 41H88M58 41V17L83 41M58 23 22 41" fill="none" stroke="#f6f0d8" stroke-width="2"/>'}</svg>`;
}
