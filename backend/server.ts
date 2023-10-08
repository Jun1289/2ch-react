const jsonServer = require('json-server')
// const serverMiddleware = require('./middleware.js')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)

server.use(jsonServer.bodyParser)

// コメント投稿
server.post('/threads/:threadId/comments', (req, res, next) => {
  const threadId = req.params.threadId;
  if (!threadId || isNaN(Number(threadId))) {
    return res.status(400).json({
      message: '無効なスレッドIDです'
    })
  }

  const comments = router.db.get('comments');
  const commentsForThread = comments.filter({ threadId }).size().value();
  console.log(commentsForThread)
  if (commentsForThread >= 10) {
    return res.status(400).json({
      message: 'スレッドのコメントは10個までです'
    })
  }

  if (!req.body.commentContent) {
    return res.status(401).json({
      message: 'コメントが入力されていません'
    })
  }

  if (!req.body.responder) {
    req.body.responder = '名無し'
  }

  const now = new Date().toISOString()
  req.body.createdAt = now

  next()
})

// スレッドの新規作成
server.post('/threads', (req, res, next) => {
  if (!req.body.title) {
    return res.status(401).json({
      message: 'スレッドのタイトルが入力されていません'
    })
  }

  if (!req.body.topic) {
    return res.status(401).json({
      message: 'スレッドのトピックが入力されていません'
    })
  }

  const now = new Date().toISOString()
  req.body.createdAt = now

  if (!req.body.builder) {
    req.body.builder = '名無し'
  }

  next()
})

// お気に入りに登録

// お気に入りから削除

// ログイン

// ログアウト

server.delete('/clear-comments', (req, res) => {
  router.db.get('comments').remove().write();
  res.status(200).send('すべてのコメントを削除しました');
});

server.delete('/clear-threads', (req, res) => {
  router.db.get('threads').remove().write();
  res.status(200).send('すべてのスレッドを削除しました');
});

server.delete('/threads/:threadId/comments', (req, res) => {
  const threadId = parseInt(req.params.threadId, 10);
  if (isNaN(threadId)) {
    return res.status(400).send('Invalid thread ID');
  }

  router.db.get('comments').remove({ threadId: threadId }).write();
  res.status(200).send(`スレッドID ${threadId} のスレッドの子マントを全て削除しました`);
});


server.use(router)
server.listen(8000, () => {
  console.log('JSON Server is running')
})