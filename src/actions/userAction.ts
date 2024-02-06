import axios, { AxiosResponse } from 'axios'
import { IUser } from '../modules/mongo/schema/User'
const host = process.env.NEXT_PUBLIC_APP_BASE_URL

type RegisterType = Pick<IUser, 'fullName' | 'email' | 'password'>

export const register = async (data: RegisterType) => {
	const url = process.env.NEXT_PUBLIC_APP_BASE_URL + `/api/user/register`

	const res = await axios.post<any, AxiosResponse>(url, data)
	return res
}
