/* MIT License

Copyright (c) 2025 Moremi Vannak

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE. */

import * as A from 'fp-ts/lib/Array'
import * as B from 'fp-ts/lib/boolean'
import * as D from 'fp-ts/lib/Date'
import { type Either } from 'fp-ts/lib/Either'
import * as EqClass from 'fp-ts/lib/Eq'
import * as Map from 'fp-ts/lib/Map'
import * as O from 'fp-ts/lib/Option'
import { type Option } from 'fp-ts/lib/Option'
import * as S from 'fp-ts/lib/string'
import { type FormEvent, type JSX, type MouseEvent } from 'react'
import { Dispatcher } from 'tea-cup-fp'

import { NullableEq } from '@/util/util'

export type Password = {
  revealPassword: boolean
  disableAutocomplete: boolean
}

export const PasswordEq = EqClass.struct<Password>({
  revealPassword: B.Eq,
  disableAutocomplete: B.Eq,
})

export type TextType = {
  _tag: 'TextType'
  placeholder: string
  label: string
  currentValue: string
  validation: (input: string) => Either<string, string>
  linkValidations: {
    linkKey: string
    validation: (
      currentInput: string,
      linkInput: string,
    ) => Either<string, string>
  }[]
  // ^ Validate the current input field with another input field (ie. repeat-password)
  showValidation: boolean
  isTextarea: boolean
  isPassword: Option<Password>
  isFocus: boolean
  ui: (props: CustomTextInputProps) => JSX.Element | null
}

export const TextTypeEq = EqClass.struct<TextType>({
  _tag: S.Eq,
  placeholder: { equals: () => true },
  label: { equals: () => true },
  currentValue: S.Eq,
  validation: { equals: () => true },
  linkValidations: { equals: () => true },
  showValidation: B.Eq,
  isTextarea: { equals: () => true },
  isPassword: O.getEq(PasswordEq),
  isFocus: B.Eq,
  ui: { equals: () => true },
})

export type CheckboxChoice = [string, boolean]
export const CheckboxChoiceEq = EqClass.tuple(S.Eq, B.Eq)

export type CheckboxTypeUiArg = {
  dispatch: (msg: Msg) => void
  fieldKey: string
  checkboxChoice: CheckboxChoice
  isMarkdown: boolean
}

export type CheckboxType = {
  _tag: 'CheckboxType'
  currentValues: CheckboxChoice[] // Use array of tuple instead of map to maintain the order.
  validation: (input: CheckboxChoice[]) => Either<string, CheckboxChoice[]>
  isMarkdown: boolean // Option to render the text with markdown
  ui: (arg: CheckboxTypeUiArg) => JSX.Element
}

export const CheckboxTypeEq = EqClass.struct<CheckboxType>({
  _tag: S.Eq,
  currentValues: A.getEq(CheckboxChoiceEq),
  validation: { equals: () => true },
  isMarkdown: { equals: () => true },
  ui: { equals: () => true },
})

export type RadioChoice = { key: string; label: string; desc: string }
export const RadioChoiceEq = EqClass.struct<RadioChoice>({
  key: S.Eq,
  label: S.Eq,
  desc: S.Eq,
})

export type RadioTypeUiArg = {
  dispatch: (msg: Msg) => void
  fieldKey: string
  radioChoice: RadioChoice
  isActive: boolean
}

export type RadioType = {
  _tag: 'RadioType'
  choices: RadioChoice[]
  currentValue: Option<string>
  isMarkdown: boolean // Option to render the text with markdown
  ui: (arg: RadioTypeUiArg) => JSX.Element
}

export const RadioTypeEq = EqClass.struct<RadioType>({
  _tag: S.Eq,
  choices: A.getEq(RadioChoiceEq),
  currentValue: O.getEq(S.Eq),
  isMarkdown: { equals: () => true },
  ui: { equals: () => true },
})

export type DropdownTypeUiArg = {
  dispatch: (msg: Msg) => void
  label: string
  currentValue: string | null
  placeholder: string
  fieldKey: string
  isFocus: boolean
  choices: string[]
  validationResult: Either<string, string | null>
  validation: (input: string | null) => Either<string, string | null>
  showValidation: boolean
}

export type DropdownType = {
  _tag: 'DropdownType'
  label: string
  placeholder: string
  choices: string[]
  currentValue: string | null
  validation: (input: string | null) => Either<string, string | null>
  showValidation: boolean
  isFocus: boolean
  ui: (arg: DropdownTypeUiArg) => JSX.Element
}

export const DropdownTypeEq = EqClass.struct<DropdownType>({
  _tag: S.Eq,
  label: { equals: () => true },
  placeholder: { equals: () => true },
  choices: A.getEq(S.Eq),
  currentValue: NullableEq(S.Eq),
  validation: { equals: () => true },
  showValidation: { equals: () => true },
  isFocus: B.Eq,
  ui: { equals: () => true },
})

