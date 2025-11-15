import db from "../configs/db.js"

export default {
    async connect() {
        try {
            return await db.connect()
        } catch (e) {
            console.log("-- DATABASE FATAL --")
            console.log(`Code: ${e.code}`)
            return;
        }
        
    },
    async begin(client) {
        await client.query('BEGIN')
    },
    async rollback(client) {
        await client.query('ROLLBACK')
    },
    async commit(client) {
        await client.query('COMMIT')
    },
    async setSavepoint(client, savepoint) {
        await client.query(`SAVEPOINT ${savepoint}`)
    },
    async rollbackToSavepoint(client, savepoint) {
        await client.query(`ROLLBACK TO ${savepoint}`)
    },

    // User table
    async getUserByUsername(username, client, lockRow) {
        try {
            const query = lockRow ? "SELECT * FROM users WHERE username = $1 FOR UPDATE" : "SELECT * FROM users WHERE username = $1"
            const r = await client.query(query, [username])
            return {'status': true, 'rowCount': r.rowCount, 'rows': r.rows}
        } catch {
            return {'status': false}
        }
    },
    async createUser(username, enc_password, client) {
        try {
            const r = await client.query("INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *", [username, enc_password])
            r.rows[0].id = parseInt(r.rows[0].id)
            return {'status': true, "created": r.rows[0]}
        } catch {
            return {'status': false}
        }
    },

    // Refresh token
    async saveRefreshToken(token, userid, expiration, client) {
        try {
            await client.query("INSERT INTO refresh_tokens VALUES ($1, $2, to_timestamp($3))", [token, userid, expiration])
            return {'status': true}
        } catch {
            return {'status': false}
        }
    },

    async searchRefreshToken(token, userid, client) {
        try {
            const r = await client.query("SELECT * FROM refresh_tokens WHERE token = $1 AND userid = $2", [token, userid])
            return {'status': true, 'rowCount': r.rowCount}
        } catch {
            return {'status': false}
        }
    },

    // Quiz
    async getAllQuizzes(client) {
        try {
            const r = await client.query("SELECT q.id :: integer, q.title, q.userid :: integer, u.username, COUNT(uh) :: integer as views FROM quizzes as q JOIN users as u ON q.userid = u.id LEFT JOIN user_quiz_histories as uh ON uh.quizid = q.id GROUP BY q.id, u.username")
            return {"status":true, 'rowCount': r.rowCount, 'rows': r.rows}
        } catch {
            return {'status': false}
        }
    },
    async getQuizInfo(id, client) {
        try {
            const r = await client.query("SELECT q.*, q.id :: integer, q.userid :: integer, u.username FROM quizzes as q JOIN users as u ON q.userid = u.id WHERE q.id = $1", [id])
            return {"status":true, 'rowCount': r.rowCount, 'rows': r.rows}
        } catch {
            return {'status': false}
        }
    },

    async createQuiz(title, userid, questions, client) {
        try {
            const r = await client.query("INSERT INTO quizzes (title, userid, questions) VALUES ($1, $2, $3) RETURNING *", [title, userid, questions])
            return {"status":true, 'rowCount': r.rowCount, 'rows': r.rows}
        } catch {
            return {'status': false}
        }
    },

    // User history
    async saveUserHistory(userid, quizid, client) {
        try {
            const r = await client.query("INSERT INTO user_quiz_histories (userid, quizid) VALUES ($1, $2) ON CONFLICT (userid, quizid) DO UPDATE SET last_activity_at = NOW()", [userid, quizid])
            return {"status":true, 'rowCount': r.rowCount, 'rows': r.rows}
        } catch {
            return {'status': false}
        }
    },
    async getUserInfo(userid, client) {
        try {
            const query = `SELECT u.id, u.username, u.created_at, 
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', q.id, 'title', q.title, 'views', (SELECT COUNT(*) FROM user_quiz_histories qh WHERE qh.quizid = q.id))) FILTER (WHERE q.id IS NOT NULL), '[]') AS user_quizzes,
        COALESCE(json_agg(DISTINCT jsonb_build_object('id', qa.id, 'title', qa.title, 'views', (SELECT COUNT(*) FROM user_quiz_histories qhh WHERE qhh.quizid = qa.id), 'userid', qa.userid, 'username', (SELECT username FROM users us WHERE id = qa.userid), 'last_activity', uqh.last_activity_at)) FILTER (WHERE qa.id IS NOT NULL), '[]') AS quiz_history
        FROM users u 
        LEFT JOIN quizzes q 
        ON u.id = q.userid 
        LEFT JOIN user_quiz_histories uqh 
        ON u.id = uqh.userid
        LEFT JOIN quizzes qa
        ON qa.id = uqh.quizid
        AND uqh.userid = u.id
        WHERE u.id = $1
        GROUP BY u.id, u.username, u.created_at`
            const r = await client.query(query, [userid])
            return {"status":true, 'rowCount': r.rowCount, 'rows': r.rows}
        } catch {
            return {'status':false}
        }
    }
}