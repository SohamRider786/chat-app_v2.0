import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { Avatar, IconButton } from '@material-ui/core';
import DonutLarge from '@material-ui/icons/DonutLarge';
import ChatIcon from '@material-ui/icons/Chat';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchOutlined from '@material-ui/icons/SearchOutlined';
import SidebarChat from './SidebarChat';
import db from './firebase';
import { useStateValue } from './StateProvider';

function Sidebar() {
  const [chats, setChats] = useState([]);
  const [{ user }, dispatch] = useStateValue();

  useEffect(() => {
    const loadChats = async () => {
      try {
        const snapshot = await db.collection('userchats')
          .where("from_email", "==", user?.email)
          .get();

        const snapshot2 = await db.collection('userchats')
          .where("to_email", "==", user?.email)
          .get();

        const combinedSnapshot = [...snapshot.docs, ...snapshot2.docs];

        if (combinedSnapshot.length > 0) {
          setChats(combinedSnapshot.map(doc => ({
            id: doc.id,
            data: doc.data()
          })));
        }
      } catch (error) {
        console.error("Error loading chats:", error);
      }
    };

    loadChats();
  }, [chats]);

  return (
    <div className='sidebar'>
      <div className='sidebar__header'>
        <Avatar src={user?.photoURL}/>
        <div className='sidebar__headerRight'>
          <IconButton>
            <DonutLarge />
          </IconButton>
          <IconButton>
            <ChatIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </div>
      </div>
      <div className='sidebar__search'>
        <div className='sidebar__searchContainer'>
          <SearchOutlined/>
          <input placeholder='Search or start new chat' type='text'/>
        </div>
      </div>
      <div className='sidebar__chats'>
        <SidebarChat addNewChat/>
        {chats.map(chat => {
          const name = chat.data.from_email === user.email ? chat.data.to_email : chat.data.from_email;
          const img=chat.data.from_img===user.photoURL?chat.data.to_img:chat.data.from_img;
          return (
            <SidebarChat key={chat.id} id={chat.id} name={name} image ={img}/>
          );
        })}
      </div>
    </div>
  );
}

export default Sidebar;
