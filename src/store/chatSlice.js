import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// 创建异步action来处理AI响应
export const fetchAIResponse = createAsyncThunk(
  'chat/fetchAIResponse',
  async (message, thunkAPI) => {
    try {
      const apiKey = import.meta.env.VITE_HF_API_KEY;
      const apiEndpoint = import.meta.env.VITE_HF_API_ENDPOINT;

      if (!apiKey || !apiEndpoint) {
        throw new Error('Hugging Face API配置缺失，请检查环境变量设置');
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{
            role: "user",
            content: message
          }],
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while(true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.slice(6));
              if (json === '[DONE]') return;
              if (json.choices[0].delta?.content) {
                fullResponse += json.choices[0].delta.content;
                thunkAPI.dispatch(chatSlice.actions.updateLastMessage(fullResponse));
              }
            } catch (e) {
              console.error('解析流数据失败:', e);
            }
          }
        }
      }

      return {
        text: fullResponse
      };
    } catch (error) {
      console.error('API错误详情:', {
        message: error.message,
        requestPayload: message,
        endpoint: apiEndpoint
      });
      throw new Error(error.message || '无法获取AI响应');
    }
  }
);

const initialState = {
  messages: [
    { id: 1, text: '你好！我是AI助手，有什么可以帮你的吗？', sender: 'ai' },
  ],
  status: 'idle',
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateLastMessage: (state, action) => {
      const lastMessage = state.messages[state.messages.length - 1];
      if (lastMessage) {
        lastMessage.text = action.payload;
      }
    },
    clearMessages: (state) => {
      state.messages = initialState.messages;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIResponse.pending, (state) => {
        state.status = 'loading';
        // 添加临时消息用于实时更新
        state.messages.push({
          id: Date.now(),
          text: '',
          sender: 'ai',
          streaming: true
        });
      })
      .addCase(fetchAIResponse.fulfilled, (state) => {
        state.status = 'succeeded';
        // 移除streaming标记
        const lastMessage = state.messages[state.messages.length - 1];
        if (lastMessage) {
          delete lastMessage.streaming;
        }
      })
      .addCase(fetchAIResponse.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { addMessage, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;