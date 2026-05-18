/** @type {import('next').NextConfig} */
const nextConfig = {
  // En dev, `output: 'export'` exige que cada /objectives/[id] esté en generateStaticParams.
  // Solo activamos export estático en build de producción (Apache sirve __export_build__.html).
  ...(process.env.NODE_ENV === "production" ? { output: "export" } : {}),
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
