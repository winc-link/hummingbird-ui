import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import './CodeHighlighter.less'

interface ICodeHighlighter {
  value?: string
  codeType?: string
}

export default function CodeHighlighter ({ value = '', codeType = 'sql' }: ICodeHighlighter) {
  return <div className="CodeHighlighter"><SyntaxHighlighter language={codeType} style={docco}>{value}</SyntaxHighlighter></div>
}
