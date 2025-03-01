import {
  forwardRef,
  useState,
  useRef,
  HTMLAttributes,
  MouseEvent,
  KeyboardEvent,
  useEffect,
  ChangeEvent,
} from 'react'
import styled, { css } from 'styled-components'
import { slider as tokens } from './Slider.tokens'
import { MinMax } from './MinMax'
import { Output } from './Output'
import { SliderInput } from './SliderInput'
import { bordersTemplate, useId } from '@equinor/eds-utils'

const {
  entities: { track, handle, dot },
} = tokens

const fakeTrackBg = css`
  background-image: url("data:image/svg+xml,<svg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'><rect x='0' y='11' fill='${track.background}' width='100%' height='4' rx='2' /></svg>");
  background-size: cover;
  background-repeat: no-repeat;
`

const fakeTrackBgHover = css({
  backgroundImage: `url("data:image/svg+xml,<svg xmlns='http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'><rect x='0' y='11' fill='${track.states.hover.background}' width='100%' height='4' rx='2' /></svg>")`,
})

const trackFill = css`
  grid-column: 1 / span 2;
  grid-row: 2;
  height: ${track.height};
  margin-bottom: ${track.spacings.bottom};
  align-self: end;
  content: '';
`

const wrapperGrid = css`
  display: grid;
  grid-template-rows: max-content 24px;
  grid-template-columns: 1fr 1fr;
  width: 100%;
  position: relative;
`
type RangeWrapperProps = {
  valA: number
  valB: number
} & Pick<SliderProps, 'min' | 'max' | 'disabled'>

const RangeWrapper = styled.div<RangeWrapperProps>`
  --a: ${({ valA }) => valA};
  --b: ${({ valB }) => valB};
  --min: ${({ min }) => min};
  --max: ${({ max }) => max};
  --dif: calc(var(--max) - var(--min));
  --realWidth: calc(100% - 12px);
  ${wrapperGrid}
  ${fakeTrackBg}
  &::before,
  &::after {
    ${trackFill}
    background: ${({ disabled }) =>
      disabled
        ? track.entities.indicator.states.disabled.background
        : track.entities.indicator.background};
  }
  /** Faking the active region of the slider */
  &::before {
    margin-left: calc(
      calc(${handle.width} / 2) + (var(--a) - var(--min)) / var(--dif) *
        var(--realWidth)
    );
    width: calc((var(--b) - var(--a)) / var(--dif) * var(--realWidth));
  }

  &::after {
    margin-left: calc(
      calc(${handle.width} / 2) + (var(--b) - var(--min)) / var(--dif) *
        var(--realWidth)
    );
    width: calc((var(--a) - var(--b)) / var(--dif) * var(--realWidth));
  }
  @media (hover: hover) and (pointer: fine) {
    &:hover:not([disabled]) {
      ${fakeTrackBgHover}
      &::before,
      &::after {
        background: ${track.entities.indicator.states.hover.background};
      }
    }
  }
`

type WrapperProps = Pick<SliderProps, 'min' | 'max' | 'disabled' | 'value'>

const Wrapper = styled.div<WrapperProps>`
  --min: ${({ min }) => min};
  --max: ${({ max }) => max};
  --dif: calc(var(--max) - var(--min));
  --value: ${({ value }) => value};
  --realWidth: calc(100% - 12px);
  ${wrapperGrid}
  ${fakeTrackBg}
  &::after {
    ${trackFill}
    background: ${({ disabled }) =>
      disabled
        ? track.entities.indicator.states.disabled.background
        : track.entities.indicator.background}
  }
  &::after {
    margin-right: calc(
      (var(--max) - var(--value)) / var(--dif) * var(--realWidth)
    );
    /* Adjusting for start dot circle */
    margin-left: 3px;
  }
  @media (hover: hover) and (pointer: fine) {
    &:hover:not([disabled]) {
      ${fakeTrackBgHover}
      &::after {
        background: ${track.entities.indicator.states.hover.background};
      }
    }
  }
`

