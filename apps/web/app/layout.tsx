export const metadata = {
  title: "IEEE Zewail City Student Branch",
  description: "IEEE Zewail City Student Branch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
