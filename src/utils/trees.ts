'use client'

import { DirectoryNode, FileNode, FileSystemTree } from '@webcontainer/api'
import { FileDataType, FileEntriesType, FileTreeNomarlizedType } from './types'
import projectService from '@/services/ProjectSerivce'
import { monaco } from 'react-monaco-editor'
import { uuidv4 } from './strings'
/**
 * Convert data format to WebContainer format to mount into container.
 */
export const convertChildren = (nodes: FileSystemTree, node: FileDataType): FileSystemTree => {
	if (!node.children) {
		return {
			...nodes,
			[node.name]: {
				file: {
					contents: node.content || '',
				},
			},
		}
	}
	const children = node.children.reduce(convertChildren, {})
	return {
		...nodes,
		[node.name]: {
			directory: {
				...children,
			},
		},
	}
}

export const convertContainerFiles = (files: FileDataType[] = []) => {
	return files?.[0]?.children?.reduce<FileSystemTree>(convertChildren, {}) || {}
}

/**
 * Sort children by name so that when moving
 * files in the file manager the file order is not messed up.
 */
function _treeSort(node: FileTreeNomarlizedType): FileTreeNomarlizedType {
	if (!node.children) return node
	const copy = [...node.children]
	copy.sort((a, b) => {
		if (!!a.children && !b.children) return -1
		if (!!b.children && !a.children) return 1
		return projectService.getEntryFromId(a.id)?.name < projectService.getEntryFromId(b.id)?.name ? -1 : 1
	})
	const children = copy.map(_treeSort)
	return {
		...node,
		children,
	}
}

export function treeSort(data: FileTreeNomarlizedType[]) {
	return data.map(_treeSort)
}

/**
 * Convert data format to monaco editor model.
 * Monaco editor model is used to display code in the editor.
 */
export const createFileModels = (files: FileDataType[] = []): FileDataType[] => {
	return files.map(createChildModel(''))
}

export const createChildModel =
	(path: string) =>
		(node: FileDataType): FileDataType => {
			const _path = path + node.name
			const _nodePath = _path.slice(_path.indexOf('/') + 1) // ignore root path
			if (!node.children)
				return {
					...node,
					path: _nodePath,
					model: monaco.editor.createModel(node.content || '', undefined, monaco.Uri.file(_nodePath)),
				}

			const children = node.children.map(createChildModel(`${path}${node.name}/`))
			return {
				...node,
				path: _nodePath,
				children,
			}
		}

/**
 * Convert data format to flat list format to display in file manager.
 * This is used to quickly find file by path and file id.
 */
export const createFileEntries = (files: FileDataType[] = []): FileEntriesType => {
	return files.reduce((acc, file) => {
		if (!file.children)
			return {
				...acc,
				...(file?.path ? { [file.path]: file } : {}),
				[file.id]: file,
			}
		return {
			...acc,
			...(file?.path ? { [file.path]: file } : {}),
			[file.id]: file,
			...createFileEntries(file?.children || []),
		}
	}, {})
}

export const treeNormalize = (files: FileDataType[]): FileTreeNomarlizedType[] => {
	return files.map(file => {
		if (file.children) {
			return {
				id: file.id,
				children: treeNormalize(file.children),
			}
		}
		return {
			id: file.id,
		}
	})
}

export const convertArrayToNestedTree = (arr: FileDataType[]) => {
	const flatMap: { [key: string]: FileDataType } = {}
	const nestedTree: { [key: string]: FileDataType } = {}

	// Create a flat map for quick access by ID
	arr.forEach(item => {
		if (item.type === 'folder') flatMap[item.id] = { ...item, children: [] }
		else flatMap[item.id] = { ...item }
	})

	// Build the nested tree structure
	arr.forEach(item => {
		if (item.parent_id) {
			// If it has a parent, add it to the parent's children
			flatMap[item.parent_id].children?.push(flatMap[item.id])
		} else {
			// If it doesn't have a parent, it's a root level item
			nestedTree[item.id] = flatMap[item.id]
		}
	})

	return Object.values(nestedTree)
}

export const convertFilesToContainerTrees = (data: { path: string, content: string }[]) => {
	const result: {
		[name: string]: FileNode | DirectoryNode;
	} = {};

	data.forEach(({ path, content }) => {
		const pathParts = path.split('/').filter(part => part !== ''); // Split the path and remove empty parts

		let currentLevel = result;
		for (let i = 0; i < pathParts.length; i++) {
			const part = pathParts[i];
			if (!currentLevel[part]) {
				if (i === pathParts.length - 1) {
					currentLevel[part] = { file: { contents: content } };
				} else {
					currentLevel[part] = { directory: {} };
				}
			}
			//@ts-ignore
			currentLevel = currentLevel[part].directory;
		}
	});

	return result;
};