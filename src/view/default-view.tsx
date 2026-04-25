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
import { type Either } from 'fp-ts/lib/Either'
import * as M from 'fp-ts/lib/Map'
import * as O from 'fp-ts/lib/Option'
import { type Option } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'
import * as S from 'fp-ts/lib/string'
import { type JSX } from 'react'
import DatePicker from 'react-datepicker'

import { errorTooltipContainer } from '../error-tooltip/helper'
import {
  type CalendarTypeUiArg,
  type CheckboxTypeUiArg,
  CustomTextInputProps,
  type CustomTextPillInputProps,
  type DropdownTypeUiArg,
  type Msg,
  type RadioTypeUiArg,
  autocompleteToString,
  textInputVariantToString,
} from '../type'
import { exec, mkIdFromString } from '../util/common'
import { emptyEl } from './common'

// Generic input box, which is used for textType, dropdown, calendar ...
export const inputBoxView = <A,>(
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
          'border-red-600 focus-within:border-red-600',
          'text-red-600',
          O.some(validationResult.left),
        ]
      : [
          'border-gray-200 focus-within:border-gray-700',
          'text-gray-900',
          O.none,
        ]

  return (
    <div key={key} className='flex w-full flex-col'>
      {errorTooltipContainer(showValidation, 'top', () =>
        dispatch({ _tag: 'HideValidation', key }),
      )}

      <div className={`flex flex-col border ${borderStyle}`}>
        <div className='relative'>
          <p
            className={
              `${labelColor} pointer-events-none absolute z-10 px-3 transition-all ` +
              (val.isFocus ||
              (val.currentValue !== '' && val.currentValue !== null)
                ? ' pt-1.5 text-xs opacity-100'
                : ' pt-3.5 text-base opacity-50')
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
export const defaultTextView = ({
  dispatch,
  variant,
  key,
  currentValue,
  label,
  showValidation,
  isFocus,
  validation,
  validationResult,
  autocomplete,
  onKeyDown,
}: CustomTextInputProps): JSX.Element => {
  const inputElement = (
    <div className='flex flex-row'>
      <input
        style={{ paddingBottom: '6px', paddingTop: '22px' }}
        type={textInputVariantToString(variant)}
        className='w-full px-3 outline-none'
        value={currentValue}
        onInput={(event) => dispatch({ _tag: 'UpdateForm', key, event })}
        onFocus={(_) => dispatch({ _tag: 'HandleFocus', key, isFocus: true })}
        onBlur={(_) => dispatch({ _tag: 'HandleFocus', key, isFocus: false })}
        onKeyDown={onKeyDown}
        name={label}
        autoComplete={autocompleteToString(autocomplete)}
      />
      {exec(() => {
        if (variant._tag === 'Password') {
          return (
            <div
              className='flex cursor-pointer items-center p-3 opacity-100'
              onClick={(event) =>
                dispatch({
                  _tag: 'SetRevealPassword',
                  key,
                  reveal: !variant.reveal,
                  event,
                })
              }
            >
              <div style={{ width: '22px' }}>
                {variant.reveal ? (
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
        } else return emptyEl()
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
    emptyEl(),
  )
}

export const radioView = (
  isSelected: boolean,
  onClick: (isSelected: boolean) => void,
) => {
  if (isSelected)
    return (
      <div
        className='flex size-[20px] shrink-0 cursor-pointer items-center justify-center rounded-full border border-blue-600 hover:border-blue-700 lg:size-[16px]'
        onClick={() => onClick(isSelected)}
      >
        <div className='size-[10px] rounded-full bg-blue-600 hover:bg-blue-700 lg:size-[8px]'></div>
      </div>
    )
  else
    return (
      <div
        className='size-[20px] shrink-0 cursor-pointer rounded-full border border-gray-300 hover:border-blue-600 lg:size-[16px]'
        onClick={() => onClick(isSelected)}
      ></div>
    )
}

export const defaultCheckboxView = (arg: CheckboxTypeUiArg) => {
  const [key, val] = arg.checkboxChoice
  return (
    <div
      id={mkIdFromString(key)}
      key={key}
      className={`flex cursor-pointer flex-row ${arg.isMarkdown ? 'items-start' : 'items-center'}`}
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
          arg.isMarkdown ? 'pt-[4px]' : ''
        } block shrink-0 cursor-pointer opacity-70 transition-all hover:opacity-100`}
      >
        <div
          className={`${
            val ? 'block' : 'hidden'
          } flex h-[16px] w-[16px] shrink-0 cursor-pointer items-center justify-center rounded-[2px] border border-blue-600 bg-blue-600 hover:border-blue-700 hover:bg-blue-700`}
        >
          <svg
            className='h-3 w-3 text-white'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={3}
              d='M5 13l4 4L19 7'
            />
          </svg>
        </div>
        <div
          className={`${
            !val ? 'block' : 'hidden'
          } h-[16px] w-[16px] shrink-0 cursor-pointer rounded-[2px] border border-gray-100 hover:border-blue-600`}
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
}

export const defaultRadioView = (arg: RadioTypeUiArg) => {
  return (
    <div
      id={mkIdFromString(arg.radioChoice.key)}
      key={arg.radioChoice.key}
      className='flex cursor-pointer flex-row items-start'
      onClick={(_) =>
        arg.dispatch({
          _tag: 'UpdateRadio',
          key: arg.fieldKey,
          radio_key: arg.radioChoice.key,
          allowUnselected: false,
        })
      }
    >
      <div className='block shrink-0 cursor-pointer pt-[4px] opacity-70 transition-all hover:opacity-100'>
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
}

export const defaultDropdownView = ({
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
          className='w-full cursor-pointer px-3 outline-none'
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
          <div className='pointer-events-none absolute right-0'>
            <div className='flex cursor-pointer items-center pt-5 pr-3 opacity-30'>
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
      <div className='absolute z-20 w-full' style={{ top: '10px' }}>
        <div className='overflow-hidden rounded-md bg-white shadow-lg'>
          <div className='overflow-scroll' style={{ maxHeight: '350px' }}>
            {pipe(
              choices,
              A.map((choice) => (
                <div
                  id={mkIdFromString(choice)}
                  key={choice}
                  className='cursor-pointer px-4 py-5 transition-all hover:bg-gray-100'
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
    emptyEl()
  )

  return inputBoxView<string | null>(
    dispatch,
    fieldKey,
    { label, currentValue, validation, isFocus, showValidation },
    validationResult,
    inputElement,
    dropdownElement,
  )
}

export const disableInputView = (arg: {
  label: string
  val: string
  icon: Option<string>
}) => {
  const popup = () => (
    <div className='flex flex-col items-center text-base'>
      <div className='z-10 rounded bg-gray-900 px-2 py-1.5 text-white drop-shadow-lg'>
        <p className='text-center whitespace-pre-line'>Contact Us</p>
      </div>
      <div className='relative'>
        <div
          className='absolute z-20'
          style={{
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '6px solid #111827',
          }}
        ></div>
      </div>
    </div>
  )
  return (
    <div className='group border border-transparent bg-gray-50'>
      {/* Popup */}
      <div className='relative hidden w-full group-hover:block'>
        <div className='absolute w-full' style={{ bottom: '10px' }}>
          <div className='flex w-full flex-col items-center'>{popup()}</div>
        </div>
      </div>

      {/* Input box */}
      <div className='flex items-center px-[12px] py-[6px]'>
        <div>
          <div className='text-[12px] leading-[14px] text-gray-500'>
            {arg.label}
          </div>
          <div className='text-[16px] leading-[24px] text-gray-500'>
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

export const defaultCalendarView = ({
  dispatch,
  fieldKey,
  label,
  currentValue,
  isFocus,
  validationResult,
  showValidation,
  validation,
}: CalendarTypeUiArg) => {
  const inputElement = (
    <div className='flex flex-row'>
      <DatePicker
        showYearDropdown
        scrollableYearDropdown
        yearDropdownItemNumber={100}
        maxDate={
          new Date(new Date().setFullYear(new Date().getFullYear() - 18))
        }
        selected={currentValue}
        placeholderText={isFocus ? 'DD.MM.YYYY' : ''}
        dateFormat='dd.MM.yyyy'
        onChange={(date) =>
          dispatch({ _tag: 'UpdateCalendar', key: fieldKey, value: date })
        }
        onFocus={(_) =>
          dispatch({ _tag: 'HandleFocus', key: fieldKey, isFocus: true })
        }
        onBlur={(_) =>
          dispatch({ _tag: 'HandleFocus', key: fieldKey, isFocus: false })
        }
      />
      <div className='relative'>
        <div className='pointer-events-none absolute right-0'>
          <div className='flex cursor-pointer items-center px-[12px] py-[15px] opacity-40 hover:opacity-50'>
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
    fieldKey,
    { label, currentValue, validation, isFocus, showValidation },
    validationResult,
    inputElement,
    emptyEl(),
  )
}

export const defaultFileView = (
  dispatch: (msg: Msg) => void,
  key: string,
  validation: Either<string, File[]>,
  isMultiple: boolean,
  isDrag: boolean,
) => {
  return (
    <div
      className={`relative flex min-h-[150px] w-full flex-col items-center justify-center rounded-[4px] border-2 border-dashed transition-all ${
        isDrag
          ? 'border-blue-600 bg-blue-50'
          : validation._tag == 'Left'
            ? 'border-red-600 bg-red-50'
            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
      }`}
    >
      <input
        type='file'
        multiple={isMultiple}
        className='absolute inset-0 h-full w-full cursor-pointer opacity-0'
        onInput={(event) => dispatch({ _tag: 'AddFile', key, event })}
      />
      <div className='pointer-events-none flex flex-col items-center gap-2'>
        <div className='opacity-40'>
          <img src='../../assets/icons/upload.svg' alt='upload' />
        </div>
        <div className='flex flex-col items-center'>
          <p className='text-base font-medium text-gray-700'>
            Click or drag file to this area to upload
          </p>
          <p className='text-sm text-gray-500'>
            Support for a single or bulk upload. Strictly prohibit from
            uploading company data or other band files
          </p>
        </div>
      </div>
    </div>
  )
}

export const defaultTextPillView = ({
  dispatch,
  key,
  currentValue,
  label,
  showValidation,
  isFocus,
  validation,
  validationResult,
  autocomplete,
  allValues,
}: CustomTextPillInputProps): JSX.Element => {
  const inputElement = (
    <div className='flex flex-wrap items-center gap-2 px-3 py-2'>
      {pipe(
        allValues,
        A.mapWithIndex((index, val) => (
          <div
            key={index}
            className='flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-sm'
          >
            <span>{val}</span>
            <button
              type='button'
              className='text-gray-400 hover:text-gray-600'
              onClick={() =>
                dispatch({
                  _tag: 'TextPillMsg',
                  key,
                  subMsg: { _tag: 'RemovePill', index },
                })
              }
            >
              ×
            </button>
          </div>
        )),
      )}
      <input
        className='min-w-[120px] grow outline-none'
        value={currentValue}
        onInput={(event) =>
          dispatch({
            _tag: 'TextPillMsg',
            key,
            subMsg: { _tag: 'UpdateTextPill', event },
          })
        }
        onKeyDown={(event) => {
          if (event.key === 'Enter' && currentValue.trim() !== '') {
            event.preventDefault()
            dispatch({
              _tag: 'TextPillMsg',
              key,
              subMsg: { _tag: 'AddPill', value: currentValue },
            })
          }
        }}
        onFocus={(_) => dispatch({ _tag: 'HandleFocus', key, isFocus: true })}
        onBlur={(_) => dispatch({ _tag: 'HandleFocus', key, isFocus: false })}
        placeholder={allValues.length === 0 ? 'Enter tags...' : ''}
        autoComplete={autocompleteToString(autocomplete)}
      />
    </div>
  )

  return inputBoxView<string[]>(
    dispatch,
    key,
    {
      label,
      validation,
      currentValue: allValues,
      showValidation,
      isFocus,
    },
    validationResult,
    inputElement,
    emptyEl(),
  )
}
