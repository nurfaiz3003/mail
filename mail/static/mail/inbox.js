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
  document.querySelector('#view-email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    console.log(emails);
    emails.forEach(emails => show_email(emails, mailbox));
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

function show_email(email, mailbox) {
  const emaildiv = document.createElement('div');
  
  if (email.read === true) {
    emaildiv.className += 'container my-1 btn btn-secondary btn-block';
  } else {
    emaildiv.className += 'container my-1 btn btn-outline-primary btn-block';
  }
  
  const button = document.createElement('div');
  if (mailbox === 'inbox') {
    button.innerHTML = `
    <div class="col-md-2">
      <button value="${email.id}" onclick="archive(this.value)" type="button" class="btn btn-dark btn-sm">Archive</button>
    </div>`;
  } else if (mailbox === 'archive') {
    button.innerHTML = `
    <div class="col-md-2">
      <button value="${email.id}" onclick="unarchive(this.value)" type="button" class="btn btn-dark btn-sm">Unarchive</button>
    </div>`;
  } else {
    button.innerHTML = `
    <div class="col-md-2"></div>`;
  }

  emaildiv.innerHTML = `
  <div class="row">
    <div class="col-md-3">
      <b>${email.sender}</b>
    </div>
    <div class="col-md-4">
      ${email.subject}
    </div>
    <div class="col-md-3">
      ${email.timestamp}
    </div>
  </div>`;

  emaildiv.addEventListener('click', function() {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#view-email').style.display = 'block';

    fetch(`emails/${email.id}`)
    .then(response => response.json())
    .then(emails => {
      console.log(emails);
      document.querySelector('#view-email').innerHTML = `
        <div><b>From</b> : ${emails.sender}</div>
        <div><b>To</b> : ${emails.recipients}</div>
        <div><b>Subject</b> : ${emails.subject}</div>
        <div><b>Timestamp</b> : ${emails.timestamp}</div>
        <br>
        <div><p>${emails.body}</p></div>`;
    });

    fetch(`emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    });
  });

  const line = document.createElement('div');
  line.className = 'row';
  line.append(emaildiv);
  line.append(button);

  document.querySelector('#emails-view').append(line);
}

function archive(id) {
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  });
  setTimeout(function(){ load_mailbox('inbox'); }, 100);
}

function unarchive(id) {
  fetch(`emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  });
  setTimeout(function(){ load_mailbox('inbox'); }, 100);
}