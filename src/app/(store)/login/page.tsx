'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { useLoading } from '../../../hooks/useLoading'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { EMAIL_REG, MIN_LENGTH_PASSWORD } from '../../../utils/constant'
import lang from '../../../locale/en'
import { VscGithubInverted } from 'react-icons/vsc'
import { useToastStore } from '../../../store/ToastStore'
import { ToastVariant } from '../../../components/Toast'

type LoginFormData = {
	email: string
	password: string
}

export default function LoginPage() {
	const router = useRouter()
	const toastStore = useToastStore()
	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		formState: { errors },
	} = useForm<LoginFormData>({
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const handleLogin = async (data: LoginFormData) => {
		try {
			const res = await signIn('credentials', {
				email: data.email,
				password: data.password,
				redirect: false,
				callbackUrl: `${process.env.NEXT_PUBLIC_APP_BASE_URL}`,
			})

			if (res?.error) {
				toastStore.add('login-failed', {
					header: 'Login failed',
					content: 'Please check the entered data again',
					variant: ToastVariant.Error,
				})
			} else {
				toastStore.add('login-successfully', {
					header: 'Login successfully',
					variant: ToastVariant.Success,
				})
				router.push('/dashboard')
			}
		} catch (error: any) {
			toastStore.add('login-failed', {
				header: 'Login failed',
				content: 'Please check the entered data again',
				variant: ToastVariant.Error,
			})
		}
	}

	const [submitLogin, isLoadingSubmitLogin] = useLoading(handleLogin)

	const onSubmit = handleSubmit(submitLogin)

	return (
		<>
			<div className="py-8 text-center">
				<div className="mb-4 text-center">
					<img alt="Builder" src="https://flowbite.com/docs/images/logo.svg" className="mx-auto h-10" />
				</div>
				<div>
					<p className="mb-3 text-2xl text-gray-800 dark:text-gray-300">{lang.login}</p>
				</div>
				<div className="mx-auto max-w-sm sm:px-0">
					<button
						type="button"
						className="mb-2 mr-2 inline-flex w-full items-center justify-between rounded-lg bg-[#4285F4] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#4285F4]/90 focus:outline-none focus:ring-4 focus:ring-[#4285F4]/50 dark:focus:ring-[#4285F4]/55"
						onClick={() => {
							signIn('github', {
								callbackUrl: process.env.NEXT_PUBLIC_APP_BASE_URL,
							})
						}}
					>
						<VscGithubInverted className="text-lg" />
						{lang.signGithub}
						<div></div>
					</button>
				</div>
			</div>
			<form className="mx-auto w-full max-w-md rounded-xl bg-neutral-900 p-10" onSubmit={onSubmit}>
				<div className="mb-6 space-y-2">
					<label
						htmlFor="af-submit-app-project-name"
						className="inline-block w-full text-sm font-medium text-gray-800 dark:text-gray-200"
					>
						Email
					</label>

					<input
						{...register('email', {
							required: true,
							pattern: {
								value: EMAIL_REG,
								message: 'Please enter your email address',
							},
						})}
						type="email"
						className="h-auto w-full rounded-md border-none bg-neutral-800 px-4 py-2 outline-none focus-visible:ring-2"
						placeholder="Ex: email@email.com"
					/>
					{errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
				</div>

				<div className="mb-6 space-y-2">
					<label
						htmlFor="af-submit-project-url"
						className="mt-2.5 inline-block w-full text-sm font-medium text-gray-800 dark:text-gray-200"
					>
						Password
					</label>

					<input
						type="password"
						{...register('password', {
							required: true,
							minLength: {
								value: MIN_LENGTH_PASSWORD,
								message: 'Password must be at least ' + MIN_LENGTH_PASSWORD + ' characters',
							},
						})}
						className="h-auto w-full rounded-md border-none bg-neutral-800 px-4 py-2 outline-none focus-visible:ring-2"
						placeholder="Password..."
					/>
					{errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
				</div>
				<div>
					<button
						className="button circle !h-10 !w-full !rounded-md bg-blue-600 py-2 text-gray-100 hover:bg-blue-700"
						type="submit"
					>
						<span className="title flex items-center justify-center">
							{isLoadingSubmitLogin ? (
								<AiOutlineLoading3Quarters className="mr-2 h-6 w-6 animate-spin" />
							) : (
								lang.login
							)}
						</span>
					</button>
				</div>
			</form>

			<div className="pb-3 pt-5 text-center text-gray-700 dark:text-gray-300">
				<Link className="text-indigo-500" href="/register">
					{lang.dontHaveAccount}
				</Link>
			</div>
			<div className="py-5 text-center text-gray-700 dark:text-gray-300">
				© 2023 Builder. Crafted with by LeLan
			</div>
		</>
	)
}