const WrapperGroupLabel = styled.div`
  grid-row: 1;
  grid-column: 1 / 3;
`
const WrapperGroupLabelDots = styled(WrapperGroupLabel)`
  &:before,
  &:after {
    content: ' ';
    display: block;
    position: absolute;
    width: ${dot.width};
    height: ${dot.height};
    background: ${tokens.background};
    ${bordersTemplate(dot.border)}
    bottom: ${dot.spacings.bottom};
    left: 0;
  }
  &:after {
    right: 0;
    left: auto;
  }
`

const SrOnlyLabel = styled.label`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`

export type SliderProps = {
  /** Id for the elements that labels this slider (NOTE: will be deprecated and removed in a future version of EDS, please use the native aria-labelledby instead) */
  ariaLabelledby?: string
  /** Components value, range of numbers */
  value: number[] | number
  /** Function to be called when value change */
  onChange?: (
    event: ChangeEvent<HTMLInputElement>,
    newValue: number[] | number,
  ) => void
  /** Function to be called when value is committed by mouseup event */
  onChangeCommitted?: (
    event: MouseEvent | KeyboardEvent,
    newValue: number[] | number,
  ) => void
  /** Function for formatting the output, e.g. with dates */
  outputFunction?: (text: number) => string
  /** Max value */
  max?: number
  /**  Min value */
  min?: number
  /** Stepping interval */
  step?: number
  /** Show the min and max dots or not */
  minMaxDots?: boolean
  /** Show the min and max values or not */
  minMaxValues?: boolean
  /** Disabled */
  disabled?: boolean
} & HTMLAttributes<HTMLDivElement>

