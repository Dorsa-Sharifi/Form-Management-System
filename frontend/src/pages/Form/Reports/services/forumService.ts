import { baseURL } from '@consts/api.ts';
import api from "@utils/api"

export interface Field {
  name: string;
  text: string; 
  type: string;
  data_type : string;
  id: number;
}

export interface PreviewResponse {
  data: Record<string, any>[];
}

export interface ReportResponse {
  data: Record<string, any>[];
}

export interface FormDetails {
  id: string;
  name: string;
  description: string;
}



const USE_MOCK = false;

export function suitableFields(fields: Field[]): Field[] {
    return fields.filter(field => field.data_type != 'longText');
}

export function cleanFields(fields: Field[]): Field[] {
  return fields.map(field => ({
    ...field,
    name: field.text || field.name, 
  }));
}


export const getForumFields = (forumId: string): Promise<Field[]> =>
  USE_MOCK
    ? Promise.resolve(DEMO_FIELDS)
    : api.get(`${baseURL}/form/${forumId}/fields`).then(res => cleanFields(suitableFields(res.data)));


export const convertBooleanFields = (rows: Record<string, any>[]): Record<string, any>[] => {
  return rows.map(row => {
    const newRow: Record<string, any> = {};
    for (const key in row) {
      if (typeof row[key] === 'boolean') {
        newRow[key] = row[key] ? 'true' : 'false';
      }
      else {
        newRow[key] = row[key];
      }
    }
    return newRow;
  }
  );
};

export const getForumPreview = async (
  forumId: string,
  rows = 10,
  cols = 10
): Promise<PreviewResponse> => {
  if (USE_MOCK) {
    return Promise.resolve({ data: DEMO_ROWS.slice(0, rows) });
  } else {
    const fields: Field[] = await getForumFields(forumId);
    const suitable = suitableFields(fields);
    const suitableIds = new Set(suitable.map(f => f.id));
    const suitableMap: Record<number, string> = Object.fromEntries(suitable.map(f => [f.id, f.name]));
    const res = await api.get(`${baseURL}/form/${forumId}/results`, { params: { rows, cols } });
    const rowsData = res.data;
    const filteredData = rowsData.map((row: Record<string, any>) => {
      const filteredRow: Record<string, any> = {};
      for (const key in row) {
        const match = key.match(/^question_(\d+)$/);
        if (match && suitableIds.has(Number(match[1]))) {
          filteredRow[suitableMap[Number(match[1])]] = row[key];
        }
      }
      return convertBooleanFields([filteredRow])[0]; 
    });
    return { data: filteredData };
  }
};


export const getFormDetails = async (forumId: string): Promise<FormDetails> => {
  if (USE_MOCK) {
    return Promise.resolve({
      id: forumId,
      name: 'Mock Form',
      description: 'This is a mock form description for testing purposes.'
    });
  } else {
    const res = await api.get(`${baseURL}/form/${forumId}`);
    return {
      id: res.data.id,
      name: res.data.formName || 'Untitled Form',
      description: res.data.description || ''
    };
  }
}

      

export const getReport = async (
  forumId: string,
  params: {
    groupBy: string[];
    target: string;
    func: 'COUNT' | 'MAX' | 'MIN' | 'AVG' | 'SUM';
    chartType: 'table' | 'bar' | 'pie';
  }
): Promise<ReportResponse> =>{
  if (USE_MOCK){
      return Promise.resolve({ data: function_mock(params) });
  }
  else{
      
      let fields: Field[] = await getForumFields(forumId);
      fields = cleanFields(suitableFields(fields));
      const fieldMap: Record<string, number> = Object.fromEntries(fields.map(f => [f.name, f.id]));
      const { groupBy, target, func, chartType } = params;
      const mappedGroupBy = groupBy.map(name => "question_" + fieldMap[name]);

      const mappedTarget = "question_"+fieldMap[target];

      const apiParams = {
        groupBy: mappedGroupBy,
        target: mappedTarget,
        func,
        chartType
      };
      console.log('API Params:', apiParams);
      return api.post(`${baseURL}/form/${forumId}/query`, {groupBy: mappedGroupBy, target: mappedTarget, func: func.toUpperCase(), chartType}).then(res => ({ data: res.data }))
  }
}


// Mock function to simulate backend aggregation logic when not connected to backend

type AggFunc = 'COUNT' | 'MAX' | 'MIN' | 'AVG' | 'SUM';
type ChartType = 'table' | 'bar' | 'pie';

interface MockParams {
  groupBy: string[];
  target: string;
  func: AggFunc;
  chartType: ChartType;
}


function function_mock(params: MockParams): Record<string, any>[] {
  const { groupBy, target, func } = params;
  const rows = DEMO_ROWS;
  type Stats = { sum: number; count: number; max: number; min: number };
  const map = new Map<string, { stats: Stats; groupValues: string[] }>();

  for (const row of rows) {
    const groupValues = groupBy.map(f => String(row[f]));
    const key = groupValues.join('_');

    const val = Number(row[target]);
    if (!map.has(key)) {
      map.set(key, {
        groupValues,
        stats: { sum: val, count: 1, max: val, min: val },
      });
    } else {
      const entry = map.get(key)!;
      entry.stats.sum += val;
      entry.stats.count += 1;
      entry.stats.max = Math.max(entry.stats.max, val);
      entry.stats.min = Math.min(entry.stats.min, val);
    }
  }
  const groupFieldName = groupBy.join('_');
  const result: Record<string, any>[] = [];
  for (const { stats, groupValues } of map.values()) {
    let aggregate: number;
    switch (func) {
      case 'COUNT':
        aggregate = stats.count;
        break;
      case 'SUM':
        aggregate = stats.sum;
        break;
      case 'AVG':
        aggregate = stats.sum / stats.count;
        break;
      case 'MAX':
        aggregate = stats.max;
        break;
      case 'MIN':
        aggregate = stats.min;
        break;
    }

    result.push({
      [groupFieldName]: groupValues.join('_'),
      [func+'_'+target]: aggregate,
    });
  }

  return result;
}

