const dayMs=86400000;
export function thaiDay(value){
  if(value===null||value===undefined||value==='')return null;
  const date=value?.toDate?value.toDate():new Date(value);
  return Number.isFinite(date.getTime())?new Date(date.getTime()+7*3600000).toISOString().slice(0,10):null;
}
const shift=(day,count)=>new Date(Date.parse(day+'T00:00:00Z')+count*dayMs).toISOString().slice(0,10);
export function periodKey(day,kind){
  if(!day)return 'unknown';
  return kind==='month'?day.slice(0,7):shift(day,-((new Date(day+'T00:00:00Z').getUTCDay()+6)%7));
}
export function periodBounds(key,kind){
  if(kind==='week')return {start:key,end:shift(key,6)};
  const start=key+'-01',date=new Date(start+'T00:00:00Z');
  date.setUTCMonth(date.getUTCMonth()+1);
  return {start,end:shift(date.toISOString().slice(0,10),-1)};
}
export function transactions(items){return items.filter(item=>(item.type==='income'||item.type==='expense')&&Number.isFinite(item.amount)&&item.amount>0);}
export function summarize(items){
  let income=0,expense=0;const categories=new Map();const entries=transactions(items);
  for(const item of entries){const cents=Math.round(item.amount*100);if(item.type==='income')income+=cents;else{expense+=cents;const category=item.category||'อื่น ๆ';categories.set(category,(categories.get(category)||0)+cents);}}
  return {income:income/100,expense:expense/100,net:(income-expense)/100,count:entries.length,categories:[...categories].map(([name,cents])=>({name,amount:cents/100})).sort((first,second)=>second.amount-first.amount)};
}
export function selectEntries(items,{start,end,type='all',category='all'}={}){
  return transactions(items).filter(item=>{const day=thaiDay(item.date);return (!start||(day&&day>=start))&&(!end||(day&&day<=end))&&(type==='all'||item.type===type)&&(category==='all'||item.category===category);}).sort((first,second)=>(Date.parse(second.date)||0)-(Date.parse(first.date)||0));
}
export function groups(items,kind,{now=new Date(),includeEmpty=false}={}){
  const grouped=new Map();
  for(const item of selectEntries(items)){const key=periodKey(thaiDay(item.date),kind);if(!grouped.has(key))grouped.set(key,[]);grouped.get(key).push(item);}
  if(includeEmpty){let day=thaiDay(now);for(let index=0;index<(kind==='week'?8:7);index++){const key=periodKey(day,kind);if(!grouped.has(key))grouped.set(key,[]);day=kind==='week'?shift(day,-7):shift(key+'-01',-1);}}
  return [...grouped].sort(([first],[second])=>first==='unknown'?1:second==='unknown'?-1:second.localeCompare(first)).map(([key,entries])=>({key,entries,...summarize(entries)}));
}
export function periodLabel(key,kind){
  if(key==='unknown')return 'ไม่ทราบวันที่';
  const format=day=>new Date(day+'T00:00:00Z').toLocaleDateString('th-TH',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'});
  if(kind==='week'){const bounds=periodBounds(key,kind);return format(bounds.start)+' – '+format(bounds.end);}
  return new Date(key+'-01T00:00:00Z').toLocaleDateString('th-TH',{timeZone:'UTC',month:'long',year:'numeric'});
}
