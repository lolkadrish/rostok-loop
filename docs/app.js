import {Farm,Runner,CROPS,UPGRADES,LESSONS,currentLesson,restorePlayerCode} from './engine.js';

const $=id=>document.getElementById(id);
const STORAGE='rostok-loop-v1';
let saved=null,storageOK=true;
try{saved=JSON.parse(localStorage.getItem(STORAGE));}catch{storageOK=false;}
let farm=new Farm(saved?.farm),runner=null,running=false,speed=1,accumulator=0,lastTime=performance.now(),lastSave=0,lastUI=0;
let hover=null,toastTimer,robotVisual={...farm.robot},particles=[],lastRobotAction=0,upgradesRenderKey='',lastLesson=-2;
const code=$('code'),canvas=$('farm'),ctx=canvas.getContext('2d');
canvas.width=900;canvas.height=590;
code.value=restorePlayerCode(saved);

function log(message,type='info'){
  const line=document.createElement('div');line.className='log-line log-'+type;
  const time=document.createElement('span');time.className='log-time';time.textContent=new Date().toLocaleTimeString('ru-RU',{hour12:false});
  const text=document.createElement('span');text.textContent=message;line.append(time,text);$('consoleOutput').append(line);
  while($('consoleOutput').children.length>80)$('consoleOutput').firstChild.remove();$('consoleOutput').scrollTop=$('consoleOutput').scrollHeight;
}
function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),3400);}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify({farm:farm.serialize(),code:code.value,codeOrigin:'player'}));storageOK=true;}catch{storageOK=false;}$('saveStatus').innerHTML=storageOK?'Прогресс сохранён<small>в этом браузере</small>':'Сохранение недоступно<small>не закрывай вкладку</small>';}
function setEvents(){farm.onEvent=event=>{
  lastRobotAction=performance.now();
  if(event.type==='harvest'){
    log(`${CROPS[event.crop].name}: +${event.value} монет${event.power?' · +'+event.power+' энергии':''}`,'success');
    const g=geometry(),x=g.x+(farm.robot.x+.5)*g.tile,y=g.y+(farm.robot.y+.3)*g.tile;
    const pop=document.createElement('span');pop.className='reward-pop';pop.textContent='+'+event.value;pop.style.left=(x/900*100)+'%';pop.style.top=(y/590*100)+'%';$('floatingReward').append(pop);setTimeout(()=>pop.remove(),1500);
    for(let i=0;i<10;i++)particles.push({x,y,dx:(Math.random()-.5)*55,dy:-Math.random()*55-15,life:1,color:i%2?'#e8ce73':'#d7e3a3'});
  }
  if(event.type==='water'){const g=geometry();for(let i=0;i<8;i++)particles.push({x:g.x+(farm.robot.x+.5)*g.tile,y:g.y+(farm.robot.y+.5)*g.tile,dx:(Math.random()-.5)*35,dy:-Math.random()*35,life:.7,color:'#94d8d0'});}
  if(event.type==='upgrade'){toast('Открыто: '+UPGRADES.find(u=>u.id===event.id).name);log('Новое открытие! Пояснения — в учебнике.','success');upgradesRenderKey='';renderReference();}
  updateUI();
};}
setEvents();
function updateUI(){
  $('coins').textContent=farm.coins.toLocaleString('ru-RU');$('harvestCount').textContent=farm.harvests.toLocaleString('ru-RU');$('worldSize').textContent=`${farm.size} × ${farm.size}`;$('plotCount').textContent=`${farm.size**2} ${farm.size===1?'грядка':'грядок'}`;
  $('coordinates').innerHTML=`X: ${farm.robot.x} &nbsp; Y: ${farm.robot.y}`;
  $('upgradeBadge').textContent=UPGRADES.filter(u=>farm.canBuy(u.id)).length;
  $('inventory').replaceChildren(...farm.unlocked.map(c=>{const item=document.createElement('span');item.textContent=CROPS[c].name+' '+farm.inventory[c];return item;}));
  if(farm.knows('sunflower')){const power=document.createElement('span');power.textContent='⚡ '+farm.power.toFixed(1);$('inventory').append(power);}
  const index=currentLesson(farm),lesson=index<0?null:LESSONS[index];
  $('questTitle').textContent=lesson?.title??'Твоя самостоятельная ферма';$('questDescription').textContent=lesson?.concept??'Начальные главы пройдены. Оптимизируй программы и развивай ферму дальше.';
  $('questTask').textContent=lesson?.task??'Исследуй новые культуры и сравнивай эффективность своих алгоритмов.';
  $('questNumber').textContent=String(index<0?LESSONS.length:index+1).padStart(2,'0')+' / '+LESSONS.length;
  $('questProgress').style.width=(index<0?100:index/LESSONS.length*100)+'%';$('lessonSyntax').textContent=lesson?.syntax??'';$('lessonHint').textContent=lesson?.hint??'Подумай, какие действия выполняются чаще всего и какие проверки можно сократить.';
  $('miniLessonTitle').textContent=lesson?'Урок '+String(index+1).padStart(2,'0')+' · '+lesson.title:'Самостоятельная ферма';$('miniLessonTask').textContent=lesson?.task??'Экспериментируй, сравнивай и улучшай свой код.';
  if(index!==lastLesson){if(lastLesson!==-2){toast(index<0?'Начальные главы пройдены!':'Следующая глава: '+lesson.title);$('lessonHintDetails').open=false;renderReference();}lastLesson=index;}
  if($('upgradesDialog').open)renderUpgrades();
}
function renderUpgrades(){
  const key=farm.coins+':'+farm.upgrades.join(',');if(key===upgradesRenderKey)return;upgradesRenderKey=key;
  $('walletCoins').textContent=farm.coins+' ◈';
  $('upgradeList').replaceChildren(...UPGRADES.map(u=>{const item=document.createElement('div');item.className='upgrade-item';
    const art=document.createElement('span');art.className='upgrade-art';art.textContent=u.icon;const info=document.createElement('div');const title=document.createElement('h3');title.textContent=u.name;const desc=document.createElement('p');desc.textContent=u.description;info.append(title,desc);item.append(art,info);
    if(farm.upgrades.includes(u.id)){const done=document.createElement('span');done.className='done';done.textContent='Открыто ✓';item.append(done);}else{const missing=u.requires.filter(r=>!farm.knows(r));if(missing.length){const note=document.createElement('small');note.className='requires-note';note.textContent='Сначала: '+missing.map(id=>UPGRADES.find(x=>x.id===id).name).join(', ');info.append(note);}const button=document.createElement('button');button.className='button';button.textContent=u.price+' ◈';button.disabled=!farm.canBuy(u.id);button.addEventListener('click',()=>{if(farm.buy(u.id)){save();renderUpgrades();}});item.append(button);}return item;
  }));
}
function renderReference(){
  const entries=[['harvest()','Собрать созревшее растение. Незрелое остаётся расти.',null],['print(значение)','Вывести сообщение в консоль.',null],['while условие:','Повторять блок с отступом в четыре пробела.','loops'],['move(направление)','Шаг: North, South, East, West. Края поля соединены.','expand2'],['plant("wheat")','Посадить пшеницу на свободной клетке.','plant'],['if условие:','Выполнить блок, если условие истинно. Есть elif и else.','senses'],['can_harvest()','Созрело ли растение под роботом? True или False.','senses'],['is_empty()','Свободна ли текущая клетка?','senses'],['get_pos_x(), get_pos_y()','Координаты робота, начиная с нуля.','senses'],['num_items("wheat")','Количество выбранного ресурса на складе.','senses'],['for имя in range(число):','Повторить блок для значений от 0 до число − 1.','for'],['имя = значение','Задать переменную. Доступны арифметика и сравнения.','for'],['get_world_size()','Длина стороны поля.','for'],['water(), get_water()','Полить растение; прочитать влажность от 0 до 1.','water'],['till(), get_ground_type()','Изменить грунт; прочитать "soil" или "grassland".','carrot'],['plant("carrot")','Почва; за посадку расходуются 2 пшеницы.','carrot'],['plant("beet")','Почва; за посадку расходуются 2 моркови.','beet'],['plant("sunflower")','Почва; за посадку расходуются 3 пшеницы.','sunflower'],['measure()','Число лепестков подсолнуха под роботом.','sunflower']];
  $('commandReference').replaceChildren(...entries.filter(e=>!e[2]||farm.knows(e[2])).flatMap(([signature,description])=>{const c=document.createElement('code');c.textContent=signature;const d=document.createElement('span');d.textContent=description;return[c,d];}));
  const active=currentLesson(farm);$('lessonLibrary').replaceChildren(...LESSONS.map((lesson,i)=>{const entry=document.createElement('details');entry.className='lesson-entry';entry.open=i===active;const summary=document.createElement('summary');summary.textContent=String(i+1).padStart(2,'0')+' · '+lesson.title+(active<0||i<active?' ✓':i===active?' · сейчас':' · впереди');entry.append(summary);const p=document.createElement('p');p.textContent=lesson.concept;const task=document.createElement('p');task.className='lesson-task';task.textContent=lesson.task;const syntax=document.createElement('pre');syntax.textContent=lesson.syntax;entry.append(p,task,syntax);return entry;}));
}
function showDialog(id){if(id==='helpDialog')renderReference();$(id).showModal();}
document.querySelectorAll('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('helpButton').onclick=()=>showDialog('helpDialog');$('referenceButton').onclick=()=>showDialog('helpDialog');document.querySelector('.dialog-start').onclick=()=>$('helpDialog').close();
$('lessonButton').onclick=()=>showDialog('helpDialog');
$('upgradesButton').onclick=()=>{renderUpgrades();showDialog('upgradesDialog');};
$('resetButton').onclick=()=>showDialog('resetDialog');document.querySelector('.cancel-reset').onclick=()=>$('resetDialog').close();
$('confirmReset').onclick=()=>{stop(false);farm=new Farm();setEvents();robotVisual={...farm.robot};particles=[];hover=null;lastLesson=-2;code.value='';code.scrollTop=0;code.scrollLeft=0;updateHighlight();updateUI();save();$('resetDialog').close();$('consoleOutput').replaceChildren();log('Одна клетка. Одна команда. Начни с первого урока под полем.','success');toast('Новая ферма. Начни с первой команды.');};
$('clearConsole').onclick=()=>$('consoleOutput').replaceChildren();

function updateRunState(){
  $('runButton').innerHTML=running?'<span>Ⅱ</span> Пауза':runner&&!runner.done?'<span>▶</span> Продолжить':'<span>▶</span> Запустить';
  $('executionStatus').textContent=running?'Программа выполняется':runner&&!runner.done?'На паузе':'Готов к запуску';
  $('robotState').textContent=running?'РОБОТ РАБОТАЕТ':runner&&!runner.done?'РОБОТ НА ПАУЗЕ':'РОБОТ ГОТОВ';
  $('stepButton').disabled=running;
}
function stop(announce=true){running=false;runner=null;accumulator=0;$('activeLine').style.display='none';updateHighlight();updateRunState();if(announce)log('Программа остановлена. Следующий запуск — с начала.');}
function startRunner(){try{runner=new Runner(code.value,farm,msg=>log(msg,'success'));return true;}catch(e){runner=null;log(e.message,'error');toast('Проверь код — подсказка в консоли.');updateRunState();return false;}}
function executeStep(){if(!runner)return;try{const result=runner.step();if(!result){running=false;log('Программа завершена. Хорошая работа!','success');$('activeLine').style.display='none';updateRunState();updateHighlight();return;}highlightLine(result.line);updateUI();}catch(e){running=false;highlightLine(runner.line);log(e.message,'error');toast('Программа остановлена: проверь консоль.');runner=null;updateRunState();}}
$('runButton').onclick=()=>{if(running){running=false;log('Пауза. Рост растений продолжается.');updateRunState();save();return;}if((!runner||runner.done)&&!startRunner())return;running=true;accumulator=.32;log('Алгоритм запущен. Пора выращивать!','success');updateRunState();};
$('stepButton').onclick=()=>{if((!runner||runner.done)&&!startRunner())return;executeStep();updateRunState();};$('stopButton').onclick=()=>stop();
$('speedButton').onclick=()=>{speed=speed===1?2:speed===2?4:1;$('speedButton').textContent=speed+'×';};

const escapeHTML=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function syntax(source){return source.split('\n').map(line=>{
  const re=/(#[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:while|for|in|if|elif|else|break|pass|and|or|not|True|False|None)\b|\b(?:North|South|East|West)\b|\b[A-Za-z_]\w*(?=\()|\b\d+(?:\.\d+)?\b)/g;
  let out='',last=0;for(const m of line.matchAll(re)){out+=escapeHTML(line.slice(last,m.index));const t=m[0],cl=t[0]==='#'?'comment':/^['"]/.test(t)?'string':/^\d/.test(t)?'number':/^(North|South|East|West)$/.test(t)?'direction':/^(while|for|in|if|elif|else|break|pass|and|or|not|True|False|None)$/.test(t)?'keyword':'function';out+='<span class="syn-'+cl+'">'+escapeHTML(t)+'</span>';last=m.index+t.length;}return out+escapeHTML(line.slice(last));}).join('\n')+'\n';}
function updateHighlight(){const lines=code.value.split('\n');$('highlighted').innerHTML=syntax(code.value);$('lineNumbers').innerHTML=lines.map((_,i)=>`<span${runner&&runner.line===i+1?' class="current"':''}>${i+1}</span>`).join('\n');syncScroll();}
function lineHeight(){return parseFloat(getComputedStyle(code).lineHeight);}
function syncScroll(){$('highlighted').scrollTop=code.scrollTop;$('highlighted').scrollLeft=code.scrollLeft;$('lineNumbers').scrollTop=code.scrollTop;if(runner)$('activeLine').style.top=((runner.line-1)*lineHeight()-code.scrollTop)+'px';}
function highlightLine(n){const h=lineHeight(),y=(n-1)*h;if(y<code.scrollTop||y>code.scrollTop+code.clientHeight-h)code.scrollTop=Math.max(0,y-code.clientHeight/2);$('activeLine').style.display='block';$('activeLine').style.top=(y-code.scrollTop)+'px';$('lineStatus').textContent='Строка '+n;updateHighlight();}
code.addEventListener('input',()=>{if(runner)stop(false);updateHighlight();});code.addEventListener('scroll',syncScroll);code.addEventListener('click',()=>{$('lineStatus').textContent='Строка '+(code.value.slice(0,code.selectionStart).split('\n').length);});
code.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();const start=code.selectionStart,end=code.selectionEnd;code.setRangeText('    ',start,end,'end');code.dispatchEvent(new Event('input'));}if(e.key==='Enter'&&!e.ctrlKey&&!e.metaKey){e.preventDefault();const start=code.selectionStart,end=code.selectionEnd,previous=code.value.slice(0,start).split('\n').at(-1),indent=previous.match(/^ */)[0]+(previous.trimEnd().endsWith(':')?'    ':'');code.setRangeText('\n'+indent,start,end,'end');code.dispatchEvent(new Event('input'));}if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();$('runButton').click();}});

// Pixel world, drawn entirely from small geometric shapes. No asset downloads.
function geometry(){const tile=({1:112,2:100,4:80,6:64,8:48})[farm.size];return {tile,x:450-farm.size*tile/2,y:300-farm.size*tile/2};}
const grass=[];let seed=3481;function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}for(let i=0;i<1900;i++)grass.push({x:rand()*900,y:rand()*590,c:Math.floor(rand()*5),s:rand()>.93?3:1});
function rect(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
function pixelTree(x,y,size=1){ctx.save();ctx.translate(x,y);ctx.scale(size,size);ellipse(2,8,28,10,'#526d4430');rect(-5,-20,10,27,'#7d7150');rect(-3,-20,4,27,'#978261');const colors=['#64864c','#749653','#83a45f','#92ae6b'];for(let tier=0;tier<3;tier++){const yy=-26-tier*19,w=55-tier*8;rect(-w/2,yy,w,20,colors[tier]);rect(-w/2+6,yy-7,w-12,8,colors[tier+1]);rect(-w/2+7,yy+3,9,4,'#a2ba7780');}ctx.restore();}
function fence(g){const left=g.x-26,right=g.x+farm.size*g.tile+26,top=g.y-26,bottom=g.y+farm.size*g.tile+26;for(let x=left;x<=right;x+=24){if(x>440&&x<480)continue;rect(x,top,25,4,'#857c53');rect(x,top+8,25,3,'#9d9166');rect(x,top-3,5,20,'#b5aa7a');rect(x,top-3,4,3,'#d4c595');rect(x,bottom,25,4,'#9b8e64');rect(x,bottom+8,25,3,'#a99b6c');rect(x,bottom-3,5,20,'#bbae7c');rect(x,bottom-3,4,3,'#d8cda0');}for(let y=top;y<bottom;y+=24){for(const x of [left,right]){rect(x,y,4,25,'#938459');rect(x+8,y,3,25,'#ac9b6e');rect(x-2,y,17,5,'#c0af7d');rect(x-2,y,17,2,'#ddcd99');}}}
function barn(x,y){ellipse(x+57,y+78,75,18,'#5c78432b');rect(x,y+1,112,80,'#d5c39b');rect(x+4,y+2,104,75,'#e2d5af');for(let i=0;i<6;i++)rect(x+5,y+8+i*11,102,1,'#c8b997');rect(x+37,y+37,39,43,'#9b8b6b');rect(x+41,y+40,31,40,'#746d51');rect(x+55,y+40,2,40,'#aaa07c');rect(x+12,y+23,17,20,'#9cbaab');rect(x+13,y+24,15,1,'#e1dfbb');rect(x+20,y+24,2,19,'#b9c8a7');rect(x+86,y+23,15,20,'#9cbaab');rect(x+92,y+23,2,20,'#b9c8a7');for(let i=0;i<6;i++){const w=126-i*16;rect(x-7+i*8,y-4-i*7,w,8,i%2?'#b2775e':'#bd8567');}rect(x+8,y-46,97,4,'#d39e78');rect(x+76,y-59,11,23,'#a99075');rect(x+74,y-62,15,6,'#c0ab87');rect(x+2,y+80,108,5,'#9b9270');rect(x+36,y+84,42,4,'#d0bc8b');}
function pond(t){const x=752,y=350;ellipse(x+2,y+5,72,99,'#849d65');ctx.fillStyle='#91b9a1';ctx.beginPath();ctx.moveTo(x-31,y-84);ctx.bezierCurveTo(x+55,y-105,x+75,y-51,x+55,y+1);ctx.bezierCurveTo(x+90,y+75,x+28,y+111,x-31,y+72);ctx.bezierCurveTo(x-77,y+40,x-52,y-13,x-66,y-37);ctx.bezierCurveTo(x-62,y-64,x-48,y-82,x-31,y-84);ctx.fill();ellipse(x-10,y+3,43,70,'#88b39d');for(let i=0;i<8;i++){const xx=x-35+(i*17%65),yy=y-58+i*17;rect(xx+Math.sin(t/1800+i)*3,yy,13,2,'#b8d1ae70');}ellipse(x+26,y-23,10,5,'#7d9f6c');ellipse(x-25,y+49,10,5,'#7a9b68');rect(x+22,y-27,5,3,'#cfb9bb');for(let i=0;i<7;i++){const xx=x-63+(i*29%130),yy=y+65+(i%3)*10;rect(xx,yy-15,2,20,'#7a9460');rect(xx-3,yy-18,5,8,'#a99764');}}
function cropDraw(crop,growth,x,y,tile,phase){const scale=tile/55;ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);const ready=growth>=1;const offsets=[[-13,-9],[4,-11],[-5,8],[14,8]];
  for(let i=0;i<offsets.length;i++){const [ox,oy]=offsets[i],sway=ready?Math.sin(phase/800+x+i)*.8:0;const h=4+growth*17;
    if(growth<.27){rect(ox,oy,2,5,'#a8bb70');rect(ox-3,oy-3,4,3,'#84a765');rect(ox+1,oy-5,4,3,'#9bbb74');continue;}
    if(crop==='wheat'){const c=ready?'#e4c268':'#b7b96c';rect(ox+sway,oy-h,2,h+4,ready?'#c6a951':'#93a75e');for(let k=0;k<3;k++){rect(ox-3+sway,oy-h+3+k*4,3,3,c);rect(ox+2+sway,oy-h+1+k*4,3,3,c);}rect(ox-6,oy-4,5,2,'#99a75e');}
    if(crop==='carrot'){if(ready){rect(ox-3,oy-1,7,7,'#e0a263');rect(ox-1,oy+6,3,3,'#c3874d');}rect(ox,oy-h+5,2,h-3,'#8db064');rect(ox-7,oy-h+8,6,4,'#83a65d');rect(ox+2,oy-h+5,6,5,'#9bbc73');rect(ox-4,oy-h+2,4,5,'#a2bd73');}
    if(crop==='beet'){if(ready){rect(ox-4,oy-1,9,7,'#b984a1');rect(ox-2,oy+6,5,2,'#985d87');}rect(ox,oy-h+5,2,h,'#9b8e70');rect(ox-7,oy-h+4,6,9,'#8ba06a');rect(ox+2,oy-h+1,6,10,'#9cac78');}
    if(crop==='sunflower'){rect(ox,oy-h,2,h+8,'#8fa264');rect(ox-6,oy+1,6,3,'#a4b876');if(ready){rect(ox-6,oy-h-4,13,10,'#e7c65b');rect(ox-3,oy-h-7,7,16,'#e7c65b');rect(ox-3,oy-h-3,7,7,'#88714b');}else{rect(ox-3,oy-h,7,7,'#a5af64');}}
  }ctx.restore();}
function robot(t,g,dt){
  const target=farm.robot;
  for(const key of ['x','y']){if(Math.abs(target[key]-robotVisual[key])>1.5)robotVisual[key]=target[key];else robotVisual[key]+=(target[key]-robotVisual[key])*Math.min(1,dt*13);}
  const x=g.x+(robotVisual.x+.5)*g.tile,y=g.y+(robotVisual.y+.5)*g.tile,bob=Math.sin(t/360)*2;
  ellipse(x,y+12,20,8,'#302f2735');ctx.save();ctx.translate(Math.round(x),Math.round(y-10+bob));
  rect(-24,-1,48,5,'#647d79');rect(-21,-4,6,12,'#bccbc0');rect(15,-4,6,12,'#bccbc0');
  for(const xx of [-23,23]){rect(xx-10,-6,20,3,t%160<80?'#d4e1c9':'#91afa0');rect(xx-2,-10,4,10,'#bdcbb9');rect(xx-4,-4,8,5,'#f1f1d9');}
  rect(-14,-12,28,24,'#edf0d8');rect(-10,-16,20,6,'#faf9e6');rect(-17,-7,4,14,'#d5dfc6');rect(14,-7,3,14,'#bfceb5');rect(-12,10,24,4,'#a7bda4');rect(-10,-5,20,11,'#536f68');rect(-7,-2,4,4,'#c0e8af');rect(4,-2,4,4,'#c0e8af');rect(-3,-20,5,5,'#d9e2c6');rect(-1,-25,2,7,'#8b9e80');rect(-2,-26,4,3,running?'#b8db8e':'#c0bc8e');rect(-7,14,4,3,'#80977e');rect(5,14,4,3,'#80977e');
  if(t-lastRobotAction<350){rect(-5,7,10,2,'#adc28e');}
  ctx.restore();
}
function draw(t,dt){
  const g=geometry(),n=farm.size,field=n*g.tile;
  ctx.imageSmoothingEnabled=false;rect(0,0,900,590,'#a9bd88');
  const colors=['#9fb47e','#b3c58f','#94ae78','#bdcc97','#9ab27a'];
  for(const p of grass){rect(p.x,p.y,p.s*3,p.s,colors[p.c]);if(p.s===3)rect(p.x+4,p.y-4,2,5,colors[p.c]);}
  rect(434,0,34,590,'#bdc69b');for(let i=0;i<34;i++)rect(439+(i*13%22),i*19,3,2,'#aab78a');
  rect(64,224,365,24,'#bec69b');rect(94,223,28,100,'#bcc598');
  barn(87,146);pond(t);
  pixelTree(39,105,1.1);pixelTree(220,59,.9);pixelTree(720,96,1.1);pixelTree(835,146,.85);pixelTree(866,66,.95);pixelTree(40,472,1.2);pixelTree(132,543,.9);pixelTree(824,548,1.05);pixelTree(664,544,.8);
  // Produce crates, signpost and a few small flowers give the field a lived-in edge.
  for(const [x,y] of [[155,265],[181,278]]){rect(x+3,y+16,27,6,'#6b7c4e30');rect(x,y,27,20,'#b99963');rect(x+2,y+3,23,4,'#d0b37b');rect(x+2,y+11,23,4,'#d0b37b');rect(x+3,y-3,5,6,'#d8bc67');rect(x+11,y-4,5,7,'#e0c671');rect(x+18,y-2,5,5,'#c9b564');}
  rect(156,396,4,30,'#8c835c');rect(129,380,59,22,'#d3c295');rect(132,383,53,3,'#ddcea6');ctx.fillStyle='#7b7f59';ctx.font='9px Consolas,monospace';ctx.fillText('LOOP FARM',134,395);
  for(let i=0;i<22;i++){const x=42+(i*83)%820,y=28+(i*127)%540;if(x>g.x-50&&x<g.x+field+50&&y>g.y-50&&y<g.y+field+50)continue;rect(x,y,3,4,'#7f9c5a');rect(x-2,y-3,6,4,i%3?'#e3dbad':'#c6acc0');}
  rect(g.x-15,g.y-15,field+30,field+30,'#9eab77');rect(g.x-10,g.y-10,field+20,field+20,'#c3b28a');rect(g.x-6,g.y-6,field+12,field+12,'#b6a17c');rect(g.x-2,g.y-2,field+4,field+4,'#8c7959');
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){
    const tile=farm.tiles[y*n+x],xx=g.x+x*g.tile,yy=g.y+y*g.tile,wet=tile.water>0;
    const soil=tile.ground==='soil';rect(xx,yy,g.tile-2,g.tile-2,soil?(wet?'#83764f':(x+y)%2?'#a08c60':'#a69364'):(wet?'#8b9b62':'#a1af74'));
    rect(xx+3,yy+3,g.tile-8,g.tile-8,soil?(wet?'#897c52':'#ac986a'):(wet?'#94a36b':'#adba7e'));
    for(let row=0;row<4;row++){rect(xx+5,yy+7+row*(g.tile-12)/4,g.tile-12,2,soil?(wet?'#716d49':'#96825a'):'#99ab70');if(soil)rect(xx+6,yy+9+row*(g.tile-12)/4,g.tile-14,1,wet?'#9b9060':'#baa474');}
    if(tile.crop)cropDraw(tile.crop,tile.growth,xx+g.tile/2,yy+g.tile/2,g.tile,t);
    if(tile.crop&&tile.growth>=1&&((x*3+y)%5===0)){const a=(Math.sin(t/550+x+y)+1)/2;ctx.globalAlpha=a*.65;rect(xx+g.tile-11,yy+8,2,7,'#fff2b4');rect(xx+g.tile-13,yy+10,6,2,'#fff2b4');ctx.globalAlpha=1;}
    if(hover&&hover.x===x&&hover.y===y){ctx.strokeStyle='#e3e8bd99';ctx.lineWidth=2;ctx.strokeRect(xx+2,yy+2,g.tile-6,g.tile-6);}
  }
  ctx.strokeStyle='#e9e3a0';ctx.lineWidth=2;ctx.strokeRect(g.x+farm.robot.x*g.tile+1,g.y+farm.robot.y*g.tile+1,g.tile-5,g.tile-5);
  fence(g);robot(t,g,dt);
  for(const p of particles){p.x+=p.dx*dt;p.y+=p.dy*dt;p.dy+=80*dt;p.life-=dt;ctx.globalAlpha=Math.max(0,p.life);rect(p.x,p.y,3,3,p.color);}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
  // Small rocks around the water and shade along the edge of the world.
  for(const [x,y] of [[692,441],[808,247],[720,472],[218,469],[77,327]]){rect(x,y,14,7,'#97a18a');rect(x+2,y-4,10,5,'#bac0a7');rect(x+2,y+3,10,2,'#86947b');}
  if(hover){const tile=farm.tiles[hover.y*n+hover.x],label=tile.crop?`${CROPS[tile.crop].name} · ${tile.growth>=1?'готово!':Math.floor(tile.growth*100)+'%'}${tile.water?' · полив':''}`:'Свободная грядка';const xx=Math.min(690,g.x+(hover.x+.5)*g.tile),yy=g.y+hover.y*g.tile-30;ctx.font='11px Segoe UI,sans-serif';const width=ctx.measureText(label).width+20;rect(xx-width/2,yy,width,23,'#263c32ec');ctx.fillStyle='#e3edcf';ctx.fillText(label,xx-width/2+10,yy+16);}
}
canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect(),g=geometry(),x=Math.floor(((e.clientX-r.left)/r.width*900-g.x)/g.tile),y=Math.floor(((e.clientY-r.top)/r.height*590-g.y)/g.tile);hover=x>=0&&x<farm.size&&y>=0&&y<farm.size?{x,y}:null;});canvas.addEventListener('mouseleave',()=>hover=null);
function frame(now){const elapsed=Math.max(0,(now-lastTime)/1000),dt=Math.min(.1,elapsed);lastTime=now;farm.tick(Math.min(elapsed,28800));
  if(running){accumulator+=Math.min(elapsed,1);const interval=.32/speed/(farm.upgrades.includes('speed')?1.5:1)/(farm.power>0?1.5:1);let budget=0;while(running&&accumulator>=interval&&budget++<12){accumulator-=interval;executeStep();}}
  draw(now,dt);
  if(now-lastUI>500){updateUI();lastUI=now;}
  if(now-lastSave>3500){save();lastSave=now;}
  requestAnimationFrame(frame);
}
window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});window.addEventListener('resize',syncScroll);
updateHighlight();updateUI();updateRunState();
log(saved?'С возвращением! Ферма ждала тебя.':'Система готова. Робот ждёт первую команду.','success');
log(code.value.trim()?'Твой код восстановлен. Запусти его, когда будешь готов.':'Начни с первой команды. Задание — над редактором, объяснение — в учебнике { }.');
if(!storageOK)$('saveStatus').innerHTML='Сохранение недоступно<small>не закрывай вкладку</small>';
requestAnimationFrame(frame);
