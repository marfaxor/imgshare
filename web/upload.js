// todo add thumbnail preview of image
// on image details modal

// might want to re-init on each upload attempt
// so that the values from any previous upload
// attempts are not left filled in
var imageDetailsFormData = {
  isShown : false,

  imageTitle : '',
  imageTitleErrors : [],

  imageDescription : '',
  imageDescriptionErrors : [],

  imageTag1 : '',
  imageTag1Errors : [],

  imageTag2 : '',
  imageTag2Errors : [],

  imageTag3 : '',
  imageTag3Errors : []
};

var modalData = {
  isModalShown: false,
  currentModal: null
};

var imageUploadInfo;


var accountData = {
  accountId : 0,
  displayName: ''
};


let storedAccountData = localStorage.getItem( 'accountData' );
if (
  storedAccountData
) {
  parsedAccountData = JSON.parse( storedAccountData );
  // todo check if valid
  accountData = parsedAccountData;
}


function initializeImageDetails() {
  imageDetailsFormData.imageTitle = '';
  imageDetailsFormData.imageDescription = '';
  imageDetailsFormData.imageTag1 = '';
  imageDetailsFormData.imageTag2 = '';
  imageDetailsFormData.imageTag3 = '';

  emptyErrorsArray(
    imageDetailsFormData.imageTitleErrors
  );
  emptyErrorsArray(
    imageDetailsFormData.imageDescriptionErrors
  );
  emptyErrorsArray(
    imageDetailsFormData.imageTag1Errors
  );
  emptyErrorsArray(
    imageDetailsFormData.imageTag2Errors
  );
  emptyErrorsArray(
    imageDetailsFormData.imageTag3Errors
  );

  return;
} // initializeImageDetails


// todo: prefix title, description, etc
// with imageDetails.
// todo: return validation result
// with errors arrays
function validateImageDetails(
  imageDetails
) {
  let validationResults = {
    validity: true, // todo validation result type enum thing?
    imageTitleErrors : [],
    imageDescriptionErrors : []
  }

  // todo: more on constraints

  // todo: constants in a js file at root
  var MIN_IMAGE_TITLE_LENGTH = 8;
  var MAX_IMAGE_TITLE_LENGTH = 127;



  if (
    imageDetails.imageTitle.length <= MIN_IMAGE_TITLE_LENGTH
  ) {
    validationResults.validity = false;

    validationResults.imageTitleErrors.push(
      'title is too short: must be at least '
      + MIN_IMAGE_TITLE_LENGTH
      + ' characters'
    );
  }
  else if (
    imageDetails.imageTitle.length >= MAX_IMAGE_TITLE_LENGTH
  ) {
    validationResults.validity = false;

    validationResults.imageTitleErrors.push(
      'title is too long: must be no more than '
      + MAX_IMAGE_TITLE_LENGTH
      + ' characters'
    );
  }


  // todo: constants in a js file at root
  var MIN_IMAGE_DESCRIPTION_LENGTH = 8;
  var MAX_IMAGE_DESCRIPTION_LENGTH = 127;

  if (
    imageDetails.imageDescription.length <= MIN_IMAGE_DESCRIPTION_LENGTH
  ) {
    validationResults.validity = false;

    validationResults.imageDescriptionErrors.push(
      'description is too short: must be at least '
      + MIN_IMAGE_DESCRIPTION_LENGTH
      + ' characters'
    );
  }
  else if (
    imageDetails.imageDescription.length >= MAX_IMAGE_DESCRIPTION_LENGTH
  ) {
    validationResults.validity = false;

    validationResults.imageDescriptionErrors.push(
      'description is too long: must be no more than '
      + MAX_IMAGE_DESCRIPTION_LENGTH
      + ' characters'
    );
  }

  return validationResults;
} // validateImageTag

function isValidImageTag(
  imageTag
) {
  if (
    imageTag === ''
  ) {
    // tags are optional
    // a tag being an empty string is invalid
    // and will not be sent to server
    // (!! todo: confirm with matt !!)
    // but is not an error on the form
    // that needs to be corrected
    return false;
  }

  //
  // todo: constraints

  return true;
} // isValidImageTag

