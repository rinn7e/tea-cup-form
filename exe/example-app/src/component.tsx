import * as Form from '@rinn7e/tea-cup-form'
import { formView } from '@rinn7e/tea-cup-form'
import React from 'react'
import { Dispatcher } from 'tea-cup-fp'

import { Model, Msg } from './type'

export const view = (dispatch: Dispatcher<Msg>, model: Model) => {
  const renderField = (key: string) => {
    const field = model.form.forms.get(key)
    if (!field) return null
    return (
      <div className='mb-4'>
        {formView(
          key,
          field,
          (subMsg) => dispatch({ _tag: 'FormMsg', subMsg }),
          model.form,
        )}
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-2xl p-8'>
      <h1 className='mb-8 text-3xl font-bold'>TeaCup Form Kitchen Sink</h1>

      <div className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'>
        {renderField('text')}
        {renderField('pill')}
        <div className='my-6 border-t border-gray-100'></div>
        {renderField('checkbox')}
        <div className='my-6 border-t border-gray-100'></div>
        {renderField('radio')}
        <div className='my-6 border-t border-gray-100'></div>
        {renderField('dropdown')}
        {renderField('calendar')}
        {renderField('file')}

        <button
          onClick={() => dispatch({ _tag: 'Submit' })}
          className='mt-6 w-full rounded-lg bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700'
        >
          Submit
        </button>
      </div>

      {model.submittedValues && (
        <div className='mt-8 overflow-auto rounded-xl bg-gray-900 p-6 text-green-400'>
          <h2 className='mb-4 font-bold text-white'>Submitted Values:</h2>
          <pre>{model.submittedValues}</pre>
        </div>
      )}
    </div>
  )
}
