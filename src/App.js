import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import logger from 'redux-logger'
import words from './redux/reducers/words'
import ui from './redux/reducers/ui'
import saga from './redux/sagas'

import { Provider } from 'react-redux'
import Layout from './components/Layout'

import './styles/global.scss';

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: {
    words,
    ui,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware).concat(logger)
})

sagaMiddleware.run(saga)

function App() {
  return (
    <Provider store={store}>
      <Layout />
    </Provider>
  );
}

export default App;
