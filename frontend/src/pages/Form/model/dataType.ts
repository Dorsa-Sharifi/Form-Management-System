

export interface ChoiceObject {
  index: number;
  title: string;
}

export interface User {
  username: string;
  provider: string;
  role: string;
}

export interface Question {
  type: string;
  dataType: string;
  optional: boolean;
  text: string;
  choices: string[];
}

export interface FormObject {
  id: string;
  type: 'multi' | 'textbox';
  que: string;
  choices: ChoiceObject[];
  dataType?: 'shortText' | 'longText' | 'number' | 'bool';
  required?: boolean;
  created_at: number;
}

export interface PageData {
  data: FormObject[];
}

export interface Page {
  id: number;
  pageIndex: number;
  questions: Question[];
}

export interface FormData {
  pages: PageData[];
}

export interface FormDataFillForm {
  id: number;
  description: string;
  owner: User;
  pages: Page[];
  active: boolean;
  template: boolean;
  expired: boolean;
  title: string;
}
