import React, { useState } from "react";
import { Typography, Card, Input, Button, Space, Divider, Spin, Layout, message } from "antd";
import { SendOutlined, RobotOutlined, EyeOutlined, SaveOutlined } from "@ant-design/icons";
import styles from "./AiAssistant.module.css";
import { generateAIForm, AIFormRequest, Form } from "@services/apiService.ts";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Content } = Layout;

interface AIFormResponse {
  success: boolean;
  message: string;
  form?: Form;
  generationId?: string;
}

const AiAssistant: React.FC = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [createdFormID, setCreatedFormID] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<Form | null>(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    setIsLoading(true);
    setResponse("");
    setGeneratedForm(null);

    try {
      const requestBody: AIFormRequest = {
        prompt: query,
        formType: "general",
        language: "en",
        maxQuestions: 15
      };

      const formData = await generateAIForm(requestBody);

      if (formData) {
        console.log(formData);
        setGeneratedForm(formData);
        setCreatedFormID(formData.id.toString());
        setResponse(JSON.stringify(formData, null, 2));
        message.success('Form generated and saved successfully!');
      } else {
        setResponse('Failed to generate form');
        message.error('Failed to generate form');
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setResponse("Sorry, there was an error processing your request.");
      message.error('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleGenerate();
    }
  };

  const renderFormPreview = () => {
    if (!generatedForm) return null;

    return (
      <div className={styles.formPreview}>
        <Title level={4}>📋 {generatedForm.title}</Title>
        <Paragraph type="secondary">{generatedForm.description}</Paragraph>
        
        {generatedForm.pages && generatedForm.pages.map((page: any, pageIndex: number) => (
          <Card key={pageIndex} className={styles.pageCard} size="small">
            <Title level={5}>Page {pageIndex + 1}</Title>
            {page.questions && page.questions.map((question: any, qIndex: number) => (
              <div key={qIndex} className={styles.questionItem}>
                <Paragraph strong>
                  {question.text}
                  {!question.optional && <span style={{ color: 'red' }}> *</span>}
                </Paragraph>
                <Paragraph type="secondary" className={styles.questionType}>
                  Type: {question.type}
                  {question.choices && question.choices.length > 0 && (
                    <span> | Options: {question.choices.join(', ')}</span>
                  )}
                </Paragraph>
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <div className={styles.container}>
          <div className={styles.titleContainer}>
            <RobotOutlined className={styles.aiIcon} />
            <Title level={2} style={{ margin: 0 }}>AI Form Generator</Title>
          </div>
          <Paragraph type="secondary" className={styles.subtitle}>
            Describe your form and I'll generate it for you
          </Paragraph>

          <Card bordered={false} className={styles.card}>
            <div className={styles.querySection}>
              <TextArea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Describe the form you want to create (e.g., 'Create a customer feedback form for a restaurant with questions about food quality, service, and overall experience')"
                autoSize={{ minRows: 3, maxRows: 6 }}
                allowClear
                className={styles.queryInput}
              />
              <div className={styles.buttonContainer}>
                <Space>
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleGenerate}
                  >
                    Generate & Save
                  </Button>
                </Space>
                <Paragraph type="secondary" className={styles.keyboardHint}>
                  Press Ctrl+Enter to preview
                </Paragraph>
              </div>
            </div>

            {(isLoading || response) && (
                <>
                  <Divider />
                  <div className={styles.responseSection}>
                    <Title level={4}>
                      Generated Form
                    </Title>
                    {isLoading ? (
                        <div className={styles.loadingContainer}>
                          <Spin size="large" />
                          <Paragraph>Generating your form...</Paragraph>
                        </div>
                    ) : (
                        <>
                          {generatedForm && renderFormPreview()}

                          <Card className={styles.responseCard}>
                            <Title level={5}>Raw JSON Response</Title>
                            <pre className={styles.jsonResponse}>{response}</pre>
                          </Card>

                          <div className={styles.buttonContainer}>
                            <Button
                                type="primary"
                                size="large"
                                onClick={() => {
                                  navigate(`/panel/fillform/${createdFormID}`)
                                }}
                            >
                              Go to form
                            </Button>
                          </div>
                        </>
                    )}
                  </div>
                </>
            )}

          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default AiAssistant;
