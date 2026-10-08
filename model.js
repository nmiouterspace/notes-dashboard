export function normalize(doc){
 if(!doc||doc.version!==1||!Array.isArray(doc.items)||doc.items.length>10000) throw new Error('Bản sao không đúng định dạng Notes.');
 const ids=new Set(); const items=doc.items.map(x=>{
  if(!x||typeof x.id!=='string'||!x.id||x.id.length>100||ids.has(x.id)||!['task','note'].includes(x.type)||typeof x.title!=='string'||!x.title.trim()||x.title.length>300||typeof x.body!=='string'||x.body.length>20000||!Number.isFinite(Date.parse(x.updatedAt))||!Number.isFinite(Date.parse(x.createdAt))||typeof x.done!=='boolean'||typeof x.urgent!=='boolean')throw new Error('Có mục không hợp lệ trong bản sao.');
  ids.add(x.id);return {id:x.id,type:x.type,title:x.title.trim(),body:x.body,urgent:x.urgent,done:x.done,deleted:!!x.deleted,createdAt:x.createdAt,updatedAt:x.updatedAt};
 });return {version:1,items};
}
export function merge(a,b){
 const items=new Map();for(const item of [...normalize(a).items,...normalize(b).items]){
 const old=items.get(item.id);if(!old||Date.parse(item.updatedAt)>Date.parse(old.updatedAt)||(Date.parse(item.updatedAt)===Date.parse(old.updatedAt)&&JSON.stringify(item)>JSON.stringify(old)))items.set(item.id,item);
 }return {version:1,items:[...items.values()]};
}
export function visibleItems(doc,view,query=''){
 const q=query.toLocaleLowerCase('vi');return doc.items.filter(x=>!x.deleted&&(view==='notes'?x.type==='note':x.type==='task'&&(view==='done'?x.done:!x.done&&(view!=='urgent'||x.urgent)))&&`${x.title} ${x.body}`.toLocaleLowerCase('vi').includes(q)).sort((a,b)=>Number(b.urgent)-Number(a.urgent)||Date.parse(a.createdAt)-Date.parse(b.createdAt));
}
