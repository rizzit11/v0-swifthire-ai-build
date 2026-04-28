import { PreviewClient } from "./preview-client"

// The iframe-only preview: empty doc that listens for postMessage
// updates from the parent builder and renders the live resume. We
// disable static generation so the inherited print CSS always ships.
export const dynamic = "force-static"

export const metadata = {
  title: "Resume preview",
  robots: { index: false, follow: false },
}

export default function ResumePreviewPage() {
  return <PreviewClient />
}
