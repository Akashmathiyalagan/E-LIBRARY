from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from pymongo import MongoClient
import bcrypt
import jwt
import datetime
import os
from werkzeug.utils import secure_filename
from bson import ObjectId

# Flask app setup
app = Flask(__name__)
CORS(app, supports_credentials=True)

# Secret key
app.config['SECRET_KEY'] = 'your-secret-key'

# MongoDB setup
client = MongoClient("mongodb://localhost:27017")
db = client["auth_db"]

users_collection = db["users"]
authors_collection = db["authors"]
books_collection = db["books"]

UPLOAD_FOLDER = 'uploads/books'
COVER_FOLDER = 'uploads/covers'
ASSETS_FOLDER = 'assets'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(COVER_FOLDER, exist_ok=True)
os.makedirs(ASSETS_FOLDER, exist_ok=True)

# ===== User Routes =====
@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"error": "Missing required fields"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 409

    hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    users_collection.insert_one({
        "username": username,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User registered successfully"}), 200

@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = users_collection.find_one({"email": email})

    if user and bcrypt.checkpw(password.encode("utf-8"), user["password"]):
        token = jwt.encode({
            "email": email,
            "role": "user",
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config["SECRET_KEY"], algorithm="HS256")

        return jsonify({"token": token}), 200

    return jsonify({"error": "Invalid email or password"}), 401

# ===== Author Routes =====
@app.route("/api/authors/register", methods=["POST"])
def register_author():
    data = request.json
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not all([name, email, password]):
        return jsonify({"error": "All fields are required."}), 400

    if authors_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered."}), 409

    hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

    authors_collection.insert_one({
        "name": name,
        "email": email,
        "password": hashed_pw,
        "created_at": datetime.datetime.utcnow()
    })

    return jsonify({"message": "Author registered successfully."}), 201

@app.route("/api/authors/login", methods=["POST"])
def login_author():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    author = authors_collection.find_one({"email": email})
    if not author:
        return jsonify({"message": "Invalid email or password."}), 401

    if not bcrypt.checkpw(password.encode("utf-8"), author["password"]):
        return jsonify({"message": "Invalid email or password."}), 401

    token = jwt.encode({
        "author_id": str(author["_id"]),
        "email": author["email"],
        "role": "author",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config["SECRET_KEY"], algorithm="HS256")

    return jsonify({"token": token}), 200

# ===== Upload Book Route =====
@app.route('/upload_book', methods=['POST'])
def upload_book():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({"error": "Missing token"}), 401

    try:
        decoded = jwt.decode(token.split(" ")[-1], app.config['SECRET_KEY'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

    title = request.form.get('title')
    description = request.form.get('description')
    author = request.form.get('author')
    price = request.form.get('price')
    file = request.files.get('file')
    cover = request.files.get('cover')

    if not all([title, description, author, price, file]):
        return jsonify({"error": "Missing required fields"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    cover_path = ""
    if cover:
        covername = secure_filename(cover.filename)
        cover_path = os.path.join(COVER_FOLDER, covername)
        cover.save(cover_path)

    books_collection.insert_one({
        "title": title,
        "description": description,
        "author": author,
        "price": price,
        "file_path": filepath,
        "cover_path": cover_path,
        "uploaded_at": datetime.datetime.utcnow(),
        "uploaded_by": decoded.get("email")
    })

    return jsonify({"message": "Book uploaded successfully"})

# ===== Get All Books =====
@app.route("/get_uploaded_books", methods=["GET"])
def get_uploaded_books():
    books = list(books_collection.find())
    for book in books:
        book["_id"] = str(book["_id"])  # Convert ObjectId to string
    return jsonify({"books": books}), 200

# ===== Get All Authors =====
@app.route("/get_authors", methods=["GET"])
def get_authors():
    authors = [author["name"] for author in authors_collection.find()]
    return jsonify({"authors": authors}), 200

# ===== Search Books =====
@app.route("/search_books", methods=["GET"])
def search_books():
    query = request.args.get("query", "").lower()
    books = list(books_collection.find())
    filtered_books = [
        book for book in books if query in book["title"].lower() or query in book["author"].lower()
    ]
    for book in filtered_books:
        book["_id"] = str(book["_id"])
    return jsonify({"books": filtered_books}), 200

# ===== Search Authors =====
@app.route("/search_authors", methods=["GET"])
def search_authors():
    query = request.args.get("query", "").lower()
    authors = [author["name"] for author in authors_collection.find()]
    filtered_authors = [author for author in authors if query in author.lower()]
    return jsonify({"authors": filtered_authors}), 200

# ===== Get Book Details =====
@app.route("/get_book_details/<book_id>", methods=["GET"])
def get_book_details(book_id):
    book = books_collection.find_one({"_id": book_id})
    if book:
        book["_id"] = str(book["_id"])  # Convert ObjectId to string
        return jsonify({"book": book}), 200
    else:
        return jsonify({"error": "Book not found"}), 404

# ===== Favorite Authors =====
@app.route("/favorite_authors", methods=["POST"])
def favorite_authors():
    data = request.get_json()
    user_id = data.get("user_id")
    favorite_authors = data.get("favorite_authors", [])
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"favorite_authors": favorite_authors}},
    )
    return jsonify({"message": "Favorites updated successfully"}), 200

# ===== Generate Book Summary (AI) =====
@app.route("/gemini-summary", methods=["POST"])
def gemini_summary():
    data = request.get_json()
    title = data.get("title")
    author = data.get("author")
    description = data.get("description", "No description provided.")
    
    # Replace this with actual AI summary generation logic
    summary = f"AI-generated summary for '{title}' by {author}: {description[:100]}..."
    
    return jsonify({"summary": summary}), 200

# ===== Serve Logo =====
@app.route("/get_logo", methods=["GET"])
def get_logo():
    logo_filename = "logo.png"
    logo_url = url_for("get_app_asset", filename=logo_filename, _external=True)
    return jsonify({"logo_url": logo_url})

@app.route('/assets/<path:filename>')
def get_app_asset(filename):
    return send_from_directory(ASSETS_FOLDER, filename)


# ===== Test Route =====
@app.route('/test-db')
def test_db():
    users = list(users_collection.find())
    authors = list(authors_collection.find())
    return jsonify({
        "user_count": len(users),
        "author_count": len(authors)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)