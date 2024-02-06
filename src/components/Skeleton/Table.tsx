// SkeletonTable.js

import React from 'react'

const SkeletonTable = ({ rows, cols }: { rows: number; cols: number }) => {
	return (
		<div className="overflow-hidden">
			<table className="w-full overflow-hidden animate-pulse ">
				<thead>
					<tr>
						{Array(cols)
							.fill(0)
							.map((_, i) => (
								<th key={i} className="p-4 skeleton-cell">
									<div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700"></div>
								</th>
							))}
					</tr>
				</thead>
				<tbody>
					{Array(rows)
						.fill(0)
						.map((_, i) => (
							<tr key={i}>
								{Array(cols)
									.fill(0)
									.map((_, i) => (
										<th key={i} className="p-4 skeleton-cell">
											<div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700"></div>
										</th>
									))}
							</tr>
						))}
				</tbody>
			</table>
		</div>
	)
}

export default SkeletonTable
