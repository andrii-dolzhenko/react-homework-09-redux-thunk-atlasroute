import { RouterProvider } from 'react-router/dom'
import ThemeSync from './components/ThemeSync'
import { router } from './router'

export default function App() {
  return (
    <>
      <ThemeSync></ThemeSync>
      <RouterProvider router={router}></RouterProvider>
    </>
  )
}
