
var formData = {
  username : '',
  usernameErrors : [],

  password1 : '',
  password2 : '',
  passwordErrors : [],


  displayName : '',
  displayNameErrors : [],

  bio : '',
  bioErrors : []
};

var modalData = {
  isModalShown: false,
  currentModal: null
};


function passwordsMatch(
  password1,
  password2
) {
  if (
    password1.length !== password2.length
  ) {
    return false;
  }

  for (
    let charIndex = 0;
    charIndex < password1.length;
    charIndex++
  ) {
    let p1Char = password1.charAt( charIndex );
    let p2Char = password2.charAt( charIndex );

    if (
      p1Char !== p2Char
    ) {
      return false;
    }
  } // loop through characters of passwords

  return true;
} // passwordsMatch

function attemptToCreateAccount() {
  // TODO: clean input

  if (
    !passwordsMatch(
      formData.password1,
      formData.password2
    )
  ) {
    // todo: error modal and password errors
    showFormErrorModal();

    return;
  }

  let creds = {
    username: formData.username,
    password: formData.password1,
    displayName: formData.displayName,
    bio: formData.bio
  };

  showLoadingModal();

  postStuffToServer(
    creds,
    '../../create/'
  ).then(
    ( response ) => {
      console.log( 'received response from server' );
      //console.log( response );

      //let parsedResponse = JSON.parse( response );
      if( response ){
        //alert( "You Have Created An Account!" );
        //window.location.replace("./details.html");
        let parsedResponse = JSON.parse( response );
        // todo check if valid
        localStorage.setItem(
          'accountData',
          response
        );

        showSuccessResultModal();
      }
      else {
        //alert( "username already exists!" );
        showFailResultModal();
      }

    } // response callback
  );
} // attemptToCreateAccount

function onCreateAccountButtonPressed(
  event
) {
  event.preventDefault();

  attemptToCreateAccount();

  // to prevent the form from doing the default form action
  // of navigating/refreshing the page
  return false;
} // onCreateAccountButtonPressed

function onDismissFormErrorModal() {

  hideFormErrorModal();

  return;
} // onDismissFormErrorModal

function onDismissFailResultModal() {

  hideFailResultModal();

  return;
} // onDismissFailResultModal

function showLoadingModal() {
  modalData.currentModal = MODALS.LOADING;
  modalData.isModalShown = true;

  return;
} // showLoadingModal
function hideLoadingModal() {
  modalData.isModalShown = false;

  return;
} // hideLoadingModal

function showFormErrorModal() {
  modalData.currentModal = MODALS.FORM_ERROR;
  modalData.isModalShown = true;

  return;
} // showFormErrorModal
function hideFormErrorModal() {
  modalData.isModalShown = false;

  return;
} // hideFormErrorModal

function showFailResultModal() {
  modalData.currentModal = MODALS.FAIL_RESULT;
  modalData.isModalShown = true;

  return;
} // showFailResultModal
function hideFailResultModal() {
  modalData.isModalShown = false;

  return;
} // hideFailResultModal

function showSuccessResultModal() {
  modalData.currentModal = MODALS.SUCCESS_RESULT;
  modalData.isModalShown = true;

  return;
} // showSuccessResultModal
function hideSuccessResultModal() {
  modalData.isModalShown = false;

  return;
} // hideSuccessResultModal


const MODALS = {
  LOADING: 'loading-modal',
  FORM_ERROR: 'form-error-modal',
  FAIL_RESULT: 'fail-result-modal',
  SUCCESS_RESULT: 'success-result-modal'
}
Vue.component(
  MODALS.LOADING,
  {
    template: `
      <modal>
        <h2 slot="header">
          Loading
        </h2>

        <p slot="body">
          Sending stuff to server
        </p>

        <p slot="footer">
          Please wait
        </p>
      </modal>
    `
  }
);
Vue.component(
  MODALS.FORM_ERROR,
  {
    template: `
      <modal>
        <h2 slot="header">
          Errors in Form
        </h2>

        <p slot="body">
          Please correct the fields with errors
        </p>

        <div slot="footer">
          <button onclick="onDismissFormErrorModal( event );">
            Return to form
          </button>
        </div>
      </modal>
    `
  }
);
Vue.component(
  MODALS.FAIL_RESULT,
  {
    template: `
      <modal>
        <h2 slot="header">
          Failed To Create Account
        </h2>

        <p slot="body">
          Username is invalid
        </p>

        <div slot="footer">
          <button onclick="onDismissFailResultModal( event );">
            Return to form
          </button>
        </div>
      </modal>
    `
  }
);
Vue.component(
  MODALS.SUCCESS_RESULT,
  {
    template: `
      <modal>
        <h2 slot="header">
          Successfully Created Account
        </h2>

        <p slot="body">
          Hello there
        </p>

        <div slot="footer">
          <a href="./details.html">
            Continue to account
          </a>
        </div>
      </modal>
    `
  }
);


var vueRoot = new Vue(
  {
    el: '#app-container',
    data: {
      formData: formData,

      modalData: modalData
    }
  }
);
