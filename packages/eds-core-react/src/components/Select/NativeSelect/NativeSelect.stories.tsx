import { useState, useEffect } from 'react'
import { NativeSelect, NativeSelectProps, EdsProvider, Density } from '../../..'
import { Story, Meta } from '@storybook/react/types-6-0'

export default {
  title: 'Inputs/Select/NativeSelect',
  component: NativeSelect,
  parameters: {
    docs: {
      description: {
        component: `The NativeSelect component allows users to choose one or
        multiple items or options from a list.
        `,
      },
    },
  },
} as Meta

export const Default: Story<NativeSelectProps> = (args) => (
  <NativeSelect label="Label text" meta="m2" id="default-select" {...args}>
    <option>First option with a really really long text</option>
    <option>Second</option>
  </NativeSelect>
)
export const Multiple: Story<NativeSelectProps> = () => (
  <NativeSelect label="Label text" id="multiple-select" multiple>
    <option>First option with a really really long text</option>
    <option>Second</option>
    <option>Third</option>
    <option>Another</option>
    <option>Even another</option>
  </NativeSelect>
)
export const Disabled: Story<NativeSelectProps> = () => (
  <NativeSelect label="Label text" disabled id="disabled-select">
    <option>Pick one</option>
  </NativeSelect>
)

export const Compact: Story = () => {
  const [density, setDensity] = useState<Density>('comfortable')

  useEffect(() => {
    // Simulate user change
    setDensity('compact')
  }, [density])

  return (
    <EdsProvider density={density}>
      <NativeSelect label="This is compact" id="compact-select">
        <option>First option with a really really long text</option>
        <option>Second</option>
        <option>Third</option>
        <option>Another</option>
        <option>Even another</option>
      </NativeSelect>
    </EdsProvider>
  )
}

Compact.parameters = {
  docs: {
    description: {
      story: 'Compact `NativeSelect` using `EdsProvider` ',
    },
  },
}
