import CreatePostForm from "../components/CreatePostForm.jsx";
import PostList from "../components/PostList.jsx";
import { handleEditPostFactory, handleLikePostFactory, handleDeletePostFactory, fetchUserFactory } from "../util/index.js";

const Container = ReactBootstrap.Container;
const Stack = ReactBootstrap.Stack;

export default function App() {
    const [user, setUser] = React.useState(null);

    const [numPages, setNumPages] = React.useState(0);
    const [activePage, setActivePage] = React.useState(1);
    const [posts, setPosts] = React.useState([]);

    const fetchUser = React.useCallback(fetchUserFactory(setUser), [setUser]);
    
    const fetchPosts = () => {
        fetch(`/api/posts/all/page-${activePage}`)
        .then(async (response) => {
            const result = await response.json();
            if (response.status != 200) {
                throw new Error(result.error)
            }
            return result;
        })
        .then((data) => {
            setPosts(data.posts);
            setActivePage(Math.min(data.page, data.num_pages));
            setNumPages(data.num_pages);
        })
        .catch((error) => {
            console.error(error);
        });
    }

    React.useEffect(fetchUser, []);

    React.useEffect(fetchPosts, [activePage, user]);

    return (
        <Container>
            <Stack gap={3}>
                {user && <CreatePostForm refreshPosts={fetchPosts}/>}
                <PostList
                    user={user}
                    posts={posts}
                    activePage={activePage}
                    setActivePage={setActivePage}
                    numPages={numPages}
                    handleEditPost={handleEditPostFactory(posts, setPosts)}
                    handleLikePost={handleLikePostFactory(user, posts, setPosts)}
                    handleDeletePost={handleDeletePostFactory(fetchPosts)}
                />
            </Stack>
        </Container>
    );
}