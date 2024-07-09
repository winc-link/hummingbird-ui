export const downloadXlsx = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const blobUrl = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename || '模板文件'
  a.style.display = 'none'
  a.click()
  URL.revokeObjectURL(blobUrl)
}
