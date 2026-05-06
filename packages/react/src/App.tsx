import { Route, Routes } from 'react-router-dom'
import FileShare from './pages/index'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<FileShare />} />
      </Routes>
    </>
  )
}

export default App