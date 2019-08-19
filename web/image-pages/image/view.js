
var pageData = {
  accountData : {
    uid: 0,
    username: '',
    displayName: ''
  },
  viewedImageData : {
    imageId: 0,
    uploaderUsername: '',
    imageDescription: '',
    upvotes: 0,
    downvotes: 0,
    comments: []
  }
};

let storedAccountData = localStorage.getItem( 'accountData' );
if (
  storedAccountData
) {
  parsedAccountData = JSON.parse( storedAccountData );
  // todo check if valid
  pageData.account = parsedAccountData;
}

/*
var account = {
  uid: 0,
  username: '',
  displayName: ''
};

var viewedImageData = {
  imageId: 0,
  uploaderUsername: '',
  imageDescription: '',
  upvotes: 0,
  downvotes: 0,
  comments: []
};
/*
var comment = {
  uid: 0,
  displayName: '',
  message: ''
}
//*/


function upvoteImage() {
  let payload = {
    vote: 1
  };

  postStuffToServer(
    payload,
    '/vote/'
  )
  .then(
    ( response ) => {
      console.log( 'received response from server' );
      console.log( response );
    } // response callback
  );
  //imageid and vote
}
function downvoteImage() {
  let payload = {
    vote: 1
  };

  postStuffToServer(
    payload,
    '/vote/'
  )
  .then(
    ( response ) => {
      console.log( 'received response from server' );
      console.log( response );
    } // response callback
  );
}

function favoriteImage() {}

function deleteComment() {}


var vueRoot = new Vue(
  {
    el: '#app-container',
    data: {
      pageData
    }
  }
);


makeGetRequest('/image-pages/').then(
  ( response ) => {
    viewedImageData = JSON.parse(response);
    console.log(viewedImageData);

    pageData.viewedImageData = viewedImageData;
  }
);
