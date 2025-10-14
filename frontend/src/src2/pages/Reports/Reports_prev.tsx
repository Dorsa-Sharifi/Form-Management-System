import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Select, Checkbox, Button, Divider, Typography, Space } from 'antd';
import styles from './Reports.module.css';

const { Title, Text } = Typography;
const { Option } = Select;

const aggregatorOptions = ['SUM', 'AVG', 'MIN', 'MAX', 'COUNT'];
const sampleFields = ['country', 'product', 'sales', 'date', 'quantity']; // example fields

const Reports: React.FC = () => {
    const { form_id } = useParams();
    const [groupBy, setGroupBy] = useState<string[]>([]);
    const [targetField, setTargetField] = useState<string | undefined>();
    const [aggregator, setAggregator] = useState<string | undefined>();

    const handleRunQuery = () => {
        console.log({
            groupBy,
            targetField,
            aggregator,
        });
        // Send to backend here
    };

    return (
        <div className={styles.container}>
            <Title level={2}>Reports</Title>
            {form_id && <Text type="secondary">Form ID: {form_id}</Text>}

            <Divider />

            <Title level={4}>Query Builder</Title>

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                    <Text strong>Group By:</Text>
                    <Checkbox.Group
                        options={sampleFields}
                        value={groupBy}
                        onChange={vals => setGroupBy(vals as string[])}
                        style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem' }}
                    />
                </div>

                <div>
                    <Text strong>Target Field:</Text>
                    <Select
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        placeholder="Select a field"
                        value={targetField}
                        onChange={setTargetField}
                        allowClear
                    >
                        {sampleFields.map(field => (
                            <Option key={field} value={field}>
                                {field}
                            </Option>
                        ))}
                    </Select>
                </div>

                <div>
                    <Text strong>Aggregator:</Text>
                    <Select
                        style={{ width: '100%', marginTop: '0.5rem' }}
                        placeholder="Select an aggregator"
                        value={aggregator}
                        onChange={setAggregator}
                        allowClear
                    >
                        {aggregatorOptions.map(func => (
                            <Option key={func} value={func}>
                                {func}
                            </Option>
                        ))}
                    </Select>
                </div>

                <Button type="primary" onClick={handleRunQuery}>
                    Run Query
                </Button>
            </Space>
        </div>
    );
};

export default Reports;
