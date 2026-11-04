export const CROPS = {
  wheat: {name:'Пшеница',time:4,value:3,color:'#d6b85c',cost:{}},
  carrot: {name:'Морковь',time:12,value:7,color:'#db9558',cost:{wheat:2},soil:true},
  beet: {name:'Свёкла',time:18,value:12,color:'#b47e9b',cost:{carrot:2},soil:true},
  sunflower: {name:'Подсолнух',time:24,value:20,color:'#e8ca58',cost:{wheat:3},soil:true}
};
export const UPGRADES = [
  {id:'loops',name:'Повторение · while',description:'Повторяй действия, пока условие истинно',price:6,icon:'↻',requires:[],skills:['while']},
  {id:'expand2',name:'Первые шаги · 2 × 2',description:'Четыре клетки и команда move()',price:12,icon:'▦',requires:['loops'],size:2},
  {id:'plant',name:'Посадка',description:'Сам выбирай, что растёт на грядке',price:18,icon:'♧',requires:['expand2']},
  {id:'senses',name:'Решения · if',description:'Условия, датчики и координаты робота',price:24,icon:'◇',requires:['plant'],skills:['if']},
  {id:'for',name:'Счёт и переменные · for',description:'range(), переменные и арифметика',price:36,icon:'𝑥',requires:['senses'],skills:['for','variables']},
  {id:'grid4',name:'Обход поля · 4 × 4',description:'Шестнадцать клеток для твоего алгоритма',price:60,icon:'▦',requires:['for'],size:4},
  {id:'water',name:'Управление ростом',description:'water() и get_water() · рост вдвое быстрее',price:45,icon:'♧',requires:['plant']},
  {id:'carrot',name:'Почва и морковь',description:'till() · за посадку: 2 пшеницы · урожай: 7 ◈',price:75,icon:'🥕',requires:['grid4','water']},
  {id:'speed',name:'Шустрые моторы',description:'Выполнение команд в 1,5 раза быстрее',price:80,icon:'⚡',requires:['loops']},
  {id:'grid6',name:'Большая ферма · 6 × 6',description:'Больше пространства для оптимизации',price:160,icon:'▦',requires:['grid4'],size:6},
  {id:'beet',name:'Свёкла · цепочка ресурсов',description:'За посадку: 2 моркови · урожай: 12 ◈',price:110,icon:'🌱',requires:['carrot']},
  {id:'sunflower',name:'Солнечная энергия',description:'measure() · ищи больше лепестков ради энергии',price:180,icon:'🌻',requires:['beet']},
  {id:'expand',name:'Масштабирование · 8 × 8',description:'Шестьдесят четыре клетки',price:220,icon:'▦',requires:['grid6'],size:8}
];
export const LESSONS = [
  {title:'Первая команда',concept:'Робот выполняет команды по порядку. Имя команды и круглые скобки — это вызов функции.',task:'Напечатай harvest() и запусти программу. Собери первое растение.',syntax:'harvest()',hint:'Вызов пишется с двумя круглыми скобками. Золотистое растение уже созрело.',done:f=>f.harvests>=1},
  {title:'Из действия — в алгоритм',concept:'Несколько строк выполняются сверху вниз. Пшеница на травяной клетке отрастает сама.',task:'Собери 6 монет и открой «Повторение · while» в мастерской.',syntax:'команда()\nкоманда()',hint:'Дождись, когда пшеница снова созреет. Сейчас можно повторно запускать свой код.',done:f=>f.knows('loops')},
  {title:'Повторение без рутины',concept:'Цикл while повторяет свой блок. True означает «истина». Двоеточие начинает блок, четыре пробела выделяют вложенные строки.',task:'Напиши свой цикл while. Заработай на расширение до 2 × 2.',syntax:'while условие:\n    действие',hint:'Подумай, какое условие всегда истинно и какое действие нужно повторять. Остановить цикл можно кнопкой ■.',done:f=>f.used.includes('while')&&f.size>=2},
  {title:'Робот учится ходить',concept:'У поля есть координаты. North — вверх, South — вниз, East — вправо, West — влево. Края соединены.',task:'Напиши маршрут, который посетит все 4 клетки. Затем открой посадку.',syntax:'move(направление)',hint:'Робот делает один шаг за один вызов move. На новой клетке он может выполнить следующую команду.',done:f=>f.visited.length>=4&&f.knows('plant')},
  {title:'Управление грядкой',concept:'Сбор освобождает клетку. На свободной клетке можно вырастить своё растение.',task:'Посади пшеницу 4 раза с помощью своего кода. Открой «Решения · if».',syntax:'plant("wheat")',hint:'Посадка на занятой клетке возвращает False. Продумай порядок действий: что должно освободить грядку?',done:f=>f.planted>=4&&f.knows('senses')},
  {title:'Код принимает решения',concept:'can_harvest() отвечает, созрело ли растение. is_empty() проверяет, свободна ли клетка. if выполняет блок только при истинном условии.',task:'Используй условие if в своей программе. Затем открой for и переменные.',syntax:'if условие:\n    действие',hint:'Проверка возвращает True или False. В условии можно использовать ответ датчика вместо постоянного значения.',done:f=>f.used.includes('if')&&f.knows('for')},
  {title:'От маршрута — к обходу',concept:'for перебирает значения range(). Переменная хранит значение. Один цикл может находиться внутри другого.',task:'Используй for и открой поле 4 × 4. Найди свой способ обходить все строки.',syntax:'for имя in range(число):\n    действие',hint:'range(n) даёт числа от 0 до n − 1. Как связаны число шагов в строке и get_world_size()?',done:f=>f.used.includes('for')&&f.size>=4},
  {title:'Управление ростом',concept:'Полив ускоряет рост. get_water() показывает оставшуюся влажность от 0 до 1.',task:'Открой полив и используй water() в своей программе.',syntax:'water()\nget_water()',hint:'Сравни работу алгоритма с поливом и без него. Обязательно ли поливать уже влажную грядку?',done:f=>f.used.includes('water')},
  {title:'Почва и ресурсы',concept:'Моркови нужна почва, а за посадку расходуются 2 единицы пшеницы. till() меняет тип грунта. num_items() читает склад.',task:'Открой морковь и вырасти свой первый урожай. Позаботься о запасе пшеницы.',syntax:'till()\nget_ground_type()\nnum_items("wheat")',hint:'get_ground_type() возвращает "soil" или "grassland". Повторный till() вернёт травяной грунт.',done:f=>f.inventory.carrot>=1},
  {title:'Найди лучший порядок',concept:'У подсолнухов разное число лепестков. measure() измеряет растение под роботом. Среди 4 и более подсолнухов сбор самого большого даёт 8 энергии вместо 1.',task:'Открой свёклу и подсолнухи. Используй measure() и получи солнечную энергию.',syntax:'measure()',hint:'Нужно сравнить несколько значений. Что хранить в переменной, чтобы запомнить лучшее из уже увиденных?',done:f=>f.used.includes('measure')&&f.solarHarvests>0}
];
export function currentLesson(farm){return LESSONS.findIndex(l=>!l.done(farm));}
export class Farm {
  constructor(saved) {
    this.size=1;this.coins=0;this.harvests=0;this.actions=0;this.planted=0;
    this.robot={x:0,y:0};this.unlocked=['wheat'];this.upgrades=[];this.quests=[];this.used=[];this.visited=['0,0'];
    this.inventory={wheat:0,carrot:0,beet:0,sunflower:0};this.power=0;this.solarHarvests=0;
    this.tiles=[this.newTile(1)];this.onEvent=()=>{};
    const untouchedStarter=saved?.version===1&&saved.size===6&&saved.coins===25&&!(Number(saved.harvests)||Number(saved.actions)||Number(saved.planted))&&(!saved.upgrades||saved.upgrades.length===0);
    if(saved&&!untouchedStarter&&[1,2].includes(saved.version)&&[1,2,4,6,8].includes(saved.size)&&Array.isArray(saved.tiles)&&saved.tiles.length===saved.size**2){
      this.size=saved.size;
      for(const key of ['coins','harvests','actions','planted','power','solarHarvests'])this[key]=Math.max(0,Number(saved[key])||0);
      this.robot={x:Math.max(0,Math.min(this.size-1,Math.floor(Number(saved.robot?.x)||0))),y:Math.max(0,Math.min(this.size-1,Math.floor(Number(saved.robot?.y)||0)))};
      this.unlocked=['wheat',...(Array.isArray(saved.unlocked)?saved.unlocked:[]).filter(c=>c!=='wheat'&&CROPS[c])];
      this.upgrades=(Array.isArray(saved.upgrades)?saved.upgrades:[]).filter(id=>UPGRADES.some(u=>u.id===id));
      if(saved.version===1){for(const id of ['loops','expand2','plant','senses','for','grid4','water',...(this.size>=6?['grid6']:[])])if(!this.upgrades.includes(id))this.upgrades.push(id);}
      this.used=(Array.isArray(saved.used)?saved.used:[]).filter(x=>typeof x==='string');
      this.visited=(Array.isArray(saved.visited)?saved.visited:['0,0']).filter(x=>typeof x==='string');
      for(const key of Object.keys(this.inventory))this.inventory[key]=Math.max(0,Math.floor(Number(saved.inventory?.[key])||0));
      this.tiles=saved.tiles.map(t=>({crop:CROPS[t.crop]?t.crop:null,growth:Math.max(0,Math.min(1,Number(t.growth)||0)),water:Math.max(0,Math.min(40,Number(t.water)||0)),ground:t.ground==='soil'?'soil':'grassland',regrow:Math.max(0,Number(t.regrow)||0),petals:Math.max(6,Math.min(12,Number(t.petals)||6))}));
      this.tick(Math.min(28800,Math.max(0,(Date.now()-(Number(saved.savedAt)||Date.now()))/1000)));
    }
  }
  newTile(growth=0){return {crop:'wheat',growth,water:0,ground:'grassland',regrow:0,petals:6};}
  knows(id){return this.upgrades.includes(id);}
  require(id){if(!this.knows(id))throw new Error('Сначала открой «'+UPGRADES.find(u=>u.id===id).name+'» в мастерской.');}
  markUsed(feature){if(!this.used.includes(feature))this.used.push(feature);}
  get current(){return this.tiles[this.robot.y*this.size+this.robot.x];}
  get ready(){return this.tiles.filter(t=>t.crop&&t.growth>=1).length;}
  tick(dt){for(const t of this.tiles){if(!t.crop&&t.ground==='grassland'){const delay=Math.min(t.regrow,dt);t.regrow-=delay;if(t.regrow<=0){t.crop='wheat';t.growth=Math.min(1,(dt-delay)/CROPS.wheat.time);}}else if(t.crop&&t.growth<1){const wet=Math.min(dt,t.water);t.growth=Math.min(1,t.growth+(dt+wet)/CROPS[t.crop].time);}t.water=Math.max(0,t.water-dt);}}
  event(type,data={}){this.onEvent({type,...data});}
  act(type,data={}){this.actions++;this.markUsed(type);this.power=Math.max(0,this.power-.025);this.event(type,data);}
  move(direction){this.require('expand2');const dirs={East:[1,0],West:[-1,0],North:[0,-1],South:[0,1],east:[1,0],west:[-1,0],north:[0,-1],south:[0,1]};const d=dirs[direction];if(!d)throw new Error('Направление: North, South, East или West.');this.robot.x=(this.robot.x+d[0]+this.size)%this.size;this.robot.y=(this.robot.y+d[1]+this.size)%this.size;const p=this.robot.x+','+this.robot.y;if(!this.visited.includes(p))this.visited.push(p);this.act('move');return true;}
  plant(crop='wheat'){this.require('plant');const def=CROPS[crop];if(!def)throw new Error('Неизвестное растение. Используй wheat, carrot, beet или sunflower.');if(!this.unlocked.includes(crop))throw new Error(`${def.name}: сначала открой культуру в мастерской.`);if(this.current.crop)return false;if(def.soil&&this.current.ground!=='soil')throw new Error('Для этой культуры нужна почва. Проверь грунт и используй till().');for(const [item,amount]of Object.entries(def.cost)){if(this.inventory[item]<amount)throw new Error(`Для посадки нужно ${amount} ${CROPS[item].name.toLowerCase()}. Проверь склад.`);}for(const [item,amount]of Object.entries(def.cost))this.inventory[item]-=amount;Object.assign(this.current,{crop,growth:0,water:0,regrow:0,petals:6+Math.floor(Math.random()*7)});this.planted++;this.act('plant',{crop});return true;}
  harvest(){const t=this.current;if(!t.crop||t.growth<1)return false;const crop=t.crop,value=CROPS[crop].value;let power=0;if(crop==='sunflower'){const sunflowers=this.tiles.filter(t=>t.crop==='sunflower');power=sunflowers.length>=4&&t.petals===Math.max(...sunflowers.map(t=>t.petals))?8:1;this.power+=power;this.solarHarvests++;}this.coins+=value;this.inventory[crop]++;this.harvests++;Object.assign(t,{crop:null,growth:0,water:0,regrow:1.2});this.act('harvest',{crop,value,power});return true;}
  water(){this.require('water');if(!this.current.crop)return false;this.current.water=40;this.act('water');return true;}
  till(){this.require('carrot');const t=this.current;t.ground=t.ground==='soil'?'grassland':'soil';if(t.crop==='wheat')Object.assign(t,{crop:null,growth:0,regrow:1.2});this.act('till');return true;}
  canBuy(id){const u=UPGRADES.find(u=>u.id===id);return !!u&&!this.knows(id)&&this.coins>=u.price&&u.requires.every(r=>this.knows(r));}
  buy(id){if(!this.canBuy(id))return false;const u=UPGRADES.find(u=>u.id===id);this.coins-=u.price;this.upgrades.push(id);if(CROPS[id])this.unlocked.push(id);if(u.size&&u.size>this.size){const old=this.tiles,oldSize=this.size;this.size=u.size;this.tiles=Array.from({length:this.size**2},(_,i)=>{const x=i%this.size,y=Math.floor(i/this.size);return x<oldSize&&y<oldSize?old[y*oldSize+x]:this.newTile(0);});}this.event('upgrade',{id});return true;}
  serialize(){return {version:2,size:this.size,coins:this.coins,harvests:this.harvests,actions:this.actions,planted:this.planted,robot:{...this.robot},unlocked:[...this.unlocked],upgrades:[...this.upgrades],used:[...this.used],visited:[...this.visited],inventory:{...this.inventory},power:this.power,solarHarvests:this.solarHarvests,tiles:this.tiles.map(t=>({...t})),savedAt:Date.now()};}
}

