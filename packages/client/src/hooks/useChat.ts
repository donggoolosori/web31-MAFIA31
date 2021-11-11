import { MESSAGE, PUBLISH_MESSAGE } from '@mafia/domain/constants/event';
import { Message } from '@mafia/domain/types/chat';
import { useEffect, useState } from 'react';

const useChat = (socketRef: any) => {
  const [chatList, setChatList] = useState<Message[]>([]);
  const updateChatList = (msg: Message): void => {
    setChatList((prev) => [...prev, msg]);
  };

  useEffect(() => {
    socketRef.current?.on(PUBLISH_MESSAGE, updateChatList);

    return () => {
      socketRef.current.off(PUBLISH_MESSAGE, updateChatList);
    };
  }, [socketRef.current]);

  const sendChat = (msg: Message): void => {
    if (msg.msg === '') return;
    socketRef.current?.emit(MESSAGE, msg);
  };

  return { chatList, sendChat };
};

export default useChat;
