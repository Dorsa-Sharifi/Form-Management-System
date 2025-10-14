import axios from 'axios';

export interface Field {
  name: string;
  type: string;
}

export interface PreviewResponse {
  data: Record<string, any>[];
}

export interface ReportResponse {
  data: Record<string, any>[];
}

//DEMO_DATA
const DEMO_FIELDS: Field[] = [
    { name: 'id',     type: 'INTEGER' },
    { name: 'name',   type: 'VARCHAR' },
    { name: 'grade',  type: 'FLOAT'   },
    { name: 'gender', type: 'VARCHAR' },
    { name: 'major',  type: 'VARCHAR' },
    { name: 'entry',  type: 'DATE'    },
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
//DEMO_DATA

const USE_MOCK = true;

export const getForumFields = (forumId: string): Promise<Field[]> =>
  USE_MOCK
    ? Promise.resolve(DEMO_FIELDS)
    : axios.get(`/api/forums/${forumId}/fields`).then(res => res.data);

export const getForumPreview = (
  forumId: string,
  rows = 10,
  cols = 10
): Promise<PreviewResponse> =>
  USE_MOCK
    ? Promise.resolve({ data: DEMO_ROWS.slice(0, rows) })
    : axios
        .get(`/api/forums/${forumId}/preview`, { params: { rows, cols } })
        .then(res => res.data);

export const getReport = (
  forumId: string,
  params: {
    groupBy: string[];
    target: string;
    func: 'COUNT' | 'MAX' | 'MIN' | 'AVG' | 'SUM';
    chartType: 'table' | 'bar' | 'pie';
  }
): Promise<ReportResponse> =>
  USE_MOCK
    ? Promise.resolve({ data: function_mock(params) })
    : axios.post(`/api/forums/${forumId}/report`, params).then(res => res.data);



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