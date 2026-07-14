export type FilterOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'exists' | 'not_exists';

export interface FilterRule {
  id: string;
  field: string;
  operator: FilterOperator;
  value: string;
}

export function parseFiltersToMongo(filtersJson: string | null | undefined): any {
  if (!filtersJson) return {};
  
  try {
    const rules: FilterRule[] = JSON.parse(filtersJson);
    if (!Array.isArray(rules) || rules.length === 0) return {};

    const query: any = { $and: [] };

    for (const rule of rules) {
      if (!rule.field || !rule.operator) continue;

      const fieldQuery: any = {};
      
      // Determine if the value is a number, date, or string
      let parsedValue: any = rule.value;
      if (rule.operator !== 'exists' && rule.operator !== 'not_exists') {
        if (!isNaN(Number(rule.value)) && rule.value.trim() !== '') {
          parsedValue = Number(rule.value);
        } else if (typeof rule.value === 'string' && /^[0-9a-fA-F]{24}$/.test(rule.value)) {
          // It's likely an ObjectId, but let's query both string and ObjectId to be safe 
          // because CSV/Webhooks save it as string, Forms might save it as ObjectId.
          // Wait, doing an $in or $or is better if it's an ObjectId string.
          // For simplicity, we can leave parsedValue as string, and in the switch we can build an $in array.
        } else if (!isNaN(Date.parse(rule.value)) && rule.value.includes('-')) {
           // Basic check for dates like YYYY-MM-DD
           parsedValue = new Date(rule.value);
        }
      }

      const isObjectIdString = typeof rule.value === 'string' && /^[0-9a-fA-F]{24}$/.test(rule.value);
      const mongoose = require('mongoose');
      const getObjectIdOrString = (val: string) => isObjectIdString ? [val, new mongoose.Types.ObjectId(val)] : [val];

      switch (rule.operator) {
        case 'equals':
          if (isObjectIdString) {
            fieldQuery[rule.field] = { $in: getObjectIdOrString(rule.value) };
          } else {
            fieldQuery[rule.field] = parsedValue;
          }
          break;
        case 'not_equals':
          if (isObjectIdString) {
            fieldQuery[rule.field] = { $nin: getObjectIdOrString(rule.value) };
          } else {
            fieldQuery[rule.field] = { $ne: parsedValue };
          }
          break;
        case 'contains':
          fieldQuery[rule.field] = { $regex: rule.value, $options: 'i' };
          break;
        case 'not_contains':
          fieldQuery[rule.field] = { $not: { $regex: rule.value, $options: 'i' } };
          break;
        case 'gt':
          fieldQuery[rule.field] = { $gt: parsedValue };
          break;
        case 'gte':
          fieldQuery[rule.field] = { $gte: parsedValue };
          break;
        case 'lt':
          fieldQuery[rule.field] = { $lt: parsedValue };
          break;
        case 'lte':
          fieldQuery[rule.field] = { $lte: parsedValue };
          break;
        case 'exists':
          fieldQuery[rule.field] = { $exists: true, $nin: [null, ""] };
          break;
        case 'not_exists':
          fieldQuery[rule.field] = { $exists: false }; // Or $eq: null
          break;
      }

      if (Object.keys(fieldQuery).length > 0) {
        query.$and.push(fieldQuery);
      }
    }

    if (query.$and.length === 0) return {};
    if (query.$and.length === 1) return query.$and[0];
    
    return query;
  } catch (e) {
    console.error("Error parsing filters:", e);
    return {};
  }
}
