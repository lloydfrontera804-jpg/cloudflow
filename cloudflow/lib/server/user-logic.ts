export interface UserDoc {
  _id: string;
  email: string;
  passwordHash: string;
  name: string | null;
  createdAt: number;
}
