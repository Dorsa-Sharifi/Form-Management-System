import api from "@utils/api";
import { baseURL } from "@consts/api";
import {FormDataFillForm} from "@pages/Form/model/dataType.ts";

// ============================================================================
// TYPE DEFINITIONS - Matching Backend Models
// ============================================================================

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface Choice {
  index: number;
  title: string;
}

export interface Question {
  id: number;
  text: string; // Backend uses 'text' field
  type: string; // 'text', 'radio', 'checkbox', 'textarea', 'email', 'tel'
  dataType: string; // 'SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'BOOLEAN'
  optional: boolean; // Backend uses 'optional', frontend expects 'required'
  choices: string[]; // Backend uses string array
  options: string[]; // Alternative field for choices
  created_at: number;
}

export interface Page {
  id: number;
  pageIndex: number;
  questions: Question[];
}

export interface Form {
  id: number;
  title: string; // Backend uses 'title' field
  description: string;
  owner: User;
  pages: Page[];
  isTemplate: boolean;
  isActive: boolean;
  isExpired: boolean;
}

// Frontend-specific interfaces for compatibility
export interface FormObject {
  id: string;
  type: 'multi' | 'textbox';
  que: string;
  choices: Choice[];
  dataType?: 'shortText' | 'longText' | 'number' | 'bool';
  required?: boolean;
  created_at: number;
}

export interface PageData {
  data: FormObject[];
}

export interface FormData {
  pages: PageData[];
}

// AI Form Generation
export interface AIFormRequest {
  prompt: string;
  formType?: string;
  language?: string;
  maxQuestions?: number;
}

export interface AIFormResponse {
  success: boolean;
  message: string;
  form?: Form;
  generationId?: string;
}

// Reports and Analytics
export interface Field {
  name: string;
  text: string;
  type: string;
  data_type: string;
  id: number;
}

export interface ReportRequest {
  groupBy: string[];
  target: string;
  func: 'COUNT' | 'MAX' | 'MIN' | 'AVG' | 'SUM';
  chartType: 'table' | 'bar' | 'pie';
}

export interface ReportResponse {
  data: Record<string, any>[];
}

export interface PreviewResponse {
  data: Record<string, any>[];
}

export interface FormDetails {
  id: string;
  name: string;
  description: string;
}

// Authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// DATA MAPPING FUNCTIONS
// ============================================================================

/**
 * Maps backend Form structure to frontend FormData structure
 */
export function mapBackendToFrontend(backendForm: Form): FormData {
  return {
    pages: backendForm.pages.map((page: Page) => ({
      data: page.questions.map((question: Question, index: number) => ({
        id: `${page.pageIndex}-${index}`,
        type: mapQuestionType(question.type),
        que: question.text, // Backend now uses 'text' field
        choices: (question.choices || []).map((choice: string, choiceIndex: number) => ({
          index: choiceIndex,
          title: choice
        })),
        dataType: mapDataType(question.dataType),
        required: !question.optional,
        created_at: question.created_at
      }))
    }))
  };
}

/**
 * Maps frontend FormData structure to backend Form structure
 */
export function mapFrontendToBackend(frontendData: FormData, title: string, description: string): any {
  return {
    title, // Backend now expects 'title' field
    description,
    pages: frontendData.pages.map((pageData, pageIndex) => ({
      pageIndex,
      questions: pageData.data.map((formObject) => ({
        text: formObject.que, // Backend now expects 'text' field
        type: mapFrontendQuestionType(formObject.type),
        dataType: mapFrontendDataType(formObject.dataType),
        optional: !formObject.required,
        choices: (formObject.choices || []).map(choice => choice.title), // Extract title strings from choice objects
        created_at: formObject.created_at,
      }))
    }))
  };
}

function mapQuestionType(backendType: string): 'multi' | 'textbox' {
  switch (backendType) {
    case 'radio':
    case 'checkbox':
      return 'multi';
    case 'text':
    case 'textarea':
    case 'email':
    case 'tel':
    default:
      return 'textbox';
  }
}

function mapFrontendQuestionType(frontendType: 'multi' | 'textbox'): string {
  switch (frontendType) {
    case 'multi':
      return 'radio';
    case 'textbox':
    default:
      return 'text';
  }
}

function mapDataType(backendDataType: string): 'shortText' | 'longText' | 'number' | 'bool' {
  switch (backendDataType) {
    case 'SHORT_TEXT':
    case 'EMAIL':
      return 'shortText';
    case 'LONG_TEXT':
      return 'longText';
    case 'NUMBER':
      return 'number';
    case 'BOOLEAN':
      return 'bool';
    default:
      return 'shortText';
  }
}

