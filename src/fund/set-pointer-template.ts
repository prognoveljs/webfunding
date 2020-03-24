import { checkWeight, setPointerMultiple } from './set-pointer-multiple'
import { setPointerSingle } from './set-pointer-single'
import { noTemplateFound, noDataFundIsFound, templateSinglePointerHasWeight } from './errors'

export function setPointerFromTemplates(): void {
  const pointers: WMPointer[] = scrapeTemplate()

  if (pointers.length > 1) {
    setPointerMultiple(pointers)
  } else if (pointers.length === 1) {
    setPointerSingle(pointers[0].address)
    if (typeof pointers[0] !== 'string') {
      console.warn(templateSinglePointerHasWeight)
    }
  } else {
    console.warn('Pointer from template is undefined.')
  }
}

export function scrapeTemplate(): WMPointer[] {
  const templates: NodeListOf<HTMLMetaElement> = document.body.querySelectorAll('template[data-fund]');
  let pointers: WMPointer[] = [];

  if (templates.length > 0) {
    templates.forEach(template => {
      const pointer: WMPointer = parseTemplate(template)
      pointers = [...pointers, pointer]
    })
  } else {
    throw new Error(noTemplateFound)
  }

  return pointers
}

export function parseTemplate(template: any): WMPointer {
  let address: string = template.dataset.fund
  let weight: number = parseInt(template.dataset.fundWeight)

  if (!address) {
    throw new Error(noDataFundIsFound)
  }

  const pointer: WMPointer = checkWeight({
    address,
    weight
  })

  console.table(pointer)

  return pointer
}