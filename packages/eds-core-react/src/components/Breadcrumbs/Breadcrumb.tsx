import { forwardRef } from 'react'
import styled, { css } from 'styled-components'
import { Typography } from '../Typography'
import { Tooltip } from '../Tooltip'
import { breadcrumbs as tokens } from './Breadcrumbs.tokens'

type StyledProps = Pick<BreadcrumbProps, 'maxWidth'>

const { states, typography } = tokens

const StyledTypography = styled(Typography)<StyledProps>`
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      text-decoration: underline;
      color: ${states.hover.typography.color};
      cursor: pointer;
    }
  }
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  text-decoration: none;
  color: ${typography.color};
  ${({ maxWidth }) => css({ maxWidth })}
`

export type BreadcrumbProps = {
  /* Max label width in pixels,
   * truncate long labels based on this width */
  maxWidth?: number
  /** Children is breadcrumb text */
  children: string
} & React.AnchorHTMLAttributes<HTMLAnchorElement>

export const Breadcrumb = forwardRef<HTMLAnchorElement, BreadcrumbProps>(
  function Breadcrumb({ children, maxWidth, href, ...other }, ref) {
    const props = {
      ...other,
      href,
      ref,
      maxWidth,
    }
    const showTooltip = maxWidth > 0
    const isHrefDefined = href !== undefined

    const crumb = (
      <StyledTypography
        link={isHrefDefined}
        forwardedAs={isHrefDefined ? null : 'span'}
        variant="body_short"
        {...props}
      >
        {children}
      </StyledTypography>
    )

    return showTooltip ? (
      <Tooltip title={children} placement="top">
        {crumb}
      </Tooltip>
    ) : (
      crumb
    )
  },
)
