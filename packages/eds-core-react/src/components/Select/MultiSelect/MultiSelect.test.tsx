import { useState } from 'react'
import {
  render,
  cleanup,
  fireEvent,
  screen,
  within,
  act,
} from '@testing-library/react'
import '@testing-library/jest-dom'
import 'jest-styled-components'
import { axe } from 'jest-axe'
import { UseMultipleSelectionStateChange } from 'downshift'

import styled from 'styled-components'
import { MultiSelect } from '.'

const items = ['One', 'Two', 'Three']
const labelText = 'Select label test'

afterEach(cleanup)

describe('MultiSelect', () => {
  it('Matches snapshot', () => {
    render(<MultiSelect items={items} label={labelText} />)
    const optionsNode = screen.getAllByLabelText(labelText)[1]
    const buttonNode = screen.getByLabelText('toggle options', {
      selector: 'button',
    })
    expect(optionsNode).toMatchSnapshot()
    expect(buttonNode).toMatchSnapshot()
  })
  it('Should pass a11y test', async () => {
    const { container } = render(<MultiSelect items={items} label="label" />)
    await act(async () => {
      const result = await axe(container)
      expect(result).toHaveNoViolations()
    })
  })
  it('Has provided label', () => {
    render(<MultiSelect label={labelText} items={items} id="id" />)
    // The same label is used for both the input field and the list of options
    const inputNode = screen.getAllByLabelText(labelText)
    expect(inputNode).toBeDefined()
  })

  it('Can be disabled', () => {
    render(<MultiSelect label={labelText} items={items} disabled />)
    const inputNode = screen.getAllByLabelText(labelText)[0]
    expect(inputNode).toBeDisabled()
  })

  it('Can preselect specific options', () => {
    render(
      <MultiSelect
        items={items}
        label={labelText}
        initialSelectedItems={['One', 'Two']}
      />,
    )
    const placeholderText = screen.getByPlaceholderText('2/3 selected')
    expect(placeholderText).toBeDefined()
  })

  it('Can open the options on button click', () => {
    render(<MultiSelect items={items} label={labelText} />)
    const optionsNode = screen.getAllByLabelText(labelText)[1]
    const buttonNode = screen.getByLabelText('toggle options', {
      selector: 'button',
    })
    expect(within(optionsNode).queryAllByRole('option')).toHaveLength(0)
    fireEvent.click(buttonNode)
    expect(within(optionsNode).queryAllByRole('option')).toHaveLength(3)
  })

  type ControlledProps = {
    onChange: () => void
  }

  const HandleMultipleSelect = ({ onChange }: ControlledProps) => {
    const [selected, setSelected] = useState([])
    return (
      <MultiSelect
        items={items}
        label={labelText}
        selectedOptions={selected}
        handleSelectedItemsChange={(
          changes: UseMultipleSelectionStateChange<string>,
        ) => {
          setSelected(changes.selectedItems)
          onChange()
        }}
      />
    )
  }

  it('Can be a controlled component', () => {
    const handleChange = jest.fn()
    render(<HandleMultipleSelect onChange={handleChange} />)
    const optionsNode = screen.getAllByLabelText(labelText)[1]
    const buttonNode = screen.getByLabelText('toggle options', {
      selector: 'button',
    })

    expect(handleChange).toHaveBeenCalledTimes(0)
    fireEvent.click(buttonNode)
    fireEvent.click(within(optionsNode).queryAllByRole('option')[2])
    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('Can filter results by contains search', () => {
    render(<MultiSelect items={items} label={labelText} />)
    const inputNode = screen.getAllByLabelText(labelText)[0]

    const optionsNode = screen.getAllByLabelText(labelText)[1]

    const buttonNode = screen.getByLabelText('toggle options', {
      selector: 'button',
    })
    expect(within(optionsNode).queryAllByRole('option')).toHaveLength(0)
    fireEvent.click(buttonNode)
    expect(within(optionsNode).queryAllByRole('option')).toHaveLength(3)
    fireEvent.change(inputNode, {
      target: { value: 'ree' },
    })
    expect(within(optionsNode).queryAllByRole('option')).toHaveLength(1)
  })

  const StyledMultiSelect = styled(MultiSelect)`
    clip-path: unset;
  `

  it('Can extend the css for the component', () => {
    const { container } = render(
      <StyledMultiSelect label="test" items={items} />,
    )
    // eslint-disable-next-line testing-library/no-node-access
    expect(container.firstChild).toHaveStyleRule('clip-path', 'unset')
  })
})