export function validateUnlocks(nodes,farm){
  function expr(n,line){if(!n)return;if(n.type==='call'){const requirements={move:'expand2',plant:'plant',water:'water',can_harvest:'senses',is_empty:'senses',get_world_size:'for',get_pos_x:'senses',get_pos_y:'senses',range:'for',min:'for',max:'for',abs:'for',num_items:'senses',till:'carrot',get_ground_type:'carrot',get_water:'water',measure:'sunflower'};if(Object.hasOwn(requirements,n.name))check(requirements[n.name],line);n.args.forEach(a=>expr(a,line));}if(n.type==='binary'){check('for',line);expr(n.left,line);expr(n.right,line);}if(n.type==='unary'){check('for',line);expr(n.arg,line);}}
  function check(id,line){try{farm.require(id);}catch(e){throw new Error(`Строка ${line}: ${e.message}`);}}
  for(const n of nodes){if(n.type==='while')check('loops',n.line);if(n.type==='for'||n.type==='assign')check('for',n.line);if(n.type==='if')check('senses',n.line);expr(n.expr,n.line);if(n.type==='if'){for(const b of n.branches){expr(b.expr,n.line);validateUnlocks(b.body,farm);}}else if(n.body)validateUnlocks(n.body,farm);}
}

// A deliberately small interpreter. User programs never reach JavaScript eval,
// Function(), the DOM, network APIs or the host's object properties.
function tokenize(source){
  const out=[];let i=0;
  while(i<source.length){const c=source[i];if(/\s/.test(c)){i++;continue;}if(c==='#')break;
    if(c==='"'||c==="'"){const q=c;let value='';i++;let closed=false;while(i<source.length){if(source[i]===q){i++;closed=true;break;}if(source[i]==='\\'){i++;const escapes={n:'\n',t:'\t',r:'\r'};value+=escapes[source[i]]??source[i]??'';i++;}else value+=source[i++];}if(!closed)throw new Error('Не закрыта кавычка.');out.push({type:'literal',value});continue;}
    const num=source.slice(i).match(/^\d+(?:\.\d+)?/);if(num){out.push({type:'literal',value:Number(num[0])});i+=num[0].length;continue;}
    const name=source.slice(i).match(/^[A-Za-z_]\w*/);if(name){out.push({type:'name',value:name[0]});i+=name[0].length;continue;}
    const op=source.slice(i).match(/^(==|!=|<=|>=|\/\/|\+=|-=|[+\-*\/%<>()=,:])/);if(op){out.push({type:'op',value:op[0]});i+=op[0].length;continue;}
    throw new Error(`Неожиданный символ «${c}».`);
  }return out;
}
const PREC={or:1,and:2,'==':3,'!=':3,'<':3,'>':3,'<=':3,'>=':3,'+':4,'-':4,'*':5,'/':5,'//':5,'%':5};
function expression(tokens){let pos=0;const peek=()=>tokens[pos]?.value;
  function parse(min=0){let t=tokens[pos++];if(!t)throw new Error('Ожидалось выражение.');let left;
    if(t.value==='not'||t.value==='-'||t.value==='+')left={type:'unary',op:t.value,arg:parse(t.value==='not'?3:6)};
    else if(t.value==='('){left=parse();if(peek()!==')')throw new Error('Ожидалась закрывающая скобка.');pos++;}
    else if(t.type==='literal')left={type:'value',value:t.value};
    else if(t.type==='name'){if(peek()==='('){pos++;const args=[];while(peek()!==')'){args.push(parse());if(peek()===',')pos++;else if(peek()!==')')throw new Error('Ожидалась запятая или скобка.');}pos++;left={type:'call',name:t.value,args};}else left={type:'name',name:t.value};}
    else throw new Error('Ожидалось число, имя или вызов команды.');
    while(PREC[peek()]>=min){const op=tokens[pos++].value;left={type:'binary',op,left,right:parse(PREC[op]+1)};}return left;
  }const result=parse();if(pos!==tokens.length)throw new Error('Лишние символы в выражении.');return result;
}
export function compile(source){
  if(source.length>30000)throw new Error('Программа слишком большая (максимум 30 000 символов).');
  const lines=source.split('\n').map((raw,i)=>{if(raw.includes('\t'))raw=raw.replace(/\t/g,'    ');const space=raw.match(/^ */)[0].length;let tokens;try{tokens=tokenize(raw.trim());}catch(e){throw new Error(`Строка ${i+1}: ${e.message}`);}return {indent:space,tokens,line:i+1};}).filter(l=>l.tokens.length);
  if(!lines.length)throw new Error('Редактор пуст. Напиши свою программу. Список команд — в справочнике { }.');
  let index=0;
  function block(indent,inLoop=false){const nodes=[];while(index<lines.length){const l=lines[index];if(l.indent<indent)break;if(l.indent>indent)throw new Error(`Строка ${l.line}: лишний отступ. Используй 4 пробела для вложенного блока.`);const t=l.tokens,head=t[0].value;
      if(head==='else'||head==='elif')break;
      index++;
      try{
        if(['while','for','if'].includes(head)){
          if(t.at(-1).value!==':')throw new Error('В конце условия или цикла нужно двоеточие.');let node={type:head,line:l.line};
          if(head==='for'){if(t[1]?.type!=='name'||t[2]?.value!=='in')throw new Error('Формат цикла: for i in range(6):');node.name=t[1].value;node.expr=expression(t.slice(3,-1));}else node.expr=expression(t.slice(1,-1));
          if(index>=lines.length||lines[index].indent!==indent+4)throw new Error('Следующий блок должен иметь отступ в 4 пробела.');
          node.body=block(indent+4,inLoop||head!=='if');
          if(head==='if'){
            node.branches=[{expr:node.expr,body:node.body}];
            while(index<lines.length&&lines[index].indent===indent&&['elif','else'].includes(lines[index].tokens[0].value)){
              const alt=lines[index++],a=alt.tokens,isElse=a[0].value==='else';if(a.at(-1).value!==':'||(isElse&&a.length!==2))throw new Error(`Строка ${alt.line}: проверь else / elif и двоеточие.`);
              if(index>=lines.length||lines[index].indent!==indent+4)throw new Error(`Строка ${alt.line}: после условия нужен блок с отступом.`);
              node.branches.push({expr:isElse?null:expression(a.slice(1,-1)),body:block(indent+4,inLoop)});if(isElse)break;
            }
          }nodes.push(node);
        }else if(head==='break'){if(!inLoop)throw new Error('break можно использовать только внутри цикла.');if(t.length!==1)throw new Error('После break не нужно других команд.');nodes.push({type:'break',line:l.line});}
        else if(head==='pass'&&t.length===1)nodes.push({type:'pass',line:l.line});
        else if(t[0].type==='name'&&['=','+=','-='].includes(t[1]?.value))nodes.push({type:'assign',name:head,op:t[1].value,expr:expression(t.slice(2)),line:l.line});
        else nodes.push({type:'expr',expr:expression(t),line:l.line});
      }catch(e){if(/^Строка /.test(e.message))throw e;throw new Error(`Строка ${l.line}: ${e.message}`);}
    }return nodes;
  }
  const ast=block(0);if(index<lines.length)throw new Error(`Строка ${lines[index].line}: else / elif без соответствующего if.`);return ast;
}

