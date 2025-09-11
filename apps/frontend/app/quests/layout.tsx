import BgSky from "@/components/bgSky";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
      <div className="fixed inset-0 -z-10">
        <BgSky />
      </div>
    </div>
  );
}
