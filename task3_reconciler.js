const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const dayjs = require('dayjs');

// استيراد دالة توحيد المعرفات من المهمة الأولى
const { getDisplayId } = require('./task1_cleaner');

function runTask3_Reconcile() {
    console.log("Running Task 3: Reconciling log...");

    const dataDir = path.join(__dirname, 'data');
    const cleanOrders = JSON.parse(fs.readFileSync(path.join(__dirname, 'clean_orders.json'), 'utf-8'));
    const plan = JSON.parse(fs.readFileSync(path.join(__dirname, 'plan.json'), 'utf-8'));
    const couriers = JSON.parse(fs.readFileSync(path.join(dataDir, 'couriers.json'), 'utf-8'));
    const logCsv = fs.readFileSync(path.join(dataDir, 'log.csv'), 'utf-8');
    const logEntries = parse(logCsv, { columns: true, skip_empty_lines: true });

    // --- تجهيز هياكل بيانات ---
    const plannedAssignments = new Map(plan.assignments.map(a => [getDisplayId(a.orderId), a.courierId.toUpperCase()]));
    const orderDetails = new Map(cleanOrders.map(o => [getDisplayId(o.orderId), { deadline: o.deadline, weight: o.weight }]));
    const courierCapacities = new Map(couriers.map(c => [c.courierId.toUpperCase(), c.dailyCapacity]));

    // --- معالجة سجل التسليم ---
    const deliveryLog = new Map();
    const duplicateScans = new Set();

    for (const entry of logEntries) {
        const orderId = getDisplayId(entry.orderId);
        const courierId = entry.courierId.trim().toUpperCase();
        
        if (!deliveryLog.has(orderId)) deliveryLog.set(orderId, []);
        const deliveries = deliveryLog.get(orderId);
        deliveries.push({ courierId, deliveredAt: dayjs(entry.deliveredAt, ["YYYY-MM-DD HH:mm", "YYYY/MM/DD HH:mm"]) });

        if (deliveries.length > 1) duplicateScans.add(orderId);
    }

    // --- حساب الفروقات ---
    const missing = new Set([...plannedAssignments.keys()].filter(id => !deliveryLog.has(id)));
    const unexpected = new Set([...deliveryLog.keys()].filter(id => !orderDetails.has(id)));
    const late = new Set();
    const misassigned = new Set();
    const actualCourierLoads = new Map(couriers.map(c => [c.courierId.toUpperCase(), 0]));

    for (const [orderId, deliveries] of deliveryLog.entries()) {
        const details = orderDetails.get(orderId);
        if (!details) continue;

        const plannedCourier = plannedAssignments.get(orderId);
        const deadline = dayjs(details.deadline);

        for (const delivery of deliveries) {
            if (delivery.deliveredAt.isAfter(deadline)) late.add(orderId);
            if (plannedCourier && delivery.courierId !== plannedCourier) misassigned.add(orderId);

            if (actualCourierLoads.has(delivery.courierId)) {
                actualCourierLoads.set(delivery.courierId, actualCourierLoads.get(delivery.courierId) + details.weight);
            }
        }
    }

    const overloadedCouriers = new Set();
    for (const [courierId, actualLoad] of actualCourierLoads.entries()) {
        const capacity = courierCapacities.get(courierId);
        if (capacity !== undefined && actualLoad > capacity) overloadedCouriers.add(courierId);
    }

    // --- تجميع النتائج النهائية وفرزها ---
    const reconciliation = {
        missing: [...missing].sort(),
        unexpected: [...unexpected].sort(),
        duplicate: [...duplicateScans].sort(),
        late: [...late].sort(),
        misassigned: [...misassigned].sort(),
        overloadedCouriers: [...overloadedCouriers].sort()
    };

    fs.writeFileSync(path.join(__dirname, 'reconciliation.json'), JSON.stringify(reconciliation, null, 2), 'utf-8');
    console.log('✅ reconciliation.json generated.');
    return reconciliation;
}

module.exports = { runTask3_Reconcile };
