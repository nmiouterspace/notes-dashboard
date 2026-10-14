import test from 'node:test';
import assert from 'node:assert/strict';
import {visibleItems,normalize,merge} from '../model.js';
import {mandyOf,MANDY_PREFIX} from '../mandy.js';
const base={id:'mandy-fee-abc123-8',type:'task',title:'Follow-up',body:'Còn 2 buổi',done:false,urgent:true,deleted:false,createdAt:'2026-10-14T00:00:00Z',updatedAt:'2026-10-14T00:00:00Z'};
const wrap=(...items)=>normalize({version:1,items});
test('legacy alerts are separate from all personal views',()=>{
 const doc=wrap(base,{...base,id:'personal'});
 assert.equal(visibleItems(doc,'mandy').length,1);
 assert.deepEqual(visibleItems(doc,'open').map(x=>x.id),['personal']);
 assert.deepEqual(visibleItems(doc,'urgent').map(x=>x.id),['personal']);
 assert.equal(visibleItems(wrap({...base,done:true}),'done').length,0);
});
test('future notification types and archived records stay out of notes/tasks',()=>{
 const item={...base,id:'mandy-notice-1',type:'note',body:MANDY_PREFIX+JSON.stringify({kind:'class-update',active:true,details:'Lịch lớp'})};
 assert.equal(mandyOf(item).kind,'class-update');
 assert.equal(visibleItems(wrap(item),'mandy','Lịch lớp').length,1);
 assert.equal(visibleItems(wrap(item),'notes').length,0);
 const archived={...item,body:MANDY_PREFIX+JSON.stringify({kind:'class-update',active:false,details:'Lịch lớp'})};
 assert.equal(visibleItems(wrap(archived),'mandy').length,0);
 assert.equal(visibleItems(wrap({...item,deleted:true}),'mandy').length,0);
});
test('migration supersedes stale offline task with same ID',()=>{
 const item={...base,type:'note',urgent:false,body:MANDY_PREFIX+JSON.stringify({kind:'tuition',active:true,details:'Còn 1 buổi'}),updatedAt:'2026-10-14T01:00:00Z'};
 const doc=merge(wrap(base),wrap(item));
 assert.equal(doc.items.length,1);
 assert.equal(visibleItems(doc,'open').length,0);
 assert.match(mandyOf(visibleItems(doc,'mandy')[0]).details,/1 buổi/);
});
