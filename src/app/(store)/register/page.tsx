'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLoading } from '@/hooks/useLoading'
import { EMAIL_REG, MIN_LENGTH_PASSWORD } from '@/utils/constant'
import { register as registerUser } from '@/actions/userAction'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IUser } from '../../../modules/mongo/schema/User'
import lang from '../../../locale/en'

type RegisterFormData = Pick<IUser, 'fullName' | 'email' | 'password'> & {
	confirmPassword: string
}

const RegisterPage = () => {
	const router = useRouter()
	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		formState: { errors },
	} = useForm<RegisterFormData>({
		defaultValues: {
			fullName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	})

	useEffect(() => {
		document.title = "Register - Code Builder"
	}, [])

	const handleRegister = async (data: RegisterFormData) => {
		try {
			const res = await registerUser(data)
			if (res.data === 'Exist customer') {
				// toast({
				// 	title: 'Registration failed',
				// 	description: 'This email has been registered',
				// 	className: '!bg-red-700',
				// 	duration: 3000,
				// })
			} else {
				// toast({
				// 	title: 'Registers successfully',
				// 	className: '!bg-green-700',
				// 	duration: 3000,
				// })
				router.push('/login')
			}
		} catch (error: any) {
			// toast({
			// 	title: 'Registration failed',
			// 	description: 'Please check the entered data again',
			// 	className: '!bg-red-700',
			// 	duration: 3000,
			// })
		}
	}

	const [submitRegister, isLoadingSubmitRegister] = useLoading(handleRegister)

	const onSubmit = handleSubmit(submitRegister)

	return (
		<>
			<div className="py-8 text-center">
				<div className="mb-4 text-center">
					<img alt="Builder" src="https://flowbite.com/docs/images/logo.svg" className="mx-auto h-10" />
				</div>
				<div>
					<p className="mb-3 text-2xl text-gray-800 dark:text-gray-300">{lang.register}</p>
				</div>
			</div>
			<form className="mx-auto w-full max-w-md rounded-xl bg-neutral-900 p-10" onSubmit={onSubmit}>
				<div className="mb-6 space-y-2">
					<label
						htmlFor="af-submit-app-project-name"
						className="inline-block w-full text-sm font-medium text-gray-800 dark:text-gray-200"
					>
						Full Name
					</label>

					<input
						type="text"
						{...register('fullName', {
							required: true,
							maxLength: 50,
						})}
						className="h-auto border-none w-full outline-none rounded-md bg-neutral-800 px-4 py-2 focus-visible:ring-2"
						placeholder="Ex: John Smith"
					/>
					{errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
				</div>
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
						className="h-auto border-none w-full outline-none rounded-md bg-neutral-800 px-4 py-2 focus-visible:ring-2"
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
						className="h-auto border-none w-full outline-none rounded-md bg-neutral-800 px-4 py-2 focus-visible:ring-2"
						placeholder="Password..."
					/>
					{errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
				</div>

				<div className="mb-6 space-y-2">
					<label
						htmlFor="af-submit-project-url"
						className="mt-2.5 inline-block w-full text-sm font-medium text-gray-800 dark:text-gray-200"
					>
						Confirm Password
					</label>

					<input
						type="Password"
						{...register('confirmPassword', {
							required: true,
							minLength: {
								value: MIN_LENGTH_PASSWORD,
								message: 'Password must be at least ' + MIN_LENGTH_PASSWORD + ' characters',
							},
							validate: {
								comparePassword: value => {
									const { password } = getValues()
									return password === value || 'ConfirmPassword not matches Password'
								},
							},
						})}
						className="h-auto border-none w-full outline-none rounded-md bg-neutral-800 px-4 py-2 focus-visible:ring-2"
						placeholder="Confirm Password..."
					/>
					{errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
				</div>
				<div>
					<button
						className="button circle !h-10 !w-full !rounded-md bg-blue-600 py-2 text-gray-100 hover:bg-blue-700"
						type="submit"
					>
						<span className="title flex items-center justify-center">
							{isLoadingSubmitRegister ? (
								<AiOutlineLoading3Quarters className="mr-2 h-6 w-6 animate-spin" />
							) : (
								lang.register
							)}
						</span>
					</button>
				</div>
			</form>

			<div className="pb-3 pt-5 text-center text-gray-700 dark:text-gray-300">
				{lang.alreadyAccount}{' '}
				<Link className="text-indigo-500" href="/login">
					{lang.login}
				</Link>
			</div>
			<div className="py-5 text-center text-gray-700 dark:text-gray-300">
				© 2023 Builder. Crafted with by LeLan
			</div>
		</>
	)
}

export default RegisterPage
