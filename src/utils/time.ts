export function time2Timestamp (timeStr: string) {
  // const timeStr = '17:53:57';
  const date = new Date()
  const [hours, minutes, seconds] = timeStr.split(':').map(Number)
  date.setHours(hours, minutes, seconds)
  const timestamp = date.getTime()
  return timestamp
}
