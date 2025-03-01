import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import {
  Typography,
  Button,
  Popover,
  PopoverProps,
  Icon,
  Tooltip,
  EdsProvider,
  Density,
} from '../..'
import { more_vertical, close } from '@equinor/eds-icons'
import { ComponentMeta, Story } from '@storybook/react'
import { Stack as SBStack } from './../../../.storybook/components'
import page from './Popover.docs.mdx'

const { Title, Content, Header, Actions } = Popover

const Stack = styled(SBStack)({
  margin: '10rem',
})

export default {
  title: 'Data Display/Popover',
  component: Popover,
  subcomponents: {
    Header,
    Title,
    Content,
    Actions,
  },
  parameters: {
    docs: {
      page,
    },
  },
} as ComponentMeta<typeof Popover>

export const Introduction: Story<PopoverProps> = (args) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const referenceElement = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    // eslint-disable-next-line react/destructuring-assignment
    setIsOpen(args.open)
    // eslint-disable-next-line react/destructuring-assignment
  }, [args.open])

  return (
    <Stack>
      <Button
        aria-haspopup
        id="default-popover-anchor"
        aria-controls="default-popover"
        aria-expanded={isOpen}
        ref={referenceElement}
        onClick={handleOpen}
      >
        Click me!
      </Button>

      <Popover
        open={isOpen}
        {...args}
        id="default-popover"
        anchorEl={referenceElement.current}
        onClose={handleClose}
      >
        <Popover.Header>
          <Popover.Title>Title</Popover.Title>
        </Popover.Header>
        <Popover.Content>
          <Typography variant="body_short">Content</Typography>
        </Popover.Content>
        <Popover.Actions>
          <Button onClick={handleClose}>OK</Button>
        </Popover.Actions>
      </Popover>
    </Stack>
  )
}

export const ActivateOnClick: Story<PopoverProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const openPopover = () => setIsOpen(true)
  const closePopover = () => setIsOpen(false)

  return (
    <Stack>
      <Button
        id="click-popover-anchor"
        aria-controls="click-popover"
        ref={anchorRef}
        onClick={openPopover}
      >
        Click to activate
      </Button>

      <Popover
        id="click-popover"
        aria-expanded={isOpen}
        anchorEl={anchorRef.current}
        onClose={closePopover}
        open={isOpen}
      >
        <Popover.Header>
          <Popover.Title>Title</Popover.Title>
        </Popover.Header>
        <Popover.Content>
          <Typography variant="body_short">Content</Typography>
        </Popover.Content>
        <Popover.Actions>
          <Button onClick={closePopover}>OK</Button>
        </Popover.Actions>
      </Popover>
    </Stack>
  )
}
ActivateOnClick.storyName = 'Activate onClick'

export const ActivateOnHover: Story<PopoverProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const anchorRef = useRef<HTMLButtonElement>(null)
  let timer: ReturnType<typeof setTimeout> = null

  const openPopover = () => setIsOpen(true)
  const closePopover = () => setIsOpen(false)

  const handleHover = () => {
    timer = setTimeout(() => {
      openPopover()
    }, 300)
  }

  const handleClose = () => {
    clearTimeout(timer)
    closePopover()
  }

  return (
    <Stack>
      <Button
        id="hover-popover-anchor"
        aria-controls="hover-popover"
        aria-expanded={isOpen}
        ref={anchorRef}
        onMouseOver={handleHover}
        onFocus={openPopover}
        onBlur={handleClose}
      >
        Hover to activate
      </Button>

      <Popover
        id="hover-popover"
        anchorEl={anchorRef.current}
        onClose={handleClose}
        open={isOpen}
        placement="top"
      >
        <Popover.Header>
          <Popover.Title>Title</Popover.Title>
        </Popover.Header>
        <Popover.Content>
          <Typography variant="body_short">Content</Typography>
        </Popover.Content>
        <Popover.Actions>
          <Button onClick={handleClose}>OK</Button>
        </Popover.Actions>
      </Popover>
    </Stack>
  )
}
ActivateOnHover.storyName = 'Activate onHover'

export const WithTooltip: Story<PopoverProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const openPopover = () => setIsOpen(true)
  const closePopover = () => setIsOpen(false)

  return (
    <Stack>
      <Tooltip title="Menu">
        <Button ref={anchorRef} variant="ghost_icon" onClick={openPopover}>
          <Icon data={more_vertical} />
        </Button>
      </Tooltip>
      <Popover
        anchorEl={anchorRef.current}
        open={isOpen}
        onClose={closePopover}
        placement="top"
      >
        <Popover.Header>
          <Popover.Title>Title</Popover.Title>
        </Popover.Header>
        <Popover.Content>Content</Popover.Content>
      </Popover>
    </Stack>
  )
}

export const WithCloseButton: Story<PopoverProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const openPopover = () => setIsOpen(true)
  const closePopover = () => setIsOpen(false)

  return (
    <Stack>
      <Button
        id="click-popover-anchor"
        aria-controls="click-popover"
        ref={anchorRef}
        onClick={openPopover}
      >
        Click to activate
      </Button>

      <Popover
        id="click-popover"
        aria-expanded={isOpen}
        anchorEl={anchorRef.current}
        onClose={closePopover}
        open={isOpen}
      >
        <Popover.Header>
          <Popover.Title>Title</Popover.Title>
          <Button
            style={{ height: '32px', width: '32px' }}
            variant="ghost_icon"
            aria-label="Close popover"
            onClick={closePopover}
          >
            <Icon name="close" data={close} size={24} />
          </Button>
        </Popover.Header>
        <Popover.Content>
          <Typography variant="body_short">Content</Typography>
        </Popover.Content>
      </Popover>
    </Stack>
  )
}
WithCloseButton.storyName = 'With close button'

export const Compact: Story<PopoverProps> = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const anchorRef = useRef<HTMLButtonElement>(null)

  const openPopover = () => setIsOpen(true)
  const closePopover = () => setIsOpen(false)

  const [density, setDensity] = useState<Density>('comfortable')

  useEffect(() => {
    // Simulate user change
    setDensity('compact')
  }, [density])

  return (
    <EdsProvider density={density}>
      <Stack>
        <Button
          id="click-popover-anchor"
          aria-controls="click-popover"
          ref={anchorRef}
          onClick={openPopover}
        >
          Click to activate
        </Button>

        <Popover
          id="click-popover"
          aria-expanded={isOpen}
          anchorEl={anchorRef.current}
          onClose={closePopover}
          open={isOpen}
        >
          <Popover.Header>
            <Popover.Title>Title</Popover.Title>
          </Popover.Header>
          <Popover.Content>
            <Typography variant="body_short">Content</Typography>
          </Popover.Content>
          <Popover.Actions>
            <Button onClick={closePopover}>OK</Button>
          </Popover.Actions>
        </Popover>
      </Stack>
    </EdsProvider>
  )
}