function mapFrontendDataType(frontendDataType?: 'shortText' | 'longText' | 'number' | 'bool'): string {
  switch (frontendDataType) {
    case 'shortText':
      return 'SHORT_TEXT';
    case 'longText':
      return 'LONG_TEXT';
    case 'number':
      return 'NUMBER';
    case 'bool':
      return 'BOOLEAN';
    default:
      return 'SHORT_TEXT';
  }
}

// ============================================================================
// FORM MANAGEMENT API
// ============================================================================

/**
 * Create a new form
 */
export async function createForm(formData: Partial<Form>): Promise<Form> {
  // Validate data format before sending
  if (formData.pages) {
    for (const page of formData.pages) {
      if (page.questions) {
        for (const question of page.questions) {
          // Ensure choices are strings, not objects
          if (question.choices && Array.isArray(question.choices)) {
            question.choices = question.choices.map(choice => 
              typeof choice === 'string' ? choice : (choice as any).title || String(choice)
            );
          }
        }
      }
    }
  }
  
  const response = await api.post(`${baseURL}/form`, formData);
  return response.data;
}

/**
 * Update an existing form
 */
export async function updateForm(formId: string, formData: Partial<Form>): Promise<Form> {
  // Validate data format before sending
  if (formData.pages) {
    for (const page of formData.pages) {
      if (page.questions) {
        for (const question of page.questions) {
          // Ensure choices are strings, not objects
          if (question.choices && Array.isArray(question.choices)) {
            question.choices = question.choices.map(choice => 
              typeof choice === 'string' ? choice : (choice as any).title || String(choice)
            );
          }
        }
      }
    }
  }
  
  const response = await api.put(`${baseURL}/form/${formId}`, formData);
  return response.data;
}

/**
 * Get all forms for the current user
 */
export async function getAllForms(): Promise<Form[]> {
  const response = await api.get(`${baseURL}/forms`);
  return response.data;
}

/**
 * Get all shared forms for the current user
 */
export async function getAllSharedForms(): Promise<Form[]> {
  const response = await api.get(`${baseURL}/forms/sharedWithMe`);
  return response.data;
}

/**
 * Get template forms for the current user
 */
export async function getTemplateForms(): Promise<Form[]> {
  const response = await api.get(`${baseURL}/forms/templates`);
  return response.data;
}

/**
 * Get active forms for the current user
 */
export async function getActiveForms(): Promise<Form[]> {
  const response = await api.get(`${baseURL}/forms/active`);
  return response.data;
}

/**
 * Get form by ID
 */
export async function getFormById(formId: string): Promise<Form> {
  const response = await api.get(`${baseURL}/form/${formId}`);
  return response.data;
}

/**
 * Get form data by ID
 */
export async function getFormData(formId: string): Promise<FormData> {
  const backendForm = await getFormById(formId);
  return mapBackendToFrontend(backendForm);
}

