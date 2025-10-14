const API_BASE_URL = process.env.REACT_APP_API_URL || '';

export interface AIFormRequest {
  prompt: string;
  formType?: string;
  language?: string;
  maxQuestions?: number;
}

export interface AIFormResponse {
  success: boolean;
  message: string;
  form?: any;
  generationId?: string;
}

class AIService {
  private getAuthToken(): string | null {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
  }

  private async makeRequest(endpoint: string, body: AIFormRequest): Promise<AIFormResponse> {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async previewForm(request: AIFormRequest): Promise<AIFormResponse> {
    return this.makeRequest('/api/ai/preview-form', request);
  }

  async generateForm(request: AIFormRequest): Promise<AIFormResponse> {
    return this.makeRequest('/api/ai/generate-form', request);
  }
}

export const aiService = new AIService();
