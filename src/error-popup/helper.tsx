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

import { type Option } from 'fp-ts/lib/Option'

import { Direction } from './type'

export const arrowTop = () => (
  <div className='relative'>
    <div
      className='absolute arrow-down z-20'
      style={{ borderBottom: '6px solid rgba(229, 46, 4, 1)', top: '-6px' }}
    ></div>
  </div>
)

export const arrowDown = () => (
  <div className='relative'>
    <div
      className='absolute arrow-down z-20'
      style={{ borderTop: '6px solid rgba(229, 46, 4, 1)' }}
    ></div>
  </div>
)

export const errorPopupContainer = (
  errorText: Option<string>,
  direction: Direction,
  onClick: () => void,
) => {
  const position = direction === 'bottom' ? 'top-[10px]' : 'bottom-[-20px]'

  return (
    <div className='w-full relative'>
      <div className={`w-full z-100 absolute pointer-events-none ${position}`}>
        <div className='w-full flex flex-col items-center'>
          {errorText._tag === 'Some'
            ? errorPopup(errorText.value, direction, onClick)
            : null}
        </div>
      </div>
    </div>
  )
}

export const errorPopup = (
  errorText: string,
  direction: Direction,
  onClick: () => void,
) => {
  return (
    <div
      className='flex flex-col items-center cursor-pointer pointer-events-auto'
      onClick={onClick}
    >
      {direction === 'bottom' ? arrowTop() : null}
      <div className='py-[5px] px-[8px] bg-jj-red-200 text-white rounded drop-shadow-lg z-10'>
        <p className='text-center whitespace-pre-line text-[14px] leading-[20px]'>
          {errorText}
        </p>
      </div>
      {direction === 'top' ? arrowDown() : null}
    </div>
  )
}
