export const names=['ایتان','میلینگ','شان','رایزال','دایان'];
export const days=['شنبه','یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنجشنبه','جمعه'];
export const jobs=['خرید','آشپزی','نظافت','دیدار'];
export const quotas=[2,4,2,2];
export const cards=names.flatMap((_,p)=>Array.from({length:4},(_,i)=>`${p}-${i}`));
export const blankBoard=()=>Object.fromEntries(cards.map(c=>[c,null]));
export function cleanBoard(b){const out=blankBoard(),counts={};for(const c of cards){const v=b?.[c];if(Number.isInteger(v)&&v>=0&&v<28&&(counts[v]||0)<2){out[c]=v;counts[v]=(counts[v]||0)+1}}return out}
export function evaluate(input){
 const board=cleanBoard(input),cells=Array.from({length:28},(_,i)=>({id:i,day:Math.floor(i/4),job:i%4,cards:cards.filter(c=>board[c]===i),errors:[],valid:false,locked:false}));
 const daily=Array.from({length:7},()=>Array(5).fill(0));for(const c of cards)if(board[c]!==null)daily[Math.floor(board[c]/4)][+c[0]]++;
 for(const cell of cells){const {day:d,job:j,cards:cc,errors:e}=cell;const people=cc.map(c=>+c[0]);
 if(people.length===2&&people[0]===people[1])e.push('برای این کار دو دوست متفاوت لازم است.');
 for(const p of new Set(people)){
 if(d===4&&p===1)e.push('میلینگ چهارشنبه حضور ندارد.');
 if(d===6&&p===0)e.push('ایتان جمعه حضور ندارد.');
 if(d===0&&j===0&&(p===3||p===4))e.push(`${names[p]} شنبه خرید نمی‌کند.`);
 if(d===2&&j===1&&p===2)e.push('شان دوشنبه آشپزی نمی‌کند.');
 if(daily[d][p]>2)e.push(`${names[p]} امروز فقط دو نوبت وقت دارد.`);
 }cell.base=cc.length===2&&e.length===0;cell.valid=cell.base;
 }
 const cleans=cells.filter(c=>c.job===2&&c.base);for(let i=0;i<cleans.length;i++)for(let k=i+1;k<cleans.length;k++)if(Math.abs(cleans[i].day-cleans[k].day)<3)for(const c of [cleans[i],cleans[k]]){c.errors.push('بین دو نظافت باید دو روز کامل فاصله باشد.');c.valid=false}
 const stock=[],food=Array(7).fill(false),source=Array(7).fill(null);let priorCook=false;
 for(let d=0;d<7;d++){
 const buy=cells[d*4],cook=cells[d*4+1];if(buy.valid)stock.push({day:d,left:2});
 cook.locked=priorCook&&cook.cards.length===0;
 let effective=false;
 if(cook.cards.length&&priorCook){cook.errors.push('غذای امروز از آشپزی دیروز آماده است؛ این نوبت را جابه‌جا کن.');cook.valid=false}
 else if(cook.base){const available=stock.find(s=>s.left>0&&d-s.day<=2);if(available){available.left--;effective=true;cook.source=available.day;food[d]=true;source[d]=d;if(d<6){food[d+1]=true;source[d+1]=d}}else{cook.valid=false;cook.errors.push('برای این آشپزی، خرید معتبر با مواد مصرف‌نشده و حداکثر سه‌روزه لازم است.')}}
 priorCook=effective;
 }
 const counts=jobs.map((_,j)=>cells.filter(c=>c.job===j&&c.valid).length);
 for(const c of cells)if(!c.cards.length&&counts[c.job]>=quotas[c.job])c.locked=true;
 const used=cards.filter(c=>board[c]!==null).length,problems=[];
 if(used<20)problems.push(`${20-used} کارت هنوز در دستهٔ دوستان است.`);
 for(const c of cells)if(c.cards.length===1)problems.push(`${days[c.day]}، ${jobs[c.job]}: یک همکار دیگر لازم است.`);else if(c.errors.length)problems.push(`${days[c.day]}، ${jobs[c.job]}: ${[...new Set(c.errors)].join(' ')}`);
 for(let j=0;j<4;j++)if(cells.filter(c=>c.job===j&&c.cards.length).length!==quotas[j]||counts[j]!==quotas[j])problems.push(`${jobs[j]}: دقیقاً ${quotas[j]} نوبت معتبر لازم است؛ اکنون ${counts[j]} نوبت معتبر است.`);
 for(let d=0;d<7;d++)if(!food[d])problems.push(`غذای ${days[d]} هنوز تأمین نشده است.`);
 return {board,cells,counts,used,food,source,problems,solved:problems.length===0};
}
export const sample=[[[0,1],[2,3],[],[]],[[],[],[0,4],[1,2]],[[],[0,1],[],[]],[[],[],[],[]],[[2,4],[0,3],[],[]],[[],[],[1,3],[2,4]],[[],[3,4],[],[]]];
export function sampleBoard(){const b=blankBoard(),n=Array(5).fill(0);sample.forEach((row,d)=>row.forEach((people,j)=>people.forEach(p=>{b[`${p}-${n[p]++}`]=d*4+j})));return b}
export const sides=['top','right','bottom','left'],sideNames=['بالا','راست','پایین','چپ'];
export const pointIds=sides.flatMap(s=>Array.from({length:8},(_,i)=>`${s}-${i+1}`));
export const edgeKey=(a,b)=>[a,b].sort().join('|');
export const edges=sides.flatMap((s,k)=>Array.from({length:8},(_,i)=>({a:`${s}-${i+1}`,b:`${sides[(k+1)%4]}-${(i+1)%8+1}`,group:k,key:edgeKey(`${s}-${i+1}`,`${sides[(k+1)%4]}-${(i+1)%8+1}`)})));
export function cleanLines(a){return Array.isArray(a)?[...new Set(a)].filter(k=>edges.some(e=>e.key===k)):[]}
export function point(id){const [s,n]=id.split('-'),t=(+n-1)*50;return s==='top'?[t,0]:s==='right'?[400,t]:s==='bottom'?[400-t,400]:[0,400-t]}
export const coverage=d=>2**(d-13);
export function parseDay(value){const normalized=String(value).trim().replace(/[۰-۹]/g,c=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g,c=>'٠١٢٣٤٥٦٧٨٩'.indexOf(c));return /^\d+$/.test(normalized)&&+normalized>=1&&+normalized<=13?+normalized:null}
