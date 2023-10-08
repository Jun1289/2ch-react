const dotenv = require('dotenv')
dotenv.config()
// import * as jsonServer from 'json-server'
const jsonServer = require('json-server')
// const serverMiddleware = require('./middleware.js')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const nfetch = require('node-fetch')

server.use(middlewares)

server.use(jsonServer.bodyParser)

// コメント投稿
server.post('/threads/:threadId/comments', (req, res, next) => {
  const threadId = req.params.threadId;
  if (isNaN(Number(threadId))) {
    return res.status(400).json({
      message: '無効なスレッドIDです'
    })
  }

  const comments = router.db.get('comments') as any;
  const commentsForThread = comments.filter({ threadId }).size().value();
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


// ユーザ新規登録
server.post("/users/register", async (req, res) => {
  try {
    const { name, password } = req.body;

    const usersExist = await nfetch("http://localhost:8000/users")
    const users = await usersExist.json()
    const user = users.find((user) => name === user.name)

    if (user) {
      return res.status(400).json({ message: "既に使用されているユーザ名です。他のユーザ名を入力してください" })
    }

    // jwt.sign の第一引数は トークンのペイロード（ユーザの認証情報）、第二引数は秘密鍵の情報、第三引数はオプション（今回はトークンの有効期限を10分に設定）
    const token = jwt.sign({ name }, process.env.ACCESS_TOKEN_SELECT, {
      expiresIn: "10m",
    })
    // bcrypt.hash の第二引数は salt rounds(ハッシュ化を行う回数)
    const hashedPassword = await bcrypt.hash(password, 10)

    const response = await nfetch("http://localhost:8000/users", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        hashedPassword,
        token
      }),
    });

    const newUser = await response.json();

    res.cookie("token", token, { httpOnly: true })

    res.status(200).json({ message: "新しくユーザが作成されました", newUser })
  } catch (error) {
    console.log(error)
    res.status(405).json(error);
  }
});

// ログイン
server.post("/users/signin", async (req, res) => {
  try {
    const inputUserName = req.body.name
    const inputPassword = req.body.password
    const usersExist = await nfetch("http://localhost:8000/users")
    const users = await usersExist.json()
    const user = users.find((user) => inputUserName == user.name)
    const match = await bcrypt.compare(inputPassword, user.hashedPassword)

    if (!user && !match) {
      return res.status(400).json({ message: "ユーザ名とパスワードが間違っています" })
    }
    if (!user) {
      return res.status(400).json({ message: "ユーザ名が間違っています" })
    }
    if (!match) {
      return res.status(400).json({ message: "パスワードが間違っています" })
    }

    const token = jwt.sign(
      { inputUserName },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "10m", }
    )

    res.status(200).json({
      message: "ログインに成功しました",
      ...user,
      newToken: token,
    })
  } catch (error) {
    console.log(error)
    res.status(400).json(error)
  }
})

// ログアウト


server.delete('/clear-comments', (req, res) => {
  (router.db.get('comments') as any).remove().write();
  res.status(200).send('すべてのコメントを削除しました');
});

server.delete('/clear-threads', (req, res) => {
  (router.db.get('threads') as any).remove().write();
  res.status(200).send('すべてのスレッドを削除しました');
});

server.delete('/threads/:threadId/comments', (req, res) => {
  const threadId = parseInt(req.params.threadId, 10);
  if (isNaN(threadId)) {
    return res.status(400).send('Invalid thread ID');
  }

  (router.db.get('comments') as any).remove({ threadId: threadId }).write();
  res.status(200).send(`スレッドID ${threadId} のスレッドの子マントを全て削除しました`);
});


server.use(router)
server.listen(8000, () => {
  console.log('JSON Server is running')
})
