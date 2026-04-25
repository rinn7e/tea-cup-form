import * as Form from '@rinn7e/tea-cup-form'
import {
  lookupForm,
  valueCalendarType,
  valueDropdownType,
  valueFileType,
  valuePillTextType,
  valueTextType,
} from '@rinn7e/tea-cup-form'
import * as O from 'fp-ts/lib/Option'
import { Cmd } from 'tea-cup-fp'

import { Model, Msg } from './type'

export const init = (): [Model, Cmd<Msg>] => {
  const forms: Form.Forms = new Map<string, Form.FormType>([
    ['text', Form.defaultTextType()],
    ['pill', Form.defaultTextPillType()],
    [
      'checkbox',
      Form.defaultCheckboxType(
        [
          ['Option 1', false],
          ['Option 2', true],
        ],
        null,
      ),
    ],
    [
      'radio',
      Form.defaultRadioType(
        [
          { key: 'r1', label: 'Radio 1', desc: '' },
          { key: 'r2', label: 'Radio 2', desc: '' },
        ],
        O.none,
        null,
      ),
    ],
    ['dropdown', Form.defaultDropdownType()],
    ['calendar', Form.defaultCalendarType()],
    ['file', Form.defaultFileType()],
  ])

  return [
    {
      form: Form.init(forms),
      submittedValues: null,
    },
    Cmd.none(),
  ]
}

export const update = (msg: Msg, model: Model): [Model, Cmd<Msg>] => {
  switch (msg._tag) {
    case 'FormMsg':
      return [
        { ...model, form: Form.update(msg.subMsg)(model.form) },
        Cmd.none(),
      ]
    case 'Submit': {
      const f = model.form.forms
      const values = {
        text: valueTextType(lookupForm('text', f)),
        pill: valuePillTextType(lookupForm('pill', f)),
        dropdown: valueDropdownType(lookupForm('dropdown', f)),
        calendar: valueCalendarType(lookupForm('calendar', f))?.toISOString(),
        files: valueFileType(lookupForm('file', f)).map((f) => f.name),
      }
      return [
        { ...model, submittedValues: JSON.stringify(values, null, 2) },
        Cmd.none(),
      ]
    }
  }
}
