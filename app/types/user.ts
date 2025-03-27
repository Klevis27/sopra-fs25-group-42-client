import {Dayjs} from 'dayjs';

export interface User {
  id: string | null;
  username: string | null;
  password: string | null;
  creationDate: Date | null;
  birthday: Date | string | Dayjs | null; // Additional Types necessary for handling
  status: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}
