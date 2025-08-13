const fs = require('fs');
const path = require('path');

// استيراد الدوال الرئيسية من ملفات المهام
const { runTask1_CleanAndMerge } = require('./task1_cleaner');
const { planAssignments } = require('./task2_planner');
const { runTask3_Reconcile } = require('./task3_reconciler');

/**
 * الدالة الرئيسية لتنظيم سير العمل الكامل
 */
function main() {
    console.log("--- Starting Logistics Processing ---");

    // 1. شغل المهمة الأولى لإنشاء clean_orders.json
    const cleanOrders = runTask1_CleanAndMerge();

    // 2. تحميل البيانات الإضافية اللازمة للمهمة الثانية
    const dataDir = path.join(__dirname, 'data');
    const couriers = JSON.parse(fs.readFileSync(path.join(dataDir, 'couriers.json'), 'utf-8'));
    
    // 3. شغل المهمة الثانية لإنشاء plan.json
    planAssignments(cleanOrders, couriers);

    // 4. شغل المهمة الثالثة لإنشاء reconciliation.json
    runTask3_Reconcile();
    
    console.log("\n--- All tasks completed successfully! ---");
}

// بدء التنفيذ
main();