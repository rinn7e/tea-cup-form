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
import * as E from 'fp-ts/lib/Either'
import { type Either } from 'fp-ts/lib/Either'
import * as M from 'fp-ts/lib/Map'
import * as O from 'fp-ts/lib/Option'
import { type Option } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'
import * as S from 'fp-ts/lib/string'
import { type JSX } from 'react'
import DatePicker from 'react-datepicker'
import { Dispatcher } from 'tea-cup-fp'

import { errorPopupContainer } from '@/error-popup/helper'
import { radioView } from '@/shared/form-ui'
import { emptyEl, exec, limitDecimal2Digit, mkIdFromString, modifyAtIfExist } from '@/util/util'
import {
  CustomTextInputProps,
  Password,
  type CheckboxChoice,
  type CheckboxType,
  type CheckboxTypeUiArg,
  type DropdownType,
  type DropdownTypeUiArg,
  type FileType,
  type FormType,
  type Model,
  type Msg,
  type RadioChoice,
  type RadioType,
  type RadioTypeUiArg,
  type TextType,
} from './type'
import { runValidationAndLink } from './validation'

import 'react-datepicker/dist/react-datepicker.css'; // Custom CSS for calendar
import './form.css'

// UI for individual input field
// Model is needed to do validation on input field that depend on another input field
export const formView = (
  key: string,
  val: FormType,
  dispatch: Dispatcher<Msg>,
  model: Model,
) => {
  switch (val._tag) {
    case 'TextType': {
      const validationResult = runValidationAndLink(val, model.forms)

      return val.ui({
        key,
        dispatch,
        label: val.label,
        validationResult,
        isFocus: val.isFocus,
        placeholder: val.placeholder,
        validation: val.validation,
        currentValue: val.currentValue,
        showValidation: val.showValidation,
        isPassword: val.isPassword,
      })
    }
    case 'CalendarType': {
      const validationResult = val.validation(val.currentValue)
      const inputElement = (
        <div className='flex flex-row'>
          <DatePicker
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={100}
            maxDate={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
            }
            selected={val.currentValue}
            placeholderText={val.isFocus ? 'DD.MM.YYYY' : ''}
            dateFormat='dd.MM.yyyy'
            onChange={(date) =>
              dispatch({ _tag: 'UpdateCalendar', key, value: date })
            }
            onFocus={(_) =>
              dispatch({ _tag: 'HandleFocus', key, isFocus: true })
            }
            onBlur={(_) =>
              dispatch({ _tag: 'HandleFocus', key, isFocus: false })
            }
          />
          <div className='relative'>
            <div className='absolute right-0 pointer-events-none'>
              <div className='py-[15px] px-[12px] flex items-center cursor-pointer opacity-40 hover:opacity-50'>
                <div style={{ width: '22px' }}>
                  <img src='../../assets/icons/calendar.svg' alt='calendar' />
                </div>
              </div>
            </div>
          </div>
        </div>
      )

      return inputBoxView(
        dispatch,
        key,
        { ...val },
        validationResult,
        inputElement,
        emptyEl,
      )
    }
    case 'DropdownType': {
      const validationResult = val.validation(val.currentValue)
      return val.ui({
        fieldKey: key,
        dispatch,
        label: val.label,
        choices: val.choices,
        validationResult,
        isFocus: val.isFocus,
        placeholder: val.placeholder,
        validation: val.validation,
        currentValue: val.currentValue,
        showValidation: val.showValidation,
      })
    }
    case 'CheckboxType': {
      const results = pipe(
        val.currentValues,
        A.map((checkboxChoice) => {
          return val.ui({
            dispatch,
            fieldKey: key,
            checkboxChoice,
            isMarkdown: val.isMarkdown,
          })
        }),
      )
      return (
        <div id={val._tag} className='flex flex-col gap-[16px]'>
          {results}
        </div>
      )
    }
    case 'RadioType': {
      const results = pipe(
        val.choices,
        A.map((radioChoice) => {
          const isActive =
            val.currentValue._tag === 'Some' &&
            val.currentValue.value === radioChoice.key
          return val.ui({
            dispatch,
            fieldKey: key,
            radioChoice,
            isActive,
          })
        }),
      )
      return (
        <div id={val._tag} className='flex flex-col gap-[16px]'>
          {results}
        </div>
      )
    }

    case 'FileType': {
      const currentFilesView = (): JSX.Element[] => {
        if (val.currentValues.length) {
          const results = pipe(
            val.currentValues,
            A.mapWithIndex((i, file) => {
              return (
                <div className='flex gap-4'>
                  <div>
                    <img
                      className='object-contain'
                      src={URL.createObjectURL(file)}
                      style={{ height: '42px', width: '60px' }}
                    />
                  </div>
                  <div className='grow' style={{ maxWidth: '257px' }}>
                    <p className='overflow-hidden'>{file.name}</p>
                    <div className='flex text-sm opacity-40'>
                      <p>{limitDecimal2Digit(file.size / 1000)} KB</p>.ui
                      <p className='font-semibold px-2'>⋅</p>
                      <p className='uppercase'>{file.type}</p>
                    </div>
                  </div>
                  <div
                    className='cursor-pointer'
                    onClick={() =>
                      dispatch({ _tag: 'RemoveFile', key, index: i })
                    }
                  >
                    <img
                      src='../../assets/icons/upload-cross.svg'
                      alt='upload-cross'
                    />
                  </div>
                </div>
              )
            }),
          )
          return results
        } else return []
      }

      const validationResult = val.validation(val.currentValues)

      const dropZoneView = val.ui(
        dispatch,
        key,
        validationResult,
        val.isMultiple,
        model.isDrag,
      )

      const showValidation =
        validationResult._tag == 'Left' && val.showValidation
          ? O.some(validationResult.left)
          : O.none

      return (
        <div className='flex flex-col'>
          <div className='flex flex-col items-center justify-stretch gap-6'>
            {dropZoneView}
            {currentFilesView()}
          </div>

          {errorPopupContainer(showValidation, 'bottom', () =>
            dispatch({ _tag: 'HideValidation', key }),
          )}
        </div>
      )
    }
    default:
      return <div>Internal error: form item not found</div>
  }
}

