const Card = ReactBootstrap.Card;
const Button = ReactBootstrap.Button;
const Pagination = ReactBootstrap.Pagination;
const Col = ReactBootstrap.Col;
const Row = ReactBootstrap.Row;
const Form = ReactBootstrap.Form;
const Stack = ReactBootstrap.Stack;

export default function PostList({ user, posts, activePage, setActivePage, numPages, handleEditPost, handleLikePost, handleDeletePost}) {

    if (posts.length === 0) {
        return (
            <Card>
                <Card.Body>
                    <Card.Title>No posts found</Card.Title>
                </Card.Body>
            </Card>
        );
    }

    return (
        <div>
            <PostPagination
                activePage={activePage}
                setActivePage={setActivePage}
                numPages={numPages}
            />

            {posts.map((post) => <PostCard key={post.id} user={user} post={post} handleEditPost={handleEditPost} handleLikePost={handleLikePost} handleDeletePost={handleDeletePost} /> )}

            <PostPagination
                activePage={activePage}
                setActivePage={setActivePage}
                numPages={numPages}
            />
        </div>
    );
}

function PostCard({ user, post, handleEditPost, handleLikePost, handleDeletePost }) {
    const [isEditMode, setIsEditMode] = React.useState(false);
    const [editedContent, setEditedContent] = React.useState(post.content);

    const postLikeCount = post.likes.length;
    const isPostLiked = post.likes.includes(user?.username);

    const handleSave = () => {
        handleEditPost(post.id, editedContent);
        setIsEditMode(false);
    };

    const handleCancel = () => {
        setEditedContent(post.content);
        setIsEditMode(false);
    };

    return (
        <Card className="mb-3 shadow-sm">
            <Card.Body>
                <Card.Subtitle className="mb-2 text-muted">
                    Posted by:{" "}
                    <a
                        href={`/users/${post.user}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        {post.user}
                    </a>
                </Card.Subtitle>

                <Card.Title>{post.title}</Card.Title>

                {isEditMode ? (
                    <Form.Group controlId={`editPost${post.id}`}>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            className="mb-2"
                        />
                        <Button variant="success" className="me-2" onClick={handleSave}>
                            Save
                        </Button>
                        <Button variant="secondary" onClick={handleCancel}>
                            Cancel
                        </Button>
                    </Form.Group>
                ) : (
                    <Card.Text>{post.content}</Card.Text>
                )}

                <Card.Footer className="mt-2 text-muted">
                    Created: {post.created_at}
                    {post.updated_at !== post.created_at && (
                        <span> | Updated: {post.updated_at}</span>
                    )}
                </Card.Footer>

                <Row className="mt-2">
                    {user && <Col xs="auto">
                        <Button
                            variant={isPostLiked ? "outline-danger" : "primary"}
                            className="me-2"
                            onClick={() => handleLikePost(post)}
                        >
                            {isPostLiked ? "Unlike" : "👍 Like"}
                        </Button>
                    </Col>}
                    <Col xs="auto" className="align-self-center">
                        <span>
                            {postLikeCount} {postLikeCount === 1 ? "like" : "likes"}
                        </span>
                    </Col>
                    {post.user == user?.username && (
                        <Col xs="auto" className="ms-auto">
                            {!isEditMode && (
                                <Stack direction="horizontal" gap={2}>
                                    <Button variant="secondary" onClick={() => setIsEditMode(true)}>
                                        Edit
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDeletePost(post.id)}>
                                        Delete
                                    </Button>
                                </Stack>
                            )}
                        </Col>
                    )}
                </Row>
            </Card.Body>
        </Card>
    );
}

function PostPagination({ activePage, setActivePage, numPages }) {
    
    function buildPaginationItems() {
        const paginationItems = [];

        if (activePage - 2 > 1) {
            paginationItems.push(
                <Pagination.First key="first" onClick={() => setActivePage(1)} />
            );
        }
        
        if (activePage > 1) {
            paginationItems.push(
                <Pagination.Prev key="prev" onClick={() => setActivePage(activePage - 1)} />
            );
        }
        
        for (let i = Math.max(activePage - 2, 1); i <= Math.min(activePage + 2, numPages); i++) {
            paginationItems.push(
                <Pagination.Item key={i} onClick={() => setActivePage(i)} active={i === activePage}>
                    {i}
                </Pagination.Item>
            );
        }

        if (activePage < numPages) {
            paginationItems.push(
                <Pagination.Next key="next" onClick={() => setActivePage(activePage + 1)} />
            );
        }

        if (activePage + 2 < numPages) {
            paginationItems.push(
                <Pagination.Last key="last" onClick={() => setActivePage(numPages)} />
            );
        }

        return paginationItems;
    }


    return (
        <Pagination>
            {buildPaginationItems()}
        </Pagination>
    );
}