export class Runner {
  constructor(source,farm,onPrint=()=>{}){
    const ast=compile(source);validateUnlocks(ast,farm);
    this.env=Object.create(null);this.line=1;this.done=false;
    const constants={True:true,False:false,None:null,North:'North',South:'South',East:'East',West:'West'};
    const api={move:d=>farm.move(d),plant:c=>farm.plant(c),harvest:()=>farm.harvest(),water:()=>farm.water(),can_harvest:()=>!!farm.current.crop&&farm.current.growth>=1,is_empty:()=>!farm.current.crop,get_world_size:()=>farm.size,get_pos_x:()=>farm.robot.x,get_pos_y:()=>farm.robot.y,till:()=>farm.till(),get_ground_type:()=>farm.current.ground,get_water:()=>farm.current.water/40,num_items:item=>{if(!Object.hasOwn(farm.inventory,item))throw new Error('На складе есть wheat, carrot, beet и sunflower.');return farm.inventory[item];},measure:()=>{farm.markUsed('measure');return farm.current.crop==='sunflower'?farm.current.petals:null;},print:(...v)=>{onPrint(v.map(x=>String(x)).join(' '));return null;},range:(...a)=>{if(a.length<1||a.length>3||a.some(n=>!Number.isInteger(n)))throw new Error('range принимает от 1 до 3 целых чисел.');let start=a.length===1?0:a[0],end=a.length===1?a[0]:a[1],step=a[2]??1;if(step===0)throw new Error('Шаг range не может быть нулём.');if(Math.abs((end-start)/step)>1000)throw new Error('В range можно не более 1000 шагов.');let out=[];for(let i=start;step>0?i<end:i>end;i+=step)out.push(i);return out;},min:Math.min,max:Math.max,abs:Math.abs};
    this.evaluate=n=>{
      if(n.type==='value')return n.value;
      if(n.type==='name'){if(Object.hasOwn(this.env,n.name))return this.env[n.name];if(Object.hasOwn(constants,n.name))return constants[n.name];throw new Error(`Переменная «${n.name}» ещё не задана.`);}
      if(n.type==='call'){if(!Object.hasOwn(api,n.name))throw new Error(`Неизвестная команда «${n.name}». Открой справочник { }.`);return api[n.name](...n.args.map(this.evaluate));}
      if(n.type==='unary'){const a=this.evaluate(n.arg);return n.op==='not'?!a:n.op==='-'?-a:+a;}
      if(n.type==='binary'){const a=this.evaluate(n.left);if(n.op==='and')return a&&this.evaluate(n.right);if(n.op==='or')return a||this.evaluate(n.right);const b=this.evaluate(n.right);if(['/', '//','%'].includes(n.op)&&b===0)throw new Error('Нельзя делить на ноль.');const ops={'+':()=>a+b,'-':()=>a-b,'*':()=>a*b,'/':()=>a/b,'//':()=>Math.floor(a/b),'%':()=>a%b,'==':()=>a===b,'!=':()=>a!==b,'<':()=>a<b,'>':()=>a>b,'<=':()=>a<=b,'>=':()=>a>=b};const result=ops[n.op]();if(typeof result==='string'&&result.length>2000)throw new Error('Строка слишком длинная.');if(typeof result==='number'&&!Number.isFinite(result))throw new Error('Слишком большое число.');return result;}
    };
    const self=this;
    function* execute(nodes){for(const n of nodes){self.line=n.line;if(['while','for','if'].includes(n.type))farm.markUsed(n.type);
      if(n.type==='break'){yield {kind:'action',line:n.line,run:()=>{}};return 'break';}
      if(n.type==='while'){while(true){self.line=n.line;yield {kind:'check',line:n.line};if(!self.evaluate(n.expr))break;if((yield* execute(n.body))==='break')break;}}
      else if(n.type==='for'){yield {kind:'check',line:n.line};const values=self.evaluate(n.expr);if(!Array.isArray(values))throw new Error('После in используй range(...).');for(const v of values){self.env[n.name]=v;yield {kind:'check',line:n.line};if((yield* execute(n.body))==='break')break;}}
      else if(n.type==='if'){for(const branch of n.branches){yield {kind:'check',line:n.line};if(branch.expr===null||self.evaluate(branch.expr)){if((yield* execute(branch.body))==='break')return 'break';break;}}}
      else yield {kind:'action',line:n.line,run:()=>{if(n.type==='expr')self.evaluate(n.expr);else if(n.type==='assign'){if(Object.hasOwn(constants,n.name)||Object.hasOwn(api,n.name))throw new Error('Это имя зарезервировано командой или направлением.');const v=self.evaluate(n.expr);if(n.op==='=')self.env[n.name]=v;else{if(!Object.hasOwn(self.env,n.name))throw new Error(`Сначала задай переменную «${n.name}».`);self.env[n.name]=n.op==='+='?self.env[n.name]+v:self.env[n.name]-v;}}}};
    }}
    this.iterator=execute(ast);
  }
  step(){if(this.done)return null;try{for(let i=0;i<600;i++){const next=this.iterator.next();if(next.done){this.done=true;return null;}this.line=next.value.line;if(next.value.kind==='action'){next.value.run();return {line:this.line};}}throw new Error('Цикл не выполняет действий. Добавь move(), plant(), harvest() или другую команду.');}catch(e){this.done=true;throw new Error(`Строка ${this.line}: ${e.message}`);}}
}

// Retire old bundled examples while preserving programs written by the player.
export function restorePlayerCode(saved) {
  if (typeof saved?.code !== 'string') return '';
  if (saved.codeOrigin === 'player') return saved.code;
  const code = saved.code.trim().replace(/\r\n/g, '\n');
  let hash = 2166136261;
  for (const character of code) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  const retiredExamples = ['7a7a5358', '671b3a09', 'b55d55b1', '593d84c', '30852970'];
  return retiredExamples.includes((hash >>> 0).toString(16)) ? '' : saved.code;
}
