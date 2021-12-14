import { UserDetails } from '../models/user.model';

export interface TokenData extends UserDetails {
  _id: string;
  username: string;
}
