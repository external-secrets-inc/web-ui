export interface CreateUserDataPayload {
    name: string,
    email: string,
    password: string
}

export interface UpdateUserDataPayload {
    name: string,
    password?: string,
}

export interface GetUserResponse {
    id: string,
    name: string,
    email: string,
    is_active: boolean,
}

export interface ListUsersResponse {
    users: GetUserResponse[]
}

export interface GetUserWithRolesResponse {
    id: string,
    name: string,
    email: string,
    is_active: boolean,
    roles: string[]
}

export interface ListUsersWithRolesResponse {
    users: GetUserWithRolesResponse[]
}

export interface UserForm {
  name: string;
  email: string;
  password?: string;
  roles?: string[];
}


export interface UserData {
  id: string,
  name: string,
  email: string,
  is_active: boolean,
}