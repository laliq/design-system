/* eslint-disable no-undef */
import {
  render,
  cleanup,
  screen,
  fireEvent,
  act,
  waitFor,
} from '@equinor/eds-utils/src/test'
import '@testing-library/jest-dom'
import '@testing-library/jest-dom/extend-expect'
import 'jest-styled-components'
import { axe } from 'jest-axe'
import styled from 'styled-components'
import { Menu } from '.'
import { MenuProps } from './Menu'

// We override Menu for testing and set props to partial because AnchorEl is applied to children in custom render function
const TestMenu = Menu as React.ForwardRefExoticComponent<Partial<MenuProps>>

const StyledMenu = styled(TestMenu)`
  background: red;
`

afterEach(cleanup)

describe('Menu', () => {
  it('Matches snapshot', async () => {
    render(
      <StyledMenu open>
        <div>some random content</div>
      </StyledMenu>,
    )

    const menuContainer = await screen.findByRole('menu', { hidden: true })

    expect(menuContainer).toMatchSnapshot()
  })
  it('Should pass a11y test', async () => {
    const { container } = render(
      <TestMenu open>
        <div>some random content</div>
      </TestMenu>,
    )
    await act(async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
  it('Should pass a11y test with Item', async () => {
    const { container } = render(
      <TestMenu open>
        <Menu.Item>Item 1</Menu.Item>
        <Menu.Item>Item 2</Menu.Item>
      </TestMenu>,
    )
    await act(async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
  it('Should pass a11y test with Section & title', async () => {
    const { container } = render(
      <TestMenu open>
        <Menu.Section title="Section title">
          <Menu.Item>Item 1</Menu.Item>
        </Menu.Section>
      </TestMenu>,
    )
    await act(async () => {
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })
  it('Can extend the css for the component', async () => {
    const { container } = render(
      <StyledMenu open>
        <div>some random content</div>
      </StyledMenu>,
    )

    await waitFor(() =>
      // eslint-disable-next-line testing-library/no-node-access
      expect(container.nextSibling).toHaveStyleRule('background', 'red'),
    )
  })
  it('is visible when open is true & anchorEl is set', async () => {
    render(
      <TestMenu open placement="right-start">
        <div>some random content</div>
      </TestMenu>,
    )
    const menuContainer = screen.getByRole('menu')
    // eslint-disable-next-line testing-library/no-node-access
    const menuPaper = menuContainer.parentElement
    await waitFor(() => {
      expect(menuPaper).toBeDefined()
    })
    await waitFor(() => {
      expect(menuPaper).toHaveAttribute('data-popper-placement', 'right-start')
    })
  })
  it('has rendered Menu.Item', async () => {
    render(
      <TestMenu open>
        <Menu.Item>Item 1</Menu.Item>
      </TestMenu>,
    )
    const menuItem = screen.getByText('Item 1')
    await waitFor(() => expect(menuItem).toBeDefined())
  })
  it('has rendered Menu.Section with Menu.Item & title', async () => {
    render(
      <TestMenu open>
        <Menu.Section title="Section title">
          <Menu.Item>Item 1</Menu.Item>
        </Menu.Section>
      </TestMenu>,
    )
    const menuItem = screen.getByText('Item 1')
    const menuSection = screen.getByText('Section title')

    await waitFor(() => expect(menuItem).toBeDefined())
    expect(menuSection).toBeDefined()
  })
  it('has called onClose when Menu.Item is clicked', async () => {
    const handleOnClose = jest.fn()
    const handleOnClick = jest.fn()

    render(
      <TestMenu open onClose={handleOnClose}>
        <Menu.Item onClick={handleOnClick}>Item 1</Menu.Item>
      </TestMenu>,
    )

    const menuItem = screen.getByText('Item 1')

    fireEvent.click(menuItem)

    await waitFor(() => expect(handleOnClick).toHaveBeenCalled())
    expect(handleOnClose).toHaveBeenCalled()
  })
  it('has called onClose when Menu.Item is clicked from inside a Menu.Section', async () => {
    const handleOnClose = jest.fn()
    const handleOnClick = jest.fn()

    render(
      <TestMenu open onClose={handleOnClose}>
        <Menu.Section title="test">
          <Menu.Item onClick={handleOnClick}>Item 1</Menu.Item>
        </Menu.Section>
      </TestMenu>,
    )

    const menuItem = screen.getByText('Item 1')

    fireEvent.click(menuItem)

    await waitFor(() => expect(handleOnClick).toHaveBeenCalled())
    expect(handleOnClose).toHaveBeenCalled()
  })
})
