export function Footer() {
  return (
    <footer className={`border-t bg-background`}>
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          {/* TODO: Add copyright, legal links, etc. */}
          <p>© {new Date().getFullYear()} Cyna App. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}