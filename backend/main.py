from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase,Mapped,mapped_column,relationship
from sqlalchemy import Integer, String,Boolean,ForeignKey

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///todos.db'


class Base(DeclarativeBase):
  pass
db = SQLAlchemy(app, model_class=Base)
migrate = Migrate(app,db)
class TodoItem(db.Model):
    __tablename__ = 'todos_items'
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    done: Mapped[bool] = mapped_column(default=False)
    comments: Mapped[list["Comment"]]=relationship("Comment",back_populates="todo_item")
    def to_dict(self):
        return {
            "id":self.id,
            "title":self.title,
            "done":self.done,
            "comment":[comment.to_dict() for comment in self.comments]
        }
class Comment(db.Model):
    id:Mapped[int] = mapped_column(Integer,primary_key=True)
    message: Mapped[str] = mapped_column(String(250))
    todo_id: Mapped[int] = mapped_column(ForeignKey('todos_items.id'))
    todo_item: Mapped["TodoItem"] = relationship("TodoItem", back_populates="comments")
    def to_dict(self):
        return {
            "id":self.id,
            "message":self.message,
            "todo_id":self.todo_id
        }


INITIAL_TODOS=[
    TodoItem(title='Learn Flask'),
    TodoItem(title='Build a Flask App'),
]
with app.app_context():
    if TodoItem.query.count() == 0:
        for item in INITIAL_TODOS:
            db.session.add(item)
        db.session.commit()
todo_list = [
    { "id": 1,
      "title": 'Learn Flask',
      "done": True },
    { "id": 2,
      "title": 'Build a Flask App',
      "done": False },
]

@app.route('/api/todos/', methods=['GET'])
def get_todos():
    todos = TodoItem.query.all()
    return jsonify([todo.to_dict() for todo in todos])
def new_todo(data):
    if len(todo_list) == 0:
        id = 1
    else:
        id = 1 + max([todo['id'] for todo in todo_list])

    if 'title' not in data:
        return None
    
    return {
        "id": id,
        "title": data['title'],
        "done": getattr(data, 'done', False),
    }

@app.route('/api/todos/', methods=['POST'])
def add_todo():
    data = request.get_json()
    todo = new_todo(data)
    if todo:
        todo_list.append(todo)
        return jsonify(todo)
    else:
        # return http response code 400 for bad requests
        return (jsonify({'error': 'Invalid todo data'}), 400)  
@app.route('/api/todos/<int:id>/toggle/', methods=['PATCH'])
def toggle_todo(id):
    todo = TodoItem.query.get_or_404(id)
    todo.done = not todo.done
    db.session.commit()
    return jsonify(todo.to_dict())
@app.route('/api/todos/<int:id>/', methods=['DELETE'])
def delete_todo(id):
    todo = TodoItem.query.get_or_404(id)
    db.session.delete(todo)
    db.session.commit()
    return jsonify({'message': 'Todo deleted successfully'})
@app.route('/api/todos/<int:todo_id>/comments/', methods=['POST'])
def add_comment(todo_id):
    todo_item = TodoItem.query.get_or_404(todo_id)

    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Comment message is required'}), 400

    comment = Comment(
        message=data['message'],
        todo_id=todo_item.id
    )
    db.session.add(comment)
    db.session.commit()
 
    return jsonify(comment.to_dict())