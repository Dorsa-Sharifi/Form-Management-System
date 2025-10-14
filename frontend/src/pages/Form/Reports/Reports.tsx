import React, { useEffect, useState } from 'react';                
import { useParams } from 'react-router-dom';                      
import {
  Form, Select, Button, Space, Typography, Table, message
} from 'antd';                                                     
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons'; 
import {
  getForumFields,       // → fetch list of fields that exist in the forum
  getForumPreview,      // → fetch first N preview rows so we can show sample data
  getReport,            // → server endpoint that actually runs the aggregation
  Field ,
  FormDetails,                // → TypeScript interface for a “field” object
  getFormDetails
} from './services/forumService';
import ChartRenderer from './ChartRenderer';        


const { Title, Text } = Typography;                                // Typography.Title
const { Option } = Select;                                         // Select.Option

/* aggregate functions the UI allows */
const FUNC_OPTIONS = ['COUNT', 'MAX', 'MIN', 'AVG', 'SUM'] as const;

/* Chart types */
const CHART_OPTIONS = [
  { label: 'Table',     value: 'table' },
  { label: 'Bar Chart', value: 'bar'   },
  { label: 'Pie Chart', value: 'pie'   },
] as const;

type ChartType = typeof CHART_OPTIONS[number]['value'];            // "table" | "bar" | "pie"

/* ────────────────────────────  Helpers  ──────────────────────────── */
/**
 * Accept whatever junk the API returns and *try* to dig an array out of it.
 * Works with:
 *    raw = [ ... ]                          // plain array
 *    raw = { data: [ ... ] }                // axios default
 *    raw = { rows: [ ... ] }                // custom
 *    raw = { data: { rows: [ ... ] } }      // nested axios
 */
function extractArray<T = any>(raw: unknown): T[] {                         
  if (Array.isArray(raw)) return raw;                      
  if (raw && typeof raw === 'object') {
    // @ts-ignore lines silence “data doesn’t exist” complaints
    if (Array.isArray(raw.data))        return raw.data;    // axios: { data: [...] }
    // @ts-ignore
    if (Array.isArray(raw.rows))        return raw.rows;    // custom: { rows: [...] }
    // @ts-ignore
    if (Array.isArray(raw?.data?.rows)) return raw.data.rows; // nested: { data: { rows } }
  }
  return [];                                                // fallback → empty
}

