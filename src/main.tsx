import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from '@/store/store'
// import './index.css'
import '@/styles/global.css'
import App from '@/App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <Provider store={store}>
      <App />
     </Provider>
  </StrictMode>,
)
