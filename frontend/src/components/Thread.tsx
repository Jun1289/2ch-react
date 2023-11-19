import React from "react";
import axios from "axios"
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useReducer } from "react";
import { CommentForm } from "./CommentForm";
import { commentReducer, commentsInitialState, threadReducer, threadsInitialState } from "../reducers/reducers";

// 日付のフォーマット
const formatDateTime = (dateString: string) => {
  const [datePart, timePart] = dateString.split('T');
  const [year, month, day] = datePart.split('-');
  const [time] = timePart.split('+'); // タイムゾーン情報を無視する
  const [hours, minutes, seconds] = time.split(':');

  return `${year}/${month}/${day}-${hours}:${minutes}:${seconds}`;
};

export const Thread = () => {
  const { threadId } = useParams()
  const [commentsState, commentDispatch] = useReducer(commentReducer, commentsInitialState);
  const { comments, isLoading: commentsIsLoading, error: commentsError } = commentsState
  const [threadsState, threadDispatch] = useReducer(threadReducer, threadsInitialState);
  const { currentThread, isLoading: threadsIsLoading, error: threadsError } = threadsState

  // スレッドデータとコメントデータの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 現在のページのスレッドの取得
        const fetchedThreadData = await axios.get(`/api/threads/${threadId}`)
        const threadData = fetchedThreadData.data
        // スレッドの取得が成功したら、スレッドのデータをセット
        threadDispatch({ type: 'set_thread', currentThread: threadData })
      } catch (error) {
        threadDispatch({ type: 'set_error', error: `スレッドデータの取得でエラーが発生しました。${error}` })
      }
      try {
        // 現在のページのスレッドのコメントの取得
        const fetchedCommentsData = await axios.get(`/api/threads/${threadId}/comments`)
        const commentsData = fetchedCommentsData.data
        // コメントの取得が成功したら、コメントのデータをセット
        commentDispatch({ type: 'set_comments', comments: commentsData })
      } catch (error) {
        commentDispatch({ type: 'set_error', error: `コメントの取得でエラーが起きました。${error}` })
      }
    }
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadId])


  return (
    <>{
      (threadsIsLoading || commentsIsLoading) ? (
        null
      ) : (
        < div className="thread-wrapper content-wrapper">
          {threadsError && (
            <p className="error">{threadsError}</p>
          )}
          {commentsError && (
            <p className="error">{commentsError}</p>
          )}
          <section>
            <p className="thread_title">{currentThread?.title}</p>
            <p>{currentThread?.topic}</p>
          </section>
          <section>
            {(comments && comments.length != 0) ? (
              <ul>
                {comments.map((comment) => (
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
        </div >
      )
    }
    </>
  )
}
