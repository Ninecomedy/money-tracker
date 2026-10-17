import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, onSnapshot, terminate } from 'firebase/firestore';
import { firebaseConfig } from '../firebase-config.js';
import { usernameEmail } from '../identity.js';

const apps = ['first', 'second', 'device', 'guest'].map(name => initializeApp(firebaseConfig, name));
const auths = apps.map(getAuth);
const databases = apps.map(app => getFirestore(app));
const suffix = randomBytes(5).toString('hex');
const names = [`test_${suffix}_a`, `test_${suffix}_b`];
const password = randomBytes(24).toString('base64url');
const users = [];
const ownedRefs = [];
const denied = action => assert.rejects(action, error => error.code === 'permission-denied');
try {
  for (const index of [0, 1]) {
    const result = await createUserWithEmailAndPassword(auths[index], usernameEmail(names[index]), password);
    users.push(result.user);
  }
  console.log('PASS: real Firebase accepts internal .invalid email; two accounts created');
  await assert.rejects(createUserWithEmailAndPassword(auths[3], usernameEmail(names[0].toUpperCase()), password), error => error.code === 'auth/email-already-in-use');
  console.log('PASS: duplicate username rejected regardless of case');
  await signOut(auths[0]);
  assert.equal(auths[0].currentUser, null);
  await assert.rejects(signInWithEmailAndPassword(auths[0], usernameEmail(names[0]), password + 'wrong'));
  await signInWithEmailAndPassword(auths[0], usernameEmail(names[0].toUpperCase()), password);
  assert.equal(auths[0].currentUser.uid, users[0].uid);
  await signInWithEmailAndPassword(auths[2], usernameEmail(names[0]), password);
  console.log('PASS: logout, wrong password, uppercase login, stable UID');
  const uid = users[0].uid;
  const settings = doc(databases[0], 'users', uid, 'settings', 'main');
  const entry = doc(databases[0], 'users', uid, 'entries', 'test-entry');
  ownedRefs.push(settings, entry);
  await setDoc(settings, {opening:250,reserve:50,updatedAt:new Date().toISOString()});
  await setDoc(entry, {type:'expense',amount:10,note:'Disposable test',category:'อื่น ๆ',date:new Date().toISOString()});
  assert.equal((await getDoc(settings)).data().opening,250);
  assert.equal((await getDoc(entry)).data().amount,10);
  const synced = new Promise((resolve,reject) => {
    const timer = setTimeout(()=>{unsubscribe();reject(Error('Realtime sync timed out'));},20000);
    const unsubscribe = onSnapshot(doc(databases[2],'users',uid,'entries','test-entry'), snapshot => {
      if(snapshot.data()?.amount===20){clearTimeout(timer);unsubscribe();resolve();}
    }, error=>{clearTimeout(timer);reject(error);});
  });
  await updateDoc(entry,{amount:20,note:'Updated test'});
  await synced;
  console.log('PASS: settings, add, edit, realtime sync between independent clients');
  for(const index of [1,3]) {
    const foreign=doc(databases[index],'users',uid,'entries','test-entry');
    await denied(()=>getDoc(foreign));
    await denied(()=>setDoc(foreign,{type:'income',amount:99,note:'attack',category:'อื่น ๆ',date:new Date().toISOString()}));
    await denied(()=>deleteDoc(foreign));
    await denied(()=>getDocs(collection(databases[index],'users',uid,'entries')));
    await denied(()=>getDoc(doc(databases[index],'users',uid,'settings','main')));
    await denied(()=>setDoc(doc(databases[index],'users',uid,'settings','main'),{opening:999,reserve:0,updatedAt:new Date().toISOString()}));
  }
  await denied(()=>getDocs(collection(databases[3],'usernames')));
  await denied(()=>updateDoc(entry,{amount:-1}));
  await denied(()=>updateDoc(entry,{password:'must-not-be-stored'}));
  assert.equal((await getDocs(collection(databases[1],'users',users[1].uid,'entries'))).size,0);
  console.log('PASS: other-account and unauthenticated reads/writes/deletes denied; invalid fields rejected');
  await deleteDoc(entry);
  assert.equal((await getDoc(entry)).exists(),false);
  console.log('PASS: owner deletion');
} finally {
  for (const reference of ownedRefs) await deleteDoc(reference).catch(()=>{});
  for (const index of [0,1]) if(auths[index].currentUser)await deleteUser(auths[index].currentUser);
  await Promise.all(databases.map(terminate));
  await Promise.all(apps.map(deleteApp));
  console.log('Test account cleanup completed');
}