//DEMO DATA for testing when not connected to backend
const DEMO_FIELDS: Field[] = [
    { name: 'id',     type: 'INTEGER' , data_type: 'number' , id: 1  , text: 'ID' },
    { name: 'name',   type: 'VARCHAR',  data_type: 'shortText' , id: 2  , text: 'ID'},
    { name: 'grade',  type: 'FLOAT'  ,  data_type: 'number' , id: 3  , text: 'ID'},
    { name: 'gender', type: 'VARCHAR' , data_type: 'shortText' , id: 4 , text: 'ID' },
    { name: 'major',  type: 'VARCHAR' ,   data_type: 'shortText' , id: 5 , text: 'ID' },
    { name: 'entry',  type: 'DATE'   ,  data_type: 'shortText' ,  id: 6 , text: 'ID'},
  ];
  
  const DEMO_ROWS: Record<string, any>[] = [
    { id:  1, name: 'Alice',    grade: 18.23, gender: 'female', major: 'Computer Science', entry: '2020-09-01' },
    { id:  2, name: 'Bob',      grade: 15.67, gender: 'male',   major: 'Mathematics',      entry: '2019-09-01' },
    { id:  3, name: 'Charlie',  grade: 17.89, gender: 'male',   major: 'Physics',          entry: '2021-09-01' },
    { id:  4, name: 'Diana',    grade: 19.34, gender: 'female', major: 'Chemistry',        entry: '2022-09-01' },
    { id:  5, name: 'Ethan',    grade: 16.45, gender: 'male',   major: 'Mathematics',      entry: '2020-09-01' },
    { id:  6, name: 'Fiona',    grade: 18.96, gender: 'female', major: 'Computer Science', entry: '2021-09-01' },
    { id:  7, name: 'George',   grade: 14.12, gender: 'male',   major: 'Computer Science', entry: '2019-09-01' },
    { id:  8, name: 'Hannah',   grade: 17.34, gender: 'female', major: 'Economics',        entry: '2022-09-01' },
    { id:  9, name: 'Ian',      grade: 16.78, gender: 'male',   major: 'Economics',        entry: '2020-09-01' },
    { id: 10, name: 'Julia',    grade: 19.01, gender: 'female', major: 'Computer Science', entry: '2021-09-01' },
    { id: 11, name: 'Kevin',    grade: 17.55, gender: 'male',   major: 'Computer Science', entry: '2023-09-01' },
    { id: 12, name: 'Laura',    grade: 15.89, gender: 'female', major: 'Mathematics',      entry: '2022-09-01' },
    { id: 13, name: 'Michael',  grade: 16.34, gender: 'male',   major: 'Physics',          entry: '2020-09-01' },
    { id: 14, name: 'Nina',     grade: 18.12, gender: 'female', major: 'Chemistry',        entry: '2021-09-01' },
    { id: 15, name: 'Oliver',   grade: 14.56, gender: 'male',   major: 'Mathematics',      entry: '2019-09-01' },
    { id: 16, name: 'Paula',    grade: 17.44, gender: 'female', major: 'Chemistry',        entry: '2023-09-01' },
    { id: 17, name: 'Quentin',  grade: 16.98, gender: 'male',   major: 'Chemistry',        entry: '2022-09-01' },
    { id: 18, name: 'Rachel',   grade: 19.76, gender: 'female', major: 'Economics',        entry: '2020-09-01' },
    { id: 19, name: 'Samuel',   grade: 15.23, gender: 'male',   major: 'Economics',        entry: '2021-09-01' },
    { id: 20, name: 'Tina',     grade: 18.65, gender: 'female', major: 'Computer Science', entry: '2019-09-01' },
    { id: 21, name: 'Ursula',   grade: 16.11, gender: 'female', major: 'Computer Science', entry: '2022-09-01' },
    { id: 22, name: 'Victor',   grade: 14.99, gender: 'male',   major: 'Mathematics',      entry: '2020-09-01' },
    { id: 23, name: 'Wendy',    grade: 17.82, gender: 'female', major: 'Physics',          entry: '2021-09-01' },
    { id: 24, name: 'Xavier',   grade: 18.29, gender: 'male',   major: 'Chemistry',        entry: '2023-09-01' },
    { id: 25, name: 'Yasmin',   grade: 15.47, gender: 'female', major: 'Mathematics',      entry: '2019-09-01' },
    { id: 26, name: 'Zachary',  grade: 16.73, gender: 'male',   major: 'Physics',          entry: '2022-09-01' },
    { id: 27, name: 'Abigail',  grade: 17.90, gender: 'female', major: 'Physics',          entry: '2021-09-01' },
    { id: 28, name: 'Brandon',  grade: 14.65, gender: 'male',   major: 'Economics',        entry: '2020-09-01' },
    { id: 29, name: 'Chloe',    grade: 19.02, gender: 'female', major: 'Computer Science', entry: '2023-09-01' },
    { id: 30, name: 'David',    grade: 17.38, gender: 'male',   major: 'Computer Science', entry: '2019-09-01' },
  ];