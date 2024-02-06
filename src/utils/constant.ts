import { CodePaymentStatusType } from './types'
import { monaco } from 'react-monaco-editor'

export const MIN_LENGTH_PASSWORD = 6
export const EMAIL_REG = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
export const PADDING_SEARCH = 20
export const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'ico']
export const LANGUAGES: monaco.languages.ILanguageExtensionPoint[] = [
	{ id: 'javascript', extensions: ['.js'] },
	{ id: 'typescript', extensions: ['.ts'] },
	{ id: 'vue', extensions: ['.vue'] },
	{ id: 'jsx', extensions: ['.jsx'] },
	{ id: 'tsx', extensions: ['.tsx'] },
	{ id: 'xml', extensions: ['.xml'] },
	{ id: 'jsonl', extensions: ['.json'] },
	{ id: 'astro', extensions: ['.astro'] },
	{ id: 'css', extensions: ['.css'] },
	{ id: 'html', extensions: ['.html', '.svg'] },
	{ id: 'yaml', extensions: ['.yaml'] },
	{ id: 'scss', extensions: ['.scss'] },
	{ id: 'sass', extensions: ['.sass'] },
	{ id: 'pug', extensions: ['.pug'] },
	{ id: 'svelte', extensions: ['.svelte'] },
	{ id: 'handlebars', extensions: ['.hbs'] },
	{ id: 'markdown', extensions: ['.md'] },
	{ id: 'docker', extensions: ['dockerfile', "Dockerfile"] },
]

export const CODE_PAYMENT_STATUS: CodePaymentStatusType = {
	'00': 'Giao dịch thành công',
	'07': 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).',
	'09': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.',
	'10': 'Giao dịch không thành công do: Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần',
	'11': 'Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.',
	'12': 'Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.',
	'13': 'Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.',
	'24': 'Giao dịch không thành công do: Khách hàng hủy giao dịch',
	'51': 'Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.',
	'65': 'Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.',
	'75': 'Ngân hàng thanh toán đang bảo trì.',
	'79': 'Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch',
	'99': 'Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)',
}

