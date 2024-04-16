import mongoose from 'mongoose';
const postsModel = mongoose.Schema({
  caption: String,
  username: String,
  imageUrl: String,
});
const Posts = mongoose.model('posts', postsModel);
export default Posts;
