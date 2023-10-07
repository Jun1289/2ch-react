const jsonServer = require('json-server')
// const serverMiddleware = require('./middleware.js')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)

server.use(jsonServer.bodyParser)
server.post('/threads/:threadId/comments', (req, res, next) => {
  const threadId = parseInt(req.params.threadId, 10);
  if (isNaN(threadId)) {
    return res.status(400).send('Invalid thread ID');
  }
  const comments = router.db.get('comments');
  const totalComments = comments.size().value();
  if (totalComments >= 10) {
    return res.status(401).json({
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
  req.body.createdAt = Date.now()

  if (!req.body.builder) {
    req.body.builder = '名無し'
  }
  next()
})

server.delete('/clear-comments', (req, res) => {
  router.db.get('comments').remove().write();
  res.status(200).send('すべてのコメントを削除しました');
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
