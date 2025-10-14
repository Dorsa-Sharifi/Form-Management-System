import React from "react";
import styles from './Section.module.css';
import { useNavigate } from "react-router-dom";
import { FormItem } from "@pages/AdminPanel/AdminPanel.tsx";
import {Button, Card, Col, Row} from "antd";
import {BarChartOutlined, EditOutlined} from "@ant-design/icons";

interface SectionProps {
    title: string;
    items: FormItem[];
    indicator?: boolean;
    isOwned: boolean;
}

const Section: React.FC<SectionProps> = ({ title, items, indicator, isOwned }) => {
    const navigate = useNavigate();

    return (
        <div className={styles.section}>
            <div className={styles.sectionheader}>
                <div className={styles.headerleft}>
                    {indicator && <span className={styles.indicatordot} />}
                    <span>{title}</span>
                </div>
                {indicator && (
                    <button
                        className={styles.addbutton}
                        onClick={() => navigate('/panel/createform')}
                    >
                        +
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className={styles.emptyState}>
                    <i className="fas fa-folder-open" />
                    <p>No forms found in this section.</p>
                    {indicator && (
                        <button
                            className={styles.createButton}
                            onClick={() => navigate('/panel/createform')}
                        >
                            Create Form
                        </button>
                    )}
                </div>
            ) : (
                <Row gutter={[16, 16]}>
                    {items.map((item) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                            <Card
                                hoverable
                                style={{ textAlign: "center", margin: "4px" }}
                                onClick={() => navigate(`/panel/fillform/${item.id}`)}
                                bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            >
                                <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 12 }}>
                                    {item.title}
                                </div>
                                <Row gutter={12} justify="center" style={{ width: "100%" }}>
                                    {isOwned && (
                                        <><Col>
                                            <Button
                                                icon={<BarChartOutlined/>}
                                                type="primary"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    navigate(`/reports/${item.id}`);
                                                }}
                                                title="View Statistics"/>
                                        </Col><Col>
                                            <Button
                                                icon={<EditOutlined/>}
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    navigate(`/panel/form/edit/${item.id}`);
                                                }}
                                                title="Edit form"/>
                                        </Col></>
                                    )}

                                </Row>
                            </Card>
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default Section;
