import { getVSIFileIcon, getVSIFolderIcon } from 'file-extension-icon-js'
import styles from './TreeItem.module.scss'
import { FileDataType, FileTreeNomarlizedType } from '@/utils/types'
import { NodeApi } from 'react-arborist'

function TreeIcon({ file, node }: { file: FileDataType; node: NodeApi<FileTreeNomarlizedType> }) {
	switch (file.type) {
		case 'folder':
			return (
				<img
					className={'flex-shrink-0'}
					src={getVSIFolderIcon(file.name, node.isOpen)}
					alt={file.name}
					width="16"
				/>
			)
		case 'file':
			return <img className={'flex-shrink-0'} src={getVSIFileIcon(file.name)} alt={file.name} width="16" />
		default:
	}
}

export default TreeIcon
