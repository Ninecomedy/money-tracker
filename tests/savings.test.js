import test from 'node:test';
import assert from 'node:assert/strict';
import { walletTotals, savingsTransfer } from '../savings.js';
const wallet={opening:250,reserve:50,items:[]};
test('savings moves conserve total, income and expense',()=>{
  const initial=walletTotals(wallet);
  const added=savingsTransfer(wallet,80,'add');
  const next=walletTotals({...wallet,reserve:added.after});
  assert.equal(next.reserve,130);assert.equal(next.free,120);
  assert.equal(next.balance,next.free+next.reserve);
  assert.equal(next.income,initial.income);assert.equal(next.expense,initial.expense);
  const removed=savingsTransfer({...wallet,reserve:added.after},130,'remove');
  assert.equal(removed.after,0);
});
test('reject invalid amounts and insufficient funds',()=>{
  for(const amount of [-1,0,NaN,Infinity,0.001,201])assert.throws(()=>savingsTransfer(wallet,amount,'add'));
  assert.throws(()=>savingsTransfer(wallet,51,'remove'));
  assert.equal(savingsTransfer(wallet,200,'add').after,250);
});
test('transactions respect expenses and decimals',()=>{
  const changed={...wallet,items:[{type:'expense',amount:190}]};
  assert.throws(()=>savingsTransfer(changed,11,'add'));
  assert.equal(savingsTransfer({opening:1,reserve:0.1,items:[]},0.2,'add').after,0.3);
});
test('legacy savings are preserved even when spendable balance is negative',()=>{
  const totals=walletTotals({...wallet,items:[{type:'expense',amount:230}]});
  assert.equal(totals.reserve,50);assert.equal(totals.free,-30);
  assert.equal(totals.balance,totals.free+totals.reserve);
});
