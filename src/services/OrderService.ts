import axios from 'axios'
import { IOrder } from '../modules/mongo/schema/User'

class OrderService {

    static async getOrders(start?: number, take?: number) {
        const url = `/api/dashboard/orders`

        const urlParams = new URLSearchParams()
        start && urlParams.append('start', `${start}`)
        take && urlParams.append('take', `${take}`)
        const res = await axios.get<IOrder[]>(`${url}?${urlParams.toString()}`)
        return res.data
    }

    static async getDailyOrders() {
        const url = `/api/dashboard/orders/daily`

        const res = await axios.get<{
            date: string[]
            list: IOrder[]
            customerCount: number
            totalOrders: number
            totalProfit: number
        }>(url)
        return res.data
    }

    static async getWeekOrders() {
        const url = `/api/dashboard/orders/week`

        const res = await axios.get<{
            date: string[]
            list: IOrder[]
            customerCount: number
            totalOrders: number
            totalProfit: number
        }>(url)
        return res.data
    }

    static async getMonthOrders() {
        const url = `/api/dashboard/orders/month`

        const res = await axios.get<{
            date: string[]
            list: IOrder[]
            customerCount: number
            totalOrders: number
            totalProfit: number
        }>(url)
        return res.data
    }

    static async getOrderById(id: string) {
        const url = `/api/orders/${id}`
        const res = await axios.get<IOrder>(url)
        return res.data
    }

    static async getOrderByPaymentCode(id: string) {
        const url = `/api/orders/paymentCode/${id}`
        const res = await axios.get<IOrder>(url)
        return res.data
    }

    static async createOrder(templateId: number, amount: number, amountUSD: number) {
        const res = await axios.post<string>(`/api/templates/order`, {
            Amount: amount,
            TemplateId: templateId,
            AmountUSD: amountUSD,
        })

        return res.data
    }

    static async updateOrder(orderId: string, payDate: string) {
        const res = await axios.patch<string>(process.env.NEXT_PUBLIC_HOST_ENDPOINT + `/api/templates/order`, {
            orderId,
            payDate,
        })

        return res.data
    }

}

export default OrderService