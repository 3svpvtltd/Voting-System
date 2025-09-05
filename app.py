from flask import Flask, render_template, request, redirect, url_for, jsonify, session
import sqlite3

app = Flask(__name__)
app.secret_key = "supersecretkey"  # change for production

def get_db_connection():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

@app.route("/")
def index():
    conn = get_db_connection()
    projects = conn.execute("SELECT * FROM projects").fetchall()
    conn.close()
    return render_template("index.html", projects=projects)

@app.route("/upload", methods=["GET", "POST"])
def upload():
    if request.method == "POST":
        title = request.form["title"]
        description = request.form["description"]
        link = request.form["link"]
        author = request.form["author"]

        conn = get_db_connection()
        conn.execute(
            "INSERT INTO projects (title, description, link, author) VALUES (?, ?, ?, ?)",
            (title, description, link, author)
        )
        conn.commit()
        conn.close()

        return redirect(url_for("index"))

    return render_template("upload.html")

@app.route("/vote/<int:project_id>", methods=["POST"])
def vote(project_id):
    user_id = session.get("user_id", 1)  # demo user (replace with login later)
    conn = get_db_connection()

    # Prevent multiple votes by same user on same project
    existing_vote = conn.execute(
        "SELECT * FROM votes WHERE user_id=? AND project_id=?",
        (user_id, project_id)
    ).fetchone()

    if existing_vote:
        conn.close()
        return jsonify({"success": False, "message": "Already voted!"})

    conn.execute("INSERT INTO votes (user_id, project_id) VALUES (?, ?)", (user_id, project_id))
    conn.execute("UPDATE projects SET votes = votes + 1 WHERE id=?", (project_id,))
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/results")
def results():
    conn = get_db_connection()
    projects = conn.execute("SELECT * FROM projects ORDER BY votes DESC").fetchall()
    conn.close()
    return render_template("results.html", projects=projects)

if __name__ == "__main__":
    app.run(debug=True)
