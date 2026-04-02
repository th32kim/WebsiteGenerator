import React from 'react'

function WorkspaceLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div>{children}</div>
  )
}

export default WorkspaceLayout