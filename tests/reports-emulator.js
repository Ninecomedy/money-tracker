import assert from 'node:assert/strict';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,connectAuthEmulator,createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut} from 'firebase/auth';
import {getFirestore,connectFirestoreEmulator,collection,doc,setDoc,getDocs,getDoc,updateDoc,deleteDoc,terminate} from 'firebase/firestore';
import {groups,selectEntries,periodBounds,summarize} from '../reports.js';
import {usernameEmail} from '../identity.js';
const app=initializeApp({projectId:'demo-money-tracker',apiKey:'demo-key'});
const auth=getAuth(app),db=getFirestore(app);connectAuthEmulator(auth,'http://127.0.0.1:9099',{disableWarnings:true});connectFirestoreEmulator(db,'127.0.0.1',8080);
const username='reports_'+Date.now(),password='Emulator-preview-only';
try{
  const credential=await createUserWithEmailAndPassword(auth,usernameEmail(username),password),uid=credential.user.uid;
  const entries=collection(db,'users',uid,'entries'),settings=doc(db,'users',uid,'settings','main');
  await setDoc(settings,{opening:250,reserve:50,updatedAt:new Date().toISOString()});
  const fixtures=[['2025-12-31T17:00:00Z','income',100,'รายได้','รายได้ข้ามปี'],['2026-01-04T16:59:59Z','expense',40,'อาหาร','อาหารวันอาทิตย์'],['2026-01-04T17:00:00Z','expense',10,'เดินทาง','เดินทางวันจันทร์'],['2026-09-30T16:59:59Z','expense',30,'อาหาร','อาหารกันยายน'],['2026-09-30T17:00:00Z','income',500,'รายได้','รายได้ตุลาคม'],['2026-10-19T03:00:00Z','expense',70,'อาหาร','มื้อเช้า'],['2026-10-20T05:00:00Z','expense',100,'เกม/บันเทิง','เกม'],['2026-10-18T03:00:00Z','income',200,'รายได้','งานเสริม']];
  for(const [index,[date,type,amount,category,note]] of fixtures.entries())await setDoc(doc(entries,String(index)),{date,type,amount,category,note});
  const read=async()=>(await getDocs(entries)).docs.map(snapshot=>({id:snapshot.id,...snapshot.data()}));
  const before=await read(),savedSettings=(await getDoc(settings)).data();
  for(const kind of ['week','month'])for(const group of groups(before,kind,{includeEmpty:true})){if(group.key==='unknown')continue;assert.deepEqual(summarize(selectEntries(before,periodBounds(group.key,kind))),summarize(group.entries));}
  assert.deepEqual(await read(),before);assert.deepEqual((await getDoc(settings)).data(),savedSettings);
  assert.equal(before.length,8);assert.equal(summarize(before).income,800);assert.equal(summarize(before).expense,250);
  await updateDoc(doc(entries,'5'),{amount:80});assert.equal(summarize(await read()).expense,260);assert.equal((await getDoc(doc(entries,'5'))).data().date,fixtures[5][0]);
  const disposable=doc(entries,'disposable');await setDoc(disposable,{date:'2026-10-20T10:00:00Z',type:'expense',amount:5,category:'อื่น ๆ',note:'Disposable emulator test'});assert.equal(summarize(await read()).expense,265);await deleteDoc(disposable);assert.equal(summarize(await read()).expense,260);
  await signOut(auth);await signInWithEmailAndPassword(auth,usernameEmail(username.toUpperCase()),password);assert.equal(auth.currentUser.uid,uid);assert.deepEqual((await getDoc(settings)).data(),savedSettings);
  console.log('PASS: 8 original emulator entries unchanged by reports; totals 800/250; edit/delete recompute; original date, settings and UID preserved');
  console.log('Local preview username: '+username+' / password: '+password);
}finally{await terminate(db);await deleteApp(app);}
