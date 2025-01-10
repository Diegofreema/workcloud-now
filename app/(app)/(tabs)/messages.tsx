import { usePaginatedQuery } from 'convex/react';
import React from 'react';

import { ChatPreviewSkeleton } from '~/components/ChatPreviewSkeleton';
import { Conversations } from '~/components/Conversations';
import { SearchHeader } from '~/components/SearchHeader';
import { Container } from '~/components/Ui/Container';
import { api } from '~/convex/_generated/api';
import { useGetUserId } from '~/hooks/useGetUserId';

const Messages = () => {
  const { id } = useGetUserId();
  const { results, status, loadMore, isLoading } = usePaginatedQuery(
    api.conversation.getConversations,
    {
      userId: id!,
      type: 'all',
    },
    { initialNumItems: 20 }
  );

  if (isLoading) {
    return <ChatPreviewSkeleton length={15} />;
  }
  return (
    <Container noPadding>
      <SearchHeader placeholder="Search by name" />
      <Conversations conversations={results} status={status} loadMore={loadMore} />
    </Container>
  );
};

export default Messages;
