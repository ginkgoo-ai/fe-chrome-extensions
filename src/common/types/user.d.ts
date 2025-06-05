export enum UserRolesEnum {
  ROLE_USER = "ROLE_USER",
}

export interface IUserInfoType {
  id: string;
  sub: string;
  first_name: string;
  last_name: string;
  name: string;
  roles: UserRolesEnum[];
  email: string;
  email_verified: boolean;
}
