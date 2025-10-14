import { Form, Question, Page, FormData, FormObject } from './apiService';

/**
 * Validates that frontend data format matches backend expectations
 */
export function validateFrontendToBackendMapping(frontendData: FormData, title: string, description: string): boolean {
  try {
    // Validate form structure
    if (!title || typeof title !== 'string') {
      console.error('Invalid title:', title);
      return false;
    }

    if (!description || typeof description !== 'string') {
      console.error('Invalid description:', description);
      return false;
    }

    // Validate pages structure
    if (!Array.isArray(frontendData.pages)) {
      console.error('Pages must be an array');
      return false;
    }

    for (let pageIndex = 0; pageIndex < frontendData.pages.length; pageIndex++) {
      const page = frontendData.pages[pageIndex];
      
      if (!Array.isArray(page.data)) {
        console.error(`Page ${pageIndex}: data must be an array`);
        return false;
      }

      // Validate questions in each page
      for (let questionIndex = 0; questionIndex < page.data.length; questionIndex++) {
        const question = page.data[questionIndex];
        
        if (!validateQuestionFormat(question, pageIndex, questionIndex)) {
          return false;
        }
      }
    }

    console.log('✅ Frontend to backend data format validation passed');
    return true;
  } catch (error) {
    console.error('❌ Frontend to backend data format validation failed:', error);
    return false;
  }
}

/**
 * Validates that backend data format matches frontend expectations
 */
export function validateBackendToFrontendMapping(backendForm: Form): boolean {
  try {
    // Validate form structure
    if (!backendForm.title || typeof backendForm.title !== 'string') {
      console.error('Invalid backend form title:', backendForm.title);
      return false;
    }

    if (!backendForm.description || typeof backendForm.description !== 'string') {
      console.error('Invalid backend form description:', backendForm.description);
      return false;
    }

    // Validate pages structure
    if (!Array.isArray(backendForm.pages)) {
      console.error('Backend pages must be an array');
      return false;
    }

    for (let pageIndex = 0; pageIndex < backendForm.pages.length; pageIndex++) {
      const page = backendForm.pages[pageIndex];
      
      if (!Array.isArray(page.questions)) {
        console.error(`Backend page ${pageIndex}: questions must be an array`);
        return false;
      }

      // Validate questions in each page
      for (let questionIndex = 0; questionIndex < page.questions.length; questionIndex++) {
        const question = page.questions[questionIndex];
        
        if (!validateBackendQuestionFormat(question, pageIndex, questionIndex)) {
          return false;
        }
      }
    }

    console.log('✅ Backend to frontend data format validation passed');
    return true;
  } catch (error) {
    console.error('❌ Backend to frontend data format validation failed:', error);
    return false;
  }
}

/**
 * Validates individual question format for frontend to backend mapping
 */
function validateQuestionFormat(question: FormObject, pageIndex: number, questionIndex: number): boolean {
  // Validate required fields
  if (!question.id || typeof question.id !== 'string') {
    console.error(`Page ${pageIndex}, Question ${questionIndex}: Invalid id:`, question.id);
    return false;
  }

  if (!question.que || typeof question.que !== 'string') {
    console.error(`Page ${pageIndex}, Question ${questionIndex}: Invalid que:`, question.que);
    return false;
  }

  if (!question.type || !['multi', 'textbox'].includes(question.type)) {
    console.error(`Page ${pageIndex}, Question ${questionIndex}: Invalid type:`, question.type);
    return false;
  }

  // Validate choices array
  if (!Array.isArray(question.choices)) {
    console.error(`Page ${pageIndex}, Question ${questionIndex}: choices must be an array`);
    return false;
  }

  // Validate each choice object
  for (let choiceIndex = 0; choiceIndex < question.choices.length; choiceIndex++) {
    const choice = question.choices[choiceIndex];
    
    if (typeof choice !== 'object' || choice === null) {
      console.error(`Page ${pageIndex}, Question ${questionIndex}, Choice ${choiceIndex}: Invalid choice object`);
      return false;
    }

    if (typeof choice.index !== 'number') {
      console.error(`Page ${pageIndex}, Question ${questionIndex}, Choice ${choiceIndex}: Invalid index:`, choice.index);
      return false;
    }

    if (!choice.title || typeof choice.title !== 'string') {
      console.error(`Page ${pageIndex}, Question ${questionIndex}, Choice ${choiceIndex}: Invalid title:`, choice.title);
      return false;
    }
  }

  // Validate dataType (optional)
  if (question.dataType && !['shortText', 'longText', 'number', 'bool'].includes(question.dataType)) {
    console.error(`Page ${pageIndex}, Question ${questionIndex}: Invalid dataType:`, question.dataType);
    return false;
  }

  // Validate required (optional)
  if (question.required !== undefined && typeof question.required !== 'boolean') {
    console.error(`Page ${pageIndex}, Question ${questionIndex}: Invalid required:`, question.required);
    return false;
  }

  return true;
}

