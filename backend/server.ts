const dotenv = require('dotenv')
dotenv.config()
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
const cookieParser = require('cookie-parser');
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()
import fetch from 'node-fetch';

server.use(cookieParser());
server.use(jsonServer.bodyParser)

const BASE_URL = "http://localhost:8000";

// 引数の name に一致するユーザを返す関数
const getUserByName = async (name) => {
  try {
    const fetchedUsers = await fetch(`${BASE_URL}/users`);
    const users = await fetchedUsers.json();
    return users.find((user) => name === user.name);
  } catch (error) {
    console.error("ユーザーの取得に失敗しました。", error);
  }
}

// ユーザがログインしているかチェック
server.use(async (req, res, next) => {
  if (req.cookies.token) {
    try {
      const userToken = await jwt.verify(req.cookies.token, process.env.ACCESS_TOKEN_SECRET);
      const user = await getUserByName(userToken.name);
      req.user = user;
    } catch (err) {
      res.clearCookie("token", { sameSite: "lax", secure: false, httpOnly: false, path: '/' });
      console.error("無効なトークンなので削除しました。", err)
    }
  } else {
    console.log("トークンがありません。")
  }
  next();
});

// コメント投稿
server.post('/threads/:threadId/comments', async (req, res, next) => {
  const threadId = req.params.threadId;
  if (isNaN(Number(threadId))) {
    return res.status(400).json({
      message: '無効なスレッドIDです'
    })
  }

  if (!req.body.commentContent) {
    return res.status(400).json({
      message: 'コメントが入力されていません'
    })
  }

  const response = await fetch('http://localhost:8000/comments');
  const comments = await response.json();
  const commentsForThread = comments.length > 0 ? comments.filter((comment) => comment.threadId == threadId).length : 0;
  if (commentsForThread >= 10) {
    return res.status(400).json({
      message: 'スレッドのコメントは10個までです'
    })
  }

  // スレッドのコメント数をカウントアップとコメントデータの作成
  try {
    const threadResponse = await fetch(`http://localhost:8000/threads/${threadId}`);
    if (!threadResponse.ok) {
      throw new Error('スレッドのデータを取得できませんでした');
    }
    const threadData = await threadResponse.json();

    threadData.commentTotal = threadData.commentTotal + 1;
    const newCommentTotal = threadData.commentTotal;

    const updateResponse = await fetch(`http://localhost:8000/threads/${threadId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(threadData)
    });

    if (!updateResponse.ok) {
      throw new Error('スレッドの総コメント数の更新に失敗しました');
    }
    req.body.commentNo = newCommentTotal
    if (!req.body.commenter) {
      req.body.commenter = '名無し'
    }
    if (!req.user) {
      req.body.userId = 0
    } else {
      req.body.userId = req.user.id
    }
    const now = new Date().toISOString()
    req.body.createdAt = now
  } catch (error) {
    return res.status(500).json({ message: `コメント投稿のサーバーサイドでの処理中にエラーが発生しました。${error}` });
  }
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
  req.body.commentTotal = 0

  next()
})

// ユーザ新規登録
server.post("/users/register", async (req, res) => {
  try {
    const { name, password } = req.body;

    // 入力されたユーザー名が既に使用されていれば新規登録させない
    const user = await getUserByName(name)
    if (user) {
      return res.status(400).json({ message: "既に使用されているユーザ名です。他のユーザ名を入力してください" })
    }

    if (!name || !password) {
      return res.status(400).json({ message: "ユーザー名かパスワードが未入力です" })
    }

    // jwt.sign の第一引数は トークンのペイロード（ユーザの認証情報）、第二引数は秘密鍵の情報、第三引数はオプション（今回はトークンの有効期限を10分に設定）
    const token = jwt.sign({ name }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "24h",
    })
    // bcrypt.hash の第二引数は salt rounds(ハッシュ化を行う回数)
    const hashedPassword = await bcrypt.hash(password, 10)

    const fetchedNewUser = await fetch(`${BASE_URL}/users`, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        name,
        hashedPassword,
        comments: [],
        token
      }),
    });

    const newUser = await fetchedNewUser.json();
    // ユーザーがログインしているかどうかの確認用のトークンを発行しクッキーを発行する
    res.cookie("token", token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), sameSite: "lax", httpOnly: false, secure: false, path: '/' })
    // user にトークンの値を持たせておき、
    res.status(200).json({
      ...newUser,
      newToken: token,
    })
  } catch (error) {
    return res.status(500).json({ message: `ユーザー新規登録のサーバーサイドでの処理中にエラーが発生しました。${error}` });
  }
});

// ログイン
server.post("/users/signin", async (req, res) => {
  try {
    const { name, password } = req.body

    const user = await getUserByName(name)
    if (!user) {
      return res.status(401).json({ message: "認証情報が無効です" })
    }

    const match = await bcrypt.compare(password, user.hashedPassword)

    if (!match) {
      return res.status(401).json({ message: "認証情報が無効です" })
    }

    const token = jwt.sign(
      { name },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h", }
    )

    res.cookie("token", token, { expires: new Date(Date.now() + 24 * 60 * 60 * 1000), sameSite: "lax", secure: false, httpOnly: false, path: '/' })

    await fetch(`http://localhost:8000/users/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token })  // ここでtokenのみをJSONとして送信
    })

    res.status(200).json({
      ...user,
      newToken: token,
    })
  } catch (error) {
    return res.status(500).json({ message: `ログインのサーバーサイドでの処理中にエラーが発生しました。${error}` });
  }
})

