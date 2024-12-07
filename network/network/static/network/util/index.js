export function handleEditPostFactory(posts, setPosts) {

    return (postId, content) => {
        fetch(`/api/posts/${postId}`, {
            method: "POST",
            body: JSON.stringify({content: content})
        })
        .then(async (response) => {
            const result = await response.json();
            if (response.status != 200) {
                throw new Error(result.error)
            }
            return result;
        })
        .then((data) => {
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return data.post;
                }
                return post;
            }));
        })
        .catch((error) => {
            console.error(error);
        });
    }
}

export function handleLikePostFactory(user, posts, setPosts) {

    return (post) => {
        const postId = post.id;

        fetch(`/api/posts/${postId}/${post.likes.includes(user?.username) ? "unlike" : "like"}`, {
            method: "POST"
        })
        .then(async (response) => {
            const result = await response.json();
            if (response.status != 200) {
                throw new Error(result.error)
            }
            return result;
        })
        .then((data) => {
            setPosts(posts.map(post => {
                if (post.id === postId) {
                    return data.post;
                }
                return post;
            }));
        })
        .catch((error) => {
            console.error(error);
        });
    };
}

export function handleDeletePostFactory(fetchPosts) {
    
    return (postId) => {
        fetch(`/api/posts/${postId}`, {
            method: "DELETE"
        })
        .then(async (response) => {
            const result = await response.json();
            if (response.status != 200) {
                throw new Error(result.error)
            }
            return result;
        })
        .then(fetchPosts)
        .catch((error) => {
            console.error(error);
        });
    }
}

export function fetchUserFactory(setUser) {
    return () => {
        fetch("/api/user")
        .then(async (response) => {
            const result = await response.json();
            if (response.status != 200) {
                throw new Error(result.error)
            }
            return result;
        })
        .then((data) => {
            setUser(data.user);
        })
        .catch((error) => {
            setUser(null);
        });
    }
}