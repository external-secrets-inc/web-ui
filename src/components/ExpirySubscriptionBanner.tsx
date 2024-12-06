import { getSubscriptions } from "@/services/subscriptions/subscriptionsService";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "./ui/alert";
import { LucideCalendarClock, LucideX } from "lucide-react";
import { Button } from "./ui/button";

function calculateDiffDays(endDate: string, startDate: string = new Date().toISOString()): number {
	const endDateObj = new Date(endDate);
	const startDateObj = new Date(startDate);
	return Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ExpirySubscriptionBanner() {
	const [subData, setSubData] = useState({ id: "", expiryDate: "" });
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
					const newData = { expiryDate, lastDismissedAt: null };
					localStorage.setItem(`banner_${id}`, JSON.stringify(newData));
				}

				// Update local state based on localStorage
				const updatedData = JSON.parse(localStorage.getItem(`banner_${id}`) || "{}");
				setSubData({ id, expiryDate: updatedData.expiryDate });

				// Check how many days are left until expiry
				const diffDays = calculateDiffDays(expiryDate);

				// Determine if we should show the banner based on lastDismissedAt
				const lastDismissedAt = updatedData.lastDismissedAt;

				// Determine which range the expiryDate falls into and show the banner
				if (diffDays <= 0) setShowBanner(true);
				else if (diffDays == 1 && lastDismissedAt !== 1) setShowBanner(true);
				else if (diffDays <= 3 && lastDismissedAt !== 3) setShowBanner(true);
				else if (diffDays <= 7 && lastDismissedAt !== 7) setShowBanner(true);
				else if (diffDays <= 15 && lastDismissedAt !== 15) setShowBanner(true);

			} catch (error) {
				console.log(error);
			}
		};

		getSubs();
	}, []);

	// Calculate the days left to expiry
	const diffDays = calculateDiffDays(subData.expiryDate);

	const handleClose = () => {
		let lastDismissedAt = 99;
		if (diffDays == 1) lastDismissedAt = 1;
		else if (diffDays <= 3) lastDismissedAt = 3;
		else if (diffDays <= 7) lastDismissedAt = 7;
		else if (diffDays <= 15) lastDismissedAt = 15;

		// Update localStorage with new closed state
		const updatedData = { expiryDate: subData.expiryDate, lastDismissedAt };
		localStorage.setItem(`banner_${subData.id}`, JSON.stringify(updatedData));

		setShowBanner(false);
	}

	// Formatting date to US:
	const [year, month, day] = subData.expiryDate.split('-');
	const expiryDateUS = `${month}/${day}/${year}`;

	return (
		<>
			<div className={showBanner ? "md:-mt-6" : "hidden"}>
				<Alert variant={diffDays > 0 ? "default" : "destructive"} className="flex items-center justify-between mb-4">
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
			</div>
		</>
	);
}