export type CalendarType = {
  _tag: 'CalendarType'
  label: string
  currentValue: Date | null
  validation: (input: Date | null) => Either<string, Date | null>
  showValidation: boolean
  isFocus: boolean
}

export const CalendarTypeEq = EqClass.struct<CalendarType>({
  _tag: S.Eq,
  label: { equals: () => true },
  currentValue: NullableEq(D.Eq),
  validation: { equals: () => true },
  showValidation: { equals: () => true },
  isFocus: B.Eq,
})

export type FileType = {
  _tag: 'FileType'
  currentValues: File[]
  isMultiple: boolean
  showValidation: boolean
  validation: (input: File[]) => Either<string, File[]>
  ui: (
    dispatch: (msg: Msg) => void,
    key: string,
    validation: Either<string, File[]>,
    isMultiple: boolean,
    isDrag: boolean,
  ) => JSX.Element | null
}

export const FileEq: EqClass.Eq<File> = { equals: (a, b) => a.name === b.name }

export const FileTypeEq = EqClass.struct<FileType>({
  _tag: S.Eq,
  currentValues: A.getEq(FileEq),
  isMultiple: { equals: () => true },
  showValidation: B.Eq,
  validation: { equals: () => true },
  ui: { equals: () => true },
})

export type FormType =
  | TextType
  | CheckboxType
  | RadioType
  | DropdownType
  | CalendarType
  | FileType

export const FormTypeEq: EqClass.Eq<FormType> = {
  equals: (x, y) => {
    if (x._tag === 'TextType' && y._tag === 'TextType')
      return TextTypeEq.equals(x, y)
    else if (x._tag === 'CheckboxType' && y._tag === 'CheckboxType')
      return CheckboxTypeEq.equals(x, y)
    else if (x._tag === 'RadioType' && y._tag === 'RadioType')
      return RadioTypeEq.equals(x, y)
    else if (x._tag === 'DropdownType' && y._tag === 'DropdownType')
      return DropdownTypeEq.equals(x, y)
    else if (x._tag === 'CalendarType' && y._tag === 'CalendarType')
      return CalendarTypeEq.equals(x, y)
    else if (x._tag === 'FileType' && y._tag === 'FileType')
      return FileTypeEq.equals(x, y)
    else return false
  },
}

export type Forms = Map<string, FormType>
export const FormsEq = Map.getEq(S.Eq, FormTypeEq)
export type Model = {
  forms: Forms
  isDrag: boolean
  // ^ global variable to check if mouse is dragging something
}

export const ModelEq = EqClass.struct<Model>({
  forms: FormsEq,
  isDrag: B.Eq,
})

export type Props = {
  field: string
  dispatch: Dispatcher<Msg>
  model: Model
}

export const PropEq = EqClass.struct<Props>({
  field: S.Eq,
  dispatch: { equals: () => true },
  model: ModelEq,
})

// Reducer

export type Msg =
  | {
      _tag: 'UpdateForm'
      key: string
      event: FormEvent<HTMLInputElement>
    }
  | {
      _tag: 'UpdateFormManual'
      key: string
      value: string
    }
  | { _tag: 'UpdateCalendar'; key: string; value: Date | null }
  | {
      _tag: 'UpdateDropdownType'
      key: string
      value: string
      event?: MouseEvent<HTMLDivElement>
    }
  | {
      _tag: 'ToggleCheckbox'
      key: string
      checkbox_key: string
      value: boolean
    }
  | {
      _tag: 'UpdateRadio'
      key: string
      radio_key: string
      allowUnselected: boolean
    }
  | {
      _tag: 'AddFile'
      key: string
      event: FormEvent<HTMLInputElement>
    }
  | {
      _tag: 'RemoveFile'
      key: string
      index: number
    }
  | { _tag: 'HandleFocus'; key: string; isFocus: boolean }
  | {
      _tag: 'RevealPassword'
      key: string
      revealed: boolean
      event: MouseEvent<HTMLElement>
    }
  | {
      _tag: 'HideValidation'
      key: string
    }
  | {
      _tag: 'SetIsDrag'
      status: boolean
    }
  | {
      _tag: 'ResetForm'
      value: Forms
    }
  | {
      _tag: 'AddFormItem'
      value: [string, FormType]
    }
  | {
      _tag: 'RemoveFormItem'
      value: string // key
    }

// helper types

export type CustomTextInputProps = {
  key: string
  label: string
  isFocus: boolean
  placeholder?: string
  currentValue: string
  showValidation: boolean
  dispatch: (msg: Msg) => void
  validationResult: Either<string, string>
  validation: (input: string) => Either<string, string>
  isPassword: Option<Password>
}
