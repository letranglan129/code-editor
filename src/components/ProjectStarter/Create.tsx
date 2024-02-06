import 'devextreme-react/file-uploader'
import 'devextreme-react/autocomplete'
import Form, { GroupItem, RequiredRule, Item, ButtonItem } from 'devextreme-react/form'
import { RequiredRule as ValidatorRequiredRule } from 'devextreme-react/validator'
import { FormEvent, useRef } from 'react'
import { useOption } from '../../contexts/Option/hooks'
import 'devextreme-react/text-area'
import 'devextreme-react/tag-box'
import 'devextreme-react/file-uploader'
import axios from 'axios'
import zip from 'jszip'
import { convertToHierarchy } from '../../utils/filesToJson'
import { isMediaFile, uuidv4 } from '../../utils/strings'

export default function Create() {
	const { types, cores, icons } = useOption()
	const formRef = useRef<Form>(null)

	const onFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		const formData = formRef.current?.instance.option('formData')

		async function handleFile(f: File) {
			const fileUnzipped = await zip.loadAsync(f)
			return Promise.all(
				Object.keys(fileUnzipped.files).map(async fileName => {
					const content = await fileUnzipped
						?.file(fileName)
						?.async(isMediaFile(fileName) ? 'base64' : 'string')
					return { path: fileName, content }
				}),
			)
		}

		const rootUuid = uuidv4()

		const fileStruct = await handleFile(formData.file[0])
		const fileStructFilter = fileStruct.filter(f => f.content !== undefined)
		const aData = convertToHierarchy(fileStructFilter as { path: string; content: string }[], rootUuid)

		await axios.post('/api/admin/projects/starter', {
			...formData,
			file: [
				{
					id: rootUuid,
					project_id: Number(new Date()),
					parent_id: null,
					name: 'project',
					type: 'folder',
					content: null,
					children: aData,
				},
			],
		})
	}

	return (
		<form onSubmit={onFormSubmit}>
			<Form
				ref={formRef}
				formData={{
					level: 1,
				}}
				validationGroup="customerData"
			>
				<GroupItem caption="Credentials">
					<Item
						dataField="title"
						editorType="dxTextBox"
						editorOptions={{
							placeholder: 'Title...',
						}}
					>
						<RequiredRule message="Title is required" />
					</Item>

					<Item
						dataField="description"
						editorType="dxTextArea"
						editorOptions={{
							height: 90,
						}}
					>
						<RequiredRule message="Description is required" />
					</Item>

					<Item
						dataField="type"
						editorType="dxTagBox"
						editorOptions={{
							placeholder: 'ex: react, javascript...',
							items: types,
						}}
					>
						<RequiredRule message="Type is required" />
					</Item>

					<Item
						dataField="core"
						editorType="dxAutocomplete"
						editorOptions={{
							placeholder: 'ex: Vite',
							dataSource: cores,
							minSearchLength: 0,
							opened: true,
							openOnFieldClick: true,
						}}
					>
						<RequiredRule message="Core is required" />
					</Item>
					<Item dataField="level" editorType="dxNumberBox" editorOptions={{}}>
						<RequiredRule message="Level is required" />
					</Item>
					<Item
						dataField="slug"
						editorType="dxTextBox"
						editorOptions={{
							placeholder: 'Slug...',
						}}
					>
						<RequiredRule message="Slug is required" />
					</Item>
					<Item
						dataField="cmdStartup"
						editorType="dxTextBox"
						editorOptions={{
							placeholder: 'ex: npm install && npm run dev',
						}}
					>
						<RequiredRule message="Cmd Starup is required" />
					</Item>
					<Item
						dataField="icon"
						editorType="dxSelectBox"
						editorOptions={{
							placeholder: 'ex: react',
							items: icons,
						}}
					>
						<RequiredRule message="Icon is required" />
					</Item>

					<Item
						dataField="file"
						editorType="dxFileUploader"
						editorOptions={{
							selectButtonText: 'Select file zip',
							labelText: '',
							name: 'file',
							multiple: false,
							accept: '.zip,.rar,.7zip',
							uploadMode: 'useForm',
							elementAttr: {
								class: 'file-uploader-no-paddding',
							},
							validationErrors: [ValidatorRequiredRule],
						}}
						isRequired={true}
					>
						<RequiredRule message="" />
					</Item>
					<ButtonItem
						buttonOptions={{
							text: 'Submit',
							type: 'success',
							useSubmitBehavior: true,
							width: '120px',
						}}
					/>
				</GroupItem>
			</Form>
		</form>
	)
}
