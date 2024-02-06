import { Button } from 'devextreme-react/button'

export default function Pager({
	pageSize,
	pageIndex,
	totalCount,
	onPageChange,
}: {
	pageSize: number
	pageIndex: number
	totalCount: number
	onPageChange: (pageIndex: number) => void
}) {
	const totalPages = Math.ceil(totalCount / pageSize)

	const generatePageNumbers = () => {
		const pageNumbers = []
		const range = 2 // Số trang hiển thị bên cạnh trang hiện tại

		if (totalPages <= 5) {
			for (let i = 0; i < totalPages; i++) {
				pageNumbers.push(i)
			}
		} else {
			let start = Math.max(0, pageIndex - range)
			let end = Math.min(totalPages - 1, pageIndex + range)

			if (pageIndex - start < range) {
				end += range - (pageIndex - start)
			}

			if (end - pageIndex < range) {
				start -= range - (end - pageIndex)
			}

			for (let i = start; i <= end; i++) {
				pageNumbers.push(i)
			}
		}

		return pageNumbers
	}

	return (
		<div className="text-center text-13">
			<Button
				text="First"
				type="normal"
				stylingMode="text"
				className=" mr-0.5 sm:mx-2 md:mx-4"
				disabled={pageIndex === 0}
				onClick={() => onPageChange(0)}
			/>
			<Button
				text="Prev"
				type="normal"
				stylingMode="text"
				className=" mr-0.5 sm:mx-2 md:mx-4"
				onClick={() => onPageChange(pageIndex - 1)}
				disabled={pageIndex === 0}
			/>
			{generatePageNumbers().map(pageNumber => (
				<Button
					width={32}
					height={32}
					key={pageNumber}
					text={`${pageNumber + 1}`}
					type="normal"
					stylingMode="text"
					onClick={() => onPageChange(pageNumber)}
					className={`no-padding mr-0.5 sm:mx-2 md:mx-4 ${pageIndex === pageNumber ? '!bg-sky-600 ' : ''}`}
				/>
			))}
			<Button
				className=" mr-0.5 sm:mx-2 md:mx-4"
				text="Next"
				type="normal"
				stylingMode="text"
				onClick={() => onPageChange(pageIndex + 1)}
				disabled={pageIndex === totalPages - 1}
			/>
			<Button
				text="Last"
				type="normal"
				stylingMode="text"
				className=" mr-0.5 sm:mx-2 md:mx-4"
				onClick={() => onPageChange(totalPages - 1)}
				disabled={pageIndex === totalPages - 1}
			/>
		</div>
	)
}
