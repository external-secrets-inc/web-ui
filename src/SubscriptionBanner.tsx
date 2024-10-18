import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./components/ui/alert";

function SubscriptionBanner() {
  // Dummy expiration data (for testing purposes)
  const dummyExpirationDate = new Date();
  dummyExpirationDate.setDate(dummyExpirationDate.getDate() + 3); // 3 days from now

  const [daysUntilExpiration, setDaysUntilExpiration] = useState(0);
  const [dismissed, setDismissed] = useState(false); // Track dismissal
  const [threshold, setThreshold] = useState<string | number | null>(null); // Expiration state
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [expirationDateFormatted, setExpirationDateFormatted] =
    useState<string>(""); // Formatted expiration date

  useEffect(() => {
    calculateDaysUntilExpiration(dummyExpirationDate);
  }, []);

  // calculating days left until sub runs out
  const calculateDaysUntilExpiration = (expirationDate: Date) => {
    const today = new Date();
    const diffInTime = expirationDate.getTime() - today.getTime();
    const days = Math.ceil(diffInTime / (1000 * 60 * 60 * 24));
    setDaysUntilExpiration(days);

    // Format the expiration date (Month, Day, Year)
    const formattedDate = expirationDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });
    setExpirationDateFormatted(formattedDate);

    // Set the appropriate threshold
    setThreshold(calculateThreshold(days));
  };

  // Helper function to determine the threshold
  const calculateThreshold = (days: number): string | number | null => {
    if (days <= 0) return "expired";
    if (days === 1) return 1;
    if (days <= 3) return 3;
    if (days <= 7) return 7;
    if (days <= 15) return 15;
    return null;
  };

  // Handle dismissal logic
  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setDismissed(true);
    }, 1000); // Matches the fade-out duration
  };

  // Hide the component if dismissed or no threshold
  if (dismissed || !threshold) {
    return null;
  }

  return (
    <div
      className={`mr-14 ml-14 flex justify-center items-center ${
        isFadingOut ? "animate-fade-out" : ""
      }`}
    >
      <Alert
        variant={threshold === "expired" ? "destructive" : "warning"}
        className="mt-6 mb-4 w-full max-w-[1380px] flex justify-between items-center pl-4 pr-6"
      >
        <div className="flex flex-row space-x-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
            />
          </svg>

          <AlertDescription className="text-left">
            {threshold === "expired"
              ? "Your subscription has expired! Please renew your subscription."
              : `Your subscription will expire in ${daysUntilExpiration} day(s). Please ensure your next payment is made by ${expirationDateFormatted}.`}
          </AlertDescription>
        </div>

        {threshold !== "expired" && (
          <button
            onClick={handleDismiss}
            className={`text-xl font-semibold ${
              threshold === "expired"
                ? "hover:text-destructive"
                : "hover:text-orange-500"
            }`}
          >
            X
          </button>
        )}
      </Alert>
    </div>
  );
}

export default SubscriptionBanner;
