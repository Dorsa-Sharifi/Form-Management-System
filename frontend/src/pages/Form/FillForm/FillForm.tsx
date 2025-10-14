import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Radio, Checkbox, Button, Spin, Alert, message } from 'antd';
import { fetchFormDataForFillForm, submitFormData } from '../services/formApi';
import type { Form as FormType } from '@services/apiService';
import './FillForm.css';

const FillForm: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<FormType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, any>>({});

  // const
  const [form] = Form.useForm();

  useEffect(() => {
    if (!formId) return;

    fetchFormDataForFillForm(formId)
        .then(f => {
          // Map fields to fit Form interface
          const a: FormType = {  /* TODO fix? */
            ...f,
            isActive: f.active,
            isTemplate: f.template,
            isExpired: f.expired,
          };
          setData(a);

          // Set default answers for boolean questions to false
          const defaultAnswers: Record<number, any> = {};
          a.pages.forEach(page => {
            page.questions.forEach((question: any) => {
              if (question.dataType === 'BOOLEAN' || question.dataType === 'bool') {
                defaultAnswers[question.id] = false;
              }
            });
          });
          setAnswers(defaultAnswers);
        })
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
  }, [formId]);

  if (loading) return <div className="fill--form__loading"><Spin /></div>;
  if (error || !data) return <Alert message={error || 'Form not found'} type="error" />;

  // Get all field names across all pages
  const allFieldNames = data.pages.flatMap((page, _) =>
    page.questions.map((q, _) => {
      return `question_${q.id}`;
    })
  );

  const isLast = currentPage === data.pages.length - 1;

  const validateCurrentPage = async () => {
    // Get field names for current page
    let questionNumber = 1;
    for (let i = 0; i < currentPage; i++) {
      questionNumber += data.pages[i].questions.length;
    }
    const currentPageFields = data.pages[currentPage].questions.map((_, idx) => 
      `question_${questionNumber + idx}`
    );

    try {
      await form.validateFields(currentPageFields);
      return true;
    } catch (err) {
      return false;
    }
  };

  const goNext = async () => {
    if (await validateCurrentPage()) {
      setCurrentPage(p => Math.min(p + 1, data.pages.length - 1));
    }
  };

  const goPrev = () => setCurrentPage(p => Math.max(p - 1, 0));

  const handleSubmit = async () => {
    if (!formId) return;
    
    try {
      setSubmitting(true);
      // Validate all fields across all pages
      await form.validateFields(allFieldNames);

      // Format the data for submission
      const formattedData: Record<string, any> = {};

      Object.entries(answers).forEach(([questionId, answer]) => {
        formattedData[`question_${questionId}`] = answer;
      });

      await submitFormData(formId, formattedData);

      message.success('Form submitted successfully!');
      form.resetFields();
      // Navigate back to forms list or home
      navigate('/panel');
    } catch (err: any) {
      message.error('Failed to submit form. Please check all required fields.');
      if (Array.isArray(err.errorFields) && err.errorFields.length) {
        const fld = err.errorFields[0].name[0] as string;
        const m = fld.match(/^question_(\d+)$/);
        if (m) {
          // Find the page containing this question
          let questionCount = 0;
          const targetPage = data.pages.findIndex(page => {
            questionCount += page.questions.length;
            return questionCount >= Number(m[1]);
          });
          if (targetPage !== -1) {
            setCurrentPage(targetPage);
          }
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fill--form">
      <div className="fill--form__container">
        {/* Sidebar preview */}
        <div className="fill--form__preview">
          <div className="fill--form__preview-header">
            <h2 className="fill--form__preview-title">{data.title}</h2>
            <span className="fill--form__preview-id">ID: {formId}</span>
            {data.description && <p className="fill--form__preview-description">{data.description}</p>}
          </div>
          {data.pages.map((page, idx) => (
            <div
              key={page.id}
              className={`fill--form__preview-item ${idx === currentPage ? 'active' : ''}`}
              onClick={() => setCurrentPage(idx)}
            >
              <span className="fill--form__preview-title">Page {page.pageIndex + 1}</span>
              <ul className="fill--form__preview-list">
                {page.questions.map((question, i) => {
                  // Calculate question number for this question
                  let questionNumber = 1;
                  for (let j = 0; j < idx; j++) {
                    questionNumber += data.pages[j].questions.length;
                  }
                  questionNumber += i;
                  
                  // Get the answer for this question
                  const fieldName = `question_${questionNumber}`;
                  const answer = form.getFieldValue(fieldName);
                  
                  return (
                    <li key={i} className={`fill--form__preview-que ${answer ? 'answered' : ''}`}>
                      {question.text}
                      {!question.optional && <span className="required">*</span>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
        {/* Main form area */}
        <div className="fill--form__main">
          <div className="fill--form__pager">
            {data.pages.map((page) => {
              // Check if all required fields in this page are filled
              let isPageValid = true;
              let questionNumber = 1;
              for (let i = 0; i < page.pageIndex; i++) {
                questionNumber += data.pages[i].questions.length;
              }
              const pageFields = page.questions.map((_, idx) => `question_${questionNumber + idx}`);
              const pageValues = form.getFieldsValue(pageFields);
              page.questions.forEach((question, idx) => {
                if (!question.optional && !pageValues[`question_${questionNumber + idx}`]) {
                  isPageValid = false;
                }
              });

              return (
                <Button
                  key={page.id}
                  type={page.pageIndex === currentPage ? 'primary' : 'default'}
                  onClick={() => setCurrentPage(page.pageIndex)}
                  className={isPageValid ? 'page-valid' : ''}
                >{page.pageIndex + 1}</Button>
              );
            })}
          </div>
          <Form form={form} layout="vertical" className="fill--form__form">
            {
              data.pages[currentPage]?.
              questions.sort((a, b) => a.created_at - b.created_at).
              map((question, idx) => {
              return (
                <Form.Item
                  key={idx}
                  name={`question_${question.id}`}
                  label={<span className="fill--form__label">
                    {question.text}
                    {!question.optional && <span className="required">*</span>}
                  </span>}
                  rules={[{ required: !question.optional, message: 'This field is required' }]}
                >
                  {question.type === 'radio' ? (
                      <Radio.Group
                          className="fill--form__radio-group"
                          onChange={e =>
                              setAnswers(prev => ({
                                ...prev,
                                [question.id]: e.target.value
                              }))
                          }
                          value={answers[question.id] || undefined}
                      >
                        {question.choices.map((choice, index) => (
                            <Radio key={index} value={choice} className="fill--form__radio">
                              {choice}
                            </Radio>
                        ))}
                      </Radio.Group>
                  ) : question.dataType === 'SHORT_TEXT' ? (
                    <Input
                        className="fill--form__input"
                        value={answers[question.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                    />
                  ) : question.dataType === 'LONG_TEXT' ? (
                    <Input.TextArea
                        rows={5} className="fill--form__textarea"
                        value={answers[question.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                    />
                  ) : question.dataType === 'NUMBER' ? (
                    <Input
                        type="number" className="fill--form__input"
                        value={answers[question.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                    />
                  ) : question.dataType === 'BOOLEAN' ? (
                    <Checkbox
                        className="fill--form__checkbox"
                        value={answers[question.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [question.id]: e.target.checked }))}
                    />
                  ) : (
                    <Input
                        className="fill--form__input"
                        value={answers[question.id] || ''}
                        onChange={e => setAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                    />
                  )}
                </Form.Item>
              );
            })}
            <Form.Item className="fill--form__actions">
              {currentPage > 0 && <Button className="fill--form__btn" onClick={goPrev}>Previous</Button>}
              {!isLast && <Button type="primary" className="fill--form__btn" onClick={goNext}>Next</Button>}
              {isLast && (
                <Button 
                  type="primary" 
                  className="fill--form__btn fill--form__btn--submit" 
                  onClick={handleSubmit}
                  loading={submitting}
                >
                  Submit
                </Button>
              )}
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default FillForm;