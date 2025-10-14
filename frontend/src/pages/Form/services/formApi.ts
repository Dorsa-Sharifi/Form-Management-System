import {FormData, FormDataFillForm} from '../model/dataType';
import {
  getFormData as getFormDataFromService,
  getFormDataForFillForm as getFormDataFillFormFromService,
  submitFormData as submitFormDataFromService,
  getAllUsers,
  getFormUsers,
  addUsersToForm,
  addUserToForm,
  removeUserFromForm
} from '@services/apiService.ts';

/**
 * Fetch form definition by ID
 * @param formId - ID of the form
 */
export async function fetchFormData(formId: string): Promise<FormData> {
  try {
    return await getFormDataFromService(formId);
  } catch (error) {
    console.error("Failed to load form data:", error);
    throw error;
  }
}

export async function fetchFormDataForFillForm(formId: string): Promise<FormDataFillForm> {
  try {
    return await getFormDataFillFormFromService(formId);
  } catch (error) {
    console.error("Failed to load form data:", error);
    throw error;
  }
}

/**
 * Submit filled form data
 * @param formId - ID of the form
 * @param data - form values
 */
export async function submitFormData(formId: string, data: Record<string, any>): Promise<void> {
  try {
    await submitFormDataFromService(formId, data);
    console.log('Form data submitted successfully:', data);
  } catch (error) {
    console.error("Failed to submit form data:", error);
    throw error;
  }
}

export { getAllUsers, getFormUsers, addUsersToForm, addUserToForm, removeUserFromForm };

// Sample form data for development/testing
export const sampleFormData: FormData = {
  pages: [
    {
      data: [
        {
          id : '1',
          type: 'textbox',
          que: 'What is your name?',
          choices: [],
          dataType: 'shortText',
          required: true,
        },
        {
          id : '2',
          type: 'multi',
          que: 'Select your favorite fruits',
          choices: [
            { index: 0, title: 'Apple' },
            { index: 1, title: 'Banana' },
            { index: 2, title: 'Cherry' },
          ],
          required: true,
        },
      ],
    },
    {
      data: [
        { 
          id : '3',
          type: 'textbox',
          que: 'Tell us about yourself',
          choices: [],
          dataType: 'longText',
          required: false,
        },
        {
          id : '4',
          type: 'textbox',
          que: 'Enter your age',
          choices: [],
          dataType: 'number',
          required: true,
        },
        {
          id : '5',
          type: 'textbox',
          que: 'Do you agree to the terms?',
          choices: [],
          dataType: 'bool',
          required: false,
        },
      ],
    },
  ],
};