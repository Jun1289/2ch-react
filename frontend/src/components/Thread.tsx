import axios from "axios"
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReducer } from "react";
import { CommentForm } from "./CommentForm";
import { commentReducer, commentsInitialState, threadReducer, threadsInitialState } from "../reducers/reducers";

const formatDateTime = (dateString: string) => {
  const dateObj = new Date(dateString);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${year}/${month}/${day}-${hours}:${minutes}:${seconds}`;
}

export const Thread = () => {
  const { threadId } = useParams()
  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);
  const [threadsState, threadDispatch] = useReducer(threadReducer, threadsInitialState);

  // スレッドデータとコメントデータの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedThread = await axios.get(`/api/threads/${threadId}`)
        const thread = fetchedThread.data
        threadDispatch({ type: 'set_thread', currentThread: thread })
      } catch (error) {
        threadDispatch({
          type: 'set_error', error: `スレッドデータの取得でエラーが発生しました。${error}`
        })
      }
      try {
        const fetchedComments = await axios.get(`/api/threads/${threadId}/comments`)
        const comments = fetchedComments.data
        commentDispatch({ type: 'set_comments', comments: comments })
      } catch (error) {
        commentDispatch({ type: 'set_error', error: `コメントの取得でエラーが起きました。${error}` })
      }

    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])


  return (
    <>{
      (threadsState.isLoading || commentsState.isLoading) ? (
        null
      ) : (
        <div className="thread-wrapper content-wrapper">
          <section>
            <p className="thread_title">{threadsState.currentThread?.title}</p>
            <p>{threadsState.currentThread?.topic}</p>
          </section>
          <section>
            {(commentsState.comments && commentsState.comments.length != 0) ? (
              <ul>
                {commentsState.comments.map((comment) => (
                  <li key={`${threadId}${comment.commentNo}`}>
                    <div>
                      <span>{comment.commentNo}: {comment.commenter} : {formatDateTime(comment.createdAt)}</span>
                    </div>
                    <div>
                      {comment.commentContent}
                    </div>
                  </li>
                ))}
              </ul>
            ) :
              <div>コメントはまだありません</div>}
          </section>
          <CommentForm commentDispatch={commentDispatch} />
        </div>
      )
    }
    </>
  )
}
