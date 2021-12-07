import mongoose from 'mongoose';

export interface User {
  _id?: string;
  username: string;
  password: string;
  level: 1 | 2 | 3 | 4 | 5;
  code?: string;
}

const userSchema = new mongoose.Schema<User>(
  {
    code: String,
    username: String,
    password: String,
  },
  {
    collection: 'users',
  },
);

const userModel = mongoose.model('user', userSchema);

export default userModel;
