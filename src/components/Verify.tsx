import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";

export function Verify() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <div className="max-w-md mx-auto text-center px-4 sm:px-8 py-10 rounded-xl shadow">
          <header className="mb-8">
              <h1 className="text-2xl font-bold mb-1">Almost there!</h1>
              <p className="text-[15px] text-slate-500">Please input the 6-digit code sent to your email to finalize your account setup.</p>
          </header>
          <form id="otp-form">
              <div className="w-full inline-flex justify-center">
                <InputOTP maxLength={6}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <div className="max-w-[260px] mx-auto mt-4">
                  <button type="submit"
                      className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150">Verify
                      Account</button>
              </div>
          </form>
          <div className="text-sm text-slate-500 mt-4">Didn't receive code? <a className="font-medium text-indigo-500 hover:text-indigo-600" href="#0">Resend</a></div>
      </div>
    </div>
  );
}