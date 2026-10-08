// Notes has its own Drive file and key; never points to Mandy data.
function setupNotes() {
 const p=PropertiesService.getScriptProperties();
 if(!p.getProperty('NOTES_KEY'))p.setProperty('NOTES_KEY',Utilities.getUuid()+Utilities.getUuid());
 if(!p.getProperty('NOTES_FILE_ID')){
  const file=DriveApp.createFile('notes-dashboard-data.json',JSON.stringify({revision:0,document:{version:1,items:[]}}),MimeType.PLAIN_TEXT);
  p.setProperty('NOTES_FILE_ID',file.getId());
 }
 console.log('Thiết lập Notes hoàn tất. Khóa riêng nằm trong Project Settings > Script properties > NOTES_KEY. Không chia sẻ khóa này.');
}
function doGet(){return json_({ok:true,service:'Notes Sync',message:'Use authenticated POST requests.'})}
function doPost(e){
 const lock=LockService.getScriptLock();let locked=false;
 try{
  if(!e||!e.postData||e.postData.contents.length>5500000)throw new Error('Yêu cầu không hợp lệ.');
  const b=JSON.parse(e.postData.contents),p=PropertiesService.getScriptProperties(),secret=p.getProperty('NOTES_KEY');
  if(!secret||typeof b.token!=='string'||b.token!==secret)throw new Error('Khóa đồng bộ không đúng hoặc chưa thiết lập Notes.');
  if(!['load','save'].includes(b.action))throw new Error('Thao tác không được hỗ trợ.');
  lock.waitLock(15000);locked=true;
  const file=DriveApp.getFileById(p.getProperty('NOTES_FILE_ID'));
  const current=JSON.parse(file.getBlob().getDataAsString('UTF-8'));
  if(b.action==='load')return json_({ok:true,revision:current.revision,document:current.document});
  if(typeof b.requestId!=='string'||b.requestId.length>100)throw new Error('Thiếu mã lưu.');
  if(current.requestId===b.requestId)return json_({ok:true,revision:current.revision,document:current.document});
  if(b.revision!==current.revision)throw new Error('Có thay đổi từ thiết bị khác. Bấm Đồng bộ lại để hợp nhất.');
  const document=validate_(b.document);
  // Private rotating recovery snapshot; only this script uses these file IDs.
  const previous=file.getBlob().getDataAsString('UTF-8');
  const slot=String((current.revision||0)%5),prop='NOTES_BACKUP_'+slot,backup=p.getProperty(prop);
  if(backup)DriveApp.getFileById(backup).setContent(previous);
  else p.setProperty(prop,DriveApp.createFile('notes-backup-'+slot+'.json',previous,MimeType.PLAIN_TEXT).getId());
  const next={revision:current.revision+1,document:document,requestId:b.requestId,updatedAt:new Date().toISOString()};
  file.setContent(JSON.stringify(next));return json_({ok:true,revision:next.revision,document:document});
 }catch(err){return json_({ok:false,error:String(err.message||err)})}finally{if(locked)lock.releaseLock()}
}
function validate_(doc){
 if(!doc||doc.version!==1||!Array.isArray(doc.items)||doc.items.length>10000)throw new Error('Dữ liệu Notes không hợp lệ.');
 const seen={};const items=doc.items.map(x=>{
  if(!x||typeof x.id!=='string'||!x.id||x.id.length>100||Object.prototype.hasOwnProperty.call(seen,x.id)||!['task','note'].includes(x.type)||typeof x.title!=='string'||!x.title.trim()||x.title.length>300||typeof x.body!=='string'||x.body.length>20000||typeof x.done!=='boolean'||typeof x.urgent!=='boolean'||!Number.isFinite(Date.parse(x.createdAt))||!Number.isFinite(Date.parse(x.updatedAt)))throw new Error('Một mục ghi chú không hợp lệ.');
  seen[x.id]=true;return {id:x.id,type:x.type,title:x.title.trim(),body:x.body,done:x.done,urgent:x.urgent,deleted:!!x.deleted,createdAt:x.createdAt,updatedAt:x.updatedAt};
 });return {version:1,items:items};
}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON)}
