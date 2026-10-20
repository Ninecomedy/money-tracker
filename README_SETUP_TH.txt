Money Tracker — Username + Password / Firebase Spark
===================================================
โปรเจกต์: money-tracker-pikac-20261017
ฐานข้อมูล: Firestore Standard (default), asia-southeast1
บัญชี GitHub ที่ตรวจพบ: Ninecomedy
เว็บไซต์: https://ninecomedy.github.io/money-tracker/
Repository: https://github.com/Ninecomedy/money-tracker
เผยแพร่ตามที่ได้รับอนุญาตแล้ววันที่ 17 ตุลาคม 2026

การใช้งาน
- สมัครและเข้าสู่ระบบด้วย Username 3–32 ตัว: a–z, 0–9, _
- กดสมัครบัญชีเพื่อเปิดช่อง Confirm Password ต้องกรอกรหัสให้ตรงกันก่อนสมัคร
- เลือกจดจำ Login: Firebase browserLocalPersistence; ไม่เลือก: browserSessionPersistence
- Firebase เก็บสถานะยืนยันตัวตน ไม่ใช่รหัสผ่าน; เว็บไม่เขียน password ลง Firestore/localStorage
- ไม่แยกตัวพิมพ์ใหญ่–เล็ก และตัดช่องว่างหัวท้าย
- แปลงเป็น username@money-tracker.invalid ภายใน Firebase Authentication
- โดเมน .invalid ไม่ใช่อีเมลรับจดหมาย ห้ามใช้ส่ง reset email
- Firebase บังคับ email ไม่ซ้ำ จึงไม่มี public username lookup
- ผู้ใช้เพิ่ม แก้ไข ลบรายการ ตั้งเงินตั้งต้น/สำรอง และส่งออก CSV/JSON ได้
- เงินเริ่มต้น 250 บาท เงินสำรอง 50 บาท
- เมื่อบันทึก settings/main สำเร็จ จะแสดง "เงินเก็บของฉัน" โดยอัตโนมัติ บัญชีเดิมที่มีเอกสารนี้แสดงทันที
- เพิ่ม/ลดเงินเก็บเป็นการย้ายระหว่างเงินใช้จ่ายกับ reserve ไม่เพิ่มรายรับหรือรายจ่าย
- ปุ่มแก้ไขค่าเริ่มต้นเปิดฟอร์มเดิม และยกเลิกกลับได้
- ประวัติ 20 รายการล่าสุดอยู่ใน users/{uid}/savingsTransfers แยกจากรายการใช้จ่าย
- ยอดเงินทั้งหมด = เงินใช้จ่าย + เงินเก็บ หากบัญชีเดิมใช้จ่ายเกินยอด เงินใช้จ่ายอาจติดลบโดยไม่ลดเงินเก็บอัตโนมัติ
- การสำรอง JSON เดิมเก็บยอดและรายการรายรับ–รายจ่าย ไม่รวมประวัติย้ายเงินเก็บ
- เปิดหน้าเว็บใหม่ทุกอุปกรณ์หลังอัปเดตรุ่นเงินเก็บ เพื่อให้รายการใช้จ่ายร่วมตรวจการย้ายเงินพร้อมกัน
- Cloud Firestore onSnapshot อัปเดตข้ามอุปกรณ์เมื่อออนไลน์

ข้อจำกัดรหัสผ่าน
- บัญชี Username ไม่สามารถใช้ Forgot Password ทางอีเมลได้
- หน้าเว็บแจ้งข้อจำกัดก่อนสมัคร ไม่มีปุ่มหรือระบบ Forgot Password
- หากลืมรหัสและออกจากระบบแล้ว ต้องให้ผู้ดูแลพิสูจน์ตัวตนผ่านช่องทางที่เชื่อถือได้
- ห้ามกู้บัญชีจากการบอก Username เพียงอย่างเดียว
- โครงการนี้ยังไม่มีระบบกู้บัญชีโดยผู้ดูแลในหน้าเว็บ
- ควรใช้ password manager; ไม่มีการเก็บรหัสผ่านใน Firestore หรือไฟล์
- ชื่อผู้ใช้ไม่ใช่ความลับ และ Firebase อาจแสดงว่าชื่อนั้นถูกใช้แล้ว
- ไม่ใช้ displayName เป็นหลักฐานสิทธิ์ สิทธิ์ทั้งหมดตรวจจาก UID

ข้อมูลเดิม
- ใช้ path เดิม users/{uid}/entries/{entryId} และ users/{uid}/settings/main
- ไม่มีคำสั่งย้าย ล้าง หรือสร้างบัญชีทดแทนบัญชีผู้ใช้เดิม
- โปรเจกต์ใหม่นี้สร้างจากไฟล์ที่ยังไม่มี Web Config จึงไม่มีบัญชีเดิมที่เชื่อมอยู่
- บัญชีอีเมลในโปรเจกต์อื่นจะไม่ย้ายเข้ามาเอง ต้องออกแบบการย้ายบัญชีแยกต่างหาก
- ถ้านำโค้ดไปใช้กับโปรเจกต์ที่มีบัญชี Email อยู่แล้ว อย่าปิดช่องทาง Login เดิมก่อนจัดทำการย้ายที่คง UID
- ต้นฉบับใน Downloads ไม่ได้ถูกแก้ไข