// ログアウト
server.post("/users/logout", (req, res) => {
  // トークンを削除することでログアウトを行う
  res.clearCookie("token", { sameSite: "lax", secure: false, httpOnly: false, path: '/' });
  res.status(200).json({ message: "トークンを削除しました。" });
});

const deleteAll = async (category: string) => {
  const fetchedAllData = await fetch(`http://localhost:8000/${category}`);
  const allData = await fetchedAllData.json();
  const allId = allData.map((data) => data.id);
  allId.forEach(async (id) => {
    await fetch(`http://localhost:8000/${category}/${id}`, {
      method: 'DELETE',
    });
  });
}
server.delete("/reset", async (req, res) => {
  res.clearCookie("token", { sameSite: "lax", secure: false, httpOnly: false, path: '/' });
  await deleteAll("comments");
  await deleteAll("users");
  await deleteAll("threads");

  res.status(200).json({ message: "リセットに成功しました" });
})

// 不要になったコード
// corsの設定、proxy に乗り換えた
// cors の設定フロントエンドからのリクエストを許可するために行なっていたが、proxy によって不要になった
// // ローカルマシンのフロントエンドからのリクエストのみ許可する
// const allowedOrigins = ["http://127.0.0.1:5173"];
// server.use(cors({
//   origin: function (origin, callback) {
//     // 同一オリジンからのアクセスは許可
//     if (!origin) return callback(null, true);
//     // リクエストしてきた origin が allowedOrigins にない場合はアクセス拒否 
//     if (allowedOrigins.indexOf(origin) === -1) {
//       const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     console.log("許可されたオリジンです。", origin);
//     // リクエストしてきた origin が allowedOrigins にある場合はアクセス許可 
//     return callback(null, true);
//   },
//   credentials: true
// }));

// コメントの削除
// server.delete('/comments/:commentId', async (req, res, next) => {

//   const commentId = req.params.commentId
//   // const user = req.user
//   // if (user) {
//   //   user.comments = user.comments.filter((comment) => {
//   //     return comment != commentId
//   //   })
//   //   await fetch(`http://localhost:8000/users/${user.id}`, {
//   //     method: 'PUT',
//   //     headers: {
//   //       'Content-Type': 'application/json',
//   //     },
//   //     body: JSON.stringify({ user })
//   //   })
//   // }

//   // console.log("called delete")
//   try {
//     const fetchedComment = await fetch(`http://localhost:8000/comments/${commentId}`)
//     const comment = await fetchedComment.json()
//     const userId = comment.userIdentification
//     console.log("userId before deleting comment in user", userId)
//     if (userId != 0 && userId != undefined) {
//       console.log("userId after", userId)
//       const response = await fetch(`http://localhost:8000/users/${userId}`)
//       const user = await response.json()
//       const updatedComments = user.comments.filter((comment) => {
//         return comment != commentId
//       })
//       console.log("updatedComments", updatedComments)
//       await fetch(`http://localhost:8000/users/${userId}`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ ...user, comments: updatedComments })
//       })
//     }
//   } catch (error) {
//     console.error("ユーザーデータからコメント削除する処理でエラーが発生しました。", error);
//   };
//   next()
// })

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
