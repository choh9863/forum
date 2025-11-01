import { useComments } from '../../hooks/useComments';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import Loading from '../common/Loading';

interface CommentListProps {
  postId: string;
}

export default function CommentList({ postId }: CommentListProps) {
  const { data: comments, isLoading } = useComments(postId);

  if (isLoading) {
    return <Loading />;
  }

  const topLevelComments = comments?.filter(comment => !comment.parentId) || [];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          댓글 {comments?.length || 0}개
        </h2>

        <CommentForm postId={postId} />

        <div className="mt-6 space-y-4">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              replies={comments?.filter(c => c.parentId === comment.id) || []}
            />
          ))}
        </div>

        {topLevelComments.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            첫 댓글을 작성해보세요!
          </p>
        )}
      </div>
    </div>
  );
}