ความปลอดภัย
- firestore.rules อนุญาตเฉพาะ request.auth.uid ตรงกับ UID ใน path
- ตรวจชนิดข้อมูล ฟิลด์ที่อนุญาต และช่วงตัวเลข; ไม่รับฟิลด์ password
- ทุก path ที่ไม่ได้ระบุปฏิเสธโดยปริยาย รวมถึง usernames
- firebase-config.js เป็น Firebase Web Config เปิดเผยได้ ไม่ใช่ Admin credential
- ไม่มี Service Account / Private Key ใน repository
- ไม่ใช้ persistent Firestore disk cache; Logout ล้างข้อมูลและแบบฟอร์มในหน้าเว็บ
- ข้อมูลไม่ได้เข้ารหัสแบบ end-to-end ผู้ดูแลโปรเจกต์มีสิทธิ์จัดการข้อมูล

นำเข้า JSON
- ยืนยันก่อนแทนที่ข้อมูล ใช้ atomic batch: สำเร็จทั้งหมดหรือไม่เปลี่ยนข้อมูล
- จำกัดไฟล์ 2 MB และจำนวนรายการเดิม + ใหม่ ไม่เกิน 449 รายการ
- ไฟล์ใหญ่กว่านี้จะถูกปฏิเสธโดยไม่ลบข้อมูลเดิม
- งดแก้ไขจากอุปกรณ์อื่นระหว่าง import/clear
- clear จำนวนมากแบ่งชุด 400 รายการ อาจสำเร็จบางส่วนหากการเชื่อมต่อขัดข้อง

พัฒนาและทดสอบ
- npm install
- npm test
- ทดสอบส่วนเงินเก็บใน Firebase Emulator: เปิด auth:9099 และ firestore:8080 ด้วย firebase.emulator.json และ project demo-money-tracker แล้วรัน npm run test:savings-emulator
- ทดสอบ UI แบบไม่แตะข้อมูลจริง: http://127.0.0.1:4173/?emulator=1 (ทำงานเฉพาะ localhost)
- npm start แล้วเปิด http://127.0.0.1:4173
- npm run test:cloud ทดสอบด้วยบัญชีชั่วคราวในโปรเจกต์ที่ระบุใน firebase-config.js
  ทดสอบ signup, duplicate username, wrong password, login, logout,
  settings, CRUD, realtime sync, cross-account/anonymous denial และลบบัญชีทดสอบ
- ทดสอบ cloud มีการใช้งานโควตาเล็กน้อย ไม่เรียก Admin SDK
- deploy Rules/Auth: npx -y firebase-tools@latest deploy --only auth,firestore
- ห้ามอัปเกรด Spark หรือเปิด billing โดยไม่ได้รับอนุญาต

GitHub Pages
- ต้องเผยแพร่ index.html, identity.js และ firebase-config.js ร่วมกันที่รากเว็บไซต์
- อย่าอัปโหลด node_modules, logs, .env, ข้อมูลสำรองการเงินจริง หรือ private keys
- ตั้ง Pages เป็น Deploy from a branch และ root ของ branch ที่อัปโหลด
- ตั้งโดเมน ninecomedy.github.io ใน Auth authorized domains แล้ว
- ตรวจ URL จริงและทดสอบผ่านเบราว์เซอร์หลังเผยแพร่

อ้างอิง
https://firebase.google.com/docs/auth/web/password-auth
https://firebase.google.com/docs/auth/web/manage-users
สรุปรายสัปดาห์/รายเดือนและ Drill-down (เพิ่ม 20 ตุลาคม 2569)
- คำนวณจาก snapshot รายการเดิมในหน่วยความจำ ไม่มี migration หรือการเขียนข้อมูลเพิ่ม
- เวลาไทย UTC+7 / Asia/Bangkok; สัปดาห์จันทร์–อาทิตย์; ใช้ date เดิม ไม่ใช่วันที่แก้ไข
- ประวัติทุกเดือนพับ/ขยายได้; สรุป 8 สัปดาห์ และเดือนปัจจุบันพร้อม 6 เดือนก่อน รวมช่วงเก่าที่มีรายการ
- กดการ์ดดูรายละเอียด กรองประเภท/หมวดหมู่ แก้ไขและลบผ่านระบบเดิม; ยอดหัวหน้ารายละเอียดเป็นยอดทั้งช่วงเสมอ
- เงินเก็บไม่ถูกนับ; วันที่เก่าที่อ่านไม่ได้ยังอยู่ในประวัติ "ไม่ทราบวันที่"
- ทดสอบ: npm test และ npm run test:reports-emulator (ต้องเปิด demo-money-tracker emulator ก่อน)
- Preview สำหรับข้อมูลทดสอบเท่านั้น: http://127.0.0.1:4173/?emulator=1
- สคริปต์ emulator แสดงบัญชีทดสอบสำหรับ Login; ห้ามใช้รหัสบัญชีจริงใน preview นี้
