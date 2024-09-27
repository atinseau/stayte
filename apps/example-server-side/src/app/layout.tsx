export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <p>url: </p>
      </body>
    </html>
  );
}


export const dynamic = 'force-dynamic';