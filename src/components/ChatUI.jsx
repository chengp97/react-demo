import React, { useState,useRef,useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage, fetchAIResponse } from '../store/chatSlice';
import {
  Container,
  Paper,
  TextField,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Snackbar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SendIcon from '@material-ui/icons/Send';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
  },
  chatContainer: {
    flexGrow: 1,
    overflow: 'auto',
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
  },
  messageList: {
    padding: 0,
  },
  message: {
    marginBottom: theme.spacing(1),
  },
  userMessage: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderRadius: '20px 20px 0 20px',
    margin: theme.spacing(1, 0),
    padding: theme.spacing(2),
    maxWidth: '80%',
    boxShadow: theme.shadows[1],
  },
  aiMessage: {
    backgroundColor: theme.palette.grey[100],
    borderRadius: '20px 20px 20px 0',
    margin: theme.spacing(1, 0),
    padding: theme.spacing(2),
    maxWidth: '80%',
    boxShadow: theme.shadows[1],
  },
  timestamp: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
  },
  codeBlock: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(1, 0),
  },
  inputContainer: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  input: {
    flexGrow: 1,
  },
}));

const ChatUI = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const messages = useSelector((state) => state.chat.messages);
  const status = useSelector((state) => state.chat.status);
  const [input, setInput] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };

    dispatch(addMessage(newMessage));
    setInput('');

    try {
      await dispatch(fetchAIResponse(input)).unwrap();
    } catch (err) {
      setSnackbarOpen(true);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" className={classes.root}>
      <Paper elevation={3} className={classes.chatContainer} ref={chatContainerRef}>
        <List className={classes.messageList} style={{ overflowAnchor: 'auto' }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              className={classes.message}
              style={{
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                className={
                  message.sender === 'user' ? classes.userMessage : classes.aiMessage
                }
              >
                <ReactMarkdown
                  children={message.text}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={atomOneDark}
                          language={match[1]}
                          PreTag="div"
                          className={classes.codeBlock}
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                />
                <Typography variant="caption" className={classes.timestamp}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper elevation={3} className={classes.inputContainer}>
        {status === 'loading' && (
          <Box display="flex" justifyContent="center" width="100%" p={1}>
            <CircularProgress size={24} />
          </Box>
        )}
        <TextField
          className={classes.input}
          variant="outlined"
          placeholder="输入消息..."
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!input.trim()}
        >
          <SendIcon />
        </IconButton>
      </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message="AI响应出错，请稍后重试"
      />
    </Container>
  );
};

export default ChatUI;