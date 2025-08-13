const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

function planAssignments(cleanOrders, couriers) {
    console.log("Running Task 2: Planning assignments...");
    const assignments = [];
    const unassigned = [];
    const capacityUsage = {};
    couriers.forEach(c => capacityUsage[c.courierId] = 0);

    const sortedOrders = [...cleanOrders].sort((a, b) => dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf());

    for (const order of sortedOrders) {
        const eligibleCouriers = couriers.filter(c => {
            // <-- تحسين التحقق من تغطية المناطق باستخدام canonical lowercase
            const coversZone = c.zonesCovered.some(zone => {
                const lowerZone = zone.toLowerCase();
                return order.city.toLowerCase().includes(lowerZone) || order.zoneHint.toLowerCase().includes(lowerZone);
            });

            const acceptsPayment = order.paymentType === 'COD' ? c.acceptsCOD : true;
            const notExcluded = !c.exclusions.includes(order.productType);
            const hasCapacity = capacityUsage[c.courierId] + order.weight <= c.dailyCapacity;
            
            return coversZone && acceptsPayment && notExcluded && hasCapacity;
        });

        if (eligibleCouriers.length === 0) {
            unassigned.push({ orderId: order.orderId, reason: "no_supported_courier_or_capacity" });
            continue;
        }

        eligibleCouriers.sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority;
            if (capacityUsage[a.courierId] !== capacityUsage[b.courierId]) return capacityUsage[a.courierId] - capacityUsage[b.courierId];
            return a.courierId.localeCompare(b.courierId);
        });

        const bestCourier = eligibleCouriers[0];
        assignments.push({ orderId: order.orderId, courierId: bestCourier.courierId });
        capacityUsage[bestCourier.courierId] += order.weight;
    }

    const finalCapacityUsage = Object.entries(capacityUsage)
        .map(([courierId, totalWeight]) => ({ courierId, totalWeight }))
        .sort((a, b) => a.courierId.localeCompare(b.courierId));
    
    assignments.sort((a, b) => a.orderId.localeCompare(b.orderId));
    unassigned.sort((a, b) => a.orderId.localeCompare(b.orderId));

    const plan = { assignments, unassigned, capacityUsage: finalCapacityUsage };
    fs.writeFileSync(path.join(__dirname, 'plan.json'), JSON.stringify(plan, null, 2), 'utf-8');
    console.log('✅ plan.json generated.');
    return plan;
}

module.exports = { planAssignments };
