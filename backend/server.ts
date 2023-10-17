const dotenv = require('dotenv')
dotenv.config()
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const nfetch = require('node-fetch')
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(cookieParser());
server.use(jsonServer.bodyParser)

const BASE_URL = "http://localhost:8000";

// 引数のユーザ名と一致するユーザを返す関数
const getUserByName = async (name) => {
  const fetchedUsers = await nfetch(`${BASE_URL}/users`);
  const users = await fetchedUsers.json();
  return users.find((user) => name === user.name);
}

// ローカルマシンのフロント炎からのリクエストのみ許可する
const allowedOrigins = ["http://127.0.0.1:5173"];

server.use(cors({
  origin: function (origin, callback) {
    // 同一オリジンからのアクセスは許可
    if (!origin) return callback(null, true);
    // リクエストしてきた origin が allowedOrigins にない場合はアクセス拒否 
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    // リクエストしてきた origin が allowedOrigins にある場合はアクセス許可 
    return callback(null, true);
  },
  credentials: true
}));


// コメント投稿
server.post('/threads/:threadId/comments', async (req, res, next) => {
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
    return res.status(400).json({
      message: 'コメントが入力されていません'
    })
  }

  const now = new Date().toISOString()

  // スレッドのupdatedAt パラメータの値をコメントの投稿日時に更新
  try {
    const threadResponse = await nfetch(`http://localhost:8000/threads/${threadId}`);
    if (!threadResponse.ok) {
      throw new Error('スレッドのデータを取得できませんでした');
    }
    const threadData = await threadResponse.json();

    threadData.updatedAt = now;
    ++threadData.commentTotal;

    const updateResponse = await nfetch(`http://localhost:8000/threads/${threadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(threadData)
    });

    if (!updateResponse.ok) {
      throw new Error('スレッドのupdatedAt パラメータの更新に失敗しました');
    }

  } catch (error) {
    console.error('スレッドの updatedAt パラメータの更新処理に失敗しました:', error);
    return res.status(500).json({ message: '内部処理のエラーです' });
  }

  if (!req.body.responder) {
    req.body.responder = '名無し'
  }

  req.body.createdAt = now

  req.body.commentNo = commentsForThread + 1

  next()
})

// スレッドの新規作成
server.post('/threads', (req, res, next) => {
  if (!req.body.title) {
    return res.status(400).json({
      message: 'スレッドのタイトルが入力されていません'
    })
  }

  if (!req.body.topic) {
    return res.status(400).json({
      message: 'スレッドのトピックが入力されていません'
    })
  }

  const now = new Date().toISOString()
  req.body.createdAt = now
  req.body.updatedAt = now

  req.body.commentTotal = 0
  if (!req.body.builder) {
    req.body.builder = '名無し'
  }

  next()
})

// ユーザがログインしているかチェック
server.use((req, res, next) => {
  if (req.cookies.token) {
    try {
      const user = jwt.verify(req.cookies.token, process.env.ACCESS_TOKEN_SECRET);
      req.user = user;
      console.log("ログインチェックを通りました。")
    } catch (err) {
      res.status(401).json({ message: '無効なトークンです' });
    }
  }
  next();
});

// スレッドをお気に入りに登録・登録削除
server.post('/users/:id/toggle-favorite/:threadId', (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const threadId = req.params.threadId;

  const users = router.db.get('users').value();
  const user = users.find(user => user.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'ユーザが見つかりませんでした' });
  }

  // like 配列に threadId が存在するか確認し、存在すれば削除、存在しなければ追加
  const index = user.likes.indexOf(threadId);
  if (index > -1) {
    user.likes.splice(index, 1);
  } else {
    user.likes.push(threadId);
  }

  // 更新したユーザデータで元のユーザデータを更新
  router.db.get('users')
    .find({ id: userId })
    .assign(user)
    .write();

  res.status(200).json({ message: 'お気に入りの切り替えに成功しました', user });
});

// ユーザ新規登録
server.post("/users/register", async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await getUserByName(name)
    if (user) {
      return res.status(400).json({ message: "既に使用されているユーザ名です。他のユーザ名を入力してください" })
    }

    // jwt.sign の第一引数は トークンのペイロード（ユーザの認証情報）、第二引数は秘密鍵の情報、第三引数はオプション（今回はトークンの有効期限を10分に設定）
    const token = jwt.sign({ name }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "24h",
    })
    // bcrypt.hash の第二引数は salt rounds(ハッシュ化を行う回数)
    const hashedPassword = await bcrypt.hash(password, 10)

    const response = await nfetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        hashedPassword,
        likes: [],
        token
      }),
    });

    const newUser = await response.json();

    res.cookie("token", token, { httpOnly: false, secure: false, path: '/' })

    res.status(200).json({
      ...newUser,
      newToken: token,
    })
  } catch (error) {
    res.status(400).json(error);
  }
});

// ログイン
server.post("/users/signin", async (req, res) => {
  try {
    const inputName = req.body.name
    const inputPassword = req.body.password

    const user = await getUserByName(inputName)
    if (!user) {
      return res.status(401).json({ message: "認証情報が無効です" })
    }

    const match = await bcrypt.compare(inputPassword, user.hashedPassword)

    if (!match) {
      return res.status(401).json({ message: "認証情報が無効です" })
    }

    const token = jwt.sign(
      { inputName },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h", }
    )

    res.cookie("token", token, { sameSite: "lax", secure: false, httpOnly: false, path: '/' })
    console.log('cookie created successfully');

    await nfetch(`http://localhost:8000/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })  // ここでtokenのみをJSONとして送信
    })
      .then(response => response.json())
      .then(updatedUser => {
        console.log("Updated user:", updatedUser);
      })
      .catch(error => {
        console.error("ユーザーのトークンの更新でエラーが発生しました。", error);
      });



    res.status(200).json({
      ...user,
      newToken: token,
    })
  } catch (error) {
    res.status(500).json({ message: "ログインの途中でサーバ側でエラーが発生しました" })
  }
})

// ログアウト
// server.post('/users/logout', (req, res) => {
//   res.clearCookie('token', { path: '/' });
//   res.status(200).json({ message: 'ログアウトしました' });
// });

// ログアウト
server.post("/users/logout", (req, res) => {
  // トークンを削除することでログアウトを行う
  res.clearCookie("token", { sameSite: "lax", secure: false, httpOnly: false, path: '/' });
  res.status(200).json({ message: "ログアウトに成功しました" });
});


// 全てのコメントの削除
server.delete('/clear-comments', (req, res) => {
  (router.db.get('comments') as any).remove().write();
  res.status(200).send('すべてのコメントを削除しました');
});

// 全てのユーザーの削除
server.delete('/clear-users', (req, res) => {
  (router.db.get('users') as any).remove().write();
  res.status(200).send('すべてのユーザーを削除しました');
});

// 全てのスレッドの削除
server.delete('/clear-threads', (req, res) => {
  (router.db.get('threads') as any).remove().write();
  res.status(200).send('すべてのスレッドを削除しました');
});

// 特定のスレッドのコメントの削除
server.delete('/threads/:threadId/comments', (req, res) => {
  const threadId = parseInt(req.params.threadId, 10);
  if (isNaN(threadId)) {
    return res.status(400).send('Invalid thread ID');
  }

  (router.db.get('comments') as any).remove({ threadId: threadId }).write();
  res.status(200).send(`スレッドID ${threadId} のスレッドの子マントを全て削除しました`);
});

server.use(middlewares)
server.use(router)
server.listen(8000, () => {
  console.log('JSON Server is running')
})