function onConfirmImageDetailsButtonPressed(
  event
) {
  event.preventDefault();

  // clean first?

  let imageDetails = {
    imageTitle: imageDetailsFormData.imageTitle,
    imageDescription: imageDetailsFormData.imageDescription
  };

  // todo: extract values from form data,
  // clean them, and then update form data
  // with cleaned values

  // imageDetailsFormData.

  let imageDetailsValidationResults = validateImageDetails(
    imageDetails
  );


  if (
    !imageDetailsValidationResults.validity
  ) {
    // early exit
    // todo: show form error modal
    showFormErrorModal();

    return;
  }


  if (
    isValidImageTag(
      imageDetailsFormData.imageTag1
    )
  ) {
    imageDetails.tag1 = imageDetailsFormData.imageTag1;
  }

  if (
    isValidImageTag(
      imageDetailsFormData.imageTag2
    )
  ) {
    imageDetails.tag2 = imageDetailsFormData.imageTag2;
  }

  if (
    isValidImageTag(
      imageDetailsFormData.imageTag3
    )
  ) {
    imageDetails.tag3 = imageDetailsFormData.imageTag3;
  }

  // check for duplicate tags?

  // move tags up if previous removed/missing?


  // todo: move into its own function
  let payload = {
    imageDetails: imageDetails,
    info: imageUploadInfo
  };

  showLoadingModal();

  postStuffToServer(
    payload,
    '/upload-image/'
  )
  .then(
    ( response ) => {
      console.log( 'received response from server' );
      console.log( response );

      hideLoadingModal();

      //let parsedResponse = JSON.parse( response );

      //alert( "Your upload was successful! Here is it's url: " + parsedResponse.secure_url );
      showSuccessResultModal();
    } // response callback
  );

  return false;
} // onConfirmImageDetailsButtonPressed

function onCancelImageDetailsButtonPressed(
  event
) {
  event.preventDefault();

  hideImageDetails();

  // todo: have server delete uploaded image?

  imageUploadInfo = null;

  return; //? or use throw error?
} // onCancelImageDetailsButtonPressed


function showImageDetails() {
  console.log( 'enter showImageDetails' );

  modalData.isModalShown = false;

  imageDetailsFormData.isShown = true;

  console.log( 'exit showImageDetails' );
} // showImageDetails
function hideImageDetails() {
  console.log( 'enter hideImageDetails' );

  imageDetailsFormData.isShown = false;

  console.log( 'exit hideImageDetails' );
} // hideImageDetails



function showLoadingModal() {
  modalData.currentModal = MODALS.LOADING;
  modalData.isModalShown = true;

  return;
} // showLoadingModal
function hideLoadingModal() {
  modalData.isModalShown = false;

  return;
} // hideLoadingModal


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
          Upload Successful
        </h2>

        <p slot="body">
          You can view your uploads on your account page
        </p>

        <div slot="footer">
          <a href="/account-pages/account/details.html">
            Continue to account
          </a>
        </div>
      </modal>
    `
  }
);




function onUploadWidgetEvent(
  error, // optional
  result
) {
  if ( error ) {
    console.error(
      'error from cloudinary widget:'
    );
    console.error(
      error
    );

    uploadWidget.close();

    return;
  }

  if ( result && result.event ) {
    // handle result event based on event type
    switch ( result.event ) {
      case 'upload-added': {
        onImageAdded( result );
      } // upload-added
      break;

      case 'success': {
        onUploadSuccess( result );
      } // success
      break;

      default: {
        console.log( 'unhandled event type' );
        console.log( result );
      } // default
    } // switch result event
  } // result

  return;
} // onUploadWidgetEvent

function onImageAdded( result ) {
  console.log( 'upload added' );
  console.log( result.info );

  //uploadWidget.hide();

  return;
} // onImageAdded

function onUploadSuccess( result ) {
  console.log( 'successfully uploaded image' );
  console.log( result.info );

  uploadWidget.hide();

  imageUploadInfo = result.info;

  // todo thumbnail url for image details

  initializeImageDetails();
  showImageDetails();

  return;
} // onUploadSuccess


var vueRoot = new Vue(
  {
    el: '#app-container',
    data: {
      imageDetailsFormData: imageDetailsFormData,
      modalData: modalData,
      accountData: accountData
    }
  }
);


var uploadWidget = cloudinary.applyUploadWidget(
  '#upload_widget_opener',
  {
    cloudName: 'hws6kskjw',
    uploadPreset: 'rywvoxo2',
    cropping: true,
    folder: 'user_images'
  },
  onUploadWidgetEvent
);
