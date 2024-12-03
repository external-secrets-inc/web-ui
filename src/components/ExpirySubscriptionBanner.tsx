import { getSubscriptions } from "@/services/subscriptions/subscriptionsService";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { LucideCalendarClock, LucideX } from "lucide-react";
import { Button } from "./ui/button";

export default function ExpirySubscriptionBanner() {
    const [subData, setSubData] = useState({ id: "", expiryDate: "", isClosed: [false, false, false, false] });
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const getSubs = async () => {
            try {
                const response = await getSubscriptions();
                const { expiryDate, id } = { ...response[0] };

                // Check localStorage for existing banner state
                const storedData = localStorage.getItem(`banner_${id}`);

                // Initialize localStorage if not found or expiryDate is different
                if (!storedData || JSON.parse(storedData).expiryDate !== expiryDate) {
                    const newData = { expiryDate, isClosed: [false, false, false, false] };
                    localStorage.setItem(`banner_${id}`, JSON.stringify(newData));
                }

                // Update local state based on localStorage
                const updatedData = JSON.parse(localStorage.getItem(`banner_${id}`) || "{}");
                setSubData({ id, ...updatedData });

                // Check how many days are left until expiry
                const expiryDateObj = new Date(expiryDate).getTime();
                const currentDate = new Date().getTime();
                const diffDays = Math.floor((expiryDateObj - currentDate) / (1000 * 60 * 60 * 24));

                // Determine which range the expiryDate falls into and show the banner
                if (diffDays <= 0) {
                    setShowBanner(true);
                } else if (diffDays == 1) {
                    if (!updatedData.isClosed[3]) setShowBanner(true)
                } else if (diffDays <= 3) {
                    if (!updatedData.isClosed[2]) setShowBanner(true)
                } else if (diffDays <= 7) {
                    if (!updatedData.isClosed[1]) setShowBanner(true)
                } else if (diffDays <= 15) {
                    if (!updatedData.isClosed[0]) setShowBanner(true)
                }
            } catch (error) {
                console.log(error);
            }
        };

        getSubs();
    }, []);

    const handleClose = () => {
        // Find the correct range based on the remaining days
        const expiryDateObj = new Date(subData.expiryDate).getTime();
        const currentDate = new Date().getTime();
        const diffDays = Math.floor((expiryDateObj - currentDate) / (1000 * 60 * 60 * 24));

        const updatedClosed = [...subData.isClosed];
        if (diffDays <= 15 && diffDays > 7) {
            updatedClosed[0] = true;
        } else if (diffDays <= 7 && diffDays > 3) {
            updatedClosed[1] = true;
        } else if (diffDays <= 3 && diffDays > 1) {
            updatedClosed[2] = true;
        } else if (diffDays == 1) {
            updatedClosed[3] = true;
        }

        // Update localStorage with new closed state
        const updatedData = { expiryDate: subData.expiryDate, isClosed: updatedClosed };
        localStorage.setItem(`banner_${subData.id}`, JSON.stringify(updatedData));

        setShowBanner(false);
    }

    // Calculate the days left to expiry
    const expiryDateObj = new Date(subData.expiryDate);
    const currentDate = new Date();
    const diffDays = Math.floor((expiryDateObj.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

    const formatDate = (dateString: string) => {
        const [year, month, day] = dateString.split('-');
        return `${month}/${day}/${year}`;
    };

    return (
        <>
            {showBanner &&
                <Alert variant={diffDays > 0 ? "default" : "destructive"} className="flex items-center justify-between py-2 px-4 mb-4">
                    <div className="flex items-center space-x-2">
                        <LucideCalendarClock size={20} />
                        {diffDays > 0 ?
                            <AlertDescription>
                                Your subscription will expire in{" "}
                                <span className="font-semibold">{diffDays} day{diffDays > 1 ? "s" : ""}</span>. Please ensure the
                                payment is made until{" "}
                                <span className="font-semibold">{formatDate(subData.expiryDate)}</span>.
                            </AlertDescription>
                            :
                            <AlertDescription>
                                Your subscription has expired on {formatDate(subData.expiryDate)}. Please make your payment to continue using our service.
                            </AlertDescription>
                        }

                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-white rounded-full h-8 w-8 p-0"
                        onClick={handleClose}
                        disabled={diffDays <= 0}
                    >
                        <LucideX size={16} />
                    </Button>
                </Alert>
            }
        </>
    );
}