// Helper

export const disableInputView = (arg: {
  label: string
  val: string
  icon: Option<string>
}) => {
  const popup = () => (
    <div className='flex flex-col items-center text-base'>
      <div className='py-1.5 px-2 bg-sk-dark text-white rounded drop-shadow-lg z-10'>
        <p className='text-center whitespace-pre-line'>
          Contact Us
        </p>
      </div>
      <div className='relative'>
        <div
          className='absolute arrow-down z-20'
          style={{ borderTop: '6px solid rgba(42, 40, 46, 1)' }}
        ></div>
      </div>
    </div>
  )
  return (
    <div className='group bg-sk-dark-05 border border-transparent'>
      {/* Popup */}
      <div className='hidden group-hover:block w-full relative'>
        <div className='w-full absolute' style={{ bottom: '10px' }}>
          <div className='w-full flex flex-col items-center'>{popup()}</div>
        </div>
      </div>

      {/* Input box */}
      <div className='py-[6px] px-[12px] flex items-center'>
        <div>
          <div className='text-[12px] leading-[14px] text-sk-dark-50'>
            {arg.label}
          </div>
          <div className='text-[16px] leading-[24px] text-sk-dark-50'>
            {arg.val}
          </div>
        </div>
        <div className='grow'></div>
        {arg.icon._tag === 'Some' ? (
          <div className='opacity-30' style={{ width: '22px' }}>
            <img
              src={`../../assets/icons/${arg.icon.value}.svg`}
              alt={arg.icon.value}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

export const lookupWithDefaultHtml = (
  formEls: Map<string, JSX.Element | null>,
  key: string,
) => {
  const result = M.lookup(S.Ord)(key)(formEls)
  switch (result._tag) {
    case 'Some':
      return result.value
    default:
      return <div>Internal error</div>
  }
}

// Add files to the file input form
export const addFiles = (
  msg: { key: string },
  model: Model,
  files: FileList | null | undefined,
): Model => {
  const newForm = exec(() => {
    if (files) {
      return pipe(
        model.forms,
        modifyAtIfExist(S.Eq)(msg.key, (form) => {
          if (form._tag === 'FileType')
            return {
              ...form,
              currentValues: form.currentValues.concat(toFileArray(files)),
              showValidation: true,
            } as FileType
          else {
            console.log('FileType: Try to update a field that is not FileType')
            return form
          }
        }),
      )
    } else return model.forms
  })

  return { ...model, forms: newForm }
}

// Helper convert `FileList` to array.
const toFileArray = (files: FileList): File[] => {
  const a = [] as File[]
  for (let i = 0; i < files.length; i++) {
    a[i] = files[i]
  }
  return a
}

// Generic input box, which is used for textType, dropdown, calendar ...
const inputBoxView = <A,>(
  dispatch: (msg: Msg) => void,
  key: string,
  val: {
    label: string
    validation: (input: A) => Either<string, A>
    currentValue: A
    showValidation: boolean
    isFocus: boolean
  },
  validationResult: Either<string, A>,
  inputElement: JSX.Element,
  dropdownElement: JSX.Element,
) => {
  const [borderStyle, labelColor, showValidation] =
    validationResult._tag == 'Left' && val.showValidation
      ? [
          'border-sk-red focus-within:border-sk-red',
          'text-sk-red',
          O.some(validationResult.left),
        ]
      : [
          'border-sk-dark-20 focus-within:border-sk-dark-70',
          'text-sk-dark',
          O.none,
        ]

  return (
    <div key={key} className='flex flex-col w-full'>
      {errorPopupContainer(showValidation, 'top', () =>
        dispatch({ _tag: 'HideValidation', key }),
      )}

      <div className={`flex flex-col border ${borderStyle}`}>
        <div className='relative'>
          <p
            className={
              `${labelColor} z-10 transition-all pointer-events-none absolute px-3 ` +
              (val.isFocus ||
              (val.currentValue !== '' && val.currentValue !== null)
                ? ' text-xs pt-1.5 opacity-100'
                : ' text-base pt-3.5 opacity-50')
            }
          >
            {val.label}
          </p>
        </div>
        {inputElement}
      </div>

      {dropdownElement}
    </div>
  )
}

// Input box for text type
export const defaultTextView = (
  dispatch: (msg: Msg) => void,
  isPassword: Option<Password>,
  key: string,
  currentValue: string,
  label: string,
  showValidation: boolean,
  isFocus: boolean,
  validation: (input: string) => Either<string, string>,
  validationResult: Either<string, string>,
): JSX.Element | null => {
  const inputElement = (
    <div className='flex flex-row'>
      <input
        style={{ paddingBottom: '6px', paddingTop: '22px' }}
        type={
          isPassword._tag === 'Some' &&
          isPassword.value.revealPassword === false
            ? 'password'
            : 'text'
        }
        className='outline-none w-full px-3'
        value={currentValue}
        onInput={(event) => dispatch({ _tag: 'UpdateForm', key, event })}
        onFocus={(_) => dispatch({ _tag: 'HandleFocus', key, isFocus: true })}
        onBlur={(_) => dispatch({ _tag: 'HandleFocus', key, isFocus: false })}
        name={label}
        autoComplete={
          isPassword._tag === 'Some' && isPassword.value.disableAutocomplete
            ? 'new-password'
            : 'true'
        }
      />
      {exec(() => {
        if (isPassword._tag === 'Some') {
          return (
            <div
              className='p-3 flex items-center cursor-pointer opacity-100'
              onClick={(event) =>
                dispatch({
                  _tag: 'RevealPassword',
                  key,
                  revealed: !isPassword.value,
                  event,
                })
              }
            >
              <div style={{ width: '22px' }}>
                {isPassword.value ? (
                  <img
                    src='../../assets/icons/password-visible.svg'
                    alt='password'
                  />
                ) : (
                  <img
                    src='../../assets/icons/password-hidden.svg'
                    alt='password'
                  />
                )}
              </div>
            </div>
          )
        } else return null
      })}
    </div>
  )
  return inputBoxView(
    dispatch,
    key,
    {
      label,
      validation,
      currentValue,
      showValidation,
      isFocus,
    },
    validationResult,
    inputElement,
    emptyEl,
  )
}

export const defaultTextType = (
  inputUi: (props: CustomTextInputProps) => JSX.Element | null,
): TextType => ({
  _tag: 'TextType',
  placeholder: 'Username',
  label: 'Username',
  currentValue: '',
  validation: (val) => E.right(val),
  linkValidations: [],
  showValidation: false,
  isTextarea: false,
  isFocus: false,
  isPassword: O.none,
  ui: inputUi,
})

export const defaultCheckboxType = (
  currentValues: CheckboxChoice[],
  inputUi: ((arg: CheckboxTypeUiArg) => JSX.Element) | null,
): CheckboxType => {
  return {
    _tag: 'CheckboxType',
    currentValues,
    validation: (inputs) => E.right(inputs),
    isMarkdown: false,
    ui: inputUi
      ? inputUi
      : (arg: CheckboxTypeUiArg) => {
          const [key, val] = arg.checkboxChoice
          return (
            <div
              id={mkIdFromString(key)}
              key={key}
              className={`cursor-pointer flex flex-row ${
                arg.isMarkdown ? 'items-start' : 'items-center'
              }`}
              onClick={(_) =>
                arg.dispatch({
                  _tag: 'ToggleCheckbox',
                  key: arg.fieldKey,
                  checkbox_key: key,
                  value: !val,
                })
              }
            >
              <div
                className={`${
                  arg.isMarkdown ? 'pt-[4px] ' : ''
                } shrink-0 transition-all block cursor-pointer opacity-70 hover:opacity-100`}
              >
                <div
                  className={`${
                    val ? 'block' : 'hidden'
                  } shrink-0 w-[16px] h-[16px] border border-jj-blue-200 rounded-[2px] hover:border-jj-blue-300 cursor-pointer flex items-center justify-center bg-jj-blue-200 hover:bg-jj-blue-300`}
                >
                  <div className='w-[14px] h-[14px] text-[14px] icon-check-small text-white'></div>
                </div>
                <div
                  className={`${
                    !val ? 'block' : 'hidden'
                  } shrink-0 w-[16px] h-[16px] border border-jj-dark-10 rounded-[2px] hover:border-jj-blue-200 cursor-pointer`}
                ></div>
              </div>
              <p className='pl-4'>
                {arg.isMarkdown ? (
                  // isMarkdown is only supported in `haskell-certification`
                  <div>{key}</div>
                ) : (
                  <div>{key}</div>
                )}
              </p>
            </div>
          )
        },
  }
}

export const defaultRadioType = (
  choices: RadioChoice[],
  currentValue: Option<string>,
  inputUi: ((arg: RadioTypeUiArg) => JSX.Element) | null,
): RadioType => {
  return {
    _tag: 'RadioType',
    choices,
    currentValue,
    isMarkdown: true,
    ui: inputUi
      ? inputUi
      : (arg: RadioTypeUiArg) => {
          return (
            <div
              id={mkIdFromString(arg.radioChoice.key)}
              key={arg.radioChoice.key}
              className='cursor-pointer flex flex-row items-start'
              onClick={(_) =>
                arg.dispatch({
                  _tag: 'UpdateRadio',
                  key: arg.fieldKey,
                  radio_key: arg.radioChoice.key,
                  allowUnselected: false,
                })
              }
            >
              <div className='shrink-0 pt-[4px] transition-all block cursor-pointer opacity-70 hover:opacity-100'>
                <div className={arg.isActive ? 'block' : 'hidden'}>
                  {radioView(true, () => null)}
                </div>
                <div className={!arg.isActive ? 'block' : 'hidden'}>
                  {radioView(false, () => null)}
                </div>
              </div>
              <p className='pl-4'>
                <div>{arg.radioChoice.label}</div>
              </p>
            </div>
          )
        },
  }
}

export const defaultDropdownType = (): DropdownType => ({
  _tag: 'DropdownType',
  label: 'Country',
  choices: ['Cambodia', 'Russia'],
  currentValue: null,
  validation: (val) => E.right(val),
  showValidation: false,
  isFocus: false,
  placeholder: 'Select a value',
  ui: ({
    dispatch,
    label,
    currentValue,
    fieldKey,
    isFocus,
    choices,
    validationResult,
    validation,
    showValidation,
  }: DropdownTypeUiArg) => {
    const inputElement = (
      <div className='flex flex-col'>
        <div className='flex flex-row'>
          <input
            id={mkIdFromString(label)} // id shouldn't have space
            style={{ paddingBottom: '6px', paddingTop: '22px' }}
            className='outline-none w-full px-3 cursor-pointer'
            value={currentValue ? currentValue : ''}
            onKeyDown={(event) => event.preventDefault()}
            onClick={(_) =>
              dispatch({ _tag: 'HandleFocus', key: fieldKey, isFocus: true })
            }
            onFocus={(_) =>
              dispatch({ _tag: 'HandleFocus', key: fieldKey, isFocus: true })
            }
            onBlur={(_) =>
              dispatch({ _tag: 'HandleFocus', key: fieldKey, isFocus: false })
            }
          />
          <div className='relative'>
            <div className='absolute right-0 pointer-events-none'>
              <div className='pr-3 pt-5 flex items-center cursor-pointer opacity-30'>
                <div style={{ width: '18px' }}>
                  <img
                    style={{ width: '18px' }}
                    src='../../assets/icons/chevron-down.svg'
                    alt='chevron-down'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )

    const dropdownElement = isFocus ? (
      <div className='relative'>
        <div className='absolute w-full z-20' style={{ top: '10px' }}>
          <div className='bg-white rounded-md shadow-lg overflow-hidden'>
            <div
              className='overflow-scroll scrollbar scrollbar-w-[8px] scrollbar-h-[8px] scrollbar-thumb-jj-dark-30'
              style={{ maxHeight: '350px' }}
            >
              {pipe(
                choices,
                A.map((choice) => (
                  <div
                    id={mkIdFromString(choice)}
                    key={choice}
                    className='px-4 py-5 cursor-pointer hover:bg-sk-dark-20 transition-all'
                    onMouseDown={(event) =>
                      dispatch({
                        _tag: 'UpdateDropdownType',
                        key: fieldKey,
                        value: choice,
                        event,
                      })
                    }
                  >
                    {choice}
                  </div>
                )),
              )}
            </div>
          </div>
        </div>
      </div>
    ) : (
      emptyEl
    )

    return inputBoxView<string | null>(
      dispatch,
      fieldKey,
      { label, currentValue, validation, isFocus, showValidation },
      validationResult,
      inputElement,
      dropdownElement,
    )
  },
})
