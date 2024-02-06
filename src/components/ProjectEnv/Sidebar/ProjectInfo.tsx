import { FileSystemTree } from '@webcontainer/api'
import JSZip from 'jszip'
import { observer } from 'mobx-react-lite'
import { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FaCodeFork, FaEye } from 'react-icons/fa6'
import { VscCloudDownload, VscCloudUpload, VscNewFile, VscNewFolder } from 'react-icons/vsc'
import { SidebarProps, SidebarRef } from '.'
import projectService from '../../../services/ProjectSerivce'
import { useProjectCodeStore } from '../../../store/projects'
import { isMediaFile } from '../../../utils/strings'
import { convertArrayToNestedTree, convertContainerFiles } from '../../../utils/trees'
import Accordion from '../../Accordion'
import Dependencies from '../Dependencies'
import FileExplorer, { FileExplorerRef } from '../FileExplorer'
import { base64ToUint8Array } from 'uint8array-extras'

export default memo(
	observer(
		forwardRef<SidebarRef, SidebarProps>(function ProjectInfo(
			{ onAddNew, onClick, onCreate, onDelete, onDoubleClick, onRename, openTerminal, createTerminal, onMove },
			ref,
		) {
			const projectCodeStore = useProjectCodeStore()
			const fileExplorerRef = useRef<FileExplorerRef>(null)
			const uploadFileInputRef = useRef<HTMLInputElement>(null)
			const { getInputProps } = useDropzone()

			useImperativeHandle(ref, () => ({
				fileExplorerRef: fileExplorerRef.current,
			}))

			const createZipFile = async (data: FileSystemTree) => {
				const addFilesToZip = (zip: JSZip, directory: FileSystemTree) => {
					for (const [name, item] of Object.entries(directory)) {
						const path = name

						if ('file' in item) {
							zip.file(
								path,
								isMediaFile(path) ? base64ToUint8Array(item.file.contents as string) : item.file.contents,
							)
						} else if ('directory' in item) {
							const folder = zip.folder(path)
							folder && addFilesToZip(folder, item.directory)
						}
					}
				}
				const zip = new JSZip()
				addFilesToZip(zip, data)

				const content = await zip.generateAsync({ type: 'blob' })
				const zipFile = new Blob([content], { type: 'application/zip' })
				const url = window.URL.createObjectURL(zipFile)

				const a = document.createElement('a')
				a.href = url
				a.download = 'myzipfile.zip'
				a.click()

				window.URL.revokeObjectURL(url)
			}

			return (
				<>
					<h2 className="flex h-10 flex-shrink-0 items-center pl-3 pr-2 text-11">PROJECT</h2>
					<Accordion
						className="bg-zinc-700"
						sticky
						open
						handler={
							<div className="flex items-center justify-between pr-3">
								<h6 className="text-11">INFO</h6>
								<div className="flex gap-2">
									<a
										onClick={async e => {
											e.stopPropagation()
											const fileNestedTree = convertArrayToNestedTree(
												Object.values(projectService.getEntriesNomalized()),
											)
											createZipFile({ ...convertContainerFiles(fileNestedTree) })
										}}
										className="hover:text-zinc-200"
									>
										<VscCloudDownload />
									</a>
								</div>
							</div>
						}
						iconPosition="left"
					>
						<div className="px-4 py-3">
							<h3 className="text-13 text-title">{projectCodeStore.project?.title || ''}</h3>
							<p className="my-3 text-12">{projectCodeStore.project?.description || ''}</p>
							<div className="flex gap-2 text-12">
								<div>
									<FaEye className="inline-block" /> {projectCodeStore.project?.views_count} view
								</div>
								<div>
									<FaCodeFork className="inline-block" /> {projectCodeStore.project?.forks_count} fork
								</div>
							</div>
						</div>
					</Accordion>
					<Accordion
						className="bg-zinc-700"
						sticky
						open
						handler={
							<div className="flex items-center justify-between pr-3">
								<h6 className="text-11">FILES</h6>
								<div className="flex gap-2">
									<a
										onClick={async e => {
											e.stopPropagation()
											uploadFileInputRef.current?.click()
										}}
										className="hover:text-zinc-200"
									>
										<VscCloudUpload />
									</a>
									<a
										onClick={e => {
											e.stopPropagation()
											onAddNew('file')
										}}
										className="hover:text-zinc-200"
									>
										<VscNewFile />
									</a>
									<a
										onClick={e => {
											e.stopPropagation()
											onAddNew('folder')
										}}
										className="hover:text-zinc-200"
									>
										<VscNewFolder />
									</a>
								</div>
							</div>
						}
						iconPosition="left"
					>
						<FileExplorer
							onAddNew={onAddNew}
							onClick={onClick}
							onCreate={onCreate}
							onDelete={onDelete}
							onDoubleClick={onDoubleClick}
							onRename={onRename}
							ref={fileExplorerRef}
							key={projectCodeStore.treeFilesUpdateCount}
							onMove={onMove}
						/>
						<input {...getInputProps()} ref={uploadFileInputRef} />
					</Accordion>
					<Accordion
						className="bg-zinc-700"
						sticky
						open
						handler={<h6 className="text-11">DEPENDENCIES</h6>}
						iconPosition="left"
						containerClassName="flex flex-col flex-1 overflow-hidden"
						wrapperClassName="flex-1 overflow-hidden"
					>
						<Dependencies openTerminal={openTerminal} createTerminal={createTerminal} />
					</Accordion>
				</>
			)
		}),
	),
)
