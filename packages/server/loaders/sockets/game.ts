import { Namespace, Socket } from 'socket.io';
import { GameResult, Job } from '../../../domain/types/game';
import { Vote } from '../../../domain/types/vote';
import { canVote, startVoteTime } from './vote';

interface VoteInfo {
  [key: string]: {
    [key: string]: number;
  };
}
interface UserInfo {
  [key: string]: {
    [key: string]: Object;
  };
}

interface DashBoard {
  mafia: number;
  citizen: number;
}

const GAME_OVER_CHANNEL = 'gameover';
const GAME_START_CHANNEL = 'gamestart';
const TIMER_CHANNEL = 'timer';
const TURN_CHANGE_CHANNEL = 'turnchange';
const VOTE = 'vote';
const PUBLISH_VOTE = 'publish vote';

const userInfo: UserInfo = { hi: { user1: {}, user2: {}, user3: {} } };
const voteInfo: VoteInfo = {};
const getVoteInfo = (roomId: string) => voteInfo[roomId];
const getUserInfo = (roomId: string) => userInfo[roomId];

const resetVoteInfo = (roomId: string) => {
  Object.keys(userInfo[roomId]).forEach((user) => {
    voteInfo[roomId][user] = 0;
  });
};

const checkEnd = (dashBoard: DashBoard) => {
  if (dashBoard.mafia >= dashBoard.citizen) {
    return true;
  }
  if (dashBoard.mafia === 0) {
    return true;
  }
  return false;
};

const getGameResult = (dashBoard: DashBoard, jobAssignment: Job[]): GameResult[] => {
  if (dashBoard.mafia === 0) {
    return jobAssignment.map((el) => ({ ...el, result: el.job === 'citizen' }));
  }
  return jobAssignment.map((el) => ({ ...el, result: el.job === 'mafia' }));
};

const gameSocketInit = (namespace: Namespace, socket: Socket, roomId: string): void => {
  voteInfo[roomId] = {};
  resetVoteInfo(roomId);

  // 직업 배정 로직으로 초기화 할 값 (dashBoard, jobAssignment)
  const dashBoard: DashBoard = { mafia: 2, citizen: 6 };
  const jobAssignment: Job[] = [
    { userName: 'a', job: 'mafia' },
    { userName: 'b', job: 'mafia' },
    { userName: 'c', job: 'citizen' },
    { userName: 'd', job: 'citizen' },
    { userName: 'e', job: 'citizen' },
    { userName: 'f', job: 'citizen' },
    { userName: 'g', job: 'citizen' },
    { userName: 'h', job: 'citizen' },
  ];

  socket.on(VOTE, (vote: Vote) => {
    if (!canVote()) return;

    voteInfo[roomId][vote.to] += 1;
    namespace.to(roomId).emit(PUBLISH_VOTE, vote);
  });

  socket.on(GAME_START_CHANNEL, () => {
    let counter = 0;
    const interval = 60;
    let isNight: boolean = true;

    const gameInterval = setInterval(() => {
      if (counter % interval === 0) {
        if (checkEnd(dashBoard)) {
          namespace.to(roomId).emit(GAME_OVER_CHANNEL, getGameResult(dashBoard, jobAssignment));
          clearInterval(gameInterval);
        }

        isNight = !isNight;
        if (!isNight) {
          startVoteTime(namespace, roomId, 6000);
        }
        namespace.to(roomId).emit(TURN_CHANGE_CHANNEL, isNight);
      }

      const remainSecond = interval - (counter % interval);
      namespace.to(roomId).emit(TIMER_CHANNEL, remainSecond);

      counter += 1;
    }, 1000);
  });
};

export { resetVoteInfo, getUserInfo, getVoteInfo };

export default gameSocketInit;