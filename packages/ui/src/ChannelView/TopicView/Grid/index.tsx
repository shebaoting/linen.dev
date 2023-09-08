import React, { useState } from 'react';
import classNames from 'classnames';
import Line from '@/Line';
import {
  Permissions,
  Priority,
  ReminderTypes,
  SerializedAccount,
  SerializedChannel,
  SerializedReadStatus,
  SerializedThread,
  SerializedTopic,
  SerializedUser,
  Settings,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import usePriority from '@linen/hooks/priority';
import styles from './index.module.scss';
import DefaultRow from '@/Row';
import ImagePreview from '@/ImagePreview';
import { getImageUrls } from './utilities/threads';

enum RowType {
  Topic,
  ReadStatus,
}

interface RowItem {
  type: RowType;
  content: SerializedThread | SerializedReadStatus;
  topic: SerializedTopic;
  timestamp: number;
}

export default function Grid({
  className,
  currentChannel,
  currentCommunity,
  threads,
  topics,
  permissions,
  readStatus,
  isSubDomainRouting,
  currentThreadId,
  settings,
  isBot,
  currentUser,
  mode,
  onClick,
  onDelete,
  onDrop,
  onEdit,
  onLoad,
  onMute,
  onUnmute,
  onPin,
  onStar,
  onReaction,
  onRead,
  onRemind,
  onUnread,
  Row = DefaultRow,
  activeUsers,
}: {
  className?: string;
  currentChannel: SerializedChannel;
  currentCommunity: SerializedAccount;
  threads: SerializedThread[];
  topics: SerializedTopic[];
  permissions: Permissions;
  readStatus?: SerializedReadStatus;
  isSubDomainRouting: boolean;
  currentThreadId?: string;
  settings: Settings;
  isBot: boolean;
  currentUser: SerializedUser | null;
  mode?: Mode;
  onClick: (threadId: string) => void;
  onDelete: (messageId: string) => void;
  onEdit?: (threadId: string) => void;
  onMute?: (threadId: string) => void;
  onUnmute?: (threadId: string) => void;
  onPin: (threadId: string) => void;
  onStar: (threadId: string) => void;
  onReaction({
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
  onRemind?(threaId: string, reminder: ReminderTypes): void;
  onUnread?(threadId: string): void;
  onLoad?(): void;
  Row?: typeof DefaultRow;
  activeUsers: string[];
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const images = getImageUrls(threads);
  const rows = [
    readStatus &&
      !readStatus.read && {
        type: RowType.ReadStatus,
        content: readStatus,
        timestamp: Number(readStatus.lastReadAt),
      },
    ...topics
      // .filter((thread) => thread.messages.length > 0)
      .map((topic) => {
        const thread = threads.find(({ id }) => id === topic.threadId);
        return {
          type: RowType.Topic,
          content: thread,
          topic,
          timestamp: new Date(topic.sentAt),
        };
      })
      .filter((topic) => !!topic.content),
  ].filter(Boolean) as RowItem[];

  const sorted = rows.sort((a, b) => {
    return a.timestamp - b.timestamp;
  });
  const { priority } = usePriority();

  function onImageClick(src: string) {
    setPreview(src);
  }

  return (
    <div
      className={classNames(className, {
        [styles.mouse]: priority === Priority.MOUSE,
        [styles.forum]: currentChannel.viewType === 'FORUM',
      })}
    >
      {sorted.map((item, index) => {
        const last = index === sorted.length - 1;
        if (item.type === RowType.ReadStatus && !last) {
          return (
            <li key={`inbox-line`}>
              <Line className={styles.line}>New</Line>
            </li>
          );
        } else if (item.type === RowType.Topic) {
          // Maybe put this in the backend on topic and propagate it to the frontend??
          let previousThread = null;
          let previousMessage = null;
          let nextMessage;
          let nextThread = null;

          if (index > 0) {
            const previousItem = sorted[index - 1];
            const previousMessageId = previousItem.topic.messageId;
            previousThread = previousItem.content as SerializedThread;
            previousMessage = previousThread.messages.find(
              ({ id }) => id === previousMessageId
            );
          }
          if (index < sorted.length - 1) {
            const nextItem = sorted[index + 1];
            const nextMessageId = nextItem.topic.messageId;
            nextThread = nextItem.content as SerializedThread;
            nextMessage = nextThread.messages.find(
              ({ id }) => id === nextMessageId
            );
          }
          const thread = item.content as SerializedThread;
          const { incrementId, slug, id } = thread;
          return (
            <li
              key={`channel-grid-item-${item.topic.messageId}`}
              className={classNames(styles.li, {
                [styles.active]: thread.id === currentThreadId,
              })}
            >
              <Row
                // incrementId={incrementId}
                // slug={slug}
                className={styles.row}
                thread={thread}
                topic={item.topic}
                permissions={permissions}
                isSubDomainRouting={isSubDomainRouting}
                settings={settings}
                currentUser={currentUser}
                currentCommunity={currentCommunity}
                mode={mode}
                onClick={() => onClick(id)}
                onDelete={onDelete}
                onEdit={onEdit}
                onDrop={onDrop}
                onMute={onMute}
                onUnmute={onUnmute}
                onPin={onPin}
                onStar={onStar}
                onReaction={onReaction}
                onRead={onRead}
                onRemind={onRemind}
                onUnread={onUnread}
                onLoad={onLoad}
                onImageClick={onImageClick}
                previousMessage={previousMessage}
                previousThread={previousThread}
                nextMessage={nextMessage}
                nextThread={nextThread}
                activeUsers={activeUsers}
              />
            </li>
          );
        }
      })}
      {preview && (
        <ImagePreview
          current={preview}
          images={images}
          onClick={() => setPreview(null)}
        />
      )}
    </div>
  );
}
