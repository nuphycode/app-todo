export type Users = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Notes = {
  id: string;
  folder: string;
  title: string;
  content: string;
  due_date: string;
  completed: 'false' | 'true';
};

export type Folders = {
  id: string;
  title: string;
};