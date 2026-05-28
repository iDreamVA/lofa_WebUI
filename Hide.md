# Hidden Features

## 1. Dark/Light Theme Toggle
- **File:** `src/app/components/Navigation.tsx`
- **รายละเอียด:** ปุ่มสลับ Dark/Light mode (Sun/Moon icon) ถูก comment ไว้ทั้ง desktop และ mobile
- **กู้คืน:** ลบ `{/*` และ `*/}` รอบปุ่ม toggleTheme ใน Navigation.tsx (มี 2 จุด: desktop + mobile)

## 2. AI Insights (RealtimeDashboardPage)
- **File:** `src/app/pages/RealtimeDashboardPage.tsx`
- **รายละเอียด:** ส่วน AI Analysis card ถูก comment ไว้
- **กู้คืน:** ลบ `{/*` และ `*/}` รอบ `<AIAnalysis>` component

## 3. Calories Burned / Duration / Activity Level
- **File:** `src/app/pages/RealtimeDashboardPage.tsx`
- **รายละเอียด:** 3 MetricCard เหล่านี้ถูกลบออกจาก Metrics Grid แต่ state และ logic ยังอยู่ในไฟล์
- **กู้คืน:** เพิ่ม MetricCard กลับเข้าไปใน grid พร้อมเงื่อนไขแสดงผล

## 4. Gyroscope Pitch MetricCard
- **File:** `src/app/pages/RealtimeDashboardPage.tsx`
- **รายละเอียด:** Card แสดงค่า Pitch ของ Gyroscope ถูกลบออก (ยังแสดง ActivityChart + 3D Visualization)
- **กู้คืน:** เพิ่ม MetricCard สำหรับ Gyroscope กลับเข้าไปใน Metrics Grid

## 5. Sensor Groups
- **File:** `src/app/context/AppContext.tsx`
- **รายละเอียด:** armGroup, backGroup, legGroup ถูกลบออกจาก SENSOR_TEMPLATES แล้ว
- **กู้คืน:** เพิ่ม template กลับเข้าไปใน SENSOR_TEMPLATES array

## 6. HeartRate -> Humidity
- **File:** `src/app/context/AppContext.tsx`, `src/app/pages/SensorCanvasPage.tsx`, `src/app/pages/RealtimeDashboardPage.tsx`, `src/app/i18n/translations.ts`
- **รายละเอียด:** เปลี่ยนจาก HeartRate เป็น Humidity (icon Droplets) ทั้งระบบ
- **กู้คืน:** เปลี่ยน type กลับเป็น heartRate, icon เป็น Activity
