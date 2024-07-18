import React, { useEffect, useState } from 'react';
import './Chat.css';
import { Avatar, IconButton } from '@material-ui/core';
import InsertEmoticonIcon from '@material-ui/icons/InsertEmoticon';
import MicIcon from '@material-ui/icons/Mic';
import { AttachFile, SearchOutlined, MoreVert } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import db from './firebase';
import firebase from 'firebase/compat/app';
import { useStateValue } from './StateProvider';

function Chat() {
  const [input, setInput] = useState('');
  const [seed, setSeed] = useState('');
  const { chatId } = useParams();
  const [chatName, setChatName] = useState('');
  const [messages, setMessages] = useState([]);
  const [{ user }, dispatch] = useStateValue();
  const [chatimg,setChatImg]=useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (chatId) {
        try {
          const docRef = await db.collection('userchats').doc(chatId).get();
          const docData = docRef.data();
          console.log("the doc data is>>",docData);//for debugging
          if (docData) {
            setChatName(docData.from_email === user?.email ? docData.to_email : docData.from_email);
            setChatImg(docData.from_email === user?.email ? docData.to_img : docData.from_img);
          }

          const unsubscribe = db
            .collection('userchats')
            .doc(chatId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .onSnapshot((snapshot) => {
              setMessages(snapshot.docs.map((doc) => doc.data()));
            });

          return () => {
            unsubscribe(); // Unsubscribe from the messages collection when the component unmounts
          };
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };

    fetchData();
  }, [chatId, user]);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 5000));
  }, [chatId]);

  const sendMessage = (e) => {
    e.preventDefault();
    console.log('You typed:', input);

    db.collection('userchats').doc(chatId).collection('messages').add({
      message: input,
      name: user.email,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setInput('');
  };

  return (
    <div className='chat'>
      <div className='chat__header'>
        <Avatar src={chatimg} />
        <div className='chat__headerInfo'>
          <h3>{chatName}</h3>
          <p>Last message at {' '}
          {new Date(messages[messages.length - 1]?.timestamp?.toDate()).toUTCString()}
          </p>
        </div>
        <div className='chat__headerRight'>
          <IconButton>
            <SearchOutlined />
          </IconButton>
          <IconButton>
            <AttachFile />
          </IconButton>
          <IconButton>
            <MoreVert />
          </IconButton>
        </div>
      </div>
      <div className='chat__body'>
        {messages.map((message, index) => (
          <p
            key={index}
            className={`chat__message ${message.name === user.email && 'chat__reciever'}`}
          >
            <span className='chat__name'>{message.name}</span>
            {message.message}
            <span className='chat__timestamp'>
              {new Date(message.timestamp?.toDate()).toUTCString()}
            </span>
          </p>
        ))}
      </div>
      <div className='chat__footer'>
        <InsertEmoticonIcon />
        <form>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Type a message'
            type='text'
          />
          <button onClick={sendMessage} type='submit'>
            Send a Message
          </button>
        </form>
        <MicIcon />
      </div>
    </div>
  );
}

export default Chat;
