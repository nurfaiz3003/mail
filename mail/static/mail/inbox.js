document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    emails.forEach(emails => show_email(emails));
  });
}

function send_email() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  });

  localStorage.clear();
  load_mailbox('sent');
  return false;
}

function show_email(email) {
  const emaildiv = document.createElement('div');
  emaildiv.addEventListener('click', viewemail(email.id));
  
  if (email.read === true) {
    emaildiv.className += 'container my-1 py-2 rounded border border-secondary bg-secondary text-white';
  } else {
    emaildiv.className += 'container my-1 py-2 rounded border border-primary';
  }
  
  emaildiv.innerHTML = `
    <div class="row">
      <div class="col-md-3">
        <b>${email.sender}</b>
      </div>
      <div class="col-md-6">
        ${email.subject}
      </div>
      <div class="col-md-3">
        ${email.timestamp}
      </div>
    </div>`;
  document.querySelector('#emails-view').append(emaildiv);
}

function viewemail(id) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#viewemail').style.display = 'block';
}