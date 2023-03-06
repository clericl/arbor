import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import logger from 'redux-logger'
import words from './redux/reducers/words'
import saga from './redux/sagas'

import Arbor from './components/Arbor'
import { Provider } from 'react-redux'

import './App.css';

const sagaMiddleware = createSagaMiddleware()

const store = configureStore({
  reducer: {
    words,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(sagaMiddleware)
})

sagaMiddleware.run(saga)

function App() {
  return (
    <Provider store={store}>
      <Arbor />
    </Provider>
  );
}

export default App;