/**
 * Validates individual question format for backend to frontend mapping
 */
function validateBackendQuestionFormat(question: Question, pageIndex: number, questionIndex: number): boolean {
  // Validate required fields
  if (!question.text || typeof question.text !== 'string') {
    console.error(`Backend Page ${pageIndex}, Question ${questionIndex}: Invalid text:`, question.text);
    return false;
  }

  if (!question.type || typeof question.type !== 'string') {
    console.error(`Backend Page ${pageIndex}, Question ${questionIndex}: Invalid type:`, question.type);
    return false;
  }

  // Validate choices array (can be null for text questions)
  if (question.choices !== null && !Array.isArray(question.choices)) {
    console.error(`Backend Page ${pageIndex}, Question ${questionIndex}: choices must be an array or null`);
    return false;
  }

  // Validate each choice string
  if (Array.isArray(question.choices)) {
    for (let choiceIndex = 0; choiceIndex < question.choices.length; choiceIndex++) {
      const choice = question.choices[choiceIndex];
      
      if (typeof choice !== 'string') {
        console.error(`Backend Page ${pageIndex}, Question ${questionIndex}, Choice ${choiceIndex}: Invalid choice string:`, choice);
        return false;
      }
    }
  }

  // Validate dataType (optional)
  if (question.dataType && typeof question.dataType !== 'string') {
    console.error(`Backend Page ${pageIndex}, Question ${questionIndex}: Invalid dataType:`, question.dataType);
    return false;
  }

  // Validate optional (boolean)
  if (typeof question.optional !== 'boolean') {
    console.error(`Backend Page ${pageIndex}, Question ${questionIndex}: Invalid optional:`, question.optional);
    return false;
  }

  return true;
}

/**
 * Logs the expected data format for debugging
 */
export function logExpectedDataFormat(): void {
  console.log('📋 Expected Data Format:');
  console.log('');
  console.log('Frontend FormData:');
  console.log('{');
  console.log('  pages: [');
  console.log('    {');
  console.log('      data: [');
  console.log('        {');
  console.log('          id: string,');
  console.log('          type: "multi" | "textbox",');
  console.log('          que: string,');
  console.log('          choices: [{ index: number, title: string }],');
  console.log('          dataType?: "shortText" | "longText" | "number" | "bool",');
  console.log('          required?: boolean');
  console.log('        }');
  console.log('      ]');
  console.log('    }');
  console.log('  ]');
  console.log('}');
  console.log('');
  console.log('Backend Form:');
  console.log('{');
  console.log('  id: number,');
  console.log('  title: string,');
  console.log('  description: string,');
  console.log('  pages: [');
  console.log('    {');
  console.log('      id: number,');
  console.log('      pageIndex: number,');
  console.log('      questions: [');
  console.log('        {');
  console.log('          id: number,');
  console.log('          text: string,');
  console.log('          type: string,');
  console.log('          dataType: string,');
  console.log('          optional: boolean,');
  console.log('          choices: string[]');
  console.log('        }');
  console.log('      ]');
  console.log('    }');
  console.log('  ]');
  console.log('}');
} 