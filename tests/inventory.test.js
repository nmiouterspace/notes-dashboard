import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import {materialBody,materialOf} from '../inventory.js';
import {normalize,merge,visibleItems} from '../model.js';
const item={id:'stock-test',type:'note',title:'Dây điện',body:materialBody(2.5,'mét','Cuộn còn lại'),done:false,urgent:false,deleted:false,createdAt:'2026-10-12T00:00:00Z',updatedAt:'2026-10-12T00:00:00Z'};
test('inventory survives current Apps Script validation, backup and device merge',()=>{
 const context=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../google-drive-sync/Code.gs',import.meta.url),'utf8'),context);
 const document={version:1,items:[item]};const remote=JSON.parse(JSON.stringify(context.validate_(document)));
 const restored=normalize(JSON.parse(JSON.stringify(remote)));
 assert.deepEqual(materialOf(merge(document,restored).items[0]),{quantity:2.5,unit:'mét',details:'Cuộn còn lại'});
 assert.equal(visibleItems(restored,'materials').length,1);
 for(const view of ['open','urgent','done','notes'])assert.equal(visibleItems(restored,view).length,0);
});
test('zero stock remains visible; negative and invalid stock rejected',()=>{
 assert.equal(materialOf({...item,body:materialBody(0,'hộp')}).quantity,0);
 assert.throws(()=>materialBody(-1,'hộp'));assert.throws(()=>materialBody(NaN,'hộp'));assert.throws(()=>materialBody(1,''));
 assert.equal(materialOf({...item,body:'Ghi chú thông thường'}),null);
 assert.equal(materialOf({...item,body:'notes:inventory:v1\ninvalid'}),null);
});
