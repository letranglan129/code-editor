import DOMPurify from 'isomorphic-dompurify'
import { debounce } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { NodeApi, Tree, TreeApi } from 'react-arborist'
import { FaChevronDown, FaChevronRight } from 'react-icons/fa6'
import { VscCaseSensitive, VscClearAll, VscRegex } from 'react-icons/vsc'
import editorService from '../../../services/EditorService'
import projectService from '../../../services/ProjectSerivce'
import { SearchResult, SearchResultObj } from '../../../utils/types'
import { FileExplorerProps } from '../FileExplorer'
import TreeIcon from '../FileExplorer/Tree/TreeIcon'
import { useLoading } from '../../../hooks/useLoading'

export default function Search({ onClick }: Pick<FileExplorerProps, 'onClick'>) {
	const inputRef = useRef<HTMLInputElement>(null)
	const [isMatchCase, setIsMatchCase] = useState(false)
	const [isRegex, setIsRegex] = useState(false)
	const [searchString, setSearchString] = useState('')
	const [searchResults, setSearchResults] = useState<SearchResultObj>({})
	const searchResultWrapperRef = useRef<HTMLDivElement>(null)

	const [searchHandler, isLoading] = useLoading(async () => {
		const result = await projectService.search({ searchString, isRegex, isMatchCase })

		if (result) setSearchResults(projectService.searchConfig.results)
	})

	useEffect(() => {
		searchHandler()
	}, [searchString, isMatchCase, isRegex])

	const toggleMatchCase = () => setIsMatchCase(!isMatchCase)

	const toggleRegex = () => setIsRegex(!isRegex)

	const clearSearch = () => {
		setSearchString('')
		setSearchResults({})
		setIsMatchCase(false)
		setIsRegex(false)
		inputRef.current && (inputRef.current.value = "")
	}

	return (
		<>
			<div className="flex h-full flex-col ">
				<div className="flex h-10 flex-shrink-0 items-center justify-between px-3 text-11">
					<h2>SEARCH</h2>
					<button className="text-lg" onClick={clearSearch}>
						<VscClearAll />
					</button>
				</div>
				<div className="px-3">
					<div className="flex h-8 items-center bg-zinc-700  text-12 text-gray-300">
						<input
							type="text"
							ref={inputRef}
							placeholder="Search"
							className=" flex-1 bg-inherit indent-2 outline-none"
							onChange={debounce(e => setSearchString(e.target.value), 500)}
						/>
						<button
							className={`mr-1 aspect-square rounded-md p-1 text-lg  ${isMatchCase ? 'bg-sky-600' : 'hover:bg-zinc-600'}`}
							onClick={toggleMatchCase}
						>
							<VscCaseSensitive />
						</button>
						<button
							className={`aspect-square rounded-md p-1 text-lg  ${isRegex ? 'bg-sky-600' : 'hover:bg-zinc-600'}`}
							onClick={toggleRegex}
						>
							<VscRegex />
						</button>
					</div>
				</div>
				<div className="search-result flex-1 overflow-hidden" ref={searchResultWrapperRef}>
					{isLoading ? (
						<p>Loading...</p>
					) : (
						<SearchTree
							searchResults={searchResults}
							height={
								searchResultWrapperRef.current ? searchResultWrapperRef.current.clientHeight - 20 : 0
							}
							onClick={onClick}
						/>
					)}
				</div>
			</div>
		</>
	)
}

const SearchTree = ({
	searchResults,
	height,
	onClick,
}: Pick<FileExplorerProps, 'onClick'> & {
	searchResults: SearchResultObj
	height: number
}) => {
	const treeRef = useRef<TreeApi<SearchResult> | null>(null)

	const handleOpenFile = (node: NodeApi<SearchResult>) => {
		onClick({
			id: node.parent?.data.id!,
		})

		setTimeout(() => {
			editorService.getEditor()?.setSelection(node.data.range!)
			editorService.getEditor()?.focus()
			editorService.getEditor()?.revealRangeInCenter(node.data.range!)
		}, 100)
	}

	return (
		<Tree
			ref={treeRef}
			data={Object.values(searchResults)}
			openByDefault={true}
			width="100%"
			height={height}
			indent={10}
			rowHeight={22}
			padding={10}
			renderCursor={() => null}
		>
			{({ node, style, tree, dragHandle }) => {
				return node.level === 0 ? (
					<div
						onClick={() => node.toggle()}
						className="flex cursor-pointer select-none items-center px-3 py-1 text-13 hover:bg-gray-600 hover:bg-opacity-20"
					>
						<div className="flex h-5 w-5 items-center justify-center">
							<span className={`w-5`}>
								{node.isOpen ? (
									<FaChevronDown className="text-11" />
								) : (
									<FaChevronRight className="text-11" />
								)}
							</span>
						</div>
						<TreeIcon file={{ type: node.data.type, name: node.data.name }} />
						<p className="ml-1.5">{node.data.name}</p>
					</div>
				) : (
					node.data.htmlView && (
						<p
							className="line-clamp-1 cursor-pointer py-1 pl-8 pr-3 text-12 hover:bg-gray-600 hover:bg-opacity-20"
							onClick={() => handleOpenFile(node)}
						>
							{node.data.htmlView[0]}
							<span
								dangerouslySetInnerHTML={{
									__html: DOMPurify.sanitize(node.data.htmlView[1]),
								}}
							/>
							{node.data.htmlView[2]}
						</p>
					)
				)
			}}
		</Tree>
	)
}
