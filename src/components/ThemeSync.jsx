import { memo, useLayoutEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectTheme } from '../redux/preferencesSlice'

function ThemeSync() {
  const theme = useSelector(selectTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme

    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) {
      themeColor.setAttribute(
        'content',
        theme === 'dark' ? '#061827' : '#fbfdfe',
      )
    }
  }, [theme])

  return null
}

export default memo(ThemeSync)
