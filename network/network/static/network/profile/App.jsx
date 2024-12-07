import { act } from "react";
import PostList from "../components/PostList";
import Profile, { ProfileNotFound } from "../components/Profile";
import { handleEditPostFactory, handleLikePostFactory, handleDeletePostFactory, fetchUserFactory } from "../util/index.js";

const Container = ReactBootstrap.Container;
const Spinner = ReactBootstrap.Spinner;

const DEFAULT_PROFILE = {
    user: null,
    posts: []
};

export default function App() {
    const [user, setUser] = React.useState(null);

    const username = window.location.href.split("/").at(-1);

    const [isLoading, setIsLoading] = React.useState(true);

    const [activePage, setActivePage] = React.useState(1);
    const [numPages, setNumPages] = React.useState(0);

    const [profile, setProfile] = React.useState(DEFAULT_PROFILE);

    const fetchUser = React.useCallback(fetchUserFactory(setUser), [setUser]);

    const fetchProfile = () => {
        fetch(`/api/users/${username}/page-${activePage}`)
        .then(async (response) => {
            const result = await response.json();
            if (response.status != 200) {
                throw new Error(result.error)
            }
            return result;
        })
        .then((data) => {
            setProfile({
                user: data.user,
                posts: data.posts,
            });
            setActivePage(Math.min(data.page, data.num_pages));
            setNumPages(data.num_pages);
            setIsLoading(false);
        })
        .catch((error) => {
            setProfile(DEFAULT_PROFILE);
            setActivePage(1);
            setNumPages(0);
            setIsLoading(false);
            console.error(error);
        })
    }

    const handleFollow = () => {
        if (user == null) {
            return;
        }

        fetch(`/api/users/${username}/${user.following.includes(username) ? "unfollow" : "follow"}`, {
            method: "POST"
        })
        .then(async (response) => {
            const result = await response.json();
            if (response.status != 200) {
                throw new Error(result.error)
            }
            return result;
        })
        .then(async () => Promise.all(fetchProfile(), fetchUser()))
        .catch((error) => {
            console.error(error);
        });
    }

    React.useEffect(fetchUser, []);

    React.useEffect(fetchProfile, [activePage]);

    if (isLoading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <Spinner animation="border" role="status" variant="primary" style={{ width: "4rem", height: "4rem" }}>
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    if (profile.user == null) {
        return (
            <Container 
                className="d-flex justify-content-center align-items-center" 
                style={{ height: "100vh" }}
            >
                <ProfileNotFound />
            </Container>
        );
    }

    return (
        <Container>
            <div className="d-flex justify-content-center mt-5">
                <Profile
                    user={user}
                    username={profile.user.username}
                    followers={profile.user.followers}
                    following={profile.user.following}
                    handleFollow={handleFollow}
                />
            </div>
            <PostList
                user={user}
                posts={profile.posts}
                activePage={activePage}
                setActivePage={setActivePage}
                numPages={numPages}
                handleEditPost={handleEditPostFactory(profile.posts, (posts) => setProfile({ ...profile, posts: posts }))}
                handleLikePost={handleLikePostFactory(user, profile.posts, (posts) => setProfile({ ...profile, posts: posts }))}
                handleDeletePost={handleDeletePostFactory(fetchProfile)}
            />
        </Container>
    )
}