const ReportsPage: React.FC = () => {
  const { forumId = '' } = useParams();

  const [fields,     setFields]     = useState<Field[]>([]); // list of columns for dropdowns
  const [previewData,setPreviewData]= useState<any[]>([]);   // sample data shown on first load
  const [reportData, setReportData] = useState<any[]>([]);   // real data after “Generate”
  const [chartType,  setChartType]  = useState<ChartType>('table'); // current viz mode
  const [loading,    setLoading]    = useState(false);       // disables button & shows spinner
  const [formDetails, setFormDetails] = useState<FormDetails | null>(null); // form metadata

  const [form] = Form.useForm();                             // AntD form instance for reset/get

  
  useEffect(() => {
    if (!forumId) return;                                    

    const loadForumInfo = async () => {
      try {

        const [fldsRes, previewRes , frmDetails] = await Promise.all([
          getForumFields(forumId),                          
          getForumPreview(forumId),        
          getFormDetails(forumId),            
        ]);
        console.log('Fields:', fldsRes, 'Preview:', previewRes);

        setFields(extractArray<Field>(fldsRes));
        setPreviewData(extractArray(previewRes));
        setFormDetails(frmDetails);
      } catch (error) {
        console.error(error);
        message.error('Could not load forum info');          
      }
    };

    loadForumInfo();
  }, [forumId]);                                             

  const onFinish = async (vals: any) => {                    
    if (!forumId) return;

    setLoading(true);
    try {
      const { chartModel, ...rest } = vals;                  
      const res = await getReport(forumId, {                 // POST /forums/:id/report
        ...rest,                                             // func, target, groupBy[]
        chartType: chartModel                                // tell server desired viz
      });

      setReportData(extractArray(res));                      // shove data into state
      setChartType(chartModel);                              
    } catch (error) {
      console.error(error);
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  //build AntD cols
  const safeColumns = (rows: any[]): any[] => {
    if (!Array.isArray(rows) || rows.length === 0) return [];
    return Object.keys(rows[0]).map(key => ({                
      title: key,
      dataIndex: key,
      key
    }));
  };

  // Choose preview vs report data for the big viewer
  const dataset  = reportData.length ? reportData : previewData;
  const columns  = safeColumns(dataset.length ? dataset : previewData);
  const fieldOptions = Array.isArray(fields) ? fields : [];

  return (
    <div style={{ display: 'flex', padding: 24 , minHeight: '100vh' }}>
      {/*Reports contorols */}
      <div style={{ width: 320, marginRight: 24 }}>
        <Title level={2}>Reports</Title>
        <Text type="secondary" style={{ display: 'block' }}>form id: {formDetails?.id}</Text>
        <Text type="secondary" style={{ display: 'block' }}>form name: {formDetails?.name}</Text>
        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
          {formDetails?.description || 'No description available'}
        </Text>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ func: 'COUNT', chartModel: 'table', groupBy: [] }}
          style={{ marginTop: 24 }}
        >
          {/*Group By*/}
          <Form.List name="groupBy">
            {(fieldsList, { add, remove }) => (
              <Form.Item label="Group By">
                {fieldsList.map(field => (
                  <Space key={field.key} align="baseline">
                    <Form.Item
                      {...field} rules={[{ required: true }]} style={{ margin: 0 }}
                    >
                      <Select placeholder="Select field" style={{ width: 180 }}>
                        {fieldOptions.map(f => (
                          <Option key={f.name} value={f.name}>{f.name}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                    {/* remove current row */}
                    <MinusCircleOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                {/* add new row */}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Add
                </Button>
              </Form.Item>
            )}
          </Form.List>

          {/*Target field*/}
          <Form.Item name="target" label="Target" rules={[{ required: true }]}>
            <Select placeholder="Select field">
              {fieldOptions.map(f => (
                <Option key={f.name} value={f.name}>{f.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {/*Aggregate function*/}
          <Form.Item name="func" label="Function" rules={[{ required: true }]}>
            <Select placeholder="Select function">
              {FUNC_OPTIONS.map(fn => (
                <Option key={fn} value={fn}>{fn}</Option>
              ))}
            </Select>
          </Form.Item>

          {/*chart type*/}
          <Form.Item name="chartModel" label="Chart Model" rules={[{ required: true }]}>
            <Select placeholder="Select chart type">
              {CHART_OPTIONS.map(opt => (
                <Option key={opt.value} value={opt.value}>{opt.label}</Option>
              ))}
            </Select>
          </Form.Item>

          {/*generate*/}
            <Form.Item shouldUpdate>
            {() => {
              const func = form.getFieldValue('func');
              const target = form.getFieldValue('target');
              const selectedField = fields.find(f => f.name == target);
                const isNumber = selectedField?.data_type?.toLowerCase() === 'number';
              const isCompatible =
              func == 'COUNT' ||
              (func != 'COUNT' && isNumber);

              return (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                disabled={!isCompatible}
              >
                Generate
              </Button>
              );
            }}
            </Form.Item>
        </Form>
      </div>

      {/*Result and table */}
      
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        background: '#e6f7ff',          // light Ant blue
        padding: 24,
        borderRadius: 4
      }}>
        {/* If we have no data, show empty table with headers */}
        {dataset.length === 0 && (
          <Table
            dataSource={[]}
            columns={columns}
            locale={{ emptyText: 'No preview data' }}
            pagination={false}
            scroll={{ x: 'max-content', y: 600 }}
          />
        )}

        {/* Show either a table or a chart depending on chartType */}
        {dataset.length > 0 && (
          chartType === 'table' ? (
            <Table
              dataSource={dataset}
              columns={columns}
              rowKey={(_, idx = 0) => idx.toString()}
              pagination={false}
              scroll={{ x: 'max-content', y: 600 }}
            />
          ) : (
            <ChartRenderer
              data={dataset}
              chartType={chartType}
              groupBy={form.getFieldValue('groupBy')}
              target={form.getFieldValue('target')}
            />
          )
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
