
var formData = {
  username : '',
  usernameErrors : [],

  password : '',
  passwordErrors : []
};

var modalData = {
  isModalShown: false,
  currentModal: null
};



function attemptToLogin() {
  // remove old username and password errors
  emptyErrorsArray(
    formData.usernameErrors
  );
  emptyErrorsArray(
    formData.passwordErrors
  );

  // convert to combined promises?
  // probably not necessary to do
  // username and password processing
  // asynchronously since the process
  // does not take long
  let processedUsername = removeUnacceptableCharacters(
    formData.username.trim()
  );
  let processedPassword = removeUnacceptableCharacters(
    formData.password.trim()
  );
  // should form data be updated with
  // the cleaned values?

  console.log(
    'debug: \n'
    + 'formData.username: ' + formData.username + '\n'
    + 'formData.password: ' + formData.password + '\n'
    + 'processedUsername: ' + processedUsername + '\n'
    + 'processedPassword: ' + processedPassword + '\n'
  )

  let credentials = {
    username: processedUsername,
    password: processedPassword
  };

  // todo validation
  let credentialsValidationResults =  validateCredentials( credentials );

  if (
    credentialsValidationResults.validity === CREDENTIALS_VALIDATION_RESULT_TYPES.INVALID
  ) {
    if (
      credentialsValidationResults.usernameErrors.length
    ) {
      credentialsValidationResults.usernameErrors
      .forEach(
        ( error ) => {
          formData.usernameErrors.push( error );
        }
      );
    }

    if (
      credentialsValidationResults.passwordErrors.length
    ) {
      credentialsValidationResults.passwordErrors
      .forEach(
        ( error ) => {
          formData.passwordErrors.push( error );
        }
      );
    }

    showFormErrorModal();

    return;
  }

  showLoadingModal();

  postStuffToServer(
    credentials,
    '/login/'
  )
  .then(
    function( response ) {
      hideLoadingModal();
      //
      if ( response ){
        let parsedResponse = JSON.parse(
          response
        );
        // todo check if valid
        localStorage.setItem(
          'accountData',
          response
        );
        window.location.replace("./details.html");
      }else{
        alert("Invalid Username or Password");
      }

      //console.log( 'server response: ' + response );
    }
  )
  .catch(
    function(
      reason
    ) {
      console.error( reason );
    } // reject callback
  );

  return;
} // attemptToLogin



function onLoginButtonPressed(
  event
) {
  event.preventDefault();

  attemptToLogin();

  return false;
} // onLoginButtonPressed

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
          Sending credentials to server
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
          Login Failed
        </h2>

        <p slot="body">
          todo: show errors
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
          Login Successful
        </h2>

        <p slot="body">
          Welcome back
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
