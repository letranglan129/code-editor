import { uuidv4 } from './strings';
import { FileDataType } from './types';

export function convertToHierarchy(files: { path: string; content: string }[], rootId: string) {
	let result: Partial<FileDataType> = {}

	files.forEach(file => {
		const parts = file.path.split('/')
		let currentLevel = result

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i]
			const isLast = i === parts.length - 1

			let existingFolder = currentLevel.children?.find(item => item.name === part)

			if (!existingFolder) {
				existingFolder = {
					id: uuidv4(),
					project_id: 1,
					parent_id: currentLevel.id || rootId,
					name: part,
					type: isLast ? 'file' : 'folder',
					content: isLast ? file.content : null,
					children: undefined,
				}
				currentLevel.children = [...(currentLevel.children || [])]
				currentLevel.children.push(existingFolder)
			}

			currentLevel = existingFolder
		}
	})

	return result.children
}
