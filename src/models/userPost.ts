export interface UserPost{
  postID: string;
  post: {
    username: string;
    audioFileURL: string;
    timestamp: number;
    likes: {
      uid: string;
    }
    firstname: string;
    lastname: string;
  }
}
