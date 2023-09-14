import React from 'react';
import classNames from 'classnames';
import Header from './Header';
import Droppable from './Droppable';
import Avatars from '@/Avatars';
import GridRow from '@/GridRow';
import Votes from '@/Votes';
import styles from './index.module.scss';
import {
  Permissions,
  Settings,
  SerializedAccount,
  SerializedThread,
  SerializedTopic,
  SerializedUser,
  ReminderTypes,
  onResolve,
  ThreadState,
  SerializedMessage,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import { FiMessageCircle } from '@react-icons/all-files/fi/FiMessageCircle';
import { FiUsers } from '@react-icons/all-files/fi/FiUsers';
import { FiUser } from '@react-icons/all-files/fi/FiUser';
import { FiCheck } from '@react-icons/all-files/fi/FiCheck';
import { uniqueUsers } from './utilities/uniqueUsers';
import { getUserMentions } from './utilities/mentions';
import { FiAtSign } from '@react-icons/all-files/fi/FiAtSign';
import { FiAlertCircle } from '@react-icons/all-files/fi/FiAlertCircle';
import { isAuthorActive } from '@linen/utilities/isAuthorActive';

interface Props {
  className?: string;
  thread: SerializedThread;
  topic?: SerializedTopic;
  permissions?: Permissions;
  isBot?: boolean;
  isSubDomainRouting: boolean;
  settings: Settings;
  currentUser: SerializedUser | null;
  currentCommunity?: SerializedAccount;
  mode?: Mode;
  showActions?: boolean;
  showAvatar?: boolean;
  showHeader?: boolean;
  showVotes?: boolean;
  showMessages?: boolean;
  avatarSize?: 'sm' | 'md' | 'xl';
  subheader?: React.ReactNode;
  truncate?: boolean;
  onClick?(): void;
  onDelete?(messageId: string): void;
  onEdit?(threadId: string, messageId: string): void;
  onLoad?(): void;
  onMute?(threadId: string): void;
  onUnmute?(threadId: string): void;
  onPin?(threadId: string): void;
  onStar?(threadId: string): void;
  onResolution?: onResolve;
  onReaction?({
    threadId,
    messageId,
    type,
    active,
  }: {
    threadId: string;
    messageId: string;
    type: string;
    active: boolean;
  }): void;
  onDrop?({
    source,
    target,
    from,
    to,
  }: {
    source: string;
    target: string;
    from: string;
    to: string;
  }): void;
  onRead?(threadId: string): void;
  onRemind?(threadId: string, reminder: ReminderTypes): void;
  onUnread?(threadId: string): void;
  onImageClick?(src: string): void;
  activeUsers: string[];
}

function Row({
  className,
  thread,
  topic,
  permissions,
  isBot = false,
  isSubDomainRouting,
  settings,
  currentUser,
  currentCommunity,
  mode,
  showActions,
  showAvatar,
  showHeader,
  showVotes,
  showMessages,
  avatarSize,
  subheader,
  truncate,
  onClick,
  onDelete,
  onEdit,
  onDrop,
  onLoad,
  onMute,
  onUnmute,
  onPin,
  onStar,
  onResolution,
  onReaction,
  onRead,
  onRemind,
  onUnread,
  onImageClick,
  activeUsers,
}: Props) {
  const { messages } = thread;
  const message = topic
    ? messages.find(({ id }) => id === topic.messageId)!
    : messages[0];

  if (!message) {
    return <></>;
  }
  let users = messages.map((m) => m.author).filter(Boolean) as SerializedUser[];
  const authors = uniqueUsers(users);
  const avatars = authors
    .filter((user) => user.id !== message.author?.id)
    .map((a) => ({
      src: a.profileImageUrl,
      text: a.displayName,
    }));

  const userMentions = getUserMentions({ currentUser, thread });
  const userMentionCount = userMentions.filter(
    (mention) => mention === 'user'
  ).length;
  const signalMentionCount = userMentions.filter(
    (mention) => mention === 'signal'
  ).length;

  return (
    <Droppable
      id={thread.id}
      className={styles.container}
      onClick={onClick}
      onDrop={onDrop}
    >
      <GridRow
        className={className}
        thread={thread}
        message={message}
        isSubDomainRouting={isSubDomainRouting}
        isBot={isBot}
        settings={settings}
        permissions={permissions}
        currentUser={currentUser}
        mode={mode}
        drag="thread"
        truncate={truncate}
        showActions={showActions}
        showAvatar={showAvatar}
        avatarSize={avatarSize}
        onDelete={onDelete}
        onEdit={onEdit}
        onLoad={onLoad}
        onMute={onMute}
        onUnmute={onUnmute}
        onPin={onPin}
        onStar={onStar}
        onResolution={onResolution}
        onReaction={onReaction}
        onRead={onRead}
        onRemind={onRemind}
        onUnread={onUnread}
        onImageClick={onImageClick}
        header={
          showHeader &&
          (thread.title || thread.channel?.viewType === 'TOPIC') && (
            <Header thread={thread} message={message} />
          )
        }
        subheader={subheader}
        info={
          thread.state === ThreadState.CLOSE && (
            <FiCheck className={styles.check} />
          )
        }
        footer={({ inView }) => {
          const renderVotes =
            (showVotes && onReaction) ||
            (thread?.channel?.viewType === 'FORUM' && onReaction);
          const renderMessages = showMessages && messages.length > 1;
          const showFooter = renderVotes || renderMessages;
          return (
            showFooter && (
              <div className={styles.footer}>
                {renderVotes && (
                  <Votes
                    thread={thread}
                    currentUser={currentUser}
                    onReaction={onReaction}
                  />
                )}
                {renderMessages && (
                  <>
                    <Avatars
                      size="sm"
                      users={avatars}
                      placeholder={!inView || isBot}
                      isBot={isBot}
                    />
                    <ul className={styles.list}>
                      <li className={styles.info}>
                        {authors.length}{' '}
                        {authors.length > 1 ? <FiUsers /> : <FiUser />}
                      </li>
                      <li className={styles.info}>
                        {messages.length - 1} <FiMessageCircle />
                      </li>
                      {userMentionCount > 0 && (
                        <li className={styles.info}>
                          {userMentionCount} <FiAtSign />
                        </li>
                      )}
                      {signalMentionCount > 0 && (
                        <li
                          className={classNames(styles.info, {
                            [styles.signal]: userMentions.includes('signal'),
                          })}
                        >
                          {signalMentionCount} <FiAlertCircle />
                        </li>
                      )}
                    </ul>
                  </>
                )}
              </div>
            )
          );
        }}
        isUserActive={isAuthorActive(message?.author, currentUser, activeUsers)}
      />
    </Droppable>
  );
}

Row.defaultProps = {
  showHeader: true,
};

export default Row;
