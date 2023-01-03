import User from './user';
import Book from './book';
import Borrow from './borrow';
import Record from './record';

User.belongsToMany(Book, { through: Borrow });
User.hasMany(Borrow);
User.hasMany(Record);

Book.belongsToMany(User, { through: Borrow });
Book.hasMany(Borrow);
Book.hasMany(Record);

Borrow.belongsTo(User);
Borrow.belongsTo(Book);

Record.belongsTo(User);
Record.belongsTo(Book);

export { User, Book, Borrow, Record };