export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    min = 0,
    max = 100,
    value = [40, 60],
    outputFunction,
    onChange,
    onChangeCommitted,
    minMaxDots = true,
    minMaxValues = true,
    step = 1,
    disabled,
    ariaLabelledby,
    'aria-labelledby': ariaLabelledbyNative,
    ...rest
  },
  ref,
) {
  const isRangeSlider = Array.isArray(value)
  const parsedValue: number[] = isRangeSlider ? value : [value]
  const [initalValue, setInitalValue] = useState<number[]>(parsedValue)
  const [sliderValue, setSliderValue] = useState<number[]>(parsedValue)

  useEffect(() => {
    if (isRangeSlider) {
      if (value[0] !== initalValue[0] || value[1] !== initalValue[1]) {
        setInitalValue(value)
        setSliderValue(value)
      }
    } else {
      if (value !== initalValue[0]) {
        setInitalValue([value])
        setSliderValue([value])
      }
    }
  }, [value, initalValue, isRangeSlider])

  const minRange = useRef<HTMLInputElement>(null)
  const maxRange = useRef<HTMLInputElement>(null)
  const onValueChange = (
    event: ChangeEvent<HTMLInputElement>,
    valueArrIdx?: number,
  ) => {
    const changedValue = parseFloat(event.target.value)
    if (isRangeSlider) {
      const newValue = sliderValue.slice()
      newValue[valueArrIdx] = changedValue
      setSliderValue(newValue)
      if (onChange) {
        // Callback for provided onChange func
        onChange(event, newValue)
      }
      return
    }

    setSliderValue([changedValue])
    if (onChange) {
      // Callback for provided onChange func
      onChange(event, [changedValue])
    }
  }
  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      handleCommitedValue(event)
    }
  }

  const handleCommitedValue = (event: KeyboardEvent | MouseEvent) => {
    if (onChangeCommitted) {
      onChangeCommitted(event, sliderValue)
    }
  }

  const getFormattedText = (text: number) => {
    return outputFunction ? outputFunction(text) : text
  }

  const findClosestRange = (event: MouseEvent) => {
    const target = event.target as HTMLOutputElement | HTMLInputElement
    if (target.type === 'output') {
      return
    }
    const bounds = target.getBoundingClientRect()
    const x = event.clientX - bounds.left
    const inputWidth = minRange.current.offsetWidth
    const minValue = minRange.current.value
    const maxValue = maxRange.current.value
    const diff = max - min

    const normX = (x / inputWidth) * diff + min

    const maxX = Math.abs(normX - parseFloat(maxValue))
    const minX = Math.abs(normX - parseFloat(minValue))
    if (minX > maxX) {
      minRange.current.style.zIndex = '10'
      maxRange.current.style.zIndex = '20'
    } else {
      minRange.current.style.zIndex = '20'
      maxRange.current.style.zIndex = '10'
    }
  }

  let inputIdA = useId(null, 'inputA')
  let inputIdB = useId(null, 'inputB')
  let inputId = useId(null, 'thumb')
  if (rest['id']) {
    const overrideId = rest['id']
    inputIdA = `${overrideId}-thumb-a`
    inputIdB = `${overrideId}-thumb-b`
    inputId = `${overrideId}-thumb`
  }

  const getAriaLabelledby = () => {
    if (ariaLabelledbyNative) return ariaLabelledbyNative
    if (ariaLabelledby) {
      console.warn(
        'Slider: The "ariaLabelledby" prop is deprecated and will be removed in a future version of EDS, please use the native "aria-labelledby" instead',
      )
      return ariaLabelledby
    }
    return null
  }

  return (
    <>
      {isRangeSlider ? (
        <RangeWrapper
          {...rest}
          ref={ref}
          role="group"
          aria-labelledby={getAriaLabelledby()}
          valA={sliderValue[0]}
          valB={sliderValue[1]}
          max={max}
          min={min}
          disabled={disabled}
          onMouseMove={findClosestRange}
        >
          {minMaxDots && <WrapperGroupLabelDots />}
          <SrOnlyLabel htmlFor={inputIdA}>Value A</SrOnlyLabel>
          <SliderInput
            type="range"
            ref={minRange}
            value={sliderValue[0]}
            max={max}
            min={min}
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuenow={sliderValue[0]}
            aria-valuetext={getFormattedText(sliderValue[0]).toString()}
            id={inputIdA}
            step={step}
            onChange={(event) => {
              onValueChange(event, 0)
            }}
            onMouseUp={(event) => handleCommitedValue(event)}
            onKeyUp={(event) => handleKeyUp(event)}
            disabled={disabled}
          />
          <Output htmlFor={inputIdA} value={sliderValue[0]}>
            {getFormattedText(sliderValue[0])}
          </Output>
          {minMaxValues && <MinMax>{getFormattedText(min)}</MinMax>}
          <SrOnlyLabel htmlFor={inputIdB}>Value B</SrOnlyLabel>
          <SliderInput
            type="range"
            value={sliderValue[1]}
            min={min}
            max={max}
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuenow={sliderValue[1]}
            aria-valuetext={getFormattedText(sliderValue[1]).toString()}
            id={inputIdB}
            step={step}
            ref={maxRange}
            onChange={(event) => {
              onValueChange(event, 1)
            }}
            onMouseUp={(event) => handleCommitedValue(event)}
            onKeyUp={(event) => handleKeyUp(event)}
            disabled={disabled}
          />
          <Output htmlFor={inputIdB} value={sliderValue[1]}>
            {getFormattedText(sliderValue[1])}
          </Output>
          {minMaxValues && <MinMax>{getFormattedText(max)}</MinMax>}
        </RangeWrapper>
      ) : (
        <Wrapper
          {...rest}
          ref={ref}
          max={max}
          min={min}
          value={sliderValue[0]}
          disabled={disabled}
        >
          <SliderInput
            type="range"
            value={sliderValue[0]}
            min={min}
            max={max}
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuenow={sliderValue[0]}
            aria-valuetext={getFormattedText(sliderValue[0]).toString()}
            step={step}
            id={inputId}
            onChange={(event) => {
              onValueChange(event)
            }}
            disabled={disabled}
            aria-labelledby={getAriaLabelledby()}
            onMouseUp={(event) => handleCommitedValue(event)}
            onKeyUp={(event) => handleKeyUp(event)}
          />
          <Output htmlFor={inputId} value={sliderValue[0]}>
            {getFormattedText(sliderValue[0])}
          </Output>
          {/*  Need an element for pseudo elems :/ */}
          {minMaxDots && <WrapperGroupLabelDots />}
          {minMaxValues && (
            <>
              <MinMax>{getFormattedText(min)}</MinMax>
              <MinMax>{getFormattedText(max)}</MinMax>
            </>
          )}
        </Wrapper>
      )}
    </>
  )
})
