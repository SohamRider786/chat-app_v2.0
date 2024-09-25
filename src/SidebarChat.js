import React, { useEffect, useState } from 'react';
import './SidebarChat.css';
import { Avatar } from '@material-ui/core';
import db from './firebase';
import { Link, useNavigate } from 'react-router-dom';
import { useStateValue } from './StateProvider';



function SidebarChat({ id, name,image, addNewChat }) {
  const navigate=useNavigate();
  const [{ user }, dispatch] = useStateValue();
  const [seed, setSeed] = useState('');
  const [messages, setMessages] = useState([]);
  var chatImg="";

  const userExists = async (mail) => {
    if (mail === user.email) {
      window.alert("You cannot chat with yourself");
      return false;
    } else {
      const snapshot = await db.collection('users').where('email', '==', mail).get();
      if (!snapshot.empty) {
        const imgData = await snapshot.docs[0].data().photo;
        if(imgData)
        chatImg=await imgData;
        return true;
      }
      return !snapshot.empty;
    }
  };

  useEffect(() => {
    if (id) {
      const unsubscribe = db
        .collection('userchats')
        .doc(id)
        .collection('messages')
        .orderBy('timestamp', 'desc')
        .onSnapshot((snapshot) =>
          setMessages(snapshot.docs.map((doc) => doc.data()))
        );

      return () => {
        unsubscribe(); // Unsubscribe from the messages collection when the component unmounts
      };
    }
  }, []);

  const createChat = async () => {
    const chatEmail = prompt('Please enter the person’s email:');
    if (chatEmail) {
      const exists = await userExists(chatEmail);
  
      if (exists) {
        // Check if the chat with this user already exists in 'userchats'
        const existingChatSnapshot = await db
          .collection('userchats')
          .where('from_email', '==', user.email)
          .where('to_email', '==', chatEmail)
          .get();
  
        // Also check the inverse to avoid duplicate chats in either direction
        const inverseChatSnapshot = await db
          .collection('userchats')
          .where('from_email', '==', chatEmail)
          .where('to_email', '==', user.email)
          .get();
  
        if (!existingChatSnapshot.empty || !inverseChatSnapshot.empty) {
          // Chat with this user already exists
          window.alert('Chat with this user already exists.');
          return;
        }
  
        // Proceed to create the chat if no existing chat is found
        await db.collection('userchats').add({
          to_email: chatEmail,
          from_email: user.email,
          from_img: user.photoURL,
          to_img: chatImg,
        });
        console.log('Chat created with image:', chatImg);
        navigate(`/`);
      } else {
        window.alert('No user with this email exists or the username is already in your existing chats.');
      }
    }
  };
  

  return !addNewChat ? (
    <Link to={`/chats/${id}`}>
      <div className='sidebarChat'>
        <Avatar src={image} />
        <div className='sidebarChat__info'>
          <h2>{name}</h2>
          <p>{messages[0]?.message}</p>
        </div>
      </div>
    </Link>
  ) : (
    <div onClick={createChat} className='sidebarChat'>
      <h2>Add New Chat</h2>
    </div>
  );
}

export default SidebarChat;
