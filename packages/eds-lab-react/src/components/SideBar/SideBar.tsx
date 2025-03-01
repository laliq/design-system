import {
  createContext,
  HTMLAttributes,
  forwardRef,
  useContext,
  useState,
  useEffect,
} from 'react'
import styled, { css, ThemeProvider } from 'styled-components'
import { sidebar as tokens } from './SideBar.tokens'
import { bordersTemplate, useToken } from '@equinor/eds-utils'
//import EquinorLogo from '../EquinorLogo'
import { ToggleOpen } from './ToggleOpen'
import { ActionButton } from './ActionButton'
import { useEds } from '@equinor/eds-core-react'
import { IconData } from '@equinor/eds-icons'

type ContainerProps = {
  open: boolean
  maxHeight?: string
}

const Container = styled.div<ContainerProps>(({ theme, open, maxHeight }) => {
  return css`
    ${bordersTemplate(theme.border)}
    background-color: ${theme.background};
    display: flex;
    flex-direction: column;
    padding-bottom: ${theme.spacings.bottom};
    overflow: hidden;
    width: ${open ? '256px' : '72px'};
    min-width: ${open ? '256px' : '72px'};
    ${maxHeight && css({ maxHeight: maxHeight })}
  `
})

const LogoContainer = styled.div(({ theme }) => {
  return css`
    display: flex;
    justify-content: center;
    border-top: 1px solid rgba(220, 220, 220, 1); //how to solve this with bordersTemplate???
    padding-top: ${theme.spacings.top};
  `
})

const TopContainer = styled.div`
  display: grid;
  grid-auto-rows: 1fr;
  align-items: center;
  margin-bottom: auto;
`

type SideBarContextType = {
  isOpen: boolean
}

export function useSideBar(): SideBarContextType {
  const context = useContext(SideBarContext)
  if (context === undefined) {
    throw new Error('Sidebar hook must be used within Provider')
  }
  return context
}

export const SideBarContext = createContext<SideBarContextType | undefined>(
  undefined,
)

type SidebarType = {
  onAction?: () => void
  actionLabel?: string
  actionIcon?: IconData
  toggleButton?: 'top' | 'bottom'
  open?: boolean
  maxHeight?: string
  onToggle?: (state: boolean) => void
} & HTMLAttributes<HTMLDivElement>

export const SideBar = forwardRef<HTMLDivElement, SidebarType>(
  (
    {
      onAction,
      actionLabel,
      actionIcon,
      toggleButton,
      onToggle,
      open = false,
      maxHeight,
      children,
    },
    ref,
  ) => {
    const { density } = useEds()
    const token = useToken({ density }, tokens)
    const [isOpen, setIsOpen] = useState<boolean>(open)

    const handleToggle = (toggle: boolean) => {
      setIsOpen(toggle)
      onToggle?.(toggle)
    }

    useEffect(() => {
      handleToggle(open)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    return (
      <ThemeProvider theme={token}>
        <SideBarContext.Provider value={{ isOpen }}>
          <Container open={isOpen} ref={ref} maxHeight={maxHeight}>
            {toggleButton && toggleButton === 'top' && (
              <ToggleOpen
                isOpen={isOpen}
                onClick={() => handleToggle(!isOpen)}
              />
            )}
            <TopContainer>
              {onAction && actionLabel && actionIcon && (
                <ActionButton
                  isOpen={isOpen}
                  icon={actionIcon}
                  label={actionLabel}
                  onAction={onAction}
                />
              )}
              {children}
            </TopContainer>
            {toggleButton && toggleButton === 'bottom' && (
              <ToggleOpen
                isOpen={isOpen}
                onClick={() => handleToggle(!isOpen)}
              />
            )}
            <LogoContainer></LogoContainer>
          </Container>
        </SideBarContext.Provider>
      </ThemeProvider>
    )
  },
)

SideBar.displayName = 'SideBar'
