const Card = ReactBootstrap.Card;
const Button = ReactBootstrap.Button;
const Modal = ReactBootstrap.Modal;
const ListGroup = ReactBootstrap.ListGroup;
const Alert = ReactBootstrap.Alert;

export default function Profile({
  user,
  username,
  followers,
  following,
  handleFollow
}) {
  const isSelf = user?.username === username;
  const isFollowed = followers.includes(user?.username);

  const [showFollowers, setShowFollowers] = React.useState(false);
  const [showFollowing, setShowFollowing] = React.useState(false);

  // Modal toggle handlers
  const toggleFollowers = () => setShowFollowers(!showFollowers);
  const toggleFollowing = () => setShowFollowing(!showFollowing);

  return (
    <>
      {/* Profile Card */}
      <Card style={{ width: "18rem" }} className="text-center shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">@{username}</Card.Title>
          <Card.Text>
            <strong onClick={toggleFollowers} style={{ cursor: "pointer" }}>
              {followers.length} Followers
            </strong>
            <br />
            <strong onClick={toggleFollowing} style={{ cursor: "pointer" }}>
              {following.length} Following
            </strong>
          </Card.Text>

          {user && !isSelf && (
            <Button variant={isFollowed ? "outline-primary" : "primary"} onClick={handleFollow}>
                {isFollowed ? "Unfollow" : "Follow"}
            </Button>
          )}
        </Card.Body>
      </Card>

      {/* Followers Modal */}
      <Modal show={showFollowers} onHide={toggleFollowers} centered>
        <Modal.Header closeButton>
          <Modal.Title>Followers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {followers.map((follower, index) => (
              <ListGroup.Item key={index}>{follower}</ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>

      {/* Following Modal */}
      <Modal show={showFollowing} onHide={toggleFollowing} centered>
        <Modal.Header closeButton>
          <Modal.Title>Following</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {following.map((followedUser, index) => (
              <ListGroup.Item key={index}>{followedUser}</ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
      </Modal>
    </>
  );
}

export function ProfileNotFound() {
  return (
    <Card
      className="text-center shadow-sm"
      style={{ width: "24rem", padding: "1.5rem" }}
    >
      <Alert variant="warning" className="mb-3">
        Profile Not Found
      </Alert>
      <Card.Body>
        <Card.Title>Oops!</Card.Title>
        <Card.Text className="text-muted">
          We couldn't find the profile you're looking for. Please check the
          username and try again.
        </Card.Text>
      </Card.Body>
    </Card>
  );
}
