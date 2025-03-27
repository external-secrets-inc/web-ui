export interface CreateUserDataPayload {
    name: string,
    email: string,
    password: string
}

export interface UpdateUserDataPayload {
    name: string,
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
