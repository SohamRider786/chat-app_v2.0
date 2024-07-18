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
  }, [id]);

  const createChat = async () => {
    const chatEmail = prompt('Please enter person email:');
    if (chatEmail) {
      const exists = await userExists(chatEmail);
      if (exists) {
        // Use the then callback to ensure setChatImg completes before proceeding
          db.collection('userchats').doc(id).set({
            to_email: chatEmail,
            from_email: user.email,
            from_img: user.photoURL,
            to_img: chatImg , 
          });
          console.log("the other chatimg is>>>",chatImg);
          navigate(`/`);
      } else {
        window.alert('No user with this Email exists or the username is already in your existing chats');
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
