import type { IUser } from '@pages/SignUp/SignUp'

const registered_users = ''
const current_user = 'current_user'


const addUser = (user: IUser) => {
    const users = JSON.parse(localStorage.getItem(registered_users) || '[]') as IUser[]
    users.push(user)
    localStorage.setItem(registered_users, JSON.stringify(users))
    alert('User has been registered successfully. You can now login.')
}

const isUserRegistered = (username: string) => {
    const userStr = localStorage.getItem(registered_users) || null
    if (userStr == null) 
        return false

    const users = JSON.parse(userStr) as IUser[]
    const user = users.find((lambda: IUser) => lambda.username == username)
    return user != null
}

const getUser = (username: string, password: string) => {
    const userStr = localStorage.getItem(registered_users) || null
    if (userStr == null)
        return null

    const users = JSON.parse(userStr) as IUser[]
    const user = users.find(
        (lambda: IUser) => 
            lambda.username == username && lambda.password == password
    )
    return user
}

const loginCurrentUser = (user: IUser) => {
    localStorage.setItem(current_user, JSON.stringify(user))
}

const getCurrentUser = () => {
    const curr_user = localStorage.getItem(current_user) || null
    if (curr_user == null)
        return null

    return JSON.parse(curr_user)
}

const logoutCurrentUser = () => {
    localStorage.removeItem(current_user)
}

export { addUser, isUserRegistered, getUser, loginCurrentUser, getCurrentUser, logoutCurrentUser }
