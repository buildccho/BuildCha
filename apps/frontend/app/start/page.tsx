import BgSky from "@/components/layout/bgSky";
import SignInForm from "@/features/auth/components/signInForm";

export default function StartPage() {
  return (
    <>
      <div className="min-h-svh flex flex-col justify-center items-center gap-6 max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold">AIとまちづくりをはじめよう！</h1>
        <div className="bg-white/70 backdrop-blur-md rounded-3xl py-12 px-6 flex flex-col gap-8 w-full">
          <p className="text-center font-medium leading-normal">
            まずは、アバターとなまえを決めてね。
            <br />
            あとから変えることもできるよ
          </p>
          <SignInForm />
        </div>
      </div>
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <BgSky />
      </div>
    </>
  );
}
