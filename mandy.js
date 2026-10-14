// Mandy owns these records. Keep them out of personal lists, including legacy tasks.
export const MANDY_PREFIX='notes:mandy:v1\n';
export function mandyOf(item){
 if(item.body?.startsWith(MANDY_PREFIX)){
  try{const data=JSON.parse(item.body.slice(MANDY_PREFIX.length));if(typeof data.kind==='string'&&typeof data.details==='string')return data}catch{}
 }
 if(/^mandy-fee-[a-f0-9]+-\d+$/.test(item.id))return {kind:'tuition',details:item.body,active:!item.done};
 return null;
}
export function activeMandy(item){const data=mandyOf(item);return !!data&&!item.deleted&&data.active!==false}
