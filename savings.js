export function walletTotals(data) {
  const cents = value => Math.round(value * 100);
  const incomeCents = data.items.filter(item => item.type === 'income').reduce((sum, item) => sum + cents(item.amount), 0);
  const expenseCents = data.items.filter(item => item.type === 'expense').reduce((sum, item) => sum + cents(item.amount), 0);
  const poolCents = cents(data.opening) + incomeCents;
  const balanceCents = poolCents - expenseCents;
  const reserveCents = cents(data.reserve);
  return {income:incomeCents/100,expense:expenseCents/100,pool:poolCents/100,balance:balanceCents/100,reserve:reserveCents/100,free:(balanceCents-reserveCents)/100};
}

export function savingsTransfer(data, amount, direction) {
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1000000000000 || Math.abs(amount*100-Math.round(amount*100))>0.001) {
    throw Error('กรอกจำนวนเงินมากกว่า 0 และมีทศนิยมไม่เกิน 2 ตำแหน่ง');
  }
  if (direction !== 'add' && direction !== 'remove') throw Error('ประเภทรายการไม่ถูกต้อง');
  const totals = walletTotals(data);
  const amountCents = Math.round(amount*100);
  if (direction === 'add' && amountCents > Math.round(totals.free*100)) throw Error('เงินใช้จ่ายไม่เพียงพอ');
  if (direction === 'remove' && amountCents > Math.round(totals.reserve*100)) throw Error('ยอดเงินเก็บไม่เพียงพอ');
  const after = (Math.round(totals.reserve*100) + (direction === 'add' ? amountCents : -amountCents))/100;
  if (after > 1000000000000) throw Error('ยอดเงินเก็บเกินขีดจำกัด');
  return {direction, amount:amountCents/100, before:totals.reserve, after};
}

export async function commitSavingsTransfer(database, uid, amount, direction, api) {
  const settingsRef=api.doc(database,'users',uid,'settings','main');
  const transferRef=api.doc(api.collection(database,'users',uid,'savingsTransfers'));
  await api.runTransaction(database,async transaction=>{
    const settings=await transaction.get(settingsRef);
    if(!settings.exists())throw Error('กรุณาบันทึกค่าเริ่มต้นก่อน');
    const entries=await api.getDocs(api.collection(database,'users',uid,'entries'));
    const snapshots=await Promise.all(entries.docs.map(entry=>transaction.get(entry.ref)));
    const current={...settings.data(),items:snapshots.filter(snapshot=>snapshot.exists()).map(snapshot=>snapshot.data())};
    const transfer=savingsTransfer(current,amount,direction);
    const date=new Date().toISOString();
    transaction.update(settingsRef,{reserve:transfer.after,updatedAt:date});
    transaction.set(transferRef,{...transfer,date});
  });
}
