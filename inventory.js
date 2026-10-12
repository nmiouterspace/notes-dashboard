// Structured note bodies preserve inventory in the existing Drive v1 format.
const PREFIX='notes:inventory:v1\n';
export function materialOf(item){
 if(item.type!=='note'||!item.body.startsWith(PREFIX))return null;
 try{const x=JSON.parse(item.body.slice(PREFIX.length));if(typeof x.quantity!=='number'||!Number.isFinite(x.quantity)||x.quantity<0||typeof x.unit!=='string'||!x.unit.trim()||x.unit.length>30||typeof x.details!=='string'||x.details.length>18000)return null;return x}catch{return null}
}
export function materialBody(quantity,unit,details=''){
 if(!Number.isFinite(quantity)||quantity<0||!unit.trim()||unit.trim().length>30||details.length>18000)throw new Error('Kiểm tra số lượng tồn và đơn vị tính.');
 return PREFIX+JSON.stringify({quantity,unit:unit.trim(),details});
}
