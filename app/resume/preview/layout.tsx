// Strip the AppShell — this page is rendered inside an iframe and must
// stay chrome-free so the print stylesheet only includes the resume.
export default function PreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
