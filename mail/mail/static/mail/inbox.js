document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Handle onsubmit event for compose form
  document.querySelector("#compose-form").onsubmit = send_mail;
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#content-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  document.querySelectorAll("#error-div").forEach(element => element.remove());
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    const emails_view = document.querySelector("#emails-view");
    emails.forEach(email => emails_view.append(
      create_email_preview_card(email, mailbox == "sent")
    ));
  });
}

function view_mail(email_id, belongs_to_sent_view) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'block';

  document.querySelector("#content-view").innerHTML = "<h3>View email</h3>";

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => document.querySelector("#content-view")
      .append(create_email_card(email, belongs_to_sent_view))
    );

  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
  
}

function send_mail() {

  // Retrieve form fields
  const compose_recipients = document.querySelector("#compose-recipients").value;
  const compose_subject = document.querySelector("#compose-subject").value;
  const compose_body = document.querySelector("#compose-body").value;

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: compose_recipients,
      subject: compose_subject,
      body: compose_body,
    }),
  })
  .then(async response => {
    const result = await response.json();
    if (response.status != 201) {
      throw new Error(result.error);
    }
    return result;
  })
  .then(result => {
    document.querySelectorAll("#error-div").forEach(element => element.remove());
    load_mailbox("sent");
  })
  .catch(error => {
    document.querySelectorAll("#error-div").forEach(element => element.remove());
    document.querySelector("#compose-view").append(create_error_div(error.message));
  });
  
  // stop form from submitting
  return false;
}

function archive_mail(email, to_archive) {
  fetch(`/emails/${email?.id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: to_archive
    })
  }).then(response => load_mailbox("inbox"));
}

function reply_mail(email) {
  compose_email();

  document.querySelector("#compose-recipients").value = email?.sender;
  
  const subject_element = document.querySelector("#compose-subject");
  if (!subject_element.value.startsWith("Re: ")) {
    subject_element.value = `Re: ${email?.subject}`;
  }

  document.querySelector("#compose-body").value = `On ${email?.timestamp} ${email?.sender} wrote:\n${email?.body}`;
}

function create_email_preview_card(email, belongs_to_sent_view) {
  const email_preview_card = document.createElement("div");
  email_preview_card.className = "card email-preview-card";
  email_preview_card.dataset.read = email?.read;

  const card_body = document.createElement("div");
  card_body.className = "card-body";
  card_body.innerHTML = `
    <h5 class="card-title">${email?.sender}</h5>
    <p class="card-text">${email?.subject}</p>
    <h6 class="card-subtitle text-muted">${email?.timestamp}</h6>
  `;

  const link_element = document.createElement("a");
  link_element.className = "stretched-link";
  link_element.onclick = () => view_mail(email?.id, belongs_to_sent_view);
  card_body.append(link_element);
  // spread link over to card_body only
  card_body.style= "transform: rotate(0);";

  email_preview_card.append(card_body);

  if (!belongs_to_sent_view) {
    const card_footer = document.createElement("div");
    card_footer.className = "card-footer";

    const archive_button = document.createElement("button");
    archive_button.className = "btn btn-primary btn-sm";
    archive_button.innerText = email?.archived ? "Unarchive" : "Archive";
    archive_button.onclick = () => archive_mail(email, !email.archived);
    card_footer.append(archive_button);

    email_preview_card.append(card_footer);
  }
  
  return email_preview_card;
}

function create_email_card(email, belongs_to_sent_view) {
  const email_card = document.createElement("div");
  email_card.className = "card email-card";

  const card_header = document.createElement("div");
  card_header.className = "card-header";
  card_header.innerHTML = `<h4 class="my-0">${email?.subject}</h4>`;
  email_card.append(card_header);

  const card_body = document.createElement("div");
  card_body.className = "card-body";
  card_body.innerHTML = `
    <h5 class="card-title">${email?.sender}</h5>
    <h6 class="card-subtitle text-muted">${email?.timestamp}</h6>
    <div class="card-text mt-2">To: ${email?.recipients}</div>
    <hr/>
    <p>${email?.body}</p>
  `;
  email_card.append(card_body);

  const card_footer = document.createElement("div");
  card_footer.className = "card-footer";

  if (!belongs_to_sent_view) {
    const archive_button = document.createElement("button");
    archive_button.className = "btn btn-primary btn-sm mr-2";
    archive_button.innerText = email?.archived ? "Unarchive" : "Archive";
    archive_button.onclick = () => archive_mail(email, !email.archived);
    card_footer.append(archive_button);
  }
  const reply_button = document.createElement("button");
  reply_button.className = "btn btn-primary btn-sm";
  reply_button.innerText = "Reply";
  reply_button.onclick = () => reply_mail(email);
  card_footer.append(reply_button);

  email_card.append(card_footer);
  
  return email_card;
}

function create_error_div(error_message) {
  const error_div = document.createElement("div");
  error_div.id = "error-div";
  error_div.innerHTML = `
    <div class="alert alert-danger" id="error-alert">
      Error: ${error_message}
    </div>
  `;
  return error_div;
}