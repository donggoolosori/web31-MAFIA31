/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import useTimer from '@src/hooks/useTimer';
import useSocket from '@hooks/useSocket';
import useExecute from '@hooks/useExecute';
import useVote from '@hooks/useVote';
import useChat from '@hooks/useChat';
import useAbility from '@src/hooks/useAbility';
import { primaryDark, primaryLight, titleActive, white } from '@constants/index';
import ChatContainer from '@containers/ChatContainer';
import LeftSideContainer from '@containers/LeftSideContainer';
import RightSideContainer from '@containers/RightSideContainer';
import { useEffect } from 'react';
import useGame from '@src/hooks/useGame';

const Game = () => {
  const myUserName = 'user1';
  const { socketRef, socketId } = useSocket('123e4567-e89b-12d3-a456-426614174000');
  const playerStateList = useExecute(socketRef);
  const { chatList, sendChat, sendNightChat } = useChat(socketRef);
  const { playerList, voteUser } = useVote(socketRef, myUserName);
  const { timer, isNight } = useTimer(socketRef);
  const { emitAbility, mafiaPickList } = useAbility(socketRef, socketId!, 'user1', 'mafia');
  const { myJob } = useGame(socketRef);

  useEffect(() => {
    console.log('night', isNight);
  }, [isNight]);

  return (
    <div css={GamePageStyle(isNight)}>
      <LeftSideContainer
        playerStateList={playerStateList}
        playerList={playerList}
        myUserName={myUserName}
        timer={timer}
        voteUser={voteUser}
        emitAbility={emitAbility}
        mafiaPickList={mafiaPickList}
        isNight={isNight}
        socketRef={socketRef}
      />
      <ChatContainer
        chatList={chatList}
        sendChat={sendChat}
        sendNightChat={sendNightChat}
        isNight={isNight}
      />
      <RightSideContainer playerStateList={playerStateList} myJob={myJob} isNight={isNight} />
    </div>
  );
};

const GamePageStyle = (isNight: boolean) => css`
  display: flex;

  height: 100vh;
  color: ${isNight ? white : titleActive};
  background-color: ${isNight ? primaryDark : primaryLight};
`;

export default Game;
