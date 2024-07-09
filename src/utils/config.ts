import { getToken } from './auth'

// export const wsHost = `ws://${location.host}`
export const wsHost = location.protocol === 'https:' ? `wss://${location.host}` : `ws://${location.host}`
// export const xToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJJRCI6MSwiVXNlcm5hbWUiOiJhZG1pbiIsImV4cCI6MTY4ODE4NDEyMSwiaXNzIjoiZWRnZS1nYXRld2F5IiwibmJmIjoxNjcwMDM5MTIxfQ.R4R6q49GD51yi0HAlRwFFnNgpNaBTlpjrTmhqj19Wo0'
export const xToken = getToken()
