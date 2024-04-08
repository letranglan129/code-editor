'use client'

import { Player } from '@lottiefiles/react-lottie-player'
import { useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { CODE_PAYMENT_STATUS } from '@/utils/constant'
import { formatNumber } from '@/utils/numbers'
import Link from 'next/link'
import OrderService from '../../../../services/OrderService'
import { IOrder } from '../../../../modules/mongo/schema/User'
import isAuth from '../../../../components/isAuth'

const StatusPage = () => {
	const searchParams = useSearchParams()
	const [order, setOrder] = useState<IOrder>()

	const paymentStatus = useMemo(
		() => ({
			orderId: searchParams?.get('vnp_TxnRef'),
			tranId: searchParams?.get('vnp_TransactionNo'),
			responseCode: searchParams?.get('vnp_ResponseCode'),
			transactionStatus: searchParams?.get('vnp_TransactionStatus'),
			amount: Number(searchParams?.get('vnp_Amount')) / 100,
			payDate: searchParams?.get('vnp_PayDate'),
		}),
		[],
	)

	useEffect(() => {
		async function getExchangeMoney() {
			if (paymentStatus.orderId) {
				const moneyVND = await OrderService.getOrderByPaymentCode(paymentStatus.orderId)
				setOrder(moneyVND)
			}
		}
		getExchangeMoney()
	}, [paymentStatus])

	async function updateOrderStatus() {
		if (paymentStatus.orderId && paymentStatus.payDate)
			await OrderService.updateOrder(paymentStatus.orderId, paymentStatus.payDate)
	}

	updateOrderStatus()

	return (
		order?.amount &&
		(paymentStatus?.responseCode === '00' ? (
			<div className="container mx-auto mb-20 text-center sm:max-w-sm">
				<Player
					autoplay
					controls={false}
					keepLastFrame
					loop={false}
					src="/images/successLottie.json"
					style={{ height: '240px', width: '240px' }}
				></Player>
				<h2 className="mb-4 text-2xl">Payment Successfully</h2>
				<p className="px-2">Hooray! Your payment was successfully!</p>
				<hr className="my-4 border-neutral-600" />
				<p className="mb-2 text-xs font-light">AMOUNT PAID</p>
				<p className="text-xl font-semibold text-green-500">{formatNumber(order?.amount)} USD</p>
				<hr className="my-4 border-neutral-600" />
				<div className="grid gap-y-4">
					<Link className="flex w-full items-center justify-center" href="/">
						Go to Home
					</Link>
					<Link
						href="/user/orders"
						className="flex w-full items-center  justify-center !bg-blue-600 text-white"
					>
						Go to History Order
					</Link>
				</div>
			</div>
		) : (
			<div className="container mx-auto mb-20 text-center sm:max-w-sm">
				<Player
					autoplay
					controls={false}
					keepLastFrame
					loop={false}
					src="/images/errorLottie.json"
					style={{ height: '240px', width: '240px' }}
				></Player>
				<h2 className="mb-4 text-2xl">Payment failed</h2>
				<p className="px-2">
					Your payment was not successfully processed. Please contact our customer support or try again.
				</p>
				<hr className="my-4 border-neutral-600" />
				<p className="mb-2 text-xs text-red-500">Error</p>
				<p className="mb-2 text-xs text-red-500">{CODE_PAYMENT_STATUS[paymentStatus?.responseCode || '99']}</p>
				<hr className="my-4 border-neutral-600" />
				<div className="grid gap-y-4">
					<Link className="flex w-full items-center justify-center" href="/">
						Go to Home
					</Link>
				</div>
			</div>
		))
	)
}

export default isAuth(StatusPage)
