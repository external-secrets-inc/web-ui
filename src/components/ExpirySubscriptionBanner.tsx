import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { LucideCalendarClock, LucideX } from "lucide-react";
import { Button } from "./ui/button";
import { useSubscription } from "@/context/SubscriptionContext";
import { formatDate } from "@/utils/dateUtils";

function calculateDiffDays(endDate: string, startDate: string = new Date().toISOString()): number {
	const endDateObj = new Date(endDate);
	const startDateObj = new Date(startDate);
	return Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
}

const SHOW_BANNER_THRESHOLDS = [1, 3, 7, 15];

export default function ExpirySubscriptionBanner() {
	const [subData, setSubData] = useState({ id: "", expiryDate: "" });
	const [showBanner, setShowBanner] = useState(false);
	const { subscriptions } = useSubscription();

	useEffect(() => {
		if (subscriptions && subscriptions.length > 0) {
			const { expiryDate, id } = subscriptions[0];

			const storedData = localStorage.getItem(`banner_${id}`);
			if (!storedData || JSON.parse(storedData).expiryDate !== expiryDate) {
				const newData = { expiryDate, lastDismissedAtThreshold: null };
				localStorage.setItem(`banner_${id}`, JSON.stringify(newData));
			}

			const updatedData = JSON.parse(localStorage.getItem(`banner_${id}`) || "{}");
			setSubData({ id, expiryDate: updatedData.expiryDate });

			const diffDays = calculateDiffDays(expiryDate);
			const lastDismissedAtThreshold = updatedData.lastDismissedAtThreshold;
			const thresholdDay = [0, ...SHOW_BANNER_THRESHOLDS].find(threshold => diffDays <= threshold);
			if (thresholdDay !== undefined && lastDismissedAtThreshold !== thresholdDay) {
				setShowBanner(true);
			}
		}
	}, [subscriptions]);

	const diffDays = calculateDiffDays(subData.expiryDate);

	const handleClose = () => {
		const lastDismissedAtThreshold = SHOW_BANNER_THRESHOLDS.find(day => diffDays <= day) || null;
		const updatedData = { expiryDate: subData.expiryDate, lastDismissedAtThreshold };
		localStorage.setItem(`banner_${subData.id}`, JSON.stringify(updatedData));

		setShowBanner(false);
	}

	const expiryDateUS = formatDate(subData.expiryDate, { format: 'americanDate' });

	return (
		<>
			<Alert
				variant={diffDays > 0 ? "default" : "destructive"}
				className={`flex items-center justify-between mb-4 ${showBanner ? 'md:-mt-6' : 'hidden'}`}
			>
				<div className="flex items-center space-x-2">
					<LucideCalendarClock size={20} />
					{diffDays > 0 ?
						<AlertDescription>
							Your subscription will expire in{" "}
							<span className="font-semibold">{diffDays} day{diffDays > 1 ? "s" : ""}</span>.
							Please ensure the payment is made until <span className="font-semibold">{expiryDateUS}</span>.
						</AlertDescription>

						: diffDays === 0 ?
							<AlertDescription>
								Your subscription expires <span className="font-semibold">today</span>! Please make your payment to continue using our services.
							</AlertDescription>

							:
							<AlertDescription>
								Your subscription has expired on <span className="font-semibold">{expiryDateUS}</span>. Please make your payment to continue using our services.
							</AlertDescription>
					}
				</div>
				{diffDays > 0 &&
					<Button
						variant="ghost"
						size="icon"
						className="-mr-1"
						onClick={handleClose}
					>
						<LucideX size={16} />
					</Button>
				}
			</Alert>
		</>
	);
}


