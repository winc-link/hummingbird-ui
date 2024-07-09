
const USER_KEY = '$user$'

export const setUser = (user: any) => localStorage.setItem(USER_KEY, JSON.stringify(user))
export const getUser = () => {
  const userJson = localStorage.getItem(USER_KEY)
  if (userJson) {
    try {
      return JSON.parse(userJson)
    } catch (error) {
      console.error(error)
    }
  }
  return null
}
export const clearUser = () => localStorage.removeItem(USER_KEY)
export const getToken = () => getUser()?.token
