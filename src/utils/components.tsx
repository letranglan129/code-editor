import { Component, ComponentDefinitionDefined, ComponentModelDefinition, Editor } from 'grapesjs'
import ReactDOMServer from 'next/dist/compiled/react-dom/cjs/react-dom-server-legacy.browser.development'

type ComponentDataType = {
    id: string
    isComponent?: (el: HTMLElement) => boolean | ComponentDefinitionDefined | undefined
    componentProps?: { [key: string]: any }
    models: (Partial<ComponentModelDefinition> & ThisType<ComponentModelDefinition & Component>) | undefined
    component: (...arg: any) => React.JSX.Element
}

export const addComponent = (editor: Editor, component: ComponentDataType) => {
    const ComponentBlock = component.component

    editor?.DomComponents.addType(component.id, {
        isComponent: component.isComponent,
        model: {
            ...component.models,
            defaults: {
                tagName: 'div',
                type: '',
                name: '',
                removable: true,
                draggable: true,
                droppable: true,
                badgable: true,
                stylable: true,
                'stylable-require': '',
                'style-signature': '',
                unstylable: '',
                highlightable: true,
                copyable: true,
                resizable: false,
                editable: false,
                layerable: true,
                selectable: true,
                hoverable: true,
                locked: false,
                void: false,
                state: '',
                status: '',
                content: '',
                icon: '',
                style: '',
                styles: '',
                classes: '',
                script: '',
                'script-props': '',
                'script-export': '',
                attributes: {},
                traits: ['id', 'title'],
                propagate: '',
                dmode: '',
                toolbar: null,
                ...(component?.models?.default || {}),
                components: ComponentBlock && ReactDOMServer.renderToString(<ComponentBlock { ...(component.componentProps || {}) } />),
            },
        },
    })
}

