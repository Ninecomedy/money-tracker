import {groups,summarize,selectEntries,periodBounds,periodLabel} from './reports.js';
const money=value=>new Intl.NumberFormat('th-TH',{maximumFractionDigits:2}).format(value)+' บาท';
function element(tag,text,className){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;if(className)node.className=className;return node;}
export function createReports(root,entryRow){
  let items=[],loaded=false,view='history',selected=null,type='all',category='all',chosen={week:'all',month:'all'};
  const expanded=new Map();
  const tabs=element('div',undefined,'toolbar section');
  const content=element('div');root.replaceChildren(tabs,content);
  for(const [key,label] of [['history','ประวัติรายการ'],['week','สรุปรายสัปดาห์'],['month','สรุปรายเดือน']]){const button=element('button',label,'ghost');button.type='button';button.onclick=()=>{view=key;selected=null;render();};button.dataset.view=key;tabs.append(button);}
  function metrics(summary){const grid=element('div',undefined,'report-metrics');for(const [label,value,color] of [['รายรับ',money(summary.income),'inc'],['รายจ่าย',money(summary.expense),'exp'],['สุทธิ',money(summary.net),summary.net<0?'exp':'inc'],['รายการ',String(summary.count),'']]){const cell=element('div');cell.append(element('span',label,'tiny'),element('strong',value,'e-amt '+color));grid.append(cell);}return grid;}
  function categories(summary,parent){const section=element('div',undefined,'section');section.append(element('h3','ค่าใช้จ่ายแยกหมวดหมู่'));for(const item of summary.categories)section.append(element('p',item.name+' · '+money(item.amount),'sub'));if(!summary.categories.length)section.append(element('p','ไม่มีรายจ่ายในช่วงเวลานี้','tiny'));parent.append(section);}
  function rows(entries,parent){if(!entries.length)parent.append(element('p','ไม่มีรายการในช่วงเวลานี้','empty'));for(const item of entries){const details=element('details',undefined,'report-entry');const title=element('summary',(item.note||item.name||'รายการ')+' · '+(item.type==='income'?'+':'−')+money(item.amount));title.className=item.type==='income'?'inc':'exp';details.append(title);const date=new Date(item.date);details.append(element('p',(item.type==='income'?'รายรับ':'รายจ่าย')+' · '+item.category+' · '+(Number.isNaN(date.getTime())?'ไม่ทราบวันที่':date.toLocaleString('th-TH',{timeZone:'Asia/Bangkok'})),'tiny'));if(item.note)details.append(element('p','หมายเหตุ: '+item.note,'sub'));details.append(entryRow(item));parent.append(details);}}
  function filter(label,values,current,onChange){const wrapper=element('label',label);const select=element('select');select.setAttribute('aria-label',label);for(const [value,text] of values){const option=element('option',text);option.value=value;select.append(option);}select.value=current;select.onchange=()=>onChange(select.value);wrapper.append(select);return wrapper;}
  function render(){
    content.replaceChildren();for(const button of tabs.children)button.setAttribute('aria-pressed',String(button.dataset.view===view));
    if(!loaded){content.append(element('p','กำลังโหลดประวัติจาก Firestore…','empty'));return;}
    if(selected){
      const back=element('button','← กลับไปหน้าสรุป','ghost small');back.onclick=()=>{selected=null;render();};content.append(back,element('h3',periodLabel(selected,view)));
      const periodItems=selectEntries(items,periodBounds(selected,view)),summary=summarize(periodItems);
      if(category!=='all'&&!periodItems.some(item=>item.category===category))category='all';
      content.append(metrics(summary),element('p','ยอดรวมทั้งช่วงเวลา · ตัวกรองด้านล่างเปลี่ยนเฉพาะรายการ','tiny'));categories(summary,content);
      const filters=element('div',undefined,'report-filters section');filters.append(filter('ประเภท',[['all','ทั้งหมด'],['income','รายรับ'],['expense','รายจ่าย']],type,value=>{type=value;render();}),filter('หมวดหมู่',[['all','ทุกหมวดหมู่'],...[...new Set(periodItems.map(item=>item.category))].sort().map(value=>[value,value])],category,value=>{category=value;render();}));content.append(filters);
      rows(selectEntries(periodItems,{type,category}),content);return;
    }
    const kind=view==='history'?'month':view,periods=groups(items,kind,{includeEmpty:view!=='history'});
    content.append(element('p','เวลาไทย (Asia/Bangkok) · สุทธิ = รายรับ − รายจ่าย ไม่รวมเงินเก็บ','tiny'));
    if(view==='history'){
      if(!periods.length)content.append(element('p','ไม่มีรายการในช่วงเวลานี้','empty'));
      for(const period of periods){const details=element('details',undefined,'report-period');details.open=expanded.get(period.key)??period===periods[0];details.ontoggle=()=>{if(details.isConnected)expanded.set(period.key,details.open);};const heading=element('summary',periodLabel(period.key,'month'));heading.append(metrics(period));details.append(heading);rows(period.entries,details);content.append(details);}return;
    }
    content.append(filter('เลือก'+(kind==='week'?'สัปดาห์':'เดือน'),[['all','ทั้งหมด'],...periods.filter(period=>period.key!=='unknown').map(period=>[period.key,periodLabel(period.key,kind)])],chosen[kind],value=>{chosen[kind]=value;render();}));
    const visible=periods.filter(period=>period.key!=='unknown'&&(chosen[kind]==='all'||chosen[kind]===period.key));
    const max=Math.max(1,...visible.flatMap(period=>[period.income,period.expense]));
    for(const period of visible){const card=element('button',undefined,'report-card');card.type='button';card.setAttribute('aria-label','ดูรายละเอียด '+periodLabel(period.key,kind));card.append(element('h3',periodLabel(period.key,kind)),metrics(period));if(kind==='week')card.append(element('p','ใช้จ่ายสูงสุด: '+(period.categories[0]?.name||'ไม่มีรายจ่าย'),'tiny'));else{for(const [value,color,label] of [[period.income,'var(--green)','รายรับ'],[period.expense,'var(--red)','รายจ่าย']]){const bar=element('div',undefined,'report-bar');bar.style.width=(100*value/max)+'%';bar.style.background=color;bar.setAttribute('aria-label',label+' '+money(value));card.append(bar);}card.append(element('p',period.categories.map(item=>item.name+': '+money(item.amount)).join(' · ')||'ไม่มีรายจ่าย','tiny'));}card.append(element('span','ดูรายการทั้งหมด →','report-link'));card.onclick=()=>{selected=period.key;type='all';category='all';render();};content.append(card);}
  }
  return {update(next,isLoaded){items=next;loaded=isLoaded;render();},reset(){view='history';selected=null;type='all';category='all';chosen={week:'all',month:'all'};expanded.clear();}};
}