export async function getFormDataForFillForm(formId: string): Promise<FormDataFillForm> {
  try {
    const response = await api.get(`/form/${formId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching form data:', error);
    throw error;
  }
}

/**
 * Set form as template
 */
export async function setFormAsTemplate(formId: string): Promise<Form> {
  const response = await api.put(`${baseURL}/form/${formId}/template`);
  return response.data;
}

/**
 * Update form status (active/expired)
 */
export async function updateFormStatus(
  formId: string, 
  active: boolean, 
  expired: boolean
): Promise<Form> {
  const response = await api.put(`${baseURL}/form/${formId}/status`, null, {
    params: { active, expired }
  });
  return response.data;
}

// ============================================================================
// FORM SUBMISSION API
// ============================================================================

/**
 * Submit form data
 */
export async function submitFormData(formId: string, data: Record<string, any>): Promise<string> {
  try {
    const response = await api.post(`/form/${formId}/submit`, data);
    return response.data;
  } catch (error) {
    console.error('Error submitting form data:', error);
    throw error;
  }
}

// ============================================================================
// REPORTS AND ANALYTICS API
// ============================================================================

/**
 * Get form fields for reports
 */
export async function getFormFields(formId: string): Promise<Field[]> {
  const response = await api.get(`${baseURL}/form/${formId}/fields`);
  return response.data;
}

/**
 * Get form results for preview
 */
export async function getFormResults(formId: string): Promise<Record<string, any>[]> {
  const response = await api.get(`${baseURL}/form/${formId}/results`);
  return response.data;
}

/**
 * Run aggregated query for reports
 */
export async function runAggregatedQuery(
  formId: string, 
  request: ReportRequest
): Promise<Record<string, any>[]> {
  const response = await api.post(`${baseURL}/form/${formId}/query`, request);
  return response.data;
}

// ============================================================================
// AI FORM GENERATION API
// ============================================================================

/**
 * Generate form preview using AI
 */
export async function previewAIForm(request: AIFormRequest): Promise<AIFormResponse> {
  const response = await api.post(`${baseURL}/ai/preview-form`, request);
  return response.data;
}

/**
 * Generate and save form using AI
 */
export async function generateAIForm(request: AIFormRequest): Promise<Form> {
  const response = await api.post(`${baseURL}/ai/generate-form`, request);
  return response.data;
}

// ============================================================================
// AUTHENTICATION API
// ============================================================================

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await api.post(`${baseURL}/auth/login`, credentials);
  return response.data;
}

/**
 * Register new user
 */
export async function signup(userData: SignupRequest): Promise<SignupResponse> {
  const response = await api.post(`${baseURL}/auth/signup`, userData);
  return response.data;
}

/**
 * Login with Google
 */
export async function googleLogin(token: string): Promise<LoginResponse> {
  const response = await api.post(`${baseURL}/auth/google`, { token });
  return response.data;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clean and filter suitable fields for reports
 */
export function suitableFields(fields: Field[]): Field[] {
  return fields.filter(field => field.data_type !== 'longText');
}

/**
 * Clean field names for display
 */
export function cleanFields(fields: Field[]): Field[] {
  return fields.map(field => ({
    ...field,
    name: field.text || field.name,
  }));
}

/**
 * Convert boolean fields to string representation
 */
export function convertBooleanFields(rows: Record<string, any>[]): Record<string, any>[] {
  return rows.map(row => {
    const newRow: Record<string, any> = {};
    for (const key in row) {
      if (typeof row[key] === 'boolean') {
        newRow[key] = row[key] ? 'true' : 'false';
      } else {
        newRow[key] = row[key];
      }
    }
    return newRow;
  });
}

/**
 * Get form preview data for reports
 */
export async function getFormPreview(
  formId: string,
  rows = 10,
  cols = 10
): Promise<PreviewResponse> {
  const fields: Field[] = await getFormFields(formId);
  const suitable = suitableFields(fields);
  const suitableIds = new Set(suitable.map(f => f.id));
  const suitableMap: Record<number, string> = Object.fromEntries(
    suitable.map(f => [f.id, f.name])
  );
  
  const results = await getFormResults(formId);
  const filteredData = results.map((row: Record<string, any>) => {
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

/**
 * Get form details
 */
export async function getFormDetails(formId: string): Promise<FormDetails> {
  const form = await getFormById(formId);
  return {
    id: form.id.toString(),
    name: form.title || 'Untitled Form', // Backend uses 'title' field
    description: form.description || ''
  };
}

/**
 * Get report data
 */
export async function getReport(
  formId: string,
  params: ReportRequest
): Promise<ReportResponse> {
  const fields: Field[] = await getFormFields(formId);
  const cleanFields = suitableFields(fields);
  const fieldMap: Record<string, number> = Object.fromEntries(
    cleanFields.map(f => [f.name, f.id])
  );
  
  const { groupBy, target, func, chartType } = params;
  const mappedGroupBy = groupBy.map(name => "question_" + fieldMap[name]);
  const mappedTarget = "question_" + fieldMap[target];
  
  const apiParams = {
    groupBy: mappedGroupBy,
    target: mappedTarget,
    func: func.toUpperCase(),
    chartType
  };
  
  const response = await api.post(`${baseURL}/form/${formId}/query`, apiParams);
  return { data: response.data };
} 

/**
 * Get all users (id, username)
 */
export async function getAllUsers(): Promise<{id: number, username: string}[]> {
  const response = await api.get(`${baseURL}/getallusersid`);
  return response.data;
}

/**
 * Get all users with access to a form
 */
export async function getFormUsers(formId: string | number): Promise<{id: number, username: string}[]> {
  const response = await api.get(`${baseURL}/form/${formId}/getallusersid`);
  return response.data;
}

/**
 * Add multiple users to a form
 */
export async function addUsersToForm(formId: string | number, userIds: number[]): Promise<string> {
  const response = await api.post(`${baseURL}/form/${formId}/addusers`, userIds);
  return response.data;
}

/**
 * Add a single user to a form
 */
export async function addUserToForm(formId: string | number, userId: number): Promise<string> {
  const response = await api.post(
    `${baseURL}/form/${formId}/adduser`,
    userId,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}

/**
 * Remove a user from a form
 */
export async function removeUserFromForm(formId: string | number, userId: number): Promise<string> {
  const response = await api.post(
    `${baseURL}/form/${formId}/removeuser`,
    userId,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return response.data;
}