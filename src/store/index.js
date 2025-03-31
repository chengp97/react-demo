import { configureStore } from '@reduxjs/toolkit';
import { reducer as formReducer } from 'redux-form';
import chatReducer from './chatSlice';

const store = configureStore({
  reducer: {
    chat: chatReducer,
    form: formReducer
  }
});

export default store;