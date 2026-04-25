import * as Form from '@rinn7e/tea-cup-form'

export type Model = {
  form: Form.Model
  submittedValues: string | null
}

export type Msg =
  | { _tag: 'FormMsg'; subMsg: Form.Msg }
  | { _tag: 'Submit' }
