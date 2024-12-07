const Form = ReactBootstrap.Form;
const Button = ReactBootstrap.Button;
const Alert = ReactBootstrap.Alert;

export default function CreatePostForm({ refreshPosts }) {
    const [form, setForm] = React.useState({
        title: "",
        content: "",
    });

    const [hasError, setHasError] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        fetch("/api/posts/create", {
            method: "POST",
            body: JSON.stringify(form)
        })
        .then(async (response) => {
            const result = await response.json();
            if (response.status != 201) {
                throw new Error(result.error)
            }
            return result;
        })
        .then((data) => {
            refreshPosts();
            setForm({
                title: "",
                content: "",
            });
            setHasError(false);
        })
        .catch((error) => {
            console.error(error);
            setHasError(true);
            setErrorMessage(JSON.stringify(error));
        });
    };

    return (
        <Form
            className="border p-3" 
            onSubmit={handleSubmit}
        >
            <h3 className="mb-3">New Post</h3>
            <Form.Group className="mb-3" controlId="title">
                <Form.Label>Title</Form.Label>
                <Form.Control
                    name="title"
                    placeholder="Title"
                    required
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                />
            </Form.Group>

            <Form.Group className="mb-3" controlId="title">
                <Form.Label>Content</Form.Label>
                <Form.Control
                    name="content"
                    placeholder="What do you want to share?"
                    as="textarea"
                    rows={3}
                    required
                    value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})}
                />
            </Form.Group>

            <Button variant="primary" type="submit" className="mb-3">
                Submit
            </Button>

            {
                hasError &&
                <Alert variant="danger" className="mb-3">
                    An error occurred. Please try again.
                    <p>Log: {errorMessage}</p>
                </Alert>
            }
        </Form>
    );
}