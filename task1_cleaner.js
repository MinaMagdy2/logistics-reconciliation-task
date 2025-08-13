const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

// المفتاح الداخلي للدمج (يزيل كل الرموز)
function getInternalKey(id) {
    if (!id) return '';
    return id.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

// المعرف النهائي للعرض (يزيل الرموز من الأطراف فقط)
function getDisplayId(id) {
    if (!id) return '';
    return id.trim().toUpperCase().replace(/^[^A-Z0-9]+|[^A-Z0-9]+$/g, '');
}

function createZoneMap(zonesCsvPath) {
    const zonesCsv = fs.readFileSync(zonesCsvPath, 'utf-8');
    const zonesData = parse(zonesCsv, { columns: true, skip_empty_lines: true });
    const zoneMap = new Map();
    zonesData.forEach(row => {
        zoneMap.set(row.raw.toLowerCase(), row.canonical);
    });
    return zoneMap;
}

function normalizeLocation(value, map) {
    if (!value) return '';
    let normalizedValue = value.trim();
    // ترتيب حسب طول الـ raw ensures longer matches first
    const sortedEntries = Array.from(map.entries()).sort((a, b) => b[0].length - a[0].length);
    for (const [raw, canonical] of sortedEntries) {
        const regex = new RegExp(`\\b${raw}\\b`, 'gi'); // word boundary ensures exact word match
        normalizedValue = normalizedValue.replace(regex, canonical);
    }
    return normalizedValue;
}

function parseDeadline(deadline) {
    const dateFormats = ['YYYY-MM-DD HH:mm', 'YYYY/MM/DD HH:mm'];
    const parsed = dayjs(deadline, dateFormats, true);
    return parsed.isValid() ? parsed.toDate() : null;
}

function runTask1_CleanAndMerge() {
    console.log("Running Task 1: Cleaning orders...");
    const dataDir = path.join(__dirname, 'data');
    const orders = JSON.parse(fs.readFileSync(path.join(dataDir, 'orders.json'), 'utf-8'));
    const zoneMap = createZoneMap(path.join(dataDir, 'zones.csv'));
    
    const cleanedOrdersMap = new Map();
    orders.forEach(order => {
        const key = getInternalKey(order.orderId);
        if (!key) return;
        
        if (!cleanedOrdersMap.has(key)) {
            cleanedOrdersMap.set(key, { ...order, orderId: getDisplayId(order.orderId), warnings: [] });
        } else {
            const existingOrder = cleanedOrdersMap.get(key);
            Object.keys(order).forEach(field => {
                if (order[field] && !existingOrder[field]) existingOrder[field] = order[field];
            });
            const newDeadline = parseDeadline(order.deadline);
            const existingDeadline = parseDeadline(existingOrder.deadline);
            if (newDeadline && (!existingDeadline || newDeadline < existingDeadline)) {
                existingOrder.deadline = order.deadline;
            }
        }
    });

    const finalCleanOrders = Array.from(cleanedOrdersMap.values()).map(order => ({
        orderId: order.orderId,
        city: normalizeLocation(order.city, zoneMap),
        zoneHint: normalizeLocation(order.zoneHint, zoneMap),
        address: order.address.trim(),
        paymentType: order.paymentType.trim().toLowerCase() === 'cod' ? 'COD' : 'Prepaid',
        productType: order.productType.trim().toLowerCase(),
        weight: Number(order.weight),
        deadline: dayjs(parseDeadline(order.deadline)).format('YYYY-MM-DD HH:mm'),
        ...(order.warnings.length > 0 && { warnings: order.warnings })
    }));
    
    finalCleanOrders.sort((a,b) => a.orderId.localeCompare(b.orderId));
    fs.writeFileSync(path.join(__dirname, 'clean_orders.json'), JSON.stringify(finalCleanOrders, null, 2), 'utf-8');
    console.log('✅ clean_orders.json generated.');
    return finalCleanOrders;
}

// تصدير الدالة التي سنحتاجها في المهمة الثالثة
module.exports = { runTask1_CleanAndMerge, getDisplayId };
