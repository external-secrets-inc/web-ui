import ForgotPasswordForm from "./ForgotPasswordForm.tsx";
import ResetPasswordForm from "./ResetPasswordForm.tsx";

interface ResetPasswordFlowProps {
  variant: 'forgot' | 'reset';
}

function ResetPasswordFlow({ variant }: ResetPasswordFlowProps) {
  return (
    <>
      <div className="p-2 lg:p-20 min-h-dvh flex flex-col bg-gradient-to-tl from-violet-400/60 to-violet-950">
        <div className="w-full flex-1 flex flex-col max-w-[800px] mx-auto lg:grid rounded-[32px] overflow-hidden bg-background">
          <div className="flex items-center justify-center p-10 lg:p-14 flex-1">
            <div className="mx-auto grid w-full gap-6">
              <div className="grid gap-2">
                <h1 className="text-3xl font-bold">{variant === 'forgot' ? 'Forgot your password?' : 'Reset Your Password'}</h1>
                <p className="text-pretty text-muted-foreground">
                  {variant === 'forgot' ? 'Here you can initiate the process to set a new password' : "Set a new password"}
                </p>
              </div>
              {variant === 'forgot' ? <ForgotPasswordForm /> : <ResetPasswordForm />}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}

export default ResetPasswordFlow;
