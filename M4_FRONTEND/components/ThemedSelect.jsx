import { useEffect, useRef, useState } from 'react'

/**
 * A custom-styled single-select dropdown.
 *
 * Native <select> elements can't have their open-menu option highlight
 * (hover / keyboard-focus / selected state) restyled consistently across
 * browsers — the browser always falls back to its own default blue
 * highlight. This component reproduces the same value/onChange contract
 * as a native select while giving full control over every visual state,
 * so it can match the site's dark green theme.
 */
export default function ThemedSelect({ id, value, onChange, options, placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef(null)
  const menuRef = useRef(null)

  const selectedIndex = options.findIndex((option) => option.value === value)
  const selectedOption = selectedIndex >= 0 ? options[selectedIndex] : null

  useEffect(() => {
    function handleClickOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (open) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0)
      menuRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (open && activeIndex >= 0) {
      const node = menuRef.current?.children?.[activeIndex]
      node?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, activeIndex])

  function commit(index) {
    const option = options[index]
    if (!option) return
    onChange(option.value)
    setOpen(false)
  }

  function handleTriggerKeyDown(event) {
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault()
      setOpen(true)
    }
  }

  function handleMenuKeyDown(event) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((current) => Math.min(current + 1, options.length - 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((current) => Math.max(current - 1, 0))
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(options.length - 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        commit(activeIndex)
        break
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        break
      default:
        break
    }
  }

  return (
    <div className={`themed-select${open ? ' is-open' : ''}`} ref={rootRef}>
      <button
        type="button"
        id={id}
        className="themed-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={`themed-select-value${selectedOption ? '' : ' is-placeholder'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className="themed-select-chevron"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <ul
          className="themed-select-menu"
          role="listbox"
          tabIndex={-1}
          ref={menuRef}
          aria-activedescendant={activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          onKeyDown={handleMenuKeyDown}
        >
          {options.map((option, index) => (
            <li
              key={option.value}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              className={`themed-select-option${index === activeIndex ? ' is-active' : ''}${
                option.value === value ? ' is-selected' : ''
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => commit(index)}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
